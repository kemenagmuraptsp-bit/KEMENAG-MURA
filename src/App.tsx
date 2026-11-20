import { useEffect, useState } from 'react';
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
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { BerandaView } from '@/src/components/BerandaView';
import { ServiceSidebar } from '@/src/components/ServiceSidebar';
import { KemenagEmblem } from '@/src/components/KemenagEmblem';
import { AuthRoleProvider, useAuthRole } from '@/src/context/AuthRoleContext';
import { LoginModal } from '@/src/components/LoginModal';
import { SuperAdminModal } from '@/src/components/SuperAdminModal';
import { OperatorModal } from '@/src/components/OperatorModal';
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

const STORAGE_TICKETS_KEY = 'kemenag_mura_ptsp_tickets_v1';
const STORAGE_COMPLAINTS_KEY = 'kemenag_mura_complaints_v1';
const STORAGE_REACTIONS_KEY = 'kemenag_mura_reactions_v1';

const VIEW_TITLES: Record<PageView, string> = {
  beranda: 'Beranda | Kemenag Kabupaten Murung Raya',
  profil: 'Profil Kantor | Kemenag Kabupaten Murung Raya',
  layanan: 'Layanan PTSP | Kemenag Kabupaten Murung Raya',
  berita: 'Berita & Media Center | Kemenag Kabupaten Murung Raya',
  galeri: 'Galeri Dokumentasi | Kemenag Kabupaten Murung Raya',
  ppid: 'PPID & Informasi Publik | Kemenag Kabupaten Murung Raya',
  'zona-integritas': 'Zona Integritas | Kemenag Kabupaten Murung Raya',
  'e-pengaduan': 'E-Pengaduan | Kemenag Kabupaten Murung Raya',
  kontak: 'Kontak & KUA | Kemenag Kabupaten Murung Raya',
};

function SuperAdminNavigationWatcher({ onTrigger }: { onTrigger: () => void }) {
  const { isAdmin, adminConsoleTriggerCount } = useAuthRole();
  useEffect(() => {
    if (isAdmin && adminConsoleTriggerCount > 0) {
      onTrigger();
    }
  }, [isAdmin, adminConsoleTriggerCount]);
  return null;
}

function OperatorNavigationWatcher({ onTrigger }: { onTrigger: () => void }) {
  const { isAdmin, isOperatorPtsp, isOperatorSeksi, isPimpinan, operatorConsoleTriggerCount } =
    useAuthRole();
  useEffect(() => {
    if (
      !isAdmin &&
      (isOperatorPtsp || isOperatorSeksi || isPimpinan) &&
      operatorConsoleTriggerCount > 0
    ) {
      onTrigger();
    }
  }, [isAdmin, isOperatorPtsp, isOperatorSeksi, isPimpinan, operatorConsoleTriggerCount]);
  return null;
}

function ServiceCatalogRedirectWatcher({
  onRedirect,
  onResetKepegawaianSelection,
}: {
  onRedirect: () => void;
  onResetKepegawaianSelection: () => void;
}) {
  const { serviceCatalogRedirectCount, isMasyarakatLogin } = useAuthRole();
  useEffect(() => {
    if (serviceCatalogRedirectCount > 0) {
      onRedirect();
    }
  }, [serviceCatalogRedirectCount]);

  useEffect(() => {
    if (isMasyarakatLogin) {
      onResetKepegawaianSelection();
    }
  }, [isMasyarakatLogin]);

  return null;
}

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

export default function App() {
  const [activeView, setActiveView] = useState<PageView>('beranda');
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState<boolean>(false);

  const [activeServiceUnitId, setActiveServiceUnitId] = useState<string>(SERVICE_UNITS[0].id);
  const [activeSubServiceId, setActiveSubServiceId] = useState<string>(
    SERVICE_UNITS[0].subServices[0].id
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

  const handleNavigate = (view: PageView) => {
    setActiveView(view);
    setServiceSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleNavigateToKepegawaian = () => {
    const kepUnit = SERVICE_UNITS.find((u) => u.id === 'kepegawaian');
    if (kepUnit) {
      setActiveServiceUnitId(kepUnit.id);
      setActiveSubServiceId(kepUnit.subServices[0]?.id || '');
    }
    setServiceSidebarOpen(false);
    setActiveView('layanan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <AuthRoleProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onNavigateToHistory={handleNavigateToHistory}
        onNavigateToKepegawaian={handleNavigateToKepegawaian}
        lang={lang}
        onChangeLang={setLang}
        isDark={isDark}
        onToggleDark={setIsDark}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Left-Edge Floating Trigger: Sidebar Khusus Layanan */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-30">
        <button
          type="button"
          onClick={() => setServiceSidebarOpen(true)}
          aria-label="Buka Sidebar Menu Layanan PTSP"
          title="Menu Layanan PTSP Kemenag Murung Raya"
          className="px-2.5 py-3.5 rounded-r-2xl bg-emerald-800 hover:bg-emerald-700 text-white flex flex-col items-center gap-1.5 shadow-xl border border-l-0 border-emerald-600/50 transition-all hover:pl-3.5"
        >
          <LayoutGrid className="w-4 h-4 text-emerald-200" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
            Layanan PTSP
          </span>
        </button>
      </div>

      {/* Right-Edge Floating Sidebar Button: Kembali ke Katalog Layanan */}
      {activeView === 'layanan' && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30">
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
          <div className="w-full max-w-[390px] bg-slate-50 dark:bg-slate-950 h-full overflow-y-auto p-3.5 space-y-3 shadow-2xl border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-2 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center shrink-0">
                  <KemenagEmblem className="w-5 h-5" />
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
            onOpenServiceSidebar={() => setServiceSidebarOpen(true)}
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
            onOpenServiceSidebar={() => setServiceSidebarOpen(true)}
            onTicketCreated={handleTicketCreated}
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
      <SuperAdminNavigationWatcher onTrigger={handleOpenAdminConsole} />
      <OperatorNavigationWatcher onTrigger={handleOpenOperatorConsole} />
      <ServiceCatalogRedirectWatcher
        onRedirect={handleBackToKatalogLayanan}
        onResetKepegawaianSelection={() => {
          if (activeServiceUnitId === 'kepegawaian') {
            setActiveServiceUnitId(SERVICE_UNITS[0].id);
            setActiveSubServiceId(SERVICE_UNITS[0].subServices[0].id);
          }
          setSelectedService((prev) => (prev?.id === 'kepegawaian' ? null : prev));
        }}
      />
      </div>
    </AuthRoleProvider>
  );
}
