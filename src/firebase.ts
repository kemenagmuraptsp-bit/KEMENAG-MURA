import { deleteApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { NewsArticle } from '@/src/types';
import type {
  InfoMetric,
  InfoOrgNode,
  InfoSection,
  InformasiUnitConfig,
} from '@/src/data/informasiData';
import {
  isSafeHttpOrRelativeUrl,
  isSafeHttpsUrl,
  validateStrongPassword,
} from '@/src/utils/security';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export const ADMIN_EMAIL = 'kemenagmuraptsp@gmail.com';

export type AccountTier = 'masyarakat' | 'pegawai' | 'admin';

export type EmployeeUnitCategory = 'kankemenag' | 'kua_kecamatan' | 'madrasah';

export type EmployeeOperatorRole = 'pegawai' | 'operator_ptsp' | 'operator_seksi' | 'pimpinan';

export type OperatorUnitAssignment =
  | 'all'
  | 'sekretariat'
  | 'bimas-islam'
  | 'pendis'
  | 'bimas-hindu'
  | 'bimas-kristen'
  | 'kepegawaian';

export interface UserProfileRecord {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: Timestamp | null;
  lastLoginAt?: Timestamp | null;
}

export interface DownloadLogRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentId: string;
  documentTitle: string;
  category: 'zakat' | 'imsakiyah';
  year: number;
  downloadedAt?: Timestamp | null;
}

export interface EmployeeRequestRecord {
  uid: string;
  email: string;
  fullName: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  unitCategory: EmployeeUnitCategory;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  reviewedBy?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface VerifiedEmployeeRecord {
  uid: string;
  email: string;
  fullName: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  unitCategory: EmployeeUnitCategory;
  operatorRole: EmployeeOperatorRole;
  assignedUnitId?: OperatorUnitAssignment;
  assignedUnitTitle?: string;
  status: 'active' | 'revoked';
  verifiedBy: string;
  verifiedAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface CloudNewsArticleRecord extends NewsArticle {
  isDeleted?: boolean;
  createdBy: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type SeksiUnitId =
  | 'sekretariat'
  | 'bimas-islam'
  | 'pendis'
  | 'bimas-hindu'
  | 'bimas-kristen'
  | 'kepegawaian';

export interface CloudInfoSectionRecord {
  id: string;
  seksiUnitId: SeksiUnitId;
  infoUnitId: string;
  sectionId: string;
  sectionLabel: string;
  title: string;
  subtitle: string;
  updatedAtLabel: string;
  columns: string[];
  rows: string[][];
  rowCount: number;
  metrics?: InfoMetric[];
  orgNodes?: InfoOrgNode[];
  footnote?: string;
  updatedByName: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type PtspTicketStatus =
  | 'Diproses Verifikasi'
  | 'Diterima PTSP'
  | 'Ditolak PTSP'
  | 'Disposisi ke Seksi'
  | 'Telaah Seksi'
  | 'Perlu Revisi'
  | 'Siap TTE'
  | 'TTE Sah (Selesai)'
  | 'Menunggu Berkas'
  | 'Selesai';

export interface CloudPtspTicketRecord {
  id: string;
  ticketNo: string;
  userId: string;
  userEmail: string;
  accountTier: AccountTier;
  unitId: string;
  unitTitle: string;
  subServiceId: string;
  serviceTitle: string;
  applicantName: string;
  phone: string;
  institution?: string;
  nip?: string;
  notes?: string;
  status: PtspTicketStatus;
  adminNote?: string;
  dispatchedToSeksi?: boolean;
  dispatchedUnitId?: SeksiUnitId;
  dispatchedUnitTitle?: string;
  dispatchedBy?: string;
  seksiReviewer?: string;
  tteSentToLeader?: boolean;
  tteLeaderNote?: string;
  checkedDocsPattern?: string;
  verifiedDocsCount?: number;
  totalDocsCount?: number;
  uploadedDocsCount?: number;
  tteDocNumber?: string;
  tteSignerName?: string;
  tteSignerTitle?: string;
  tteSignerNip?: string;
  tteSignedAtLabel?: string;
  submittedAtLabel: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type TicketAttachmentMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

export interface TicketAttachmentDraft {
  requirementIndex: number;
  requirementLabel: string;
  fileName: string;
  mimeType: TicketAttachmentMimeType;
  fileSize: number;
  dataUrl: string;
}

export interface CloudPtspTicketAttachment extends TicketAttachmentDraft {
  id: string;
  ticketId: string;
  userId: string;
  createdAt?: Timestamp | null;
}

function clampStr(value: string | null | undefined, max: number, fallback = ''): string {
  const clean = (value ?? '').trim();
  if (!clean) return fallback;
  return clean.slice(0, max);
}

function formatTodayLabel(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function sanitizeNipDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 20);
}

export function nipToEmployeeEmail(nip: string): string {
  const digits = sanitizeNipDigits(nip);
  if (digits.length < 8 || digits.length > 20) {
    throw new Error('NIP harus terdiri dari 8 sampai 20 digit angka.');
  }
  return `${digits}@pegawai.kemenagmura.id`;
}

export function isNipEmployeeEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[0-9]{8,20}@pegawai\.kemenagmura\.id$/i.test(email.trim());
}

export function isEligibleSessionUser(user: User | null): boolean {
  if (!user) return false;
  return Boolean(user.emailVerified || isNipEmployeeEmail(user.email));
}

export function isGoogleAuthUser(user: User | null): boolean {
  if (!user || !user.emailVerified || isNipEmployeeEmail(user.email)) return false;
  return Boolean(user.providerData?.some((p) => p.providerId === 'google.com'));
}

export function mapFirebaseAuthError(
  error: unknown,
  context: 'nip' | 'admin' | 'google' | 'masyarakat' = 'nip'
): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  const msg = error instanceof Error ? error.message : String(error ?? '');

  if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
    const host =
      typeof window !== 'undefined' && window.location.hostname
        ? window.location.hostname
        : 'domain aplikasi ini';
    return `Login Google belum aktif karena domain "${host}" belum ditambahkan ke Authorized Domains pada Firebase Authentication project ini. Pengelola website dapat menambahkannya pada panduan di bawah, atau sementara masuk menggunakan Email & Kata Sandi.`;
  }
  if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
    return 'Jendela pop-up login Google diblokir browser. Harap izinkan pop-up untuk situs ini atau gunakan Email & Kata Sandi di bawah.';
  }
  if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
    return 'Metode login Email/Password belum diaktifkan di Firebase Console (Authentication > Sign-in method). Silakan aktifkan terlebih dahulu.';
  }
  if (code === 'auth/invalid-email') {
    return 'Format alamat email tidak valid. Pastikan penulisan email sudah benar.';
  }
  if (
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password'
  ) {
    if (context === 'admin') {
      return 'Kredensial Super Admin tidak sesuai, atau akun belum diaktifkan/disetel kata sandinya di Firebase Auth.';
    }
    if (context === 'masyarakat') {
      return 'Email atau kata sandi yang Anda masukkan tidak sesuai.';
    }
    return 'NIP atau Password yang Anda masukkan tidak sesuai.';
  }
  if (code === 'auth/email-already-in-use') {
    if (context === 'admin') {
      return 'Akun Super Admin sudah terdaftar di Firebase Auth. Gunakan "Kirim Tautan Atur/Reset Sandi" jika perlu menyetel ulang kata sandi.';
    }
    if (context === 'masyarakat') {
      return 'Alamat email ini tidak dapat didaftarkan ulang. Silakan masuk menggunakan akun yang ada atau gunakan fitur Lupa Kata Sandi.';
    }
    return 'NIP ini sudah terdaftar. Silakan langsung masuk menggunakan NIP dan Password Anda.';
  }
  if (code === 'auth/weak-password') {
    return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Terlalu banyak percobaan login gagal. Silakan tunggu beberapa saat sebelum mencoba lagi.';
  }
  if (msg && !msg.includes('Firebase:') && !msg.includes('auth/')) {
    return msg;
  }
  return 'Terjadi kendala saat proses autentikasi. Silakan coba lagi.';
}

export async function signInWithGoogleAndRecord(): Promise<User | null> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;
    await upsertGoogleUserProfile(user);
    return user;
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code)
        : '';
    const isTopLevelWindow =
      typeof window !== 'undefined' && window.self === window.top;
    if (
      isTopLevelWindow &&
      (code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment')
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function completeGoogleRedirectSignIn(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;
  await upsertGoogleUserProfile(result.user);
  return result.user;
}

export async function signInPublicWithEmail(
  email: string,
  password: string
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Masukkan alamat email yang valid.');
  }
  if (cleanEmail === ADMIN_EMAIL) {
    throw new Error('Email atau kata sandi yang Anda masukkan tidak sesuai.');
  }
  if (isNipEmployeeEmail(cleanEmail)) {
    throw new Error('Akun pegawai NIP silakan masuk melalui tab "Login Pegawai (NIP)".');
  }
  if (!password || password.length < 6) {
    throw new Error('Kata sandi wajib diisi minimal 6 karakter.');
  }

  const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  await credential.user.reload();

  if (!credential.user.emailVerified) {
    try {
      await sendEmailVerification(credential.user);
    } catch {
      // Ignore Firebase rate-limit error if verification email was recently sent
    }
    await signOut(auth);
    throw new Error(
      `Email ${cleanEmail} belum diverifikasi. Tautan verifikasi baru telah dikirim ke kotak masuk/spam ${cleanEmail}. Klik tautan tersebut lalu login kembali.`
    );
  }

  await credential.user.getIdToken(true);
  await upsertGoogleUserProfile(credential.user);
  return credential.user;
}

export async function registerPublicWithEmail(params: {
  fullName: string;
  email: string;
  password: string;
}): Promise<void> {
  const cleanName = clampStr(params.fullName, 120);
  const cleanEmail = params.email.trim().toLowerCase();
  const password = params.password;

  if (cleanName.length < 2) {
    throw new Error('Nama lengkap wajib diisi minimal 2 huruf.');
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Masukkan alamat email yang valid.');
  }
  if (cleanEmail === ADMIN_EMAIL) {
    throw new Error('Alamat email ini tidak tersedia untuk pendaftaran akun masyarakat.');
  }
  if (isNipEmployeeEmail(cleanEmail)) {
    throw new Error('Email domain pegawai silakan mendaftar melalui tab "Login Pegawai (NIP)".');
  }
  const passwordErr = validateStrongPassword(password);
  if (passwordErr) {
    throw new Error(passwordErr);
  }

  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  try {
    await updateProfile(credential.user, { displayName: cleanName });
    await sendEmailVerification(credential.user);
  } finally {
    await signOut(auth);
  }
}

export async function sendPublicPasswordResetEmail(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Isi alamat email Anda terlebih dahulu untuk mengirim tautan atur ulang kata sandi.');
  }
  if (cleanEmail === ADMIN_EMAIL) {
    // Do not leak admin panel shortcut or account status in public reset flow
    return;
  }
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (err) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code)
        : '';
    // Prevent account enumeration on password reset
    if (code === 'auth/user-not-found') {
      return;
    }
    throw err;
  }
}

