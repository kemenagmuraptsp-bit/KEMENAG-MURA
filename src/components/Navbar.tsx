import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  LogIn,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { PageView } from '@/src/types';
import { InformasiUnitId } from '@/src/data/informasiData';
import { KemenagEmblem } from '@/src/components/KemenagEmblem';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import { HeaderAccountControls } from '@/src/components/NotificationBell';

interface NavbarProps {
  activeView: PageView;
  onNavigate: (view: PageView) => void;
  onNavigateToHistory: () => void;
  onNavigateToKepegawaian: () => void;
  onSelectServiceUnit: (unitId: string) => void;
  onSelectInformasiUnit: (unitId: InformasiUnitId, sectionId?: string) => void;
  lang: 'id' | 'en';
  onChangeLang: (lang: 'id' | 'en') => void;
  isDark: boolean;
  onToggleDark: (dark: boolean) => void;
  onOpenSearch: () => void;
}

interface NavDropdownItem {
  label: string;
  view?: PageView;
  sectionId?: string;
  serviceUnitId?: string;
  infoUnitId?: InformasiUnitId;
  infoSectionId?: string;
  href?: string;
  dividerBefore?: boolean;
  children?: NavDropdownItem[];
}

interface NavItemConfig {
  id: string;
  labelId: string;
  labelEn: string;
  view?: PageView;
  children?: NavDropdownItem[];
}

