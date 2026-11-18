import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  ADMIN_EMAIL,
  auth,
  isEligibleSessionUser,
  isNipEmployeeEmail,
  mapFirebaseAuthError,
  registerEmployeeNipRequest,
  signInEmployeeWithNip,
  signInWithGoogleAndRecord,
  signOutGoogle,
  subscribeAllEmployeeRequests,
  subscribeMyEmployeeRequest,
  subscribeMyVerifiedEmployee,
  subscribePtspTickets,
  upsertGoogleUserProfile,
  type AccountTier,
  type CloudPtspTicketRecord,
  type EmployeeRequestRecord,
  type EmployeeUnitCategory,
  type VerifiedEmployeeRecord,
} from '@/src/firebase';

export interface PortalNotification {
  id: string;
  signature: string;
  kind: 'ticket' | 'employee' | 'admin';
  badge: string;
  tone: 'emerald' | 'amber' | 'sky' | 'rose' | 'indigo';
  title: string;
  message: string;
  timestampMs: number;
  timeLabel: string;
  read: boolean;
  actionView: 'layanan';
  targetUnitId?: string;
}

interface AuthRoleContextValue {
  user: User | null;
  isEligibleUser: boolean;
  isNipSession: boolean;
  authLoading: boolean;
  authError: string;
  isAdmin: boolean;
  myEmployeeRequest: EmployeeRequestRecord | null;
  myVerifiedEmployee: VerifiedEmployeeRecord | null;
  isVerifiedEmployee: boolean;
  isVerifiedKuaEmployee: boolean;
  accountTier: AccountTier | 'tamu';
  loginModalOpen: boolean;
  loginModalTab: 'google' | 'pegawai';
  openLoginModal: (tab?: 'google' | 'pegawai') => void;
  closeLoginModal: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signInWithNip: (nip: string, password: string) => Promise<User | null>;
  registerWithNip: (params: {
    fullName: string;
    nip: string;
    password: string;
    jabatan: string;
    unitKerja: string;
    unitCategory: EmployeeUnitCategory;
  }) => Promise<User | null>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  notifications: PortalNotification[];
  unreadCount: number;
  markNotificationRead: (signature: string) => void;
  markAllNotificationsRead: () => void;
}

const AuthRoleContext = createContext<AuthRoleContextValue | null>(null);

