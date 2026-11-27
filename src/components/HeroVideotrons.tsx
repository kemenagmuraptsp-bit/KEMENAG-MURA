import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Newspaper,
  Sparkles,
  X,
} from 'lucide-react';
import {
  CALENDAR_HOLIDAY_GREETINGS,
  LEADERSHIP_PROFILES,
  formatIndonesianCalendarDate,
  getActiveHolidayGreeting,
  type CalendarHolidayGreeting,
} from '@/src/data/holidayGreetings';
import { NewsArticle } from '@/src/types';
import { SafeImage } from '@/src/components/SafeImage';

const KEMENAG_LOGO_SRC = '/assets/aistudio/Kementerian_Agama_new_logo_f9b3eec1.png';
const KEPALA_KANTOR_PHOTO_SRC = '/assets/aistudio/KEPALA_KEMENAG-removebg-preview_88578eaf.png';
const KASUBBAG_TU_PHOTO_SRC = '/assets/aistudio/KASUBBAG_TU-removebg-preview_57efd332.png';

/**
 * Proportional wall-mounted videotron dimensions mounted cleanly on the left and right wings
 * of facade_dayak_final_1795770200000.jpg (1376x768) below the mid-wing Dayak trim.
 * - Left wing bay: left 8.0% -> 26.6% (width 18.6%, height 22.8%)
 * - Right wing bay: left 73.4% -> 92.0% (width 18.6%, height 22.8% — exact mirror match)
 * - Vertical span: top 52.8% -> bottom 75.6%, with the central steel pole descending behind garden shrubs.
 */
export const VIDEOTRON_RECTS_PCT = {
  left: {
    left: 8.0,
    top: 52.8,
    width: 18.6,
    height: 22.8,
  },
  right: {
    left: 73.4,
    top: 52.8,
    width: 18.6,
    height: 22.8,
  },
} as const;

/**
 * Realistic architectural wall-mounted hardware:
 * - Slim anodized aluminum rain hood along the top edge
 * - Four steel wall-anchor cleats gripping the facade wall
 * - 1 sturdy central steel support pillar hugging the lower building wall behind the front garden
 */
