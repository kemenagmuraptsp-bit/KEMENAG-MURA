import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Keyboard,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import {
  activateSuperAdminEmailAccount,
  ADMIN_EMAIL,
  mapFirebaseAuthError,
  sendSuperAdminPasswordResetEmail,
} from '@/src/firebase';

const FIREBASE_USERS_URL =
  'https://console.firebase.google.com/project/gen-lang-client-0965669086/authentication/users';
const FIREBASE_PROVIDERS_URL =
  'https://console.firebase.google.com/project/gen-lang-client-0965669086/authentication/providers';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateAdminCaptcha(length = 5): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return out;
}

function AdminCaptchaCanvas({ code, onRefresh }: { code: string; onRefresh: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 6; i += 1) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(251, 191, 36, 0.35)' : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    for (let i = 0; i < 32; i += 1) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.32)';
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    const palette = ['#fcd34d', '#f8fafc', '#fde68a', '#fbbf24', '#bae6fd'];
    const step = (w - 24) / code.length;
    for (let i = 0; i < code.length; i += 1) {
      ctx.save();
      const x = 16 + i * step + step * 0.3;
      const y = h / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 22px monospace';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = palette[i % palette.length];
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }, [code]);

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={canvasRef}
        width={176}
        height={48}
        aria-label="Kode keamanan Super Admin"
        className="rounded-lg border border-amber-500/40 shrink-0 select-none"
      />
      <button
        type="button"
        onClick={onRefresh}
        title="Ganti kode keamanan"
        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 transition-colors shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Ganti</span>
      </button>
    </div>
  );
}

