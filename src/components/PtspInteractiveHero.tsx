import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Church,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Hexagon,
  IdCard,
  Lock,
  MessageSquareWarning,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  TicketCheck,
  Users,
} from 'lucide-react';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import { EXTERNAL_APPS, OFFICE_INFO, SERVICE_UNITS } from '@/src/data/kemenagData';
import { NewsArticle, PageView, ServiceUnit, SubService } from '@/src/types';
import {
  HERO_FACADE_HEIGHT,
  HERO_FACADE_WIDTH,
  HeroOfficeBackground,
} from '@/src/components/HeroOfficeBackground';
import {
  HolidayPosterModal,
  LeftHolidayVideotron,
  RightNewsVideotron,
} from '@/src/components/HeroVideotrons';
import {
  getActiveHolidayGreeting,
  type CalendarHolidayGreeting,
} from '@/src/data/holidayGreetings';
import { SafeImage } from '@/src/components/SafeImage';
import kartuSekretariatImg from '@/src/assets/images/katalog_full_sekretariat_1795232127240.jpg';
import kartuBimasIslamImg from '@/src/assets/images/katalog_full_bimas_islam_1795232127252.jpg';
import kartuPendisImg from '@/src/assets/images/katalog_full_pendis_1795232126912.jpg';
import kartuBimasHinduImg from '@/src/assets/images/katalog_full_bimas_hindu_1795232127988.jpg';
import kartuKristenImg from '@/src/assets/images/katalog_full_bimas_kristen_1795232127426.jpg';
import kartuKepegawaianImg from '@/src/assets/images/katalog_full_kepegawaian_1795232127634.jpg';
import heroKantorZoomImg from '@/src/assets/images/facade_no_right_flag_1795513652053.jpg';

const KEMENAG_LOGO_SRC = '/assets/aistudio/Kementerian_Agama_new_logo_f9b3eec1.png';
const PTSP_KATALOG_BG_SRC =
  '/assets/aistudio/Ganti_wajah_petugas_dengan_gambar_6b132579_2K_526b0e23.jpg';

// Exact measured inner double-door opening in hero_kantor_zoom_facade_1795495476715.jpg (1376x768)
const DOOR_RECT_PCT = {
  left: (658 / HERO_FACADE_WIDTH) * 100, // 47.82%
  top: (454 / HERO_FACADE_HEIGHT) * 100, // 59.11%
  width: (96 / HERO_FACADE_WIDTH) * 100, // 6.98%
  height: (103 / HERO_FACADE_HEIGHT) * 100, // 13.41%
  centerX: (706 / HERO_FACADE_WIDTH) * 100, // 51.31%
  centerY: (505.5 / HERO_FACADE_HEIGHT) * 100, // 65.82%
};

// Exact measured outer dark architectural door casing (border luar pintu) in 1376x768
const DOOR_OUTER_RECT_PCT = {
  left: (638 / HERO_FACADE_WIDTH) * 100, // 46.37%
  top: (438 / HERO_FACADE_HEIGHT) * 100, // 57.03%
  width: (136 / HERO_FACADE_WIDTH) * 100, // 9.88%
  height: (119 / HERO_FACADE_HEIGHT) * 100, // 15.49%
};

// Exact measured span between the two dark marble front terrace pillars (antar tiang teras kantor) in 1376x768
// Left dark marble pillar inner edge: x=541 (39.32%), Right dark marble pillar inner edge: x=850 (61.77%)
// Mounted cleanly beneath the porch canopy overhang lip (y=347 -> 45.18%)
const TERRACE_RUNNING_TEXT_RECT_PCT = {
  left: (541 / HERO_FACADE_WIDTH) * 100, // 39.32%
  top: (348 / HERO_FACADE_HEIGHT) * 100, // 45.31%
  width: (309 / HERO_FACADE_WIDTH) * 100, // 22.46%
  height: (26 / HERO_FACADE_HEIGHT) * 100, // 3.39%
};

const TERRACE_RUNNING_TEXT_CONTENT =
  'SELAMAT DATANG PADA PELAYANAN TERPADU SATU PINTU KANTOR KEMENTERIAN AGAMA KABUPATEN MURUNG RAYA';

export type PtspPortalStage = 'depan' | 'entering' | 'ruang-ptsp' | 'katalog';

interface PtspInteractiveHeroProps {
  lang: 'id' | 'en';
  stage: PtspPortalStage;
  onStageChange: (stage: PtspPortalStage) => void;
  onNavigate: (view: PageView) => void;
  onSelectService: (unit: ServiceUnit) => void;
  onSelectSubService: (unit: ServiceUnit, sub: SubService) => void;
  onOpenServiceSidebar: () => void;
  onSelectArticle?: (article: NewsArticle) => void;
}

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

const RUANG_PTSP_DIRECTORY = [
  {
    id: 'katalog',
    label: 'Layanan PTSP',
    sub: 'Katalog 6 Bidang',
    topPct: 6,
    heightPct: 14,
  },
  {
    id: 'bimas-islam',
    label: 'Bimas Islam',
    sub: 'Nikah, Wakaf & Ibadah',
    topPct: 21,
    heightPct: 14,
  },
  {
    id: 'bimas-kristen',
    label: 'Bimas Kristen',
    sub: 'Gereja & Yayasan',
    topPct: 36,
    heightPct: 14,
  },
  {
    id: 'bimas-hindu',
    label: 'Bimas Hindu',
    sub: 'Keagamaan Hindu',
    topPct: 51,
    heightPct: 14,
  },
  {
    id: 'pendis',
    label: 'Pendidikan Islam',
    sub: 'Madrasah & Pontren',
    topPct: 66,
    heightPct: 14,
  },
  {
    id: 'e-pengaduan',
    label: 'Pengaduan Masyarakat',
    sub: 'Layanan E-Pengaduan',
    topPct: 81,
    heightPct: 14,
  },
] as const;

// Helper to chunk sub-services into alternating interlocking honeycomb rows (e.g., 4 / 3 / 4 / 3)
function buildInterlockingRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  let index = 0;
  let rowIndex = 0;
  while (index < items.length) {
    const size = rowIndex % 2 === 0 ? 4 : 3;
    rows.push(items.slice(index, index + size));
    index += size;
    rowIndex += 1;
  }
  return rows;
}

