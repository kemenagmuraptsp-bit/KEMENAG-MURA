import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ChevronRight,
  Church,
  ExternalLink,
  Play,
  Building2,
  GraduationCap,
  IdCard,
  Lock,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import {
  OFFICE_INFO,
  SERVICE_UNITS,
  LEADERSHIP_QUOTES,
  GALLERY_ITEMS,
  INFOGRAFIS_TABS,
  VIDEO_ITEMS,
  EXTERNAL_APPS,
} from '@/src/data/kemenagData';
import {
  PageView,
  ServiceUnit,
  NewsArticle,
  GalleryItem,
  InfografisCategory,
} from '@/src/types';
import { SafeImage } from '@/src/components/SafeImage';
import kartuSekretariatImg from '@/src/assets/images/katalog_full_sekretariat_1795232127240.jpg';
import kartuBimasIslamImg from '@/src/assets/images/katalog_full_bimas_islam_1795232127252.jpg';
import kartuPendisImg from '@/src/assets/images/katalog_full_pendis_1795232126912.jpg';
import kartuBimasHinduImg from '@/src/assets/images/katalog_full_bimas_hindu_1795232127988.jpg';
import kartuKristenImg from '@/src/assets/images/katalog_full_bimas_kristen_1795232127426.jpg';
import kartuKepegawaianImg from '@/src/assets/images/katalog_full_kepegawaian_1795232127634.jpg';

interface BerandaViewProps {
  lang: 'id' | 'en';
  onNavigate: (view: PageView) => void;
  onSelectService: (unit: ServiceUnit) => void;
  onOpenServiceSidebar: () => void;
  onSelectArticle: (article: NewsArticle) => void;
  onSelectGallery: (item: GalleryItem) => void;
}

const HERO_PHRASES_ID = [
  ['Transformasi Digital Terpadu', 'Pelayanan PTSP Murung Raya'],
  ['Kemenag Murung Raya', 'Hadir Melayani Sepenuh Hati'],
  ['Bersama Merawat Harmoni', 'Bumi Tana Malai Tolung Lingu'],
];

const HERO_PHRASES_EN = [
  ['Integrated Digital Transformation', 'PTSP Murung Raya Services'],
  ['Kemenag Murung Raya', 'Serving With Sincere Dedication'],
  ['Nurturing Religious Harmony', 'Across Murung Raya Regency'],
];

const SERVICE_ICONS: Record<string, typeof Building2> = {
  sekretariat: Building2,
  'bimas-islam': Moon,
  pendis: GraduationCap,
  'bimas-hindu': Sun,
  'bimas-kristen': Church,
  kepegawaian: IdCard,
};

const SERVICE_IMAGES: Record<string, string> = {
  sekretariat: kartuSekretariatImg,
  'bimas-islam': kartuBimasIslamImg,
  pendis: kartuPendisImg,
  'bimas-hindu': kartuBimasHinduImg,
  'bimas-kristen': kartuKristenImg,
  kepegawaian: kartuKepegawaianImg,
};

const SERVICE_MODERN_THEMES: Record<
  string,
  {
    cardFrame: string;
    scrim: string;
    iconBg: string;
    ctaText: string;
    accentLine: string;
    fallbackBg: string;
  }
