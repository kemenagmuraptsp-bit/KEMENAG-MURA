import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, LayoutGrid, X } from 'lucide-react';
import {
  PageView,
  ServiceUnit,
  SubService,
  NewsArticle,
  GalleryItem,
  PTSPTicket,
  ComplaintSubmission,
} from '@/src/types';
import { NEWS_ARTICLES, SERVICE_UNITS } from '@/src/data/kemenagData';
import { INFORMASI_UNITS, InformasiUnitId } from '@/src/data/informasiData';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { BerandaView } from '@/src/components/BerandaView';
import { ServiceSidebar } from '@/src/components/ServiceSidebar';
import { KemenagEmblem } from '@/src/components/KemenagEmblem';
import { AuthRoleProvider, useAuthRole } from '@/src/context/AuthRoleContext';
import { LoginModal } from '@/src/components/LoginModal';
import { SuperAdminModal } from '@/src/components/SuperAdminModal';
import { OperatorModal } from '@/src/components/OperatorModal';
import { InformasiUnitView } from '@/src/components/InformasiUnitView';
import {
  ProfilView,
  LayananView,
  BeritaView,
  GaleriView,
  PPIDView,
  ZonaIntegritasView,
  PengaduanView,
  KontakView,
} from '@/src/components/SubViews';
import {
  ServiceDetailModal,
  ArticleReaderModal,
  GalleryLightboxModal,
  GlobalSearchModal,
} from '@/src/components/Modals';
import {
  DokumenPentingView,
  SopPtspView,
  DiagramAlurPtspView,
  PanduanPtspView,
  InovasiMuraView,
} from '@/src/components/PtspGuideAndInfoViews';

const STORAGE_TICKETS_KEY = 'kemenag_mura_ptsp_tickets_v1';
const STORAGE_COMPLAINTS_KEY = 'kemenag_mura_complaints_v1';
const STORAGE_REACTIONS_KEY = 'kemenag_mura_reactions_v1';

const VIEW_TITLES: Record<PageView, string> = {
  beranda: 'Beranda | Kemenag Kabupaten Murung Raya',
  profil: 'Profil Kantor | Kemenag Kabupaten Murung Raya',
  layanan: 'Layanan PTSP | Kemenag Kabupaten Murung Raya',
  informasi: 'Informasi Satuan Kerja | Kemenag Kabupaten Murung Raya',
  berita: 'Berita & Media Center | Kemenag Kabupaten Murung Raya',
  galeri: 'Galeri Dokumentasi | Kemenag Kabupaten Murung Raya',
  ppid: 'PPID & Informasi Publik | Kemenag Kabupaten Murung Raya',
  'zona-integritas': 'Zona Integritas | Kemenag Kabupaten Murung Raya',
  'e-pengaduan': 'E-Pengaduan | Kemenag Kabupaten Murung Raya',
  kontak: 'Kontak & KUA | Kemenag Kabupaten Murung Raya',
  'dokumen-penting': 'Dokumen Penting | Kemenag Kabupaten Murung Raya',
  'sop-ptsp': 'SOP Layanan PTSP | Kemenag Kabupaten Murung Raya',
  'diagram-alur-ptsp': 'Diagram Alur Data PTSP | Kemenag Kabupaten Murung Raya',
  'panduan-ptsp': 'Panduan Layanan PTSP | Kemenag Kabupaten Murung Raya',
  'inovasi-mura': 'Inovasi Kemenag Murung Raya | Kemenag Kabupaten Murung Raya',
};

type PendingServiceAction =
  | { type: 'view-layanan' }
  | { type: 'open-sidebar' }
  | { type: 'select-unit'; unit: ServiceUnit }
  | { type: 'select-unit-id'; unitId: string }
  | { type: 'select-sub'; unit: ServiceUnit; sub: SubService };