function formatRelativeTimeId(ms: number): string {
  if (!ms) return 'Baru saja';
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return new Date(ms).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function loadReadSignatures(uid: string): Record<string, true> {
  try {
    const raw = localStorage.getItem(`kemenag_mura_notif_read_v1_${uid}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, true>) : {};
  } catch {
    return {};
  }
}

function saveReadSignatures(uid: string, map: Record<string, true>) {
  try {
    localStorage.setItem(`kemenag_mura_notif_read_v1_${uid}`, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

export function AuthRoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>('');
  const [myEmployeeRequest, setMyEmployeeRequest] = useState<EmployeeRequestRecord | null>(null);
  const [myVerifiedEmployee, setMyVerifiedEmployee] = useState<VerifiedEmployeeRecord | null>(null);
  const [myOrAllTickets, setMyOrAllTickets] = useState<CloudPtspTicketRecord[]>([]);
  const [adminPendingRequests, setAdminPendingRequests] = useState<EmployeeRequestRecord[]>([]);
  const [readMap, setReadMap] = useState<Record<string, true>>({});

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [loginModalTab, setLoginModalTab] = useState<'google' | 'pegawai'>('google');

  const isEligibleUser = isEligibleSessionUser(user);
  const isNipSession = isNipEmployeeEmail(user?.email);

  const isAdmin = Boolean(user?.email && user.email === ADMIN_EMAIL && user.emailVerified);
  const isVerifiedEmployee = Boolean(
    isAdmin || (isEligibleUser && myVerifiedEmployee?.status === 'active')
  );
  const isVerifiedKuaEmployee = Boolean(
    isAdmin ||
      (isEligibleUser &&
        myVerifiedEmployee?.status === 'active' &&
        myVerifiedEmployee.unitCategory === 'kua_kecamatan')
  );

  const accountTier: AccountTier | 'tamu' = !user
    ? 'tamu'
    : isAdmin
    ? 'admin'
    : isVerifiedEmployee
    ? 'pegawai'
    : 'masyarakat';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setReadMap(loadReadSignatures(currentUser.uid));
        if (isEligibleSessionUser(currentUser)) {
          void upsertGoogleUserProfile(currentUser).catch(() => {
            // handled inside firebase.ts
          });
        }
      } else {
        setReadMap({});
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !isEligibleUser) {
      setMyEmployeeRequest(null);
      setMyVerifiedEmployee(null);
      setMyOrAllTickets([]);
      setAdminPendingRequests([]);
      return;
    }

    const unsubReq = subscribeMyEmployeeRequest(
      user.uid,
      (req) => setMyEmployeeRequest(req),
      () => {
        // handled inside firebase.ts
      }
    );

    const unsubEmp = subscribeMyVerifiedEmployee(
      user.uid,
      (emp) => setMyVerifiedEmployee(emp),
      () => {
        // handled inside firebase.ts
      }
    );

    const unsubTickets = subscribePtspTickets(
      user,
      isAdmin,
      (rows) => setMyOrAllTickets(rows),
      () => {
        // handled inside firebase.ts
      }
    );

    let unsubAdminReqs: (() => void) | null = null;
    if (isAdmin) {
      unsubAdminReqs = subscribeAllEmployeeRequests(
        (rows) => setAdminPendingRequests(rows),
        () => {
          // handled inside firebase.ts
        }
      );
    } else {
      setAdminPendingRequests([]);
    }

    return () => {
      unsubReq();
      unsubEmp();
      unsubTickets();
      if (unsubAdminReqs) unsubAdminReqs();
    };
  }, [user, isEligibleUser, isAdmin]);

  const openLoginModal = (tab: 'google' | 'pegawai' = 'google') => {
    setAuthError('');
    setLoginModalTab(tab);
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthError('');
    try {
      const loggedIn = await signInWithGoogleAndRecord();
      setLoginModalOpen(false);
      return loggedIn;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk dengan Akun Google.';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('Gagal masuk dengan Akun Google. Pastikan pop-up diizinkan pada browser Anda.');
      }
      return null;
    }
  };

  const signInWithNip = async (nip: string, password: string): Promise<User | null> => {
    setAuthError('');
    try {
      const loggedIn = await signInEmployeeWithNip(nip, password);
      setLoginModalOpen(false);
      return loggedIn;
    } catch (err) {
      const friendly = mapFirebaseAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  };

  const registerWithNip = async (params: {
    fullName: string;
    nip: string;
    password: string;
    jabatan: string;
    unitKerja: string;
    unitCategory: EmployeeUnitCategory;
  }): Promise<User | null> => {
    setAuthError('');
    try {
      const created = await registerEmployeeNipRequest(params);
      setLoginModalOpen(false);
      return created;
    } catch (err) {
      const friendly = mapFirebaseAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthError('');
    await signOutGoogle();
  };

  const notifications = useMemo<PortalNotification[]>(() => {
    if (!user || !isEligibleUser) return [];

    const items: PortalNotification[] = [];

    // 1. Ticket notifications
    myOrAllTickets.forEach((t) => {
      const ts = t.updatedAt?.toMillis?.() ?? t.createdAt?.toMillis?.() ?? Date.now();
      const timeLabel = formatRelativeTimeId(ts) || t.submittedAtLabel;
      const isMine = t.userId === user.uid;

      if (isAdmin && !isMine) {
        if (t.status === 'Diproses Verifikasi') {
          const sig = `adm_tk_${t.id}_${t.status}_${t.updatedAt?.toMillis?.() ?? 0}`;
          items.push({
            id: `adm-tk-${t.id}`,
            signature: sig,
            kind: 'admin',
            badge: 'Tiket Masuk Baru',
            tone: 'sky',
            title: `${t.ticketNo} · ${t.serviceTitle}`,
            message: `Pemohon: ${t.applicantName} (${t.unitTitle}). Segera tinjau di Panel Admin.`,
            timestampMs: ts,
            timeLabel,
            read: Boolean(readMap[sig]),
            actionView: 'layanan',
            targetUnitId: t.unitId,
          });
        }
        return;
      }

      const tone: PortalNotification['tone'] =
        t.status === 'Selesai' ? 'emerald' : t.status === 'Menunggu Berkas' ? 'amber' : 'sky';

      const defaultMsg =
        t.status === 'Selesai'
          ? `Permohonan ${t.serviceTitle} telah selesai diproses.`
          : t.status === 'Menunggu Berkas'
          ? `Mohon lengkapi berkas persyaratan untuk layanan ${t.serviceTitle}.`
          : `Berkas ${t.serviceTitle} sedang dalam antrean verifikasi petugas PTSP.`;

      const sig = `tk_${t.id}_${t.status}_${t.adminNote ?? ''}`;
      items.push({
        id: `tk-${t.id}`,
        signature: sig,
        kind: 'ticket',
        badge: t.status,
        tone,
        title: `${t.ticketNo} · ${t.serviceTitle}`,
        message: t.adminNote ? `Pesan Petugas: ${t.adminNote}` : defaultMsg,
        timestampMs: ts,
        timeLabel,
        read: Boolean(readMap[sig]),
        actionView: 'layanan',
        targetUnitId: t.unitId,
      });
    });

    // 2. Employee verification status notifications for user
    if (!isAdmin && myVerifiedEmployee) {
      const ts = myVerifiedEmployee.updatedAt?.toMillis?.() ?? myVerifiedEmployee.verifiedAt?.toMillis?.() ?? Date.now();
      const isActive = myVerifiedEmployee.status === 'active';
      const sig = `emp_ver_${myVerifiedEmployee.uid}_${myVerifiedEmployee.status}_${myVerifiedEmployee.unitCategory}_${ts}`;
      items.push({
        id: `emp-ver-${myVerifiedEmployee.uid}`,
        signature: sig,
        kind: 'employee',
        badge: isActive ? 'Akun Pegawai Aktif' : 'Akses Pegawai Nonaktif',
        tone: isActive ? 'indigo' : 'rose',
        title: isActive
          ? 'Verifikasi Pegawai Disetujui Admin'
          : 'Status Akses Kepegawaian Dicabut',
        message: isActive
          ? `NIP ${myVerifiedEmployee.nip} (${myVerifiedEmployee.unitKerja}) aktif. Akses menu Kepegawaian${
              myVerifiedEmployee.unitCategory === 'kua_kecamatan'
                ? ' & Tauliyah Wali Hakim KUA'
                : ''
            } terbuka.`
          : 'Akses kepegawaian Anda dinonaktifkan sementara oleh Admin PTSP.',
        timestampMs: ts,
        timeLabel: formatRelativeTimeId(ts),
        read: Boolean(readMap[sig]),
        actionView: 'layanan',
        targetUnitId: 'kepegawaian',
      });
    } else if (!isAdmin && myEmployeeRequest) {
      const ts = myEmployeeRequest.updatedAt?.toMillis?.() ?? myEmployeeRequest.createdAt?.toMillis?.() ?? Date.now();
      const sig = `emp_req_${myEmployeeRequest.uid}_${myEmployeeRequest.status}_${myEmployeeRequest.adminNote ?? ''}`;
      const statusLabel =
        myEmployeeRequest.status === 'pending'
          ? 'Menunggu Verifikasi'
          : myEmployeeRequest.status === 'rejected'
          ? 'Verifikasi Ditolak'
          : 'Disetujui';
      items.push({
        id: `emp-req-${myEmployeeRequest.uid}`,
        signature: sig,
        kind: 'employee',
        badge: statusLabel,
        tone: myEmployeeRequest.status === 'rejected' ? 'rose' : 'amber',
        title:
          myEmployeeRequest.status === 'rejected'
            ? 'Pengajuan Verifikasi Pegawai Ditolak Admin'
            : 'Pengajuan Verifikasi Pegawai Sedang Ditinjau',
        message:
          myEmployeeRequest.adminNote ||
          `Permohonan NIP ${myEmployeeRequest.nip} (${myEmployeeRequest.unitKerja}) sedang diperiksa oleh Admin PTSP.`,
        timestampMs: ts,
        timeLabel: formatRelativeTimeId(ts),
        read: Boolean(readMap[sig]),
        actionView: 'layanan',
        targetUnitId: 'kepegawaian',
      });
    }

    // 3. Admin notifications for pending employee requests
    if (isAdmin) {
      adminPendingRequests
        .filter((req) => req.status === 'pending')
        .forEach((req) => {
          const ts = req.updatedAt?.toMillis?.() ?? req.createdAt?.toMillis?.() ?? Date.now();
          const sig = `adm_emp_${req.uid}_${req.status}_${ts}`;
          items.push({
            id: `adm-emp-${req.uid}`,
            signature: sig,
            kind: 'admin',
            badge: 'Verifikasi Pegawai',
            tone: 'amber',
            title: `Permintaan Pegawai: ${req.fullName}`,
            message: `NIP ${req.nip} · ${req.unitKerja} menunggu persetujuan di Konsol Admin.`,
            timestampMs: ts,
            timeLabel: formatRelativeTimeId(ts),
            read: Boolean(readMap[sig]),
            actionView: 'layanan',
            targetUnitId: 'kepegawaian',
          });
        });
    }

    items.sort((a, b) => b.timestampMs - a.timestampMs);
    return items.slice(0, 20);
  }, [
    user,
    isEligibleUser,
    isAdmin,
    myOrAllTickets,
    myVerifiedEmployee,
    myEmployeeRequest,
    adminPendingRequests,
    readMap,
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markNotificationRead = (signature: string) => {
    if (!user) return;
    setReadMap((prev) => {
      if (prev[signature]) return prev;
      const next = { ...prev, [signature]: true as const };
      saveReadSignatures(user.uid, next);
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    if (!user) return;
    setReadMap((prev) => {
      const next = { ...prev };
      notifications.forEach((n) => {
        next[n.signature] = true;
      });
      saveReadSignatures(user.uid, next);
      return next;
    });
  };

  return (
    <AuthRoleContext.Provider
      value={{
        user,
        isEligibleUser,
        isNipSession,
        authLoading,
        authError,
        isAdmin,
        myEmployeeRequest,
        myVerifiedEmployee,
        isVerifiedEmployee,
        isVerifiedKuaEmployee,
        accountTier,
        loginModalOpen,
        loginModalTab,
        openLoginModal,
        closeLoginModal,
        signInWithGoogle,
        signInWithNip,
        registerWithNip,
        signOut,
        clearAuthError: () => setAuthError(''),
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
}

export function useAuthRole(): AuthRoleContextValue {
  const ctx = useContext(AuthRoleContext);
  if (!ctx) {
    throw new Error('useAuthRole must be used inside AuthRoleProvider');
  }
  return ctx;
}
