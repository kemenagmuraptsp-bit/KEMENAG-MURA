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
  NEWS_ARTICLES,
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
import kartuSekretariatImg from '@/src/assets/images/kartu_pastel_sekretariat_1794820500152.jpg';
import kartuBimasIslamImg from '@/src/assets/images/kartu_pastel_bimas_islam_1794820499358.jpg';
import kartuPendisImg from '@/src/assets/images/kartu_pastel_pendis_1794820501547.jpg';
import kartuBimasHinduImg from '@/src/assets/images/kartu_pastel_bimas_hindu_1794820502088.jpg';
import kartuKristenImg from '@/src/assets/images/kartu_pastel_kristen_1794820502325.jpg';
import kartuKepegawaianImg from '@/src/assets/images/kartu_pastel_kepegawaian_1794820502075.jpg';

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

const SERVICE_CARTOONS: Record<string, string> = {
  sekretariat: kartuSekretariatImg,
  'bimas-islam': kartuBimasIslamImg,
  pendis: kartuPendisImg,
  'bimas-hindu': kartuBimasHinduImg,
  'bimas-kristen': kartuKristenImg,
  kepegawaian: kartuKepegawaianImg,
};

const SERVICE_PASTEL_THEMES: Record<
  string,
  { card: string; iconBg: string; imgBg: string; cta: string }
