import { deleteApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

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
  status: 'active' | 'revoked';
  verifiedBy: string;
  verifiedAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

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
  status: 'Diproses Verifikasi' | 'Menunggu Berkas' | 'Selesai';
  adminNote?: string;
  submittedAtLabel: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
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

export function mapFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  const msg = error instanceof Error ? error.message : String(error ?? '');

  if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
    return 'Login NIP & Password memerlukan pengaktifan metode "Email/Password" di Firebase Console (Authentication > Sign-in method). Silakan hubungi Admin untuk mengaktifkannya.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'NIP atau Password yang Anda masukkan salah, atau NIP belum terdaftar.';
  }
  if (code === 'auth/email-already-in-use') {
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

export async function signInWithGoogleAndRecord(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;
  await upsertGoogleUserProfile(user);
  return user;
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
}): Promise<{ uid: string; email: string }> {
  const { adminUser, fullName, nip, password, jabatan, unitKerja, unitCategory } = params;
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
      adminNote: 'Akun pegawai NIP didaftarkan dan diverifikasi langsung oleh Admin PTSP.',
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

export async function upsertGoogleUserProfile(
  user: User,
  preferredDisplayName?: string
): Promise<void> {
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
    const snap = await getDoc(userRef);
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

function mapVerifiedEmployee(uid: string, data: Record<string, unknown>): VerifiedEmployeeRecord {
  return {
    uid: String(data.uid ?? uid),
    email: String(data.email ?? ''),
    fullName: String(data.fullName ?? ''),
    nip: String(data.nip ?? ''),
    jabatan: String(data.jabatan ?? ''),
    unitKerja: String(data.unitKerja ?? ''),
    unitCategory: normalizeUnitCategory(data.unitCategory),
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
  adminNote?: string;
}): Promise<void> {
  const { adminUser, targetUid, email, fullName, nip, jabatan, unitKerja, unitCategory, adminNote } =
    params;
  const adminEmail = clampStr(adminUser.email, 160);
  const empPath = `verifiedEmployees/${targetUid}`;
  const empRef = doc(db, 'verifiedEmployees', targetUid);
  const reqRef = doc(db, 'employeeRequests', targetUid);
  const cleanNip = clampStr(nip.replace(/[^0-9A-Za-z\-\s]/g, ''), 30);

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
        status: 'active',
        verifiedBy: adminEmail,
        updatedAt: serverTimestamp(),
      });
    }

    const reqSnap = await getDoc(reqRef);
    if (reqSnap.exists()) {
      const note = clampStr(adminNote, 300, 'Disetujui Admin PTSP Kemenag Kab. Murung Raya.');
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
    submittedAtLabel,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const cleanInst = clampStr(institution, 160);
  const cleanNip = clampStr(nip, 30);
  const cleanNotes = clampStr(notes, 1000);
  if (cleanInst) payload.institution = cleanInst;
  if (cleanNip) payload.nip = cleanNip;
  if (cleanNotes) payload.notes = cleanNotes;

  try {
    await setDoc(doc(db, 'ptspTickets', id), payload);
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
    submittedAtLabel,
    createdAt: null,
    updatedAt: null,
  };
}

export function subscribePtspTickets(
  user: User,
  isAdmin: boolean,
  onData: (tickets: CloudPtspTicketRecord[]) => void,
  onError: (err: unknown) => void
): () => void {
  const path = 'ptspTickets';
  const colRef = collection(db, path);
  const q = isAdmin
    ? query(colRef, limit(100))
    : query(colRef, where('userId', '==', user.uid), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: CloudPtspTicketRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        const statusRaw = String(data.status ?? 'Diproses Verifikasi');
        const status: CloudPtspTicketRecord['status'] =
          statusRaw === 'Menunggu Berkas' || statusRaw === 'Selesai'
            ? statusRaw
            : 'Diproses Verifikasi';
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
  status: 'Diproses Verifikasi' | 'Menunggu Berkas' | 'Selesai';
  adminNote: string;
}): Promise<void> {
  const { ticketId, status, adminNote } = params;
  const path = `ptspTickets/${ticketId}`;
  const cleanNote = clampStr(adminNote, 300);

  try {
    await updateDoc(doc(db, 'ptspTickets', ticketId), {
      status,
      adminNote: cleanNote,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