> = {
  sekretariat: {
    cardFrame:
      'border-emerald-300/60 hover:border-emerald-400 hover:shadow-[0_22px_45px_-12px_rgba(6,95,70,0.5)]',
    scrim: 'from-emerald-950/95 via-emerald-950/75 to-transparent',
    iconBg: 'bg-emerald-600/85 text-white',
    ctaText: 'text-emerald-300',
    accentLine: 'from-emerald-400 to-teal-300',
    fallbackBg: 'bg-emerald-950',
  },
  'bimas-islam': {
    cardFrame:
      'border-teal-300/60 hover:border-teal-400 hover:shadow-[0_22px_45px_-12px_rgba(17,94,89,0.5)]',
    scrim: 'from-teal-950/95 via-teal-950/75 to-transparent',
    iconBg: 'bg-teal-600/85 text-white',
    ctaText: 'text-teal-300',
    accentLine: 'from-teal-400 to-emerald-300',
    fallbackBg: 'bg-teal-950',
  },
  pendis: {
    cardFrame:
      'border-sky-300/60 hover:border-sky-400 hover:shadow-[0_22px_45px_-12px_rgba(7,89,133,0.5)]',
    scrim: 'from-sky-950/95 via-slate-950/75 to-transparent',
    iconBg: 'bg-sky-600/85 text-white',
    ctaText: 'text-sky-300',
    accentLine: 'from-sky-400 to-cyan-300',
    fallbackBg: 'bg-sky-950',
  },
  'bimas-hindu': {
    cardFrame:
      'border-amber-300/60 hover:border-amber-400 hover:shadow-[0_22px_45px_-12px_rgba(146,64,14,0.5)]',
    scrim: 'from-amber-950/95 via-stone-950/75 to-transparent',
    iconBg: 'bg-amber-600/85 text-white',
    ctaText: 'text-amber-300',
    accentLine: 'from-amber-400 to-orange-300',
    fallbackBg: 'bg-amber-950',
  },
  'bimas-kristen': {
    cardFrame:
      'border-violet-300/60 hover:border-violet-400 hover:shadow-[0_22px_45px_-12px_rgba(91,33,182,0.5)]',
    scrim: 'from-violet-950/95 via-slate-950/75 to-transparent',
    iconBg: 'bg-violet-600/85 text-white',
    ctaText: 'text-violet-300',
    accentLine: 'from-violet-400 to-purple-300',
    fallbackBg: 'bg-violet-950',
  },
  kepegawaian: {
    cardFrame:
      'border-indigo-300/60 hover:border-indigo-400 hover:shadow-[0_22px_45px_-12px_rgba(55,48,163,0.5)]',
    scrim: 'from-indigo-950/95 via-slate-950/75 to-transparent',
    iconBg: 'bg-indigo-600/85 text-white',
    ctaText: 'text-indigo-300',
    accentLine: 'from-indigo-400 to-sky-300',
    fallbackBg: 'bg-indigo-950',
  },
};

const APP_ACCENTS: Record<string, string> = {
  'app-pusaka': 'bg-emerald-700 text-white',
  'app-emis': 'bg-teal-700 text-white',
  'app-tte': 'bg-slate-900 dark:bg-slate-800 text-white',
  'app-asndigital': 'bg-sky-800 text-white',
  'app-pintar': 'bg-amber-600 text-white',
  'app-simpeg': 'bg-emerald-800 text-white',
  'app-srikandi': 'bg-indigo-800 text-white',
  'app-simkah': 'bg-teal-800 text-white',
};