const PENDIS_EXTERNAL_URL = 'https://sipendismura.my.id';

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'beranda', labelId: 'BERANDA', labelEn: 'HOME', view: 'beranda' },
  {
    id: 'profil',
    labelId: 'PROFIL',
    labelEn: 'PROFILE',
    view: 'profil',
    children: [
      { label: 'Sejarah & Kedudukan', view: 'profil' },
      { label: 'Visi, Misi & Pimpinan', view: 'profil' },
      { label: 'Direktori KUA Kecamatan', view: 'kontak' },
    ],
  },
  {
    id: 'media',
    labelId: 'MEDIA CENTER',
    labelEn: 'MEDIA',
    view: 'berita',
    children: [
      { label: 'Berita Terkini', view: 'berita' },
      { label: 'Galeri Kegiatan', view: 'galeri' },
      { label: 'Dokumentasi Video', view: 'galeri' },
    ],
  },
  { id: 'ppid', labelId: 'PPID', labelEn: 'PPID', view: 'ppid' },
  {
    id: 'informasi',
    labelId: 'INFORMASI',
    labelEn: 'INFO',
    view: 'informasi',
    children: [
      {
        label: 'Kepegawaian',
        infoUnitId: 'kepegawaian',
        children: [
          {
            label: 'Data ASN Kemenag',
            infoUnitId: 'kepegawaian',
            infoSectionId: 'data-asn-kemenag',
          },
        ],
      },
      {
        label: 'Bimas Islam',
        infoUnitId: 'bimas-islam',
        children: [
          { label: 'Data KUA', infoUnitId: 'bimas-islam', infoSectionId: 'data-kua' },
          { label: 'Data Mesjid', infoUnitId: 'bimas-islam', infoSectionId: 'data-mesjid' },
          { label: 'Data Musholla', infoUnitId: 'bimas-islam', infoSectionId: 'data-musholla' },
          { label: 'Data Penyuluh', infoUnitId: 'bimas-islam', infoSectionId: 'data-penyuluh' },
          {
            label: 'Struktur organisasi',
            infoUnitId: 'bimas-islam',
            infoSectionId: 'struktur-organisasi',
          },
        ],
      },
      { label: 'Pendidikan Islam', href: PENDIS_EXTERNAL_URL },
      {
        label: 'Bimas Hindu',
        infoUnitId: 'bimas-hindu',
        children: [
          {
            label: 'Data Rumah Ibadah',
            infoUnitId: 'bimas-hindu',
            infoSectionId: 'data-rumah-ibadah',
          },
          { label: 'Data Penyuluh', infoUnitId: 'bimas-hindu', infoSectionId: 'data-penyuluh' },
          { label: 'Data Pasraman', infoUnitId: 'bimas-hindu', infoSectionId: 'data-pasraman' },
          {
            label: 'Data Guru Agama Hindu',
            infoUnitId: 'bimas-hindu',
            infoSectionId: 'data-guru-agama-hindu',
          },
          {
            label: 'Struktur organisasi',
            infoUnitId: 'bimas-hindu',
            infoSectionId: 'struktur-organisasi',
          },
        ],
      },
      {
        label: 'Penyelenggara Kristen',
        infoUnitId: 'penyelenggara-kristen',
        children: [
          {
            label: 'Data Rumah Ibadah',
            infoUnitId: 'penyelenggara-kristen',
            infoSectionId: 'data-rumah-ibadah',
          },
          {
            label: 'Data Penyuluh',
            infoUnitId: 'penyelenggara-kristen',
            infoSectionId: 'data-penyuluh',
          },
          {
            label: 'Data fastor/Pendeta',
            infoUnitId: 'penyelenggara-kristen',
            infoSectionId: 'data-fastor-pendeta',
          },
          {
            label: 'Data Guru Agama Kristen',
            infoUnitId: 'penyelenggara-kristen',
            infoSectionId: 'data-guru-agama-kristen',
          },
          {
            label: 'Data Sekolah Kristen',
            infoUnitId: 'penyelenggara-kristen',
            infoSectionId: 'data-sekolah-kristen',
          },
          {
            label: 'Struktur organisasi',
            infoUnitId: 'penyelenggara-kristen',
            infoSectionId: 'struktur-organisasi',
          },
        ],
      },
      {
        label: 'Sekretariat Jenderal',
        infoUnitId: 'sekretariat-jenderal',
        children: [
          {
            label: 'Data Perkin',
            infoUnitId: 'sekretariat-jenderal',
            infoSectionId: 'data-perkin',
          },
          {
            label: 'Data POK',
            infoUnitId: 'sekretariat-jenderal',
            infoSectionId: 'data-pok',
          },
          {
            label: 'Struktur organisasi',
            infoUnitId: 'sekretariat-jenderal',
            infoSectionId: 'struktur-organisasi',
          },
        ],
      },
      { label: 'Daftar Informasi Publik', view: 'ppid', dividerBefore: true },
      { label: 'Jadwal & Kanal Lintas Iman', view: 'beranda' },
    ],
  },
  {
    id: 'zi',
    labelId: 'ZONA INTEGRITAS',
    labelEn: 'INTEGRITY',
    view: 'zona-integritas',
    children: [
      { label: '6 Pilar WBK / WBBM', view: 'zona-integritas', sectionId: 'pilar-zi' },
      { label: 'Maklumat Pelayanan', view: 'zona-integritas', sectionId: 'maklumat-pelayanan' },
    ],
  },
  {
    id: 'pengaduan',
    labelId: 'E-PENGADUAN',
    labelEn: 'COMPLAINTS',
    view: 'e-pengaduan',
    children: [
      {
        label: 'Formulir E-Pengaduan PTSP',
        view: 'e-pengaduan',
        sectionId: 'formulir-pengaduan',
      },
      {
        label: 'SPAN LAPOR (Integrasi Pusat)',
        view: 'e-pengaduan',
        sectionId: 'span-lapor',
      },
      {
        label: 'Survei Kepuasan Masyarakat (SKM)',
        view: 'e-pengaduan',
        sectionId: 'survei-skm',
      },
    ],
  },
  { id: 'kontak', labelId: 'KONTAK', labelEn: 'CONTACT', view: 'kontak' },
];