const DEFAULT_SERVICE_LOGIN_PROMPT =
  'Untuk mengakses layanan PTSP Kementerian Agama Kab. Murung Raya, silakan login terlebih dahulu melalui menu Akun Masyarakat (Google/Email) atau Login Pegawai (NIP).';

const KEPEGAWAIAN_LOGIN_PROMPT =
  'Menu Layanan Kepegawaian khusus untuk Pegawai Kemenag. Silakan masuk melalui tab Login Pegawai (NIP), atau gunakan Akun Masyarakat untuk layanan publik Bidang A–E.';

function LiveGlobalSearchModal({
  open,
  services,
  onClose,
  onSelectService,
  onSelectArticle,
}: {
  open: boolean;
  services: ServiceUnit[];
  onClose: () => void;
  onSelectService: (u: ServiceUnit) => void;
  onSelectArticle: (a: NewsArticle) => void;
}) {
  const { newsArticles, isMasyarakatLogin } = useAuthRole();
  const visibleServices = isMasyarakatLogin
    ? services.filter((u) => u.id !== 'kepegawaian')
    : services;
  return (
    <GlobalSearchModal
      open={open}
      services={visibleServices}
      articles={newsArticles}
      onClose={onClose}
      onSelectService={onSelectService}
      onSelectArticle={onSelectArticle}
    />
  );
}

