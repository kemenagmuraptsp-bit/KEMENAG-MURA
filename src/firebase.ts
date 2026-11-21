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
  if (code === 'auth/user-not-found') {
    if (context === 'admin') {
      return `Akun Super Admin (${ADMIN_EMAIL}) belum terdaftar di Firebase Auth. Klik "Aktivasi Akun Pertama Kali" atau tambahkan di Firebase Console.`;
    }
    if (context === 'masyarakat') {
      return 'Email ini belum terdaftar. Silakan pilih "Daftar Akun Baru" untuk membuat akun masyarakat.';
    }
    return 'NIP belum terdaftar atau tidak ditemukan.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    if (context === 'admin') {
      return `Kata sandi Super Admin salah, atau akun ${ADMIN_EMAIL} belum disetel kata sandinya di Firebase Auth.`;
    }
    if (context === 'masyarakat') {
      return 'Email atau kata sandi salah, atau akun tersebut belum terdaftar.';
    }
    return 'NIP atau Password yang Anda masukkan salah, atau NIP belum terdaftar.';
  }
  if (code === 'auth/email-already-in-use') {
    if (context === 'admin') {
      return `Akun ${ADMIN_EMAIL} sudah terdaftar di Firebase Auth. Gunakan "Kirim Tautan Atur/Reset Sandi" untuk menyetel ulang kata sandi.`;
    }
    if (context === 'masyarakat') {
      return 'Alamat email ini sudah terdaftar. Silakan langsung masuk menggunakan email dan kata sandi Anda.';
    }
    return 'NIP ini sudah terdaftar. Silakan langsung masuk menggunakan NIP dan Password Anda.';
  }
  if (code === 'auth/weak-password') {
    return 'Password terlalu lemah. Gunakan minimal 6 karakter.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Terlalu banyak percobaan login gagal. Silakan tunggu beberapa saat sebelum mencoba lagi.';
  }
  return msg || 'Terjadi kendala saat proses autentikasi. Silakan coba lagi.';
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
    throw new Error('Akun Super Admin menggunakan panel khusus (tekan Ctrl+Alt+A).');
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
    throw new Error('Email ini khusus untuk Super Admin.');
  }
  if (isNipEmployeeEmail(cleanEmail)) {
    throw new Error('Email domain pegawai silakan mendaftar melalui tab "Login Pegawai (NIP)".');
  }
  if (!password || password.length < 6) {
    throw new Error('Kata sandi wajib diisi minimal 6 karakter.');
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
    throw new Error('Gunakan panel Super Admin (Ctrl+Alt+A) untuk atur ulang kata sandi Super Admin.');
  }
  await sendPasswordResetEmail(auth, cleanEmail);
}

