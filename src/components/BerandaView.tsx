import { useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Play,
} from 'lucide-react';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import {
  LEADERSHIP_QUOTES,
  GALLERY_ITEMS,
  INFOGRAFIS_TABS,
  VIDEO_ITEMS,
  EXTERNAL_APPS,
} from '@/src/data/kemenagData';
import {
  PageView,
  ServiceUnit,
  SubService,
  NewsArticle,
  GalleryItem,
  InfografisCategory,
} from '@/src/types';
import { SafeImage } from '@/src/components/SafeImage';
import {
  PtspInteractiveHero,
  type PtspPortalStage,
} from '@/src/components/PtspInteractiveHero';
import {
  WayfindingSignpost,
  type QuickSignpostAction,
} from '@/src/components/WayfindingSignpost';

interface BerandaViewProps {
  lang: 'id' | 'en';
  ptspStage: PtspPortalStage;
  onPtspStageChange: (stage: PtspPortalStage) => void;
  onNavigate: (view: PageView) => void;
  onSelectService: (unit: ServiceUnit) => void;
  onSelectSubService: (unit: ServiceUnit, sub: SubService) => void;
  onOpenServiceSidebar: () => void;
  onSelectArticle: (article: NewsArticle) => void;
  onSelectGallery: (item: GalleryItem) => void;
}

const APP_ACCENTS: Record<string, string> = {
  'app-pusaka': 'bg-emerald-700 text-white',
  'app-emis': 'bg-teal-700 text-white',
  'app-tte': 'bg-slate-900 dark:bg-slate-800 text-white',
  'app-asndigital': 'bg-sky-800 text-white',
  'app-pintar': 'bg-amber-600 text-white',
  'app-simpeg': 'bg-emerald-800 text-white',
  'app-srikandi': 'bg-indigo-800 text-white',
  'app-simkah': 'bg-teal-800 text-white',
  'app-sipdar': 'bg-cyan-700 text-white',
  'app-sitren': 'bg-violet-700 text-white',
  'app-siaga': 'bg-rose-700 text-white',
};

export function BerandaView({
  lang,
  ptspStage,
  onPtspStageChange,
  onNavigate,
  onSelectService,
  onSelectSubService,
  onOpenServiceSidebar,
  onSelectArticle,
  onSelectGallery,
}: BerandaViewProps) {
  const { newsArticles } = useAuthRole();
  const [activeInfografis, setActiveInfografis] = useState<InfografisCategory>('utama');
  const [activeVideoId, setActiveVideoId] = useState<string>(VIDEO_ITEMS[0].id);

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

  const handleSignpostAction = (action: QuickSignpostAction) => {
    if (action === 'katalog-ptsp') {
      onPtspStageChange('katalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'aplikasi-eksternal') {
      document.getElementById('aplikasi-eksternal')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }
    onNavigate(action);
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* SECTION 0: Interactive 3-Stage PTSP Portal (Halaman Depan -> BUKA PINTU -> Ruang PTSP -> Katalog Layanan 6 Bidang) */}
      <PtspInteractiveHero
        lang={lang}
        stage={ptspStage}
        onStageChange={onPtspStageChange}
        onNavigate={onNavigate}
        onSelectService={onSelectService}
        onSelectSubService={onSelectSubService}
        onOpenServiceSidebar={onOpenServiceSidebar}
        onSelectArticle={onSelectArticle}
      />

      {/* SECTION 1: Tombol Melayang Akses Cepat Layanan PTSP (Small-Medium) */}
      {ptspStage !== 'katalog' && (
        <section
          id="katalog-layanan-preview"
          className="scroll-mt-20 py-5 sm:py-6 bg-gradient-to-b from-slate-50/95 via-white to-slate-50/95 dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative z-20"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            <WayfindingSignpost lang={lang} onSelect={handleSignpostAction} />
          </div>
        </section>
      )}

      {/* SECTION 2: Zona Integritas — Apa Kata Mereka */}
      <section className="py-12 lg:py-16 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b-2 border-slate-300 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              Zona Integritas
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Apa Kata Mereka
            </h2>
            <div
              aria-hidden="true"
              className="mt-3 mx-auto h-[3px] w-24 bg-emerald-700 dark:bg-emerald-400"
            />
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
                  className="bg-white dark:bg-slate-900 border-2 border-emerald-700/85 dark:border-emerald-500/75 hover:border-emerald-800 dark:hover:border-emerald-400 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-colors duration-200"
                >
                  <div className="text-center space-y-3">
                    <span
                      aria-hidden="true"
                      className="block text-3xl font-serif-editorial text-emerald-700/80 dark:text-emerald-400/85 leading-none"
                    >
                      “
                    </span>
                    <div className="space-y-3 font-serif-editorial italic text-sm text-slate-700 dark:text-zinc-200 leading-relaxed">
                      {leader.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t-2 border-emerald-700/40 dark:border-emerald-400/40 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-700 dark:bg-emerald-800 text-white font-bold text-base flex items-center justify-center border-2 border-white dark:border-zinc-700 ring-2 ring-emerald-700/40 dark:ring-emerald-400/40">
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
                <div className="p-4 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
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
                  className="border border-slate-200/85 dark:border-white/12 rounded-2xl p-3.5 sm:p-4 flex gap-3 sm:gap-4 items-start bg-white/95 dark:bg-slate-900/90 backdrop-blur-md hover:border-emerald-500/70 shadow-2xs transition-colors"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
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

          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex flex-wrap justify-center items-center gap-1 rounded-2xl sm:rounded-full border border-slate-200/90 dark:border-white/15 bg-slate-50/90 dark:bg-zinc-800/80 backdrop-blur-sm p-1.5 w-full sm:w-auto">
              {INFOGRAFIS_TABS.map((tab) => {
                const active = tab.id === activeInfografis;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveInfografis(tab.id)}
                    className={`menu-expand-btn px-3 sm:px-4 py-2 min-h-[38px] text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl sm:rounded-full whitespace-nowrap ${
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

          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/85 dark:border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start shadow-xs">
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

            <div className="lg:col-span-5 bg-slate-50/90 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/85 dark:border-white/12 rounded-2xl p-4 sm:p-6 space-y-4">
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
              <div className="p-4 sm:p-6 space-y-2">
                <div className="text-xs text-emerald-300 flex flex-wrap items-center gap-x-2 gap-y-1">
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

            <div className="lg:col-span-2 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/85 dark:border-white/12 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
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
      <section
        id="aplikasi-eksternal"
        className="scroll-mt-24 py-12 lg:py-20 bg-white/95 dark:bg-slate-950 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 sm:mb-10 space-y-2">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {EXTERNAL_APPS.map((app) => {
              const badgeColor = APP_ACCENTS[app.id] || 'bg-emerald-700 text-white';
              const shortCode = app.name.slice(0, 2);
              return (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-slate-200/85 dark:border-white/12 hover:border-emerald-500 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center text-center justify-between bg-white/95 dark:bg-slate-900/85 backdrop-blur-md shadow-xs hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col items-center space-y-2.5 sm:space-y-3">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-base sm:text-lg tracking-tight shadow-md ${badgeColor}`}
                    >
                      {shortCode}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                      {app.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-white/10 w-full flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Akses Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
