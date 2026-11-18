import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Edit3,
  Image as ImageIcon,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Newspaper,
  PlusCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import {
  KUA_BRANCHES,
  NEWS_ARTICLES,
  OFFICIAL_NEWS_IMAGE_PRESETS,
  PTSP_UNIT_OPTIONS,
} from '@/src/data/kemenagData';
import type { NewsArticle } from '@/src/types';
import { SafeImage } from '@/src/components/SafeImage';
import {
  approveEmployeeVerification,
  deleteNewsArticle,
  deleteVerifiedEmployeeAccount,
  mapFirebaseAuthError,
  provisionEmployeeAccountByAdmin,
  rejectEmployeeVerification,
  restoreBuiltInNewsArticle,
  sanitizeNipDigits,
  saveNewsArticle,
  submitEmployeeVerificationRequest,
  subscribeAllEmployeeRequests,
  subscribeAllGoogleUsers,
  subscribeAllVerifiedEmployees,
  subscribePtspTickets,
  toggleVerifiedEmployeeStatus,
  updateCloudTicketStatus,
  updateVerifiedEmployeeCategory,
  updateVerifiedEmployeeDetails,
  type CloudPtspTicketRecord,
  type EmployeeOperatorRole,
  type EmployeeRequestRecord,
  type EmployeeUnitCategory,
  type OperatorUnitAssignment,
  type TicketSubscriptionScope,
  type UserProfileRecord,
  type VerifiedEmployeeRecord,
} from '@/src/firebase';

const UNIT_CATEGORY_LABELS: Record<EmployeeUnitCategory, string> = {
  kankemenag: 'Kantor Kemenag Kab. Murung Raya',
  kua_kecamatan: 'KUA Kecamatan',
  madrasah: 'Madrasah Negeri / Satker Pendidikan',
};

const OPERATOR_ROLE_LABELS: Record<EmployeeOperatorRole, string> = {
  pegawai: 'Pegawai Biasa',
  operator_ptsp: 'Operator PTSP',
  operator_seksi: 'Operator Seksi',
};

const NEWS_CATEGORIES = [
  'Kegiatan',
  'Sekretariat',
  'Bimas Islam',
  'Pendidikan Madrasah',
  'Bimas Hindu',
  'Bimas Kristen',
  'Penyelenggara Zakat & Wakaf',
  'Penyelenggara Hindu',
  'Nasional',
] as const;

const NEWS_SECTIONS: { value: NewsArticle['section']; label: string }[] = [
  { value: 'hari-ini', label: 'Berita Hari Ini (Utama)' },
  { value: 'kegiatan', label: 'Kegiatan Kantor & Daerah' },
  { value: 'nasional', label: 'Nasional' },
  { value: 'terpopuler', label: 'Terpopuler' },
];

function getTodayIndonesianDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getUnitTitleById(unitId: OperatorUnitAssignment | undefined): string {
  if (!unitId || unitId === 'all') return 'Semua Layanan PTSP';
  return PTSP_UNIT_OPTIONS.find((u) => u.id === unitId)?.title || unitId;
}