export async function signInSuperAdminWithEmail(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_EMAIL) {
    throw new Error(`Email Super Admin harus menggunakan akun resmi (${ADMIN_EMAIL}).`);
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
    throw new Error(`Aktivasi Super Admin hanya berlaku untuk akun resmi (${ADMIN_EMAIL}).`);
  }
  if (!password || password.length < 6) {
    throw new Error('Isi Kata Sandi minimal 6 karakter pada kolom password terlebih dahulu.');
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
  if (!password || password.length < 6) {
    throw new Error('Password wajib minimal 6 karakter.');
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

  if (cleanFullName.length < 2 || !password || password.length < 6) {
    throw new Error('Nama lengkap dan password awal (min. 6 karakter) wajib diisi.');
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
    const photoURL = clampStr(user.photoURL, 500);

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

async function buildPtspTicketUpdateDiag(
  ticketId: string,
  payload: Record<string, unknown>
): Promise<string> {
  try {
    if (!auth.currentUser) return '';
    const [empSnap, ticketSnap, tokenResult] = await Promise.all([
      getDocFromServer(doc(db, 'verifiedEmployees', auth.currentUser.uid)),
      getDocFromServer(doc(db, 'ptspTickets', ticketId)).catch(() => null),
      auth.currentUser.getIdTokenResult().catch(() => null),
    ]);
    const empData = empSnap.exists() ? empSnap.data() : null;
    const tData = ticketSnap && ticketSnap.exists() ? ticketSnap.data() : null;
    const merged: Record<string, unknown> | null = tData ? { ...tData, ...payload } : null;
    const allowedKeys = new Set([
      'id', 'ticketNo', 'userId', 'userEmail', 'accountTier', 'unitId', 'unitTitle',
      'subServiceId', 'serviceTitle', 'applicantName', 'phone', 'institution', 'nip',
      'notes', 'status', 'adminNote', 'dispatchedToSeksi', 'dispatchedUnitId',
      'dispatchedUnitTitle', 'dispatchedBy', 'seksiReviewer', 'tteSentToLeader',
      'tteLeaderNote', 'checkedDocsPattern', 'verifiedDocsCount', 'totalDocsCount',
      'uploadedDocsCount', 'tteDocNumber', 'tteSignerName', 'tteSignerTitle',
      'tteSignerNip', 'tteSignedAtLabel', 'submittedAtLabel', 'createdAt', 'updatedAt',
    ]);
    const requiredKeys = [
      'id', 'ticketNo', 'userId', 'userEmail', 'accountTier', 'unitId', 'unitTitle',
      'subServiceId', 'serviceTitle', 'applicantName', 'phone', 'status',
      'submittedAtLabel', 'createdAt', 'updatedAt',
    ];
    const seksiAllowedKeys = new Set([
      'status', 'adminNote', 'seksiReviewer', 'tteSentToLeader', 'tteLeaderNote',
      'checkedDocsPattern', 'verifiedDocsCount', 'totalDocsCount', 'updatedAt',
    ]);
    const ptspAllowedKeys = new Set([
      'status', 'adminNote', 'dispatchedToSeksi', 'dispatchedUnitId',
      'dispatchedUnitTitle', 'dispatchedBy', 'checkedDocsPattern',
      'verifiedDocsCount', 'totalDocsCount', 'updatedAt',
    ]);
    const changedKeys = tData
      ? Object.keys(payload).filter((k) => !(k in tData) || tData[k] !== payload[k])
      : Object.keys(payload);
    const isIdStr = (v: unknown) =>
      typeof v === 'string' && v.length >= 1 && v.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(v);

    const checks: Record<string, boolean> = merged
      ? {
          noMissingReq: requiredKeys.every((k) => k in merged),
          noExtraKeys: Object.keys(merged).every((k) => allowedKeys.has(k)),
          idOk: merged.id === ticketId && isIdStr(merged.id),
          ticketNoOk:
            typeof merged.ticketNo === 'string' &&
            merged.ticketNo.length >= 6 &&
            merged.ticketNo.length <= 40 &&
            /^[a-zA-Z0-9_\-]+$/.test(merged.ticketNo),
          userIdOk: isIdStr(merged.userId),
          userEmailOk:
            typeof merged.userEmail === 'string' &&
            merged.userEmail.length >= 3 &&
            merged.userEmail.length <= 160,
          unitTitleOk:
            typeof merged.unitTitle === 'string' &&
            merged.unitTitle.length >= 2 &&
            merged.unitTitle.length <= 100,
          serviceTitleOk:
            typeof merged.serviceTitle === 'string' &&
            merged.serviceTitle.length >= 2 &&
            merged.serviceTitle.length <= 200,
          applicantNameOk:
            typeof merged.applicantName === 'string' &&
            merged.applicantName.length >= 2 &&
            merged.applicantName.length <= 120,
          phoneOk:
            typeof merged.phone === 'string' &&
            merged.phone.length >= 6 &&
            merged.phone.length <= 30,
          instOk:
            !('institution' in merged) ||
            (typeof merged.institution === 'string' && merged.institution.length <= 160),
          nipOk:
            !('nip' in merged) ||
            (typeof merged.nip === 'string' && merged.nip.length <= 30),
          notesOk:
            !('notes' in merged) ||
            (typeof merged.notes === 'string' && merged.notes.length <= 1000),
          statusValid: VALID_TICKET_STATUSES.has(merged.status as PtspTicketStatus),
          adminNoteOk:
            !('adminNote' in merged) ||
            (typeof merged.adminNote === 'string' && merged.adminNote.length <= 300),
          dispTitleOk:
            !('dispatchedUnitTitle' in merged) ||
            (typeof merged.dispatchedUnitTitle === 'string' &&
              merged.dispatchedUnitTitle.length <= 100),
          dispByOk:
            !('dispatchedBy' in merged) ||
            (typeof merged.dispatchedBy === 'string' && merged.dispatchedBy.length <= 160),
          seksiRevOk:
            !('seksiReviewer' in merged) ||
            (typeof merged.seksiReviewer === 'string' && merged.seksiReviewer.length <= 160),
          tteBoolOk:
            !('tteSentToLeader' in merged) ||
            typeof merged.tteSentToLeader === 'boolean',
          tteNoteOk:
            !('tteLeaderNote' in merged) ||
            (typeof merged.tteLeaderNote === 'string' && merged.tteLeaderNote.length <= 300),
          patternOk:
            !('checkedDocsPattern' in merged) ||
            (typeof merged.checkedDocsPattern === 'string' &&
              merged.checkedDocsPattern.length <= 40 &&
              /^[01]{0,40}$/.test(merged.checkedDocsPattern)),
          verifiedIntOk:
            !('verifiedDocsCount' in merged) ||
            (typeof merged.verifiedDocsCount === 'number' &&
              merged.verifiedDocsCount >= 0 &&
              merged.verifiedDocsCount <= 40),
          totalIntOk:
            !('totalDocsCount' in merged) ||
            (typeof merged.totalDocsCount === 'number' &&
              merged.totalDocsCount >= 0 &&
              merged.totalDocsCount <= 40),
          uploadedDocsOk:
            !('uploadedDocsCount' in merged) ||
            (typeof merged.uploadedDocsCount === 'number' &&
              merged.uploadedDocsCount >= 0 &&
              merged.uploadedDocsCount <= 40),
          tteDocNumOk:
            !('tteDocNumber' in merged) ||
            (typeof merged.tteDocNumber === 'string' && merged.tteDocNumber.length <= 100),
          tteSignerNameOk:
            !('tteSignerName' in merged) ||
            (typeof merged.tteSignerName === 'string' && merged.tteSignerName.length <= 120),
          tteSignerTitleOk:
            !('tteSignerTitle' in merged) ||
            (typeof merged.tteSignerTitle === 'string' && merged.tteSignerTitle.length <= 120),
          tteSignerNipOk:
            !('tteSignerNip' in merged) ||
            (typeof merged.tteSignerNip === 'string' && merged.tteSignerNip.length <= 30),
          tteSignedAtOk:
            !('tteSignedAtLabel' in merged) ||
            (typeof merged.tteSignedAtLabel === 'string' && merged.tteSignedAtLabel.length <= 50),
          submittedAtOk:
            typeof merged.submittedAtLabel === 'string' &&
            merged.submittedAtLabel.length >= 4 &&
            merged.submittedAtLabel.length <= 50,
          accountTierOk:
            merged.accountTier === 'masyarakat' ||
            merged.accountTier === 'pegawai' ||
            merged.accountTier === 'admin',
          unitIdOk:
            typeof merged.unitId === 'string' &&
            merged.unitId.length >= 1 &&
            merged.unitId.length <= 40 &&
            /^[a-z0-9\-]+$/.test(merged.unitId),
          subServiceIdOk:
            typeof merged.subServiceId === 'string' &&
            merged.subServiceId.length >= 1 &&
            merged.subServiceId.length <= 60 &&
            /^[a-z0-9\-]+$/.test(merged.subServiceId),
          dispBoolOk:
            !('dispatchedToSeksi' in merged) ||
            typeof merged.dispatchedToSeksi === 'boolean',
          dispUnitOk:
            !('dispatchedUnitId' in merged) ||
            VALID_SEKSI_UNITS.has(merged.dispatchedUnitId as SeksiUnitId),
          createdAtIsTs: tData?.createdAt instanceof Timestamp,
          updatedAtIsTs: tData?.updatedAt instanceof Timestamp,
          seksiKeysOk: changedKeys.every((k) => seksiAllowedKeys.has(k)),
          ptspKeysOk: changedKeys.every((k) => ptspAllowedKeys.has(k)),
        }
      : {};

    const failedChecks = Object.entries(checks)
      .filter(([, ok]) => !ok)
      .map(([name]) => name);

    return ` | diag=${JSON.stringify({
      failedChecks,
      missingReq: merged ? requiredKeys.filter((k) => !(k in merged)) : null,
      extraKeys: merged ? Object.keys(merged).filter((k) => !allowedKeys.has(k)) : null,
      emp: {
        exists: empSnap.exists(),
        status: empData?.status ?? null,
        role: empData?.operatorRole ?? null,
        unit: empData?.assignedUnitId ?? null,
      },
      token: {
        email: tokenResult?.claims?.email ?? null,
        verified: tokenResult?.claims?.email_verified ?? null,
      },
      ticket: {
        exists: ticketSnap ? ticketSnap.exists() : null,
        status: tData?.status ?? null,
        dispatched: tData?.dispatchedToSeksi ?? null,
        dUnit: tData?.dispatchedUnitId ?? null,
        unitMatch:
          empData?.assignedUnitId && tData?.dispatchedUnitId
            ? empData.assignedUnitId === tData.dispatchedUnitId
            : null,
      },
      status: payload.status,
      changedKeys,
    })}`;
  } catch {
    return '';
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
    const diag = await buildPtspTicketUpdateDiag(ticketId, payload);
    const wrapped =
      error instanceof Error
        ? new Error(`${error.message}${diag}`)
        : new Error(`${String(error)}${diag}`);
    handleFirestoreError(wrapped, OperationType.UPDATE, path);
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
    const diag = await buildPtspTicketUpdateDiag(ticketId, payload);
    const wrapped =
      error instanceof Error
        ? new Error(`${error.message}${diag}`)
        : new Error(`${String(error)}${diag}`);
    handleFirestoreError(wrapped, OperationType.UPDATE, path);
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
    const diag = await buildPtspTicketUpdateDiag(ticketId, payload);
    const wrapped =
      error instanceof Error
        ? new Error(`${error.message}${diag}`)
        : new Error(`${String(error)}${diag}`);
    handleFirestoreError(wrapped, OperationType.UPDATE, path);
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