export function Navbar({
  activeView,
  onNavigate,
  onNavigateToHistory,
  onNavigateToKepegawaian,
  onSelectServiceUnit,
  onSelectInformasiUnit,
  lang,
  onChangeLang,
  isDark,
  onToggleDark,
  onOpenSearch,
}: NavbarProps) {
  const { user, openLoginModal } = useAuthRole();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [expandedMobileSub, setExpandedMobileSub] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isTransparentHeroHeader = activeView === 'beranda' && !scrolled && !mobileOpen;

  const handleSelect = (view: PageView, sectionId?: string) => {
    onNavigate(view);
    setMobileOpen(false);
    setOpenDropdown(null);
    setOpenSubDropdown(null);
    if (sectionId) {
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('kemenag:section-focus', { detail: sectionId }));
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  const handleSelectDropdownItem = (sub: NavDropdownItem) => {
    if (sub.infoUnitId) {
      onSelectInformasiUnit(sub.infoUnitId, sub.infoSectionId);
      setMobileOpen(false);
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      return;
    }
    if (sub.serviceUnitId) {
      onSelectServiceUnit(sub.serviceUnitId);
      setMobileOpen(false);
      setOpenDropdown(null);
      setOpenSubDropdown(null);
      return;
    }
    if (sub.view) {
      handleSelect(sub.view, sub.sectionId);
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isTransparentHeroHeader
          ? 'bg-gradient-to-b from-[#071226]/90 via-[#0b1d3d]/60 to-[#0b1d3d]/20 backdrop-blur-md border-b border-sky-300/20 text-white'
          : 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Top Row: Emblem + Title | Motto + Language + Theme Switch */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Official Emblem & Title */}
          <button
            type="button"
            onClick={() => handleSelect('beranda')}
            className="flex items-center gap-3 text-left shrink-0 group focus-visible:outline-2 focus-visible:outline-emerald-500 rounded-lg"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center p-1 border transition-colors ${
                isTransparentHeroHeader
                  ? 'bg-white/15 border-sky-300/30 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
            >
              <KemenagEmblem className="w-8 h-8" />
            </div>
            <div className="leading-tight">
              <p
                className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${
                  isTransparentHeroHeader
                    ? 'text-white'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                KEMENTERIAN AGAMA
              </p>
              <p
                className={`text-[11px] font-medium tracking-wider uppercase ${
                  isTransparentHeroHeader
                    ? 'text-sky-200'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                KABUPATEN MURUNG RAYA
              </p>
            </div>
          </button>

          {/* Right: Motto Acronym + Language + Dark/Light Toggle + Login / Bell */}
          <div className="hidden lg:flex items-center gap-3.5 shrink-0">
            <div className="hidden xl:flex items-center gap-3 text-xs">
              <span
                className={`font-black tracking-wider uppercase ${
                  isTransparentHeroHeader
                    ? 'text-sky-300'
                    : 'text-emerald-600 dark:text-emerald-500'
                }`}
              >
                PRIMA
              </span>
              <span
                className={
                  isTransparentHeroHeader
                    ? 'text-sky-50/95'
                    : 'text-slate-600 dark:text-slate-300'
                }
              >
                <strong className={isTransparentHeroHeader ? 'text-emerald-300' : 'text-emerald-700 dark:text-emerald-400'}>P</strong>rofesional,{' '}
                <strong className={isTransparentHeroHeader ? 'text-amber-300' : 'text-amber-600 dark:text-amber-400'}>R</strong>esponsif,{' '}
                <strong className={isTransparentHeroHeader ? 'text-emerald-300' : 'text-emerald-700 dark:text-emerald-400'}>I</strong>ntegritas,{' '}
                <strong className={isTransparentHeroHeader ? 'text-sky-300' : 'text-sky-700 dark:text-sky-400'}>M</strong>odern,{' '}
                <strong className={isTransparentHeroHeader ? 'text-rose-300' : 'text-rose-600 dark:text-rose-400'}>A</strong>kuntabel
              </span>
            </div>

            {/* ID / EN Toggle */}
            <div
              className={`flex items-center gap-1 rounded-full p-1 border ${
                isTransparentHeroHeader
                  ? 'bg-[#071226]/55 border-sky-300/25'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => onChangeLang('id')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-colors ${
                  lang === 'id'
                    ? 'bg-emerald-600 text-white'
                    : isTransparentHeroHeader
                    ? 'text-sky-200 hover:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-colors ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white'
                    : isTransparentHeroHeader
                    ? 'text-sky-200 hover:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                EN
              </button>
            </div>

            {/* Light / Dark Mode Switch */}
            <div
              className={`flex items-center gap-1 rounded-full p-1 border ${
                isTransparentHeroHeader
                  ? 'bg-[#071226]/55 border-sky-300/25'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleDark(false)}
                aria-label="Mode Terang"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  !isDark
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleDark(true)}
                aria-label="Mode Gelap"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isDark
                    ? 'bg-emerald-600 text-white'
                    : isTransparentHeroHeader
                    ? 'text-sky-200 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Login Button or Active Bell + Account Controls (Right of Theme Switch) */}
            {!user ? (
              <button
                type="button"
                onClick={() => openLoginModal('google')}
                className={`inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-extrabold tracking-wide transition-colors shadow-xs ${
                  isTransparentHeroHeader
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <HeaderAccountControls
                isTransparentHeroHeader={isTransparentHeroHeader}
                onNavigateToHistory={onNavigateToHistory}
                onNavigateToKepegawaian={onNavigateToKepegawaian}
              />
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {!user ? (
              <button
                type="button"
                onClick={() => openLoginModal('google')}
                className={`inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-xs font-extrabold transition-colors ${
                  isTransparentHeroHeader
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <HeaderAccountControls
                isTransparentHeroHeader={isTransparentHeroHeader}
                onNavigateToHistory={onNavigateToHistory}
                onNavigateToKepegawaian={onNavigateToKepegawaian}
              />
            )}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Cari layanan atau berita"
              className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                isTransparentHeroHeader
                  ? 'border-sky-300/25 bg-[#071226]/55 text-white hover:bg-[#0b1d3d]/70'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-bold ${
                isTransparentHeroHeader
                  ? 'border-sky-300/25 bg-[#071226]/55 text-white hover:bg-[#0b1d3d]/70'
                  : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white'
              }`}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Desktop Sub-Row Navigation (Exact Barito Utara Structure) */}
        <div
          className={`hidden lg:flex items-center justify-between gap-4 h-11 border-t ${
            isTransparentHeroHeader
              ? 'border-sky-300/15'
              : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <nav
            className="flex items-center justify-between flex-1 gap-2 xl:gap-3"
            aria-label="Navigasi Portal Kemenag Murung Raya"
          >
            {NAV_ITEMS.map((item) => {
              const label = lang === 'en' ? item.labelEn : item.labelId;
              const isActive =
                item.view === activeView &&
                (item.id === 'beranda' ||
                  item.id === 'ppid' ||
                  item.id === 'informasi' ||
                  item.id === 'pengaduan' ||
                  item.id === 'kontak' ||
                  item.id === activeView ||
                  (item.id === 'media' && (activeView === 'berita' || activeView === 'galeri')) ||
                  (item.id === 'zi' && activeView === 'zona-integritas'));

              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isOpen = openDropdown === item.id;

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => {
                    if (hasChildren) {
                      setOpenDropdown(item.id);
                      setOpenSubDropdown(null);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hasChildren) {
                      setOpenDropdown(null);
                      setOpenSubDropdown(null);
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (item.view) handleSelect(item.view);
                    }}
                    className={`group/nav menu-expand-btn relative px-2.5 py-2 my-0.5 rounded-lg inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase whitespace-nowrap shrink-0 ${
                      isActive
                        ? isTransparentHeroHeader
                          ? 'text-sky-300 bg-white/10'
                          : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/50'
                        : isTransparentHeroHeader
                        ? 'text-sky-50 hover:text-sky-300 hover:bg-white/10'
                        : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/70 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="menu-expand-label">{label}</span>
                    {hasChildren && (
                      <ChevronDown className="w-3 h-3 opacity-75 transition-transform duration-200 group-hover/nav:translate-y-0.5" />
                    )}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-2 bottom-0.5 h-0.5 rounded-full bg-emerald-500 transition-transform duration-200 origin-center ${
                        isActive
                          ? 'scale-x-100'
                          : 'scale-x-0 group-hover/nav:scale-x-100'
                      }`}
                    />
                  </button>

                  {hasChildren && isOpen && (
                    <div className="absolute left-0 top-full pt-1.5 w-72 z-50 animate-dropdown-reveal">
                      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 border-t-2 border-t-emerald-600 dark:border-t-emerald-500 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_18px_40px_-12px_rgba(6,78,59,0.22)] dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.65)] p-1.5 divide-y divide-slate-100 dark:divide-slate-800/80">
                        {item.children!.map((sub) => {
                          const hasNested = Boolean(sub.children && sub.children.length > 0);
                          const subKey = `${item.id}:${sub.label}`;
                          const isSubOpen = openSubDropdown === subKey;

                          return (
                            <div
                              key={sub.label}
                              className={`relative ${
                                sub.dividerBefore
                                  ? 'mt-1 pt-1 border-t-2 border-t-emerald-100 dark:border-t-slate-700/80'
                                  : ''
                              }`}
                              onMouseEnter={() =>
                                setOpenSubDropdown(hasNested ? subKey : null)
                              }
                            >
                              {sub.href ? (
                                <a
                                  href={sub.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    setOpenSubDropdown(null);
                                    setMobileOpen(false);
                                  }}
                                  className="group/item w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-50/30 dark:hover:from-emerald-950/60 dark:hover:to-slate-800/40 transition-all duration-200"
                                >
                                  <span className="flex items-center gap-2 min-w-0">
                                    <span
                                      aria-hidden="true"
                                      className="w-1 h-4 rounded-full bg-emerald-600 dark:bg-emerald-400 opacity-0 scale-y-0 group-hover/item:opacity-100 group-hover/item:scale-y-100 transition-all duration-200 shrink-0"
                                    />
                                    <span className="inline-block origin-left transition-all duration-200 ease-out group-hover/item:scale-[1.08] group-hover/item:translate-x-1 group-hover/item:font-bold group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-300">
                                      {sub.label}
                                    </span>
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-65 transition-all duration-200 group-hover/item:translate-x-0.5 group-hover/item:opacity-100 group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-300" />
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSelectDropdownItem(sub)}
                                  className={`group/item w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                    isSubOpen
                                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-50/40 dark:from-emerald-950/70 dark:to-slate-800/50 text-emerald-800 dark:text-emerald-300'
                                      : 'text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-50/30 dark:hover:from-emerald-950/60 dark:hover:to-slate-800/40'
                                  }`}
                                >
                                  <span className="flex items-center gap-2 min-w-0">
                                    <span
                                      aria-hidden="true"
                                      className={`w-1 h-4 rounded-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-200 shrink-0 ${
                                        isSubOpen
                                          ? 'opacity-100 scale-y-100'
                                          : 'opacity-0 scale-y-0 group-hover/item:opacity-100 group-hover/item:scale-y-100'
                                      }`}
                                    />
                                    <span
                                      className={`inline-block origin-left transition-all duration-200 ease-out ${
                                        isSubOpen
                                          ? 'scale-[1.08] translate-x-1 font-bold text-emerald-800 dark:text-emerald-300'
                                          : 'group-hover/item:scale-[1.08] group-hover/item:translate-x-1 group-hover/item:font-bold group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-300'
                                      }`}
                                    >
                                      {sub.label}
                                    </span>
                                  </span>
                                  {hasNested && (
                                    <ChevronRight
                                      className={`w-3.5 h-3.5 shrink-0 transition-all duration-200 ${
                                        isSubOpen
                                          ? 'translate-x-0.5 opacity-100 text-emerald-700 dark:text-emerald-300'
                                          : 'opacity-65 group-hover/item:translate-x-0.5 group-hover/item:opacity-100 group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-300'
                                      }`}
                                    />
                                  )}
                                </button>
                              )}

                              {hasNested && isSubOpen && (
                                <div className="absolute left-full top-0 pl-2 w-68 z-50 animate-dropdown-reveal">
                                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 border-t-2 border-t-emerald-600 dark:border-t-emerald-500 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_18px_40px_-12px_rgba(6,78,59,0.22)] dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.65)] overflow-hidden">
                                    <div className="px-4 py-2 bg-emerald-50/80 dark:bg-emerald-950/50 border-b border-emerald-100 dark:border-slate-800 flex items-center justify-between">
                                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                                        {sub.label}
                                      </span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <div className="p-1.5 divide-y divide-slate-100 dark:divide-slate-800/80">
                                      {sub.children!.map((nested) => (
                                        <button
                                          key={`${sub.label}-${nested.label}`}
                                          type="button"
                                          onClick={() => handleSelectDropdownItem(nested)}
                                          className="group/sub w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-50/30 dark:hover:from-emerald-950/60 dark:hover:to-slate-800/40 transition-all duration-200"
                                        >
                                          <span
                                            aria-hidden="true"
                                            className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover/sub:bg-emerald-600 dark:group-hover/sub:bg-emerald-400 group-hover/sub:scale-125 transition-all duration-200 shrink-0"
                                          />
                                          <span className="inline-block origin-left transition-all duration-200 ease-out group-hover/sub:scale-[1.08] group-hover/sub:translate-x-1 group-hover/sub:font-bold group-hover/sub:text-emerald-800 dark:group-hover/sub:text-emerald-300">
                                            {nested.label}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Pencarian cepat"
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isTransparentHeroHeader
                ? 'text-sky-50 hover:bg-white/10'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => onChangeLang('id')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  lang === 'id' ? 'bg-emerald-700 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  lang === 'en' ? 'bg-emerald-700 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                EN
              </button>
            </div>
            <button
              type="button"
              onClick={() => onToggleDark(!isDark)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
          </div>

          {NAV_ITEMS.map((item) => {
            const isMobileItemActive =
              item.view === activeView &&
              (item.id === 'beranda' ||
                item.id === 'ppid' ||
                item.id === 'informasi' ||
                item.id === 'pengaduan' ||
                item.id === 'kontak' ||
                item.id === activeView ||
                (item.id === 'media' && (activeView === 'berita' || activeView === 'galeri')) ||
                (item.id === 'zi' && activeView === 'zona-integritas'));

            return (
              <div key={item.id} className="space-y-1 border-b border-slate-100 dark:border-slate-800/70 pb-1 last:border-b-0">
                <button
                  type="button"
                  onClick={() => item.view && handleSelect(item.view)}
                  className={`menu-expand-btn-left w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    isMobileItemActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50/70 dark:hover:bg-slate-900 hover:text-emerald-800 dark:hover:text-emerald-300'
                  }`}
                >
                  <span className="menu-expand-label">{lang === 'en' ? item.labelEn : item.labelId}</span>
                </button>
                {(item.id === 'informasi' || item.id === 'zi' || item.id === 'pengaduan') &&
                  item.children && (
                    <div className="pl-3 ml-2 border-l-2 border-emerald-200/80 dark:border-emerald-800/70 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {item.children.map((sub) => {
                        const hasNested = Boolean(sub.children && sub.children.length > 0);
                        const mobileSubKey = `${item.id}:${sub.label}`;
                        const isExpanded = expandedMobileSub === mobileSubKey;

                        if (sub.href) {
                          return (
                            <a
                              key={sub.label}
                              href={sub.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setMobileOpen(false)}
                              className="group/item w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-900 transition-colors"
                            >
                              <span className="inline-block origin-left transition-transform duration-200 group-hover/item:scale-[1.06] group-hover/item:translate-x-1 group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-300">
                                {sub.label}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            </a>
                          );
                        }

                        if (hasNested) {
                          return (
                            <div key={sub.label} className="py-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSelectDropdownItem(sub)}
                                  className="group/item flex-1 text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                  <span className="inline-block origin-left transition-transform duration-200 group-hover/item:scale-[1.06] group-hover/item:translate-x-1 group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-300">
                                    {sub.label}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Tampilkan submenu ${sub.label}`}
                                  onClick={() =>
                                    setExpandedMobileSub((prev) =>
                                      prev === mobileSubKey ? null : mobileSubKey
                                    )
                                  }
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${
                                      isExpanded ? 'rotate-180 text-emerald-700' : ''
                                    }`}
                                  />
                                </button>
                              </div>
                              {isExpanded && (
                                <div className="pl-3 ml-3 border-l border-emerald-200 dark:border-emerald-800 divide-y divide-slate-100 dark:divide-slate-800/70">
                                  {sub.children!.map((nested) => (
                                    <button
                                      key={`${sub.label}-${nested.label}`}
                                      type="button"
                                      onClick={() => handleSelectDropdownItem(nested)}
                                      className="group/sub w-full text-left px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-900 transition-colors"
                                    >
                                      <span className="inline-block origin-left transition-transform duration-200 group-hover/sub:scale-[1.06] group-hover/sub:translate-x-1 group-hover/sub:text-emerald-800 dark:group-hover/sub:text-emerald-300">
                                        {nested.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <button
                            key={sub.label}
                            type="button"
                            onClick={() => handleSelectDropdownItem(sub)}
                            className="group/item w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-900 transition-colors"
                          >
                            <span className="inline-block origin-left transition-transform duration-200 group-hover/item:scale-[1.06] group-hover/item:translate-x-1 group-hover/item:text-emerald-800 dark:group-hover/item:text-emerald-300">
                              {sub.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}
