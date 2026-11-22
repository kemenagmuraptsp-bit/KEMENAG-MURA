import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  GitBranch,
  Globe,
  HelpCircle,
  Landmark,
  Layers,
  Lightbulb,
  Lock,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  X,
  ZoomIn,
} from 'lucide-react';
import { OFFICE_INFO, PPID_DOCUMENTS, SERVICE_UNITS } from '@/src/data/kemenagData';
import { PageView, ServiceTemplate } from '@/src/types';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import { SafeImage } from '@/src/components/SafeImage';

function PortalPageHeader({
  kicker,
  title,
  description,
  onBackHome,
}: {
  kicker: string;
  title: string;
  description: string;
  onBackHome: () => void;
}) {
  return (
    <div className="bg-emerald-950 text-white border-b border-emerald-900 pt-20 sm:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-4">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-emerald-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="max-w-3xl space-y-2.5">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-300">
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

function downloadWordTemplate(tpl: ServiceTemplate) {
  const blob = new Blob(['\ufeff', tpl.contentHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = tpl.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------- */
/* 1. DOKUMEN PENTING VIEW                                                    */
/* -------------------------------------------------------------------------- */
export function DokumenPentingView({
  onNavigate,
  onBackToKatalog,
}: {
  onNavigate: (v: PageView) => void;
  onBackToKatalog: () => void;
}) {
  const [unitFilter, setUnitFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<{
    unitTitle: string;
    serviceTitle: string;
    template: ServiceTemplate;
  } | null>(null);

  const allTemplates = useMemo(() => {
    const rows: {
      unitId: string;
      unitCode: string;
      unitTitle: string;
      serviceTitle: string;
      template: ServiceTemplate;
    }[] = [];
    SERVICE_UNITS.forEach((unit) => {
      unit.subServices.forEach((sub) => {
        (sub.templates || []).forEach((tpl) => {
          rows.push({
            unitId: unit.id,
            unitCode: unit.code,
            unitTitle: unit.title,
            serviceTitle: sub.title,
            template: tpl,
          });
        });
      });
    });
    return rows;
  }, []);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allTemplates.filter((item) => {
      const matchUnit = unitFilter === 'semua' || item.unitId === unitFilter;
      const matchQuery =
        !q ||
        item.template.title.toLowerCase().includes(q) ||
        item.serviceTitle.toLowerCase().includes(q) ||
        item.unitTitle.toLowerCase().includes(q);
      return matchUnit && matchQuery;
    });
  }, [allTemplates, unitFilter, searchQuery]);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <PortalPageHeader
        kicker="Pusat Arsip & Unduhan Resmi"
        title="Dokumen Penting & Format Formulir PTSP"
        description="Kumpulan dokumen kebijakan resmi Kankemenag Kabupaten Murung Raya, Maklumat Pelayanan, daftar PPID, serta format template surat permohonan (.doc) siap unduh untuk seluruh bidang layanan."
        onBackHome={() => onNavigate('beranda')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Highlight Maklumat & Dokumen Strategis */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Dokumen Kebijakan & Keterbukaan Informasi
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Dokumen Pokok Instansi & PPID Pelaksana
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ppid')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline self-start sm:self-auto"
            >
              <span>Buka Daftar PPID Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PPID_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono-tabular font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-md">
                      {doc.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {doc.category} · {doc.year}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono-tabular text-[11px] text-slate-500 dark:text-slate-400">
                    {doc.format}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('ppid')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors"
                  >
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>Akses di PPID</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formulir & Template Surat Permohonan Resmi */}
        <section className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Format Resmi Permohonan (.doc)
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Template Surat & Formulir Persyaratan PTSP ({filteredTemplates.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Unduh format surat pengantar dan formulir permohonan resmi untuk mempermudah pengisian sebelum diunggah ke loket PTSP.
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari template atau layanan..."
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUnitFilter('semua')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-colors ${
                unitFilter === 'semua'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
              }`}
            >
              Semua Bidang ({allTemplates.length})
            </button>
            {SERVICE_UNITS.map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => setUnitFilter(unit.id)}
                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-colors ${
                  unitFilter === unit.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                {unit.code}. {unit.title}
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
              Tidak ditemukan template dokumen yang cocok dengan pencarian Anda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((row) => (
                <div
                  key={`${row.unitId}-${row.template.id}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono-tabular text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        Bidang {row.unitCode} · {row.unitTitle}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {row.template.title}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Untuk: {row.serviceTitle}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {row.template.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {row.template.fileName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewTemplate({
                            unitTitle: row.unitTitle,
                            serviceTitle: row.serviceTitle,
                            template: row.template,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadWordTemplate(row.template)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh .DOC</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                Siap Mengajukan Permohonan Layanan?
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/90">
                Setelah melengkapi formulir, kunjungi Katalog Layanan PTSP untuk mengunggah berkas persyaratan secara daring.
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToKatalog}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-colors"
            >
              <span>Ke Katalog Layanan PTSP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewTemplate(null);
          }}
        >
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {previewTemplate.unitTitle} · {previewTemplate.serviceTitle}
                </p>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {previewTemplate.template.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                aria-label="Tutup pratinjau template"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                {previewTemplate.template.previewText}
              </pre>
            </div>
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => downloadWordTemplate(previewTemplate.template)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File .DOC</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. SOP LAYANAN PTSP VIEW                                                   */
/* -------------------------------------------------------------------------- */
const SOP_LIFECYCLE_STEPS = [
  {
    step: '01',
    title: 'Penerimaan & Verifikasi Berkas Awal',
    actor: 'Petugas Loket / Operator PTSP',
    sla: 'Maks. 15–30 Menit',
    detail:
      'Pemohon mengajukan permohonan secara daring atau di loket PTSP dengan melampirkan seluruh persyaratan dokumen PDF/gambar sesuai daftar layanan.',
  },
  {
    step: '02',
    title: 'Penerbitan Nomor Tiket & Resi Registrasi',
    actor: 'Sistem PTSP Terpadu',
    sla: 'Otomatis Real-Time',
    detail:
      'Permohonan yang masuk langsung memperoleh nomor tiket unik (format PTSP-TAHUN-NOMOR) dan resi pendaftaran digital untuk pelacakan status.',
  },
  {
    step: '03',
    title: 'Disposisi Elektronik ke Seksi / Unit Teknis',
    actor: 'Operator PTSP -> Seksi Teknis',
    sla: 'Hari Kerja yang Sama',
    detail:
      'Operator PTSP mendisposisikan berkas kepada Operator Seksi terkait (Subbag TU, Bimas Islam, Pendis, Bimas Hindu, Bimas Kristen, atau Kepegawaian).',
  },
  {
    step: '04',
    title: 'Telaah Substansi & Verifikasi Lapangan/Data',
    actor: 'Analis / Operator Seksi',
    sla: '1–5 Hari Kerja (Sesuai Layanan)',
    detail:
      'Seksi teknis memeriksa keabsahan substansi surat, validitas EMIS/SIMKAH/SIMAS/SIMPEG, dan menyiapkan draf produk layanan untuk disetujui pimpinan.',
  },
  {
    step: '05',
    title: 'Persetujuan & Tanda Tangan Elektronik (TTE)',
    actor: 'Kepala Kankemenag / Pejabat Berwenang',
    sla: 'Maks. 1 Hari Kerja',
    detail:
      'Kepala Kantor menelaah draf hasil layanan dan membubuhkan Tanda Tangan Elektronik (TTE) resmi bernomor register instansi.',
  },
  {
    step: '06',
    title: 'Penyerahan Output & Notifikasi Pemohon',
    actor: 'Sistem Lonceng Notifikasi & Loket PTSP',
    sla: 'Seketika Setelah TTE',
    detail:
      'Pemohon menerima notifikasi lonceng real-time di akunnya, dapat mengunduh Dokumen TTE Sah atau mengambil salinan fisik bermaterai/cap di loket.',
  },
];

export function SopPtspView({
  onNavigate,
  onSelectService,
}: {
  onNavigate: (v: PageView) => void;
  onSelectService: (unitId: string) => void;
}) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(SERVICE_UNITS[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const activeUnit =
    SERVICE_UNITS.find((u) => u.id === selectedUnitId) || SERVICE_UNITS[0];

  const filteredServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return activeUnit.subServices;
    return activeUnit.subServices.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.output.toLowerCase().includes(q) ||
        s.sla.toLowerCase().includes(q)
    );
  }, [activeUnit, searchTerm]);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <PortalPageHeader
        kicker="Standar Operasional Prosedur (SOP)"
        title="SOP Layanan PTSP Kemenag Murung Raya"
        description="Pedoman baku alur penyelesaian, standar waktu pelayanan (SLA), biaya layanan Rp 0 (Gratis), persyaratan berkas, serta produk layanan resmi pada seluruh 6 bidang PTSP."
        onBackHome={() => onNavigate('beranda')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Ringkasan Standar Maklumat */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Clock,
              label: 'Jam Pelayanan Kantor',
              value: '07:30 – 16:00 WIB',
              sub: OFFICE_INFO.hoursFriday,
            },
            {
              icon: ShieldCheck,
              label: 'Biaya / Tarif PTSP',
              value: 'Rp 0 (Gratis)',
              sub: 'Bebas pungli & gratifikasi sesuai Zona Integritas',
            },
            {
              icon: Layers,
              label: 'Cakupan Bidang Layanan',
              value: `${SERVICE_UNITS.length} Bidang (A–F)`,
              sub: `${SERVICE_UNITS.reduce((acc, u) => acc + u.subServices.length, 0)} jenis layanan aktif`,
            },
            {
              icon: FileCheck2,
              label: 'Keabsahan Produk',
              value: 'Resi & TTE Sah',
              sub: 'Diterbitkan resmi Kankemenag Kab. Murung Raya',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 p-5 space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{item.sub}</p>
              </div>
            );
          })}
        </section>

        {/* 6 Tahapan Baku SOP PTSP */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Siklus Prosedur Baku
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              6 Tahapan Standar Penyelesaian Permohonan PTSP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOP_LIFECYCLE_STEPS.map((st) => (
              <div
                key={st.step}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-800 text-white">
                    SOP-{st.step}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                    {st.sla}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {st.title}
                </h3>
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Pelaksana: {st.actor}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {st.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Rincian Matriks SOP per Bidang & Layanan */}
        <section className="border-t border-slate-200 dark:border-slate-800 pt-10 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Matriks SOP & SLA Per Layanan
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Standar Waktu, Biaya & Output Setiap Layanan
              </h2>
            </div>
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari layanan di bidang ini..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SERVICE_UNITS.map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => setSelectedUnitId(unit.id)}
                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-colors ${
                  selectedUnitId === unit.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                Bidang {unit.code} · {unit.title} ({unit.subServices.length})
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Bidang {activeUnit.code}: {activeUnit.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Penanggung Jawab: {activeUnit.officer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectService(activeUnit.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold self-start sm:self-auto transition-colors"
              >
                <span>Ajukan Layanan {activeUnit.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredServices.map((sub, idx) => (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono-tabular text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded">
                        {activeUnit.code}.{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sub.title}
                      </h4>
                      {sub.restrictedScope && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                          <Lock className="w-2.5 h-2.5" />
                          <span>
                            {sub.restrictedScope === 'kua' ? 'Khusus Pegawai KUA' : 'Khusus ASN'}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-800 dark:text-slate-100">Output:</strong>{' '}
                      {sub.output}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Persyaratan utama: {sub.requirements.length} dokumen/ketentuan ({sub.requirements[0]})
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 text-xs">
                    <span className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900 font-mono-tabular font-bold text-sky-800 dark:text-sky-300">
                      Waktu: {sub.sla}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 font-bold text-emerald-800 dark:text-emerald-300">
                      {sub.fee}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. DIAGRAM ALUR DATA PTSP VIEW                                             */
/* -------------------------------------------------------------------------- */
interface DataFlowNode {
  id: string;
  step: string;
  title: string;
  actor: string;
  channel: string;
  summary: string;
  inputs: string[];
  validations: string[];
  outputs: string[];
}

const DATA_FLOW_NODES: DataFlowNode[] = [
  {
    id: 'pemohon',
    step: 'TAHAP 01',
    title: 'Identifikasi & Pemilihan Layanan',
    actor: 'Masyarakat / Lembaga / ASN Kemenag',
    channel: 'Katalog PTSP (Bidang A–F) & Tiang Penanda Beranda',
    summary:
      'Pemohon meninjau katalog bidang layanan, memeriksa persyaratan serta SLA, dan mengunduh format template .DOC yang sesuai.',
    inputs: [
      'Pemilihan Bidang Layanan (A: Sekretariat s.d. F: Kepegawaian)',
      'Unduhan Format Template Surat Permohonan (.doc)',
    ],
    validations: [
      'Filter akses otomatis: Layanan publik (A–E) vs Layanan Pegawai/KUA (NIP)',
    ],
    outputs: ['Kesiapan berkas pemohon & kelengkapan draf surat pengantar'],
  },
  {
    id: 'auth-upload',
    step: 'TAHAP 02',
    title: 'Autentikasi Akun & Unggah Persyaratan',
    actor: 'Pemohon Terautentikasi (Google / NIP)',
    channel: 'Formulir Permohonan Daring PTSP',
    summary:
      'Pemohon masuk dengan Akun Masyarakat (Google/Email) atau Akun Pegawai (NIP), mengisi identitas permohonan, dan mengunggah file scan PDF/gambar.',
    inputs: [
      'Identitas akun terverifikasi (UID, Nama, Email / NIP)',
      'Lampiran dokumen persyaratan PDF / JPG / PNG (terkompresi rapi <= 560 KB)',
    ],
    validations: [
      'Validasi format dokumen, ukuran lampiran, dan kelengkapan isian formulir wajib',
    ],
    outputs: ['Permohonan tersimpan ke basis data cloud instansi + Nomor Tiket Unik'],
  },
  {
    id: 'loket-ptsp',
    step: 'TAHAP 03',
    title: 'Registrasi & Verifikasi Loket PTSP',
    actor: 'Operator Loket PTSP',
    channel: 'Konsol Operator PTSP',
    summary:
      'Operator PTSP menerima notifikasi tiket masuk, mencetak/memeriksa resi, dan memverifikasi kelengkapan berkas administratif pemohon.',
    inputs: [
      'Tiket baru berstatus "Menunggu Verifikasi"',
      'Pratinjau lampiran dokumen persyaratan pemohon',
    ],
    validations: [
      'Jika berkas kurang/buram -> Status "Perlu Revisi" + Catatan ke Pemohon',
      'Jika berkas lengkap -> Disposisi elektronik ke Seksi Teknis tujuan',
    ],
    outputs: ['Disposisi resmi ke Seksi / Penyelenggara Teknis'],
  },
  {
    id: 'telaah-seksi',
    step: 'TAHAP 04',
    title: 'Telaah Substansi Operator Seksi',
    actor: 'Operator Seksi (TU / Bimas / Pendis / Kepegawaian)',
    channel: 'Konsol Operator Seksi',
    summary:
      'Seksi teknis memeriksa kebenaran data di sistem pendukung (EMIS, SIMKAH, SIMAS, SIAGA, SIMPEG) dan menyusun draf keputusan/rekomendasi.',
    inputs: [
      'Tiket terdisposisi berstatus "Disposisi ke Seksi"',
      'Data dukung sektoral dan hasil verifikasi substansi',
    ],
    validations: [
      'Pemeriksaan kesesuaian regulasi Kementerian Agama & verifikasi faktual',
      'Pencatatan draf nomor surat dan ringkasan telaah',
    ],
    outputs: ['Usulan siap pengesahan berstatus "Siap TTE" menuju Pimpinan'],
  },
  {
    id: 'tte-pimpinan',
    step: 'TAHAP 05',
    title: 'Persetujuan & Tanda Tangan Elektronik (TTE)',
    actor: 'Kepala Kankemenag / Pejabat Berwenang',
    channel: 'Konsol Persetujuan & TTE Pimpinan',
    summary:
      'Kepala Kantor memeriksa draf final surat/rekomendasi dan membubuhkan Tanda Tangan Elektronik (TTE) resmi bernomor dokumen sah.',
    inputs: [
      'Berkas "Siap TTE" lengkap beserta ringkasan telaah Seksi',
      'Nomor Register Dokumen TTE Resmi Kankemenag Murung Raya',
    ],
    validations: [
      'Validasi otoritas pejabat penanda tangan & keabsahan tanggal terbit',
    ],
    outputs: ['Status berubah menjadi "TTE Sah (Selesai)" & Dokumen Digital Terbit'],
  },
  {
    id: 'output-notif',
    step: 'TAHAP 06',
    title: 'Notifikasi Lonceng & Unduh Dokumen Sah',
    actor: 'Pemohon & Arsip Digital Portal',
    channel: 'Lonceng Notifikasi & Riwayat Akun PTSP',
    summary:
      'Sistem mengirim notifikasi real-time ke akun pemohon. Pemohon dapat mencetak Resi maupun mengunduh Dokumen TTE Sah dan mengisi SKM.',
    inputs: [
      'Pembaruan status real-time dari Pimpinan / Operator',
      'Riwayat permohonan pada akun Google / Pegawai pemohon',
    ],
    validations: [
      'Akses unduh Dokumen TTE hanya terbuka bagi pemilik tiket terautentikasi',
    ],
    outputs: ['Dokumen Produk Layanan Sah (Cetak / PDF) & Arsip Transparan'],
  },
];

export function DiagramAlurPtspView({
  onNavigate,
  onOpenServiceSidebar,
}: {
  onNavigate: (v: PageView) => void;
  onOpenServiceSidebar: () => void;
}) {
  const [activeNodeId, setActiveNodeId] = useState<string>(DATA_FLOW_NODES[0].id);
  const [zoomDiagram, setZoomDiagram] = useState(false);
  const activeNode =
    DATA_FLOW_NODES.find((n) => n.id === activeNodeId) || DATA_FLOW_NODES[0];

  const diagramImageSrc = '/assets/aistudio/Alur_Layanan_PTSP_Kemenag_Murung_Raya_8231865d.png';

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <PortalPageHeader
        kicker="Arsitektur & Transparansi Proses"
        title="Diagram Alur Data Layanan PTSP Terpadu"
        description="Visualisasi perjalanan data permohonan secara end-to-end mulai dari pengajuan pemohon, verifikasi Operator PTSP, telaah Operator Seksi, persetujuan TTE Kepala Kantor, hingga notifikasi real-time."
        onBackHome={() => onNavigate('beranda')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Official Diagram Alur Data Infographic */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 p-4 sm:p-7 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Bagan Resmi Pelayanan Terpadu Satu Pintu
              </p>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Diagram Alur Data Pengajuan Permohonan Layanan PTSP
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Kementerian Agama Kabupaten Murung Raya — Klik gambar untuk memperbesar atau unduh bagan resmi.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setZoomDiagram(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Perbesar Bagan</span>
              </button>
              <a
                href={diagramImageSrc}
                download="Diagram-Alur-Data-PTSP-Kemenag-Murung-Raya.png"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh .PNG</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <button
                type="button"
                onClick={() => setZoomDiagram(true)}
                aria-label="Perbesar gambar Diagram Alur Data Pengajuan Permohonan Layanan PTSP"
                className="group relative block w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shadow-md hover:shadow-xl transition-shadow cursor-zoom-in"
              >
                <SafeImage
                  src={diagramImageSrc}
                  alt="Diagram Alur Data Pengajuan Permohonan Layanan PTSP Kementerian Agama Kabupaten Murung Raya"
                  className="w-full h-auto object-contain"
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-[11px] font-bold opacity-90 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Klik untuk Perbesar</span>
                </span>
              </button>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Pihak yang Terlibat
                </p>
                <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {[
                    'Pemohon (Masyarakat / Lembaga / ASN)',
                    'Petugas Loket & Informasi PTSP',
                    'Back Office (Unit Kerja / Seksi Terkait)',
                    'Kepala Seksi / Penyelenggara',
                    'Kepala Kantor Kementerian Agama',
                  ].map((party, idx) => (
                    <li key={party} className="flex items-start gap-2">
                      <span className="font-mono-tabular font-bold text-emerald-700 dark:text-emerald-400">
                        0{idx + 1}.
                      </span>
                      <span>{party}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Persyaratan Umum
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>Identitas diri sah (KTP / SIM / Paspor).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>Berkas persyaratan lengkap sesuai jenis layanan.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-900 p-4 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Alur Pengembalian & Catatan
                </p>
                <p className="text-xs text-amber-950/90 dark:text-amber-200/90 leading-relaxed">
                  Apabila berkas belum lengkap pada tahap verifikasi (poin 5), berkas dikembalikan untuk dilengkapi sesuai petunjuk petugas sebelum dilanjutkan ke registrasi (poin 6–11).
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Two Track Entry Banner */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/35 p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Jalur Pemohon Publik
              </p>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Akun Masyarakat (Google / Email)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mengakses Bidang A–E (Sekretariat, Bimas Islam, Pendidikan Islam, Bimas Hindu, dan Penyelenggara Kristen) serta memantau tiket via notifikasi lonceng.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/35 p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Jalur Pegawai & KUA
              </p>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Akun Pegawai Kemenag (NIP Terverifikasi)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mengakses seluruh layanan termasuk Bidang F (Kepegawaian ASN), Tauliyah Wali Hakim KUA, serta konsol Operator PTSP, Seksi, dan Pimpinan TTE.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Pipeline Nodes */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Klik Setiap Tahap Untuk Detail Alur Data
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Rantai Pemrosesan Data & Dokumen PTSP (6 Tahap)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DATA_FLOW_NODES.map((node) => {
              const isSelected = node.id === activeNode.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveNodeId(node.id)}
                  className={`text-left rounded-2xl border p-4 sm:p-5 transition-all duration-150 flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-900 text-white shadow-lg ring-2 ring-emerald-400/50'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono-tabular text-[11px] font-black px-2.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-emerald-500/25 text-emerald-200'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {node.step}
                      </span>
                      <GitBranch
                        className={`w-4 h-4 ${
                          isSelected ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-sm font-extrabold leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {node.title}
                    </h3>
                    <p
                      className={`text-[11px] font-semibold ${
                        isSelected
                          ? 'text-emerald-200'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {node.actor}
                    </p>
                  </div>
                  <p
                    className={`text-xs leading-relaxed line-clamp-2 ${
                      isSelected ? 'text-emerald-50/90' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {node.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detail Inspector Card for Active Node */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-mono-tabular text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {activeNode.step} · {activeNode.channel}
                </p>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeNode.title}
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 w-fit">
                Aktor: {activeNode.actor}
              </span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeNode.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Data Masuk (Input)
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {activeNode.inputs.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono-tabular font-bold text-sky-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Validasi & Kontrol
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {activeNode.validations.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono-tabular font-bold text-amber-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Keluaran (Output Data)
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {activeNode.outputs.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenServiceSidebar}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <span>Mulai Pengajuan PTSP Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('panduan-ptsp')}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Baca Panduan Layanan PTSP</span>
            </button>
          </div>
        </section>
      </div>

      {/* Fullscreen Zoom Modal for Official Diagram Image */}
      {zoomDiagram && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan penuh Diagram Alur Data PTSP"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomDiagram(false);
          }}
        >
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-4">
            <div className="px-4 sm:px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                Diagram Alur Data Pengajuan Permohonan Layanan PTSP — Kemenag Kab. Murung Raya
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={diagramImageSrc}
                  download="Diagram-Alur-Data-PTSP-Kemenag-Murung-Raya.png"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </a>
                <button
                  type="button"
                  onClick={() => setZoomDiagram(false)}
                  aria-label="Tutup tampilan penuh diagram"
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 sm:p-5 max-h-[82vh] overflow-y-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
              <SafeImage
                src={diagramImageSrc}
                alt="Diagram Alur Data Pengajuan Permohonan Layanan PTSP ukuran penuh"
                className="w-full max-w-2xl h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. PANDUAN PENGAJUAN LAYANAN PTSP VIEW                                     */
/* -------------------------------------------------------------------------- */
const GUIDE_STEPS = [
  {
    num: '01',
    icon: Layers,
    title: 'Pilih Bidang & Jenis Layanan yang Dibutuhkan',
    desc: 'Buka Katalog Layanan PTSP di Beranda atau tekan tombol "Layanan PTSP" di tepi kiri/bawah layar untuk menelusuri Bidang A (Sekretariat), B (Bimas Islam), C (Pendis), D (Bimas Hindu), E (Bimas Kristen), atau F (Kepegawaian).',
    tip: 'Pastikan Anda membaca deskripsi output, waktu penyelesaian (SLA), dan daftar persyaratan sebelum menyiapkan berkas.',
  },
  {
    num: '02',
    icon: UserCheck,
    title: 'Masuk (Login) Sebagai Masyarakat atau Pegawai',
    desc: 'Untuk keamanan data dan sinkronisasi riwayat tiket, klik Masuk / Login: gunakan Akun Google / Email bagi Masyarakat Umum (Bidang A–E), atau Login Pegawai (NIP) bagi ASN Kemenag dan Kepala KUA.',
    tip: 'Notifikasi status permohonan dan pengunduhan dokumen TTE hanya dikirimkan kepada pemilik akun yang login.',
  },
  {
    num: '03',
    icon: FileText,
    title: 'Unduh & Lengkapi Format Template Dokumen (.DOC)',
    desc: 'Banyak layanan (seperti izin penelitian, IJOP madrasah/pontren, mutasi siswa, permohonan rohaniawan, hingga layanan kepegawaian) menyediakan format surat resmi .DOC yang dapat diunduh langsung pada kartu layanan atau menu Dokumen Penting.',
    tip: 'Lengkapi tanggal, nomor surat lembaga, tanda tangan pimpinan/pemohon, lalu simpan menjadi PDF atau foto yang jelas.',
  },
  {
    num: '04',
    icon: Upload,
    title: 'Siapkan & Unggah Scan/Foto Berkas Persyaratan',
    desc: 'Pada formulir pengajuan daring, unggah setiap berkas persyaratan dalam format PDF, JPG, atau PNG. Sistem mendukung optimasi ukuran berkas agar cepat terkirim (maksimal sekitar 560 KB per berkas).',
    tip: 'Pastikan teks KTP, surat pengantar, dan stempel terlihat terbaca utuh agar tidak dikembalikan dengan status "Perlu Revisi".',
  },
  {
    num: '05',
    icon: Send,
    title: 'Kirim Permohonan & Simpan Nomor Tiket',
    desc: 'Setelah seluruh kolom wajib terisi dan berkas terunggah, tekan tombol Kirim Permohonan. Anda langsung memperoleh Nomor Tiket resmi dan dapat mencetak/menyimpan Resi Pendaftaran.',
    tip: 'Catat Nomor Tiket untuk pencarian cepat pada kolom Pelacakan & Riwayat Layanan.',
  },
  {
    num: '06',
    icon: Bell,
    title: 'Pantau Progres Real-Time & Unduh Dokumen TTE Sah',
    desc: 'Periksa ikon Lonceng Notifikasi di bagian atas website untuk memantau perpindahan status: Menunggu Verifikasi -> Disposisi ke Seksi -> Siap TTE -> TTE Sah (Selesai).',
    tip: 'Saat berstatus "TTE Sah (Selesai)", Anda dapat langsung mengunduh/mencetak Dokumen Sah dari halaman Riwayat Layanan.',
  },
];

export function PanduanPtspView({
  onNavigate,
  onOpenServiceSidebar,
  onBackToKatalog,
}: {
  onNavigate: (v: PageView) => void;
  onOpenServiceSidebar: () => void;
  onBackToKatalog: () => void;
}) {
  const { openLoginModal, user } = useAuthRole();

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <PortalPageHeader
        kicker="Panduan Pengguna Portal"
        title="Panduan Layanan PTSP"
        description="Langkah praktis bagi masyarakat, pengurus rumah ibadah, lembaga pendidikan, dan ASN Kemenag dalam mengajukan permohonan layanan secara cepat, tertib, dan gratis (Rp 0)."
        onBackHome={() => onNavigate('beranda')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* 6-Step Handbook Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDE_STEPS.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tabular text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-800 text-white">
                      Langkah {st.num}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {st.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-emerald-800 dark:text-emerald-400">Tips:</strong>{' '}
                  {st.tip}
                </div>
              </div>
            );
          })}
        </section>

        {/* FAQ & Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-t border-slate-200 dark:border-slate-800 pt-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <HelpCircle className="w-4 h-4" />
              <p className="text-xs font-extrabold uppercase tracking-widest">
                Pertanyaan yang Sering Diajukan
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  q: 'Apakah pengajuan layanan PTSP dipungut biaya?',
                  a: 'Seluruh layanan administrasi perizinan, rekomendasi, konsultasi, legalisir, dan aktivasi akun pada PTSP Kankemenag Kab. Murung Raya tidak dipungut biaya / Rp 0 (Gratis).',
                },
                {
                  q: 'Bagaimana jika berkas unggahan saya ditandai "Perlu Revisi"?',
                  a: 'Buka menu Lonceng Notifikasi atau Riwayat Layanan untuk membaca catatan petugas loket/seksi, lalu perbaiki berkas dan ajukan kembali sesuai arahan petugas.',
                },
                {
                  q: 'Apakah saya harus datang ke kantor di Puruk Cahu untuk mengambil surat?',
                  a: 'Untuk layanan bertanda tangan elektronik (TTE), dokumen sah dapat langsung diunduh dan dicetak melalui akun Anda. Pengambilan fisik khusus dokumen berstempel basah dilakukan di loket PTSP Kantor Kemenag Murung Raya.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900 p-4 sm:p-5 space-y-1.5"
                >
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-emerald-950 text-white border border-emerald-800 p-6 space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
              Aksi Cepat Pemohon
            </p>
            <h3 className="text-lg font-extrabold leading-snug">
              Siap Mengajukan Permohonan ke Loket PTSP Digital?
            </h3>
            <p className="text-xs text-emerald-100/85 leading-relaxed">
              Pilih layanan melalui Katalog Bidang atau masuk dengan akun Anda terlebih dahulu. Bantuan langsung tersedia di {OFFICE_INFO.whatsapp} (WhatsApp) dan {OFFICE_INFO.phone}.
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={onBackToKatalog}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-extrabold flex items-center justify-between transition-colors"
              >
                <span>Buka Katalog Layanan PTSP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenServiceSidebar}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-between transition-colors"
              >
                <span>Pilih Layanan di Sidebar PTSP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {!user && (
                <button
                  type="button"
                  onClick={() => openLoginModal('google')}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>Login Akun Masyarakat / Pegawai</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('dokumen-penting')}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-emerald-100 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>Unduh Template Formulir (.DOC)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. INOVASI KEMENAG MURA VIEW                                               */
/* -------------------------------------------------------------------------- */
export function InovasiMuraView({
  onNavigate,
  onBackToKatalog,
}: {
  onNavigate: (v: PageView) => void;
  onBackToKatalog: () => void;
}) {
  const innovations = [
    {
      id: 'siatlk-ptsp',
      badge: 'Pelayanan Publik Digital',
      title: 'PTSP Digital Terpadu (SIATLK Murung Raya)',
      desc: 'Transformasi layanan satu pintu seluruh Bidang A–F dari meja manual menjadi portal pengajuan daring lengkap dengan unggah berkas, template .DOC siap unduh, pelacakan nomor tiket, dan cetak resi.',
      impact: 'Memangkas jarak geografis warga di 10 kecamatan hulu Barito tanpa perlu berulang kali datang ke Puruk Cahu.',
      icon: Sparkles,
      ctaLabel: 'Buka Katalog Layanan PTSP',
      onClick: onBackToKatalog,
    },
    {
      id: 'sipendismura',
      badge: 'Pendidikan Islam',
      title: 'SIPENDISMURA (Sistem Informasi Pendidikan Islam Mura)',
      desc: 'Portal informasi dan pendataan layanan Pendidikan Islam Kabupaten Murung Raya yang memadukan data RA/Madrasah, Pondok Pesantren, TPQ/LPQ, serta layanan Guru PAI secara terstruktur.',
      impact: 'Mempercepat koordinasi operator madrasah, aktivasi EMIS & SIAGA PAI, serta transparansi profil satuan pendidikan.',
      icon: Building2,
      href: 'https://sipendismura.my.id',
      ctaLabel: 'Kunjungi SIPENDISMURA',
    },
    {
      id: 'tte-resmi',
      badge: 'Transformasi Kertas ke Digital',
      title: 'Penerbitan Dokumen & Verifikasi TTE Kepala Kantor',
      desc: 'Alur disposisi berjenjang dari Operator PTSP -> Seksi Teknis -> Pimpinan yang menghasilkan dokumen sah bernomor register dan Tanda Tangan Elektronik (TTE) yang dapat diunduh langsung pemohon.',
      impact: 'Menjamin keaslian surat rekomendasi, izin operasional, surat tugas, serta akuntabilitas arsip digital.',
      icon: FileCheck2,
      ctaLabel: 'Lihat Diagram Alur TTE',
      onClick: () => onNavigate('diagram-alur-ptsp'),
    },
    {
      id: 'self-service-bimas',
      badge: 'Akses Cepat Keagamaan',
      title: 'Kalkulator Zakat & Jadwal Imsakiyah Kab. Murung Raya',
      desc: 'Fasilitas layanan informasi keagamaan langsung tanpa tiket PTSP dengan acuan harga beras dan koordinat hisab Puruk Cahu tahun 2024–2026 serta unduhan dokumen ketentuan resmi.',
      impact: 'Memberi rujukan praktis bagi UPZ, takmir masjid, dan masyarakat dalam menunaikan zakat maupun ibadah harian.',
      icon: FileSpreadsheet,
      ctaLabel: 'Jelajahi Bidang Bimas Islam',
      onClick: onBackToKatalog,
    },
    {
      id: 'lintas-iman-kua',
      badge: 'Moderasi & Layanan Kecamatan',
      title: 'Data Terbuka Lintas Seksi & Layanan KUA Terintegrasi',
      desc: 'Publikasi data terpadu Rumah Ibadah Lintas Iman (Masjid, Mushalla, Gereja, Pura/Balai Basarah), Pasraman, Penyuluh Agama, ASN, dan KUA di seluruh kecamatan Kabupaten Murung Raya.',
      impact: 'Mewujudkan kerukunan umat beragama dan pemerataan informasi layanan keagamaan hingga tingkat desa.',
      icon: Landmark,
      ctaLabel: 'Buka Menu Informasi Seksi',
      onClick: () => onNavigate('informasi'),
    },
    {
      id: 'zi-wbs',
      badge: 'Zona Integritas WBK/WBBM',
      title: 'Portal Zero Pungli, E-Pengaduan & Survei SKM Real-Time',
      desc: 'Integrasi saluran pengaduan masyarakat, pelaporan SPAN LAPOR, serta Survei Kepuasan Masyarakat (SKM) untuk mengawal seluruh layanan tetap Rp 0 (Gratis) dan transparan.',
      impact: 'Memperkuat pengawasan publik dan menjaga mutu pelayanan prima Kankemenag Kabupaten Murung Raya.',
      icon: ShieldCheck,
      ctaLabel: 'Buka Zona Integritas / Pengaduan',
      onClick: () => onNavigate('zona-integritas'),
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <PortalPageHeader
        kicker="Reformasi Birokrasi & Digitalisasi"
        title="Inovasi Layanan Kemenag Kabupaten Murung Raya"
        description="Ragam terobosan digital dan inovasi pelayanan publik Kantor Kementerian Agama Kabupaten Murung Raya untuk menghadirkan layanan yang Cepat, Transparan, Humanis, dan Bebas Pungli di Bumi Tana Malai Tolung Lingu."
        onBackHome={() => onNavigate('beranda')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Banner Motto PRIMA */}
        <section className="rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-emerald-800">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-300">
              <Lightbulb className="w-4 h-4" />
              <span>Komitmen Pelayanan {OFFICE_INFO.mottoAcronym}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Mendekatkan Layanan dari Puruk Cahu hingga Kecamatan Hulu
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Setiap inovasi dirancang agar masyarakat, pengurus rumah ibadah, madrasah, dan ASN di seluruh Kabupaten Murung Raya merasakan kemudahan akses layanan resmi Kementerian Agama.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {OFFICE_INFO.serviceValues.map((val) => (
              <div
                key={val.letter}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center min-w-[78px]"
              >
                <span className="block text-base font-black text-amber-300">{val.letter}</span>
                <span className="block text-[10px] font-semibold text-emerald-100">
                  {val.word}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Grid 6 Inovasi Unggulan */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {innovations.map((inv) => {
            const Icon = inv.icon;
            return (
              <div
                key={inv.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {inv.badge}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {inv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {inv.desc}
                  </p>
                  <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-emerald-800 dark:text-emerald-400">Manfaat:</strong>{' '}
                    {inv.impact}
                  </div>
                </div>

                {inv.href ? (
                  <a
                    href={inv.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full min-h-[42px] px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{inv.ctaLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={inv.onClick}
                    className="inline-flex items-center justify-center gap-2 w-full min-h-[42px] px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  >
                    <span>{inv.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
