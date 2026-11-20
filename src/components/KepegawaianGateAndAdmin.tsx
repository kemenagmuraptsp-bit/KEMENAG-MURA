import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  CheckSquare,
  Clock,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  Image as ImageIcon,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Newspaper,
  Paperclip,
  Phone,
  PlusCircle,
  Printer,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Square,
  Ticket,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import {
  KUA_BRANCHES,
  NEWS_ARTICLES,
  OFFICIAL_NEWS_IMAGE_PRESETS,
  PTSP_UNIT_OPTIONS,
  SERVICE_UNITS,
} from '@/src/data/kemenagData';
import type { NewsArticle } from '@/src/types';
import { SafeImage } from '@/src/components/SafeImage';
import { TicketAttachmentPreviewModal } from '@/src/components/RequirementUploadSection';
import { OfficialTteDocumentModal } from '@/src/components/OfficialTteDocumentModal';
import {
  formatAttachmentBytes,
  generateSuggestedTteDocNumber,
} from '@/src/utils/serviceDocumentTemplates';
import {
  approveEmployeeVerification,
  deleteNewsArticle,
  deleteVerifiedEmployeeAccount,
  fetchTicketAttachments,
  mapFirebaseAuthError,
  pimpinanEndorseTteTicket,
  provisionEmployeeAccountByAdmin,
  ptspVerifyAndDispatchTicket,
  rejectEmployeeVerification,
  restoreBuiltInNewsArticle,
  sanitizeNipDigits,
  saveNewsArticle,
  seksiInspectAndSendTteTicket,
  submitEmployeeVerificationRequest,
  subscribeAllEmployeeRequests,
  subscribeAllGoogleUsers,
  subscribeAllVerifiedEmployees,
  subscribePtspTickets,
  toggleVerifiedEmployeeStatus,
  updateCloudTicketStatus,
  updateVerifiedEmployeeCategory,
  updateVerifiedEmployeeDetails,
  type CloudPtspTicketAttachment,
  type CloudPtspTicketRecord,
  type EmployeeOperatorRole,
  type EmployeeRequestRecord,
  type EmployeeUnitCategory,
  type OperatorUnitAssignment,
  type PtspTicketStatus,
  type SeksiUnitId,
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
  pimpinan: 'Pimpinan (Pengesahan TTE)',
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

const SEKSI_SHORT_BADGE: Record<string, string> = {
  sekretariat: 'SEKRETARIAT',
  'bimas-islam': 'BIMAS ISLAM',
  pendis: 'PENDIS',
  'bimas-hindu': 'BIMAS HINDU',
  'bimas-kristen': 'BIMAS KRISTEN',
  kepegawaian: 'KEPEGAWAIAN',
};

function resolveTicketRequirements(ticket: CloudPtspTicketRecord): string[] {
  const unit = SERVICE_UNITS.find((u) => u.id === ticket.unitId);
  const sub =
    unit?.subServices.find((s) => s.id === ticket.subServiceId) ||
    unit?.subServices.find((s) => s.title.toLowerCase() === ticket.serviceTitle.toLowerCase());
  if (sub && sub.requirements.length > 0) {
    return sub.requirements;
  }
  return [
    'Surat Permohonan / Formulir Resmi Layanan',
    'Identitas Pemohon (KTP / NIP / Kartu Pegawai)',
    'Dokumen Pendukung Kelengkapan Usulan',
  ];
}

function parseCheckedPattern(pattern: string | undefined, total: number): boolean[] {
  const result: boolean[] = [];
  for (let i = 0; i < total; i += 1) {
    result.push(pattern?.[i] === '1');
  }
  return result;
}

function encodeCheckedPattern(flags: boolean[]): string {
  return flags.map((f) => (f ? '1' : '0')).join('');
}

function resolveDefaultSeksiUnit(unitId: string): SeksiUnitId {
  const found = PTSP_UNIT_OPTIONS.find((u) => u.id === unitId);
  return (found ? found.id : 'sekretariat') as SeksiUnitId;
}

function getTicketStatusBadgeClass(status: PtspTicketStatus): string {
  switch (status) {
    case 'TTE Sah (Selesai)':
    case 'Selesai':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case 'Siap TTE':
      return 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    case 'Disposisi ke Seksi':
    case 'Telaah Seksi':
      return 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
    case 'Diterima PTSP':
      return 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    case 'Ditolak PTSP':
      return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    case 'Perlu Revisi':
    case 'Menunggu Berkas':
      return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case 'Diproses Verifikasi':
    default:
      return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
  }
}

function getTicketDisplayStatus(status: PtspTicketStatus): string {
  return status === 'Diproses Verifikasi' ? 'Menunggu Verifikasi' : status;
}

function formatTicketActionError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? 'Gagal memproses tiket.');
  if (raw.includes('Missing or insufficient permissions') || raw.includes('permission-denied')) {
    return 'Akses pembaruan tiket ditolak oleh aturan keamanan Firestore. Pastikan akun Operator aktif di Konsol Super Admin dan aturan Firestore terbaru sudah diterapkan. Detail: ' + raw;
  }
  return raw;
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
    isPimpinan,
    assignedUnitTitle,
    myVerifiedEmployee,
    isVerifiedEmployee,
    isVerifiedKuaEmployee,
    openLoginModal,
    signOut,
    clearAuthError,
  } = useAuthRole();

  const isAnyOperator = !isAdmin && (isOperatorPtsp || isOperatorSeksi || isPimpinan);

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
                  : isPimpinan
                  ? 'Mode Pimpinan — Pengesahan TTE Layanan'
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
                  <strong>Operator PTSP, Seksi &amp; Pimpinan</strong>, memverifikasi pegawai,
                  serta memproses tiket PTSP.
                </>
              ) : isPimpinan ? (
                <>
                  <strong className="font-semibold">
                    {myVerifiedEmployee?.fullName || user?.displayName}
                  </strong>{' '}
                  ({myVerifiedEmployee?.jabatan} · {myVerifiedEmployee?.unitKerja}). Anda bertugas
                  sebagai <strong>Pimpinan</strong> untuk meninjau dan mengesahkan dokumen{' '}
                  <strong>TTE</strong> layanan PTSP.
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
                  ? isPimpinan
                    ? 'Tutup Konsol Pimpinan'
                    : 'Tutup Konsol Operator'
                  : isPimpinan
                  ? 'Konsol TTE Pimpinan'
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
  const {
    user,
    isAdmin,
    isOperatorPtsp,
    isOperatorSeksi,
    isPimpinan,
    assignedUnitId,
    assignedUnitTitle,
    myVerifiedEmployee,
  } = useAuthRole();
  const [tickets, setTickets] = useState<CloudPtspTicketRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [activeTicket, setActiveTicket] = useState<CloudPtspTicketRecord | null>(null);
  const [previewTicket, setPreviewTicket] = useState<{
    ticket: CloudPtspTicketRecord;
    mode: 'resi' | 'tte';
  } | null>(null);

  const [checkedFlags, setCheckedFlags] = useState<boolean[]>([]);
  const [modalNote, setModalNote] = useState('');
  const [targetSeksiId, setTargetSeksiId] = useState<SeksiUnitId>('sekretariat');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [modalFeedback, setModalFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [listErrorMsg, setListErrorMsg] = useState('');

  const [modalAttachments, setModalAttachments] = useState<CloudPtspTicketAttachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<CloudPtspTicketAttachment | null>(null);
  const [tteDocNumberInput, setTteDocNumberInput] = useState('');

  useEffect(() => {
    if (!user || isAdmin || (!isOperatorPtsp && !isOperatorSeksi && !isPimpinan)) return;
    setListErrorMsg('');
    const scope: TicketSubscriptionScope =
      isOperatorPtsp || isPimpinan ? { mode: 'all' } : { mode: 'unit', unitId: assignedUnitId };
    const unsub = subscribePtspTickets(
      user,
      scope,
      setTickets,
      (err) => {
        setListErrorMsg(formatTicketActionError(err));
      }
    );
    return () => unsub();
  }, [user, isAdmin, isOperatorPtsp, isOperatorSeksi, isPimpinan, assignedUnitId]);

  useEffect(() => {
    if (!activeTicket) {
      setModalAttachments([]);
      setAttachmentsLoading(false);
      setAttachmentsError('');
      return;
    }
    let cancelled = false;
    setAttachmentsLoading(true);
    setAttachmentsError('');
    setModalAttachments([]);
    fetchTicketAttachments(activeTicket.id)
      .then((rows) => {
        if (!cancelled) setModalAttachments(rows);
      })
      .catch((err) => {
        if (!cancelled) setAttachmentsError(formatTicketActionError(err));
      })
      .finally(() => {
        if (!cancelled) setAttachmentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTicket?.id]);

  const operatorDisplayName =
    myVerifiedEmployee?.fullName ||
    user?.displayName ||
    (isPimpinan ? 'Pimpinan Kemenag Mura' : isOperatorPtsp ? 'Operator PTSP' : 'Operator Seksi');

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter === 'perlu_aksi') {
        if (isOperatorPtsp && t.status !== 'Diproses Verifikasi' && t.status !== 'Diterima PTSP') {
          return false;
        }
        if (isOperatorSeksi && t.status !== 'Disposisi ke Seksi' && t.status !== 'Telaah Seksi') {
          return false;
        }
        if (isPimpinan && t.status !== 'Siap TTE') {
          return false;
        }
      } else if (statusFilter === 'disposisi') {
        if (t.status !== 'Disposisi ke Seksi' && t.status !== 'Telaah Seksi') return false;
      } else if (statusFilter === 'revisi_tolak') {
        if (
          t.status !== 'Ditolak PTSP' &&
          t.status !== 'Perlu Revisi' &&
          t.status !== 'Menunggu Berkas'
        ) {
          return false;
        }
      } else if (statusFilter === 'tte') {
        if (
          t.status !== 'Siap TTE' &&
          t.status !== 'TTE Sah (Selesai)' &&
          t.status !== 'Selesai'
        ) {
          return false;
        }
      }

      if (!q) return true;
      return (
        t.ticketNo.toLowerCase().includes(q) ||
        t.applicantName.toLowerCase().includes(q) ||
        t.serviceTitle.toLowerCase().includes(q) ||
        (t.institution || '').toLowerCase().includes(q) ||
        t.unitTitle.toLowerCase().includes(q)
      );
    });
  }, [tickets, searchQuery, statusFilter, isOperatorPtsp, isOperatorSeksi, isPimpinan]);

  if (!user || isAdmin || (!isOperatorPtsp && !isOperatorSeksi && !isPimpinan)) return null;

  const openInspectModal = (ticket: CloudPtspTicketRecord) => {
    const reqs = resolveTicketRequirements(ticket);
    setActiveTicket(ticket);
    setCheckedFlags(parseCheckedPattern(ticket.checkedDocsPattern, reqs.length));
    setModalNote(ticket.adminNote || '');
    setTargetSeksiId(ticket.dispatchedUnitId || resolveDefaultSeksiUnit(ticket.unitId));
    setTteDocNumberInput(ticket.tteDocNumber || generateSuggestedTteDocNumber(ticket));
    setErrorMsg('');
    setModalFeedback('');
  };

  const toggleCheckIndex = (idx: number) => {
    setCheckedFlags((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const handleCheckAll = (checked: boolean) => {
    setCheckedFlags((prev) => prev.map(() => checked));
  };

  const handlePtspAction = async (
    nextStatus: 'Diterima PTSP' | 'Ditolak PTSP' | 'Disposisi ke Seksi' | 'Perlu Revisi'
  ) => {
    if (!activeTicket) return;
    setErrorMsg('');
    setModalFeedback('');
    setFeedback('');

    if (nextStatus === 'Ditolak PTSP' && modalNote.trim().length < 5) {
      setErrorMsg('Tuliskan alasan penolakan tiket pada kolom catatan agar jelas bagi pemohon.');
      return;
    }

    const totalDocsCount = checkedFlags.length;
    const verifiedDocsCount = checkedFlags.filter(Boolean).length;
    const checkedDocsPattern = encodeCheckedPattern(checkedFlags);
    const chosenUnit = PTSP_UNIT_OPTIONS.find((u) => u.id === targetSeksiId);
    const resolvedNote =
      modalNote.trim() ||
      (nextStatus === 'Diterima PTSP'
        ? 'Tiket telah diverifikasi dan diterima oleh Operator PTSP.'
        : nextStatus === 'Disposisi ke Seksi'
        ? `Tiket telah diteruskan Operator PTSP ke ${chosenUnit?.title || targetSeksiId}.`
        : '');

    setBusyAction(nextStatus);
    try {
      await ptspVerifyAndDispatchTicket({
        ticketId: activeTicket.id,
        status: nextStatus,
        adminNote: resolvedNote,
        operatorName: operatorDisplayName,
        dispatchedToSeksi: nextStatus === 'Disposisi ke Seksi',
        dispatchedUnitId: nextStatus === 'Disposisi ke Seksi' ? targetSeksiId : undefined,
        dispatchedUnitTitle:
          nextStatus === 'Disposisi ke Seksi' ? chosenUnit?.title || targetSeksiId : undefined,
        checkedDocsPattern,
        verifiedDocsCount,
        totalDocsCount,
      });

      if (nextStatus === 'Diterima PTSP') {
        setActiveTicket((prev) =>
          prev
            ? {
                ...prev,
                status: 'Diterima PTSP',
                adminNote: resolvedNote,
                checkedDocsPattern,
                verifiedDocsCount,
                totalDocsCount,
              }
            : null
        );
        setModalFeedback(
          'Tiket ditandai Diterima PTSP. Pilih Seksi tujuan di bawah lalu klik "Kirim ke Seksi".'
        );
      } else {
        setFeedback(
          nextStatus === 'Disposisi ke Seksi'
            ? `Tiket ${activeTicket.ticketNo} berhasil dikirim ke ${chosenUnit?.title || targetSeksiId}.`
            : `Tiket ${activeTicket.ticketNo} diperbarui menjadi "${nextStatus}".`
        );
        setActiveTicket(null);
      }
    } catch (err) {
      setErrorMsg(formatTicketActionError(err));
    } finally {
      setBusyAction(null);
    }
  };

  const handleSeksiAction = async (nextStatus: 'Telaah Seksi' | 'Perlu Revisi' | 'Siap TTE') => {
    if (!activeTicket) return;
    setErrorMsg('');
    setFeedback('');

    const totalDocsCount = checkedFlags.length;
    const verifiedDocsCount = checkedFlags.filter(Boolean).length;
    const checkedDocsPattern = encodeCheckedPattern(checkedFlags);

    if (nextStatus === 'Perlu Revisi' && modalNote.trim().length < 5) {
      setErrorMsg('Tuliskan dokumen/berkas yang perlu direvisi pada kolom catatan.');
      return;
    }
    if (nextStatus === 'Siap TTE' && verifiedDocsCount < totalDocsCount) {
      setErrorMsg(
        `Masih ada ${totalDocsCount - verifiedDocsCount} dokumen persyaratan yang belum dicentang valid. Centang seluruh kelengkapan berkas sebelum dikirim ke Pimpinan untuk proses TTE.`
      );
      return;
    }

    setBusyAction(nextStatus);
    try {
      await seksiInspectAndSendTteTicket({
        ticketId: activeTicket.id,
        status: nextStatus,
        seksiReviewer: operatorDisplayName,
        adminNote:
          modalNote.trim() ||
          (nextStatus === 'Siap TTE'
            ? `Seluruh ${totalDocsCount} berkas usulan telah diperiksa lengkap oleh ${
                assignedUnitTitle || 'Operator Seksi'
              } dan diteruskan ke Pimpinan untuk TTE.`
            : nextStatus === 'Telaah Seksi'
            ? `Berkas sedang ditelaah oleh ${assignedUnitTitle || 'Operator Seksi'} (${verifiedDocsCount}/${totalDocsCount} dokumen valid).`
            : ''),
        tteLeaderNote:
          nextStatus === 'Siap TTE'
            ? modalNote.trim() ||
              `Usulan lengkap (${verifiedDocsCount}/${totalDocsCount} berkas valid) — Siap Tanda Tangan Elektronik (TTE) Pimpinan.`
            : undefined,
        checkedDocsPattern,
        verifiedDocsCount,
        totalDocsCount,
      });

      setFeedback(
        nextStatus === 'Siap TTE'
          ? `Berkas tiket ${activeTicket.ticketNo} lengkap (${verifiedDocsCount}/${totalDocsCount}) dan telah dikirim ke Pimpinan untuk proses TTE.`
          : `Hasil pemeriksaan tiket ${activeTicket.ticketNo} (${nextStatus}) berhasil disimpan.`
      );
      setActiveTicket(null);
    } catch (err) {
      setErrorMsg(formatTicketActionError(err));
    } finally {
      setBusyAction(null);
    }
  };

  const handlePimpinanAction = async (nextStatus: 'TTE Sah (Selesai)' | 'Perlu Revisi') => {
    if (!activeTicket) return;
    setErrorMsg('');
    setFeedback('');

    if (nextStatus === 'Perlu Revisi' && modalNote.trim().length < 5) {
      setErrorMsg('Tuliskan catatan perbaikan sebelum mengembalikan berkas untuk revisi.');
      return;
    }

    setBusyAction(nextStatus);
    try {
      const resolvedNote =
        modalNote.trim() ||
        `Disahkan melalui Tanda Tangan Elektronik (TTE) oleh ${operatorDisplayName}.`;
      const resolvedDocNumber =
        tteDocNumberInput.trim() || generateSuggestedTteDocNumber(activeTicket);
      const resolvedSignerTitle = myVerifiedEmployee?.jabatan
        ? `${myVerifiedEmployee.jabatan}\n${myVerifiedEmployee.unitKerja}`
        : 'Kepala Kantor Kementerian Agama\nKabupaten Murung Raya';

      await pimpinanEndorseTteTicket({
        ticketId: activeTicket.id,
        status: nextStatus,
        adminNote: resolvedNote,
        tteLeaderNote: resolvedNote,
        ...(nextStatus === 'TTE Sah (Selesai)'
          ? {
              tteDocNumber: resolvedDocNumber,
              tteSignerName: operatorDisplayName,
              tteSignerTitle: resolvedSignerTitle,
              tteSignerNip: myVerifiedEmployee?.nip || '197005121998031004',
              tteSignedAtLabel: getTodayIndonesianDate(),
            }
          : {}),
      });
      setFeedback(
        nextStatus === 'TTE Sah (Selesai)'
          ? `Tiket ${activeTicket.ticketNo} berhasil disahkan TTE (${resolvedDocNumber}) oleh ${operatorDisplayName}.`
          : `Tiket ${activeTicket.ticketNo} dikembalikan untuk revisi berkas.`
      );
      setActiveTicket(null);
    } catch (err) {
      setErrorMsg(formatTicketActionError(err));
    } finally {
      setBusyAction(null);
    }
  };

  const pendingPtspCount = tickets.filter((t) => t.status === 'Diproses Verifikasi').length;
  const readySeksiCount = tickets.filter((t) => t.status === 'Disposisi ke Seksi').length;
  const readyPimpinanTteCount = tickets.filter((t) => t.status === 'Siap TTE').length;
  const siapkanTteCount = tickets.filter(
    (t) => t.status === 'Siap TTE' || t.status === 'TTE Sah (Selesai)' || t.status === 'Selesai'
  ).length;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-md">
      {/* Header Console */}
      <div className="p-5 sm:p-6 bg-slate-50/90 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            {isPimpinan
              ? 'Konsol Pimpinan — Pengesahan Tanda Tangan Elektronik (TTE)'
              : isOperatorPtsp
              ? 'Konsol Operator PTSP — Verifikasi & Disposisi Layanan'
              : `Konsol Operator Seksi — ${assignedUnitTitle || assignedUnitId}`}
          </p>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {isPimpinan
              ? `Antrean Layanan & Pengesahan TTE Pimpinan (${tickets.length})`
              : isOperatorPtsp
              ? `Seluruh Tiket Pengajuan Pemohon (${tickets.length})`
              : `Tiket Disposisi dari Operator PTSP (${tickets.length})`}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isPimpinan
              ? 'Tinjau hasil telaah Operator Seksi pada tiket berstatus Siap TTE lalu sahkan dengan TTE.'
              : isOperatorPtsp
              ? 'Verifikasi permohonan masuk (Diterima / Ditolak) kemudian kirim ke Seksi tujuan.'
              : 'Periksa kelengkapan berkas usulan yang dikirim Operator PTSP lalu kirim ke Pimpinan untuk proses TTE.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 mr-1.5">
              {isPimpinan
                ? 'Menunggu TTE:'
                : isOperatorPtsp
                ? 'Menunggu Verifikasi:'
                : 'Disposisi Baru:'}
            </span>
            <strong className="font-mono-tabular text-blue-700 dark:text-blue-400">
              {isPimpinan ? readyPimpinanTteCount : isOperatorPtsp ? pendingPtspCount : readySeksiCount}
            </strong>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 mr-1.5">Siap / Sah TTE:</span>
            <strong className="font-mono-tabular text-emerald-700 dark:text-emerald-400">
              {siapkanTteCount}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. resi, layanan, nama pemohon, atau instansi..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(
            [
              { id: 'semua', label: 'Semua' },
              {
                id: 'perlu_aksi',
                label: isPimpinan
                  ? 'Menunggu TTE'
                  : isOperatorPtsp
                  ? 'Perlu Verifikasi'
                  : 'Perlu Telaah',
              },
              ...(isOperatorPtsp ? [{ id: 'disposisi', label: 'Terkirim ke Seksi' }] : []),
              { id: 'revisi_tolak', label: 'Revisi / Ditolak' },
              { id: 'tte', label: 'Proses & Sah TTE' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {listErrorMsg && (
        <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-900 px-4 py-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{listErrorMsg}</span>
        </div>
      )}

      {feedback && (
        <div className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 dark:border-emerald-800 px-4 py-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 5-Column Operator Table Matching Reference UI */}
      {filteredTickets.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-500">
          {tickets.length === 0
            ? isOperatorPtsp
              ? 'Belum ada tiket permohonan pemohon yang masuk.'
              : `Belum ada tiket yang dikirim oleh Operator PTSP ke ${
                  assignedUnitTitle || 'seksi ini'
                }.`
            : 'Tidak ada tiket yang cocok dengan filter pencarian Anda.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">No. Resi &amp; Tanggal</th>
                <th className="py-3.5 px-4">Layanan &amp; Seksi</th>
                <th className="py-3.5 px-4">Pemohon / Instansi</th>
                <th className="py-3.5 px-4">Status &amp; Progres</th>
                <th className="py-3.5 px-5 text-right">Aksi Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredTickets.map((t) => {
                const reqs = resolveTicketRequirements(t);
                const totalDocs = t.totalDocsCount ?? reqs.length;
                const validDocs = t.verifiedDocsCount ?? 0;
                const seksiCode =
                  SEKSI_SHORT_BADGE[t.dispatchedUnitId || t.unitId] ||
                  t.unitTitle.toUpperCase();
                const isActionNeeded =
                  (isOperatorPtsp &&
                    (t.status === 'Diproses Verifikasi' || t.status === 'Diterima PTSP')) ||
                  (isOperatorSeksi &&
                    (t.status === 'Disposisi ke Seksi' || t.status === 'Telaah Seksi')) ||
                  (isPimpinan && t.status === 'Siap TTE');
                const hasTteDocument =
                  t.status === 'TTE Sah (Selesai)' || t.status === 'Selesai';

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* NO. RESI & TANGGAL */}
                    <td className="py-4 px-5 align-top whitespace-nowrap">
                      <p className="font-mono-tabular font-extrabold text-slate-900 dark:text-white text-xs">
                        {t.ticketNo}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.submittedAtLabel}</p>
                    </td>

                    {/* LAYANAN & SEKSI */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wide">
                          {seksiCode}
                        </span>
                        {t.dispatchedToSeksi && t.dispatchedUnitTitle && (
                          <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                            · Seksi Tujuan
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                        {t.serviceTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {t.notes || t.unitTitle}
                      </p>
                    </td>

                    {/* PEMOHON / INSTANSI */}
                    <td className="py-4 px-4 align-top max-w-[230px]">
                      <p className="font-bold text-slate-900 dark:text-white leading-snug">
                        {t.applicantName}
                        {t.nip ? (
                          <span className="font-mono-tabular text-[11px] font-normal text-slate-500">
                            {' '}
                            (NIP {t.nip})
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 truncate mt-0.5">
                        {t.institution || t.userEmail}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono-tabular mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{t.phone}</span>
                      </p>
                    </td>

                    {/* STATUS & PROGRES */}
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${getTicketStatusBadgeClass(
                          t.status
                        )}`}
                      >
                        {getTicketDisplayStatus(t.status)}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        {validDocs} dari {totalDocs} dokumen valid
                        {typeof t.uploadedDocsCount === 'number'
                          ? ` · ${t.uploadedDocsCount} berkas terunggah`
                          : ''}
                      </p>
                    </td>

                    {/* AKSI OPERATOR */}
                    <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewTicket({ ticket: t, mode: 'resi' })}
                          title="Cetak / Pratinjau Resi"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {(hasTteDocument || isPimpinan || t.status === 'Siap TTE') && (
                          <button
                            type="button"
                            onClick={() => setPreviewTicket({ ticket: t, mode: 'tte' })}
                            title={
                              hasTteDocument ? 'Dokumen Sah TTE' : 'Pratinjau Draf Dokumen TTE'
                            }
                            className="p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                          >
                            <FileCheck2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openInspectModal(t)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                            isActionNeeded
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                              : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isActionNeeded ? (
                            <CheckSquare className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          <span>{isActionNeeded ? 'Proses Berkas' : 'Detail Berkas'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL PROSES / DETAIL BERKAS OPERATOR PTSP & SEKSI */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-tabular text-xs font-extrabold text-teal-800 dark:text-teal-300">
                    {activeTicket.ticketNo}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getTicketStatusBadgeClass(
                      activeTicket.status
                    )}`}
                  >
                    {getTicketDisplayStatus(activeTicket.status)}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {activeTicket.serviceTitle}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Identitas Pemohon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 block">Pemohon</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeTicket.applicantName}
                    {activeTicket.nip ? ` (NIP ${activeTicket.nip})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Instansi / Kontak</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeTicket.institution || activeTicket.userEmail} · {activeTicket.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Bidang Layanan Asal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeTicket.unitTitle}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Disposisi / TTE</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-300">
                    {activeTicket.dispatchedToSeksi
                      ? `Dikirim ke ${activeTicket.dispatchedUnitTitle}${
                          activeTicket.dispatchedBy ? ` (${activeTicket.dispatchedBy})` : ''
                        }`
                      : 'Menunggu verifikasi awal loket PTSP'}
                  </span>
                </div>
                {activeTicket.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block">Keterangan Pemohon</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">{activeTicket.notes}</p>
                  </div>
                )}
              </div>

              {/* Checklist Kelengkapan Berkas Persyaratan & Unggahan Pemohon */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Pemeriksaan Kelengkapan Berkas Persyaratan
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {checkedFlags.filter(Boolean).length} dari {checkedFlags.length} dokumen
                      persyaratan dinyatakan valid ·{' '}
                      {attachmentsLoading
                        ? 'Memuat berkas unggahan...'
                        : `${modalAttachments.length} berkas diunggah pemohon`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCheckAll(checkedFlags.filter(Boolean).length < checkedFlags.length)
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-[11px] text-slate-700 dark:text-slate-200"
                  >
                    {checkedFlags.filter(Boolean).length < checkedFlags.length
                      ? 'Centang Semua Valid'
                      : 'Kosongkan Centang'}
                  </button>
                </div>

                {attachmentsError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-3.5 py-2 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="break-words">{attachmentsError}</span>
                  </div>
                )}

                {!attachmentsLoading && modalAttachments.length === 0 && !attachmentsError && (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 px-3.5 py-2.5 text-[11px] text-slate-500 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Belum ada berkas digital yang dilampirkan pada tiket ini (pemohon membawa fisik atau tiket lama).
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {(() => {
                    const reqs = resolveTicketRequirements(activeTicket);
                    const matchedAtts = modalAttachments.filter(
                      (a) => a.requirementIndex >= 0 && a.requirementIndex < reqs.length
                    );
                    const extraAtts = modalAttachments.filter(
                      (a) => a.requirementIndex < 0 || a.requirementIndex >= reqs.length
                    );
                    return (
                      <>
                        {reqs.map((reqText, idx) => {
                          const isChecked = Boolean(checkedFlags[idx]);
                          const rowAtts = matchedAtts.filter((a) => a.requirementIndex === idx);
                          return (
                            <div
                              key={`${reqText}-${idx}`}
                              className={`rounded-xl border p-3 transition-colors space-y-2 ${
                                isChecked
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleCheckIndex(idx)}
                                className="w-full text-left flex items-start gap-2.5"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                )}
                                <span className="leading-relaxed font-medium">{reqText}</span>
                              </button>

                              {rowAtts.length > 0 && (
                                <div className="pl-6 space-y-1.5">
                                  {rowAtts.map((att) => (
                                    <div
                                      key={att.id}
                                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px]"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Paperclip className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                                        <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[230px]">
                                          {att.fileName}
                                        </span>
                                        <span className="font-mono-tabular text-[10px] text-slate-500 shrink-0">
                                          {att.mimeType === 'application/pdf' ? 'PDF' : 'IMG'} ·{' '}
                                          {formatAttachmentBytes(att.fileSize)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => setPreviewAttachment(att)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 font-bold"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>Lihat Berkas</span>
                                        </button>
                                        <a
                                          href={att.dataUrl}
                                          download={att.fileName}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold"
                                        >
                                          <Download className="w-3 h-3" />
                                          <span>Unduh</span>
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {extraAtts.length > 0 && (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 space-y-2">
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Berkas Tambahan Lainnya
                            </p>
                            {extraAtts.map((att) => (
                              <div
                                key={att.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px]"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Paperclip className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                                  <span className="font-semibold truncate max-w-[230px]">
                                    {att.fileName}
                                  </span>
                                  <span className="font-mono-tabular text-[10px] text-slate-500">
                                    {formatAttachmentBytes(att.fileSize)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewAttachment(att)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-bold"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Lihat Berkas</span>
                                  </button>
                                  <a
                                    href={att.dataUrl}
                                    download={att.fileName}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-semibold"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Unduh</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Catatan Petugas */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Catatan Pemeriksaan / Tindak Lanjut{' '}
                  {isPimpinan
                    ? 'Pimpinan (TTE)'
                    : isOperatorPtsp
                    ? 'Operator PTSP'
                    : 'Operator Seksi'}
                </label>
                <textarea
                  rows={2}
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="Tuliskan hasil verifikasi berkas, alasan penolakan/revisi, atau pengantar TTE untuk Pimpinan..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:border-teal-600"
                />
              </div>

              {modalFeedback && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-800 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="min-w-0 break-words">{modalFeedback}</span>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-900 px-4 py-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{errorMsg}</span>
                </div>
              )}

              {/* AKSI OPERATOR PTSP */}
              {isOperatorPtsp && (
                <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handlePtspAction('Diterima PTSP')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{busyAction === 'Diterima PTSP' ? 'Menyimpan...' : 'Tiket Diterima'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handlePtspAction('Ditolak PTSP')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{busyAction === 'Ditolak PTSP' ? 'Menyimpan...' : 'Tiket Ditolak'}</span>
                    </button>
                  </div>

                  {/* Kirim ke Seksi Tujuan */}
                  <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 space-y-2.5">
                    <p className="text-xs font-extrabold text-teal-900 dark:text-teal-200">
                      Kirim / Disposisikan ke Seksi yang Dituju
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={targetSeksiId}
                        onChange={(e) => setTargetSeksiId(e.target.value as SeksiUnitId)}
                        className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900"
                      >
                        {PTSP_UNIT_OPTIONS.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={busyAction !== null}
                        onClick={() => void handlePtspAction('Disposisi ke Seksi')}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold transition-colors shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {busyAction === 'Disposisi ke Seksi'
                            ? 'Mengirim ke Seksi...'
                            : 'Kirim ke Seksi'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AKSI OPERATOR SEKSI */}
              {isOperatorSeksi && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyAction !== null}
                        onClick={() => void handleSeksiAction('Perlu Revisi')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>
                          {busyAction === 'Perlu Revisi' ? 'Menyimpan...' : 'Perlu Revisi Berkas'}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={busyAction !== null}
                        onClick={() => void handleSeksiAction('Telaah Seksi')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-600 text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950 font-bold transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        <span>
                          {busyAction === 'Telaah Seksi' ? 'Menyimpan...' : 'Simpan Telaah Seksi'}
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handleSeksiAction('Siap TTE')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white font-bold transition-colors shadow-xs"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>
                        {busyAction === 'Siap TTE'
                          ? 'Mengirim ke Pimpinan...'
                          : 'Kirim ke Pimpinan (Proses TTE)'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* AKSI PIMPINAN (PENGESAHAN TTE) */}
              {isPimpinan && (
                <div className="space-y-3.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                      Nomor Surat / Dokumen Resmi TTE (Otomatis Sesuai Layanan)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={tteDocNumberInput}
                        onChange={(e) => setTteDocNumberInput(e.target.value)}
                        placeholder="Nomor dokumen TTE resmi..."
                        className="flex-1 px-3 py-2 text-xs font-mono-tabular font-semibold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewTicket({
                            ticket: {
                              ...activeTicket,
                              tteDocNumber:
                                tteDocNumberInput.trim() ||
                                activeTicket.tteDocNumber ||
                                generateSuggestedTteDocNumber(activeTicket),
                              tteSignerName: activeTicket.tteSignerName || operatorDisplayName,
                            },
                            mode: 'tte',
                          })
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 font-bold text-xs shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau Dokumen TTE</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handlePimpinanAction('Perlu Revisi')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {busyAction === 'Perlu Revisi'
                          ? 'Menyimpan...'
                          : 'Kembalikan Revisi Berkas'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handlePimpinanAction('TTE Sah (Selesai)')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold transition-colors shadow-xs"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>
                        {busyAction === 'TTE Sah (Selesai)'
                          ? 'Mengesahkan TTE...'
                          : 'Sahkan TTE Pimpinan (Selesai)'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IN-APP MODAL PRATINJAU LAMPIRAN BERKAS PEMOHON */}
      <TicketAttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      {/* IN-APP MODAL DOKUMEN RESI / TTE RESMI SESUAI LAYANAN (TANPA window.open) */}
      <OfficialTteDocumentModal
        ticket={previewTicket?.ticket ?? null}
        mode={previewTicket?.mode || 'resi'}
        onClose={() => setPreviewTicket(null)}
      />
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
    'news' | 'operators' | 'pimpinan' | 'requests' | 'employees' | 'tickets'
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

  // ---- PIMPINAN CRUD STATE ----
  const [leadName, setLeadName] = useState('');
  const [leadNip, setLeadNip] = useState('');
  const [leadPassword, setLeadPassword] = useState('');
  const [leadJabatan, setLeadJabatan] = useState('Kepala Kantor Kemenag Kab. Murung Raya');
  const [leadUnitKerja, setLeadUnitKerja] = useState('Kantor Kemenag Kab. Murung Raya');
  const [leadCategory, setLeadCategory] = useState<EmployeeUnitCategory>('kankemenag');
  const [leadFormError, setLeadFormError] = useState('');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');

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

  // Admin ticket attachment inspection & TTE document preview
  const [adminInspectTicket, setAdminInspectTicket] = useState<CloudPtspTicketRecord | null>(null);
  const [adminAttachments, setAdminAttachments] = useState<CloudPtspTicketAttachment[]>([]);
  const [adminAttLoading, setAdminAttLoading] = useState(false);
  const [adminAttError, setAdminAttError] = useState('');
  const [adminPreviewAtt, setAdminPreviewAtt] = useState<CloudPtspTicketAttachment | null>(null);
  const [adminDocPreview, setAdminDocPreview] = useState<{
    ticket: CloudPtspTicketRecord;
    mode: 'resi' | 'tte';
  } | null>(null);

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

  useEffect(() => {
    if (!adminInspectTicket) {
      setAdminAttachments([]);
      setAdminAttLoading(false);
      setAdminAttError('');
      return;
    }
    let cancelled = false;
    setAdminAttLoading(true);
    setAdminAttError('');
    setAdminAttachments([]);
    fetchTicketAttachments(adminInspectTicket.id)
      .then((rows) => {
        if (!cancelled) setAdminAttachments(rows);
      })
      .catch((err) => {
        if (!cancelled) setAdminAttError(formatTicketActionError(err));
      })
      .finally(() => {
        if (!cancelled) setAdminAttLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adminInspectTicket?.id]);

  if (!user || !isAdmin) return null;

  const builtInNewsIds = new Set(NEWS_ARTICLES.map((a) => a.id));
  const deletedBuiltInCloudNews = cloudNewsArticles.filter(
    (c) => builtInNewsIds.has(c.id) && c.isDeleted
  );

  const operatorAccounts = employees.filter(
    (e) => e.operatorRole === 'operator_ptsp' || e.operatorRole === 'operator_seksi'
  );
  const pimpinanAccounts = employees.filter((e) => e.operatorRole === 'pimpinan');
  const filteredPimpinanAccounts = pimpinanAccounts.filter((emp) => {
    const q = leadSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      emp.fullName.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.jabatan.toLowerCase().includes(q) ||
      emp.unitKerja.toLowerCase().includes(q)
    );
  });
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

  const handleCreatePimpinanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadFormError('');
    setStatusFeedback('');
    setErrorFeedback('');

    const cleanNip = sanitizeNipDigits(leadNip);
    if (cleanNip.length < 8) {
      setLeadFormError('NIP Pimpinan minimal harus 8 digit angka.');
      return;
    }
    if (leadName.trim().length < 2 || leadJabatan.trim().length < 2 || leadUnitKerja.trim().length < 2) {
      setLeadFormError('Nama Lengkap, Jabatan Pimpinan, dan Unit Kerja wajib diisi.');
      return;
    }
    if (!leadPassword || leadPassword.length < 6) {
      setLeadFormError('Password awal minimal 6 karakter.');
      return;
    }

    setBusyId('create-pimpinan');
    try {
      await provisionEmployeeAccountByAdmin({
        adminUser: user,
        fullName: leadName,
        nip: cleanNip,
        password: leadPassword,
        jabatan: leadJabatan,
        unitKerja: leadUnitKerja,
        unitCategory: leadCategory,
        operatorRole: 'pimpinan',
        assignedUnitId: 'all',
        assignedUnitTitle: 'Pimpinan (Pengesahan TTE)',
      });
      setStatusFeedback(
        `Akun Pimpinan (${leadName} · NIP ${cleanNip}) berhasil ditambahkan dan diaktifkan.`
      );
      setLeadName('');
      setLeadNip('');
      setLeadPassword('');
      setLeadJabatan('Kepala Kantor Kemenag Kab. Murung Raya');
      setLeadUnitKerja('Kantor Kemenag Kab. Murung Raya');
      setLeadCategory('kankemenag');
    } catch (err) {
      setLeadFormError(mapFirebaseAuthError(err));
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
    setErrorFeedback('');
    try {
      const activeLead =
        pimpinanAccounts.find((p) => p.status === 'active') || pimpinanAccounts[0];
      const signerName = activeLead?.fullName || 'H. Maslan, S.Ag., M.Pd.';
      const signerTitle = activeLead?.jabatan
        ? `${activeLead.jabatan}\n${activeLead.unitKerja}`
        : 'Kepala Kantor Kementerian Agama\nKabupaten Murung Raya';
      const signerNip = activeLead?.nip || '197005121998031004';

      await updateCloudTicketStatus({
        ticketId: ticket.id,
        status: nextStatus,
        adminNote: ticketNotes[ticket.id] ?? ticket.adminNote ?? '',
        ...(nextStatus === 'TTE Sah (Selesai)'
          ? {
              tteDocNumber: ticket.tteDocNumber || generateSuggestedTteDocNumber(ticket),
              tteSignerName: ticket.tteSignerName || signerName,
              tteSignerTitle: ticket.tteSignerTitle || signerTitle,
              tteSignerNip: ticket.tteSignerNip || signerNip,
              tteSignedAtLabel: ticket.tteSignedAtLabel || getTodayIndonesianDate(),
            }
          : {}),
      });
      setStatusFeedback(`Status tiket ${ticket.ticketNo} diperbarui menjadi "${nextStatus}".`);
    } catch (err) {
      setErrorFeedback(formatTicketActionError(err));
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
            Manajemen Berita, Akun Pimpinan, Operator PTSP &amp; Seksi, Pegawai, dan Tiket
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
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
            onClick={() => setActiveTab('pimpinan')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'pimpinan'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Akun Pimpinan ({pimpinanAccounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
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
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
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
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
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
                              <option value="pimpinan">Peran: Pimpinan (Pengesahan TTE)</option>
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

        {/* TAB 2B: KELOLA DAFTAR AKUN PIMPINAN */}
        {activeTab === 'pimpinan' && (
          <div className="space-y-6">
            {/* Form Tambah Akun Pimpinan */}
            <form
              onSubmit={(e) => void handleCreatePimpinanSubmit(e)}
              className="p-4 sm:p-5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4"
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Akun Pimpinan</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Daftarkan akun pimpinan (Kepala Kantor, Plh. Kepala Kantor, atau Pejabat
                  Berwenang TTE) dengan NIP dan Password awal agar dapat masuk dan mengesahkan
                  dokumen layanan.
                </p>
              </div>

              {leadFormError && (
                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                  {leadFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap &amp; Gelar Pimpinan *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Contoh: H. Marzuki, S.Ag., M.Pd.I"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIP / ID Login (8–20 digit) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={leadNip}
                    onChange={(e) => setLeadNip(sanitizeNipDigits(e.target.value))}
                    placeholder="18 digit NIP angka"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password Awal (min. 6 karakter) *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={leadPassword}
                    onChange={(e) => setLeadPassword(e.target.value)}
                    placeholder="Password login pimpinan"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan Pimpinan *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadJabatan}
                    onChange={(e) => setLeadJabatan(e.target.value)}
                    placeholder="Contoh: Kepala Kantor Kemenag Kab. Murung Raya"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Kerja / Satker *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadUnitKerja}
                    onChange={(e) => setLeadUnitKerja(e.target.value)}
                    placeholder="Kantor Kemenag Kab. Murung Raya"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Satker *
                  </label>
                  <select
                    value={leadCategory}
                    onChange={(e) => setLeadCategory(e.target.value as EmployeeUnitCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="kankemenag">Kantor Kemenag Kab. Murung Raya</option>
                    <option value="kua_kecamatan">KUA Kecamatan</option>
                    <option value="madrasah">Madrasah Negeri / Satker Pendidikan</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={busyId === 'create-pimpinan'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {busyId === 'create-pimpinan'
                      ? 'Menyimpan Akun Pimpinan...'
                      : 'Tambah & Aktifkan Akun Pimpinan'}
                  </span>
                </button>
              </div>
            </form>

            {/* Daftar Akun Pimpinan */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Daftar Akun Pimpinan ({pimpinanAccounts.length})
                </h4>
                {pimpinanAccounts.length > 0 && (
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={leadSearchQuery}
                      onChange={(e) => setLeadSearchQuery(e.target.value)}
                      placeholder="Cari nama, NIP, atau jabatan..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-700"
                    />
                  </div>
                )}
              </div>

              {pimpinanAccounts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Belum ada akun pimpinan yang terdaftar. Gunakan formulir di atas untuk menambah
                  akun pimpinan baru.
                </p>
              ) : filteredPimpinanAccounts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Tidak ada akun pimpinan yang cocok dengan kata kunci pencarian.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {filteredPimpinanAccounts.map((emp) => {
                    const isEditingThis = editingEmp?.uid === emp.uid;
                    const isConfirmDelete = confirmDeleteEmpUid === emp.uid;
                    return (
                      <div key={emp.uid} className="p-4 bg-white dark:bg-slate-950 space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="text-xs space-y-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {emp.fullName}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                                Pimpinan (Pengesahan TTE)
                              </span>
                              <span aria-hidden="true">·</span>
                              <span
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  emp.status === 'active'
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {emp.status === 'active' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                <span>{emp.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                                NIP {emp.nip}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">
                              {emp.jabatan} · {emp.unitKerja} · {emp.email}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                isEditingThis ? setEditingEmp(null) : startEditVerifiedEmployee(emp)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold whitespace-nowrap shrink-0"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isEditingThis ? 'Tutup Edit' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={busyId === emp.uid}
                              onClick={() => void handleToggleEmployee(emp)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap shrink-0 transition-colors ${
                                emp.status === 'active'
                                  ? 'border-amber-200 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
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
                                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold whitespace-nowrap shrink-0"
                                >
                                  Yakin Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteEmpUid(null)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold whitespace-nowrap shrink-0"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteEmpUid(emp.uid)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40 text-xs font-bold whitespace-nowrap shrink-0"
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
                              placeholder="Nama Lengkap & Gelar"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpNip}
                              onChange={(e) => setEditEmpNip(sanitizeNipDigits(e.target.value))}
                              placeholder="NIP Pimpinan"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono tabular-nums"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpJabatan}
                              onChange={(e) => setEditEmpJabatan(e.target.value)}
                              placeholder="Jabatan Pimpinan"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              required
                              value={editEmpUnitKerja}
                              onChange={(e) => setEditEmpUnitKerja(e.target.value)}
                              placeholder="Unit Kerja / Satker"
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                            <select
                              value={editEmpCategory}
                              onChange={(e) =>
                                setEditEmpCategory(e.target.value as EmployeeUnitCategory)
                              }
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            >
                              <option value="kankemenag">Kantor Kemenag Kab. Murung Raya</option>
                              <option value="kua_kecamatan">KUA Kecamatan</option>
                              <option value="madrasah">Madrasah Negeri</option>
                            </select>
                            <select
                              value={editEmpRole}
                              onChange={(e) =>
                                setEditEmpRole(e.target.value as EmployeeOperatorRole)
                              }
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            >
                              <option value="pimpinan">Peran: Pimpinan (Pengesahan TTE)</option>
                              <option value="operator_ptsp">Peran: Operator PTSP</option>
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
                            <p className="sm:col-span-2 text-[11px] text-slate-500 dark:text-slate-400 self-center">
                              ID kredensial login tetap menggunakan {emp.email}.
                            </p>
                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingEmp(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
                              >
                                Batal
                              </button>
                              <button
                                type="submit"
                                disabled={busyId === `edit-emp-${emp.uid}`}
                                className="px-4 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold whitespace-nowrap shrink-0"
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
                              <option value="pimpinan">Peran: Pimpinan (Pengesahan TTE)</option>
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
                      <option value="pimpinan">Peran: Pimpinan (Pengesahan TTE)</option>
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

        {/* TAB 5: ANTREAN TIKET & PENGESAHAN TTE PIMPINAN */}
        {activeTab === 'tickets' && (
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Belum ada tiket permohonan cloud yang masuk.
              </p>
            ) : (
              tickets.map((t) => {
                const reqs = resolveTicketRequirements(t);
                const totalDocs = t.totalDocsCount ?? reqs.length;
                const validDocs = t.verifiedDocsCount ?? 0;
                const isTteSah = t.status === 'TTE Sah (Selesai)' || t.status === 'Selesai';

                return (
                  <div
                    key={t.id}
                    className={`border rounded-xl p-4 space-y-3 ${
                      t.status === 'Siap TTE'
                        ? 'border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                    }`}
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
                          {t.dispatchedToSeksi && t.dispatchedUnitTitle && (
                            <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                              Disposisi: {t.dispatchedUnitTitle}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            ({validDocs}/{totalDocs} dokumen valid
                            {typeof t.uploadedDocsCount === 'number'
                              ? ` · ${t.uploadedDocsCount} berkas terunggah`
                              : ''}
                            )
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {t.serviceTitle}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {t.applicantName} {t.nip ? `(NIP ${t.nip})` : ''} · {t.phone} ·{' '}
                          {t.userEmail} · {t.unitTitle}
                        </p>
                        {t.tteLeaderNote && (
                          <p className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 pt-0.5">
                            Pengantar Seksi ke Pimpinan: {t.tteLeaderNote}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setAdminInspectTicket(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 text-[11px] font-bold text-slate-700 dark:text-slate-200"
                        >
                          <Paperclip className="w-3 h-3 text-teal-700" />
                          <span>Lihat Berkas</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminDocPreview({ ticket: t, mode: 'resi' })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 text-[11px] font-bold text-slate-700 dark:text-slate-200"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Resi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminDocPreview({ ticket: t, mode: 'tte' })}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                            isTteSah
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                              : 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300'
                          }`}
                        >
                          <FileCheck2 className="w-3 h-3" />
                          <span>{isTteSah ? 'Dokumen TTE' : 'Draf TTE'}</span>
                        </button>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getTicketStatusBadgeClass(
                            t.status
                          )}`}
                        >
                          {getTicketDisplayStatus(t.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        value={ticketNotes[t.id] ?? t.adminNote ?? ''}
                        onChange={(e) =>
                          setTicketNotes((prev) => ({ ...prev, [t.id]: e.target.value }))
                        }
                        placeholder="Catatan pimpinan / super admin untuk pemohon..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            'Diproses Verifikasi',
                            'Perlu Revisi',
                            'Siap TTE',
                            'TTE Sah (Selesai)',
                          ] as const
                        ).map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => void handleUpdateTicket(t, st)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                              t.status === st
                                ? 'bg-slate-900 text-white dark:bg-emerald-700'
                                : st === 'TTE Sah (Selesai)'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {st === 'TTE Sah (Selesai)' ? 'Sahkan TTE (Selesai)' : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL INSPEKSI BERKAS UNGGAHAN UNTUK SUPER ADMIN */}
      {adminInspectTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono-tabular text-xs font-extrabold text-emerald-800 dark:text-emerald-400">
                  {adminInspectTicket.ticketNo}
                </p>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Berkas Persyaratan — {adminInspectTicket.serviceTitle}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pemohon: {adminInspectTicket.applicantName} ({adminInspectTicket.unitTitle})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminInspectTicket(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
              {adminAttLoading ? (
                <p className="text-slate-500 py-6 text-center">
                  Memuat berkas persyaratan yang diunggah pemohon...
                </p>
              ) : adminAttError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-3.5 py-2.5 text-red-700 dark:text-red-300">
                  {adminAttError}
                </div>
              ) : adminAttachments.length === 0 ? (
                <p className="text-slate-500 py-6 text-center">
                  Tidak ada berkas digital yang diunggah pada tiket ini.
                </p>
              ) : (
                adminAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {att.requirementIndex + 1}. {att.requirementLabel}
                      </p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {att.fileName}{' '}
                        <span className="font-mono-tabular text-[11px] text-slate-500 font-normal">
                          ({att.mimeType === 'application/pdf' ? 'PDF' : 'Gambar'} ·{' '}
                          {formatAttachmentBytes(att.fileSize)})
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAdminPreviewAtt(att)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat Berkas</span>
                      </button>
                      <a
                        href={att.dataUrl}
                        download={att.fileName}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-[11px]"
                      >
                        <Download className="w-3 h-3" />
                        <span>Unduh</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <TicketAttachmentPreviewModal
        attachment={adminPreviewAtt}
        onClose={() => setAdminPreviewAtt(null)}
      />

      <OfficialTteDocumentModal
        ticket={adminDocPreview?.ticket ?? null}
        mode={adminDocPreview?.mode || 'resi'}
        onClose={() => setAdminDocPreview(null)}
      />
    </div>
  );
}
