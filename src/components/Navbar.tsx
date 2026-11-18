import { useEffect, useState } from 'react';
import {
  ChevronDown,
  LogIn,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { PageView } from '@/src/types';
import { KemenagEmblem } from '@/src/components/KemenagEmblem';
import { useAuthRole } from '@/src/context/AuthRoleContext';
import { HeaderAccountControls } from '@/src/components/NotificationBell';

interface NavbarProps {
  activeView: PageView;
  onNavigate: (view: PageView) => void;
  onNavigateToHistory: () => void;
  onNavigateToKepegawaian: () => void;
  lang: 'id' | 'en';
  onChangeLang: (lang: 'id' | 'en') => void;
  isDark: boolean;
  onToggleDark: (dark: boolean) => void;
  onOpenSearch: () => void;
}

interface NavDropdownItem {
  label: string;
  view: PageView;
  sectionId?: string;
}

interface NavItemConfig {
  id: string;
  labelId: string;
  labelEn: string;
  view?: PageView;
  children?: NavDropdownItem[];
}

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
    view: 'ppid',
    children: [
      { label: 'Daftar Informasi Publik', view: 'ppid' },
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
  { id: 'pengaduan', labelId: 'E-PENGADUAN', labelEn: 'COMPLAINTS', view: 'e-pengaduan' },
  { id: 'kontak', labelId: 'KONTAK', labelEn: 'CONTACT', view: 'kontak' },
];

export function Navbar({
  activeView,
  onNavigate,
  onNavigateToHistory,
  onNavigateToKepegawaian,
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
    if (sectionId) {
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isTransparentHeroHeader
          ? 'bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent text-white'
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
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                isTransparentHeroHeader
                  ? 'bg-white/10 border-white/15'
                  : 'bg-emerald-950 border-emerald-800'
              }`}
            >
              <KemenagEmblem className="w-7 h-7" />
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
                    ? 'text-slate-300'
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
              <span className="font-black tracking-wider text-emerald-500 uppercase">
                PRIMA
              </span>
              <span
                className={
                  isTransparentHeroHeader
                    ? 'text-slate-200/90'
                    : 'text-slate-600 dark:text-slate-300'
                }
              >
                <strong className="text-emerald-400">P</strong>rofesional,{' '}
                <strong className="text-amber-400">R</strong>esponsif,{' '}
                <strong className="text-emerald-400">I</strong>ntegritas,{' '}
                <strong className="text-sky-400">M</strong>odern,{' '}
                <strong className="text-rose-400">A</strong>kuntabel
              </span>
            </div>

            {/* ID / EN Toggle */}
            <div
              className={`flex items-center gap-1 rounded-full p-1 border ${
                isTransparentHeroHeader
                  ? 'bg-white/10 border-white/15'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => onChangeLang('id')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-colors ${
                  lang === 'id'
                    ? 'bg-emerald-700 text-white'
                    : isTransparentHeroHeader
                    ? 'text-slate-300 hover:text-white'
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
                    ? 'bg-emerald-700 text-white'
                    : isTransparentHeroHeader
                    ? 'text-slate-300 hover:text-white'
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
                  ? 'bg-white/10 border-white/15'
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
                    ? 'text-slate-300 hover:text-white'
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
                  ? 'border-white/20 text-white hover:bg-white/10'
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
                  ? 'border-white/20 text-white hover:bg-white/10'
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
              ? 'border-white/10'
              : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <nav
            className="flex items-center justify-between flex-1 gap-3"
            aria-label="Navigasi Portal Kemenag Murung Raya"
          >
            {NAV_ITEMS.map((item) => {
              const label = lang === 'en' ? item.labelEn : item.labelId;
              const isActive =
                item.view === activeView &&
                (item.id === 'beranda' ||
                  item.id === 'ppid' ||
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
                  onMouseEnter={() => hasChildren && setOpenDropdown(item.id)}
                  onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (item.view) handleSelect(item.view);
                    }}
                    className={`relative py-2.5 inline-flex items-center gap-1 text-[11px] font-extrabold tracking-wider uppercase whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? isTransparentHeroHeader
                          ? 'text-emerald-300'
                          : 'text-emerald-700 dark:text-emerald-400'
                        : isTransparentHeroHeader
                        ? 'text-slate-100 hover:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400'
                    }`}
                  >
                    <span>{label}</span>
                    {hasChildren && <ChevronDown className="w-3 h-3 opacity-75" />}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-400"
                      />
                    )}
                  </button>

                  {hasChildren && isOpen && (
                    <div className="absolute left-0 top-full pt-1 w-56 z-50">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1.5">
                        {item.children!.map((sub) => (
                          <button
                            key={sub.label}
                            type="button"
                            onClick={() => handleSelect(sub.view, sub.sectionId)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
                          >
                            {sub.label}
                          </button>
                        ))}
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
                ? 'text-slate-100 hover:bg-white/10'
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

          {NAV_ITEMS.map((item) => (
            <div key={item.id} className="space-y-1">
              <button
                type="button"
                onClick={() => item.view && handleSelect(item.view)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  item.view === activeView
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {lang === 'en' ? item.labelEn : item.labelId}
              </button>
              {item.id === 'zi' && item.children && (
                <div className="pl-4 space-y-1">
                  {item.children.map((sub) => (
                    <button
                      key={sub.label}
                      type="button"
                      onClick={() => handleSelect(sub.view, sub.sectionId)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-900"
                    >
                      · {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