export async function signInSuperAdminWithEmail(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_EMAIL) {
    throw new Error('Kredensial Super Admin tidak sesuai.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password wajib diisi minimal 6 karakter.');
  }
  const credential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
  if (!credential.user.emailVerified) {
    try {
      await sendEmailVerification(credential.user);
    } catch {
      // Ignore rate-limit error if verification email was recently sent
    }
    await signOut(auth);
    throw new Error(
      `Email ${ADMIN_EMAIL} belum terverifikasi satu kali. Tautan verifikasi telah dikirim ke kotak masuk ${ADMIN_EMAIL} — klik tautan di email tersebut lalu login kembali.`
    );
  }
  await credential.user.getIdToken(true);
  await upsertGoogleUserProfile(credential.user);
  return credential.user;
}

export async function activateSuperAdminEmailAccount(
  email: string,
  password: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_EMAIL) {
    throw new Error('Aktivasi Super Admin hanya berlaku untuk akun resmi pengelola.');
  }
  const passwordErr = validateStrongPassword(password);
  if (passwordErr) {
    throw new Error(passwordErr);
  }
  const credential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, password);
  try {
    await sendEmailVerification(credential.user);
  } finally {
    await signOut(auth);
  }
}

export async function sendSuperAdminPasswordResetEmail(): Promise<void> {
  await sendPasswordResetEmail(auth, ADMIN_EMAIL);
}