export function AccountAccessBanner({
  showAdminPanel,
  onToggleAdminPanel,
  showOperatorPanel,
  onToggleOperatorPanel,
}: {
  showAdminPanel: boolean;
  onToggleAdminPanel: () => void;
  showOperatorPanel?: boolean;
  onToggleOperatorPanel?: () => void;
}) {
  const {
    user,
    isNipSession,
    authLoading,
    authError,
    isAdmin,
    isOperatorPtsp,
    isOperatorSeksi,
    assignedUnitTitle,
    myVerifiedEmployee,
    isVerifiedEmployee,
    isVerifiedKuaEmployee,
    openLoginModal,
    signOut,
    clearAuthError,
  } = useAuthRole();

  const isAnyOperator = !isAdmin && (isOperatorPtsp || isOperatorSeksi);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-5 space-y-3 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isAdmin
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : isAnyOperator
                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                : isVerifiedEmployee
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                : user
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-5 h-5" />
            ) : isAnyOperator ? (
              <UserCog className="w-5 h-5" />
            ) : isVerifiedEmployee ? (
              <BadgeCheck className="w-5 h-5" />
            ) : user ? (
              <UserCheck className="w-5 h-5" />
            ) : (
              <Users className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                {authLoading
                  ? 'Memeriksa Sesi Akun...'
                  : isAdmin
                  ? 'Mode Super Admin Portal Kemenag Mura'
                  : isOperatorPtsp
                  ? 'Mode Operator PTSP (Seluruh Bidang Layanan)'
                  : isOperatorSeksi
                  ? `Mode Operator Seksi — ${assignedUnitTitle || 'Unit Teknis'}`
                  : isVerifiedKuaEmployee
                  ? 'Pegawai KUA Kecamatan Terverifikasi'
                  : isVerifiedEmployee
                  ? 'Pegawai Terverifikasi Kemenag Murung Raya'
                  : user && isNipSession
                  ? 'Akun NIP Terhubung — Menunggu Verifikasi Super Admin'
                  : user
                  ? 'Akun Google Terhubung (Masyarakat)'
                  : 'Mode Pengajuan Biasa (Masyarakat Umum)'}
              </span>
              {myVerifiedEmployee?.status === 'active' && !isAdmin && (
                <span className="text-[11px] font-mono-tabular font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  NIP {myVerifiedEmployee.nip}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isAdmin ? (
                <>
                  Login sebagai <strong className="font-semibold">{user?.email}</strong>. Anda
                  memiliki kewenangan penuh <strong>Super Admin</strong> untuk menambah, mengedit,
                  dan menghapus <strong>data berita</strong>, mengelola akun{' '}
                  <strong>Operator PTSP & Operator Seksi</strong>, memverifikasi pegawai, serta
                  memproses tiket PTSP.
                </>
              ) : isOperatorPtsp ? (
                <>
                  <strong className="font-semibold">
                    {myVerifiedEmployee?.fullName || user?.displayName}
                  </strong>{' '}
                  ({myVerifiedEmployee?.unitKerja}). Anda bertugas sebagai{' '}
                  <strong>Operator PTSP</strong> dengan akses memproses seluruh tiket layanan
                  masuk dan menu kepegawaian.
                </>
              ) : isOperatorSeksi ? (
                <>
                  <strong className="font-semibold">
                    {myVerifiedEmployee?.fullName || user?.displayName}
                  </strong>{' '}
                  ({myVerifiedEmployee?.unitKerja}). Anda bertugas sebagai{' '}
                  <strong>Operator Seksi ({assignedUnitTitle})</strong> untuk menindaklanjuti
                  tiket layanan bidang terkait.
                </>
              ) : isVerifiedKuaEmployee ? (
                <>
                  <strong className="font-semibold">
                    {myVerifiedEmployee?.fullName || user?.displayName}
                  </strong>{' '}
                  ({myVerifiedEmployee?.unitKerja}). Akses ke menu <strong>F. KEPEGAWAIAN</strong>{' '}
                  dan layanan khusus KUA Kecamatan (<strong>Tauliyah Wali Hakim</strong>) terbuka,
                  dan lonceng notifikasi aktif.
                </>
              ) : isVerifiedEmployee ? (
                <>
                  <strong className="font-semibold">
                    {myVerifiedEmployee?.fullName || user?.displayName}
                  </strong>{' '}
                  ({myVerifiedEmployee?.unitKerja}). Akses menu <strong>F. KEPEGAWAIAN</strong>{' '}
                  terbuka, riwayat tiket, dan lonceng notifikasi aktif di akun Anda.
                </>
              ) : user && isNipSession ? (
                <>
                  Terhubung dengan <strong className="font-semibold">NIP {user.email?.split('@')[0]}</strong>{' '}
                  ({user.displayName || 'Pegawai'}). Riwayat layanan A–E dan lonceng notifikasi
                  aktif; akses Kepegawaian menunggu persetujuan Super Admin.
                </>
              ) : user ? (
                <>
                  Masuk sebagai <strong className="font-semibold">{user.displayName || user.email}</strong>{' '}
                  ({user.email}). Riwayat pengajuan PTSP (Bidang A–E) tersimpan otomatis dan
                  lonceng notifikasi pesan terbaru aktif.
                </>
              ) : (
                <>
                  Masyarakat yang hanya sesekali berurusan dapat langsung mengajukan permohonan biasa
                  tanpa login. Gunakan menu <strong>Login</strong> (pojok kanan atas) untuk masuk
                  dengan <strong>Akun Google</strong> agar riwayat & lonceng aktif, atau{' '}
                  <strong>Login Pegawai (NIP & Password)</strong> untuk mengakses menu{' '}
                  <strong>Kepegawaian</strong>.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isAdmin && (
            <button
              type="button"
              onClick={onToggleAdminPanel}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                showAdminPanel
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {showAdminPanel
                  ? 'Tutup Konsol Super Admin'
                  : 'Konsol Super Admin (Berita & Operator)'}
              </span>
            </button>
          )}

          {isAnyOperator && onToggleOperatorPanel && (
            <button
              type="button"
              onClick={onToggleOperatorPanel}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                showOperatorPanel
                  ? 'bg-teal-700 text-white hover:bg-teal-800'
                  : 'bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-800 hover:bg-teal-200 dark:hover:bg-teal-900'
              }`}
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>
                {showOperatorPanel
                  ? 'Tutup Konsol Operator'
                  : isOperatorPtsp
                  ? 'Konsol Operator PTSP'
                  : 'Konsol Operator Seksi'}
              </span>
            </button>
          )}

          {!user ? (
            <>
              <button
                type="button"
                onClick={() => openLoginModal('google')}
                disabled={authLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login Akun Google</span>
              </button>
              <button
                type="button"
                onClick={() => openLoginModal('pegawai')}
                disabled={authLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white text-xs font-bold transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login Pegawai (NIP)</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>
                Keluar {isNipSession ? `(NIP ${user.email?.split('@')[0]})` : ''}
              </span>
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 px-3.5 py-2 text-xs text-red-700 dark:text-red-300">
          <span>{authError}</span>
          <button type="button" onClick={clearAuthError} className="font-bold underline">
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}

export function OperatorTicketConsole() {
  const { user, isAdmin, isOperatorPtsp, isOperatorSeksi, assignedUnitId, assignedUnitTitle } =
    useAuthRole();
  const [tickets, setTickets] = useState<CloudPtspTicketRecord[]>([]);
  const [ticketNotes, setTicketNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!user || isAdmin || (!isOperatorPtsp && !isOperatorSeksi)) return;
    const scope: TicketSubscriptionScope = isOperatorPtsp
      ? { mode: 'all' }
      : { mode: 'unit', unitId: assignedUnitId };
    const unsub = subscribePtspTickets(user, scope, setTickets, () => {});
    return () => unsub();
  }, [user, isAdmin, isOperatorPtsp, isOperatorSeksi, assignedUnitId]);

  if (!user || isAdmin || (!isOperatorPtsp && !isOperatorSeksi)) return null;

  const handleUpdateTicket = async (
    ticket: CloudPtspTicketRecord,
    nextStatus: CloudPtspTicketRecord['status']
  ) => {
    setBusyId(ticket.id);
    setFeedback('');
    try {
      await updateCloudTicketStatus({
        ticketId: ticket.id,
        status: nextStatus,
        adminNote: ticketNotes[ticket.id] ?? ticket.adminNote ?? '',
      });
      setFeedback(`Status tiket ${ticket.ticketNo} diperbarui menjadi "${nextStatus}".`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="border-2 border-teal-300 dark:border-teal-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-md">
      <div className="p-5 sm:p-6 bg-teal-50/90 dark:bg-teal-950/50 border-b border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-teal-800 dark:text-teal-300">
            {isOperatorPtsp
              ? 'Konsol Kerja Operator PTSP Kemenag Murung Raya'
              : `Konsol Kerja Operator Seksi — ${assignedUnitTitle || assignedUnitId}`}
          </p>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            Antrean Permohonan & Verifikasi Berkas ({tickets.length})
          </h3>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-bold w-fit">
          {isOperatorPtsp ? 'Semua Bidang Layanan' : assignedUnitTitle || assignedUnitId}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {feedback && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 dark:border-emerald-800 px-4 py-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {tickets.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            Belum ada tiket permohonan cloud yang masuk pada lingkup tugas Anda.
          </p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-mono-tabular font-bold text-emerald-800 dark:text-emerald-400">
                        <Ticket className="w-3.5 h-3.5" />
                        {t.ticketNo}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold uppercase">
                        {t.unitTitle}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.serviceTitle}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t.applicantName} {t.nip ? `(NIP ${t.nip})` : ''} · {t.phone} ·{' '}
                      {t.userEmail}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-bold shrink-0 w-fit ${
                      t.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'Menunggu Berkas'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    value={ticketNotes[t.id] ?? t.adminNote ?? ''}
                    onChange={(e) =>
                      setTicketNotes((prev) => ({ ...prev, [t.id]: e.target.value }))
                    }
                    placeholder="Catatan operator untuk pemohon..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {(['Diproses Verifikasi', 'Menunggu Berkas', 'Selesai'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={busyId === t.id}
                        onClick={() => void handleUpdateTicket(t, st)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                          t.status === st
                            ? 'bg-teal-700 text-white'
                            : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function KepegawaianAccessGate({
  serviceTitle,
  gateMode = 'kepegawaian',
}: {
  serviceTitle: string;
  gateMode?: 'kepegawaian' | 'kua';
}) {
  const {
    user,
    authLoading,
    myEmployeeRequest,
    myVerifiedEmployee,
    isVerifiedEmployee,
    openLoginModal,
  } = useAuthRole();

  const isKuaGate = gateMode === 'kua';
  const [fullName, setFullName] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [unitCategory, setUnitCategory] = useState<EmployeeUnitCategory>(
    isKuaGate ? 'kua_kecamatan' : 'kankemenag'
  );
  const [unitKerja, setUnitKerja] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (myEmployeeRequest) {
      setFullName(myEmployeeRequest.fullName);
      setNip(myEmployeeRequest.nip);
      setJabatan(myEmployeeRequest.jabatan);
      setUnitCategory(myEmployeeRequest.unitCategory);
      setUnitKerja(myEmployeeRequest.unitKerja);
    } else {
      if (user?.displayName && !fullName) {
        setFullName(user.displayName);
      }
      setUnitCategory(isKuaGate ? 'kua_kecamatan' : 'kankemenag');
    }
  }, [myEmployeeRequest, user?.displayName, isKuaGate]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      await submitEmployeeVerificationRequest({
        user,
        fullName,
        nip,
        jabatan,
        unitKerja,
        unitCategory,
      });
      setSuccessMsg(
        'Permohonan verifikasi pegawai berhasil dikirim. Silakan tunggu persetujuan Super Admin Kemenag Murung Raya.'
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Gagal mengirim permohonan verifikasi pegawai.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isNonKuaEmployeeBlocked =
    isKuaGate &&
    isVerifiedEmployee &&
    myVerifiedEmployee?.status === 'active' &&
    myVerifiedEmployee.unitCategory !== 'kua_kecamatan';

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 p-5 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {isKuaGate
              ? 'Akses Khusus Pegawai KUA Kecamatan Kab. Murung Raya'
              : 'Akses Terbatas Khusus Pegawai Kemenag Kab. Murung Raya'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {isKuaGate ? (
              <>
                Layanan <strong>{serviceTitle}</strong> pada Seksi Bimas Islam dikhususkan bagi{' '}
                <strong>Kepala KUA, Penghulu, atau Pegawai yang bertugas pada KUA Kecamatan</strong>{' '}
                di Kabupaten Murung Raya dan telah diverifikasi secara ketat oleh Super Admin.
              </>
            ) : (
              <>
                Layanan <strong>{serviceTitle}</strong> berada dalam menu{' '}
                <strong>F. KEPEGAWAIAN</strong> yang hanya dapat diakses oleh ASN/Pegawai lingkup
                Kantor Kementerian Agama Kabupaten Murung Raya setelah melalui verifikasi ketat oleh
                Super Admin.
              </>
            )}
          </p>
        </div>
      </div>

      {authLoading ? (
        <div className="text-xs text-slate-500 py-4">Memeriksa status autentikasi...</div>
      ) : !user ? (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-slate-50/60 dark:bg-slate-950/60 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isKuaGate
                ? 'Login Khusus Pegawai KUA Kecamatan (NIP, Password & Captcha)'
                : 'Login Khusus Pegawai Kemenag Murung Raya (NIP, Password & Captcha)'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Masuk menggunakan <strong>NIP & Password</strong> pegawai Anda yang telah didaftarkan
              Super Admin, atau ajukan aktivasi NIP / masuk dengan Akun Google terlebih dahulu untuk
              verifikasi ketat Super Admin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => openLoginModal('pegawai')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isKuaGate
                  ? 'Login Pegawai KUA (NIP & Password)'
                  : 'Login Pegawai (NIP & Password)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => openLoginModal('google')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Atau Masuk Akun Google</span>
            </button>
          </div>
        </div>
      ) : isNonKuaEmployeeBlocked && myVerifiedEmployee ? (
        <div className="border border-amber-200 dark:border-amber-900 rounded-xl p-6 bg-amber-50/60 dark:bg-amber-950/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Unit Kerja Anda Terdaftar di Luar KUA Kecamatan</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Akun Anda terverifikasi sebagai pegawai pada unit kerja{' '}
            <strong>{myVerifiedEmployee.unitKerja}</strong> (
            {UNIT_CATEGORY_LABELS[myVerifiedEmployee.unitCategory]}). Layanan{' '}
            <strong>{serviceTitle}</strong> hanya dapat diakses oleh pegawai berstatus kategori{' '}
            <strong>KUA Kecamatan</strong>. Hubungi Super Admin ({' '}
            <span className="font-mono-tabular">kemenagmuraptsp@gmail.com</span>) jika Anda bertugas
            atau dimutasi ke KUA Kecamatan.
          </p>
        </div>
      ) : myVerifiedEmployee?.status === 'revoked' ? (
        <div className="border border-red-200 dark:border-red-900 rounded-xl p-6 bg-red-50/60 dark:bg-red-950/30 space-y-2">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Akses Kepegawaian Dinonaktifkan</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Akun <strong>{user.email}</strong> (NIP {myVerifiedEmployee.nip}) saat ini berstatus
            nonaktif/dicabut oleh Super Admin. Hubungi Subbag TU / Pengelola Kepegawaian
            Kankemenag Kab. Murung Raya apabila Anda masih bertugas aktif.
          </p>
        </div>
      ) : myEmployeeRequest?.status === 'pending' ? (
        <div className="border border-amber-200 dark:border-amber-900 rounded-xl p-6 bg-amber-50/60 dark:bg-amber-950/30 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Pengajuan Verifikasi Pegawai Sedang Ditinjau Super Admin
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Data kepegawaian Anda telah diterima dan menunggu verifikasi NIP serta unit kerja
                oleh Super Admin Kemenag Murung Raya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-xs">
            <div>
              <span className="text-slate-500 block">Nama Sesuai SK</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {myEmployeeRequest.fullName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">NIP / NI PPPK</span>
              <span className="font-mono-tabular font-bold text-slate-900 dark:text-white">
                {myEmployeeRequest.nip}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Jabatan</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {myEmployeeRequest.jabatan}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Kategori & Unit Kerja</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {UNIT_CATEGORY_LABELS[myEmployeeRequest.unitCategory]} ·{' '}
                {myEmployeeRequest.unitKerja}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleRequestSubmit}
          className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-950 space-y-4"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Pengajuan Verifikasi Akun Pegawai Kemenag Murung Raya
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Akun terhubung: <strong>{user.email}</strong>.{' '}
              {isKuaGate
                ? 'Pilih kategori KUA Kecamatan dan lengkapi NIP serta nama KUA Kecamatan tempat Anda bertugas.'
                : 'Isi identitas ASN/PPPK/Pegawai Anda untuk diverifikasi oleh Super Admin sebelum menu Kepegawaian dibuka.'}
            </p>
          </div>

          {myEmployeeRequest?.status === 'rejected' && (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs text-red-800 dark:text-red-300 space-y-1">
              <p className="font-bold">Permohonan Sebelumnya Ditolak Super Admin:</p>
              <p>{myEmployeeRequest.adminNote || 'Silakan perbaiki data NIP dan Unit Kerja Anda.'}</p>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-800">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar Sesuai SK *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi, S.HI."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:border-indigo-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP / NI PPPK *
              </label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="18 digit NIP / NI PPPK"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:border-indigo-700 font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Satker / Unit Kerja *
              </label>
              <select
                value={unitCategory}
                onChange={(e) => {
                  const val = e.target.value as EmployeeUnitCategory;
                  setUnitCategory(val);
                  if (val === 'kua_kecamatan' && !unitKerja.toLowerCase().includes('kua')) {
                    setUnitKerja('KUA Kec. Murung');
                  }
                }}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:border-indigo-700"
              >
                <option value="kankemenag">Kantor Kemenag Kab. Murung Raya</option>
                <option value="kua_kecamatan">KUA Kecamatan (Wajib untuk Tauliyah Wali Hakim)</option>
                <option value="madrasah">Madrasah Negeri / Satker Pendidikan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {unitCategory === 'kua_kecamatan'
                  ? 'KUA Kecamatan Tempat Bertugas *'
                  : 'Unit Kerja / Satker *'}
              </label>
              {unitCategory === 'kua_kecamatan' ? (
                <select
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:border-indigo-700"
                >
                  {KUA_BRANCHES.map((kua) => {
                    const label = `KUA Kec. ${kua.kecamatan}`;
                    return (
                      <option key={kua.id} value={label}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  placeholder="Contoh: Subbag TU / Seksi Bimas Islam / MAN 1 Murung Raya"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:border-indigo-700"
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jabatan *
              </label>
              <input
                type="text"
                required
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder={
                  unitCategory === 'kua_kecamatan'
                    ? 'Contoh: Kepala KUA / Penghulu Ahli Muda / Penyuluh / Staf KUA'
                    : 'Contoh: Analis Kepegawaian / Staf / Guru Madya'
                }
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:border-indigo-700"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white text-xs font-bold transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {submitting ? 'Mengirim Pengajuan...' : 'Kirim Permohonan Verifikasi Pegawai'}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AdminVerificationPanel() {
  const { user, isAdmin, newsArticles, cloudNewsArticles } = useAuthRole();
  const [activeTab, setActiveTab] = useState<
    'news' | 'operators' | 'requests' | 'employees' | 'tickets'
  >('news');

  const [requests, setRequests] = useState<EmployeeRequestRecord[]>([]);
  const [employees, setEmployees] = useState<VerifiedEmployeeRecord[]>([]);
  const [googleUsers, setGoogleUsers] = useState<UserProfileRecord[]>([]);
  const [tickets, setTickets] = useState<CloudPtspTicketRecord[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');

  // ---- NEWS CRUD STATE ----
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<string>('Kegiatan');
  const [newsSection, setNewsSection] = useState<NewsArticle['section']>('hari-ini');
  const [newsDate, setNewsDate] = useState(() => getTodayIndonesianDate());
  const [newsImage, setNewsImage] = useState<string>(OFFICIAL_NEWS_IMAGE_PRESETS[0].src);
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContentText, setNewsContentText] = useState('');
  const [newsEditingReactions, setNewsEditingReactions] = useState<NewsArticle['reactions']>({
    bermanfaat: 0,
    informatif: 0,
    inspiratif: 0,
  });
  const [newsEditingViews, setNewsEditingViews] = useState<number>(1);
  const [confirmDeleteNewsId, setConfirmDeleteNewsId] = useState<string | null>(null);

  // ---- OPERATOR CRUD STATE ----
  const [opName, setOpName] = useState('');
  const [opNip, setOpNip] = useState('');
  const [opPassword, setOpPassword] = useState('');
  const [opRole, setOpRole] = useState<EmployeeOperatorRole>('operator_ptsp');
  const [opAssignedUnitId, setOpAssignedUnitId] = useState<OperatorUnitAssignment>('sekretariat');
  const [opCategory, setOpCategory] = useState<EmployeeUnitCategory>('kankemenag');
  const [opUnitKerja, setOpUnitKerja] = useState('Loket PTSP Kankemenag Murung Raya');
  const [opJabatan, setOpJabatan] = useState('Operator PTSP');
  const [opFormError, setOpFormError] = useState('');

  // Inline Edit Operator / Verified Employee State
  const [editingEmp, setEditingEmp] = useState<VerifiedEmployeeRecord | null>(null);
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpNip, setEditEmpNip] = useState('');
  const [editEmpJabatan, setEditEmpJabatan] = useState('');
  const [editEmpUnitKerja, setEditEmpUnitKerja] = useState('');
  const [editEmpCategory, setEditEmpCategory] = useState<EmployeeUnitCategory>('kankemenag');
  const [editEmpRole, setEditEmpRole] = useState<EmployeeOperatorRole>('pegawai');
  const [editEmpUnitId, setEditEmpUnitId] = useState<OperatorUnitAssignment>('sekretariat');
  const [editEmpStatus, setEditEmpStatus] = useState<'active' | 'revoked'>('active');
  const [confirmDeleteEmpUid, setConfirmDeleteEmpUid] = useState<string | null>(null);

  // Quick manual promote state
  const [promoteUser, setPromoteUser] = useState<UserProfileRecord | null>(null);
  const [promoteName, setPromoteName] = useState('');
  const [promoteNip, setPromoteNip] = useState('');
  const [promoteJabatan, setPromoteJabatan] = useState('');
  const [promoteCategory, setPromoteCategory] = useState<EmployeeUnitCategory>('kankemenag');
  const [promoteUnitKerja, setPromoteUnitKerja] = useState('');
  const [promoteOpRole, setPromoteOpRole] = useState<EmployeeOperatorRole>('pegawai');
  const [promoteOpUnitId, setPromoteOpUnitId] = useState<OperatorUnitAssignment>('sekretariat');

  // Admin direct NIP+Password employee creation state
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNip, setNewEmpNip] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [newEmpCategory, setNewEmpCategory] = useState<EmployeeUnitCategory>('kankemenag');
  const [newEmpUnitKerja, setNewEmpUnitKerja] = useState('');
  const [newEmpJabatan, setNewEmpJabatan] = useState('');
  const [newEmpError, setNewEmpError] = useState('');

  // Category override on pending request approval
  const [requestCategories, setRequestCategories] = useState<Record<string, EmployeeUnitCategory>>(
    {}
  );

  // Reject note per uid
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  // Ticket notes draft per id
  const [ticketNotes, setTicketNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || !isAdmin) return;
    const u1 = subscribeAllEmployeeRequests(setRequests, () => {});
    const u2 = subscribeAllVerifiedEmployees(setEmployees, () => {});
    const u3 = subscribeAllGoogleUsers(setGoogleUsers, () => {});
    const u4 = subscribePtspTickets(user, { mode: 'all' }, setTickets, () => {});
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;

  const builtInNewsIds = new Set(NEWS_ARTICLES.map((a) => a.id));
  const deletedBuiltInCloudNews = cloudNewsArticles.filter(
    (c) => builtInNewsIds.has(c.id) && c.isDeleted
  );

  const operatorAccounts = employees.filter(
    (e) => e.operatorRole === 'operator_ptsp' || e.operatorRole === 'operator_seksi'
  );
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const activeEmployeesCount = employees.filter((e) => e.status === 'active').length;
  const verifiedUidSet = new Set(employees.filter((e) => e.status === 'active').map((e) => e.uid));

  const resetNewsForm = () => {
    setEditingNewsId(null);
    setNewsTitle('');
    setNewsCategory('Kegiatan');
    setNewsSection('hari-ini');
    setNewsDate(getTodayIndonesianDate());
    setNewsImage(OFFICIAL_NEWS_IMAGE_PRESETS[0].src);
    setNewsExcerpt('');
    setNewsContentText('');
    setNewsEditingReactions({ bermanfaat: 0, informatif: 0, inspiratif: 0 });
    setNewsEditingViews(1);
  };

  const handleStartEditNews = (art: NewsArticle) => {
    setErrorFeedback('');
    setStatusFeedback('');
    setEditingNewsId(art.id);
    setNewsTitle(art.title);
    setNewsCategory(art.category);
    setNewsSection(art.section);
    setNewsDate(art.date);
    setNewsImage(art.image);
    setNewsExcerpt(art.excerpt);
    setNewsContentText(art.content.join('\n\n'));
    setNewsEditingReactions(art.reactions || { bermanfaat: 0, informatif: 0, inspiratif: 0 });
    setNewsEditingViews(art.views || 1);
  };

  const handleSaveNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFeedback('');
    setStatusFeedback('');
    const paragraphs = newsContentText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      setErrorFeedback('Isi berita minimal harus memiliki 1 paragraf.');
      return;
    }

    setBusyId('save-news');
    try {
      await saveNewsArticle({
        adminUser: user,
        id: editingNewsId || undefined,
        title: newsTitle,
        category: newsCategory,
        section: newsSection,
        date: newsDate,
        views: newsEditingViews,
        image: newsImage,
        excerpt: newsExcerpt,
        content: paragraphs,
        reactions: newsEditingReactions,
      });
      setStatusFeedback(
        editingNewsId
          ? `Berita "${newsTitle}" berhasil diperbarui dan dipublikasikan.`
          : `Berita baru "${newsTitle}" berhasil ditambahkan ke portal.`
      );
      resetNewsForm();
    } catch (err) {
      setErrorFeedback(err instanceof Error ? err.message : 'Gagal menyimpan berita.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteNewsConfirm = async (art: NewsArticle) => {
    setBusyId(`del-news-${art.id}`);
    setErrorFeedback('');
    setStatusFeedback('');
    try {
      await deleteNewsArticle({
        adminUser: user,
        article: art,
        isBuiltIn: builtInNewsIds.has(art.id),
      });
      setConfirmDeleteNewsId(null);
      if (editingNewsId === art.id) resetNewsForm();
      setStatusFeedback(`Berita "${art.title}" telah dihapus dari tampilan portal.`);
    } catch (err) {
      setErrorFeedback(err instanceof Error ? err.message : 'Gagal menghapus berita.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRestoreBuiltInNews = async (articleId: string, title: string) => {
    setBusyId(`restore-${articleId}`);
    setErrorFeedback('');
    setStatusFeedback('');
    try {
      await restoreBuiltInNewsArticle(articleId);
      setStatusFeedback(`Berita bawaan "${title}" berhasil dipulihkan.`);
    } catch (err) {
      setErrorFeedback(err instanceof Error ? err.message : 'Gagal memulihkan berita.');
    } finally {
      setBusyId(null);
    }
  };

  // ---- OPERATOR & EMPLOYEE HANDLERS ----
  const handleCreateOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpFormError('');
    setStatusFeedback('');
    setErrorFeedback('');
    setBusyId('create-operator');
    try {
      const assignedId: OperatorUnitAssignment =
        opRole === 'operator_ptsp' ? 'all' : opAssignedUnitId;
      const assignedTitle = getUnitTitleById(assignedId);
      await provisionEmployeeAccountByAdmin({
        adminUser: user,
        fullName: opName,
        nip: opNip,
        password: opPassword,
        jabatan: opJabatan,
        unitKerja: opUnitKerja,
        unitCategory: opCategory,
        operatorRole: opRole,
        assignedUnitId: assignedId,
        assignedUnitTitle: assignedTitle,
      });
      setStatusFeedback(
        `Akun ${OPERATOR_ROLE_LABELS[opRole]} (${opName} · NIP ${sanitizeNipDigits(opNip)}) berhasil dibuat dan diaktifkan untuk ${assignedTitle}.`
      );
      setOpName('');
      setOpNip('');
      setOpPassword('');
    } catch (err) {
      setOpFormError(mapFirebaseAuthError(err));
    } finally {
      setBusyId(null);
    }
  };

  const startEditVerifiedEmployee = (emp: VerifiedEmployeeRecord) => {
    setErrorFeedback('');
    setStatusFeedback('');
    setEditingEmp(emp);
    setEditEmpName(emp.fullName);
    setEditEmpNip(emp.nip);
    setEditEmpJabatan(emp.jabatan);
    setEditEmpUnitKerja(emp.unitKerja);
    setEditEmpCategory(emp.unitCategory);
    setEditEmpRole(emp.operatorRole || 'pegawai');
    setEditEmpUnitId(
      emp.assignedUnitId && emp.assignedUnitId !== 'all' ? emp.assignedUnitId : 'sekretariat'
    );
    setEditEmpStatus(emp.status);
  };

  const handleSaveEditVerifiedEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setBusyId(`edit-emp-${editingEmp.uid}`);
    setErrorFeedback('');
    setStatusFeedback('');
    try {
      const resolvedUnitId: OperatorUnitAssignment =
        editEmpRole === 'operator_seksi' ? editEmpUnitId : 'all';
      const resolvedUnitTitle = getUnitTitleById(resolvedUnitId);
      await updateVerifiedEmployeeDetails({
        adminUser: user,
        targetUid: editingEmp.uid,
        fullName: editEmpName,
        nip: editEmpNip,
        jabatan: editEmpJabatan,
        unitKerja: editEmpUnitKerja,
        unitCategory: editEmpCategory,
        operatorRole: editEmpRole,
        assignedUnitId: resolvedUnitId,
        assignedUnitTitle: resolvedUnitTitle,
        status: editEmpStatus,
      });
      setStatusFeedback(
        `Data akun "${editEmpName}" (${OPERATOR_ROLE_LABELS[editEmpRole]}) berhasil diperbarui.`
      );
      setEditingEmp(null);
    } catch (err) {
      setErrorFeedback(err instanceof Error ? err.message : 'Gagal memperbarui data akun.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteEmployeeConfirm = async (emp: VerifiedEmployeeRecord) => {
    setBusyId(`del-emp-${emp.uid}`);
    setErrorFeedback('');
    setStatusFeedback('');
    try {
      await deleteVerifiedEmployeeAccount(emp.uid);
      setConfirmDeleteEmpUid(null);
      if (editingEmp?.uid === emp.uid) setEditingEmp(null);
      setStatusFeedback(
        `Akun "${emp.fullName}" (NIP ${emp.nip}) telah dihapus dari daftar akses operator & pegawai aktif.`
      );
    } catch (err) {
      setErrorFeedback(err instanceof Error ? err.message : 'Gagal menghapus akun.');
    } finally {
      setBusyId(null);
    }
  };

  const handleApproveRequest = async (req: EmployeeRequestRecord) => {
    setBusyId(req.uid);
    setStatusFeedback('');
    const chosenCategory = requestCategories[req.uid] || req.unitCategory;
    try {
      await approveEmployeeVerification({
        adminUser: user,
        targetUid: req.uid,
        email: req.email,
        fullName: req.fullName,
        nip: req.nip,
        jabatan: req.jabatan,
        unitKerja: req.unitKerja,
        unitCategory: chosenCategory,
      });
      setStatusFeedback(
        `Akun pegawai ${req.fullName} (${UNIT_CATEGORY_LABELS[chosenCategory]}) telah diverifikasi aktif oleh Super Admin.`
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectRequest = async (req: EmployeeRequestRecord) => {
    setBusyId(req.uid);
    setStatusFeedback('');
    try {
      await rejectEmployeeVerification({
        adminUser: user,
        targetUid: req.uid,
        adminNote:
          rejectNotes[req.uid] ||
          'Data NIP atau Unit Kerja belum cocok dengan daftar pegawai Kemenag Kab. Murung Raya.',
      });
      setStatusFeedback(`Pengajuan ${req.email} ditolak.`);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleEmployee = async (emp: VerifiedEmployeeRecord) => {
    const nextStatus = emp.status === 'active' ? 'revoked' : 'active';
    setBusyId(emp.uid);
    setStatusFeedback('');
    try {
      await toggleVerifiedEmployeeStatus({
        adminUser: user,
        targetUid: emp.uid,
        nextStatus,
      });
      setStatusFeedback(
        `Status akun ${emp.fullName} diubah menjadi ${
          nextStatus === 'active' ? 'Aktif' : 'Dinonaktifkan'
        }.`
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleChangeEmployeeCategory = async (
    emp: VerifiedEmployeeRecord,
    unitCategory: EmployeeUnitCategory
  ) => {
    setBusyId(emp.uid);
    setStatusFeedback('');
    try {
      await updateVerifiedEmployeeCategory({
        adminUser: user,
        targetUid: emp.uid,
        unitCategory,
      });
      setStatusFeedback(
        `Kategori unit ${emp.fullName} diubah menjadi ${UNIT_CATEGORY_LABELS[unitCategory]}.`
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleManualPromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteUser) return;
    setBusyId(promoteUser.uid);
    setStatusFeedback('');
    try {
      const resolvedUnitId: OperatorUnitAssignment =
        promoteOpRole === 'operator_seksi' ? promoteOpUnitId : 'all';
      await approveEmployeeVerification({
        adminUser: user,
        targetUid: promoteUser.uid,
        email: promoteUser.email,
        fullName: promoteName || promoteUser.displayName,
        nip: promoteNip,
        jabatan: promoteJabatan,
        unitKerja: promoteUnitKerja,
        unitCategory: promoteCategory,
        operatorRole: promoteOpRole,
        assignedUnitId: resolvedUnitId,
        assignedUnitTitle: getUnitTitleById(resolvedUnitId),
      });
      setStatusFeedback(
        `${promoteUser.email} berhasil ditetapkan sebagai ${OPERATOR_ROLE_LABELS[promoteOpRole]} (${UNIT_CATEGORY_LABELS[promoteCategory]}).`
      );
      setPromoteUser(null);
      setPromoteName('');
      setPromoteNip('');
      setPromoteJabatan('');
      setPromoteUnitKerja('');
      setPromoteOpRole('pegawai');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateNipEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewEmpError('');
    setStatusFeedback('');
    setBusyId('create-nip-emp');
    try {
      await provisionEmployeeAccountByAdmin({
        adminUser: user,
        fullName: newEmpName,
        nip: newEmpNip,
        password: newEmpPassword,
        jabatan: newEmpJabatan,
        unitKerja: newEmpUnitKerja,
        unitCategory: newEmpCategory,
        operatorRole: 'pegawai',
      });
      setStatusFeedback(
        `Akun Pegawai NIP ${sanitizeNipDigits(newEmpNip)} (${newEmpName}) berhasil dibuat dan aktif.`
      );
      setNewEmpName('');
      setNewEmpNip('');
      setNewEmpPassword('');
      setNewEmpJabatan('');
      setNewEmpUnitKerja('');
      setNewEmpCategory('kankemenag');
    } catch (err) {
      setNewEmpError(mapFirebaseAuthError(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateTicket = async (
    ticket: CloudPtspTicketRecord,
    nextStatus: CloudPtspTicketRecord['status']
  ) => {
    setBusyId(ticket.id);
    setStatusFeedback('');
    try {
      await updateCloudTicketStatus({
        ticketId: ticket.id,
        status: nextStatus,
        adminNote: ticketNotes[ticket.id] ?? ticket.adminNote ?? '',
      });
      setStatusFeedback(`Status tiket ${ticket.ticketNo} diperbarui menjadi "${nextStatus}".`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="border-2 border-amber-300 dark:border-amber-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-md">
      <div className="p-5 sm:p-6 bg-amber-50/90 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            Konsol Super Admin Portal Kemenag Kab. Murung Raya
          </p>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            Manajemen Berita, Akun Operator PTSP & Seksi, Pegawai, dan Tiket
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'news'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Data Berita ({newsArticles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('operators')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'operators'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Operator PTSP & Seksi ({operatorAccounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'requests'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-800'
            }`}
          >
            Pengajuan Pegawai ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'employees'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-800'
            }`}
          >
            Pegawai Aktif ({activeEmployeesCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'tickets'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-800'
            }`}
          >
            Antrean Tiket ({tickets.length})
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {statusFeedback && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 dark:border-emerald-800 px-4 py-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {errorFeedback && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/60 dark:border-red-800 px-4 py-2.5 text-xs font-semibold text-red-900 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}

        {/* TAB 1: KELOLA DATA BERITA */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <form
              onSubmit={(e) => void handleSaveNewsSubmit(e)}
              className="p-4 sm:p-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    {editingNewsId ? (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Artikel Berita</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Tambah Berita Baru ke Portal</span>
                      </>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Berita yang disimpan otomatis tampil di halaman Beranda, menu Berita, dan
                    Pencarian Global.
                  </p>
                </div>
                {editingNewsId && (
                  <button
                    type="button"
                    onClick={resetNewsForm}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    Batal Edit / Buat Baru
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Berita *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={220}
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Contoh: Kankemenag Murung Raya Gelar Pembinaan Pelayanan PTSP Prima..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Berita *
                  </label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {NEWS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Penempatan / Rubrik *
                  </label>
                  <select
                    value={newsSection}
                    onChange={(e) => setNewsSection(e.target.value as NewsArticle['section'])}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {NEWS_SECTIONS.map((sec) => (
                      <option key={sec.value} value={sec.value}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Publikasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsDate}
                    onChange={(e) => setNewsDate(e.target.value)}
                    placeholder="Contoh: 18 November 2026"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Foto Berita (Preset Resmi)
                  </label>
                  <select
                    value={
                      OFFICIAL_NEWS_IMAGE_PRESETS.some((p) => p.src === newsImage)
                        ? newsImage
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) setNewsImage(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="" disabled>
                      Pilih preset foto...
                    </option>
                    {OFFICIAL_NEWS_IMAGE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.src}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL Gambar Berita (atau otomatis terisi dari Preset) *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 shrink-0 flex items-center justify-center">
                      {newsImage ? (
                        <SafeImage
                          src={newsImage}
                          alt="Pratinjau gambar berita"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={500}
                      value={newsImage}
                      onChange={(e) => setNewsImage(e.target.value)}
                      placeholder="https://... atau pilih preset gambar di atas"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ringkasan Singkat (Excerpt) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    minLength={5}
                    maxLength={600}
                    value={newsExcerpt}
                    onChange={(e) => setNewsExcerpt(e.target.value)}
                    placeholder="Tuliskan ringkasan 1-2 kalimat yang tampil pada kartu berita..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Isi Artikel Lengkap (Pisahkan tiap paragraf dengan baris baru) *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={newsContentText}
                    onChange={(e) => setNewsContentText(e.target.value)}
                    placeholder={`PURUK CAHU — Tulis paragraf pertama berita...\n\nTulis paragraf kedua dan seterusnya...`}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={busyId === 'save-news'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold transition-colors"
                >
                  {editingNewsId ? (
                    <Edit3 className="w-3.5 h-3.5" />
                  ) : (
                    <PlusCircle className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {busyId === 'save-news'
                      ? 'Menyimpan Berita...'
                      : editingNewsId
                      ? 'Simpan Perubahan Berita'
                      : 'Publikasikan Berita Baru'}
                  </span>
                </button>
              </div>
            </form>

            {/* Daftar Berita Portal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Daftar Seluruh Berita Aktif ({newsArticles.length})
                </h4>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {newsArticles.map((art) => {
                  const isBuiltIn = builtInNewsIds.has(art.id);
                  const isConfirming = confirmDeleteNewsId === art.id;
                  return (
                    <div
                      key={art.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-950"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                          <SafeImage
                            src={art.image}
                            alt={art.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                              {art.category}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                              {art.section}
                            </span>
                            <span className="text-slate-500">{art.date}</span>
                            {!isBuiltIn && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                Tambahan Super Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {art.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{art.excerpt}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditNews(art)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={busyId === `del-news-${art.id}`}
                              onClick={() => void handleDeleteNewsConfirm(art)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                            >
                              Yakin Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteNewsId(null)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteNewsId(art.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50 text-xs font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {deletedBuiltInCloudNews.length > 0 && (
                <div className="pt-3 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Arsip Berita Bawaan yang Dihapus ({deletedBuiltInCloudNews.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {deletedBuiltInCloudNews.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate text-slate-600 dark:text-slate-400">
                          {item.title}
                        </span>
                        <button
                          type="button"
                          disabled={busyId === `restore-${item.id}`}
                          onClick={() => void handleRestoreBuiltInNews(item.id, item.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold shrink-0"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Pulihkan</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA AKUN OPERATOR PTSP & OPERATOR SEKSI */}
        {activeTab === 'operators' && (
          <div className="space-y-6">
            {/* Form Tambah Operator PTSP / Operator Seksi */}
            <form
              onSubmit={(e) => void handleCreateOperatorSubmit(e)}
              className="p-4 sm:p-5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 space-y-3"
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Akun Operator PTSP atau Operator Seksi</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Super Admin dapat mendaftarkan akun <strong>Operator PTSP</strong> (kelola semua
                  tiket) atau <strong>Operator Seksi</strong> (kelola tiket bidang/seksi tertentu)
                  dengan NIP dan Password awal.
                </p>
              </div>

              {opFormError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {opFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  placeholder="Nama Lengkap Operator *"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={opNip}
                  onChange={(e) => setOpNip(sanitizeNipDigits(e.target.value))}
                  placeholder="NIP / ID Login (8-20 digit angka) *"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-tabular"
                />
                <input
                  type="text"
                  required
                  minLength={6}
                  value={opPassword}
                  onChange={(e) => setOpPassword(e.target.value)}
                  placeholder="Password Awal (min. 6 karakter) *"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />

                <select
                  value={opRole}
                  onChange={(e) => {
                    const next = e.target.value as EmployeeOperatorRole;
                    setOpRole(next);
                    if (next === 'operator_ptsp') {
                      setOpJabatan('Operator PTSP');
                      setOpUnitKerja('Loket PTSP Kankemenag Murung Raya');
                    } else if (next === 'operator_seksi') {
                      const unitTitle = getUnitTitleById(opAssignedUnitId);
                      setOpJabatan(`Operator ${unitTitle}`);
                      setOpUnitKerja(unitTitle);
                    }
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="operator_ptsp">Peran: Operator PTSP (Semua Bidang)</option>
                  <option value="operator_seksi">Peran: Operator Seksi (Per Bidang)</option>
                </select>

                {opRole === 'operator_seksi' ? (
                  <select
                    value={opAssignedUnitId}
                    onChange={(e) => {
                      const val = e.target.value as OperatorUnitAssignment;
                      setOpAssignedUnitId(val);
                      const unitTitle = getUnitTitleById(val);
                      setOpUnitKerja(unitTitle);
                      setOpJabatan(`Operator ${unitTitle}`);
                    }}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {PTSP_UNIT_OPTIONS.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        Seksi/Unit: {unit.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={opCategory}
                    onChange={(e) => setOpCategory(e.target.value as EmployeeUnitCategory)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="kankemenag">Kantor Kemenag Kab. Murung Raya</option>
                    <option value="kua_kecamatan">KUA Kecamatan</option>
                    <option value="madrasah">Madrasah Negeri / Satker Pendidikan</option>
                  </select>
                )}

                <input
                  type="text"
                  required
                  value={opJabatan}
                  onChange={(e) => setOpJabatan(e.target.value)}
                  placeholder="Jabatan Operator *"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />

                <input
                  type="text"
                  required
                  value={opUnitKerja}
                  onChange={(e) => setOpUnitKerja(e.target.value)}
                  placeholder="Unit Kerja / Loket *"
                  className="sm:col-span-2 lg:col-span-3 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={busyId === 'create-operator'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-xs font-bold transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>
                    {busyId === 'create-operator'
                      ? 'Mendaftarkan Operator...'
                      : 'Simpan & Aktifkan Akun Operator'}
                  </span>
                </button>
              </div>
            </form>

            {/* Daftar Akun Operator Aktif / Nonaktif */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Daftar Akun Operator PTSP & Operator Seksi ({operatorAccounts.length})
              </h4>

              {operatorAccounts.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Belum ada akun Operator PTSP atau Operator Seksi yang terdaftar. Gunakan formulir
                  di atas untuk menambah akun baru atau ubah peran pegawai yang sudah ada.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {operatorAccounts.map((emp) => {
                    const isEditingThis = editingEmp?.uid === emp.uid;
                    const isConfirmDelete = confirmDeleteEmpUid === emp.uid;
                    return (
                      <div key={emp.uid} className="p-4 bg-white dark:bg-slate-950 space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="text-xs space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {emp.fullName}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  emp.operatorRole === 'operator_ptsp'
                                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                    : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                }`}
                              >
                                {emp.operatorRole === 'operator_ptsp'
                                  ? 'Operator PTSP (Semua Bidang)'
                                  : `Operator Seksi · ${
                                      emp.assignedUnitTitle ||
                                      getUnitTitleById(emp.assignedUnitId)
                                    }`}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  emp.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-mono-tabular font-semibold text-indigo-700 dark:text-indigo-300">
                                NIP {emp.nip}
                              </span>{' '}
                              · {emp.jabatan} · {emp.unitKerja} · {emp.email}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                isEditingThis ? setEditingEmp(null) : startEditVerifiedEmployee(emp)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isEditingThis ? 'Tutup Edit' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={busyId === emp.uid}
                              onClick={() => void handleToggleEmployee(emp)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                emp.status === 'active'
                                  ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {emp.status === 'active' ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Nonaktifkan</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Aktifkan</span>
                                </>
                              )}
                            </button>

                            {isConfirmDelete ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={busyId === `del-emp-${emp.uid}`}
                                  onClick={() => void handleDeleteEmployeeConfirm(emp)}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                                >
                                  Yakin Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteEmpUid(null)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteEmpUid(emp.uid)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditingThis && (
                          <form
                            onSubmit={(e) => void handleSaveEditVerifiedEmployee(e)}
                            className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
                          >
                            <input
                              type="text"
                              required
                              value={editEmpName}
                              onChange={(e) => setEditEmpName(e.target.value)}
                              placeholder="Nama Lengkap"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpNip}
                              onChange={(e) => setEditEmpNip(e.target.value)}
                              placeholder="NIP"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-tabular"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpJabatan}
                              onChange={(e) => setEditEmpJabatan(e.target.value)}
                              placeholder="Jabatan"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpUnitKerja}
                              onChange={(e) => setEditEmpUnitKerja(e.target.value)}
                              placeholder="Unit Kerja"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <select
                              value={editEmpRole}
                              onChange={(e) =>
                                setEditEmpRole(e.target.value as EmployeeOperatorRole)
                              }
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            >
                              <option value="operator_ptsp">Peran: Operator PTSP (Semua)</option>
                              <option value="operator_seksi">Peran: Operator Seksi</option>
                              <option value="pegawai">Turunkan ke Pegawai Biasa</option>
                            </select>
                            {editEmpRole === 'operator_seksi' ? (
                              <select
                                value={editEmpUnitId}
                                onChange={(e) =>
                                  setEditEmpUnitId(e.target.value as OperatorUnitAssignment)
                                }
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              >
                                {PTSP_UNIT_OPTIONS.map((unit) => (
                                  <option key={unit.id} value={unit.id}>
                                    Unit: {unit.title}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={editEmpStatus}
                                onChange={(e) =>
                                  setEditEmpStatus(e.target.value as 'active' | 'revoked')
                                }
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              >
                                <option value="active">Status: Aktif</option>
                                <option value="revoked">Status: Nonaktif</option>
                              </select>
                            )}
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingEmp(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600"
                              >
                                Batal
                              </button>
                              <button
                                type="submit"
                                disabled={busyId === `edit-emp-${emp.uid}`}
                                className="px-4 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold"
                              >
                                {busyId === `edit-emp-${emp.uid}`
                                  ? 'Menyimpan...'
                                  : 'Simpan Perubahan Akun'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PENGAJUAN VERIFIKASI PEGAWAI */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Belum ada pengajuan verifikasi pegawai yang masuk.
              </p>
            ) : (
              requests.map((req) => (
                <div
                  key={req.uid}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {req.fullName}
                        </p>
                        <span className="font-mono-tabular text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          NIP {req.nip}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">
                          {UNIT_CATEGORY_LABELS[req.unitCategory]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {req.jabatan} · {req.unitKerja} ·{' '}
                        <span className="font-medium">{req.email}</span>
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase w-fit ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'approved'
                        ? 'Disetujui'
                        : req.status === 'rejected'
                        ? 'Ditolak'
                        : 'Menunggu Verifikasi'}
                    </span>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <select
                        value={requestCategories[req.uid] || req.unitCategory}
                        onChange={(e) =>
                          setRequestCategories((prev) => ({
                            ...prev,
                            [req.uid]: e.target.value as EmployeeUnitCategory,
                          }))
                        }
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="kankemenag">Kantor Kemenag Kab.</option>
                        <option value="kua_kecamatan">KUA Kecamatan (Akses Tauliyah)</option>
                        <option value="madrasah">Madrasah Negeri</option>
                      </select>
                      <input
                        type="text"
                        value={rejectNotes[req.uid] || ''}
                        onChange={(e) =>
                          setRejectNotes((prev) => ({ ...prev, [req.uid]: e.target.value }))
                        }
                        placeholder="Catatan verifikasi / alasan jika ditolak..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        disabled={busyId === req.uid}
                        onClick={() => void handleApproveRequest(req)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verifikasi & Aktifkan</span>
                      </button>
                      <button
                        type="button"
                        disabled={busyId === req.uid}
                        onClick={() => void handleRejectRequest(req)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: PEGAWAI AKTIF */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Daftar Pegawai Terverifikasi ({employees.length})
              </h4>
              {employees.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">
                  Belum ada pegawai yang ditetapkan aktif.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {employees.map((emp) => {
                    const isEditingThis = editingEmp?.uid === emp.uid;
                    const isConfirmDelete = confirmDeleteEmpUid === emp.uid;
                    return (
                      <div key={emp.uid} className="p-4 bg-white dark:bg-slate-950 space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="text-xs space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {emp.fullName}
                              </p>
                              <span className="font-mono-tabular text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                · NIP {emp.nip}
                              </span>
                              {emp.operatorRole !== 'pegawai' && (
                                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[10px] font-bold">
                                  {OPERATOR_ROLE_LABELS[emp.operatorRole]}
                                  {emp.operatorRole === 'operator_seksi' && emp.assignedUnitTitle
                                    ? ` (${emp.assignedUnitTitle})`
                                    : ''}
                                </span>
                              )}
                              {emp.unitCategory === 'kua_kecamatan' && (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                                  KUA Kecamatan
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">
                              {emp.jabatan} · {emp.unitKerja} · {emp.email}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <select
                              value={emp.unitCategory}
                              disabled={busyId === emp.uid}
                              onChange={(e) =>
                                void handleChangeEmployeeCategory(
                                  emp,
                                  e.target.value as EmployeeUnitCategory
                                )
                              }
                              aria-label={`Kategori satker ${emp.fullName}`}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                            >
                              <option value="kankemenag">Kankemenag Kab.</option>
                              <option value="kua_kecamatan">KUA Kecamatan</option>
                              <option value="madrasah">Madrasah Negeri</option>
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                isEditingThis ? setEditingEmp(null) : startEditVerifiedEmployee(emp)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isEditingThis ? 'Tutup' : 'Edit / Peran'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={busyId === emp.uid}
                              onClick={() => void handleToggleEmployee(emp)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                emp.status === 'active'
                                  ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {emp.status === 'active' ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Cabut</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Aktifkan</span>
                                </>
                              )}
                            </button>

                            {isConfirmDelete ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={busyId === `del-emp-${emp.uid}`}
                                  onClick={() => void handleDeleteEmployeeConfirm(emp)}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                                >
                                  Yakin Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteEmpUid(null)}
                                  className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteEmpUid(emp.uid)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditingThis && (
                          <form
                            onSubmit={(e) => void handleSaveEditVerifiedEmployee(e)}
                            className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
                          >
                            <input
                              type="text"
                              required
                              value={editEmpName}
                              onChange={(e) => setEditEmpName(e.target.value)}
                              placeholder="Nama Lengkap"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpNip}
                              onChange={(e) => setEditEmpNip(e.target.value)}
                              placeholder="NIP"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-tabular"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpJabatan}
                              onChange={(e) => setEditEmpJabatan(e.target.value)}
                              placeholder="Jabatan"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpUnitKerja}
                              onChange={(e) => setEditEmpUnitKerja(e.target.value)}
                              placeholder="Unit Kerja"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <select
                              value={editEmpRole}
                              onChange={(e) =>
                                setEditEmpRole(e.target.value as EmployeeOperatorRole)
                              }
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            >
                              <option value="pegawai">Peran: Pegawai Biasa</option>
                              <option value="operator_ptsp">Peran: Operator PTSP</option>
                              <option value="operator_seksi">Peran: Operator Seksi</option>
                            </select>
                            {editEmpRole === 'operator_seksi' ? (
                              <select
                                value={editEmpUnitId}
                                onChange={(e) =>
                                  setEditEmpUnitId(e.target.value as OperatorUnitAssignment)
                                }
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              >
                                {PTSP_UNIT_OPTIONS.map((unit) => (
                                  <option key={unit.id} value={unit.id}>
                                    Seksi: {unit.title}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={editEmpStatus}
                                onChange={(e) =>
                                  setEditEmpStatus(e.target.value as 'active' | 'revoked')
                                }
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              >
                                <option value="active">Status: Aktif</option>
                                <option value="revoked">Status: Nonaktif</option>
                              </select>
                            )}
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingEmp(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600"
                              >
                                Batal
                              </button>
                              <button
                                type="submit"
                                disabled={busyId === `edit-emp-${emp.uid}`}
                                className="px-4 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold"
                              >
                                Simpan Perubahan
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct NIP + Password Employee Provisioning by Super Admin */}
            <form
              onSubmit={(e) => void handleCreateNipEmployeeSubmit(e)}
              className="p-4 sm:p-5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3"
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                  Daftarkan Akun Pegawai Langsung (NIP & Password)
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Super Admin dapat membuatkan akun pegawai berbasis NIP dan Password awal agar
                  pegawai langsung bisa masuk lewat menu Login Pegawai.
                </p>
              </div>

              {newEmpError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {newEmpError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="Nama Lengkap Sesuai SK *"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={newEmpNip}
                  onChange={(e) => setNewEmpNip(sanitizeNipDigits(e.target.value))}
                  placeholder="NIP (8-20 digit angka) *"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-tabular"
                />
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newEmpPassword}
                  onChange={(e) => setNewEmpPassword(e.target.value)}
                  placeholder="Password Awal (min. 6 karakter) *"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <select
                  value={newEmpCategory}
                  onChange={(e) => {
                    const val = e.target.value as EmployeeUnitCategory;
                    setNewEmpCategory(val);
                    if (val === 'kua_kecamatan' && !newEmpUnitKerja.toLowerCase().includes('kua')) {
                      setNewEmpUnitKerja('KUA Kec. Murung');
                    }
                  }}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="kankemenag">Kantor Kemenag Kab. Murung Raya</option>
                  <option value="kua_kecamatan">KUA Kecamatan (Akses Tauliyah Wali Hakim)</option>
                  <option value="madrasah">Madrasah Negeri / Satker Pendidikan</option>
                </select>
                {newEmpCategory === 'kua_kecamatan' ? (
                  <select
                    value={newEmpUnitKerja}
                    onChange={(e) => setNewEmpUnitKerja(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {KUA_BRANCHES.map((kua) => {
                      const label = `KUA Kec. ${kua.kecamatan}`;
                      return (
                        <option key={kua.id} value={label}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={newEmpUnitKerja}
                    onChange={(e) => setNewEmpUnitKerja(e.target.value)}
                    placeholder="Unit Kerja / Satker *"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                )}
                <input
                  type="text"
                  required
                  value={newEmpJabatan}
                  onChange={(e) => setNewEmpJabatan(e.target.value)}
                  placeholder="Jabatan (Contoh: Kepala KUA / Staf) *"
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={busyId === 'create-nip-emp'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white text-xs font-bold transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>
                    {busyId === 'create-nip-emp'
                      ? 'Mendaftarkan Akun Pegawai...'
                      : 'Buat & Aktifkan Akun Pegawai NIP'}
                  </span>
                </button>
              </div>
            </form>

            {/* Tetapkan dari Akun Login Google */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tetapkan Pegawai / Operator dari Daftar Akun Login ({googleUsers.length})
              </h4>

              {promoteUser && (
                <form
                  onSubmit={handleManualPromoteSubmit}
                  className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 space-y-3"
                >
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Verifikasi & Tetapkan Peran Akun: {promoteUser.email}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={promoteName}
                      onChange={(e) => setPromoteName(e.target.value)}
                      placeholder="Nama Lengkap Sesuai SK"
                      className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      required
                      value={promoteNip}
                      onChange={(e) => setPromoteNip(e.target.value)}
                      placeholder="NIP / NI PPPK (min. 8 karakter)"
                      className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono-tabular"
                    />
                    <select
                      value={promoteCategory}
                      onChange={(e) => {
                        const val = e.target.value as EmployeeUnitCategory;
                        setPromoteCategory(val);
                        if (val === 'kua_kecamatan' && !promoteUnitKerja) {
                          setPromoteUnitKerja('KUA Kec. Murung');
                        }
                      }}
                      className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="kankemenag">Kantor Kemenag Kab. Murung Raya</option>
                      <option value="kua_kecamatan">KUA Kecamatan (Akses Tauliyah Wali Hakim)</option>
                      <option value="madrasah">Madrasah Negeri / Satker Pendidikan</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={promoteUnitKerja}
                      onChange={(e) => setPromoteUnitKerja(e.target.value)}
                      placeholder="Unit Kerja (Contoh: KUA Kec. Murung)"
                      className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <select
                      value={promoteOpRole}
                      onChange={(e) => setPromoteOpRole(e.target.value as EmployeeOperatorRole)}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="pegawai">Peran: Pegawai Biasa</option>
                      <option value="operator_ptsp">Peran: Operator PTSP</option>
                      <option value="operator_seksi">Peran: Operator Seksi</option>
                    </select>
                    {promoteOpRole === 'operator_seksi' ? (
                      <select
                        value={promoteOpUnitId}
                        onChange={(e) =>
                          setPromoteOpUnitId(e.target.value as OperatorUnitAssignment)
                        }
                        className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        {PTSP_UNIT_OPTIONS.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            Seksi: {unit.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={promoteJabatan}
                        onChange={(e) => setPromoteJabatan(e.target.value)}
                        placeholder="Jabatan (Contoh: Kepala KUA / Penghulu)"
                        className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    )}
                    {promoteOpRole === 'operator_seksi' && (
                      <input
                        type="text"
                        required
                        value={promoteJabatan}
                        onChange={(e) => setPromoteJabatan(e.target.value)}
                        placeholder="Jabatan (Contoh: Operator Seksi Bimas Islam)"
                        className="sm:col-span-2 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPromoteUser(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={busyId === promoteUser.uid}
                      className="px-4 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-bold"
                    >
                      Simpan & Aktifkan Akun
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {googleUsers.map((gu) => {
                  const alreadyActive = verifiedUidSet.has(gu.uid);
                  return (
                    <div
                      key={gu.uid}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {gu.displayName}
                        </p>
                        <p className="text-slate-500 truncate">{gu.email}</p>
                      </div>
                      {alreadyActive ? (
                        <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                          Terverifikasi
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPromoteUser(gu);
                            setPromoteName(gu.displayName);
                            setPromoteNip('');
                            setPromoteJabatan('');
                            setPromoteCategory('kankemenag');
                            setPromoteUnitKerja('');
                            setPromoteOpRole('pegawai');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold shrink-0"
                        >
                          Tetapkan Peran
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANTREAN TIKET CLOUD */}
        {activeTab === 'tickets' && (
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Belum ada tiket permohonan cloud yang masuk.
              </p>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-mono-tabular font-bold text-emerald-800 dark:text-emerald-400">
                          <Ticket className="w-3.5 h-3.5" />
                          {t.ticketNo}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold uppercase">
                          {t.accountTier === 'pegawai'
                            ? 'Pegawai'
                            : t.accountTier === 'admin'
                            ? 'Super Admin'
                            : 'Masyarakat'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.serviceTitle}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {t.applicantName} {t.nip ? `(NIP ${t.nip})` : ''} · {t.phone} ·{' '}
                        {t.userEmail} · {t.unitTitle}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-bold shrink-0 w-fit ${
                        t.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'Menunggu Berkas'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <input
                      type="text"
                      value={ticketNotes[t.id] ?? t.adminNote ?? ''}
                      onChange={(e) =>
                        setTicketNotes((prev) => ({ ...prev, [t.id]: e.target.value }))
                      }
                      placeholder="Catatan petugas untuk pemohon..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {(['Diproses Verifikasi', 'Menunggu Berkas', 'Selesai'] as const).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => void handleUpdateTicket(t, st)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                              t.status === st
                                ? 'bg-slate-900 text-white dark:bg-emerald-700'
                                : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