export function BerandaView({
  lang,
  onNavigate,
  onSelectService,
  onOpenServiceSidebar,
  onSelectArticle,
  onSelectGallery,
}: BerandaViewProps) {
  const { isVerifiedEmployee, isMasyarakatLogin, newsArticles } = useAuthRole();
  const visibleServiceUnits = isMasyarakatLogin
    ? SERVICE_UNITS.filter((unit) => unit.id !== 'kepegawaian')
    : SERVICE_UNITS;
  const [activeInfografis, setActiveInfografis] = useState<InfografisCategory>('utama');
  const [activeVideoId, setActiveVideoId] = useState<string>(VIDEO_ITEMS[0].id);

  // Typewriter state matching Barito Utara hero headline animation
  const phrases = lang === 'en' ? HERO_PHRASES_EN : HERO_PHRASES_ID;
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charCount, setCharCount] = useState(phrases[0].join('\n').length);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = phrases[phraseIdx].join('\n');
    let timer: number;

    if (!isDeleting && charCount < fullText.length) {
      timer = window.setTimeout(() => setCharCount((c) => c + 1), 45);
    } else if (!isDeleting && charCount >= fullText.length) {
      timer = window.setTimeout(() => setIsDeleting(true), 3200);
    } else if (isDeleting && charCount > 0) {
      timer = window.setTimeout(() => setCharCount((c) => c - 1), 24);
    } else {
      timer = window.setTimeout(() => {
        setIsDeleting(false);
        setPhraseIdx((idx) => (idx + 1) % phrases.length);
      }, 250);
    }

    return () => window.clearTimeout(timer);
  }, [charCount, isDeleting, phraseIdx, phrases]);

  const currentFull = phrases[phraseIdx].join('\n');
  const typedText = currentFull.slice(0, charCount);
  const [typedLine1, typedLine2 = ''] = typedText.split('\n');
  const onSecondLine = typedText.includes('\n');

  const leadArticle = newsArticles[0];
  const secondaryToday = newsArticles.slice(1, 3);
  const nasionalArticles = newsArticles.filter(
    (a) => a.section === 'nasional' || a.section === 'terpopuler'
  ).slice(0, 4);

  const categoryBlocks = [
    'Penyelenggara Zakat & Wakaf',
    'Penyelenggara Hindu',
    'Pendidikan Madrasah',
    'Bimas Islam',
    'Bimas Kristen',
    'Kegiatan',
  ].map((catName) => ({
    name: catName,
    items: newsArticles.filter((a) => a.category === catName),
  }));

  const currentInfografis =
    INFOGRAFIS_TABS.find((t) => t.id === activeInfografis) || INFOGRAFIS_TABS[0];

  const activeVideo =
    VIDEO_ITEMS.find((v) => v.id === activeVideoId) || VIDEO_ITEMS[0];

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* SECTION 0: Full-Screen Hero dengan Background Utama Web & Scrim Biru Navy */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#09152b] flex flex-col justify-between pt-28 sm:pt-36 pb-8">
        {/* Background Utama Web + Lapisan Scrim Biru Navy Transparan */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <SafeImage
            src={OFFICE_INFO.heroImage}
            alt="Panorama Masjid Agung Al-Istiqlal dan Harmoni Rumah Ibadah Kabupaten Murung Raya"
            className="w-full h-full object-cover object-bottom sm:object-center opacity-90"
          />
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#071226]/85 via-[#0b1d3d]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#08152d]/60 via-[#0e2247]/35 to-[#071226]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,29,61,0.45)_0%,rgba(11,29,61,0.18)_58%,rgba(7,18,38,0.62)_100%)]" />
        </div>

        {/* Center-Upper Hero Typography */}
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16 mt-2 sm:mt-4 mb-auto">
          <div className="mx-auto max-w-5xl text-center flex flex-col items-center px-6 py-4">
            <p className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.2em] text-sky-200 drop-shadow-[0_2px_10px_rgba(7,18,38,0.92)]">
              {lang === 'en'
                ? 'Ministry of Religious Affairs of the Republic of Indonesia'
                : 'Kementerian Agama Republik Indonesia'}
              <span className="block text-white mt-1">
                {lang === 'en' ? 'Murung Raya Regency' : 'Kabupaten Murung Raya'}
              </span>
            </p>

            <h1 className="mt-4 sm:mt-6 w-full text-center min-h-[2.7em] text-[clamp(1.75rem,4.4vw,3.75rem)] font-black tracking-tight leading-[1.2] drop-shadow-[0_4px_16px_rgba(7,18,38,0.88)]">
              <span className="block bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                {typedLine1 || '\u00A0'}
                {!onSecondLine && (
                  <span
                    aria-hidden="true"
                    className="inline-block w-[3px] h-[0.9em] bg-sky-300 align-middle ml-1 animate-cursor-blink"
                  />
                )}
              </span>
              <span className="block bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent mt-1">
                {typedLine2 || '\u00A0'}
                {onSecondLine && (
                  <span
                    aria-hidden="true"
                    className="inline-block w-[3px] h-[0.9em] bg-sky-300 align-middle ml-1 animate-cursor-blink"
                  />
                )}
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm sm:text-base md:text-lg text-sky-50/95 leading-relaxed font-medium drop-shadow-[0_2px_10px_rgba(7,18,38,0.92)]">
              {lang === 'en'
                ? 'Official portal for religious services and public information that is Professional, Responsive, High-Integrity, Modern, and Accountable for the people of Murung Raya.'
                : 'Website resmi pelayanan dan informasi keagamaan yang Profesional, Responsif, Integritas, Modern, dan Akuntabel bagi seluruh masyarakat Kabupaten Murung Raya.'}
            </p>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="relative z-10 flex justify-center pt-6">
          <a
            href="#katalog-ptsp"
            className="group flex flex-col items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.25em] text-sky-200 hover:text-white drop-shadow-[0_2px_8px_rgba(7,18,38,0.92)] transition-colors"
          >
            <span>{lang === 'en' ? 'Scroll Down' : 'Gulir ke bawah'}</span>
            <ArrowDown
              strokeWidth={2.75}
              className="w-4 h-4 text-sky-200 group-hover:text-white animate-arrow-down-pulse"
              aria-hidden="true"
            />
            <span className="w-6 h-9 rounded-full border-2 border-sky-300/80 group-hover:border-white bg-[#071226]/60 flex items-start justify-center p-1.5 shadow-[0_0_16px_rgba(56,189,248,0.35)] transition-colors">
              <span className="w-1.5 h-2 rounded-full bg-sky-300 group-hover:bg-white animate-scroll-wheel" />
            </span>
          </a>
        </div>
      </section>

      {/* SECTION 1: Katalog Layanan PTSP */}
      <section
        id="katalog-ptsp"
        className="scroll-mt-20 py-10 lg:py-12 bg-white/95 dark:bg-slate-950 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-14">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              {lang === 'en' ? 'Public Services' : 'Layanan Masyarakat'}
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Katalog Layanan PTSP Terpadu
            </h2>
            <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-300">
              <span className="text-amber-600 dark:text-amber-400">S</span>istem{' '}
              <span className="text-amber-600 dark:text-amber-400">I</span>nformasi{' '}
              <span className="text-amber-600 dark:text-amber-400">A</span>dministrasi{' '}
              <span className="text-amber-600 dark:text-amber-400">T</span>erpadu{' '}
              <span className="text-amber-600 dark:text-amber-400">L</span>ayanan{' '}
              <span className="text-amber-600 dark:text-amber-400">K</span>eagamaan Kabupaten Murung Raya
            </p>
          </div>

          <div
            className={`mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${
              visibleServiceUnits.length === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-6'
            } gap-3.5`}
          >
            {visibleServiceUnits.map((unit) => {
              const Icon = SERVICE_ICONS[unit.id] || Building2;
              const coverSrc = SERVICE_IMAGES[unit.id];
              const theme = SERVICE_MODERN_THEMES[unit.id] || SERVICE_MODERN_THEMES.sekretariat;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => onSelectService(unit)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 sm:p-4 text-left min-h-[220px] sm:min-h-[235px] shadow-md hover:-translate-y-1 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-emerald-700 ${theme.fallbackBg} ${theme.cardFrame}`}
                >
                  {/* Full-Bleed Category Background with Service Officer */}
                  <SafeImage
                    src={coverSrc}
                    alt={`Petugas pelayanan dan ruang layanan ${unit.title}`}
                    fallbackLabel={unit.title}
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Top subtle vignette for top metadata legibility */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/65 via-slate-950/20 to-transparent pointer-events-none"
                  />

                  {/* Bottom rich category-tinted contrast scrim */}
                  <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t ${theme.scrim} pointer-events-none transition-opacity duration-300`}
                  />

                  {/* Top Row: Category Icon & Service Count */}
                  <div className="relative z-10 flex items-center justify-between gap-2 w-full">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-md ring-1 ring-white/30 shadow-md ${theme.iconBg}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-mono-tabular text-white font-bold tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate">
                      Bidang {unit.code} · {unit.subServices.length} layanan
                    </span>
                  </div>

                  {/* Bottom Content Overlay */}
                  <div className="relative z-10 mt-auto space-y-1.5 w-full pt-8">
                    <div
                      aria-hidden="true"
                      className={`h-0.5 w-8 rounded-full bg-gradient-to-r ${theme.accentLine} group-hover:w-14 transition-all duration-300`}
                    />
                    <h3 className="text-sm sm:text-[15px] font-black text-white leading-snug uppercase tracking-tight flex items-center gap-1.5 drop-shadow-sm pr-2">
                      <span className="service-card-expand-title">{unit.title}</span>
                      {unit.id === 'kepegawaian' && !isVerifiedEmployee && (
                        <Lock className="w-3 h-3 text-amber-300 shrink-0" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-100/90 line-clamp-2 leading-snug font-medium drop-shadow-xs">
                      {unit.shortDesc}
                    </p>

                    <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-2 w-full">
                      <span className={`inline-block origin-left transition-transform duration-200 group-hover:scale-105 text-[11px] font-extrabold tracking-wide ${theme.ctaText}`}>
                        {unit.id === 'kepegawaian' && !isVerifiedEmployee
                          ? 'Login Pegawai'
                          : 'Lihat Sub-Layanan'}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-white group-hover:bg-white group-hover:text-slate-950 flex items-center justify-center transition-all duration-200">
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenServiceSidebar}
              className="menu-expand-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <span className="menu-expand-label">
                Buka Menu Sidebar Layanan (
                {visibleServiceUnits.reduce((sum, u) => sum + u.subServices.length, 0)} Sub-Menu)
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('layanan')}
              className="menu-expand-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-white/10"
            >
              <span className="menu-expand-label">Halaman Layanan & Lacak Tiket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Zona Integritas — Apa Kata Mereka */}
      <section className="py-12 lg:py-16 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              Zona Integritas
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Apa Kata Mereka
            </h2>
            <p className="mt-3 text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300">
              Komitmen dan pesan inspiratif dari para pimpinan untuk memperkuat layanan umat di
              Kabupaten Murung Raya.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEADERSHIP_QUOTES.map((leader) => {
              const initials = leader.name
                .split(' ')
                .filter((w) => !w.includes('.'))
                .slice(0, 2)
                .map((w) => w[0])
                .join('');
              return (
                <article
                  key={leader.id}
                  className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/85 dark:border-white/12 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs"
                >
                  <div className="text-center space-y-3">
                    <span
                      aria-hidden="true"
                      className="block text-3xl font-serif-editorial text-emerald-600/45 dark:text-emerald-400/50 leading-none"
                    >
                      “
                    </span>
                    <div className="space-y-3 font-serif-editorial italic text-sm text-slate-700 dark:text-zinc-200 leading-relaxed">
                      {leader.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-700 dark:bg-emerald-800 text-white font-bold text-base flex items-center justify-center border-2 border-white dark:border-zinc-700 shadow-md ring-2 ring-emerald-500/20 dark:ring-emerald-400/25">
                      {initials}
                    </div>
                    <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white">
                      {leader.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {leader.role}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: Berita Hari Ini + Grid Kategori 2 Kolom */}
      <section className="py-14 lg:py-20 bg-white/95 dark:bg-slate-950 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400">
                Berita
              </p>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white max-w-2xl">
                Ikuti pembaruan kegiatan dan informasi terkini
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-300">
                Berita resmi dari Kementerian Agama Kabupaten Murung Raya untuk masyarakat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('berita')}
              className="menu-expand-btn inline-flex items-center gap-2 rounded-full border border-slate-200/90 dark:border-white/20 bg-white/90 dark:bg-zinc-800/70 backdrop-blur-sm px-7 py-3 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white hover:border-emerald-600 hover:bg-emerald-700 hover:text-white whitespace-nowrap shrink-0 shadow-2xs"
            >
              <span className="menu-expand-label">Lihat Semua</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {leadArticle ? (
              <div className="lg:col-span-7 border border-slate-200/85 dark:border-white/12 rounded-3xl overflow-hidden bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-xs">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <SafeImage
                    src={leadArticle.image}
                    alt={leadArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Berita Hari Ini
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{leadArticle.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{leadArticle.date}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    <button
                      type="button"
                      onClick={() => onSelectArticle(leadArticle)}
                      className="text-left hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      {leadArticle.title}
                    </button>
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {leadArticle.excerpt}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectArticle(leadArticle)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline underline-offset-4"
                    >
                      <span>Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-7 border border-slate-200/85 dark:border-white/12 rounded-3xl p-8 text-center text-sm text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50">
                Belum ada berita yang dipublikasikan.
              </div>
            )}

            <div className="lg:col-span-5 space-y-5">
              {secondaryToday.map((item) => (
                <article
                  key={item.id}
                  className="border border-slate-200/85 dark:border-white/12 rounded-2xl p-4 flex gap-4 items-start bg-white/95 dark:bg-slate-900/90 backdrop-blur-md hover:border-emerald-500/70 shadow-2xs transition-colors"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {item.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      <button
                        type="button"
                        onClick={() => onSelectArticle(item)}
                        className="text-left hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        {item.title}
                      </button>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                </article>
              ))}

              <div className="border border-slate-200/85 dark:border-white/12 rounded-2xl p-5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/10">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Berita Nasional & Terpopuler
                  </h3>
                  <span className="text-xs font-mono-tabular text-emerald-700 dark:text-emerald-400 font-semibold">
                    Populer
                  </span>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-white/10">
                  {nasionalArticles.map((pop, i) => (
                    <li key={pop.id} className="py-2.5 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => onSelectArticle(pop)}
                        className="w-full text-left group flex items-start gap-3"
                      >
                        <span className="font-mono-tabular text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          0{i + 1}
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 leading-snug">
                            {pop.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {pop.category} · {pop.date} · {pop.views} dibaca
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {categoryBlocks.map((cat) => (
              <div
                key={cat.name}
                className="rounded-3xl border border-slate-200/85 dark:border-white/12 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-emerald-500/60 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                        Kategori
                      </span>
                      <h3 className="text-lg sm:text-xl font-black mt-0.5 text-slate-900 dark:text-white">
                        {cat.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('berita')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/30 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 transition-colors shrink-0"
                    >
                      <span>{cat.items.length} berita</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cat.items.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => onSelectArticle(art)}
                        className="w-full text-left group flex items-start gap-3.5 p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200/80 dark:border-white/10">
                          <SafeImage
                            src={art.image}
                            alt={art.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 leading-snug line-clamp-2">
                            {art.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {art.date} · {art.category}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Dokumentasi — Galeri Kegiatan */}
      <section className="py-14 lg:py-20 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-700 dark:text-emerald-400">
                Dokumentasi
              </p>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Galeri Kegiatan
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-300 max-w-2xl">
                Koleksi dokumentasi visual resmi Kementerian Agama Kabupaten Murung Raya.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('galeri')}
              className="menu-expand-btn inline-flex items-center gap-2 rounded-full border border-slate-200/90 dark:border-white/20 bg-white/90 dark:bg-zinc-900/70 backdrop-blur-sm px-7 py-3 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white hover:border-emerald-600 hover:bg-emerald-700 hover:text-white whitespace-nowrap shrink-0 shadow-2xs"
            >
              <span className="menu-expand-label">Lihat Semua</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectGallery(item)}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200/85 dark:border-white/15 bg-white dark:bg-zinc-900 text-left shadow-xs hover:shadow-xl hover:border-emerald-500/70 transition-all duration-300"
              >
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-1">
                  <p className="text-[11px] font-semibold text-emerald-300">
                    {item.category} · {item.date}
                  </p>
                  <h3 className="text-sm font-bold leading-snug line-clamp-2">{item.title}</h3>
                  <p className="text-[11px] text-zinc-300">{item.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Infografis — Informasi Utama & Lintas Iman */}
      <section className="py-14 lg:py-20 bg-white/95 dark:bg-slate-950 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              Infografis
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Informasi Utama & Pembinaan Umat
            </h2>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-slate-200/90 dark:border-white/15 bg-slate-50/90 dark:bg-zinc-800/80 backdrop-blur-sm p-1.5">
              {INFOGRAFIS_TABS.map((tab) => {
                const active = tab.id === activeInfografis;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveInfografis(tab.id)}
                    className={`menu-expand-btn px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap ${
                      active
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="menu-expand-label">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/85 dark:border-white/12 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start shadow-xs">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                  Kanal {currentInfografis.label}
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {currentInfografis.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-300 mt-1">
                  {currentInfografis.subtitle}
                </p>
              </div>

              {currentInfografis.quote && (
                <div className="py-4 border-y border-slate-100 dark:border-white/10 space-y-1.5">
                  <p className="font-serif-editorial italic text-base sm:text-lg text-slate-800 dark:text-zinc-100 leading-relaxed">
                    {currentInfografis.quote}
                  </p>
                  {currentInfografis.quoteSource && (
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      — {currentInfografis.quoteSource}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3 text-sm text-slate-700 dark:text-zinc-200 leading-relaxed">
                {currentInfografis.body.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50/90 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/85 dark:border-white/12 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                Informasi Ringkas
              </h4>
              <dl className="divide-y divide-slate-200/80 dark:divide-white/10">
                {currentInfografis.highlights.map((item) => (
                  <div key={item.label} className="py-3 first:pt-0 last:pb-0">
                    <dt className="text-xs text-slate-500 dark:text-zinc-400">{item.label}</dt>
                    <dd className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-mono-tabular">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                onClick={() => onNavigate('layanan')}
                className="menu-expand-btn w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl"
              >
                <span className="menu-expand-label">Akses Layanan Terkait di PTSP</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Kanal Resmi Kemenag Murung Raya — Dokumentasi Video */}
      <section className="py-14 lg:py-20 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400">
              Kanal Resmi Kemenag Murung Raya
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Dokumentasi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-400 dark:to-rose-400">
                Video
              </span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-300">
              Saksikan liputan kegiatan, inovasi layanan, dan sosialisasi Kementerian Agama
              Kabupaten Murung Raya secara langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3 bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/12 shadow-sm flex flex-col justify-between">
              <div className="relative aspect-video w-full overflow-hidden">
                <SafeImage
                  src={activeVideo.thumbnail}
                  alt={activeVideo.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <a
                  href={activeVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label={`Tonton video ${activeVideo.title}`}
                >
                  <span className="w-16 h-16 rounded-full bg-emerald-600 group-hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                    <Play className="w-6 h-6 ml-0.5 fill-current" />
                  </span>
                </a>
              </div>
              <div className="p-6 space-y-2">
                <div className="text-xs text-emerald-300 flex items-center gap-2">
                  <span className="font-bold">Sedang Diputar</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeVideo.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{activeVideo.duration}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {activeVideo.title}
                </h3>
                <p className="text-sm text-zinc-300">{activeVideo.description}</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/85 dark:border-white/12 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Video Lainnya
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono-tabular">
                    {VIDEO_ITEMS.length} Video
                  </span>
                </div>
                <div className="space-y-2.5">
                  {VIDEO_ITEMS.map((vid) => {
                    const selected = vid.id === activeVideo.id;
                    return (
                      <button
                        key={vid.id}
                        type="button"
                        onClick={() => setActiveVideoId(vid.id)}
                        className={`w-full text-left p-2.5 rounded-2xl border flex gap-3 items-center transition-colors ${
                          selected
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500'
                            : 'bg-slate-50/80 dark:bg-zinc-800/70 border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="w-24 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-zinc-800">
                          <SafeImage
                            src={vid.thumbnail}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {vid.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono-tabular">
                            {vid.category} · {vid.duration}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <a
                  href={activeVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <span>Tonton di YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => onNavigate('galeri')}
                  className="text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-white"
                >
                  Semua Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Link Aplikasi Eksternal Terkait */}
      <section className="py-14 lg:py-20 bg-white/95 dark:bg-slate-950 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              Link Aplikasi
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Aplikasi Eksternal Terkait
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              Pilih aplikasi yang dibutuhkan. Setiap tautan akan dibuka di tab baru agar akses
              portal utama Kemenag Murung Raya tetap terbuka.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {EXTERNAL_APPS.map((app) => {
              const badgeColor = APP_ACCENTS[app.id] || 'bg-emerald-700 text-white';
              const shortCode = app.name.slice(0, 2);
              return (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-slate-200/85 dark:border-white/12 hover:border-emerald-500 rounded-3xl p-5 flex flex-col items-center text-center justify-between bg-white/95 dark:bg-slate-900/85 backdrop-blur-md shadow-xs hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg tracking-tight shadow-md ${badgeColor}`}
                    >
                      {shortCode}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                      {app.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Akses Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