export async function signInEmployeeWithNip(nip: string, password: string): Promise<User> {
  const email = nipToEmployeeEmail(nip);
  if (!password || password.length < 6) {
    throw new Error('Password wajib diisi minimal 6 karakter.');
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await upsertGoogleUserProfile(credential.user);
  return credential.user;
}

export async function signInOperatorWithNip(
  nip: string,
  password: string
): Promise<{
  user: User;
  operatorRole: 'operator_ptsp' | 'operator_seksi' | 'pimpinan';
  assignedUnitTitle?: string;
}> {
  const email = nipToEmployeeEmail(nip);
  if (!password || password.length < 6) {
    throw new Error('Password wajib diisi minimal 6 karakter.');
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const loggedInUser = credential.user;
  await loggedInUser.getIdToken(true);

  const empRef = doc(db, 'verifiedEmployees', loggedInUser.uid);
  let empSnap;
  try {
    empSnap = await getDocFromServer(empRef);
  } catch {
    empSnap = await getDoc(empRef);
  }

  if (!empSnap.exists()) {
    await signOut(auth);
    throw new Error(
      'Akun NIP ini belum aktif sebagai Operator PTSP, Operator Seksi, atau Pimpinan. Hubungi Super Admin atau masuk melalui menu Login Pegawai (NIP).'
    );
  }

  const data = empSnap.data();
  const status = String(data.status ?? '');
  const role = String(data.operatorRole ?? 'pegawai');

  if (status !== 'active') {
    await signOut(auth);
    throw new Error(
      'Status kepegawaian akun ini sedang nonaktif atau dicabut oleh Super Admin.'
    );
  }

  if (role !== 'operator_ptsp' && role !== 'operator_seksi' && role !== 'pimpinan') {
    await signOut(auth);
    throw new Error(
      'NIP ini berstatus Pegawai biasa (bukan Operator PTSP / Operator Seksi / Pimpinan). Silakan masuk melalui tombol Login > Login Pegawai (NIP).'
    );
  }

  await upsertGoogleUserProfile(loggedInUser);
  return {
    user: loggedInUser,
    operatorRole: role,
    assignedUnitTitle: data.assignedUnitTitle ? String(data.assignedUnitTitle) : undefined,
  };
}

export async function registerEmployeeNipRequest(params: {
  fullName: string;
  nip: string;
  password: string;
  jabatan: string;
  unitKerja: string;
  unitCategory: EmployeeUnitCategory;
}): Promise<User> {
  const { fullName, nip, password, jabatan, unitKerja, unitCategory } = params;
  const digits = sanitizeNipDigits(nip);
  const email = nipToEmployeeEmail(digits);
  const cleanFullName = clampStr(fullName, 120);

  if (cleanFullName.length < 2) {
    throw new Error('Nama lengkap wajib diisi.');
  }
  const passwordErr = validateStrongPassword(password);
  if (passwordErr) {
    throw new Error(passwordErr);
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  await updateProfile(user, { displayName: cleanFullName });
  await upsertGoogleUserProfile(user, cleanFullName);
  await submitEmployeeVerificationRequest({
    user,
    fullName: cleanFullName,
    nip: digits,
    jabatan,
    unitKerja,
    unitCategory,
  });
  return user;
}

export async function provisionEmployeeAccountByAdmin(params: {
  adminUser: User;
  fullName: string;
  nip: string;
  password: string;
  jabatan: string;
  unitKerja: string;
  unitCategory: EmployeeUnitCategory;
  operatorRole?: EmployeeOperatorRole;
  assignedUnitId?: OperatorUnitAssignment;
  assignedUnitTitle?: string;
}): Promise<{ uid: string; email: string }> {
  const {
    adminUser,
    fullName,
    nip,
    password,
    jabatan,
    unitKerja,
    unitCategory,
    operatorRole = 'pegawai',
    assignedUnitId,
    assignedUnitTitle,
  } = params;
  const digits = sanitizeNipDigits(nip);
  const email = nipToEmployeeEmail(digits);
  const cleanFullName = clampStr(fullName, 120);

  if (cleanFullName.length < 2) {
    throw new Error('Nama lengkap wajib diisi.');
  }
  const passwordErr = validateStrongPassword(password);
  if (passwordErr) {
    throw new Error(passwordErr);
  }

  const secName = 'kemenag-admin-emp-provisioner';
  const existingSec = getApps().find((a) => a.name === secName);
  const secApp = existingSec || initializeApp(firebaseConfig, secName);
  const secAuth = getAuth(secApp);

  try {
    const credential = await createUserWithEmailAndPassword(secAuth, email, password);
    const createdUser = credential.user;
    await updateProfile(createdUser, { displayName: cleanFullName });
    const uid = createdUser.uid;
    await signOut(secAuth);

    await approveEmployeeVerification({
      adminUser,
      targetUid: uid,
      email,
      fullName: cleanFullName,
      nip: digits,
      jabatan,
      unitKerja,
      unitCategory,
      operatorRole,
      assignedUnitId,
      assignedUnitTitle,
      adminNote: 'Akun didaftarkan dan diaktifkan langsung oleh Super Admin.',
    });

    return { uid, email };
  } finally {
    if (!existingSec) {
      await deleteApp(secApp).catch(() => {});
    }
  }
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

const inFlightProfileUpserts = new Map<string, Promise<void>>();

export async function upsertGoogleUserProfile(
  user: User,
  preferredDisplayName?: string
): Promise<void> {
  const existingTask = inFlightProfileUpserts.get(user.uid);
  if (existingTask) {
    return existingTask;
  }

  const task = (async () => {
    const path = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);
    const displayName = clampStr(
      preferredDisplayName || user.displayName || user.email?.split('@')[0],
      120,
      'Pengguna Portal'
    );
    const email = clampStr(user.email, 160);
    const rawPhotoUrl = clampStr(user.photoURL, 500);
    const photoURL = isSafeHttpsUrl(rawPhotoUrl) ? rawPhotoUrl : '';

    if (!email) return;

    try {
      await user.getIdToken();
      let snap;
      try {
        snap = await getDocFromServer(userRef);
      } catch {
        snap = await getDoc(userRef);
      }

      if (!snap.exists()) {
        const payload: Record<string, unknown> = {
          uid: user.uid,
          displayName,
          email,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };
        if (photoURL) {
          payload.photoURL = photoURL;
        }
        await setDoc(userRef, payload);
      } else {
        const updatePayload: Record<string, unknown> = {
          displayName,
          lastLoginAt: serverTimestamp(),
        };
        if (photoURL) {
          updatePayload.photoURL = photoURL;
        }
        await updateDoc(userRef, updatePayload);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  })().finally(() => {
    inFlightProfileUpserts.delete(user.uid);
  });

  inFlightProfileUpserts.set(user.uid, task);
  return task;
}

export async function recordDocumentDownload(params: {
  user: User;
  documentId: string;
  documentTitle: string;
  category: 'zakat' | 'imsakiyah';
  year: number;
}): Promise<void> {
  const { user, documentId, documentTitle, category, year } = params;
  const safeDocId = documentId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 80);
  const logId = `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `downloadLogs/${logId}`;

  const payload = {
    userId: user.uid,
    userName: clampStr(user.displayName || user.email?.split('@')[0], 120, 'Pengguna Google'),
    userEmail: clampStr(user.email, 160),
    documentId: safeDocId,
    documentTitle: clampStr(documentTitle, 200),
    category,
    year: Math.round(year),
    downloadedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'downloadLogs', logId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserDownloadLogs(
  user: User,
  isAdmin: boolean,
  onData: (logs: DownloadLogRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'downloadLogs';
  const colRef = collection(db, path);
  const q = isAdmin
    ? query(colRef, limit(100))
    : query(colRef, where('userId', '==', user.uid), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: DownloadLogRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: String(data.userId ?? ''),
          userName: String(data.userName ?? ''),
          userEmail: String(data.userEmail ?? ''),
          documentId: String(data.documentId ?? ''),
          documentTitle: String(data.documentTitle ?? ''),
          category: data.category === 'zakat' ? 'zakat' : 'imsakiyah',
          year: Number(data.year ?? 2026),
          downloadedAt: (data.downloadedAt as Timestamp | null) ?? null,
        };
      });

      rows.sort((a, b) => {
        const ta = a.downloadedAt?.toMillis?.() ?? Date.now();
        const tb = b.downloadedAt?.toMillis?.() ?? Date.now();
        return tb - ta;
      });
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAllGoogleUsers(
  onData: (users: UserProfileRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'users';
  const q = query(collection(db, path), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: UserProfileRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: String(data.uid ?? d.id),
          displayName: String(data.displayName ?? ''),
          email: String(data.email ?? ''),
          photoURL: data.photoURL ? String(data.photoURL) : undefined,
          createdAt: (data.createdAt as Timestamp | null) ?? null,
          lastLoginAt: (data.lastLoginAt as Timestamp | null) ?? null,
        };
      });

      rows.sort((a, b) => {
        const ta = a.lastLoginAt?.toMillis?.() ?? 0;
        const tb = b.lastLoginAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/* -------------------------------------------------------------------------- */
/* EMPLOYEE VERIFICATION & STRICT KEPEGAWAIAN ACCESS CONTROL                 */
/* -------------------------------------------------------------------------- */

function normalizeUnitCategory(raw: unknown): EmployeeUnitCategory {
  if (raw === 'kua_kecamatan' || raw === 'madrasah') return raw;
  return 'kankemenag';
}

function mapEmployeeRequest(uid: string, data: Record<string, unknown>): EmployeeRequestRecord {
  const statusRaw = String(data.status ?? 'pending');
  const status: EmployeeRequestRecord['status'] =
    statusRaw === 'approved' || statusRaw === 'rejected' ? statusRaw : 'pending';
  return {
    uid: String(data.uid ?? uid),
    email: String(data.email ?? ''),
    fullName: String(data.fullName ?? ''),
    nip: String(data.nip ?? ''),
    jabatan: String(data.jabatan ?? ''),
    unitKerja: String(data.unitKerja ?? ''),
    unitCategory: normalizeUnitCategory(data.unitCategory),
    status,
    adminNote: data.adminNote ? String(data.adminNote) : undefined,
    reviewedBy: data.reviewedBy ? String(data.reviewedBy) : undefined,
    createdAt: (data.createdAt as Timestamp | null) ?? null,
    updatedAt: (data.updatedAt as Timestamp | null) ?? null,
  };
}

function normalizeOperatorRole(raw: unknown): EmployeeOperatorRole {
  if (raw === 'operator_ptsp' || raw === 'operator_seksi' || raw === 'pimpinan') return raw;
  return 'pegawai';
}

function normalizeAssignedUnitId(raw: unknown): OperatorUnitAssignment | undefined {
  if (
    raw === 'all' ||
    raw === 'sekretariat' ||
    raw === 'bimas-islam' ||
    raw === 'pendis' ||
    raw === 'bimas-hindu' ||
    raw === 'bimas-kristen' ||
    raw === 'kepegawaian'
  ) {
    return raw;
  }
  return undefined;
}

function mapVerifiedEmployee(uid: string, data: Record<string, unknown>): VerifiedEmployeeRecord {
  return {
    uid: String(data.uid ?? uid),
    email: String(data.email ?? ''),
    fullName: String(data.fullName ?? ''),
    nip: String(data.nip ?? ''),
    jabatan: String(data.jabatan ?? ''),
    unitKerja: String(data.unitKerja ?? ''),
    unitCategory: normalizeUnitCategory(data.unitCategory),
    operatorRole: normalizeOperatorRole(data.operatorRole),
    assignedUnitId: normalizeAssignedUnitId(data.assignedUnitId),
    assignedUnitTitle: data.assignedUnitTitle ? String(data.assignedUnitTitle) : undefined,
    status: data.status === 'revoked' ? 'revoked' : 'active',
    verifiedBy: String(data.verifiedBy ?? ''),
    verifiedAt: (data.verifiedAt as Timestamp | null) ?? null,
    updatedAt: (data.updatedAt as Timestamp | null) ?? null,
  };
}

export function subscribeMyEmployeeRequest(
  uid: string,
  onData: (req: EmployeeRequestRecord | null) => void,
  onError: (err: unknown) => void
): () => void {
  const path = `employeeRequests/${uid}`;
  return onSnapshot(
    doc(db, 'employeeRequests', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(mapEmployeeRequest(snap.id, snap.data()));
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeMyVerifiedEmployee(
  uid: string,
  onData: (emp: VerifiedEmployeeRecord | null) => void,
  onError: (err: unknown) => void
): () => void {
  const path = `verifiedEmployees/${uid}`;
  return onSnapshot(
    doc(db, 'verifiedEmployees', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(mapVerifiedEmployee(snap.id, snap.data()));
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function submitEmployeeVerificationRequest(params: {
  user: User;
  fullName: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  unitCategory: EmployeeUnitCategory;
}): Promise<void> {
  const { user, fullName, nip, jabatan, unitKerja, unitCategory } = params;
  const path = `employeeRequests/${user.uid}`;
  const reqRef = doc(db, 'employeeRequests', user.uid);
  const cleanNip = clampStr(nip.replace(/[^0-9A-Za-z\-\s]/g, ''), 30);
  const cleanFullName = clampStr(fullName, 120);
  const cleanJabatan = clampStr(jabatan, 120);
  const cleanUnitKerja = clampStr(unitKerja, 150);
  const email = clampStr(user.email, 160);

  if (cleanNip.length < 8 || cleanFullName.length < 2 || cleanJabatan.length < 2 || cleanUnitKerja.length < 2) {
    throw new Error('Lengkapi Nama Lengkap, NIP (minimal 8 karakter), Jabatan, dan Unit Kerja.');
  }

  try {
    const snap = await getDoc(reqRef);
    if (!snap.exists()) {
      await setDoc(reqRef, {
        uid: user.uid,
        email,
        fullName: cleanFullName,
        nip: cleanNip,
        jabatan: cleanJabatan,
        unitKerja: cleanUnitKerja,
        unitCategory,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(reqRef, {
        fullName: cleanFullName,
        nip: cleanNip,
        jabatan: cleanJabatan,
        unitKerja: cleanUnitKerja,
        unitCategory,
        status: 'pending',
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeAllEmployeeRequests(
  onData: (rows: EmployeeRequestRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'employeeRequests';
  const q = query(collection(db, path), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows = snapshot.docs.map((d) => mapEmployeeRequest(d.id, d.data()));
      rows.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0);
      });
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAllVerifiedEmployees(
  onData: (rows: VerifiedEmployeeRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'verifiedEmployees';
  const q = query(collection(db, path), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows = snapshot.docs.map((d) => mapVerifiedEmployee(d.id, d.data()));
      rows.sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function approveEmployeeVerification(params: {
  adminUser: User;
  targetUid: string;
  email: string;
  fullName: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  unitCategory: EmployeeUnitCategory;
  operatorRole?: EmployeeOperatorRole;
  assignedUnitId?: OperatorUnitAssignment;
  assignedUnitTitle?: string;
  adminNote?: string;
}): Promise<void> {
  const {
    adminUser,
    targetUid,
    email,
    fullName,
    nip,
    jabatan,
    unitKerja,
    unitCategory,
    operatorRole = 'pegawai',
    assignedUnitId,
    assignedUnitTitle,
    adminNote,
  } = params;
  const adminEmail = clampStr(adminUser.email, 160);
  const empPath = `verifiedEmployees/${targetUid}`;
  const empRef = doc(db, 'verifiedEmployees', targetUid);
  const reqRef = doc(db, 'employeeRequests', targetUid);
  const cleanNip = clampStr(nip.replace(/[^0-9A-Za-z\-\s]/g, ''), 30);

  const resolvedUnitId: OperatorUnitAssignment =
    operatorRole === 'operator_seksi'
      ? assignedUnitId || 'sekretariat'
      : 'all';

  const resolvedUnitTitle =
    operatorRole === 'operator_ptsp'
      ? 'Semua Layanan PTSP'
      : operatorRole === 'pimpinan'
      ? 'Pimpinan (Pengesahan TTE)'
      : operatorRole === 'operator_seksi'
      ? clampStr(assignedUnitTitle || resolvedUnitId, 100)
      : 'Pegawai Kemenag Mura';

  try {
    const existingEmp = await getDoc(empRef);
    if (!existingEmp.exists()) {
      await setDoc(empRef, {
        uid: targetUid,
        email: clampStr(email, 160),
        fullName: clampStr(fullName, 120),
        nip: cleanNip,
        jabatan: clampStr(jabatan, 120),
        unitKerja: clampStr(unitKerja, 150),
        unitCategory,
        operatorRole,
        assignedUnitId: resolvedUnitId,
        assignedUnitTitle: resolvedUnitTitle,
        status: 'active',
        verifiedBy: adminEmail,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(empRef, {
        fullName: clampStr(fullName, 120),
        nip: cleanNip,
        jabatan: clampStr(jabatan, 120),
        unitKerja: clampStr(unitKerja, 150),
        unitCategory,
        operatorRole,
        assignedUnitId: resolvedUnitId,
        assignedUnitTitle: resolvedUnitTitle,
        status: 'active',
        verifiedBy: adminEmail,
        updatedAt: serverTimestamp(),
      });
    }

    const reqSnap = await getDoc(reqRef);
    if (reqSnap.exists()) {
      const note = clampStr(adminNote, 300, 'Disetujui Super Admin Kemenag Kab. Murung Raya.');
      await updateDoc(reqRef, {
        status: 'approved',
        unitCategory,
        adminNote: note,
        reviewedBy: adminEmail,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, empPath);
  }
}

export async function updateVerifiedEmployeeCategory(params: {
  adminUser: User;
  targetUid: string;
  unitCategory: EmployeeUnitCategory;
}): Promise<void> {
  const { adminUser, targetUid, unitCategory } = params;
  const path = `verifiedEmployees/${targetUid}`;
  const adminEmail = clampStr(adminUser.email, 160);

  try {
    await updateDoc(doc(db, 'verifiedEmployees', targetUid), {
      unitCategory,
      verifiedBy: adminEmail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateVerifiedEmployeeDetails(params: {
  adminUser: User;
  targetUid: string;
  fullName: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  unitCategory: EmployeeUnitCategory;
  operatorRole: EmployeeOperatorRole;
  assignedUnitId?: OperatorUnitAssignment;
  assignedUnitTitle?: string;
  status: 'active' | 'revoked';
}): Promise<void> {
  const {
    adminUser,
    targetUid,
    fullName,
    nip,
    jabatan,
    unitKerja,
    unitCategory,
    operatorRole,
    assignedUnitId,
    assignedUnitTitle,
    status,
  } = params;
  const path = `verifiedEmployees/${targetUid}`;
  const adminEmail = clampStr(adminUser.email, 160);
  const cleanNip = clampStr(nip.replace(/[^0-9A-Za-z\-\s]/g, ''), 30);

  const resolvedUnitId: OperatorUnitAssignment =
    operatorRole === 'operator_seksi'
      ? assignedUnitId || 'sekretariat'
      : 'all';

  const resolvedUnitTitle =
    operatorRole === 'operator_ptsp'
      ? 'Semua Layanan PTSP'
      : operatorRole === 'pimpinan'
      ? 'Pimpinan (Pengesahan TTE)'
      : operatorRole === 'operator_seksi'
      ? clampStr(assignedUnitTitle || resolvedUnitId, 100)
      : 'Pegawai Kemenag Mura';

  try {
    await updateDoc(doc(db, 'verifiedEmployees', targetUid), {
      fullName: clampStr(fullName, 120),
      nip: cleanNip,
      jabatan: clampStr(jabatan, 120),
      unitKerja: clampStr(unitKerja, 150),
      unitCategory,
      operatorRole,
      assignedUnitId: resolvedUnitId,
      assignedUnitTitle: resolvedUnitTitle,
      status,
      verifiedBy: adminEmail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteVerifiedEmployeeAccount(targetUid: string): Promise<void> {
  const path = `verifiedEmployees/${targetUid}`;
  try {
    await deleteDoc(doc(db, 'verifiedEmployees', targetUid));
    const reqRef = doc(db, 'employeeRequests', targetUid);
    const reqSnap = await getDoc(reqRef).catch(() => null);
    if (reqSnap?.exists()) {
      await deleteDoc(reqRef).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function rejectEmployeeVerification(params: {
  adminUser: User;
  targetUid: string;
  adminNote: string;
}): Promise<void> {
  const { adminUser, targetUid, adminNote } = params;
  const path = `employeeRequests/${targetUid}`;
  const adminEmail = clampStr(adminUser.email, 160);
  const note = clampStr(
    adminNote,
    300,
    'Data NIP/Unit Kerja belum sesuai dengan database kepegawaian Kankemenag Murung Raya.'
  );

  try {
    await updateDoc(doc(db, 'employeeRequests', targetUid), {
      status: 'rejected',
      adminNote: note,
      reviewedBy: adminEmail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleVerifiedEmployeeStatus(params: {
  adminUser: User;
  targetUid: string;
  nextStatus: 'active' | 'revoked';
}): Promise<void> {
  const { adminUser, targetUid, nextStatus } = params;
  const path = `verifiedEmployees/${targetUid}`;
  const adminEmail = clampStr(adminUser.email, 160);

  try {
    await updateDoc(doc(db, 'verifiedEmployees', targetUid), {
      status: nextStatus,
      verifiedBy: adminEmail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/* -------------------------------------------------------------------------- */
/* CLOUD PTSP TICKETS (LINKED TO GOOGLE USER / VERIFIED EMPLOYEE)             */
/* -------------------------------------------------------------------------- */

const ALLOWED_ATTACHMENT_MIME_SET = new Set<TicketAttachmentMimeType>([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export async function createCloudPtspTicket(params: {
  user: User;
  accountTier: AccountTier;
  unitId: string;
  unitTitle: string;
  subServiceId: string;
  serviceTitle: string;
  applicantName: string;
  phone: string;
  institution?: string;
  nip?: string;
  notes?: string;
  totalDocsCount?: number;
  attachments?: TicketAttachmentDraft[];
}): Promise<CloudPtspTicketRecord> {
  const {
    user,
    accountTier,
    unitId,
    unitTitle,
    subServiceId,
    serviceTitle,
    applicantName,
    phone,
    institution,
    nip,
    notes,
    totalDocsCount,
    attachments = [],
  } = params;

  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const prefix = unitId === 'kepegawaian' ? 'KEP' : 'PTSP';
  const ticketNo = `${prefix}-MURA-${year}-${num}-${suffix}`.slice(0, 40);
  const id = `tk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `ptspTickets/${id}`;
  const submittedAtLabel = formatTodayLabel();

  const safeUnitId = unitId.toLowerCase().replace(/[^a-z0-9\-]/g, '-').slice(0, 40);
  const safeSubId = subServiceId.toLowerCase().replace(/[^a-z0-9\-]/g, '-').slice(0, 60);

  const validAttachments = attachments
    .filter(
      (att) =>
        att &&
        ALLOWED_ATTACHMENT_MIME_SET.has(att.mimeType) &&
        typeof att.dataUrl === 'string' &&
        att.dataUrl.length >= 20 &&
        att.dataUrl.length <= 800000 &&
        /^data:(application\/pdf|image\/jpeg|image\/png|image\/webp);base64,[A-Za-z0-9+/=]+$/.test(
          att.dataUrl
        )
    )
    .slice(0, 40);

  const payload: Record<string, unknown> = {
    id,
    ticketNo,
    userId: user.uid,
    userEmail: clampStr(user.email, 160),
    accountTier,
    unitId: safeUnitId,
    unitTitle: clampStr(unitTitle, 100),
    subServiceId: safeSubId,
    serviceTitle: clampStr(serviceTitle, 200),
    applicantName: clampStr(applicantName, 120),
    phone: clampStr(phone, 30),
    status: 'Diproses Verifikasi',
    uploadedDocsCount: validAttachments.length,
    submittedAtLabel,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (
    typeof totalDocsCount === 'number' &&
    Number.isFinite(totalDocsCount) &&
    totalDocsCount >= 0
  ) {
    payload.totalDocsCount = Math.max(0, Math.min(40, Math.trunc(totalDocsCount)));
    payload.verifiedDocsCount = 0;
  }

  const cleanInst = clampStr(institution, 160);
  const cleanNip = clampStr(nip, 30);
  const cleanNotes = clampStr(notes, 1000);
  if (cleanInst) payload.institution = cleanInst;
  if (cleanNip) payload.nip = cleanNip;
  if (cleanNotes) payload.notes = cleanNotes;

  try {
    await user.getIdToken();
    await setDoc(doc(db, 'ptspTickets', id), payload);
    for (let i = 0; i < validAttachments.length; i += 1) {
      const att = validAttachments[i];
      const safeReqIdx = Math.max(0, Math.min(40, Math.trunc(att.requirementIndex)));
      const attId = `att_${safeReqIdx}_${Date.now()}_${i}`;
      const attPath = `ptspTickets/${id}/attachments/${attId}`;
      try {
        await setDoc(doc(db, 'ptspTickets', id, 'attachments', attId), {
          id: attId,
          ticketId: id,
          userId: user.uid,
          requirementIndex: safeReqIdx,
          requirementLabel: clampStr(att.requirementLabel, 300, `Berkas Persyaratan ${safeReqIdx + 1}`),
          fileName: clampStr(att.fileName, 180, `berkas-${safeReqIdx + 1}`),
          mimeType: att.mimeType,
          fileSize: Math.max(1, Math.min(10485760, Math.trunc(att.fileSize || 1))),
          dataUrl: att.dataUrl,
          createdAt: serverTimestamp(),
        });
      } catch (attErr) {
        handleFirestoreError(attErr, OperationType.CREATE, attPath);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return {
    id,
    ticketNo,
    userId: user.uid,
    userEmail: clampStr(user.email, 160),
    accountTier,
    unitId: safeUnitId,
    unitTitle: clampStr(unitTitle, 100),
    subServiceId: safeSubId,
    serviceTitle: clampStr(serviceTitle, 200),
    applicantName: clampStr(applicantName, 120),
    phone: clampStr(phone, 30),
    institution: cleanInst || undefined,
    nip: cleanNip || undefined,
    notes: cleanNotes || undefined,
    status: 'Diproses Verifikasi',
    totalDocsCount:
      typeof totalDocsCount === 'number'
        ? Math.max(0, Math.min(40, Math.trunc(totalDocsCount)))
        : undefined,
    verifiedDocsCount: typeof totalDocsCount === 'number' ? 0 : undefined,
    uploadedDocsCount: validAttachments.length,
    submittedAtLabel,
    createdAt: null,
    updatedAt: null,
  };
}

export async function fetchTicketAttachments(
  ticketId: string
): Promise<CloudPtspTicketAttachment[]> {
  const path = `ptspTickets/${ticketId}/attachments`;
  try {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken();
    }
    const q = query(collection(db, 'ptspTickets', ticketId, 'attachments'), limit(45));
    const snapshot = await getDocs(q);
    const rows: CloudPtspTicketAttachment[] = snapshot.docs.map((d) => {
      const data = d.data();
      const rawMime = String(data.mimeType ?? 'application/pdf') as TicketAttachmentMimeType;
      const mimeType: TicketAttachmentMimeType = ALLOWED_ATTACHMENT_MIME_SET.has(rawMime)
        ? rawMime
        : 'application/pdf';
      return {
        id: String(data.id ?? d.id),
        ticketId: String(data.ticketId ?? ticketId),
        userId: String(data.userId ?? ''),
        requirementIndex: Number(data.requirementIndex ?? 0),
        requirementLabel: String(data.requirementLabel ?? ''),
        fileName: String(data.fileName ?? 'berkas'),
        mimeType,
        fileSize: Number(data.fileSize ?? 0),
        dataUrl: String(data.dataUrl ?? ''),
        createdAt: (data.createdAt as Timestamp | null) ?? null,
      };
    });
    rows.sort((a, b) => a.requirementIndex - b.requirementIndex);
    return rows;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export type TicketSubscriptionScope =
  | boolean
  | {
      mode: 'all' | 'unit' | 'mine';
      unitId?: string;
    };

const VALID_TICKET_STATUSES = new Set<PtspTicketStatus>([
  'Diproses Verifikasi',
  'Diterima PTSP',
  'Ditolak PTSP',
  'Disposisi ke Seksi',
  'Telaah Seksi',
  'Perlu Revisi',
  'Siap TTE',
  'TTE Sah (Selesai)',
  'Menunggu Berkas',
  'Selesai',
]);

const VALID_SEKSI_UNITS = new Set<SeksiUnitId>([
  'sekretariat',
  'bimas-islam',
  'pendis',
  'bimas-hindu',
  'bimas-kristen',
  'kepegawaian',
]);

function normalizeTicketStatus(raw: unknown): PtspTicketStatus {
  const str = String(raw ?? 'Diproses Verifikasi') as PtspTicketStatus;
  return VALID_TICKET_STATUSES.has(str) ? str : 'Diproses Verifikasi';
}

function normalizeSeksiUnitId(raw: unknown): SeksiUnitId | undefined {
  const str = String(raw ?? '') as SeksiUnitId;
  return VALID_SEKSI_UNITS.has(str) ? str : undefined;
}

export function subscribePtspTickets(
  user: User,
  scope: TicketSubscriptionScope,
  onData: (tickets: CloudPtspTicketRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'ptspTickets';
  const colRef = collection(db, path);
  const resolved =
    typeof scope === 'boolean'
      ? { mode: scope ? ('all' as const) : ('mine' as const) }
      : scope;

  const q =
    resolved.mode === 'all'
      ? query(colRef, limit(100))
      : resolved.mode === 'unit' && resolved.unitId && VALID_SEKSI_UNITS.has(resolved.unitId as SeksiUnitId)
      ? query(
          colRef,
          where('dispatchedToSeksi', '==', true),
          where('dispatchedUnitId', '==', resolved.unitId),
          limit(100)
        )
      : query(colRef, where('userId', '==', user.uid), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: CloudPtspTicketRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        const status = normalizeTicketStatus(data.status);
        const tierRaw = String(data.accountTier ?? 'masyarakat');
        const accountTier: AccountTier =
          tierRaw === 'pegawai' || tierRaw === 'admin' ? tierRaw : 'masyarakat';

        return {
          id: String(data.id ?? d.id),
          ticketNo: String(data.ticketNo ?? d.id),
          userId: String(data.userId ?? ''),
          userEmail: String(data.userEmail ?? ''),
          accountTier,
          unitId: String(data.unitId ?? ''),
          unitTitle: String(data.unitTitle ?? ''),
          subServiceId: String(data.subServiceId ?? ''),
          serviceTitle: String(data.serviceTitle ?? ''),
          applicantName: String(data.applicantName ?? ''),
          phone: String(data.phone ?? ''),
          institution: data.institution ? String(data.institution) : undefined,
          nip: data.nip ? String(data.nip) : undefined,
          notes: data.notes ? String(data.notes) : undefined,
          status,
          adminNote: data.adminNote ? String(data.adminNote) : undefined,
          dispatchedToSeksi: Boolean(data.dispatchedToSeksi),
          dispatchedUnitId: normalizeSeksiUnitId(data.dispatchedUnitId),
          dispatchedUnitTitle: data.dispatchedUnitTitle
            ? String(data.dispatchedUnitTitle)
            : undefined,
          dispatchedBy: data.dispatchedBy ? String(data.dispatchedBy) : undefined,
          seksiReviewer: data.seksiReviewer ? String(data.seksiReviewer) : undefined,
          tteSentToLeader: Boolean(data.tteSentToLeader),
          tteLeaderNote: data.tteLeaderNote ? String(data.tteLeaderNote) : undefined,
          checkedDocsPattern: data.checkedDocsPattern
            ? String(data.checkedDocsPattern)
            : undefined,
          verifiedDocsCount:
            typeof data.verifiedDocsCount === 'number' ? data.verifiedDocsCount : undefined,
          totalDocsCount:
            typeof data.totalDocsCount === 'number' ? data.totalDocsCount : undefined,
          uploadedDocsCount:
            typeof data.uploadedDocsCount === 'number' ? data.uploadedDocsCount : undefined,
          tteDocNumber: data.tteDocNumber ? String(data.tteDocNumber) : undefined,
          tteSignerName: data.tteSignerName ? String(data.tteSignerName) : undefined,
          tteSignerTitle: data.tteSignerTitle ? String(data.tteSignerTitle) : undefined,
          tteSignerNip: data.tteSignerNip ? String(data.tteSignerNip) : undefined,
          tteSignedAtLabel: data.tteSignedAtLabel ? String(data.tteSignedAtLabel) : undefined,
          submittedAtLabel: String(data.submittedAtLabel ?? ''),
          createdAt: (data.createdAt as Timestamp | null) ?? null,
          updatedAt: (data.updatedAt as Timestamp | null) ?? null,
        };
      });

      rows.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? Date.now();
        const tb = b.createdAt?.toMillis?.() ?? Date.now();
        return tb - ta;
      });
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateCloudTicketStatus(params: {
  ticketId: string;
  status: PtspTicketStatus;
  adminNote: string;
  tteLeaderNote?: string;
  tteDocNumber?: string;
  tteSignerName?: string;
  tteSignerTitle?: string;
  tteSignerNip?: string;
  tteSignedAtLabel?: string;
}): Promise<void> {
  const {
    ticketId,
    status,
    adminNote,
    tteLeaderNote,
    tteDocNumber,
    tteSignerName,
    tteSignerTitle,
    tteSignerNip,
    tteSignedAtLabel,
  } = params;
  const path = `ptspTickets/${ticketId}`;
  const cleanNote = clampStr(adminNote, 300);

  const payload: Record<string, unknown> = {
    status,
    adminNote: cleanNote,
    updatedAt: serverTimestamp(),
  };

  if (tteLeaderNote) payload.tteLeaderNote = clampStr(tteLeaderNote, 300);
  if (status === 'TTE Sah (Selesai)') {
    if (tteDocNumber) payload.tteDocNumber = clampStr(tteDocNumber, 100);
    if (tteSignerName) payload.tteSignerName = clampStr(tteSignerName, 120);
    if (tteSignerTitle) payload.tteSignerTitle = clampStr(tteSignerTitle, 120);
    if (tteSignerNip) payload.tteSignerNip = clampStr(tteSignerNip, 30);
    payload.tteSignedAtLabel = clampStr(tteSignedAtLabel, 50, formatTodayLabel());
  }

  try {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken();
    }
    await updateDoc(doc(db, 'ptspTickets', ticketId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function ptspVerifyAndDispatchTicket(params: {
  ticketId: string;
  status:
    | 'Diproses Verifikasi'
    | 'Diterima PTSP'
    | 'Ditolak PTSP'
    | 'Disposisi ke Seksi'
    | 'Menunggu Berkas'
    | 'Perlu Revisi';
  adminNote: string;
  operatorName: string;
  dispatchedToSeksi?: boolean;
  dispatchedUnitId?: SeksiUnitId;
  dispatchedUnitTitle?: string;
  checkedDocsPattern?: string;
  verifiedDocsCount?: number;
  totalDocsCount?: number;
}): Promise<void> {
  const {
    ticketId,
    status,
    adminNote,
    operatorName,
    dispatchedToSeksi,
    dispatchedUnitId,
    dispatchedUnitTitle,
    checkedDocsPattern,
    verifiedDocsCount,
    totalDocsCount,
  } = params;
  const path = `ptspTickets/${ticketId}`;
  const payload: Record<string, unknown> = {
    status,
    adminNote: clampStr(adminNote, 300),
    updatedAt: serverTimestamp(),
  };

  if (status === 'Disposisi ke Seksi' || (dispatchedToSeksi && dispatchedUnitId)) {
    const safeUnitId: SeksiUnitId =
      dispatchedUnitId && VALID_SEKSI_UNITS.has(dispatchedUnitId)
        ? dispatchedUnitId
        : 'sekretariat';
    payload.dispatchedToSeksi = true;
    payload.dispatchedUnitId = safeUnitId;
    payload.dispatchedUnitTitle = clampStr(dispatchedUnitTitle || safeUnitId, 100, safeUnitId);
    payload.dispatchedBy = clampStr(operatorName, 160, 'Operator PTSP');
  } else if (status === 'Ditolak PTSP') {
    payload.dispatchedToSeksi = false;
  }

  if (typeof checkedDocsPattern === 'string' && /^[01]{0,40}$/.test(checkedDocsPattern)) {
    payload.checkedDocsPattern = checkedDocsPattern;
  }
  if (
    typeof totalDocsCount === 'number' &&
    Number.isFinite(totalDocsCount) &&
    totalDocsCount >= 0
  ) {
    const safeTotal = Math.max(0, Math.min(40, Math.trunc(totalDocsCount)));
    payload.totalDocsCount = safeTotal;
    if (
      typeof verifiedDocsCount === 'number' &&
      Number.isFinite(verifiedDocsCount) &&
      verifiedDocsCount >= 0
    ) {
      payload.verifiedDocsCount = Math.max(0, Math.min(safeTotal, Math.trunc(verifiedDocsCount)));
    }
  } else if (
    typeof verifiedDocsCount === 'number' &&
    Number.isFinite(verifiedDocsCount) &&
    verifiedDocsCount >= 0
  ) {
    payload.verifiedDocsCount = Math.max(0, Math.min(40, Math.trunc(verifiedDocsCount)));
  }

  try {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken();
    }
    try {
      await updateDoc(doc(db, 'ptspTickets', ticketId), payload);
    } catch (firstErr) {
      const msg = firstErr instanceof Error ? firstErr.message : String(firstErr ?? '');
      if (
        auth.currentUser &&
        (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied'))
      ) {
        await auth.currentUser.getIdToken(true);
        await updateDoc(doc(db, 'ptspTickets', ticketId), payload);
      } else {
        throw firstErr;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function seksiInspectAndSendTteTicket(params: {
  ticketId: string;
  status: 'Telaah Seksi' | 'Perlu Revisi' | 'Menunggu Berkas' | 'Siap TTE';
  seksiReviewer: string;
  adminNote: string;
  tteLeaderNote?: string;
  checkedDocsPattern: string;
  verifiedDocsCount: number;
  totalDocsCount: number;
}): Promise<void> {
  const {
    ticketId,
    status,
    seksiReviewer,
    adminNote,
    tteLeaderNote,
    checkedDocsPattern,
    verifiedDocsCount,
    totalDocsCount,
  } = params;
  const path = `ptspTickets/${ticketId}`;
  const safeTotal = Math.max(0, Math.min(40, Math.trunc(totalDocsCount)));
  const safeVerified = Math.max(0, Math.min(safeTotal, Math.trunc(verifiedDocsCount)));
  const safePattern = /^[01]{0,40}$/.test(checkedDocsPattern) ? checkedDocsPattern : '';

  const payload: Record<string, unknown> = {
    status,
    seksiReviewer: clampStr(seksiReviewer, 160, 'Operator Seksi'),
    adminNote: clampStr(adminNote, 300),
    checkedDocsPattern: safePattern,
    verifiedDocsCount: safeVerified,
    totalDocsCount: safeTotal,
    updatedAt: serverTimestamp(),
  };

  if (status === 'Siap TTE') {
    payload.tteSentToLeader = true;
    payload.tteLeaderNote = clampStr(
      tteLeaderNote || adminNote,
      300,
      'Kelengkapan berkas telah diperiksa Seksi dan diteruskan ke Pimpinan untuk TTE.'
    );
  }

  try {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken();
    }
    try {
      await updateDoc(doc(db, 'ptspTickets', ticketId), payload);
    } catch (firstErr) {
      const msg = firstErr instanceof Error ? firstErr.message : String(firstErr ?? '');
      if (
        auth.currentUser &&
        (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied'))
      ) {
        await auth.currentUser.getIdToken(true);
        await updateDoc(doc(db, 'ptspTickets', ticketId), payload);
      } else {
        throw firstErr;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function pimpinanEndorseTteTicket(params: {
  ticketId: string;
  status: 'TTE Sah (Selesai)' | 'Perlu Revisi' | 'Siap TTE';
  adminNote: string;
  tteLeaderNote?: string;
  tteDocNumber?: string;
  tteSignerName?: string;
  tteSignerTitle?: string;
  tteSignerNip?: string;
  tteSignedAtLabel?: string;
}): Promise<void> {
  const {
    ticketId,
    status,
    adminNote,
    tteLeaderNote,
    tteDocNumber,
    tteSignerName,
    tteSignerTitle,
    tteSignerNip,
    tteSignedAtLabel,
  } = params;
  const path = `ptspTickets/${ticketId}`;
  const payload: Record<string, unknown> = {
    status,
    adminNote: clampStr(adminNote, 300),
    tteLeaderNote: clampStr(
      tteLeaderNote || adminNote,
      300,
      status === 'TTE Sah (Selesai)'
        ? 'Dokumen telah disahkan dengan Tanda Tangan Elektronik (TTE) Pimpinan.'
        : 'Dikembalikan oleh Pimpinan untuk perbaikan berkas.'
    ),
    updatedAt: serverTimestamp(),
  };

  if (status === 'TTE Sah (Selesai)') {
    if (tteDocNumber) payload.tteDocNumber = clampStr(tteDocNumber, 100);
    if (tteSignerName) payload.tteSignerName = clampStr(tteSignerName, 120);
    if (tteSignerTitle) payload.tteSignerTitle = clampStr(tteSignerTitle, 120);
    if (tteSignerNip) payload.tteSignerNip = clampStr(tteSignerNip, 30);
    payload.tteSignedAtLabel = clampStr(tteSignedAtLabel, 50, formatTodayLabel());
  }

  try {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken();
    }
    await updateDoc(doc(db, 'ptspTickets', ticketId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/* -------------------------------------------------------------------------- */
/* NEWS ARTICLES CRUD (SUPER ADMIN CMS)                                       */
/* -------------------------------------------------------------------------- */

function titleToSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 180) || `berita-${Date.now()}`
  );
}

export function subscribeNewsArticles(
  onData: (rows: CloudNewsArticleRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'newsArticles';
  const q = query(collection(db, path), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: CloudNewsArticleRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        const sectionRaw = String(data.section ?? 'kegiatan');
        const section: NewsArticle['section'] =
          sectionRaw === 'hari-ini' ||
          sectionRaw === 'nasional' ||
          sectionRaw === 'terpopuler'
            ? sectionRaw
            : 'kegiatan';

        const reactionsRaw =
          data.reactions && typeof data.reactions === 'object'
            ? (data.reactions as Record<string, unknown>)
            : {};

        return {
          id: String(data.id ?? d.id),
          slug: String(data.slug ?? d.id),
          title: String(data.title ?? ''),
          category: String(data.category ?? 'Kegiatan'),
          section,
          date: String(data.date ?? formatTodayLabel()),
          readTime: String(data.readTime ?? '3 menit baca'),
          views: Number(data.views ?? 0),
          image: String(data.image ?? ''),
          excerpt: String(data.excerpt ?? ''),
          content: Array.isArray(data.content)
            ? data.content.map((c) => String(c)).filter(Boolean)
            : [],
          reactions: {
            bermanfaat: Number(reactionsRaw.bermanfaat ?? 0),
            informatif: Number(reactionsRaw.informatif ?? 0),
            inspiratif: Number(reactionsRaw.inspiratif ?? 0),
          },
          isDeleted: Boolean(data.isDeleted),
          createdBy: String(data.createdBy ?? ADMIN_EMAIL),
          createdAt: (data.createdAt as Timestamp | null) ?? null,
          updatedAt: (data.updatedAt as Timestamp | null) ?? null,
        };
      });

      rows.sort((a, b) => {
        const ta = a.updatedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
        const tb = b.updatedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveNewsArticle(params: {
  adminUser: User;
  id?: string;
  title: string;
  category: string;
  section: NewsArticle['section'];
  date?: string;
  readTime?: string;
  views?: number;
  image: string;
  excerpt: string;
  content: string[];
  reactions?: NewsArticle['reactions'];
}): Promise<string> {
  const {
    adminUser,
    id,
    title,
    category,
    section,
    date,
    readTime,
    views = 1,
    image,
    excerpt,
    content,
    reactions,
  } = params;

  const cleanTitle = clampStr(title, 220);
  const cleanCategory = clampStr(category, 80, 'Kegiatan');
  const cleanExcerpt = clampStr(excerpt, 600);
  const cleanImage = clampStr(image, 500);
  const cleanContent = content.map((p) => p.trim()).filter(Boolean).slice(0, 40);

  if (cleanTitle.length < 3 || cleanExcerpt.length < 5 || cleanContent.length === 0 || !cleanImage) {
    throw new Error('Judul, ringkasan, gambar, dan minimal 1 paragraf isi berita wajib diisi.');
  }
  if (
    !isSafeHttpOrRelativeUrl(cleanImage) ||
    !(cleanImage.startsWith('https://') || cleanImage.startsWith('/') || cleanImage.startsWith('assets/'))
  ) {
    throw new Error('URL gambar berita harus menggunakan tautan HTTPS yang valid atau aset lokal portal.');
  }

  const articleId =
    id && /^[a-zA-Z0-9_\-]+$/.test(id)
      ? id
      : `news_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const docRef = doc(db, 'newsArticles', articleId);
  const path = `newsArticles/${articleId}`;
  const adminEmail = clampStr(adminUser.email, 160, ADMIN_EMAIL);

  const estimatedMinutes = Math.max(2, Math.ceil(cleanContent.join(' ').split(/\s+/).length / 160));
  const cleanReadTime = clampStr(readTime, 40, `${estimatedMinutes} menit baca`);
  const cleanDate = clampStr(date, 60, formatTodayLabel());
  const safeViews = Math.max(0, Math.min(10000000, Math.round(views)));
  const safeReactions = {
    bermanfaat: Math.max(0, Math.round(reactions?.bermanfaat ?? 0)),
    informatif: Math.max(0, Math.round(reactions?.informatif ?? 0)),
    inspiratif: Math.max(0, Math.round(reactions?.inspiratif ?? 0)),
  };

  try {
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        id: articleId,
        slug: titleToSlug(cleanTitle),
        title: cleanTitle,
        category: cleanCategory,
        section,
        date: cleanDate,
        readTime: cleanReadTime,
        views: safeViews,
        image: cleanImage,
        excerpt: cleanExcerpt,
        content: cleanContent,
        reactions: safeReactions,
        isDeleted: false,
        createdBy: adminEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        slug: titleToSlug(cleanTitle),
        title: cleanTitle,
        category: cleanCategory,
        section,
        date: cleanDate,
        readTime: cleanReadTime,
        views: safeViews,
        image: cleanImage,
        excerpt: cleanExcerpt,
        content: cleanContent,
        reactions: safeReactions,
        isDeleted: false,
        updatedAt: serverTimestamp(),
      });
    }
    return articleId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteNewsArticle(params: {
  adminUser: User;
  article: NewsArticle;
  isBuiltIn: boolean;
}): Promise<void> {
  const { adminUser, article, isBuiltIn } = params;
  const path = `newsArticles/${article.id}`;
  const docRef = doc(db, 'newsArticles', article.id);

  try {
    if (!isBuiltIn) {
      await deleteDoc(docRef);
      return;
    }

    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        id: article.id,
        slug: clampStr(article.slug, 200, titleToSlug(article.title)),
        title: clampStr(article.title, 220),
        category: clampStr(article.category, 80, 'Kegiatan'),
        section: article.section,
        date: clampStr(article.date, 60, formatTodayLabel()),
        readTime: clampStr(article.readTime, 40, '3 menit baca'),
        views: Math.max(0, Math.round(article.views ?? 0)),
        image: clampStr(article.image, 500),
        excerpt: clampStr(article.excerpt, 600),
        content: article.content.length > 0 ? article.content.slice(0, 40) : ['-'],
        reactions: article.reactions || { bermanfaat: 0, informatif: 0, inspiratif: 0 },
        isDeleted: true,
        createdBy: clampStr(adminUser.email, 160, ADMIN_EMAIL),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function restoreBuiltInNewsArticle(articleId: string): Promise<void> {
  const path = `newsArticles/${articleId}`;
  try {
    await deleteDoc(doc(db, 'newsArticles', articleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function mergeNewsArticles(
  staticArticles: NewsArticle[],
  cloudArticles: CloudNewsArticleRecord[]
): NewsArticle[] {
  const staticIds = new Set(staticArticles.map((a) => a.id));
  const cloudById = new Map(cloudArticles.map((c) => [c.id, c]));

  const customCloud = cloudArticles.filter(
    (c) => !staticIds.has(c.id) && !c.isDeleted
  );

  const mergedStatic: NewsArticle[] = [];
  for (const s of staticArticles) {
    const override = cloudById.get(s.id);
    if (override) {
      if (override.isDeleted) continue;
      mergedStatic.push({
        id: override.id,
        slug: override.slug,
        title: override.title,
        category: override.category,
        section: override.section,
        date: override.date,
        readTime: override.readTime,
        views: override.views,
        image: override.image || s.image,
        excerpt: override.excerpt,
        content: override.content.length > 0 ? override.content : s.content,
        reactions: override.reactions || s.reactions,
      });
    } else {
      mergedStatic.push(s);
    }
  }

  return [...customCloud, ...mergedStatic];
}

/* -------------------------------------------------------------------------- */
/* MENU INFORMASI DATA (SUPER ADMIN & OPERATOR SEKSI SESUAI KEWENANGAN)       */
/* -------------------------------------------------------------------------- */

function safeParseJsonArray<T>(raw: unknown): T[] | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : undefined;
  } catch {
    return undefined;
  }
}

export function subscribeInfoSectionData(
  onData: (rows: CloudInfoSectionRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'infoSectionData';
  const q = query(collection(db, path), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: CloudInfoSectionRecord[] = [];
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const rawUnit = String(data.seksiUnitId ?? '');
        if (!VALID_SEKSI_UNITS.has(rawUnit as SeksiUnitId)) return;

        const parsedRows = safeParseJsonArray<string[]>(data.rowsJson) || [];
        const cleanRows = parsedRows.map((r) =>
          Array.isArray(r) ? r.map((cell) => String(cell ?? '')) : []
        );
        const cleanCols = Array.isArray(data.columns)
          ? data.columns.map((c) => String(c ?? '')).filter(Boolean).slice(0, 20)
          : ['No', 'Uraian'];

        records.push({
          id: String(data.id ?? d.id),
          seksiUnitId: rawUnit as SeksiUnitId,
          infoUnitId: String(data.infoUnitId ?? rawUnit),
          sectionId: String(data.sectionId ?? ''),
          sectionLabel: String(data.sectionLabel ?? ''),
          title: String(data.title ?? ''),
          subtitle: String(data.subtitle ?? ''),
          updatedAtLabel: String(data.updatedAtLabel ?? ''),
          columns: cleanCols.length > 0 ? cleanCols : ['No', 'Uraian'],
          rows: cleanRows,
          rowCount: typeof data.rowCount === 'number' ? data.rowCount : cleanRows.length,
          metrics: safeParseJsonArray<InfoMetric>(data.metricsJson),
          orgNodes: safeParseJsonArray<InfoOrgNode>(data.orgNodesJson),
          footnote: data.footnote ? String(data.footnote) : undefined,
          updatedByName: String(data.updatedByName ?? 'Admin'),
          createdAt: (data.createdAt as Timestamp | null) ?? null,
          updatedAt: (data.updatedAt as Timestamp | null) ?? null,
        });
      });

      onData(records);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveInfoSectionData(params: {
  seksiUnitId: SeksiUnitId;
  infoUnitId: string;
  sectionId: string;
  sectionLabel: string;
  title: string;
  subtitle?: string;
  updatedAtLabel?: string;
  columns: string[];
  rows: string[][];
  metrics?: InfoMetric[];
  orgNodes?: InfoOrgNode[];
  footnote?: string;
  updatedByName: string;
}): Promise<string> {
  const {
    seksiUnitId,
    infoUnitId,
    sectionId,
    sectionLabel,
    title,
    subtitle,
    updatedAtLabel,
    columns,
    rows,
    metrics,
    orgNodes,
    footnote,
    updatedByName,
  } = params;

  if (!VALID_SEKSI_UNITS.has(seksiUnitId)) {
    throw new Error('ID unit seksi tidak valid.');
  }

  const safeSectionId = sectionId.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const safeInfoUnitId = infoUnitId.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  if (!safeSectionId || !safeInfoUnitId) {
    throw new Error('Identitas subbagian informasi tidak valid.');
  }

  const docId = `${seksiUnitId}__${safeSectionId}`;
  const path = `infoSectionData/${docId}`;
  const docRef = doc(db, 'infoSectionData', docId);

  const cleanColumns = columns
    .map((c) => clampStr(c, 80))
    .filter(Boolean)
    .slice(0, 20);
  if (cleanColumns.length === 0) {
    cleanColumns.push('No', 'Uraian');
  }

  const normalizedRows = rows.slice(0, 5000).map((row) =>
    cleanColumns.map((_, idx) => clampStr(row[idx] ?? '', 300))
  );

  const rowsJson = JSON.stringify(normalizedRows);
  if (rowsJson.length > 395000) {
    throw new Error(
      'Ukuran data tabel melebihi batas dokumen Firestore (maksimal ~395 KB). Kurangi jumlah baris atau ringkas teks.'
    );
  }

  const payload: Record<string, unknown> = {
    id: docId,
    seksiUnitId,
    infoUnitId: clampStr(safeInfoUnitId, 60),
    sectionId: clampStr(safeSectionId, 80),
    sectionLabel: clampStr(sectionLabel, 100, 'Data Informasi'),
    title: clampStr(title, 200, 'Data Satuan Kerja'),
    subtitle: clampStr(subtitle, 400),
    updatedAtLabel: clampStr(
      updatedAtLabel,
      80,
      `Diperbarui · ${formatTodayLabel()}`
    ),
    columns: cleanColumns,
    rowsJson,
    rowCount: normalizedRows.length,
    updatedByName: clampStr(updatedByName, 120, 'Operator Seksi'),
    updatedAt: serverTimestamp(),
  };

  if (metrics && metrics.length > 0) {
    const cleanMetrics = metrics.slice(0, 6).map((m) => ({
      label: clampStr(m.label, 80),
      value: clampStr(m.value, 80),
      ...(m.note ? { note: clampStr(m.note, 140) } : {}),
    }));
    const metricsJson = JSON.stringify(cleanMetrics);
    if (metricsJson.length <= 20000) {
      payload.metricsJson = metricsJson;
    }
  }

  if (orgNodes && orgNodes.length > 0) {
    const cleanOrg = orgNodes.slice(0, 80).map((n) => ({
      role: clampStr(n.role, 120),
      name: clampStr(n.name, 120),
      level:
        n.level === 'pimpinan' || n.level === 'koordinator'
          ? n.level
          : ('pelaksana' as const),
      ...(n.nip ? { nip: clampStr(n.nip, 30) } : {}),
      ...(n.division ? { division: clampStr(n.division, 200) } : {}),
    }));
    const orgNodesJson = JSON.stringify(cleanOrg);
    if (orgNodesJson.length <= 60000) {
      payload.orgNodesJson = orgNodesJson;
    }
  }

  if (footnote && footnote.trim()) {
    payload.footnote = clampStr(footnote, 400);
  }

  try {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken();
    }
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } else {
      const updatePayload: Record<string, unknown> = { ...payload };
      delete updatePayload.id;
      delete updatePayload.seksiUnitId;
      delete updatePayload.infoUnitId;
      delete updatePayload.sectionId;
      try {
        await updateDoc(docRef, updatePayload);
      } catch (firstErr) {
        const msg = firstErr instanceof Error ? firstErr.message : String(firstErr ?? '');
        if (
          auth.currentUser &&
          (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied'))
        ) {
          await auth.currentUser.getIdToken(true);
          await updateDoc(docRef, updatePayload);
        } else {
          throw firstErr;
        }
      }
    }
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function resetInfoSectionData(
  seksiUnitId: SeksiUnitId,
  sectionId: string
): Promise<void> {
  const safeSectionId = sectionId.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const docId = `${seksiUnitId}__${safeSectionId}`;
  const path = `infoSectionData/${docId}`;
  try {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken();
    }
    await deleteDoc(doc(db, 'infoSectionData', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function mergeInformasiUnits(
  baseUnits: InformasiUnitConfig[],
  cloudRecords: CloudInfoSectionRecord[]
): InformasiUnitConfig[] {
  if (cloudRecords.length === 0) return baseUnits;
  const byKey = new Map<string, CloudInfoSectionRecord>();
  cloudRecords.forEach((rec) => {
    byKey.set(`${rec.seksiUnitId}__${rec.sectionId}`, rec);
  });

  return baseUnits.map((unit) => ({
    ...unit,
    sections: unit.sections.map((sec): InfoSection => {
      const cloud = byKey.get(`${unit.seksiUnitId}__${sec.id}`);
      if (!cloud) return sec;
      return {
        ...sec,
        label: cloud.sectionLabel || sec.label,
        title: cloud.title || sec.title,
        subtitle: cloud.subtitle || sec.subtitle,
        updatedAt: cloud.updatedAtLabel || sec.updatedAt,
        metrics:
          cloud.metrics && cloud.metrics.length > 0 ? cloud.metrics : sec.metrics,
        columns: cloud.orgNodes ? sec.columns : cloud.columns,
        rows: cloud.orgNodes ? sec.rows : cloud.rows,
        orgNodes:
          cloud.orgNodes && cloud.orgNodes.length > 0
            ? cloud.orgNodes
            : sec.orgNodes,
        footnote: cloud.footnote ?? sec.footnote,
      };
    }),
  }));
}

/* -------------------------------------------------------------------------- */
/* GOOGLE-VERIFIED VISITOR PROFILE & E-PENGADUAN / SPAN LAPOR / SKM           */
/* -------------------------------------------------------------------------- */

export function subscribeMyUserProfile(
  uid: string,
  onData: (profile: UserProfileRecord | null) => void,
  onError: (err: unknown) => void
): () => void {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const data = snap.data();
      onData({
        uid: String(data.uid ?? snap.id),
        displayName: String(data.displayName ?? ''),
        email: String(data.email ?? ''),
        photoURL: data.photoURL ? String(data.photoURL) : undefined,
        createdAt: (data.createdAt as Timestamp | null) ?? null,
        lastLoginAt: (data.lastLoginAt as Timestamp | null) ?? null,
      });
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export interface CloudPublicComplaintRecord {
  id: string;
  ticketNo: string;
  userId: string;
  userEmail: string;
  category: string;
  subject: string;
  details: string;
  reporter: string;
  contact?: string;
  anonymous: boolean;
  submittedAtLabel: string;
  status: 'Diterima Inspektorat Internal';
  createdAt?: Timestamp | null;
}

export interface CloudSpanLaporRecord {
  id: string;
  trackingNo: string;
  userId: string;
  userEmail: string;
  userName: string;
  reportType: 'Pengaduan' | 'Aspirasi' | 'Permintaan Informasi';
  topic: string;
  summary: string;
  smsDraft: string;
  submittedAtLabel: string;
  createdAt?: Timestamp | null;
}

export interface CloudSkmResponseRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  unitTitle: string;
  ageGroup: string;
  education: string;
  scores: Record<'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6' | 'U7' | 'U8' | 'U9', number>;
  ikmScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  feedback?: string;
  submittedAtLabel: string;
  createdAt?: Timestamp | null;
}

function assertRegisteredGoogleVisitor(user: User | null): User {
  if (!user || !isGoogleAuthUser(user) || !user.email) {
    throw new Error(
      'Hanya akun pengunjung yang sudah masuk dan terdaftar dengan Akun Google pada web Kemenag Murung Raya yang dapat mengirim.'
    );
  }
  return user;
}

export async function submitCloudPublicComplaint(params: {
  user: User;
  category: string;
  subject: string;
  details: string;
  reporter: string;
  contact?: string;
  anonymous: boolean;
}): Promise<CloudPublicComplaintRecord> {
  const validUser = assertRegisteredGoogleVisitor(params.user);
  await upsertGoogleUserProfile(validUser);

  const num = Math.floor(1000 + Math.random() * 9000);
  const id = `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const ticketNo = `ADUAN-MURA-2026-${num}`;
  const submittedAtLabel = formatTodayLabel();
  const path = `publicComplaints/${id}`;

  const cleanCategory = clampStr(params.category, 100, 'Pelayanan PTSP / KUA');
  const cleanSubject = clampStr(params.subject, 200);
  const cleanDetails = clampStr(params.details, 2000);
  const cleanReporter = params.anonymous
    ? 'Anonim (Dirahasiakan)'
    : clampStr(params.reporter || validUser.displayName || validUser.email?.split('@')[0], 120, 'Pengunjung Google');
  const cleanContact = params.anonymous ? '' : clampStr(params.contact, 120);

  if (cleanSubject.length < 3 || cleanDetails.length < 15) {
    throw new Error('Mohon isi judul laporan (min. 3 huruf) dan kronologi pengaduan minimal 15 karakter.');
  }

  const payload: Record<string, unknown> = {
    id,
    ticketNo,
    userId: validUser.uid,
    userEmail: validUser.email,
    category: cleanCategory,
    subject: cleanSubject,
    details: cleanDetails,
    reporter: cleanReporter,
    anonymous: Boolean(params.anonymous),
    submittedAtLabel,
    status: 'Diterima Inspektorat Internal',
    createdAt: serverTimestamp(),
  };

  if (cleanContact) {
    payload.contact = cleanContact;
  }

  try {
    await validUser.getIdToken();
    await setDoc(doc(db, 'publicComplaints', id), payload);
    return {
      id,
      ticketNo,
      userId: validUser.uid,
      userEmail: validUser.email ?? '',
      category: cleanCategory,
      subject: cleanSubject,
      details: cleanDetails,
      reporter: cleanReporter,
      contact: cleanContact || undefined,
      anonymous: Boolean(params.anonymous),
      submittedAtLabel,
      status: 'Diterima Inspektorat Internal',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribePublicComplaints(
  user: User,
  isAdmin: boolean,
  onData: (rows: CloudPublicComplaintRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'publicComplaints';
  const colRef = collection(db, path);
  const q = isAdmin
    ? query(colRef, limit(100))
    : query(colRef, where('userId', '==', user.uid), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: CloudPublicComplaintRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id ?? d.id),
          ticketNo: String(data.ticketNo ?? ''),
          userId: String(data.userId ?? ''),
          userEmail: String(data.userEmail ?? ''),
          category: String(data.category ?? ''),
          subject: String(data.subject ?? ''),
          details: String(data.details ?? ''),
          reporter: String(data.reporter ?? ''),
          contact: data.contact ? String(data.contact) : undefined,
          anonymous: Boolean(data.anonymous),
          submittedAtLabel: String(data.submittedAtLabel ?? ''),
          status: 'Diterima Inspektorat Internal',
          createdAt: (data.createdAt as Timestamp | null) ?? null,
        };
      });
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now()));
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function submitCloudSpanLapor(params: {
  user: User;
  reportType: 'Pengaduan' | 'Aspirasi' | 'Permintaan Informasi';
  topic: string;
  summary: string;
}): Promise<CloudSpanLaporRecord> {
  const validUser = assertRegisteredGoogleVisitor(params.user);
  await upsertGoogleUserProfile(validUser);

  const num = Math.floor(1000 + Math.random() * 9000);
  const id = `span_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const trackingNo = `SPAN-MURA-2026-${num}`;
  const submittedAtLabel = formatTodayLabel();
  const path = `spanLaporSubmissions/${id}`;

  const cleanTopic = clampStr(params.topic, 120, 'Pelayanan Publik PTSP');
  const cleanSummary = clampStr(params.summary, 2000);
  if (cleanSummary.length < 15) {
    throw new Error('Mohon tuliskan ringkasan laporan SPAN LAPOR minimal 15 karakter.');
  }

  const userName = clampStr(
    validUser.displayName || validUser.email?.split('@')[0],
    120,
    'Pengunjung Google'
  );
  const smsDraft = clampStr(
    `KEMENAG #MurungRaya [${params.reportType} - ${cleanTopic}] ${cleanSummary}`,
    2200
  );

  const payload = {
    id,
    trackingNo,
    userId: validUser.uid,
    userEmail: validUser.email,
    userName,
    reportType: params.reportType,
    topic: cleanTopic,
    summary: cleanSummary,
    smsDraft,
    submittedAtLabel,
    createdAt: serverTimestamp(),
  };

  try {
    await validUser.getIdToken();
    await setDoc(doc(db, 'spanLaporSubmissions', id), payload);
    return {
      id,
      trackingNo,
      userId: validUser.uid,
      userEmail: validUser.email ?? '',
      userName,
      reportType: params.reportType,
      topic: cleanTopic,
      summary: cleanSummary,
      smsDraft,
      submittedAtLabel,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeSpanLaporSubmissions(
  user: User,
  isAdmin: boolean,
  onData: (rows: CloudSpanLaporRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'spanLaporSubmissions';
  const colRef = collection(db, path);
  const q = isAdmin
    ? query(colRef, limit(100))
    : query(colRef, where('userId', '==', user.uid), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: CloudSpanLaporRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        const rt = String(data.reportType ?? 'Pengaduan');
        const reportType: CloudSpanLaporRecord['reportType'] =
          rt === 'Aspirasi' || rt === 'Permintaan Informasi' ? rt : 'Pengaduan';
        return {
          id: String(data.id ?? d.id),
          trackingNo: String(data.trackingNo ?? ''),
          userId: String(data.userId ?? ''),
          userEmail: String(data.userEmail ?? ''),
          userName: String(data.userName ?? ''),
          reportType,
          topic: String(data.topic ?? ''),
          summary: String(data.summary ?? ''),
          smsDraft: String(data.smsDraft ?? ''),
          submittedAtLabel: String(data.submittedAtLabel ?? ''),
          createdAt: (data.createdAt as Timestamp | null) ?? null,
        };
      });
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now()));
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function submitCloudSkmResponse(params: {
  user: User;
  unitTitle: string;
  ageGroup: string;
  education: string;
  scores: Record<string, number>;
  ikmScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  feedback?: string;
}): Promise<CloudSkmResponseRecord> {
  const validUser = assertRegisteredGoogleVisitor(params.user);
  await upsertGoogleUserProfile(validUser);

  const id = `skm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const submittedAtLabel = formatTodayLabel();
  const path = `skmResponses/${id}`;

  const clampRating = (val: unknown): number => {
    const num = Math.round(Number(val ?? 4));
    if (Number.isNaN(num)) return 4;
    return Math.min(4, Math.max(1, num));
  };

  const normalizedScores = {
    U1: clampRating(params.scores.U1),
    U2: clampRating(params.scores.U2),
    U3: clampRating(params.scores.U3),
    U4: clampRating(params.scores.U4),
    U5: clampRating(params.scores.U5),
    U6: clampRating(params.scores.U6),
    U7: clampRating(params.scores.U7),
    U8: clampRating(params.scores.U8),
    U9: clampRating(params.scores.U9),
  };

  const userName = clampStr(
    validUser.displayName || validUser.email?.split('@')[0],
    120,
    'Pengunjung Google'
  );
  const cleanUnit = clampStr(params.unitTitle, 120, 'Sekretariat / Subbag TU');
  const cleanAge = clampStr(params.ageGroup, 40, '26–40 Tahun');
  const cleanEdu = clampStr(params.education, 40, 'S1 / D-IV');
  const cleanFeedback = clampStr(params.feedback, 1000);
  const clampedIkm = Math.min(100, Math.max(25, Number(params.ikmScore.toFixed(2))));

  const payload: Record<string, unknown> = {
    id,
    userId: validUser.uid,
    userEmail: validUser.email,
    userName,
    unitTitle: cleanUnit,
    ageGroup: cleanAge,
    education: cleanEdu,
    scores: normalizedScores,
    ikmScore: clampedIkm,
    grade: params.grade,
    submittedAtLabel,
    createdAt: serverTimestamp(),
  };

  if (cleanFeedback) {
    payload.feedback = cleanFeedback;
  }

  try {
    await validUser.getIdToken();
    await setDoc(doc(db, 'skmResponses', id), payload);
    return {
      id,
      userId: validUser.uid,
      userEmail: validUser.email ?? '',
      userName,
      unitTitle: cleanUnit,
      ageGroup: cleanAge,
      education: cleanEdu,
      scores: normalizedScores,
      ikmScore: clampedIkm,
      grade: params.grade,
      feedback: cleanFeedback || undefined,
      submittedAtLabel,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeSkmResponses(
  user: User,
  isAdmin: boolean,
  onData: (rows: CloudSkmResponseRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'skmResponses';
  const colRef = collection(db, path);
  const q = isAdmin
    ? query(colRef, limit(100))
    : query(colRef, where('userId', '==', user.uid), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: CloudSkmResponseRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        const rawScores = (data.scores as Record<string, unknown>) || {};
        const gradeRaw = String(data.grade ?? 'A');
        const grade: CloudSkmResponseRecord['grade'] =
          gradeRaw === 'B' || gradeRaw === 'C' || gradeRaw === 'D' ? gradeRaw : 'A';
        return {
          id: String(data.id ?? d.id),
          userId: String(data.userId ?? ''),
          userEmail: String(data.userEmail ?? ''),
          userName: String(data.userName ?? ''),
          unitTitle: String(data.unitTitle ?? ''),
          ageGroup: String(data.ageGroup ?? ''),
          education: String(data.education ?? ''),
          scores: {
            U1: Number(rawScores.U1 ?? 4),
            U2: Number(rawScores.U2 ?? 4),
            U3: Number(rawScores.U3 ?? 4),
            U4: Number(rawScores.U4 ?? 4),
            U5: Number(rawScores.U5 ?? 4),
            U6: Number(rawScores.U6 ?? 4),
            U7: Number(rawScores.U7 ?? 4),
            U8: Number(rawScores.U8 ?? 4),
            U9: Number(rawScores.U9 ?? 4),
          },
          ikmScore: Number(data.ikmScore ?? 100),
          grade,
          feedback: data.feedback ? String(data.feedback) : undefined,
          submittedAtLabel: String(data.submittedAtLabel ?? ''),
          createdAt: (data.createdAt as Timestamp | null) ?? null,
        };
      });
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now()));
      onData(rows);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}


