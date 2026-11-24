import type { TicketAttachmentMimeType } from '@/src/firebase';

const SAFE_ATTACHMENT_DATA_URL_REGEX =
  /^data:(application\/pdf|image\/jpeg|image\/png|image\/webp);base64,[A-Za-z0-9+/=]+$/;

const MAX_ATTACHMENT_DATA_URL_LENGTH = 800000;

/**
 * Validates that a URL uses an allowlisted http(s) scheme or safe app-relative path.
 * Explicitly blocks javascript:, vbscript:, data:, file:, and protocol-relative // URLs.
 */
export function isSafeHttpOrRelativeUrl(raw: string | null | undefined): boolean {
  if (!raw || typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 1000) return false;

  // Reject control characters or whitespace-obfuscated schemes
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return false;

  // Allow safe relative paths (/assets/..., assets/...) but block protocol-relative //
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  if (trimmed.startsWith('assets/')) {
    return !trimmed.includes('..');
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSafeHttpsUrl(raw: string | null | undefined): boolean {
  if (!raw || typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 500 || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeSafeUrl(
  raw: string | null | undefined,
  fallback = ''
): string {
  return isSafeHttpOrRelativeUrl(raw) ? raw!.trim() : fallback;
}

/**
 * Strictly validates base64 attachment data URLs against the allowlisted MIME types
 * (PDF, JPEG, PNG, WebP) and length bounds matching Firestore security rules.
 */
export function isSafeAttachmentDataUrl(
  dataUrl: string | null | undefined,
  expectedMime?: TicketAttachmentMimeType
): boolean {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  if (dataUrl.length < 20 || dataUrl.length > MAX_ATTACHMENT_DATA_URL_LENGTH) {
    return false;
  }
  if (!SAFE_ATTACHMENT_DATA_URL_REGEX.test(dataUrl)) {
    return false;
  }
  if (expectedMime) {
    return dataUrl.startsWith(`data:${expectedMime};base64,`);
  }
  return true;
}

/**
 * Converts a strictly validated base64 data URL into an isolated Blob URL
 * so PDF/image previews and downloads do not execute inline active content.
 */
export function dataUrlToSafeBlobUrl(
  dataUrl: string | null | undefined,
  expectedMime?: TicketAttachmentMimeType
): string | null {
  if (!isSafeAttachmentDataUrl(dataUrl, expectedMime)) return null;
  const safeUrl = dataUrl!;
  const commaIdx = safeUrl.indexOf(',');
  if (commaIdx < 0) return null;

  const header = safeUrl.slice(5, commaIdx); // e.g. "application/pdf;base64"
  const mime = header.split(';')[0];
  const base64 = safeUrl.slice(commaIdx + 1);

  try {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/**
 * Strips path traversal segments, control characters, and illegal filename chars
 * before binding a user-supplied filename to a download attribute.
 */
export function sanitizeDownloadFileName(
  raw: string | null | undefined,
  fallback = 'berkas_ptsp'
): string {
  const cleaned = String(raw ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[/\\]+/g, '_')
    .replace(/\.\.+/g, '.')
    .replace(/[^a-zA-Z0-9._\-\s()]/g, '_')
    .trim()
    .slice(0, 140);
  return cleaned || fallback;
}

/**
 * Neutralizes Spreadsheet Formula Injection (CSV/Excel Injection) by prefixing
 * cells starting with =, +, -, @, tab, or carriage return with a single quote.
 */
export function neutralizeSpreadsheetCell(value: unknown): string {
  const str = String(value ?? '').replace(/\u0000/g, '');
  if (!str) return '';
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Generates an unpredictable captcha code using the Web Crypto API
 * instead of Math.random().
 */
export function generateSecureCaptchaCode(
  alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  length = 5
): string {
  const result: string[] = [];
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const bytes = new Uint32Array(length);
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i += 1) {
      result.push(alphabet[bytes[i] % alphabet.length]);
    }
    return result.join('');
  }
  for (let i = 0; i < length; i += 1) {
    result.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }
  return result.join('');
}

/**
 * Validates strong password policy for new registrations and admin-provisioned accounts.
 */
export function validateStrongPassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Kata sandi minimal 8 karakter.';
  }
  if (password.length > 128) {
    return 'Kata sandi maksimal 128 karakter.';
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Kata sandi wajib mengombinasikan huruf dan angka agar akun lebih aman.';
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* CLIENT-SIDE PROGRESSIVE AUTH RATE LIMITER (COMPLEMENTS FIREBASE AUTH)      */
/* -------------------------------------------------------------------------- */

interface RateLimitEntry {
  failures: number;
  lockedUntilMs: number;
}

const authRateLimitMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS_BEFORE_LOCK = 5;

export function checkAuthRateLimit(bucket: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const entry = authRateLimitMap.get(bucket);
  if (!entry) return { allowed: true, retryAfterSeconds: 0 };
  const now = Date.now();
  if (entry.lockedUntilMs > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.lockedUntilMs - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordAuthFailure(bucket: string): {
  locked: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const prev = authRateLimitMap.get(bucket) ?? { failures: 0, lockedUntilMs: 0 };
  const failures = prev.failures + 1;
  let lockedUntilMs = prev.lockedUntilMs;

  if (failures >= MAX_ATTEMPTS_BEFORE_LOCK) {
    const tier = Math.min(3, failures - MAX_ATTEMPTS_BEFORE_LOCK);
    const cooldownMs = [30_000, 60_000, 120_000, 300_000][tier];
    lockedUntilMs = now + cooldownMs;
  }

  authRateLimitMap.set(bucket, { failures, lockedUntilMs });
  return {
    locked: lockedUntilMs > now,
    retryAfterSeconds: lockedUntilMs > now ? Math.ceil((lockedUntilMs - now) / 1000) : 0,
  };
}

export function clearAuthRateLimit(bucket: string): void {
  authRateLimitMap.delete(bucket);
}
