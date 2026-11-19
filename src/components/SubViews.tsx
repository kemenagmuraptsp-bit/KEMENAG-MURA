import { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ChevronRight,
  Play,
  ExternalLink,
  AlertCircle,
  Award,
  Download,
  ZoomIn,
  X,
} from 'lucide-react';
import {
  OFFICE_INFO,
  SERVICE_UNITS,
  GALLERY_ITEMS,
  VIDEO_ITEMS,
  PPID_DOCUMENTS,
  KUA_BRANCHES,
} from '@/src/data/kemenagData';
import {
  NewsArticle,
  GalleryItem,
  PTSPTicket,
  ComplaintSubmission,
  PageView,
} from '@/src/types';
import { SafeImage } from '@/src/components/SafeImage';
import { UnitServicesCatalog } from '@/src/components/UnitServicesCatalog';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import {
  AccountAccessBanner,
  AdminVerificationPanel,
  OperatorTicketConsole,
} from '@/src/components/KepegawaianGateAndAdmin';
import {
  subscribePtspTickets,
  type CloudPtspTicketRecord,
} from '@/src/firebase';

function PageHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-emerald-950 text-white border-b border-emerald-900 pt-24 sm:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
            {kicker}
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. PROFIL VIEW                                                             */
/* -------------------------------------------------------------------------- */
export function ProfilView({ onNavigate }: { onNavigate: (v: PageView) => void }) {
  const { isMasyarakatLogin } = useAuthRole();
  const visibleUnits = isMasyarakatLogin
    ? SERVICE_UNITS.filter((u) => u.id !== 'kepegawaian')
    : SERVICE_UNITS;

  return (
    <div className="bg-white">
      <PageHeader
        kicker="Profil Kelembagaan"
        title="Kantor Kementerian Agama Kabupaten Murung Raya"
        description="Mengenal sejarah pengabdian, visi misi pelayanan, struktur organisasi, dan profil kepemimpinan di Bumi Tana Malai Tolung Lingu."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {/* Sejarah & Kedudukan */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Kedudukan & Wilayah Kerja
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                Kantor Kementerian Agama Kabupaten Murung Raya merupakan instansi vertikal
                Kementerian Agama Republik Indonesia yang berkedudukan di Puruk Cahu, ibu kota
                Kabupaten Murung Raya, Provinsi Kalimantan Tengah.
              </p>
              <p>
                Seiring dengan pemekaran Kabupaten Murung Raya, Kankemenag Murung Raya hadir untuk
                mendekatkan pelayanan kehidupan beragama, penyelenggaraan pendidikan madrasah dan
                keagamaan, bimbingan masyarakat lintas iman (Islam, Kristen, Katolik, Hindu/Kaharingan),
                serta pelayanan ibadah haji hingga ke kecamatan terjauh di hulu Sungai Barito.
              </p>
            </div>
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Kecamatan Binaan', value: '10' },
                { label: 'KUA Kecamatan', value: '10' },
                { label: 'Bidang PTSP', value: String(visibleUnits.length) },
                { label: 'Tarif Layanan', value: 'Rp 0' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                >
                  <p className="text-xl font-extrabold text-emerald-800 font-mono-tabular">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-200">
            <SafeImage
              src={OFFICE_INFO.heroImage}
              alt="Gedung Kantor Kementerian Agama Kabupaten Murung Raya"
              className="w-full h-full object-cover min-h-[260px]"
            />
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="border-t border-slate-200 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-emerald-950 text-white rounded-xl p-7 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Visi Kementerian Agama
            </p>
            <h2 className="text-xl font-serif-editorial italic leading-relaxed">
              “Kementerian Agama yang profesional dan andal dalam membangun masyarakat yang saleh,
              moderat, cerdas, dan unggul untuk mewujudkan Indonesia maju yang berdaulat, mandiri,
              dan berkepribadian berdasarkan gotong royong.”
            </h2>
          </div>

          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-7 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Misi & Arah Pelayanan Daerah
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              {[
                'Meningkatkan kualitas kesalehan umat beragama serta merawat kerukunan dan moderasi beragama di Kabupaten Murung Raya.',
                'Memperkuat layanan pendidikan madrasah, RA, pondok pesantren, dan guru agama lintas iman yang merata hingga wilayah hulu.',
                'Menyelenggarakan layanan KUA, zakat, wakaf, dan ibadah haji secara profesional, transparan, dan bebas pungutan liar.',
                'Mewujudkan tata kelola kepemerintahan yang bersih, akuntabel, dan berbasis digital melalui PTSP serta Zona Integritas.',
              ].map((misi, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="font-mono-tabular text-xs font-bold text-emerald-700 mt-0.5">
                    0{idx + 1}.
                  </span>
                  <span>{misi}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Profil Pimpinan & Struktur Organisasi */}
        <section className="border-t border-slate-200 pt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                Struktur & Satuan Kerja
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Unsur Pimpinan & Unit Kerja Utama
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('layanan')}
              className="text-sm font-semibold text-emerald-800 hover:underline underline-offset-4"
            >
              Lihat Layanan Setiap Unit →
            </button>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Kepala Kantor Kementerian Agama Kab. Murung Raya
              </p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                H. Maslan, S.Ag., M.Pd.
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Membina seluruh unit kerja kesekretariatan, seksi teknis, penyelenggara lintas agama,
                madrasah negeri, serta KUA kecamatan se-Kabupaten Murung Raya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleUnits.map((u) => (
              <div key={u.id} className="border border-slate-200 rounded-xl p-4 space-y-1.5 bg-white">
                <p className="text-xs font-mono-tabular text-emerald-700 font-semibold">{u.code}</p>
                <h4 className="text-sm font-bold text-slate-900">{u.title}</h4>
                <p className="text-xs text-slate-600">{u.officer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. LAYANAN PTSP VIEW                                                       */
/* -------------------------------------------------------------------------- */
export function LayananView({
  tickets,
  selectedUnitId,
  selectedSubId,
  onOpenServiceSidebar,
  onTicketCreated,
}: {
  tickets: PTSPTicket[];
  selectedUnitId: string;
  selectedSubId: string;
  onOpenServiceSidebar: () => void;
  onTicketCreated: (ticket: PTSPTicket) => void;
}) {
  const {
    user,
    isEligibleUser,
    isAdmin,
    isOperatorPtsp,
    isOperatorSeksi,
    isNipSession,
    isMasyarakatLogin,
    myVerifiedEmployee,
    adminConsoleTriggerCount,
  } = useAuthRole();

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showOperatorPanel, setShowOperatorPanel] = useState(true);
  const [ticketQuery, setTicketQuery] = useState('');
  const [cloudTickets, setCloudTickets] = useState<CloudPtspTicketRecord[]>([]);

  useEffect(() => {
    if (isAdmin && adminConsoleTriggerCount > 0) {
      setShowAdminPanel(true);
    }
  }, [isAdmin, adminConsoleTriggerCount]);

  useEffect(() => {
    if (!user || !isEligibleUser) {
      setCloudTickets([]);
      return;
    }
    const unsub = subscribePtspTickets(
      user,
      isAdmin,
      (rows) => setCloudTickets(rows),
      () => {
        // handled inside firebase.ts
      }
    );
    return () => unsub();
  }, [user, isEligibleUser, isAdmin]);

  const availableUnits = isMasyarakatLogin
    ? SERVICE_UNITS.filter((u) => u.id !== 'kepegawaian')
    : SERVICE_UNITS;
  const activeUnit =
    availableUnits.find((u) => u.id === selectedUnitId) || availableUnits[0];
  const activeSub =
    activeUnit.subServices.find((s) => s.id === selectedSubId) ||
    activeUnit.subServices[0];

  const isSelfServiceInfo =
    activeSub.id === 'bi-kalkulator-zakat' || activeSub.id === 'bi-jadwal-sholat';

  const queryLower = ticketQuery.trim().toLowerCase();
  const matchedCloudTickets = queryLower
    ? cloudTickets.filter(
        (t) =>
          t.ticketNo.toLowerCase().includes(queryLower) ||
          t.applicantName.toLowerCase().includes(queryLower) ||
          t.serviceTitle.toLowerCase().includes(queryLower)
      )
    : cloudTickets;

  const matchedLocalTickets = queryLower
    ? tickets.filter(
        (t) =>
          t.ticketNo.toLowerCase().includes(queryLower) ||
          t.applicantName.toLowerCase().includes(queryLower) ||
          t.serviceTitle.toLowerCase().includes(queryLower)
      )
    : tickets;

  return (
    <div className="bg-white dark:bg-slate-950">
      <PageHeader
        kicker="Pelayanan Terpadu Satu Pintu (PTSP)"
        title="Daftar Layanan & Permohonan PTSP"
        description="Pilih bidang layanan melalui Beranda atau menu sidebar di sisi kiri layar untuk melihat seluruh layanan, persyaratan, waktu dan biaya, format template dokumen, serta mengajukan permohonan daring."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 3-Tier Access Mode Banner */}
        <AccountAccessBanner
          showAdminPanel={showAdminPanel}
          onToggleAdminPanel={() => setShowAdminPanel((p) => !p)}
          showOperatorPanel={showOperatorPanel}
          onToggleOperatorPanel={() => setShowOperatorPanel((p) => !p)}
        />

        {/* Super Admin Console */}
        {isAdmin && showAdminPanel && (
          <div id="admin-console" className="scroll-mt-28">
            <AdminVerificationPanel />
          </div>
        )}

        {/* Operator PTSP / Operator Seksi Console */}
        {!isAdmin && (isOperatorPtsp || isOperatorSeksi) && showOperatorPanel && (
          <div id="operator-console" className="scroll-mt-28">
            <OperatorTicketConsole />
          </div>
        )}

        <div className="space-y-8">
          <UnitServicesCatalog
            unit={activeUnit}
            highlightedSubId={activeSub.id}
            onOpenServiceSidebar={onOpenServiceSidebar}
            onTicketCreated={onTicketCreated}
          />

          {/* Ticket Lookup & History (Cloud Account History + Local Guest Tickets) */}
          {!isSelfServiceInfo && (
            <div
              id="riwayat-layanan"
              className="scroll-mt-28 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/70 dark:bg-slate-900 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {user
                      ? isAdmin
                        ? 'Pelacakan & Riwayat Seluruh Tiket Masuk'
                        : isNipSession
                        ? 'Riwayat Tiket Tersimpan di Akun Pegawai Anda'
                        : 'Riwayat Tiket Tersimpan di Akun Google Anda'
                      : 'Pelacakan Tiket Pengajuan Biasa (Sesi Perangkat Ini)'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user
                      ? `Terhubung sebagai ${
                          myVerifiedEmployee?.nip
                            ? `NIP ${myVerifiedEmployee.nip}`
                            : isNipSession
                            ? `NIP ${user.email?.split('@')[0]}`
                            : user.email
                        }. Riwayat permohonan dan pembaruan status petugas tersinkron otomatis.`
                      : 'Tiket pengajuan biasa tersimpan di perangkat ini. Login dengan Akun Google atau Pegawai agar riwayat & notifikasi lonceng aktif.'}
                  </p>
                </div>
                <input
                  type="text"
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                  placeholder="Cari nomor tiket / layanan..."
                  className="sm:w-64 px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-700 font-mono-tabular"
                />
              </div>

              {user && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Riwayat Akun Google ({matchedCloudTickets.length})
                  </p>
                  {matchedCloudTickets.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {matchedCloudTickets.map((t) => (
                        <div
                          key={t.id}
                          className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono-tabular font-bold text-emerald-800 dark:text-emerald-400">
                                {t.ticketNo}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {t.serviceTitle}
                              </span>
                            </div>
                            <p className="text-slate-500">
                              {t.applicantName}
                              {t.nip ? ` · NIP ${t.nip}` : ''} · {t.unitTitle} ·{' '}
                              {t.submittedAtLabel}
                            </p>
                            {t.adminNote && (
                              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium pt-0.5">
                                Catatan Petugas: {t.adminNote}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded text-[11px] font-bold shrink-0 w-fit ${
                              t.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : t.status === 'Menunggu Berkas'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
                      Belum ada riwayat tiket yang tersimpan di akun Google ini.
                    </p>
                  )}
                </div>
              )}

              {(matchedLocalTickets.length > 0 || !user) && (
                <div className="space-y-2">
                  {user && matchedLocalTickets.length > 0 && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Pengajuan Biasa di Perangkat Ini ({matchedLocalTickets.length})
                    </p>
                  )}
                  {matchedLocalTickets.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {matchedLocalTickets.map((t) => (
                        <div
                          key={t.ticketNo}
                          className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-mono-tabular font-bold text-emerald-800 dark:text-emerald-400 mr-2.5">
                              {t.ticketNo}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {t.serviceTitle}
                            </span>
                            <p className="text-slate-500 mt-0.5">
                              {t.applicantName} · {t.unitTitle} · {t.submittedAt}
                            </p>
                          </div>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-400 shrink-0">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !user && (
                      <p className="text-xs text-slate-500">
                        Belum ada tiket permohonan yang tercatat pada sesi ini. Pilih layanan di
                        sidebar kiri lalu ajukan permohonan daring untuk mendapatkan nomor tiket.
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. BERITA VIEW                                                             */
/* -------------------------------------------------------------------------- */
export function BeritaView({ onSelectArticle }: { onSelectArticle: (a: NewsArticle) => void }) {
  const { newsArticles } = useAuthRole();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');

  const categories = ['Semua', ...Array.from(new Set(newsArticles.map((a) => a.category)))];

  const filtered = newsArticles.filter((art) => {
    const matchCat = category === 'Semua' || art.category === category;
    const matchSearch =
      !search.trim() ||
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-white">
      <PageHeader
        kicker="Media Center & Publikasi"
        title="Berita Resmi Kemenag Murung Raya"
        description="Liputan kegiatan kantor, informasi layanan keagamaan, pendidikan madrasah, kerukunan umat, dan berita kebijakan Kementerian Agama."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berita..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => (
            <article
              key={art.id}
              className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-emerald-600 transition-colors"
            >
              <div>
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <SafeImage
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-emerald-800">{art.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{art.date}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    <button
                      type="button"
                      onClick={() => onSelectArticle(art)}
                      className="text-left hover:text-emerald-800 transition-colors"
                    >
                      {art.title}
                    </button>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono-tabular">{art.views} dibaca · {art.readTime}</span>
                <button
                  type="button"
                  onClick={() => onSelectArticle(art)}
                  className="font-semibold text-emerald-800 hover:underline"
                >
                  Baca Selengkapnya
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. GALERI VIEW                                                             */
/* -------------------------------------------------------------------------- */
export function GaleriView({ onSelectGallery }: { onSelectGallery: (g: GalleryItem) => void }) {
  const [tab, setTab] = useState<'foto' | 'video'>('foto');

  return (
    <div className="bg-white">
      <PageHeader
        kicker="Galeri & Dokumentasi"
        title="Arsip Foto & Video Resmi"
        description="Dokumentasi visual pelaksanaan tugas, pelayanan masyarakat, kegiatan lintas iman, dan edukasi publik Kankemenag Kabupaten Murung Raya."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setTab('foto')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === 'foto' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Dokumentasi Foto ({GALLERY_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('video')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Kanal Video ({VIDEO_ITEMS.length})
          </button>
        </div>

        {tab === 'foto' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectGallery(item)}
                className="group text-left border border-slate-200 hover:border-emerald-600 rounded-xl overflow-hidden transition-colors"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span className="font-semibold text-emerald-800">{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h2>
                  <p className="text-xs text-slate-500">{item.location}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VIDEO_ITEMS.map((vid) => (
              <a
                key={vid.id}
                href={vid.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-slate-200 hover:border-emerald-600 rounded-xl overflow-hidden flex flex-col justify-between transition-colors"
              >
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <SafeImage
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </span>
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <div className="text-xs text-slate-500 flex items-center gap-2 font-mono-tabular">
                    <span className="font-sans font-semibold text-emerald-800">{vid.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{vid.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span>{vid.date}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
                    {vid.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">{vid.description}</p>
                  <p className="text-xs font-semibold text-emerald-800 inline-flex items-center gap-1 pt-1">
                    <span>Tonton di YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. PPID & ZONA INTEGRITAS VIEWS                                            */
/* -------------------------------------------------------------------------- */
export function PPIDView({ onNavigate }: { onNavigate: (v: PageView) => void }) {
  const [cat, setCat] = useState<string>('Semua');
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const docs =
    cat === 'Semua' ? PPID_DOCUMENTS : PPID_DOCUMENTS.filter((d) => d.category === cat);

  return (
    <div className="bg-white">
      <PageHeader
        kicker="Keterbukaan Informasi Publik"
        title="PPID Pelaksana Kemenag Murung Raya"
        description="Pejabat Pengelola Informasi dan Dokumentasi (PPID) menyediakan akses informasi publik berkala, serta merta, dan tersedia setiap saat sesuai UU No. 14 Tahun 2008."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {['Semua', 'Berkala', 'Serta Merta', 'Setiap Saat'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  cat === c ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('e-pengaduan')}
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Ajukan Permohonan Informasi / Keberatan →
          </button>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span className="font-mono-tabular font-semibold text-emerald-800">
                    {doc.code}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Informasi {doc.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{doc.format}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">{doc.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600">{doc.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => setDownloadedId(doc.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-emerald-700 text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {downloadedId === doc.id ? 'Ringkasan Dibuka' : 'Lihat Dokumen'}
                </span>
              </button>
            </div>
          ))}
        </div>

        {downloadedId && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">
                Akses Salinan Resmi Dokumen PPID
              </p>
              <p className="text-xs text-slate-700">
                Salinan fisik dan salinan digital bertanda tangan elektronik (TTE) dokumen{' '}
                <strong className="font-mono-tabular">
                  {PPID_DOCUMENTS.find((d) => d.id === downloadedId)?.code}
                </strong>{' '}
                tersedia di meja layanan PPID & PTSP Kankemenag Murung Raya atau melalui email{' '}
                <span className="font-medium">{OFFICE_INFO.ptspEmail}</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDownloadedId(null)}
              className="text-xs font-semibold text-emerald-800 hover:underline shrink-0"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const MAKLUMAT_IMAGE_URL = '/assets/aistudio/Gemini_Generated_Image_e8sbs3e8sbs3e8sb_137a9be9.jpg';

const MAKLUMAT_COMMITMENTS = [
  'Memberikan pelayanan dengan sepenuh hati, profesional, ramah, cepat, tepat, transparan, dan akuntabel.',
  'Memberikan pelayanan sesuai dengan persyaratan, prosedur, jangka waktu, dan ketentuan biaya yang berlaku.',
  'Memberikan pelayanan secara adil, mudah, dan tidak diskriminatif kepada seluruh masyarakat.',
  'Menjaga integritas dan profesionalitas serta tidak melakukan praktik korupsi, kolusi, nepotisme, pungutan liar, dan gratifikasi.',
  'Menjamin keamanan dan kerahasiaan data serta dokumen pengguna layanan sesuai ketentuan peraturan perundang-undangan.',
  'Memberikan kemudahan akses informasi dan pelayanan melalui Pelayanan Terpadu Satu Pintu (PTSP).',
  'Menindaklanjuti setiap pengaduan, kritik, dan saran masyarakat sebagai upaya peningkatan kualitas pelayanan.',
  'Melakukan evaluasi dan perbaikan pelayanan secara berkelanjutan demi mewujudkan kepuasan masyarakat.',
];

export function ZonaIntegritasView({ onNavigate }: { onNavigate: (v: PageView) => void }) {
  const [zoomMaklumat, setZoomMaklumat] = useState(false);

  const pillars = [
    {
      num: '01',
      title: 'Manajemen Perubahan',
      desc: 'Pembangunan komitmen pimpinan dan seluruh ASN Kankemenag Murung Raya menuju budaya kerja berintegritas.',
    },
    {
      num: '02',
      title: 'Penataan Tatalaksana',
      desc: 'Standarisasi SOP pelayanan PTSP, penerapan Tanda Tangan Elektronik (TTE), dan kearsipan SRIKANDI.',
    },
    {
      num: '03',
      title: 'Penataan Sistem Manajemen SDM',
      desc: 'Pengembangan kompetensi pegawai melalui MOOC Pintar, SIMPEG 5, serta disiplin kerja harian.',
    },
    {
      num: '04',
      title: 'Penguatan Akuntabilitas',
      desc: 'Pelaporan kinerja instansi berbasis target terukur dan keterbukaan anggaran DIPA Kabupaten Murung Raya.',
    },
    {
      num: '05',
      title: 'Penguatan Pengawasan',
      desc: 'Pengendalian gratifikasi, Whistleblowing System (WBS), serta kanal pengaduan masyarakat yang responsif.',
    },
    {
      num: '06',
      title: 'Peningkatan Kualitas Pelayanan Publik',
      desc: 'Penerapan Maklumat Pelayanan PTSP tanpa biaya tambahan serta Survei Kepuasan Masyarakat berkala.',
    },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      <PageHeader
        kicker="Reformasi Birokrasi · WBK / WBBM"
        title="Zona Integritas Kemenag Kabupaten Murung Raya"
        description="Komitmen mewujudkan Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi Bersih dan Melayani (WBBM) melalui 6 area perubahan serta Maklumat Pelayanan."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Quick Anchor Navigation */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => scrollToSection('pilar-zi')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>6 Pilar WBK / WBBM</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('maklumat-pelayanan')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Maklumat Pelayanan</span>
          </button>
        </div>

        {/* Section 1: 6 Pilar WBK / WBBM */}
        <section id="pilar-zi" className="scroll-mt-28 space-y-6">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Area Perubahan
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              6 Pilar Zona Integritas WBK / WBBM
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div
                key={p.num}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-2.5 bg-white dark:bg-slate-900"
              >
                <span className="font-mono-tabular text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Pilar {p.num}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Maklumat Pelayanan */}
        <section
          id="maklumat-pelayanan"
          className="scroll-mt-28 rounded-2xl border-2 border-emerald-800/20 dark:border-emerald-700/40 bg-emerald-50/40 dark:bg-slate-900/80 p-6 sm:p-8 lg:p-10 space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-emerald-900/15 dark:border-slate-800 pb-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Piagam & Komitmen Resmi Pelayanan Publik</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Maklumat Pelayanan
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Kantor Kementerian Agama Kabupaten Murung Raya menyatakan kesanggupan penuh untuk
                menyelenggarakan pelayanan sesuai standar pelayanan yang telah ditetapkan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setZoomMaklumat(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold border border-emerald-800 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-slate-800 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Perbesar Piagam</span>
              </button>
              <a
                href={MAKLUMAT_IMAGE_URL}
                download="Maklumat-Pelayanan-Kemenag-Murung-Raya.jpg"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Dokumen</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Official Signed Document Poster */}
            <div className="lg:col-span-5">
              <button
                type="button"
                onClick={() => setZoomMaklumat(true)}
                aria-label="Perbesar piagam Maklumat Pelayanan"
                className="group relative block w-full rounded-xl border-2 border-emerald-900/25 dark:border-emerald-600/40 bg-white dark:bg-slate-950 p-2 shadow-lg overflow-hidden text-left"
              >
                <img
                  src={MAKLUMAT_IMAGE_URL}
                  alt="Maklumat Pelayanan Kantor Kementerian Agama Kabupaten Murung Raya"
                  className="w-full h-auto rounded-lg object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 px-1 pb-0.5">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Klik gambar untuk membaca dokumen ukuran penuh</span>
                </span>
              </button>
            </div>

            {/* Structured Transcript & Commitments */}
            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-xl bg-emerald-900 text-white p-5 border-l-4 border-amber-400">
                <p className="text-xs sm:text-sm font-extrabold leading-relaxed tracking-wide uppercase">
                  &ldquo;Dengan ini, kami menyatakan sanggup menyelenggarakan pelayanan sesuai
                  dengan standar pelayanan yang telah ditetapkan.&rdquo;
                </p>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  8 Poin Komitmen Pelayanan Kami:
                </h3>
                <ol className="space-y-3">
                  {MAKLUMAT_COMMITMENTS.map((item, idx) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 font-mono-tabular text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/30 p-5 space-y-3">
                <p className="text-xs sm:text-sm font-bold italic text-slate-900 dark:text-amber-100 leading-relaxed">
                  APABILA KAMI TIDAK MENEPATI JANJI PELAYANAN INI, KAMI SIAP MENERIMA SANKSI SESUAI
                  KETENTUAN PERATURAN PERUNDANG-UNDANGAN DAN MEMBERIKAN KOMPENSASI PELAYANAN SESUAI
                  KETENTUAN YANG BERLAKU.
                </p>
                <div className="pt-2 border-t border-amber-300/60 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span>Puruk Cahu, 1 Agustus 2026</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Kepala Kankemenag Kab. Murung Raya · H. Maslan, S.Ag, M.Pd
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: E-Pengaduan CTA */}
        <div className="bg-emerald-950 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Tolak Pungli & Gratifikasi</span>
            </div>
            <h3 className="text-xl font-bold">
              Temukan Indikasi Penyimpangan Layanan?
            </h3>
            <p className="text-sm text-emerald-100/85">
              Laporkan langsung melalui kanal E-Pengaduan resmi Kemenag Murung Raya. Identitas
              pelapor dijamin kerahasiaannya.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('e-pengaduan')}
            className="px-5 py-3 text-xs font-semibold text-emerald-950 bg-white hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Sampaikan Laporan
          </button>
        </div>
      </div>

      {/* Lightbox Zoom Modal for Maklumat Pelayanan */}
      {zoomMaklumat && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan penuh Maklumat Pelayanan"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomMaklumat(false);
          }}
        >
          <div className="relative max-w-3xl w-full max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                Maklumat Pelayanan — Kemenag Kabupaten Murung Raya
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={MAKLUMAT_IMAGE_URL}
                  download="Maklumat-Pelayanan-Kemenag-Murung-Raya.jpg"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </a>
                <button
                  type="button"
                  onClick={() => setZoomMaklumat(false)}
                  aria-label="Tutup pratinjau dokumen"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto pt-3 flex justify-center">
              <img
                src={MAKLUMAT_IMAGE_URL}
                alt="Maklumat Pelayanan Kantor Kementerian Agama Kabupaten Murung Raya ukuran penuh"
                className="max-h-[78vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. E-PENGADUAN VIEW                                                        */
/* -------------------------------------------------------------------------- */
export function PengaduanView({
  complaints,
  onAddComplaint,
}: {
  complaints: ComplaintSubmission[];
  onAddComplaint: (c: ComplaintSubmission) => void;
}) {
  const [category, setCategory] = useState('Pelayanan PTSP / KUA');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [reporter, setReporter] = useState('');
  const [contact, setContact] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [latestTicket, setLatestTicket] = useState<ComplaintSubmission | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || details.trim().length < 15) {
      setError('Mohon isi judul laporan dan kronologi pengaduan minimal 15 karakter.');
      return;
    }
    if (!anonymous && (!reporter.trim() || !contact.trim())) {
      setError('Mohon lengkapi nama dan kontak pelapor, atau aktifkan opsi Pelapor Anonim.');
      return;
    }
    setError('');
    const num = Math.floor(1000 + Math.random() * 9000);
    const submission: ComplaintSubmission = {
      ticketNo: `ADUAN-MURA-2026-${num}`,
      category,
      subject: subject.trim(),
      reporter: anonymous ? 'Anonim (Dirahasiakan)' : reporter.trim(),
      submittedAt: '13 November 2026',
      status: 'Diterima Inspektorat Internal',
    };
    onAddComplaint(submission);
    setLatestTicket(submission);
    setSubject('');
    setDetails('');
  };

  return (
    <div className="bg-white">
      <PageHeader
        kicker="Kanal Pengaduan & Aspirasi Publik"
        title="E-Pengaduan Kemenag Kabupaten Murung Raya"
        description="Sampaikan pengaduan layanan, saran perbaikan, atau pelaporan indikasi gratifikasi secara aman, tertib, dan terdokumentasi."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7">
          {latestTicket ? (
            <div className="border border-emerald-200 bg-emerald-50/70 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Laporan Pengaduan Berhasil Dikirim
                  </h2>
                  <p className="text-sm text-slate-700 mt-1">
                    Terima kasih atas partisipasi Anda dalam meningkatkan mutu pelayanan Kemenag
                    Kabupaten Murung Raya.
                  </p>
                </div>
              </div>
              <div className="bg-white border border-emerald-200 rounded-lg p-4 text-sm space-y-2">
                <p>
                  <span className="text-slate-500">Nomor Tiket Aduan: </span>
                  <strong className="font-mono-tabular text-emerald-800">
                    {latestTicket.ticketNo}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Kategori: </span>
                  <strong className="text-slate-900">{latestTicket.category}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Status: </span>
                  <strong className="text-slate-900">{latestTicket.status}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLatestTicket(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
              >
                Kirim Pengaduan Lainnya
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="border border-slate-200 rounded-xl p-6 space-y-5 bg-white"
            >
              <h2 className="text-lg font-bold text-slate-900">
                Formulir Pengaduan Masyarakat
              </h2>

              {error && (
                <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kategori Laporan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-emerald-700"
                >
                  <option>Pelayanan PTSP / KUA</option>
                  <option>Pendidikan Madrasah & Guru Agama</option>
                  <option>Penyelenggaraan Haji & Umrah</option>
                  <option>Dugaan Pungli / Gratifikasi (WBS)</option>
                  <option>Saran & Masukan Pelayanan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Judul / Pokok Pengaduan *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ringkasan singkat hal yang dilaporkan"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Uraian Kejadian / Aspirasi *
                </label>
                <textarea
                  rows={4}
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Jelaskan waktu, unit layanan terkait, dan kronologi secara jelas..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                />
                <span>Kirim sebagai Pelapor Anonim (Identitas dirahasiakan)</span>
              </label>

              {!anonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Pelapor *
                    </label>
                    <input
                      type="text"
                      value={reporter}
                      onChange={(e) => setReporter(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email / WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Untuk tindak lanjut resmi"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
              >
                Kirim Pengaduan Resmi
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Jaminan Perlindungan & Tindak Lanjut
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <li>· Setiap laporan diverifikasi oleh Tim Pengendali Pengaduan Internal dalam 2 hari kerja.</li>
              <li>· Identitas pelapor dilindungi sesuai mekanisme Whistleblowing System Kementerian Agama RI.</li>
              <li>· Pengaduan langsung juga dapat disampaikan melalui WhatsApp PTSP {OFFICE_INFO.whatsapp}.</li>
            </ul>
          </div>

          {complaints.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Riwayat Pengaduan Terkirim ({complaints.length})
              </h3>
              <ul className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <li key={c.ticketNo} className="py-2.5 first:pt-0 last:pb-0 text-xs space-y-0.5">
                    <p className="font-mono-tabular font-bold text-emerald-800">{c.ticketNo}</p>
                    <p className="font-semibold text-slate-900">{c.subject}</p>
                    <p className="text-slate-500">
                      {c.category} · {c.status}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. KONTAK VIEW                                                             */
/* -------------------------------------------------------------------------- */
export function KontakView() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || !message.trim()) return;
    setSent(true);
  };

  return (
    <div className="bg-white">
      <PageHeader
        kicker="Hubungi Kami"
        title="Kontak Kantor & Jaringan KUA Kecamatan"
        description="Informasi alamat kantor pusat di Puruk Cahu, saluran komunikasi PTSP, serta direktori Kantor Urusan Agama di Kabupaten Murung Raya."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">
              {OFFICE_INFO.officialName}
            </h2>
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-700 mt-1 shrink-0" />
                <span>{OFFICE_INFO.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{OFFICE_INFO.email} · {OFFICE_INFO.ptspEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-mono-tabular">
                  {OFFICE_INFO.phone} · WA PTSP: {OFFICE_INFO.whatsapp}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-700 mt-1 shrink-0" />
                <div>
                  <p>{OFFICE_INFO.hoursWeekday}</p>
                  <p>{OFFICE_INFO.hoursFriday}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 border border-slate-200 rounded-xl p-6">
            {sent ? (
              <div className="space-y-3 py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-900">Pesan Terkirim ke Meja PTSP</h3>
                <p className="text-sm text-slate-600">
                  Terima kasih, {name}. Tim Humas & PTSP Kemenag Murung Raya akan membalas ke{' '}
                  <strong>{email}</strong> pada jam kerja.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:underline"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Kirim Pertanyaan Cepat</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pesan / Pertanyaan *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pertanyaan Anda terkait layanan KUA, madrasah, haji, atau keagamaan..."
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                >
                  <span>Kirim Pesan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Direktori KUA Kecamatan */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Unit Layanan Tingkat Kecamatan
            </p>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Kantor Urusan Agama (KUA) Kabupaten Murung Raya
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KUA_BRANCHES.map((kua) => (
              <div key={kua.id} className="border border-slate-200 rounded-xl p-5 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">{kua.kecamatan}</h3>
                <p className="text-xs text-slate-600">{kua.address}</p>
                <p className="text-xs text-emerald-800 font-medium pt-1">{kua.head}</p>
                <p className="text-[11px] text-slate-500 font-mono-tabular">{kua.hours}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