function AppContent() {
  const {
    user,
    isEligibleUser,
    authLoading,
    isAdmin,
    isOperatorPtsp,
    isOperatorSeksi,
    isPimpinan,
    isMasyarakatLogin,
    loginModalOpen,
    openLoginModal,
    adminConsoleTriggerCount,
    operatorConsoleTriggerCount,
    serviceCatalogRedirectCount,
  } = useAuthRole();

  const isAuthenticatedForService = Boolean(user && isEligibleUser);
  const [pendingServiceAction, setPendingServiceAction] = useState<PendingServiceAction | null>(
    null
  );
  const lastRedirectCountRef = useRef(serviceCatalogRedirectCount);
  const [activeView, setActiveView] = useState<PageView>('beranda');
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState<boolean>(false);

  const [activeServiceUnitId, setActiveServiceUnitId] = useState<string>(SERVICE_UNITS[0].id);
  const [activeSubServiceId, setActiveSubServiceId] = useState<string>(
    SERVICE_UNITS[0].subServices[0].id
  );
  const [activeInfoUnitId, setActiveInfoUnitId] = useState<InformasiUnitId>(
    INFORMASI_UNITS[0].id
  );
  const [activeInfoSectionId, setActiveInfoSectionId] = useState<string>(
    INFORMASI_UNITS[0].sections[0].id
  );

  const [selectedService, setSelectedService] = useState<ServiceUnit | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);

  const [ptspTickets, setPtspTickets] = useState<PTSPTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TICKETS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [complaints, setComplaints] = useState<ComplaintSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPLAINTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [articleReactions, setArticleReactions] = useState<
    Record<string, { bermanfaat: number; informatif: number; inspiratif: number }>
  >(() => {
    const initial: Record<string, { bermanfaat: number; informatif: number; inspiratif: number }> = {};
    NEWS_ARTICLES.forEach((a) => {
      initial[a.id] = { ...a.reactions };
    });
    return initial;
  });

  const [userReacted, setUserReacted] = useState<Record<string, string | null>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REACTIONS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    document.title = VIEW_TITLES[activeView];
  }, [activeView]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const requireServiceAuth = (
    action: PendingServiceAction,
    preferredTab: 'google' | 'pegawai' = 'google',
    promptMessage = DEFAULT_SERVICE_LOGIN_PROMPT
  ): boolean => {
    if (isAuthenticatedForService) {
      return true;
    }
    setPendingServiceAction(action);
    setServiceSidebarOpen(false);
    openLoginModal(preferredTab, promptMessage);
    return false;
  };

  const handleNavigate = (view: PageView) => {
    setActiveView(view);
    setServiceSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenServiceSidebar = () => {
    setServiceSidebarOpen(true);
  };

  const handleSelectServiceItem = (unit: ServiceUnit, sub: SubService) => {
    setActiveServiceUnitId(unit.id);
    setActiveSubServiceId(sub.id);
    setServiceSidebarOpen(false);
    if (activeView !== 'layanan') {
      setActiveView('layanan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenServiceFromBeranda = (unit: ServiceUnit) => {
    setActiveServiceUnitId(unit.id);
    setActiveSubServiceId(unit.subServices[0].id);
    setServiceSidebarOpen(false);
    setActiveView('layanan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToKatalogLayanan = () => {
    setServiceSidebarOpen(false);
    setActiveView('beranda');
    window.setTimeout(() => {
      const katalogEl = document.getElementById('katalog-ptsp');
      if (katalogEl) {
        katalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  const handleNavigateToHistory = () => {
    if (!requireServiceAuth({ type: 'view-layanan' }, 'google')) {
      return;
    }
    setServiceSidebarOpen(false);
    setActiveView('layanan');
    window.setTimeout(() => {
      const el = document.getElementById('riwayat-layanan');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 80);
  };

  const handleSelectServiceUnitById = (unitId: string) => {
    const targetUnit = SERVICE_UNITS.find((u) => u.id === unitId);
    if (targetUnit) {
      setActiveServiceUnitId(targetUnit.id);
      setActiveSubServiceId(targetUnit.subServices[0]?.id || '');
    }
    setServiceSidebarOpen(false);
    setActiveView('layanan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInformasiUnit = (unitId: InformasiUnitId, sectionId?: string) => {
    const targetUnit = INFORMASI_UNITS.find((u) => u.id === unitId) || INFORMASI_UNITS[0];
    setActiveInfoUnitId(targetUnit.id);
    const targetSection =
      (sectionId && targetUnit.sections.find((s) => s.id === sectionId)) ||
      targetUnit.sections[0];
    setActiveInfoSectionId(targetSection.id);
    setServiceSidebarOpen(false);
    setActiveView('informasi');
    if (sectionId) {
      window.setTimeout(() => {
        const panel = document.getElementById('seksi-data-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 110);
    } else {
      window.setTimeout(() => {
        const menuDataSeksi = document.getElementById('menu-data-seksi');
        if (menuDataSeksi) {
          menuDataSeksi.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 110);
    }
  };

  const handleNavigateToKepegawaian = () => {
    handleSelectServiceUnitById('kepegawaian');
  };

  const handleOpenAdminConsole = () => {
    setServiceSidebarOpen(false);
    setActiveView('layanan');
    window.setTimeout(() => {
      const el = document.getElementById('admin-console');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 90);
  };

  const handleOpenOperatorConsole = () => {
    setServiceSidebarOpen(false);
    setActiveView('layanan');
    window.setTimeout(() => {
      const el = document.getElementById('operator-console');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 90);
  };

  useEffect(() => {
    if (isAdmin && adminConsoleTriggerCount > 0) {
      handleOpenAdminConsole();
    }
  }, [isAdmin, adminConsoleTriggerCount]);

  useEffect(() => {
    if (
      !isAdmin &&
      (isOperatorPtsp || isOperatorSeksi || isPimpinan) &&
      operatorConsoleTriggerCount > 0
    ) {
      handleOpenOperatorConsole();
    }
  }, [isAdmin, isOperatorPtsp, isOperatorSeksi, isPimpinan, operatorConsoleTriggerCount]);

  useEffect(() => {
    if (isMasyarakatLogin) {
      if (activeServiceUnitId === 'kepegawaian') {
        setActiveServiceUnitId(SERVICE_UNITS[0].id);
        setActiveSubServiceId(SERVICE_UNITS[0].subServices[0].id);
      }
      setSelectedService((prev) => (prev?.id === 'kepegawaian' ? null : prev));
    }
  }, [isMasyarakatLogin, activeServiceUnitId]);

  useEffect(() => {
    if (!loginModalOpen && !isAuthenticatedForService && !authLoading && pendingServiceAction) {
      setPendingServiceAction(null);
    }
  }, [loginModalOpen, isAuthenticatedForService, authLoading, pendingServiceAction]);

  useEffect(() => {
    if (!isAuthenticatedForService) return;

    if (pendingServiceAction) {
      const action = pendingServiceAction;
      setPendingServiceAction(null);
      lastRedirectCountRef.current = serviceCatalogRedirectCount;

      if (action.type === 'open-sidebar') {
        setServiceSidebarOpen(true);
        return;
      }
      if (action.type === 'view-layanan') {
        setServiceSidebarOpen(false);
        setActiveView('layanan');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (action.type === 'select-unit') {
        const targetUnit =
          isMasyarakatLogin && action.unit.id === 'kepegawaian'
            ? SERVICE_UNITS[0]
            : action.unit;
        setActiveServiceUnitId(targetUnit.id);
        setActiveSubServiceId(targetUnit.subServices[0]?.id || '');
        setServiceSidebarOpen(false);
        setActiveView('layanan');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (action.type === 'select-unit-id') {
        const resolvedId =
          isMasyarakatLogin && action.unitId === 'kepegawaian'
            ? SERVICE_UNITS[0].id
            : action.unitId;
        const targetUnit =
          SERVICE_UNITS.find((u) => u.id === resolvedId) || SERVICE_UNITS[0];
        setActiveServiceUnitId(targetUnit.id);
        setActiveSubServiceId(targetUnit.subServices[0]?.id || '');
        setServiceSidebarOpen(false);
        setActiveView('layanan');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (action.type === 'select-sub') {
        const targetUnit =
          isMasyarakatLogin && action.unit.id === 'kepegawaian'
            ? SERVICE_UNITS[0]
            : action.unit;
        const targetSub =
          targetUnit.id === action.unit.id ? action.sub : targetUnit.subServices[0];
        setActiveServiceUnitId(targetUnit.id);
        setActiveSubServiceId(targetSub.id);
        setServiceSidebarOpen(false);
        setActiveView('layanan');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (
      serviceCatalogRedirectCount > lastRedirectCountRef.current &&
      activeView !== 'e-pengaduan' &&
      activeView !== 'layanan'
    ) {
      lastRedirectCountRef.current = serviceCatalogRedirectCount;
      handleBackToKatalogLayanan();
    } else {
      lastRedirectCountRef.current = serviceCatalogRedirectCount;
    }
  }, [
    isAuthenticatedForService,
    pendingServiceAction,
    serviceCatalogRedirectCount,
    isMasyarakatLogin,
    activeView,
  ]);

  const handleTicketCreated = (ticket: PTSPTicket) => {
    setPtspTickets((prev) => {
      const updated = [ticket, ...prev];
      try {
        localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      return updated;
    });
  };

  const handleAddComplaint = (complaint: ComplaintSubmission) => {
    setComplaints((prev) => {
      const updated = [complaint, ...prev];
      try {
        localStorage.setItem(STORAGE_COMPLAINTS_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      return updated;
    });
  };

  const handleReact = (
    articleId: string,
    type: 'bermanfaat' | 'informatif' | 'inspiratif'
  ) => {
    const prevType = userReacted[articleId] as
      | 'bermanfaat'
      | 'informatif'
      | 'inspiratif'
      | null
      | undefined;

    setArticleReactions((prev) => {
      const current = prev[articleId] || { bermanfaat: 0, informatif: 0, inspiratif: 0 };
      const next = { ...current };
      if (prevType === type) {
        next[type] = Math.max(0, next[type] - 1);
      } else {
        if (prevType) {
          next[prevType] = Math.max(0, next[prevType] - 1);
        }
        next[type] = next[type] + 1;
      }
      return { ...prev, [articleId]: next };
    });

    setUserReacted((prev) => {
      const next = { ...prev, [articleId]: prevType === type ? null : type };
      try {
        localStorage.setItem(STORAGE_REACTIONS_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onNavigateToHistory={handleNavigateToHistory}
        onNavigateToKepegawaian={handleNavigateToKepegawaian}
        onSelectServiceUnit={handleSelectServiceUnitById}
        onSelectInformasiUnit={handleSelectInformasiUnit}
        lang={lang}
        onChangeLang={setLang}
        isDark={isDark}
        onToggleDark={setIsDark}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Desktop/Tablet Left-Edge Floating Trigger: Sidebar Khusus Layanan */}
      <div className="hidden md:block fixed left-0 top-1/2 -translate-y-1/2 z-30">
        <button
          type="button"
          onClick={handleOpenServiceSidebar}
          aria-label="Buka Sidebar Menu Layanan PTSP"
          title="Menu Layanan PTSP Kemenag Murung Raya"
          className="animate-left-ptsp-pulse px-2.5 py-3.5 rounded-r-2xl bg-emerald-800 hover:bg-emerald-700 text-white flex flex-col items-center gap-1.5 shadow-xl border border-l-0 border-emerald-600/50 transition-all hover:pl-3.5"
        >
          <LayoutGrid className="w-4 h-4 text-emerald-200" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
            Layanan PTSP
          </span>
        </button>
      </div>

      {/* Mobile Thumb-Zone Quick Trigger: Layanan PTSP (compact corner pill) */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <button
          type="button"
          onClick={handleOpenServiceSidebar}
          aria-label="Buka Menu Layanan PTSP"
          className="animate-catalog-card-pulse h-11 px-4 rounded-full bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white flex items-center gap-2 shadow-xl border border-emerald-500/40 text-xs font-extrabold uppercase tracking-wider transition-all"
        >
          <LayoutGrid className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>Layanan PTSP</span>
        </button>
      </div>

      {/* Desktop/Tablet Right-Edge Floating Sidebar Button: Kembali ke Katalog Layanan */}
      {activeView === 'layanan' && (
        <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-30">
          <button
            type="button"
            onClick={handleBackToKatalogLayanan}
            aria-label="Kembali ke Katalog Layanan PTSP"
            title="Kembali ke Katalog Layanan PTSP Terpadu"
            className="px-2.5 py-3.5 rounded-l-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex flex-col items-center gap-2 shadow-xl border-2 border-r-0 border-yellow-600 transition-all hover:pr-3.5"
          >
            <ArrowLeft
              strokeWidth={2.75}
              className="w-4 h-4 text-slate-950 animate-arrow-nudge shrink-0"
            />
            <span className="text-[10px] font-black uppercase tracking-widest [writing-mode:vertical-rl] animate-text-blink">
              Kembali ke Katalog Layanan
            </span>
            <ArrowLeft
              strokeWidth={2.75}
              className="w-4 h-4 text-slate-950 animate-arrow-nudge shrink-0"
            />
          </button>
        </div>
      )}

      {/* Slide-out Left Sidebar Drawer Khusus Layanan (Accessible from Beranda & Any View) */}
      {serviceSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex justify-start"
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar Menu Layanan PTSP Kemenag Murung Raya"
        >
          <div className="w-[88vw] max-w-[390px] bg-slate-50 dark:bg-slate-950 h-full overflow-y-auto p-3.5 space-y-3 shadow-2xl border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-2 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0">
                  <KemenagEmblem className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    Kemenag Murung Raya
                  </p>
                  <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                    Menu Layanan PTSP
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setServiceSidebarOpen(false)}
                aria-label="Tutup sidebar layanan"
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ServiceSidebar
              selectedUnitId={activeServiceUnitId}
              selectedSubId={activeSubServiceId}
              onSelect={handleSelectServiceItem}
              onSelectUnit={handleOpenServiceFromBeranda}
            />
          </div>
          <div
            className="flex-1"
            onClick={() => setServiceSidebarOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      <main className="flex-1">
        {activeView === 'beranda' && (
          <BerandaView
            lang={lang}
            onNavigate={handleNavigate}
            onSelectService={handleOpenServiceFromBeranda}
            onOpenServiceSidebar={handleOpenServiceSidebar}
            onSelectArticle={setSelectedArticle}
            onSelectGallery={setSelectedGallery}
          />
        )}
        {activeView === 'profil' && <ProfilView onNavigate={handleNavigate} />}
        {activeView === 'layanan' && (
          <LayananView
            tickets={ptspTickets}
            selectedUnitId={activeServiceUnitId}
            selectedSubId={activeSubServiceId}
            onSelectUnitId={handleSelectServiceUnitById}
            onOpenServiceSidebar={handleOpenServiceSidebar}
            onTicketCreated={handleTicketCreated}
            onBackHome={() => handleNavigate('beranda')}
            onBackToKatalog={handleBackToKatalogLayanan}
          />
        )}
        {activeView === 'informasi' && (
          <InformasiUnitView
            selectedUnitId={activeInfoUnitId}
            selectedSectionId={activeInfoSectionId}
            onSelectUnit={handleSelectInformasiUnit}
            onNavigate={handleNavigate}
          />
        )}
        {activeView === 'berita' && <BeritaView onSelectArticle={setSelectedArticle} />}
        {activeView === 'galeri' && <GaleriView onSelectGallery={setSelectedGallery} />}
        {activeView === 'ppid' && <PPIDView onNavigate={handleNavigate} />}
        {activeView === 'zona-integritas' && (
          <ZonaIntegritasView onNavigate={handleNavigate} />
        )}
        {activeView === 'e-pengaduan' && (
          <PengaduanView complaints={complaints} onAddComplaint={handleAddComplaint} />
        )}
        {activeView === 'kontak' && <KontakView />}
        {activeView === 'dokumen-penting' && (
          <DokumenPentingView
            onNavigate={handleNavigate}
            onBackToKatalog={handleBackToKatalogLayanan}
          />
        )}
        {activeView === 'sop-ptsp' && (
          <SopPtspView
            onNavigate={handleNavigate}
            onSelectService={handleSelectServiceUnitById}
          />
        )}
        {activeView === 'diagram-alur-ptsp' && (
          <DiagramAlurPtspView
            onNavigate={handleNavigate}
            onOpenServiceSidebar={handleOpenServiceSidebar}
          />
        )}
        {activeView === 'panduan-ptsp' && (
          <PanduanPtspView
            onNavigate={handleNavigate}
            onOpenServiceSidebar={handleOpenServiceSidebar}
            onBackToKatalog={handleBackToKatalogLayanan}
          />
        )}
        {activeView === 'inovasi-mura' && (
          <InovasiMuraView
            onNavigate={handleNavigate}
            onBackToKatalog={handleBackToKatalogLayanan}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <ServiceDetailModal
        unit={selectedService}
        onClose={() => setSelectedService(null)}
        onTicketCreated={handleTicketCreated}
      />
      <ArticleReaderModal
        article={selectedArticle}
        reactions={articleReactions}
        userReacted={userReacted}
        onReact={handleReact}
        onClose={() => setSelectedArticle(null)}
      />
      <GalleryLightboxModal
        item={selectedGallery}
        onClose={() => setSelectedGallery(null)}
      />
      <LiveGlobalSearchModal
        open={searchOpen}
        services={SERVICE_UNITS}
        onClose={() => setSearchOpen(false)}
        onSelectService={handleOpenServiceFromBeranda}
        onSelectArticle={setSelectedArticle}
      />
      <LoginModal />
      <SuperAdminModal />
      <OperatorModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthRoleProvider>
      <AppContent />
    </AuthRoleProvider>
  );
}