export function SuperAdminModal() {
  const {
    user,
    superAdminModalOpen,
    closeSuperAdminModal,
    signInSuperAdminWithEmail,
    authError,
    clearAuthError,
  } = useAuthRole();

  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(() => generateAdminCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [activateBusy, setActivateBusy] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(generateAdminCaptcha());
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    if (!superAdminModalOpen) return;
    setLocalError('');
    setInfoMessage('');
    clearAuthError();
    setPassword('');
    setAdminEmail(ADMIN_EMAIL);
    refreshCaptcha();
  }, [superAdminModalOpen, refreshCaptcha]);

  useEffect(() => {
    if (!superAdminModalOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSuperAdminModal();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [superAdminModalOpen, closeSuperAdminModal]);

  if (!superAdminModalOpen) return null;

  const verifyCaptchaOrSetError = (): boolean => {
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setLocalError('Kode keamanan (Captcha) tidak cocok. Silakan periksa kembali.');
      refreshCaptcha();
      return false;
    }
    return true;
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setInfoMessage('');
    clearAuthError();
    if (!verifyCaptchaOrSetError()) return;

    setBusy(true);
    try {
      await signInSuperAdminWithEmail(adminEmail, password);
      setPassword('');
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Gagal masuk dengan Email & Password Super Admin.'
      );
      refreshCaptcha();
    } finally {
      setBusy(false);
    }
  };

  const handleResetAdminPassword = async () => {
    setLocalError('');
    setInfoMessage('');
    clearAuthError();
    if (adminEmail.trim().toLowerCase() !== ADMIN_EMAIL) {
      setLocalError(`Reset kata sandi hanya berlaku untuk email resmi (${ADMIN_EMAIL}).`);
      return;
    }

    setResetBusy(true);
    try {
      await sendSuperAdminPasswordResetEmail();
      setInfoMessage(
        `Tautan atur/reset kata sandi telah dikirim ke ${ADMIN_EMAIL}. Cek kotak masuk atau folder Spam Gmail tersebut.`
      );
    } catch (err) {
      setLocalError(mapFirebaseAuthError(err, 'admin'));
    } finally {
      setResetBusy(false);
    }
  };

  const handleActivateFirstTimeAdmin = async () => {
    setLocalError('');
    setInfoMessage('');
    clearAuthError();
    if (!verifyCaptchaOrSetError()) return;

    setActivateBusy(true);
    try {
      await activateSuperAdminEmailAccount(adminEmail, password);
      setInfoMessage(
        `Akun ${ADMIN_EMAIL} berhasil didaftarkan dengan kata sandi tersebut! Silakan cek kotak masuk Gmail ${ADMIN_EMAIL}, klik tautan verifikasi, lalu klik "Masuk Mode Super Admin".`
      );
    } catch (err) {
      setLocalError(mapFirebaseAuthError(err, 'admin'));
      refreshCaptcha();
    } finally {
      setActivateBusy(false);
    }
  };

  const activeError = localError || authError;
  const showCredentialHelpers =
    Boolean(activeError) &&
    (activeError.includes('Kata sandi Super Admin') ||
      activeError.includes('belum terdaftar') ||
      activeError.includes('belum disetel'));
  const showProviderHelper =
    Boolean(activeError) && activeError.includes('Sign-in method');

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="superadmin-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSuperAdminModal();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border-2 border-amber-500/50 text-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-amber-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Akses Terbatas
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono-tabular text-slate-300">
                  <Keyboard className="w-2.5 h-2.5 text-amber-400" />
                  Ctrl+Alt+A
                </span>
              </div>
              <h2 id="superadmin-modal-title" className="text-sm font-extrabold text-white truncate">
                Portal Login Super Admin PTSP
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSuperAdminModal}
            aria-label="Tutup jendela login Super Admin"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-100 space-y-1 leading-relaxed">
            <p className="font-bold text-amber-300">Otoritas Administrator Utama</p>
            <p className="text-[11px] text-slate-300">
              Masuk langsung menggunakan Email & Kata Sandi Super Admin resmi (
              <strong className="text-white">{ADMIN_EMAIL}</strong>) tanpa pop-up akun Google.
            </p>
            {user && (
              <p className="text-[11px] text-amber-200 pt-1">
                Sesi saat ini ({user.email}) akan otomatis dialihkan setelah login Super Admin berhasil.
              </p>
            )}
          </div>

          {activeError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 space-y-2.5 text-xs text-rose-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{activeError}</span>
              </div>

              {(showCredentialHelpers || showProviderHelper) && (
                <div className="pl-6 pt-2 border-t border-rose-500/25 flex flex-wrap items-center gap-2">
                  {showCredentialHelpers && (
                    <>
                      <button
                        type="button"
                        disabled={activateBusy || busy || resetBusy}
                        onClick={() => void handleActivateFirstTimeAdmin()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-200 disabled:opacity-60 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>
                          {activateBusy
                            ? 'Mendaftarkan...'
                            : 'Aktivasi Akun Admin Pertama Kali'}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={resetBusy || busy || activateBusy}
                        onClick={() => void handleResetAdminPassword()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-bold text-slate-200 disabled:opacity-60 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kirim Tautan Atur/Reset Sandi</span>
                      </button>
                    </>
                  )}
                  <a
                    href={showProviderHelper ? FIREBASE_PROVIDERS_URL : FIREBASE_USERS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-rose-400/40 text-[11px] font-bold text-rose-100 transition-colors"
                  >
                    <span>
                      {showProviderHelper
                        ? 'Aktifkan Email/Password di Firebase'
                        : 'Cek Firebase Auth Users'}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {infoMessage && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 flex items-start gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{infoMessage}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleEmailPasswordLogin(e)} className="space-y-3.5">
            {/* Captcha Verification */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                1. Kode Keamanan (Captcha) *
              </label>
              <AdminCaptchaCanvas code={captchaCode} onRefresh={refreshCaptcha} />
              <input
                type="text"
                maxLength={8}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Ketik 5 karakter di atas"
                className="w-full px-3.5 py-2.5 text-sm font-mono-tabular uppercase tracking-widest border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                2. Email Super Admin *
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                3. Kata Sandi Super Admin *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy || resetBusy || activateBusy}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>{busy ? 'Memverifikasi...' : 'Masuk Mode Super Admin'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                disabled={resetBusy || busy || activateBusy}
                onClick={() => void handleResetAdminPassword()}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-amber-300 disabled:opacity-60 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>
                  {resetBusy
                    ? 'Mengirim tautan atur sandi...'
                    : 'Lupa / Belum atur password? Kirim tautan ke email admin'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