function VideotronWallHardware() {
  return (
    <>
      {/* Top Weatherproof Aluminum Rain-Hood Visor */}
      <div
        aria-hidden="true"
        className="videotron-rain-hood pointer-events-none absolute -top-[3px] -left-[1.5px] -right-[1.5px] h-[4px] rounded-t-[3px] z-20"
      />

      {/* Four Subtle Steel Wall-Anchor Brackets Gripping the Office Wall */}
      <span
        aria-hidden="true"
        className="videotron-wall-bracket pointer-events-none absolute top-[14%] -left-[3.5px] w-[4px] h-[11%] rounded-l-[1.5px] -z-10"
      />
      <span
        aria-hidden="true"
        className="videotron-wall-bracket pointer-events-none absolute bottom-[14%] -left-[3.5px] w-[4px] h-[11%] rounded-l-[1.5px] -z-10"
      />
      <span
        aria-hidden="true"
        className="videotron-wall-bracket pointer-events-none absolute top-[14%] -right-[3.5px] w-[4px] h-[11%] rounded-r-[1.5px] -z-10"
      />
      <span
        aria-hidden="true"
        className="videotron-wall-bracket pointer-events-none absolute bottom-[14%] -right-[3.5px] w-[4px] h-[11%] rounded-r-[1.5px] -z-10"
      />

      {/* Soft Realistic Wall Contact Ambient Occlusion Behind Cabinet */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[2px] translate-x-[3px] translate-y-[4px] rounded-[5px] bg-black/35 blur-[3px] -z-20"
      />

      {/* 1 Central Vertical Steel Support Pillar Extending Behind Garden Bushes Against Office Wall */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[99%] flex flex-col items-center -z-10"
        style={{ height: '54%', width: '22%' }}
      >
        {/* Welded Top Saddle Bracket Under Cabinet */}
        <div className="videotron-pole-collar relative w-[52%] h-[11%] min-h-[4px] rounded-b-[2px] border-x border-b border-slate-500/40 flex items-center justify-between px-[12%]">
          <span className="w-[2px] h-[2px] rounded-full bg-slate-300/75" />
          <span className="w-[2px] h-[2px] rounded-full bg-slate-300/75" />
        </div>

        {/* Wall-Hugging Cylindrical Steel Support Shaft Extending Behind Garden Foliage */}
        <div className="videotron-support-pole relative flex-1 w-[24%] min-w-[7px] max-w-[12px] border-x border-slate-900/70" />
      </div>
    </>
  );
}

interface LeftHolidayVideotronProps {
  doorsOpened: boolean;
  coverWidth: number;
  activeHoliday: CalendarHolidayGreeting;
  onOpenModal: () => void;
}

export function LeftHolidayVideotron({
  doorsOpened,
  coverWidth,
  activeHoliday,
  onOpenModal,
}: LeftHolidayVideotronProps) {
  const scale = Math.max(0.68, Math.min(1.22, (coverWidth || 1440) / 1440));
  const titleSize = Math.round(10.2 * scale * 10) / 10;
  const subSize = Math.round(6.8 * scale * 10) / 10;
  const nameSize = Math.round(6.6 * scale * 10) / 10;
  const roleSize = Math.round(5.9 * scale * 10) / 10;

  return (
    <div
      style={{
        left: `${VIDEOTRON_RECTS_PCT.left.left}%`,
        top: `${VIDEOTRON_RECTS_PCT.left.top}%`,
        width: `${VIDEOTRON_RECTS_PCT.left.width}%`,
        height: `${VIDEOTRON_RECTS_PCT.left.height}%`,
      }}
      className={`absolute z-[18] transition-all duration-500 ${
        doorsOpened ? 'opacity-30 pointer-events-none' : 'opacity-100'
      }`}
    >
      <VideotronWallHardware />

      <button
        type="button"
        onClick={onOpenModal}
        aria-label={`Videotron Ucapan ${activeHoliday.headline} — Klik untuk memperbesar`}
        title={`Klik untuk melihat tampilan penuh ucapan ${activeHoliday.headline}`}
        className="videotron-cabinet group relative z-10 w-full h-full flex flex-col overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        {/* Crisp Unobstructed HD Screen Surface */}
        <div
          className={`relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden rounded-[4px] bg-gradient-to-br ${activeHoliday.bgGradient}`}
        >
          {/* Top Bar: Kemenag Logo + Calendar Holiday Badge */}
          <div className="relative z-10 flex items-center justify-between gap-1.5 px-2 py-1 bg-[#031b15] border-b border-amber-300/40 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={KEMENAG_LOGO_SRC}
                alt="Logo Kemenag"
                referrerPolicy="no-referrer"
                className="w-3.5 h-3.5 object-contain shrink-0"
              />
              <span
                style={{ fontSize: `${subSize}px` }}
                className="font-black uppercase tracking-wider text-amber-300 truncate leading-none"
              >
                {activeHoliday.badge}
              </span>
            </div>
            <span
              style={{ fontSize: `${roleSize}px` }}
              className="font-mono-tabular font-bold text-white bg-emerald-800 border border-emerald-400/50 px-1.5 py-[1.5px] rounded-[3px] shrink-0 leading-none"
            >
              {activeHoliday.dateLabel}
            </span>
          </div>

          {/* Crisp Greeting Headline */}
          <div className="relative z-10 px-2 pt-1 pb-0.5 text-center shrink-0">
            <p
              style={{ fontSize: `${titleSize}px` }}
              className="font-black uppercase leading-[1.08] tracking-tight text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] line-clamp-1"
            >
              {activeHoliday.headline}
            </p>
            <p
              style={{ fontSize: `${roleSize}px` }}
              className="mt-[1px] text-white font-semibold leading-tight line-clamp-1"
            >
              {activeHoliday.theme}
            </p>
          </div>

          {/* Dual Crystal-Clear Official Cutout Portraits: Kepala Kantor & Kasubbag TU */}
          <div className="relative z-10 flex-1 min-h-0 grid grid-cols-2 gap-1.5 px-2 pt-1 pb-1.5">
            {/* Kepala Kantor: H. Maslan, S.Ag., M.Pd. */}
            <div className="flex flex-col h-full min-h-0 overflow-hidden rounded-[4px] bg-gradient-to-b from-emerald-900/55 via-emerald-950/65 to-[#04241c]">
              <div className="relative flex-1 min-h-0 w-full overflow-hidden flex items-end justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,0.24),transparent_72%)] pt-0.5">
                <img
                  src={KEPALA_KANTOR_PHOTO_SRC}
                  alt={`${LEADERSHIP_PROFILES.kepalaKantor.name} — ${LEADERSHIP_PROFILES.kepalaKantor.role}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain object-bottom drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)] group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <div className="shrink-0 bg-[#04241c] px-1 py-[3px] text-center">
                <p
                  style={{ fontSize: `${nameSize}px` }}
                  className="font-extrabold text-amber-200 leading-tight truncate"
                >
                  {LEADERSHIP_PROFILES.kepalaKantor.shortName}
                </p>
                <p
                  style={{ fontSize: `${roleSize}px` }}
                  className="text-white font-semibold leading-tight truncate"
                >
                  {LEADERSHIP_PROFILES.kepalaKantor.role}
                </p>
              </div>
            </div>

            {/* Kasubbag TU: Hj. Nina Narly, S.Ag., M.H */}
            <div className="flex flex-col h-full min-h-0 overflow-hidden rounded-[4px] bg-gradient-to-b from-emerald-900/55 via-emerald-950/65 to-[#04241c]">
              <div className="relative flex-1 min-h-0 w-full overflow-hidden flex items-end justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(52,211,153,0.22),transparent_72%)] pt-0.5">
                <img
                  src={KASUBBAG_TU_PHOTO_SRC}
                  alt={`${LEADERSHIP_PROFILES.kasubbagTu.name} — ${LEADERSHIP_PROFILES.kasubbagTu.role}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain object-bottom drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)] group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <div className="shrink-0 bg-[#04241c] px-1 py-[3px] text-center">
                <p
                  style={{ fontSize: `${nameSize}px` }}
                  className="font-extrabold text-emerald-200 leading-tight truncate"
                >
                  {LEADERSHIP_PROFILES.kasubbagTu.shortName}
                </p>
                <p
                  style={{ fontSize: `${roleSize}px` }}
                  className="text-white font-semibold leading-tight truncate"
                >
                  {LEADERSHIP_PROFILES.kasubbagTu.role}
                </p>
              </div>
            </div>
          </div>

          {/* Hover Zoom Cue */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1.5 right-1.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-amber-300 rounded p-1 shadow"
          >
            <Maximize2 className="w-3 h-3" />
          </span>
        </div>
      </button>
    </div>
  );
}

interface RightNewsVideotronProps {
  doorsOpened: boolean;
  coverWidth: number;
  articles: NewsArticle[];
  onSelectArticle?: (article: NewsArticle) => void;
  onNavigateNews?: () => void;
}

export function RightNewsVideotron({
  doorsOpened,
  coverWidth,
  articles,
  onSelectArticle,
  onNavigateNews,
}: RightNewsVideotronProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const totalArticles = articles.length;
  const safeIndex = totalArticles > 0 ? activeIndex % totalArticles : 0;
  const currentArticle = totalArticles > 0 ? articles[safeIndex] : null;

  // Auto-scroll through ALL news articles on the Kemenag website (1..N)
  useEffect(() => {
    if (totalArticles <= 1 || isPaused || doorsOpened) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalArticles);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [totalArticles, isPaused, doorsOpened]);

  const scale = Math.max(0.68, Math.min(1.22, (coverWidth || 1440) / 1440));
  const headlineSize = Math.round(9.2 * scale * 10) / 10;
  const excerptSize = Math.round(6.7 * scale * 10) / 10;
  const microSize = Math.round(6.5 * scale * 10) / 10;

  const handleOpenCurrent = () => {
    if (currentArticle && onSelectArticle) {
      onSelectArticle(currentArticle);
    } else if (onNavigateNews) {
      onNavigateNews();
    }
  };

  return (
    <div
      style={{
        left: `${VIDEOTRON_RECTS_PCT.right.left}%`,
        top: `${VIDEOTRON_RECTS_PCT.right.top}%`,
        width: `${VIDEOTRON_RECTS_PCT.right.width}%`,
        height: `${VIDEOTRON_RECTS_PCT.right.height}%`,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`absolute z-[18] transition-all duration-500 ${
        doorsOpened ? 'opacity-30 pointer-events-none' : 'opacity-100'
      }`}
    >
      <VideotronWallHardware />

      <div className="videotron-cabinet group relative z-10 w-full h-full flex flex-col overflow-hidden">
        {/* Crisp Unobstructed HD Screen Surface */}
        <div className="relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden rounded-[4px] bg-[#041a17]">
          {/* Top Header Bar */}
          <div className="relative z-10 flex items-center justify-between gap-1.5 px-2 py-1 bg-[#03211b] border-b border-emerald-400/40 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_6px_#34d399]" />
              <span
                style={{ fontSize: `${microSize}px` }}
                className="font-black uppercase tracking-wider text-emerald-200 truncate leading-none"
              >
                BERITA KEMENAG
              </span>
            </div>
            <span
              style={{ fontSize: `${microSize}px` }}
              className="font-mono-tabular font-bold text-amber-200 bg-black/65 border border-amber-400/45 px-1.5 py-[1.5px] rounded-[3px] shrink-0 leading-none"
            >
              {totalArticles > 0 ? `${safeIndex + 1}/${totalArticles}` : '0/0'}
            </span>
          </div>

          {/* Main Auto-Scrolling News Slide Body: Crystal-Clear Split Photo + Crisp Text Card */}
          <button
            type="button"
            onClick={handleOpenCurrent}
            aria-label={
              currentArticle
                ? `Baca berita ${safeIndex + 1} dari ${totalArticles}: ${currentArticle.title}`
                : 'Buka halaman berita Kementerian Agama'
            }
            title={
              currentArticle
                ? `Klik untuk membaca: ${currentArticle.title}`
                : 'Klik untuk membuka Berita Kemenag'
            }
            className="relative z-10 flex-1 min-h-0 w-full overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-300"
          >
            {currentArticle ? (
              <div
                key={currentArticle.id}
                className="videotron-news-slide relative w-full h-full flex flex-col"
              >
                {/* Crystal-Clear Unobstructed News Photo (No Muddy Dark Scrim Over Photo) */}
                <div className="relative flex-[1.25] min-h-0 w-full overflow-hidden bg-slate-900">
                  <SafeImage
                    src={currentArticle.image}
                    alt={currentArticle.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Crisp Category & Date Pills in Corners */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
                    <span
                      style={{ fontSize: `${Math.max(6.2, microSize * 0.9)}px` }}
                      className="font-extrabold uppercase tracking-wide bg-emerald-700/95 text-white px-1.5 py-[2px] rounded-[3px] truncate max-w-[60%] shadow-md border border-emerald-300/35"
                    >
                      {currentArticle.category}
                    </span>
                    <span
                      style={{ fontSize: `${Math.max(6, microSize * 0.88)}px` }}
                      className="font-mono-tabular font-bold bg-slate-950/85 text-amber-200 px-1.5 py-[2px] rounded-[3px] shadow-md truncate"
                    >
                      {currentArticle.date}
                    </span>
                  </div>
                </div>

                {/* High-Contrast Crisp Solid Editorial Text Panel */}
                <div className="shrink-0 bg-[#04241e] border-t border-emerald-400/35 px-2 py-1.5 space-y-0.5">
                  <h3
                    style={{ fontSize: `${headlineSize}px` }}
                    className="font-black text-white leading-[1.16] line-clamp-2 group-hover:text-amber-200 transition-colors"
                  >
                    {currentArticle.title}
                  </h3>
                  <p
                    style={{ fontSize: `${excerptSize}px` }}
                    className="text-emerald-100/95 leading-snug line-clamp-1 font-medium"
                  >
                    {currentArticle.excerpt}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-emerald-200">
                <Newspaper className="w-5 h-5 mb-1 opacity-80" />
                <span style={{ fontSize: `${microSize}px` }} className="font-bold">
                  Berita Kemenag Murung Raya
                </span>
              </div>
            )}

            {/* Animated Progress Indicator Bar for Current Slide */}
            {totalArticles > 1 && !isPaused && !doorsOpened && (
              <div
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-[2.5px] bg-white/15 overflow-hidden z-20"
              >
                <div
                  key={`progress-${safeIndex}`}
                  className="videotron-slide-progress h-full bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300"
                />
              </div>
            )}
          </button>

          {/* Subtle Hover Prev/Next Navigation Controls */}
          {totalArticles > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev - 1 + totalArticles) % totalArticles);
                }}
                aria-label="Berita sebelumnya"
                className="absolute left-1 top-[42%] -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-6 rounded bg-black/80 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer shadow"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev + 1) % totalArticles);
                }}
                aria-label="Berita selanjutnya"
                className="absolute right-1 top-[42%] -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-6 rounded bg-black/80 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer shadow"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface HolidayPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHoliday: CalendarHolidayGreeting;
  onSelectHoliday: (holiday: CalendarHolidayGreeting) => void;
}

