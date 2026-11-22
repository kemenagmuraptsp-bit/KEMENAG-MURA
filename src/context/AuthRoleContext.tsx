import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  ADMIN_EMAIL,
  auth,
  completeGoogleRedirectSignIn,
  isEligibleSessionUser,
  isGoogleAuthUser,
  isNipEmployeeEmail,
  mapFirebaseAuthError,
  mergeInformasiUnits,
  mergeNewsArticles,
  registerEmployeeNipRequest,
  registerPublicWithEmail,
  signInEmployeeWithNip,
  signInOperatorWithNip,
  signInPublicWithEmail,
  signInSuperAdminWithEmail,
  signInWithGoogleAndRecord,
  signOutGoogle,
  subscribeAllEmployeeRequests,
  subscribeInfoSectionData,
  subscribeMyEmployeeRequest,
  subscribeMyUserProfile,
  subscribeMyVerifiedEmployee,
  subscribeNewsArticles,
  subscribePtspTickets,
  upsertGoogleUserProfile,
  type AccountTier,
  type CloudInfoSectionRecord,
  type CloudNewsArticleRecord,
  type CloudPtspTicketRecord,
  type EmployeeOperatorRole,
  type EmployeeRequestRecord,
  type EmployeeUnitCategory,
  type OperatorUnitAssignment,
  type TicketSubscriptionScope,
  type UserProfileRecord,
  type VerifiedEmployeeRecord,
} from '@/src/firebase';
import { NEWS_ARTICLES } from '@/src/data/kemenagData';
import { INFORMASI_UNITS, type InformasiUnitConfig } from '@/src/data/informasiData';
import type { NewsArticle } from '@/src/types';

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
  operatorRole: EmployeeOperatorRole;
  isOperatorPtsp: boolean;
  isOperatorSeksi: boolean;
  isPimpinan: boolean;
  assignedUnitId?: OperatorUnitAssignment;
  assignedUnitTitle?: string;
  myEmployeeRequest: EmployeeRequestRecord | null;
  myVerifiedEmployee: VerifiedEmployeeRecord | null;
  isVerifiedEmployee: boolean;
  isVerifiedKuaEmployee: boolean;
  isMasyarakatLogin: boolean;
  hasGoogleProvider: boolean;
  myUserProfile: UserProfileRecord | null;
  isRegisteredGoogleVisitor: boolean;
  accountTier: AccountTier | 'tamu';
  newsArticles: NewsArticle[];
  cloudNewsArticles: CloudNewsArticleRecord[];
  infoUnits: InformasiUnitConfig[];
  cloudInfoSections: CloudInfoSectionRecord[];
  loginModalOpen: boolean;
  loginModalTab: 'google' | 'pegawai';
  loginModalPrompt: string;
  openLoginModal: (tab?: 'google' | 'pegawai', promptMessage?: string) => void;
  closeLoginModal: () => void;
  superAdminModalOpen: boolean;
  openSuperAdminModal: () => void;
  closeSuperAdminModal: () => void;
  adminConsoleTriggerCount: number;
  requestOpenAdminConsole: () => void;
  operatorModalOpen: boolean;
  openOperatorModal: () => void;
  closeOperatorModal: () => void;
  operatorConsoleTriggerCount: number;
  requestOpenOperatorConsole: () => void;
  serviceCatalogRedirectCount: number;
  signInWithGoogle: (options?: { skipRedirect?: boolean }) => Promise<User | null>;
  signInPublicWithEmail: (email: string, password: string) => Promise<User | null>;
  registerPublicWithEmail: (params: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signInSuperAdminWithEmail: (email: string, password: string) => Promise<User | null>;
  signInOperatorWithNip: (nip: string, password: string) => Promise<User | null>;
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
  const [myUserProfile, setMyUserProfile] = useState<UserProfileRecord | null>(null);
  const [myOrAllTickets, setMyOrAllTickets] = useState<CloudPtspTicketRecord[]>([]);
  const [adminPendingRequests, setAdminPendingRequests] = useState<EmployeeRequestRecord[]>([]);
  const [cloudNewsArticles, setCloudNewsArticles] = useState<CloudNewsArticleRecord[]>([]);
  const [cloudInfoSections, setCloudInfoSections] = useState<CloudInfoSectionRecord[]>([]);
  const [readMap, setReadMap] = useState<Record<string, true>>({});

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [loginModalTab, setLoginModalTab] = useState<'google' | 'pegawai'>('google');
  const [loginModalPrompt, setLoginModalPrompt] = useState<string>('');
  const [superAdminModalOpen, setSuperAdminModalOpen] = useState<boolean>(false);
  const [adminConsoleTriggerCount, setAdminConsoleTriggerCount] = useState<number>(0);
  const [operatorModalOpen, setOperatorModalOpen] = useState<boolean>(false);
  const [operatorConsoleTriggerCount, setOperatorConsoleTriggerCount] = useState<number>(0);
  const [serviceCatalogRedirectCount, setServiceCatalogRedirectCount] = useState<number>(0);

  const isEligibleUser = isEligibleSessionUser(user);
  const isNipSession = isNipEmployeeEmail(user?.email);
  const hasGoogleProvider = isGoogleAuthUser(user);

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

  const operatorRole: EmployeeOperatorRole =
    !isAdmin && isEligibleUser && myVerifiedEmployee?.status === 'active'
      ? myVerifiedEmployee.operatorRole || 'pegawai'
      : 'pegawai';

  const isOperatorPtsp = operatorRole === 'operator_ptsp';
  const isOperatorSeksi = operatorRole === 'operator_seksi';
  const isPimpinan = operatorRole === 'pimpinan';
  const assignedUnitId = isOperatorSeksi ? myVerifiedEmployee?.assignedUnitId : undefined;
  const assignedUnitTitle = isOperatorSeksi ? myVerifiedEmployee?.assignedUnitTitle : undefined;

  const isMasyarakatLogin = Boolean(
    user && !isAdmin && !isVerifiedEmployee && !isNipSession
  );

  const isRegisteredGoogleVisitor = Boolean(
    user && hasGoogleProvider && myUserProfile
  );

  const accountTier: AccountTier | 'tamu' = !user
    ? 'tamu'
    : isAdmin
    ? 'admin'
    : isVerifiedEmployee
    ? 'pegawai'
    : 'masyarakat';

  const newsArticles = useMemo(
    () => mergeNewsArticles(NEWS_ARTICLES, cloudNewsArticles),
    [cloudNewsArticles]
  );

  const infoUnits = useMemo(
    () => mergeInformasiUnits(INFORMASI_UNITS, cloudInfoSections),
    [cloudInfoSections]
  );

  useEffect(() => {
    const unsubNews = subscribeNewsArticles(
      (rows) => setCloudNewsArticles(rows),
      () => {
        // Fallback smoothly to static NEWS_ARTICLES on transient connectivity failure
      }
    );
    const unsubInfo = subscribeInfoSectionData(
      (rows) => setCloudInfoSections(rows),
      () => {
        // Fallback smoothly to default INFORMASI_UNITS on transient connectivity failure
      }
    );
    return () => {
      unsubNews();
      unsubInfo();
    };
  }, []);

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
    let cancelled = false;
    void completeGoogleRedirectSignIn()
      .then((redirectUser) => {
        if (cancelled || !redirectUser) return;
        setLoginModalOpen(false);
        if (redirectUser.email !== ADMIN_EMAIL) {
          setServiceCatalogRedirectCount((c) => c + 1);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : '';
        if (!msg.includes('popup-closed-by-user') && !msg.includes('cancelled-popup-request')) {
          setAuthError(mapFirebaseAuthError(err, 'google'));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user || !isEligibleUser) {
      setMyEmployeeRequest(null);
      setMyVerifiedEmployee(null);
      setMyUserProfile(null);
      setMyOrAllTickets([]);
      setAdminPendingRequests([]);
      return;
    }

    const unsubProfile = subscribeMyUserProfile(
      user.uid,
      (profile) => setMyUserProfile(profile),
      () => {
        // handled inside firebase.ts
      }
    );

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

    const ticketScope: TicketSubscriptionScope =
      isAdmin || isOperatorPtsp || isPimpinan
        ? { mode: 'all' }
        : isOperatorSeksi && assignedUnitId && assignedUnitId !== 'all'
        ? { mode: 'unit', unitId: assignedUnitId }
        : { mode: 'mine' };

    const unsubTickets = subscribePtspTickets(
      user,
      ticketScope,
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
      unsubProfile();
      unsubReq();
      unsubEmp();
      unsubTickets();
      if (unsubAdminReqs) unsubAdminReqs();
    };
  }, [user, isEligibleUser, isAdmin, isOperatorPtsp, isOperatorSeksi, isPimpinan, assignedUnitId]);

  const requestOpenAdminConsole = () => {
    setAdminConsoleTriggerCount((c) => c + 1);
  };

  const requestOpenOperatorConsole = () => {
    setOperatorConsoleTriggerCount((c) => c + 1);
  };

  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (typeof e.key !== 'string' || !e.key) return;
      const key = e.key.toLowerCase();
      const isCtrlAltAdmin = e.ctrlKey && e.altKey && !e.metaKey && (key === 'a' || key === 'k');
      const isAltShiftAdmin = e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && key === 'a';
      const isCtrlAltOperator = e.ctrlKey && e.altKey && !e.metaKey && key === 'z';

      if (isCtrlAltOperator) {
        e.preventDefault();
        if (!isAdmin && (isOperatorPtsp || isOperatorSeksi || isPimpinan)) {
          setOperatorModalOpen(false);
          setSuperAdminModalOpen(false);
          setLoginModalOpen(false);
          setOperatorConsoleTriggerCount((c) => c + 1);
        } else {
          setAuthError('');
          setLoginModalOpen(false);
          setSuperAdminModalOpen(false);
          setOperatorModalOpen((prev) => !prev);
        }
        return;
      }

      if (!isCtrlAltAdmin && !isAltShiftAdmin) return;

      e.preventDefault();
      if (isAdmin) {
        setSuperAdminModalOpen(false);
        setOperatorModalOpen(false);
        setLoginModalOpen(false);
        setAdminConsoleTriggerCount((c) => c + 1);
      } else {
        setAuthError('');
        setLoginModalOpen(false);
        setOperatorModalOpen(false);
        setSuperAdminModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [isAdmin, isOperatorPtsp, isOperatorSeksi, isPimpinan]);

  const openLoginModal = (tab: 'google' | 'pegawai' = 'google', promptMessage?: string) => {
    setAuthError('');
    setSuperAdminModalOpen(false);
    setOperatorModalOpen(false);
    setLoginModalTab(tab);
    if (promptMessage !== undefined) {
      setLoginModalPrompt(promptMessage);
    } else if (!loginModalOpen) {
      setLoginModalPrompt('');
    }
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
    setLoginModalPrompt('');
  };

  const openSuperAdminModal = () => {
    setAuthError('');
    setLoginModalOpen(false);
    setOperatorModalOpen(false);
    setSuperAdminModalOpen(true);
  };

  const closeSuperAdminModal = () => {
    setSuperAdminModalOpen(false);
  };

  const openOperatorModal = () => {
    setAuthError('');
    setLoginModalOpen(false);
    setSuperAdminModalOpen(false);
    setOperatorModalOpen(true);
  };

  const closeOperatorModal = () => {
    setOperatorModalOpen(false);
  };

  const signInWithGoogle = async (options?: { skipRedirect?: boolean }): Promise<User | null> => {
    setAuthError('');
    try {
      const loggedIn = await signInWithGoogleAndRecord();
      if (!loggedIn) {
        return null;
      }
      setLoginModalOpen(false);
      if (!options?.skipRedirect && loggedIn.email !== ADMIN_EMAIL) {
        setServiceCatalogRedirectCount((c) => c + 1);
      }
      return loggedIn;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('popup-closed-by-user') && !msg.includes('cancelled-popup-request')) {
        setAuthError(mapFirebaseAuthError(err, 'google'));
      }
      return null;
    }
  };

  const handleSignInPublicWithEmail = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    setAuthError('');
    try {
      const loggedIn = await signInPublicWithEmail(email, password);
      setLoginModalOpen(false);
      if (loggedIn && loggedIn.email !== ADMIN_EMAIL) {
        setServiceCatalogRedirectCount((c) => c + 1);
      }
      return loggedIn;
    } catch (err) {
      const friendly = mapFirebaseAuthError(err, 'masyarakat');
      setAuthError(friendly);
      throw new Error(friendly);
    }
  };

  const handleRegisterPublicWithEmail = async (params: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<void> => {
    setAuthError('');
    try {
      await registerPublicWithEmail(params);
    } catch (err) {
      const friendly = mapFirebaseAuthError(err, 'masyarakat');
      setAuthError(friendly);
      throw new Error(friendly);
    }
  };

  const handleSignInSuperAdminWithEmail = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    setAuthError('');
    try {
      const loggedIn = await signInSuperAdminWithEmail(email, password);
      setSuperAdminModalOpen(false);
      setAdminConsoleTriggerCount((c) => c + 1);
      return loggedIn;
    } catch (err) {
      const friendly = mapFirebaseAuthError(err, 'admin');
      setAuthError(friendly);
      throw new Error(friendly);
    }
  };

  const handleSignInOperatorWithNip = async (
    nip: string,
    password: string
  ): Promise<User | null> => {
    setAuthError('');
    try {
      const result = await signInOperatorWithNip(nip, password);
      setOperatorModalOpen(false);
      setOperatorConsoleTriggerCount((c) => c + 1);
      return result.user;
    } catch (err) {
      const friendly = mapFirebaseAuthError(err, 'nip');
      setAuthError(friendly);
      throw new Error(friendly);
    }
  };

  const signInWithNip = async (nip: string, password: string): Promise<User | null> => {
    setAuthError('');
    try {
      const loggedIn = await signInEmployeeWithNip(nip, password);
      setLoginModalOpen(false);
      if (loggedIn) {
        setServiceCatalogRedirectCount((c) => c + 1);
      }
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
      if (created) {
        setServiceCatalogRedirectCount((c) => c + 1);
      }
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

    const isTicketOperator = isAdmin || isOperatorPtsp || isOperatorSeksi || isPimpinan;

    // 1. Ticket notifications
    myOrAllTickets.forEach((t) => {
      const ts = t.updatedAt?.toMillis?.() ?? t.createdAt?.toMillis?.() ?? Date.now();
      const timeLabel = formatRelativeTimeId(ts) || t.submittedAtLabel;
      const isMine = t.userId === user.uid;

      if (isTicketOperator && !isMine) {
        if ((isAdmin || isOperatorPtsp) && t.status === 'Diproses Verifikasi') {
          const sig = `adm_tk_${t.id}_${t.status}_${t.updatedAt?.toMillis?.() ?? 0}`;
          items.push({
            id: `adm-tk-${t.id}`,
            signature: sig,
            kind: 'admin',
            badge: 'Tiket Masuk Baru',
            tone: 'sky',
            title: `${t.ticketNo} · ${t.serviceTitle}`,
            message: `Pemohon: ${t.applicantName} (${t.unitTitle}). Segera verifikasi di ${
              isAdmin ? 'Konsol Super Admin' : 'Konsol Operator PTSP'
            }.`,
            timestampMs: ts,
            timeLabel,
            read: Boolean(readMap[sig]),
            actionView: 'layanan',
            targetUnitId: t.unitId,
          });
        } else if (isOperatorSeksi && t.status === 'Disposisi ke Seksi') {
          const sig = `sek_tk_${t.id}_${t.status}_${t.updatedAt?.toMillis?.() ?? 0}`;
          items.push({
            id: `sek-tk-${t.id}`,
            signature: sig,
            kind: 'admin',
            badge: 'Disposisi Seksi Baru',
            tone: 'indigo',
            title: `${t.ticketNo} · ${t.serviceTitle}`,
            message: `Dikirim oleh Operator PTSP (${t.dispatchedBy || 'PTSP'}). Periksa kelengkapan berkas di Konsol Operator Seksi.`,
            timestampMs: ts,
            timeLabel,
            read: Boolean(readMap[sig]),
            actionView: 'layanan',
            targetUnitId: t.dispatchedUnitId || t.unitId,
          });
        } else if ((isAdmin || isPimpinan) && t.status === 'Siap TTE') {
          const sig = `adm_tte_${t.id}_${t.status}_${t.updatedAt?.toMillis?.() ?? 0}`;
          items.push({
            id: `adm-tte-${t.id}`,
            signature: sig,
            kind: 'admin',
            badge: 'Siap TTE Pimpinan',
            tone: 'indigo',
            title: `${t.ticketNo} · ${t.serviceTitle}`,
            message: `Berkas dinyatakan lengkap oleh ${t.dispatchedUnitTitle || t.unitTitle}. Menunggu pengesahan TTE Pimpinan.`,
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
        t.status === 'TTE Sah (Selesai)' || t.status === 'Selesai'
          ? 'emerald'
          : t.status === 'Ditolak PTSP'
          ? 'rose'
          : t.status === 'Perlu Revisi' || t.status === 'Menunggu Berkas'
          ? 'amber'
          : t.status === 'Siap TTE'
          ? 'indigo'
          : 'sky';

      const defaultMsg =
        t.status === 'TTE Sah (Selesai)' || t.status === 'Selesai'
          ? `Permohonan ${t.serviceTitle} telah selesai dan disahkan TTE.`
          : t.status === 'Ditolak PTSP'
          ? `Permohonan ${t.serviceTitle} ditolak oleh petugas PTSP.`
          : t.status === 'Diterima PTSP'
          ? `Tiket ${t.serviceTitle} telah diterima petugas PTSP dan siap didisposisikan.`
          : t.status === 'Disposisi ke Seksi'
          ? `Permohonan diteruskan ke ${t.dispatchedUnitTitle || t.unitTitle} untuk telaah berkas.`
          : t.status === 'Telaah Seksi'
          ? `Kelengkapan berkas sedang ditelaah oleh ${t.dispatchedUnitTitle || t.unitTitle}.`
          : t.status === 'Siap TTE'
          ? `Berkas usulan dinyatakan lengkap oleh Seksi dan dikirim ke Pimpinan untuk TTE.`
          : t.status === 'Perlu Revisi' || t.status === 'Menunggu Berkas'
          ? `Mohon lengkapi/perbaiki berkas persyaratan untuk layanan ${t.serviceTitle}.`
          : `Berkas ${t.serviceTitle} sedang dalam antrean verifikasi petugas PTSP.`;

      const sig = `tk_${t.id}_${t.status}_${t.adminNote ?? ''}`;
      items.push({
        id: `tk-${t.id}`,
        signature: sig,
        kind: 'ticket',
        badge: t.status === 'Diproses Verifikasi' ? 'Menunggu Verifikasi' : t.status,
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
      const sig = `emp_ver_${myVerifiedEmployee.uid}_${myVerifiedEmployee.status}_${myVerifiedEmployee.unitCategory}_${myVerifiedEmployee.operatorRole}_${ts}`;
      items.push({
        id: `emp-ver-${myVerifiedEmployee.uid}`,
        signature: sig,
        kind: 'employee',
        badge: isActive
          ? isPimpinan
            ? 'Akun Pimpinan Aktif'
            : isOperatorPtsp
            ? 'Operator PTSP Aktif'
            : isOperatorSeksi
            ? 'Operator Seksi Aktif'
            : 'Akun Pegawai Aktif'
          : 'Akses Pegawai Nonaktif',
        tone: isActive ? 'indigo' : 'rose',
        title: isActive
          ? isPimpinan
            ? 'Akun Pimpinan TTE Aktif'
            : isOperatorPtsp
            ? 'Akun Operator PTSP Aktif'
            : isOperatorSeksi
            ? `Akun Operator ${myVerifiedEmployee.assignedUnitTitle || 'Seksi'} Aktif`
            : 'Verifikasi Pegawai Disetujui Super Admin'
          : 'Status Akses Kepegawaian Dicabut',
        message: isActive
          ? `NIP ${myVerifiedEmployee.nip} (${myVerifiedEmployee.unitKerja}) aktif. Akses menu Kepegawaian${
              myVerifiedEmployee.unitCategory === 'kua_kecamatan'
                ? ' & Tauliyah Wali Hakim KUA'
                : ''
            }${
              isPimpinan
                ? ' & Konsol Pengesahan TTE Pimpinan'
                : isOperatorPtsp
                ? ' & Konsol Operator PTSP'
                : isOperatorSeksi
                ? ` & Konsol Operator ${myVerifiedEmployee.assignedUnitTitle || 'Seksi'}`
                : ''
            } terbuka.`
          : 'Akses kepegawaian Anda dinonaktifkan sementara oleh Super Admin.',
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
            ? 'Pengajuan Verifikasi Pegawai Ditolak Super Admin'
            : 'Pengajuan Verifikasi Pegawai Sedang Ditinjau',
        message:
          myEmployeeRequest.adminNote ||
          `Permohonan NIP ${myEmployeeRequest.nip} (${myEmployeeRequest.unitKerja}) sedang diperiksa oleh Super Admin.`,
        timestampMs: ts,
        timeLabel: formatRelativeTimeId(ts),
        read: Boolean(readMap[sig]),
        actionView: 'layanan',
        targetUnitId: 'kepegawaian',
      });
    }

    // 3. Super Admin notifications for pending employee requests
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
            message: `NIP ${req.nip} · ${req.unitKerja} menunggu persetujuan di Konsol Super Admin.`,
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
    isOperatorPtsp,
    isOperatorSeksi,
    isPimpinan,
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
        operatorRole,
        isOperatorPtsp,
        isOperatorSeksi,
        isPimpinan,
        assignedUnitId,
        assignedUnitTitle,
        myEmployeeRequest,
        myVerifiedEmployee,
        isVerifiedEmployee,
        isVerifiedKuaEmployee,
        isMasyarakatLogin,
        hasGoogleProvider,
        myUserProfile,
        isRegisteredGoogleVisitor,
        accountTier,
        newsArticles,
        cloudNewsArticles,
        infoUnits,
        cloudInfoSections,
        loginModalOpen,
        loginModalTab,
        loginModalPrompt,
        openLoginModal,
        closeLoginModal,
        superAdminModalOpen,
        openSuperAdminModal,
        closeSuperAdminModal,
        adminConsoleTriggerCount,
        requestOpenAdminConsole,
        operatorModalOpen,
        openOperatorModal,
        closeOperatorModal,
        operatorConsoleTriggerCount,
        requestOpenOperatorConsole,
        serviceCatalogRedirectCount,
        signInWithGoogle,
        signInPublicWithEmail: handleSignInPublicWithEmail,
        registerPublicWithEmail: handleRegisterPublicWithEmail,
        signInSuperAdminWithEmail: handleSignInSuperAdminWithEmail,
        signInOperatorWithNip: handleSignInOperatorWithNip,
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