> = {
  sekretariat: {
    card: 'bg-[#d1fae5] dark:bg-emerald-950/75',
    iconBg: 'bg-emerald-700 text-white',
    imgBg: 'bg-[#d1fae5]',
    cta: 'text-emerald-900 dark:text-emerald-300',
  },
  'bimas-islam': {
    card: 'bg-[#dcfce7] dark:bg-teal-950/75',
    iconBg: 'bg-teal-700 text-white',
    imgBg: 'bg-[#dcfce7]',
    cta: 'text-teal-900 dark:text-teal-300',
  },
  pendis: {
    card: 'bg-[#e0f2fe] dark:bg-sky-950/75',
    iconBg: 'bg-sky-700 text-white',
    imgBg: 'bg-[#e0f2fe]',
    cta: 'text-sky-900 dark:text-sky-300',
  },
  'bimas-hindu': {
    card: 'bg-[#ffedd5] dark:bg-orange-950/70',
    iconBg: 'bg-orange-600 text-white',
    imgBg: 'bg-[#ffedd5]',
    cta: 'text-orange-900 dark:text-orange-300',
  },
  'bimas-kristen': {
    card: 'bg-[#ede9fe] dark:bg-violet-950/70',
    iconBg: 'bg-violet-700 text-white',
    imgBg: 'bg-[#ede9fe]',
    cta: 'text-violet-900 dark:text-violet-300',
  },
  kepegawaian: {
    card: 'bg-[#e0e7ff] dark:bg-indigo-950/75',
    iconBg: 'bg-indigo-700 text-white',
    imgBg: 'bg-[#e0e7ff]',
    cta: 'text-indigo-900 dark:text-indigo-300',
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
  const { isVerifiedEmployee } = useAuthRole();
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

  const leadArticle = NEWS_ARTICLES[0];
  const secondaryToday = NEWS_ARTICLES.slice(1, 3);
  const nasionalArticles = NEWS_ARTICLES.filter(
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
    items: NEWS_ARTICLES.filter((a) => a.category === catName),
  }));

  const currentInfografis =
    INFOGRAFIS_TABS.find((t) => t.id === activeInfografis) || INFOGRAFIS_TABS[0];

  const activeVideo =
    VIDEO_ITEMS.find((v) => v.id === activeVideoId) || VIDEO_ITEMS[0];

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* SECTION 0: Full-Screen Hero Matching baritoutara.kemenag.go.id Screenshot */}
      <section className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex flex-col justify-between pt-32 sm:pt-40 pb-8">
        {/* Background Office Photo & Layered Dark Scrims */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <SafeImage
            src={OFFICE_INFO.heroImage}
            alt="Gedung Kantor Kementerian Agama Kabupaten Murung Raya di Puruk Cahu"
            className="w-full h-full object-cover object-center opacity-50"
          />
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/40 to-slate-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.82)_100%)]" />
        </div>

        {/* Center Hero Typography */}
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16 my-auto">
          <div className="mx-auto max-w-5xl text-center flex flex-col items-center">
            <p className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.2em] text-emerald-300 drop-shadow-md">
              {lang === 'en'
                ? 'Ministry of Religious Affairs of the Republic of Indonesia'
                : 'Kementerian Agama Republik Indonesia'}
              <span className="block text-slate-100 mt-1">
                {lang === 'en' ? 'Murung Raya Regency' : 'Kabupaten Murung Raya'}
              </span>
            </p>

            <h1 className="mt-5 sm:mt-7 w-full text-center min-h-[2.7em] text-[clamp(1.75rem,4.4vw,3.75rem)] font-black tracking-tight leading-[1.2] drop-shadow-2xl">
              <span className="block bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                {typedLine1 || '\u00A0'}
                {!onSecondLine && (
                  <span
                    aria-hidden="true"
                    className="inline-block w-[3px] h-[0.9em] bg-emerald-300 align-middle ml-1 animate-cursor-blink"
                  />
                )}
              </span>
              <span className="block bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent mt-1">
                {typedLine2 || '\u00A0'}
                {onSecondLine && (
                  <span
                    aria-hidden="true"
                    className="inline-block w-[3px] h-[0.9em] bg-emerald-300 align-middle ml-1 animate-cursor-blink"
                  />
                )}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-slate-200/90 leading-relaxed font-normal">
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
            className="group flex flex-col items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.25em] text-yellow-300 hover:text-yellow-200 transition-colors"
          >
            <span>{lang === 'en' ? 'Scroll Down' : 'Gulir ke bawah'}</span>
            <ArrowDown
              strokeWidth={2.75}
              className="w-4 h-4 text-yellow-300 animate-arrow-down-pulse"
              aria-hidden="true"
            />
            <span className="w-6 h-9 rounded-full border-2 border-yellow-400 group-hover:border-yellow-200 bg-slate-950/50 flex items-start justify-center p-1.5 shadow-[0_0_16px_rgba(250,204,21,0.45)] transition-colors">
              <span className="w-1.5 h-2 rounded-full bg-yellow-300 group-hover:bg-yellow-200 animate-scroll-wheel" />
            </span>
          </a>
        </div>
      </section>

      {/* SECTION 1: Katalog Layanan PTSP */}
      <section
        id="katalog-ptsp"
        className="py-12 lg:py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-14">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              {lang === 'en' ? 'Public Services' : 'Layanan Masyarakat'}
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Katalog Layanan PTSP Terpadu
            </h2>
            <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-amber-500">S</span>istem{' '}
              <span className="text-amber-500">I</span>nformasi{' '}
              <span className="text-amber-500">A</span>dministrasi{' '}
              <span className="text-amber-500">T</span>erpadu{' '}
              <span className="text-amber-500">L</span>ayanan{' '}
              <span className="text-amber-500">K</span>eagamaan Kabupaten Murung Raya
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {SERVICE_UNITS.map((unit) => {
              const Icon = SERVICE_ICONS[unit.id] || Building2;
              const cartoonSrc = SERVICE_CARTOONS[unit.id];
              const theme = SERVICE_PASTEL_THEMES[unit.id] || SERVICE_PASTEL_THEMES.sekretariat;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => onSelectService(unit)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-slate-900 dark:border-slate-700 ${theme.card} p-4 sm:p-5 text-left min-h-[350px] shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#020617] hover:shadow-[6px_6px_0px_#0f172a] hover:-translate-y-1 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-emerald-700`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-900/20 ${theme.iconBg}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono-tabular text-slate-800 dark:text-slate-200 font-bold truncate">
                      Bidang {unit.code} · {unit.subServices.length} layanan
                    </span>
                  </div>

                  {/* Pilihan 3: Pastel Comic-Editorial Cartoon Illustration */}
                  {cartoonSrc && (
                    <div
                      className={`my-3 mx-auto w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-slate-900/80 dark:border-slate-600 ${theme.imgBg} shrink-0`}
                    >
                      <img
                        src={cartoonSrc}
                        alt={`Ilustrasi kartun editorial layanan ${unit.title}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 w-full">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight uppercase flex items-center gap-1.5">
                      <span>{unit.title}</span>
                      {unit.id === 'kepegawaian' && !isVerifiedEmployee && (
                        <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug font-medium">
                      {unit.shortDesc}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold pt-0.5 ${theme.cta}`}>
                      <span>
                        {unit.id === 'kepegawaian' && !isVerifiedEmployee
                          ? 'Login Pegawai'
                          : 'Lihat Sub-Layanan'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenServiceSidebar}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>
                Buka Menu Sidebar Layanan (
                {SERVICE_UNITS.reduce((sum, u) => sum + u.subServices.length, 0)} Sub-Menu)
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('layanan')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 hover:underline"
            >
              <span>Halaman Layanan & Lacak Tiket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Zona Integritas — Apa Kata Mereka */}
      <section className="py-12 lg:py-16 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              Zona Integritas
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Apa Kata Mereka
            </h2>
            <p className="mt-3 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
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
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm"
                >
                  <div className="text-center space-y-3">
                    <span
                      aria-hidden="true"
                      className="block text-3xl font-serif-editorial text-emerald-600/40 leading-none"
                    >
                      “
                    </span>
                    <div className="space-y-3 font-serif-editorial italic text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {leader.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-900 text-white font-bold text-base flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md ring-2 ring-emerald-500/20">
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
      <section className="py-14 lg:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400">
                Berita
              </p>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white max-w-2xl">
                Ikuti pembaruan kegiatan dan informasi terkini
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Berita resmi dari Kementerian Agama Kabupaten Murung Raya untuk masyarakat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('berita')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-7 py-3 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white hover:border-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="aspect-[16/10] w-full overflow-hidden">
                <SafeImage
                  src={leadArticle.image}
                  alt={leadArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
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
                    className="text-left hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                  >
                    {leadArticle.title}
                  </button>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {leadArticle.excerpt}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectArticle(leadArticle)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline underline-offset-4"
                  >
                    <span>Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-5">
              {secondaryToday.map((item) => (
                <article
                  key={item.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-start bg-white dark:bg-slate-900 hover:border-emerald-600 transition-colors"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
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
                        className="text-left hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                      >
                        {item.title}
                      </button>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                </article>
              ))}

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Berita Nasional & Terpopuler
                  </h3>
                  <span className="text-xs font-mono-tabular text-emerald-700 dark:text-emerald-400 font-semibold">
                    Populer
                  </span>
                </div>
                <ul className="divide-y divide-slate-200/70 dark:divide-slate-800">
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
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 leading-snug">
                            {pop.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
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
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shrink-0"
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
                        className="w-full text-left group flex items-start gap-3.5 p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                          <SafeImage
                            src={art.image}
                            alt={art.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 leading-snug line-clamp-2">
                            {art.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
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
      <section className="py-14 lg:py-20 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-700 dark:text-emerald-400">
                Dokumentasi
              </p>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Galeri Kegiatan
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Koleksi dokumentasi visual resmi Kementerian Agama Kabupaten Murung Raya.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('galeri')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-7 py-3 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white hover:border-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectGallery(item)}
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-left shadow-sm hover:shadow-xl transition-all duration-300"
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
                  <p className="text-[11px] text-slate-300">{item.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Infografis — Informasi Utama & Lintas Iman */}
      <section className="py-14 lg:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
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
            <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1.5">
              {INFOGRAFIS_TABS.map((tab) => {
                const active = tab.id === activeInfografis;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveInfografis(tab.id)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                  Kanal {currentInfografis.label}
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {currentInfografis.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {currentInfografis.subtitle}
                </p>
              </div>

              {currentInfografis.quote && (
                <div className="py-4 border-y border-slate-200 dark:border-slate-800 space-y-1.5">
                  <p className="font-serif-editorial italic text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
                    {currentInfografis.quote}
                  </p>
                  {currentInfografis.quoteSource && (
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                      — {currentInfografis.quoteSource}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentInfografis.body.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Informasi Ringkas
              </h4>
              <dl className="divide-y divide-slate-200 dark:divide-slate-800">
                {currentInfografis.highlights.map((item) => (
                  <div key={item.label} className="py-3 first:pt-0 last:pb-0">
                    <dt className="text-xs text-slate-500 dark:text-slate-400">{item.label}</dt>
                    <dd className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-mono-tabular">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                onClick={() => onNavigate('layanan')}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
              >
                Akses Layanan Terkait di PTSP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Kanal Resmi Kemenag Murung Raya — Dokumentasi Video */}
      <section className="py-14 lg:py-20 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-700 dark:text-rose-400">
              Kanal Resmi Kemenag Murung Raya
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Dokumentasi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                Video
              </span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Saksikan liputan kegiatan, inovasi layanan, dan sosialisasi Kementerian Agama
              Kabupaten Murung Raya secara langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-3 bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
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
                <p className="text-sm text-slate-300">{activeVideo.description}</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Video Lainnya
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
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
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/60 border-emerald-600'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-24 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-200">
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
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
                            {vid.category} · {vid.duration}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={activeVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
                >
                  <span>Tonton di YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => onNavigate('galeri')}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Semua Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Link Aplikasi Eksternal Terkait */}
      <section className="py-14 lg:py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              Link Aplikasi
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Aplikasi Eksternal Terkait
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
                  className="group border border-slate-200 dark:border-slate-800 hover:border-emerald-600 rounded-3xl p-5 flex flex-col items-center text-center justify-between bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg tracking-tight shadow-md ${badgeColor}`}
                    >
                      {shortCode}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                      {app.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
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