export function HolidayPosterModal({
  isOpen,
  onClose,
  selectedHoliday,
  onSelectHoliday,
}: HolidayPosterModalProps) {
  const todayAuto = useMemo(() => getActiveHolidayGreeting(), []);
  const todayFormatted = useMemo(() => formatIndonesianCalendarDate(), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAutoMatch = selectedHoliday.id === todayAuto.id;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ucapan ${selectedHoliday.headline}`}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden border border-amber-300/45 bg-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.75)] my-auto"
      >
        {/* Main Official Greeting Poster (Crystal-Clear) */}
        <div
          className={`relative bg-gradient-to-br ${selectedHoliday.bgGradient} p-5 sm:p-8 text-white overflow-hidden`}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup tampilan videotron ucapan"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Bar */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 pr-10">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-amber-300/45 p-1.5 flex items-center justify-center shrink-0">
              <img
                src={KEMENAG_LOGO_SRC}
                alt="Logo Kementerian Agama RI"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-300">
                Kantor Kementerian Agama Kabupaten Murung Raya
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-emerald-50">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>{selectedHoliday.dateLabel}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-emerald-100">
                  {isAutoMatch
                    ? `Otomatis menyesuaikan kalender (${todayFormatted})`
                    : `Pratinjau Kalender · Hari ini ${todayFormatted}`}
                </span>
              </div>
            </div>
          </div>

          {/* Center Greeting Banner */}
          <div className="relative z-10 mt-5 text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-[11px] font-black uppercase tracking-[0.2em] text-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedHoliday.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow">
              {selectedHoliday.headline}
            </h2>
            <p className="text-sm sm:text-base font-bold text-amber-300">
              “{selectedHoliday.theme}”
            </p>
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-white/95 leading-relaxed">
              {selectedHoliday.message}
            </p>
          </div>

          {/* Official Leadership Cutout Portraits: Kepala Kantor & Kasubbag TU */}
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto">
            {/* Kepala Kantor */}
            <div className="rounded-2xl overflow-hidden border-2 border-amber-300/75 bg-gradient-to-b from-emerald-900/60 via-emerald-950/75 to-[#04241c] shadow-xl flex flex-col">
              <div className="aspect-[3/3.6] w-full overflow-hidden flex items-end justify-center pt-3 px-2 bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,0.26),transparent_72%)]">
                <img
                  src={KEPALA_KANTOR_PHOTO_SRC}
                  alt={LEADERSHIP_PROFILES.kepalaKantor.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain object-bottom drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]"
                />
              </div>
              <div className="p-2.5 sm:p-3 text-center bg-[#04241c] border-t border-amber-300/45">
                <p className="text-xs sm:text-sm font-black text-amber-200 leading-tight">
                  {LEADERSHIP_PROFILES.kepalaKantor.name}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-white">
                  {LEADERSHIP_PROFILES.kepalaKantor.fullRole}
                </p>
              </div>
            </div>

            {/* Kasubbag TU */}
            <div className="rounded-2xl overflow-hidden border-2 border-emerald-300/75 bg-gradient-to-b from-emerald-900/60 via-emerald-950/75 to-[#04241c] shadow-xl flex flex-col">
              <div className="aspect-[3/3.6] w-full overflow-hidden flex items-end justify-center pt-3 px-2 bg-[radial-gradient(circle_at_50%_40%,rgba(52,211,153,0.24),transparent_72%)]">
                <img
                  src={KASUBBAG_TU_PHOTO_SRC}
                  alt={LEADERSHIP_PROFILES.kasubbagTu.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain object-bottom drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]"
                />
              </div>
              <div className="p-2.5 sm:p-3 text-center bg-[#04241c] border-t border-emerald-300/45">
                <p className="text-xs sm:text-sm font-black text-emerald-200 leading-tight">
                  {LEADERSHIP_PROFILES.kasubbagTu.name}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-white">
                  {LEADERSHIP_PROFILES.kasubbagTu.fullRole}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Calendar Holiday Preview Bar */}
        <div className="bg-slate-900 border-t border-white/10 p-4 sm:px-6 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              Kalender Hari Besar Nasional & Kemenag (Otomatis Sesuai Tanggal)
            </p>
            {!isAutoMatch && (
              <button
                type="button"
                onClick={() => onSelectHoliday(todayAuto)}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline underline-offset-2 cursor-pointer"
              >
                Kembali ke Ucapan Hari Ini ({todayAuto.shortTitle})
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CALENDAR_HOLIDAY_GREETINGS.map((item) => {
              const active = item.id === selectedHoliday.id;
              const isToday = item.id === todayAuto.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectHoliday(item)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                    active
                      ? 'bg-emerald-600 border-amber-300 text-white shadow'
                      : 'bg-slate-800/90 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{item.shortTitle}</span>
                  {isToday && (
                    <span className="ml-1.5 text-[10px] text-amber-300 font-extrabold">
                      • Aktif
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