export function PtspInteractiveHero({
  lang,
  stage,
  onStageChange,
  onNavigate,
  onSelectService,
  onSelectSubService,
  onSelectArticle,
}: PtspInteractiveHeroProps) {
  const { isVerifiedEmployee, openLoginModal, user, newsArticles } = useAuthRole();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [subSearch, setSubSearch] = useState<string>('');
  const [hoveredDirectory, setHoveredDirectory] = useState<string | null>(null);

  // Left Videotron calendar-aware holiday greeting state & zoom poster modal
  const [activeHoliday, setActiveHoliday] = useState<CalendarHolidayGreeting>(() =>
    getActiveHolidayGreeting()
  );
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState<boolean>(false);

  // 3D Door choreography state (Step 1: doors swing inward -> Step 2: camera zooms into doorway)
  const [doorsOpened, setDoorsOpened] = useState<boolean>(false);
  const [cameraZooming, setCameraZooming] = useState<boolean>(false);

  // Honeycomb super slow-motion 1-by-1 reveal state
  const [revealedHexCount, setRevealedHexCount] = useState<number>(SERVICE_UNITS.length);
  const [hoveredHexId, setHoveredHexId] = useState<string | null>(null);
  const [hiveAnimKey, setHiveAnimKey] = useState<number>(0);

  // Mini-honeycomb dropdown 1-by-1 reveal state
  const [revealedMiniCount, setRevealedMiniCount] = useState<number>(0);
  const [miniAnimKey, setMiniAnimKey] = useState<number>(0);

  // Coordinate-locked cover-box geometry so 3D door & portico greeting stay pixel-exact
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const [coverBox, setCoverBox] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  } | null>(null);

  // Slow-motion panoramic left-to-right Ruang PTSP camera tour after clicking the entrance door
  const [roomPanActive, setRoomPanActive] = useState<boolean>(false);
  const [roomPanKey, setRoomPanKey] = useState<number>(0);

  // Periodic gentle letter-by-letter replay for "Selamat Datang" above the entrance door
  const [welcomeAnimKey, setWelcomeAnimKey] = useState<number>(0);

  const timersRef = useRef<number[]>([]);
  const hexTimersRef = useRef<number[]>([]);
  const miniTimersRef = useRef<number[]>([]);
  const panTimerRef = useRef<number | null>(null);
  const pendingRoomPanRef = useRef<boolean>(false);

  const clearDoorTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const clearHexTimers = () => {
    hexTimersRef.current.forEach((id) => window.clearTimeout(id));
    hexTimersRef.current = [];
  };

  const clearMiniTimers = () => {
    miniTimersRef.current.forEach((id) => window.clearTimeout(id));
    miniTimersRef.current = [];
  };

  const clearPanTimer = () => {
    if (panTimerRef.current !== null) {
      window.clearTimeout(panTimerRef.current);
      panTimerRef.current = null;
    }
  };

  const activeUnit = useMemo(
    () => (selectedUnitId ? SERVICE_UNITS.find((u) => u.id === selectedUnitId) || null : null),
    [selectedUnitId]
  );

  const filteredSubServices = useMemo(() => {
    if (!activeUnit) return [];
    const q = subSearch.trim().toLowerCase();
    if (!q) return activeUnit.subServices;
    return activeUnit.subServices.filter(
      (sub) =>
        sub.title.toLowerCase().includes(q) ||
        sub.output.toLowerCase().includes(q) ||
        sub.sla.toLowerCase().includes(q)
    );
  }, [activeUnit, subSearch]);

  const miniHiveRows = useMemo(
    () => buildInterlockingRows(filteredSubServices),
    [filteredSubServices]
  );

  // Trigger Super Slow-Motion 1-by-1 Honeycomb Reveal whenever entering Stage 3 ('katalog')
  const triggerHoneycombSlowMo = () => {
    clearHexTimers();
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setRevealedHexCount(SERVICE_UNITS.length);
      return;
    }

    setHiveAnimKey((k) => k + 1);
    setRevealedHexCount(0);
    SERVICE_UNITS.forEach((_, idx) => {
      const id = window.setTimeout(() => {
        setRevealedHexCount(idx + 1);
      }, 180 + idx * 460);
      hexTimersRef.current.push(id);
    });
  };

  // Trigger Mini-Honeycomb 1-by-1 Pop Reveal whenever selectedUnitId or search changes
  const triggerMiniHoneycombPop = (count: number) => {
    clearMiniTimers();
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setRevealedMiniCount(count);
      return;
    }

    setMiniAnimKey((k) => k + 1);
    setRevealedMiniCount(0);
    for (let i = 0; i < count; i += 1) {
      const id = window.setTimeout(() => {
        setRevealedMiniCount(i + 1);
      }, 110 + i * 110);
      miniTimersRef.current.push(id);
    }
  };

  const finishRoomPan = () => {
    clearPanTimer();
    setRoomPanActive(false);
    triggerHoneycombSlowMo();
  };

  useEffect(() => {
    if (stage === 'katalog') {
      if (pendingRoomPanRef.current) {
        pendingRoomPanRef.current = false;
        clearHexTimers();
        clearPanTimer();
        setRevealedHexCount(0);
        setRoomPanActive(true);
        setRoomPanKey((k) => k + 1);
        panTimerRef.current = window.setTimeout(() => {
          panTimerRef.current = null;
          setRoomPanActive(false);
          triggerHoneycombSlowMo();
        }, 6000);
      } else {
        clearPanTimer();
        setRoomPanActive(false);
        triggerHoneycombSlowMo();
      }
    } else if (stage === 'depan') {
      clearDoorTimers();
      clearPanTimer();
      pendingRoomPanRef.current = false;
      setRoomPanActive(false);
      setDoorsOpened(false);
      setCameraZooming(false);
    }
    return () => {
      clearHexTimers();
      clearPanTimer();
    };
  }, [stage]);

  useEffect(() => {
    if (stage === 'katalog' && activeUnit) {
      triggerMiniHoneycombPop(filteredSubServices.length);
    }
    return () => {
      clearMiniTimers();
    };
  }, [stage, selectedUnitId, subSearch, activeUnit, filteredSubServices.length]);

  useEffect(() => {
    return () => {
      clearDoorTimers();
      clearHexTimers();
      clearMiniTimers();
      clearPanTimer();
    };
  }, []);

  // Synchronize exact cover geometry between zoomed office facade and 3D glass door
  useEffect(() => {
    const el = heroStageRef.current;
    if (!el || (stage !== 'depan' && stage !== 'entering')) return;

    const computeCover = () => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // Visible facade ends right beneath the granite terrace stairs & wall shrubs (y=606),
      // cleanly removing the foreground garden & driveway strip at the bottom.
      const VISIBLE_FACADE_HEIGHT = 606;
      const scale = Math.max(rect.width / HERO_FACADE_WIDTH, rect.height / VISIBLE_FACADE_HEIGHT);
      const renderedW = HERO_FACADE_WIDTH * scale;
      const renderedH = HERO_FACADE_HEIGHT * scale;
      const visibleRenderedH = VISIBLE_FACADE_HEIGHT * scale;
      setCoverBox({
        width: renderedW,
        height: renderedH,
        left: (rect.width - renderedW) / 2,
        top: (rect.height - visibleRenderedH) / 2,
      });
    };

    computeCover();
    const ro = new ResizeObserver(computeCover);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stage]);

  // Replay letter-by-letter "Selamat Datang" gently while viewing the front facade
  useEffect(() => {
    if (stage !== 'depan' || doorsOpened) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const intervalId = window.setInterval(() => {
      setWelcomeAnimKey((k) => k + 1);
    }, 6800);
    return () => window.clearInterval(intervalId);
  }, [stage, doorsOpened]);

  // 3D Inward Double Door Open + Camera Zoom-In Choreography -> Direct to Honeycomb over Ruang PTSP
  const handleOpenDoor = () => {
    if (stage === 'entering' || doorsOpened) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setSelectedUnitId(null);
      onStageChange('katalog');
      return;
    }

    clearDoorTimers();
    onStageChange('entering');
    // Step 1: Double doors swing 3D inward (rotateY +/-105deg)
    setDoorsOpened(true);

    // Step 2: Camera zooms forward through the glowing doorway at 450ms
    const zoomTimer = window.setTimeout(() => {
      setCameraZooming(true);
    }, 450);

    // Step 3: Enter Ruang PTSP with Slow-Motion Left-to-Right Room Pan before Honeycomb Reveal
    const enterTimer = window.setTimeout(() => {
      setDoorsOpened(false);
      setCameraZooming(false);
      setSelectedUnitId(null);
      pendingRoomPanRef.current = true;
      onStageChange('katalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1250);

    timersRef.current.push(zoomTimer, enterTimer);
  };

  const handleDirectoryClick = (id: (typeof RUANG_PTSP_DIRECTORY)[number]['id']) => {
    if (id === 'e-pengaduan') {
      onNavigate('e-pengaduan');
      return;
    }
    if (id === 'katalog') {
      onStageChange('katalog');
      return;
    }
    setSelectedUnitId(id);
    setSubSearch('');
    onStageChange('katalog');
  };

  const handleHexSelect = (unit: ServiceUnit) => {
    if (unit.id === 'kepegawaian' && !isVerifiedEmployee) {
      openLoginModal(
        'pegawai',
        'Layanan Kepegawaian dikhususkan untuk ASN & Pegawai Kemenag Kab. Murung Raya. Silakan masuk menggunakan NIP pada tab Login Pegawai.'
      );
      return;
    }
    // Toggle close if clicking the already active hexagon cell
    if (selectedUnitId === unit.id) {
      setSelectedUnitId(null);
      return;
    }
    setSelectedUnitId(unit.id);
    setSubSearch('');
    window.setTimeout(() => {
      const panel = document.getElementById('rincian-sublayanan-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 80);
  };

  const isDoorStage = stage === 'depan' || stage === 'entering';
  const row1Units = SERVICE_UNITS.slice(0, 3);
  const row2Units = SERVICE_UNITS.slice(3, 6);

  const renderHexUnitCell = (unit: ServiceUnit, globalIndex: number) => {
    const Icon = SERVICE_ICONS[unit.id] || Building2;
    const coverSrc = SERVICE_IMAGES[unit.id];
    const isKepegawaianLocked = unit.id === 'kepegawaian' && !isVerifiedEmployee;
    const isActive = selectedUnitId === unit.id && !isKepegawaianLocked;
    const isRevealed = globalIndex < revealedHexCount;
    const isNeighborPulse = hoveredHexId !== null && hoveredHexId !== unit.id;
    const isGoldTone = globalIndex % 2 === 1;

    return (
      <div
        key={`${unit.id}-${hiveAnimKey}`}
        role="button"
        tabIndex={0}
        onClick={() => handleHexSelect(unit)}
        onMouseEnter={() => setHoveredHexId(unit.id)}
        onMouseLeave={() => setHoveredHexId(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHexSelect(unit);
          }
        }}
        className={`hex-wrapper group ${isRevealed ? 'hex-animate-in' : ''} ${
          isActive ? 'hex-active' : ''
        } ${isNeighborPulse ? 'hex-neighbor-pulse' : ''}`}
      >
        <div className="hex-border">
          <div className="hex-inner">
            {/* Loket & Bidang Pill */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold tracking-wider uppercase mb-1.5 shadow-xs whitespace-nowrap ${
                isActive
                  ? 'bg-amber-400 text-emerald-950'
                  : unit.id === 'kepegawaian'
                    ? 'bg-blue-900 text-white'
                    : isGoldTone
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-900 text-white'
              }`}
            >
              Bidang {unit.code} · {unit.subServices.length} Layanan
            </span>

            {/* Officer Portrait Medallion + Category Icon */}
            <div className="relative mb-1.5">
              <div
                className={`w-13 h-13 rounded-full overflow-hidden border-2 shadow-md transition-transform duration-300 group-hover:scale-105 ${
                  isActive ? 'border-amber-300' : 'border-emerald-600/50 dark:border-emerald-400/50'
                }`}
              >
                <SafeImage
                  src={coverSrc}
                  alt={`Petugas layanan ${unit.title}`}
                  fallbackLabel={unit.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 ${
                  isActive
                    ? 'bg-amber-400 text-emerald-950'
                    : unit.id === 'kepegawaian'
                      ? 'bg-blue-800 text-white'
                      : 'bg-emerald-700 text-white'
                }`}
              >
                {isKepegawaianLocked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </span>
            </div>

            {/* Unit Title */}
            <h2
              className={`text-[13px] lg:text-[14px] font-black uppercase tracking-tight leading-tight line-clamp-2 px-2 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-900 dark:text-white group-hover:text-emerald-900 dark:group-hover:text-amber-300'
              }`}
            >
              {unit.title}
            </h2>

            {/* Short Summary */}
            <p
              className={`mt-1 text-[10px] leading-snug line-clamp-2 px-3 ${
                isActive ? 'text-emerald-100/90' : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              {unit.shortDesc}
            </p>

            {/* Action Cue */}
            <div
              className={`mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-extrabold transition-colors ${
                isActive
                  ? 'text-amber-300'
                  : isKepegawaianLocked
                    ? 'text-blue-800 dark:text-sky-400'
                    : 'text-emerald-800 dark:text-emerald-400 group-hover:text-amber-600'
              }`}
            >
              <span>
                {isKepegawaianLocked
                  ? 'Login Pegawai'
                  : isActive
                    ? 'Sub-Layanan Terbuka'
                    : 'Lihat Sub-Layanan'}
              </span>
              {isKepegawaianLocked ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    isActive ? 'rotate-180' : 'group-hover:translate-y-0.5'
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="katalog-ptsp"
      className="relative w-full overflow-hidden bg-[#081526] transition-colors duration-300"
    >
      {/* ================================================================= */}
      {/* STAGE 1: ZOOMED OFFICE FACADE + REALISTIC 3D GLASS DOOR IN PLACE  */}
      {/* ================================================================= */}
      {isDoorStage && (
        <div
          ref={heroStageRef}
          className="relative min-h-[440px] sm:min-h-[500px] md:min-h-0 md:aspect-[1376/606] w-full overflow-hidden bg-gradient-to-b from-[#45a0f6] via-[#5fb4fa] to-[#081526]"
        >
          {/* Coordinate-Locked Building Facade + Pixel-Aligned Realistic 3D Glass Entrance Door */}
          <div
            className={`ptsp-building-stage absolute ${cameraZooming ? 'is-entering' : ''}`}
            style={
              coverBox
                ? {
                    width: `${coverBox.width}px`,
                    height: `${coverBox.height}px`,
                    left: `${coverBox.left}px`,
                    top: `${coverBox.top}px`,
                    transformOrigin: `${DOOR_RECT_PCT.centerX}% ${DOOR_RECT_PCT.centerY}%`,
                  }
                : {
                    inset: 0,
                    transformOrigin: `${DOOR_RECT_PCT.centerX}% ${DOOR_RECT_PCT.centerY}%`,
                  }
            }
          >
            {/* Zoomed-In Kantor Kemenag Facade + Live Waving Bendera Merah Putih */}
            <HeroOfficeBackground
              imageSrc={heroKantorZoomImg}
              alt="Gedung Kantor Kementerian Agama Kabupaten Murung Raya dengan Bendera Merah Putih Berkibar"
              preserveAspectRatio={coverBox ? 'none' : 'xMidYMid slice'}
            />

            {/* Minimal Crystal-Clear Top/Bottom Polish Keeping Entire Facade, Sky & Videotrons Bright */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#061425]/24 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#061425]/20 to-transparent" />
            </div>

            {/* LEFT FACADE VIDEOTRON: Foto Kepala Kantor & Kasubbag TU + Ucapan Hari Besar Kalender */}
            <LeftHolidayVideotron
              doorsOpened={doorsOpened}
              coverWidth={coverBox?.width ?? 1440}
              activeHoliday={activeHoliday}
              onOpenModal={() => setIsHolidayModalOpen(true)}
            />

            {/* RIGHT FACADE VIDEOTRON: Informasi Berita Kementerian Agama Bergulir (Semua Berita Web) */}
            <RightNewsVideotron
              doorsOpened={doorsOpened}
              coverWidth={coverBox?.width ?? 1440}
              articles={newsArticles}
              onSelectArticle={onSelectArticle}
              onNavigateNews={() => onNavigate('berita')}
            />

            {/* OUTDOOR LED RUNNING TEXT: Spanning Exactly Between the Two Front Terrace Pillars */}
            <div
              role="region"
              aria-label="Running Text Layanan PTSP Kantor Kementerian Agama Kabupaten Murung Raya"
              style={{
                left: `${TERRACE_RUNNING_TEXT_RECT_PCT.left}%`,
                top: `${TERRACE_RUNNING_TEXT_RECT_PCT.top}%`,
                width: `${TERRACE_RUNNING_TEXT_RECT_PCT.width}%`,
                height: `${TERRACE_RUNNING_TEXT_RECT_PCT.height}%`,
              }}
              className={`terrace-led-cabinet absolute z-[22] flex items-center p-[2px] transition-all duration-500 ${
                doorsOpened ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Left & Right Pillar Mounting Brackets */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-[3px] top-1/2 -translate-y-1/2 h-[65%] w-[3px] rounded-l-[1px] bg-slate-800 ring-1 ring-slate-600/60"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-[3px] top-1/2 -translate-y-1/2 h-[65%] w-[3px] rounded-r-[1px] bg-slate-800 ring-1 ring-slate-600/60"
              />

              {/* Crisp Outdoor P10 LED Display Screen */}
              <div className="terrace-led-screen relative flex h-full w-full items-center overflow-hidden rounded-[1.5px] border border-amber-400/35">
                {/* Subtle left/right bezel fade so LED letters glide cleanly into pillar frames */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-3 bg-gradient-to-r from-[#05090e] to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 w-3 bg-gradient-to-l from-[#05090e] to-transparent"
                />

                <div
                  className="terrace-running-track"
                  style={{
                    fontSize: coverBox
                      ? `${Math.max(10, Math.min(18, coverBox.width * 0.0098))}px`
                      : '13.5px',
                  }}
                >
                  {[0, 1].map((dupIdx) => (
                    <span
                      key={dupIdx}
                      aria-hidden={dupIdx === 1}
                      className="terrace-led-text inline-flex items-center font-mono-tabular font-extrabold uppercase tracking-[0.09em] leading-none"
                    >
                      <span>{TERRACE_RUNNING_TEXT_CONTENT}</span>
                      <span className="mx-7 text-emerald-400" aria-hidden="true">
                        ◆
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Letter-by-Letter "Selamat Datang" Positioned Directly Above the Office Entrance Door */}
            <div
              style={{
                left: `${DOOR_RECT_PCT.centerX}%`,
                top: '50.0%',
              }}
              className={`pointer-events-none absolute -translate-x-1/2 z-[21] flex flex-col items-center text-center whitespace-nowrap transition-all duration-500 ${
                doorsOpened ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              <h1
                key={`welcome-door-${welcomeAnimKey}-${lang}`}
                aria-label={lang === 'en' ? 'Welcome' : 'Selamat Datang'}
                style={{
                  fontSize: coverBox
                    ? `${Math.max(15, Math.min(30, coverBox.width * 0.02))}px`
                    : '25px',
                }}
                className="font-serif-editorial italic font-semibold leading-none text-white drop-shadow-[0_3px_10px_rgba(2,18,12,0.95)] [text-shadow:0_2px_6px_rgba(0,0,0,0.9),0_0_16px_rgba(4,47,34,0.85)] px-2.5 py-0.5 rounded-lg bg-emerald-950/32 backdrop-blur-[1.5px]"
              >
                {Array.from(lang === 'en' ? 'Welcome' : 'Selamat Datang').map((char, idx) => (
                  <span
                    key={`${idx}-${char}`}
                    style={{ animationDelay: `${idx * 90}ms` }}
                    className="welcome-letter-pop"
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h1>
              <svg
                key={`welcome-line-${welcomeAnimKey}-${lang}`}
                viewBox="0 0 260 14"
                style={{
                  width: coverBox
                    ? `${Math.max(96, Math.min(185, coverBox.width * 0.122))}px`
                    : '150px',
                }}
                className="mt-0.5 h-2 overflow-visible welcome-line-draw drop-shadow-[0_2px_4px_rgba(0,0,0,0.75)]"
                aria-hidden="true"
              >
                <path
                  d="M 4 9 Q 115 1 256 10"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 22 12 Q 125 5 236 12"
                  fill="none"
                  stroke="#fde68a"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </svg>
            </div>

            {/* Blinking Yellow Outer Architectural Door Frame Cue (Border Luar Pintu) */}
            <div
              onClick={handleOpenDoor}
              aria-hidden="true"
              style={{
                left: `${DOOR_OUTER_RECT_PCT.left}%`,
                top: `${DOOR_OUTER_RECT_PCT.top}%`,
                width: `${DOOR_OUTER_RECT_PCT.width}%`,
                height: `${DOOR_OUTER_RECT_PCT.height}%`,
              }}
              className={`absolute z-[19] rounded-[3px] cursor-pointer transition-opacity duration-300 ${
                doorsOpened ? 'opacity-0 pointer-events-none' : 'ptsp-door-outer-blink'
              }`}
            />

            {/* EXACT-FITTED REALISTIC 3D ARCHITECTURAL DOUBLE GLASS DOOR ON BUILDING ENTRANCE */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Klik pintu kaca utama kantor untuk membuka pintu dan masuk ke Ruang PTSP"
              title="Klik pintu untuk masuk ke Ruang PTSP"
              onClick={handleOpenDoor}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDoor();
                }
              }}
              style={{
                left: `${DOOR_RECT_PCT.left}%`,
                top: `${DOOR_RECT_PCT.top}%`,
                width: `${DOOR_RECT_PCT.width}%`,
                height: `${DOOR_RECT_PCT.height}%`,
              }}
              className={`ptsp-door-zone group absolute z-20 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-amber-300 ${
                doorsOpened ? 'doors-opened' : ''
              }`}
            >
              {/* Subtle Dark-Bronze Architectural Door Jamb Perimeter Matching Real Building Frame */}
              <div className="relative w-full h-full bg-[#0c1413] p-[1.5px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.75)] ring-1 ring-white/15 group-hover:ring-amber-300/80 transition-all duration-300">
                {/* Real Sunlit Ruang PTSP Interior Revealed Inside the Open Doorway */}
                <div className="ptsp-interior-glow absolute inset-[1.5px] overflow-hidden">
                  <img
                    src={PTSP_KATALOG_BG_SRC}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center scale-110 brightness-110"
                  />
                  {/* Natural Portico Interior Depth Shadow at Top & Sides */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 shadow-[inset_0_12px_16px_rgba(0,0,0,0.55),inset_4px_0_10px_rgba(0,0,0,0.35),inset_-4px_0_10px_rgba(0,0,0,0.35)]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-amber-100/20 via-transparent to-emerald-950/25"
                  />
                </div>

                {/* 3D Inward-Swinging Tempered Glass Double Leaves */}
                <div className="ptsp-door-frame relative w-full h-full grid grid-cols-2 gap-[1px]">
                  {/* LEFT TEMPERED GLASS DOOR LEAF */}
                  <div className="ptsp-door-leaf-left relative h-full flex flex-col border-y-[2px] border-l-[2px] border-r-[1px] border-[#192321] overflow-hidden">
                    <div className="ptsp-glass-pane relative flex-1 flex items-center justify-center overflow-hidden">
                      {/* Diagonal Daylight Sky Specular Reflection */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_36%,transparent_54%,rgba(255,255,255,0.12)_100%)]"
                      />
                      {/* Animated Hover Specular Glare Sweep */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      />

                      {/* Official Kemenag Emblem Decal on Left Glass Panel */}
                      <div className="relative z-10 w-[58%] aspect-square rounded-full bg-white/18 backdrop-blur-[1px] border border-amber-200/45 shadow-[0_1px_4px_rgba(0,0,0,0.4)] flex items-center justify-center p-[8%] mr-[10%]">
                        <img
                          src={KEMENAG_LOGO_SRC}
                          alt="Logo Kementerian Agama RI"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                        />
                      </div>

                      {/* Realistic Brushed Stainless-Steel Tubular Pull Handle (Right Edge of Left Leaf) */}
                      <div
                        aria-hidden="true"
                        className="absolute right-[7%] top-[34%] h-[32%] w-[4.5px] max-w-[5px] flex flex-col justify-between items-center z-20"
                      >
                        <span className="w-full h-full rounded-full bg-gradient-to-r from-slate-300 via-white to-slate-400 shadow-[1px_2px_3px_rgba(0,0,0,0.65)]" />
                      </div>
                    </div>

                    {/* Slim Anodized Bottom Rail Shoe */}
                    <div className="h-[10%] min-h-[6px] bg-gradient-to-b from-[#232f2c] to-[#0f1715] border-t border-white/15" />
                  </div>

                  {/* RIGHT TEMPERED GLASS DOOR LEAF */}
                  <div className="ptsp-door-leaf-right relative h-full flex flex-col border-y-[2px] border-r-[2px] border-l-[1px] border-[#192321] overflow-hidden">
                    <div className="ptsp-glass-pane relative flex-1 flex items-center justify-center overflow-hidden">
                      {/* Diagonal Daylight Sky Specular Reflection */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14)_0%,transparent_42%,rgba(255,255,255,0.22)_72%,rgba(255,255,255,0.06)_100%)]"
                      />
                      {/* Animated Hover Specular Glare Sweep */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      />

                      {/* Official Kemenag Emblem Decal on Right Glass Panel */}
                      <div className="relative z-10 w-[58%] aspect-square rounded-full bg-white/18 backdrop-blur-[1px] border border-amber-200/45 shadow-[0_1px_4px_rgba(0,0,0,0.4)] flex items-center justify-center p-[8%] ml-[10%]">
                        <img
                          src={KEMENAG_LOGO_SRC}
                          alt="Logo Kementerian Agama RI"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                        />
                      </div>

                      {/* Realistic Brushed Stainless-Steel Tubular Pull Handle (Left Edge of Right Leaf) */}
                      <div
                        aria-hidden="true"
                        className="absolute left-[7%] top-[34%] h-[32%] w-[4.5px] max-w-[5px] flex flex-col justify-between items-center z-20"
                      >
                        <span className="w-full h-full rounded-full bg-gradient-to-r from-slate-300 via-white to-slate-400 shadow-[-1px_2px_3px_rgba(0,0,0,0.65)]" />
                      </div>
                    </div>

                    {/* Slim Anodized Bottom Rail Shoe */}
                    <div className="h-[10%] min-h-[6px] bg-gradient-to-b from-[#232f2c] to-[#0f1715] border-t border-white/15" />
                  </div>
                </div>
              </div>

              {/* Warm Interior Floor Light Spill Onto Granite Steps When Doors Open */}
              <div
                aria-hidden="true"
                className="ptsp-threshold-spill pointer-events-none absolute left-[-12%] right-[-12%] top-[98%] h-[36%] origin-top bg-[radial-gradient(ellipse_at_top,rgba(254,243,199,0.75)_0%,rgba(251,191,36,0.28)_48%,transparent_80%)] blur-[3px]"
              />

              {/* Subtle Hover Hint Directly Below Door Threshold */}
              {!doorsOpened && (
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[106%] whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/82 backdrop-blur-sm border border-amber-300/65 text-[10px] font-extrabold tracking-wide text-amber-200 shadow-lg">
                    <span>{lang === 'en' ? 'Click Door to Enter' : 'Klik Pintu Masuk'}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STAGE 2: RUANG PTSP — RESEPSIONIS, PETUGAS, RUANG TUNGGU & LOKET   */}
      {/* ================================================================= */}
      {stage === 'ruang-ptsp' && (
        <div className="animate-ptsp-stage-reveal relative z-10 min-h-[90vh] bg-gradient-to-b from-[#172821] via-[#1f2c25] to-[#0f1c17] pt-28 sm:pt-32 lg:pt-36 pb-12 px-3 sm:px-6 lg:px-10">
          <div className="max-w-[1440px] mx-auto space-y-6">
            {/* Stage Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <span>Tahap 02</span>
                  <span aria-hidden="true">·</span>
                  <span>Ruang Pelayanan Terpadu Satu Pintu</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Ruang PTSP Kantor Kemenag Murung Raya
                </h1>
                <p className="text-sm text-emerald-100/85 max-w-2xl">
                  Petugas resepsionis dan loket pelayanan siap membantu kebutuhan masyarakat. Klik papan loket di sisi kanan ruangan, mesin layanan mandiri, atau buka Katalog Layanan di bawah.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onStageChange('depan')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl bg-white/10 hover:bg-white/18 border border-white/15 text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Halaman Depan</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStageChange('katalog')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/40 transition-colors whitespace-nowrap shrink-0"
                >
                  <Hexagon className="w-4 h-4 text-amber-300" />
                  <span>Buka Katalog Sarang Lebah (6 Bidang)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Panoramic Ruang PTSP Illustration with Live Clickable Hotspots */}
            <div className="relative rounded-3xl overflow-hidden border border-amber-200/25 bg-[#f5efe4] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <div className="relative w-full aspect-[1672/301] min-h-[260px] sm:min-h-[340px] lg:min-h-[400px] overflow-hidden bg-[#2b241c]">
                <SafeImage
                  src="/assets/aistudio/ptsp_ruang_pelayanan.png"
                  alt="Ilustrasi Ruang PTSP Kantor Kementerian Agama Kabupaten Murung Raya dengan Resepsionis, Petugas Pelayanan, Ruang Tunggu, dan Papan Loket"
                  fallbackLabel="Ruang Pelayanan PTSP Kemenag Murung Raya"
                  className="w-full h-full object-cover object-center"
                />

                {/* Interactive Hotspot 1: Left Digital Self-Service Kiosk */}
                <button
                  type="button"
                  onClick={() => onNavigate('layanan')}
                  title="Buka Mesin Layanan Mandiri & Lacak Tiket PTSP"
                  aria-label="Akses Mesin Layanan Mandiri PTSP"
                  className="hidden sm:flex group absolute left-[5.5%] top-[47%] w-[7%] h-[42%] rounded-xl border-2 border-transparent hover:border-amber-300 hover:bg-amber-400/15 transition-all items-start justify-center pt-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
                >
                  <span className="opacity-0 group-hover:opacity-100 -translate-y-7 px-2.5 py-1 rounded-lg bg-slate-950/90 text-[11px] font-bold text-amber-200 whitespace-nowrap shadow-lg transition-opacity">
                    Lacak & Ajukan Tiket
                  </span>
                </button>

                {/* Interactive Hotspot 2: Center Receptionist Counter Desk */}
                <button
                  type="button"
                  onClick={() => onStageChange('katalog')}
                  title="Temui Petugas Resepsionis & Buka Katalog Layanan PTSP"
                  aria-label="Meja Resepsionis PTSP — Buka Katalog Layanan"
                  className="hidden md:flex group absolute left-[37%] top-[43%] w-[26%] h-[40%] rounded-2xl border-2 border-transparent hover:border-emerald-300/90 hover:bg-emerald-500/10 transition-all items-end justify-center pb-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-800/92 group-hover:bg-emerald-600 text-[11px] font-extrabold text-white shadow-lg border border-emerald-300/40 whitespace-nowrap transition-colors flex items-center gap-1.5">
                    <span>Meja Resepsionis · Pilih Layanan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                {/* Interactive Hotspot 3: Right Green Directory Board (6 Precision Clickable Rows) */}
                <div
                  aria-label="Papan Direktori Loket Ruang PTSP"
                  className="hidden md:block absolute right-[6.2%] top-[3%] w-[14.2%] h-[92%]"
                >
                  {RUANG_PTSP_DIRECTORY.map((item) => {
                    const isHover = hoveredDirectory === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setHoveredDirectory(item.id)}
                        onMouseLeave={() => setHoveredDirectory(null)}
                        onClick={() => handleDirectoryClick(item.id)}
                        style={{
                          top: `${item.topPct}%`,
                          height: `${item.heightPct}%`,
                        }}
                        title={`Buka ${item.label} (${item.sub})`}
                        aria-label={`Buka ${item.label}`}
                        className={`absolute inset-x-0 rounded-lg border-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 ${
                          isHover
                            ? 'border-amber-300 bg-amber-300/20 shadow-[0_0_16px_rgba(251,191,36,0.45)]'
                            : 'border-transparent hover:border-amber-300'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Receptionist Welcome Bar & Quick Directory Buttons */}
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Resepsionis PTSP Kemenag Murung Raya · Melayani Dengan Hati
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                        Selamat datang di ruang tunggu pelayanan. Pilih bidang loket di bawah ini untuk langsung membuka katalog sarang lebah dan rincian sub-layanan.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStageChange('katalog')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-extrabold transition-colors whitespace-nowrap shrink-0 shadow-sm"
                  >
                    <span>Lihat Semua 6 Kategori Layanan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Interactive Loket Directory Grid Matching the Right Wall Board */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                  {RUANG_PTSP_DIRECTORY.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleDirectoryClick(item.id)}
                      onMouseEnter={() => setHoveredDirectory(item.id)}
                      onMouseLeave={() => setHoveredDirectory(null)}
                      className={`group rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                        hoveredDirectory === item.id
                          ? 'bg-emerald-700 border-emerald-600 text-white shadow-md'
                          : 'bg-emerald-50/70 dark:bg-slate-800/80 border-emerald-200/80 dark:border-slate-700 hover:bg-emerald-700 hover:border-emerald-600 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-extrabold truncate ${
                            hoveredDirectory === item.id
                              ? 'text-white'
                              : 'text-emerald-950 dark:text-white group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                            hoveredDirectory === item.id
                              ? 'text-amber-200'
                              : 'text-emerald-700 dark:text-emerald-400 group-hover:text-amber-200'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          hoveredDirectory === item.id
                            ? 'text-emerald-100'
                            : 'text-slate-600 dark:text-slate-400 group-hover:text-emerald-100'
                        }`}
                      >
                        {item.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ruang Tunggu Service Information Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/8 border border-white/12 p-4 flex items-center gap-3.5 text-white">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-300">Jam Pelayanan PTSP</p>
                  <p className="text-xs text-slate-200 mt-0.5 truncate">{OFFICE_INFO.hoursWeekday}</p>
                  <p className="text-[11px] text-slate-300 truncate">{OFFICE_INFO.hoursFriday}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('diagram-alur-ptsp')}
                className="rounded-2xl bg-white/8 hover:bg-white/14 border border-white/12 p-4 flex items-center justify-between gap-3 text-left text-white transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-300/30 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-300">SOP & Alur Pelayanan</p>
                    <p className="text-xs text-slate-200 mt-0.5 truncate">
                      Lihat Diagram Alur Data PTSP
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() =>
                  openLoginModal(
                    'pegawai',
                    'Silakan login menggunakan NIP untuk layanan Kepegawaian ASN atau dashboard petugas.'
                  )
                }
                className="rounded-2xl bg-blue-950/65 hover:bg-blue-900/75 border border-sky-300/25 p-4 flex items-center justify-between gap-3 text-left text-white transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-300/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-sky-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-sky-300">Akses Pegawai & ASN</p>
                    <p className="text-xs text-slate-200 mt-0.5 truncate">
                      {isVerifiedEmployee
                        ? 'Akun Pegawai Terverifikasi Aktif'
                        : 'Masuk dengan NIP Pegawai Kemenag'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-200 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STAGE 3: KATALOG SARANG LEBAH DI ATAS LATAR BELAKANG RUANG PTSP   */}
      {/* ================================================================= */}
      {stage === 'katalog' && (
        <div
          className={`animate-ptsp-stage-reveal relative z-10 bg-[#0a1c16] overflow-hidden ${
            roomPanActive
              ? 'h-[100vh] min-h-[100vh]'
              : 'min-h-[100vh] pt-[104px] sm:pt-[116px] lg:pt-[124px] pb-10 px-3 sm:px-6 lg:px-8'
          }`}
        >
          {/* Full Ruang PTSP Interior Photo Backdrop (Slow-Motion Pan Left-to-Right First, Then Wide Backdrop) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <img
              key={`ptsp-room-bg-${roomPanKey}`}
              src={PTSP_KATALOG_BG_SRC}
              alt="Latar belakang Ruang Pelayanan Terpadu Satu Pintu (PTSP) Kantor Kementerian Agama Kabupaten Murung Raya"
              referrerPolicy="no-referrer"
              className={
                roomPanActive
                  ? 'w-full h-full object-cover ptsp-room-slow-pan'
                  : 'w-full h-full object-cover object-center scale-[1.01] transition-transform duration-700 ease-out'
              }
            />
            {/* Measured Warm Emerald Atmospheric Scrim (Hidden During Slow-Mo Room Pan So Details Are 100% Crisp) */}
            <div
              className={`absolute inset-0 bg-gradient-to-b from-[#041d15]/48 via-[#062b20]/26 to-[#041812]/68 transition-opacity duration-700 ${
                roomPanActive ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <div
              className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(251,191,36,0.1)_0%,transparent_62%)] transition-opacity duration-700 ${
                roomPanActive ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>

          {/* Unobstructed Slow-Motion Room Pan HUD (Bottom Floating Control Only) */}
          {roomPanActive && (
            <div className="absolute inset-x-0 bottom-7 sm:bottom-9 z-30 flex justify-center px-4">
              <div className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-slate-950/72 backdrop-blur-md border border-amber-300/35 shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
                <div className="flex flex-col gap-1.5 min-w-[175px] sm:min-w-[235px]">
                  <span className="text-[11px] sm:text-xs font-bold tracking-wide text-amber-200 whitespace-nowrap">
                    {lang === 'en'
                      ? 'Exploring PTSP Service Hall...'
                      : 'Menampilkan Ruang Pelayanan PTSP...'}
                  </span>
                  <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      key={`pan-progress-${roomPanKey}`}
                      className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-400 ptsp-room-pan-progress"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={finishRoomPan}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-amber-400 hover:text-slate-950 border border-white/25 text-[11px] font-extrabold text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>{lang === 'en' ? 'Skip' : 'Lewati'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {!roomPanActive && (
          <div className="relative z-10 max-w-[1440px] mx-auto space-y-4 animate-ptsp-stage-reveal">
            {/* ============================================================ */}
            {/* SARANG LEBAH UTAMA (6 BIDANG LAYANAN INTERLOCKING 3-3 HIVE)  */}
            {/* ============================================================ */}
            <div className="honeycomb-stage rounded-3xl border border-amber-300/30 shadow-[0_24px_60px_rgba(0,0,0,0.45)] px-4 sm:px-6 py-3 sm:py-4 overflow-hidden">
              {/* Back-to-Home Button Tucked Inside Top-Left Corner of Catalog Border */}
              <button
                type="button"
                onClick={() => onStageChange('depan')}
                className="relative md:absolute md:top-3.5 md:left-4 z-30 mb-3 md:mb-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md border border-white/25 text-xs font-bold text-white hover:border-amber-300 transition-colors shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
                <span>Kembali ke Beranda Web</span>
              </button>

              {/* Ambient Golden Floating Particles */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-6 left-12 w-2.5 h-2.5 rounded-full bg-amber-400/75 hive-particle"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-8 right-16 w-3 h-3 rounded-full bg-emerald-400/65 hive-particle"
                style={{ animationDelay: '1.5s' }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-10 w-2 h-2 rounded-full bg-amber-300/75 hive-particle"
                style={{ animationDelay: '2.7s' }}
              />

              {/* Interlocking 3-3 Honeycomb Grid */}
              <div className="honeycomb-hive relative z-10">
                <div className="honeycomb-row">
                  {row1Units.map((unit, idx) => renderHexUnitCell(unit, idx))}
                </div>
                <div className="honeycomb-row honeycomb-row-offset">
                  {row2Units.map((unit, idx) => renderHexUnitCell(unit, idx + 3))}
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* DROPDOWN SARANG LEBAH MINI — RINCIAN SUB-LAYANAN TERPILIH    */}
            {/* ============================================================ */}
            {activeUnit && (
              <div
                id="rincian-sublayanan-panel"
                key={`dropdown-${activeUnit.id}`}
                className="scroll-mt-24 mini-honeycomb-dropdown rounded-3xl border-2 border-amber-400/70 dark:border-amber-500/50 shadow-2xl p-5 sm:p-7 relative overflow-hidden"
              >
                {/* Dropdown Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-emerald-900/15 dark:border-white/10">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                      <span>Dropdown Sarang Lebah Sub-Layanan</span>
                      <span aria-hidden="true">·</span>
                      <span>Bidang {activeUnit.code}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeUnit.officer}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Rincian Sub-Layanan {activeUnit.title}
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={subSearch}
                        onChange={(e) => setSubSearch(e.target.value)}
                        placeholder={`Cari di ${activeUnit.title}...`}
                        className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectService(activeUnit)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[38px] rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Halaman {activeUnit.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUnitId(null)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-200 hover:text-rose-700 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      <ChevronUp className="w-4 h-4" />
                      <span>Tutup</span>
                    </button>
                  </div>
                </div>

                {/* Sub-caption inside Mini-Honeycomb Dropdown */}
                <div className="text-center mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-900 text-amber-300 text-[11px] font-bold tracking-wide uppercase shadow-sm">
                    <Hexagon className="w-3.5 h-3.5" />
                    <span>
                      Pilih Sel Sub-Layanan ({filteredSubServices.length} Layanan Tersedia)
                    </span>
                  </span>
                </div>

                {/* Mini Honeycomb Cluster of Real Sub-Services */}
                {filteredSubServices.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Tidak ditemukan sub-layanan untuk kata kunci "{subSearch}"
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubSearch('')}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Tampilkan semua {activeUnit.subServices.length} sub-layanan
                    </button>
                  </div>
                ) : (
                  <div className="mini-hive-cluster relative z-10">
                    {miniHiveRows.map((rowItems, rIdx) => {
                      const rowOffsetCount = miniHiveRows
                        .slice(0, rIdx)
                        .reduce((acc, r) => acc + r.length, 0);
                      return (
                        <div
                          key={`mini-row-${rIdx}-${miniAnimKey}`}
                          className={`mini-hive-row ${rIdx > 0 ? 'mini-hive-row-offset' : ''}`}
                        >
                          {rowItems.map((sub, cIdx) => {
                            const globalIdx = rowOffsetCount + cIdx;
                            const isPopped = globalIdx < revealedMiniCount;
                            return (
                              <div
                                key={`${sub.id}-${miniAnimKey}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelectSubService(activeUnit, sub)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelectSubService(activeUnit, sub);
                                  }
                                }}
                                className={`mini-hex-wrapper group ${
                                  isPopped ? 'mini-hex-animate' : ''
                                }`}
                              >
                                <div className="mini-hex-border">
                                  <div className="mini-hex-inner">
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-900 text-amber-300 text-[9px] font-extrabold tracking-wider uppercase mb-1.5 shadow-xs font-mono-tabular whitespace-nowrap">
                                      {activeUnit.code}-{String(globalIdx + 1).padStart(2, '0')} · {sub.sla}
                                    </span>
                                    <h4 className="text-xs lg:text-[13px] font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-950 dark:group-hover:text-amber-200 leading-snug line-clamp-3 px-1.5 mb-2">
                                      {sub.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-300 line-clamp-1 px-2 mb-1.5">
                                      {sub.requirements.length} Syarat · {sub.fee}
                                    </p>
                                    <div className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-300 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                                      <span className="underline">Ajukan Layanan</span>
                                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* INTEGRASI SISTEM LAYANAN RESMI KEMENAG MURUNG RAYA           */}
            {/* ============================================================ */}
            <div className="rounded-3xl bg-emerald-950 text-white p-5 sm:p-7 border border-emerald-800/70 space-y-5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-300">
                    Integrasi Ekosistem Layanan Resmi
                  </p>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">
                    Sistem Layanan Digital & Informasi Kemenag Kabupaten Murung Raya
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('layanan')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors whitespace-nowrap"
                  >
                    <TicketCheck className="w-3.5 h-3.5" />
                    <span>Lacak Status Tiket</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('e-pengaduan')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/18 text-xs font-bold text-white transition-colors whitespace-nowrap"
                  >
                    <MessageSquareWarning className="w-3.5 h-3.5 text-amber-300" />
                    <span>E-Pengaduan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('sop-ptsp')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/18 text-xs font-bold text-white transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-300" />
                    <span>SOP & Alur PTSP</span>
                  </button>
                  {!user && (
                    <button
                      type="button"
                      onClick={() =>
                        openLoginModal(
                          'pegawai',
                          'Masuk menggunakan NIP untuk mengakses Layanan Kepegawaian ASN Kemenag Murung Raya.'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-xs font-bold text-white transition-colors whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Login Pegawai (NIP)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Official External Systems Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
                {EXTERNAL_APPS.slice(0, 6).map((app) => (
                  <a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl bg-white/8 hover:bg-white/15 border border-white/12 p-3 flex flex-col justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white group-hover:text-amber-200 truncate">
                        {app.name}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    </div>
                    <p className="text-[11px] text-emerald-100/80 line-clamp-2 leading-snug">
                      {app.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Signature Bottom Green & Gold Wave Ribbon */}
          {!roomPanActive && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 overflow-hidden">
            <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-full block">
              <path
                d="M 0 10 Q 320 46 720 30 T 1440 12 L 1440 48 L 0 48 Z"
                fill="#065f46"
              />
              <path
                d="M 0 6 Q 320 42 720 26 T 1440 8"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
              />
            </svg>
          </div>
          )}
        </div>
      )}

      {/* Full-Size Interactive Holiday Greeting Poster Modal (Opened via Left Videotron) */}
      <HolidayPosterModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        selectedHoliday={activeHoliday}
        onSelectHoliday={setActiveHoliday}
      />
    </section>
  );
}
