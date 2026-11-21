import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Award,
  Banknote,
  BookMarked,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarOff,
  ChevronDown,
  ChevronRight,
  Church,
  ClipboardCheck,
  Clock,
  Compass,
  Database,
  FileBadge,
  FileCheck2,
  FileEdit,
  FilePlus2,
  FileText,
  GraduationCap,
  HandCoins,
  IdCard,
  Landmark,
  LayoutGrid,
  Lock,
  MessageSquare,
  Mic,
  Moon,
  RefreshCw,
  School,
  ScrollText,
  Search,
  ShieldCheck,
  Sun,
  TrendingUp,
  UserCheck,
  UserCog,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SERVICE_UNITS } from '@/src/data/kemenagData';
import { ServiceUnit, SubService } from '@/src/types';
import { useAuthRole } from '@/src/context/AuthRoleContext';

interface ServiceSidebarProps {
  selectedUnitId: string;
  selectedSubId: string;
  onSelect: (unit: ServiceUnit, sub: SubService) => void;
  onSelectUnit?: (unit: ServiceUnit) => void;
}

const UNIT_ICONS: Record<string, { icon: LucideIcon; badgeClass: string }> = {
  sekretariat: {
    icon: Building2,
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  'bimas-islam': {
    icon: Moon,
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  },
  pendis: {
    icon: GraduationCap,
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  'bimas-hindu': {
    icon: Sun,
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  },
  'bimas-kristen': {
    icon: Church,
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  },
  kepegawaian: {
    icon: IdCard,
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  },
};

function getSubServiceIcon(subId: string): LucideIcon {
  if (subId === 'kep-kenaikan-pangkat') return TrendingUp;
  if (subId === 'kep-kgb') return Banknote;
  if (subId === 'kep-cuti-pegawai') return CalendarOff;
  if (subId === 'kep-pensiun-pegawai') return Clock;
  if (subId === 'kep-mutasi-pegawai') return ArrowLeftRight;
  if (subId === 'kep-karpeg-karis-karsu') return IdCard;
  if (subId === 'kep-satyalancana') return Award;
  if (subId === 'kep-izin-tugas-belajar') return GraduationCap;
  if (subId === 'kep-penyesuaian-ijazah-gelar') return FileBadge;
  if (subId === 'kep-surat-tugas-keterangan') return FileText;
  if (subId === 'kep-legalisasi-dokumen') return FileCheck2;
  if (subId === 'kep-perubahan-data') return UserCog;
  if (subId === 'bi-tauliyah-wali-hakim') return ScrollText;
  if (subId.includes('perpanjangan')) return RefreshCw;
  if (subId.includes('aktivasi-simpatika') || subId.includes('aktivasi-pakat')) return UserCheck;
  if (subId.includes('akun-emis-siaga')) return UserPlus;
  if (subId.includes('magang')) return Briefcase;
  if (subId.includes('legalisir')) return FileCheck2;
  if (subId.includes('data-info')) return Database;
  if (subId.includes('konsultasi')) return MessageSquare;
  if (subId.includes('rohaniwan')) return Mic;
  if (subId.includes('sewa-aula')) return CalendarCheck;
  if (subId.includes('sarpras') || subId.includes('bantuan-rumah-ibadah')) return Landmark;
  if (subId.includes('kiblat')) return Compass;
  if (subId.includes('majelis-taklim')) return Award;
  if (subId.includes('kitab-suci')) return BookOpen;
  if (subId.includes('buku-agama')) return BookMarked;
  if (subId.includes('kalkulator-zakat')) return Calculator;
  if (subId.includes('jadwal-sholat')) return Clock;
  if (subId.includes('penelitian')) return Search;
  if (subId.includes('ijazah')) return FileEdit;
  if (subId.includes('ijop') || subId.includes('pasraman') || subId.includes('izin-lembaga-pend'))
    return School;
  if (subId.includes('mutasi')) return ArrowLeftRight;
  if (subId.includes('pendis-bantuan')) return HandCoins;
  if (subId.includes('rehabilitasi')) return Wrench;
  if (subId.includes('tanda-daftar-rumah-ibadah') || subId.includes('rekom-td-rumah-ibadah'))
    return ClipboardCheck;
  if (subId.includes('tanda-daftar-lembaga') || subId.includes('td-lembaga-agama'))
    return ShieldCheck;
  if (subId.includes('daftar-gereja')) return FilePlus2;
  if (subId.includes('daftar-yayasan')) return FileBadge;
  return FileCheck2;
}

export function ServiceSidebar({
  selectedUnitId,
  selectedSubId,
  onSelect,
  onSelectUnit,
}: ServiceSidebarProps) {
  const { isVerifiedEmployee, isVerifiedKuaEmployee, isMasyarakatLogin } = useAuthRole();
  const availableUnits = isMasyarakatLogin
    ? SERVICE_UNITS.filter((u) => u.id !== 'kepegawaian')
    : SERVICE_UNITS;

  const [filterText, setFilterText] = useState('');
  const [expandedUnitIds, setExpandedUnitIds] = useState<string[]>([
    selectedUnitId || availableUnits[0].id,
  ]);

  useEffect(() => {
    if (selectedUnitId && availableUnits.some((u) => u.id === selectedUnitId)) {
      setExpandedUnitIds((prev) =>
        prev.includes(selectedUnitId) ? prev : [...prev, selectedUnitId]
      );
    }
  }, [selectedUnitId, isMasyarakatLogin]);

  const toggleExpand = (unitId: string) => {
    setExpandedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const allExpanded = expandedUnitIds.length === availableUnits.length;

  const toggleExpandAll = () => {
    setExpandedUnitIds(allExpanded ? [] : availableUnits.map((u) => u.id));
  };

  const q = filterText.trim().toLowerCase();

  const visibleUnits = availableUnits.map((unit) => {
    const unitMatches = unit.title.toLowerCase().includes(q);
    const matchingSubs = q
      ? unit.subServices.filter((s) => s.title.toLowerCase().includes(q))
      : unit.subServices;
    return {
      unit,
      subs: unitMatches && matchingSubs.length === 0 ? unit.subServices : matchingSubs,
      visible: !q || unitMatches || matchingSubs.length > 0,
    };
  }).filter((item) => item.visible);

  return (
    <aside
      aria-label="Menu Sidebar Layanan PTSP Kemenag Murung Raya"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
    >
      {/* App Sidebar Header */}
      <div className="p-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white space-y-3 border-b border-emerald-800/60">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              PTSP Digital App
            </p>
            <h2 className="text-sm font-extrabold tracking-tight mt-0.5">
              Daftar Layanan Terpadu
            </h2>
          </div>
          <button
            type="button"
            onClick={toggleExpandAll}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase tracking-wider text-emerald-100 transition-colors shrink-0"
          >
            {allExpanded ? 'Tutup Semua' : 'Buka Semua'}
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-emerald-300/80 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Cari layanan atau sub-menu..."
            className="w-full pl-8 pr-8 py-2 text-xs bg-slate-950/40 border border-emerald-700/70 rounded-xl text-white placeholder:text-emerald-200/60 focus:outline-none focus:border-emerald-400"
          />
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-200/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* App Sidebar Tree Navigation */}
      <nav className="p-2.5 space-y-1.5 max-h-[72vh] overflow-y-auto bg-slate-50/40 dark:bg-slate-950/30">
        {visibleUnits.map(({ unit, subs }) => {
          const isExpanded = q ? true : expandedUnitIds.includes(unit.id);
          const isUnitActive = selectedUnitId === unit.id;
          const unitMeta = UNIT_ICONS[unit.id] || {
            icon: Building2,
            badgeClass: 'bg-emerald-100 text-emerald-800',
          };
          const UnitIcon = unitMeta.icon;

          return (
            <div
              key={unit.id}
              className={`rounded-xl border transition-colors ${
                isUnitActive
                  ? 'border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 shadow-2xs'
                  : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 bg-white/80 dark:bg-slate-900/60'
              }`}
            >
              {/* Parent Menu Header (SEKRETARIAT, BIMAS ISLAM, dst.) */}
              <button
                type="button"
                onClick={() => toggleExpand(unit.id)}
                aria-expanded={isExpanded}
                className="menu-expand-btn-left group/unit w-full px-3 py-2.5 text-left flex items-center justify-between gap-2.5 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-slate-800/70"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover/unit:scale-105 ${
                      isUnitActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : unitMeta.badgeClass
                    }`}
                  >
                    <UnitIcon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-extrabold tracking-wide uppercase truncate ${
                        isUnitActive
                          ? 'text-emerald-900 dark:text-emerald-300'
                          : 'text-slate-800 dark:text-slate-100 group-hover/unit:text-emerald-800 dark:group-hover/unit:text-emerald-300'
                      }`}
                    >
                      <span className="menu-expand-label truncate">{unit.title}</span>
                      {unit.id === 'kepegawaian' && !isVerifiedEmployee && (
                        <Lock className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 font-mono-tabular">
                      {subs.length} sub-layanan
                      {unit.id === 'kepegawaian' &&
                        (isVerifiedEmployee ? ' · Pegawai Terverifikasi' : ' · Khusus Pegawai')}
                    </span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover/unit:translate-x-0.5" />
                )}
              </button>

              {/* Tree Sub-Menu List with Icons */}
              {isExpanded && (
                <div className="pb-2 pr-2 pl-6">
                  {onSelectUnit && !q && (
                    <button
                      type="button"
                      onClick={() => onSelectUnit(unit)}
                      className="menu-expand-btn-left w-full mb-1.5 px-2.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-bold flex items-center gap-2"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                      <span className="menu-expand-label">
                        {unit.id === 'kepegawaian' && !isVerifiedEmployee
                          ? `Buka Gerbang Kepegawaian (${unit.subServices.length} Layanan)`
                          : `Tampilkan Semua ${unit.subServices.length} Layanan & Template`}
                      </span>
                    </button>
                  )}
                  <ul className="border-l-2 border-emerald-200/90 dark:border-emerald-800/80 pl-2.5 divide-y divide-slate-100 dark:divide-slate-800/70">
                    {subs.map((sub) => {
                      const active = selectedUnitId === unit.id && selectedSubId === sub.id;
                      const SubIcon = getSubServiceIcon(sub.id);
                      const isKuaRestricted = sub.restrictedScope === 'kua';
                      return (
                        <li key={sub.id} className="py-0.5 first:pt-0 last:pb-0">
                          <button
                            type="button"
                            onClick={() => onSelect(unit, sub)}
                            className={`menu-expand-btn-left w-full text-left px-2.5 py-2 rounded-lg text-xs leading-snug flex items-start gap-2.5 ${
                              active
                                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-900 dark:hover:text-emerald-300'
                            }`}
                          >
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                active
                                  ? 'text-emerald-200'
                                  : 'text-emerald-700/75 dark:text-emerald-400/80'
                              }`}
                            />
                            <span className="flex-1">
                              <span className="menu-expand-label block">{sub.title}</span>
                              {isKuaRestricted && (
                                <span
                                  className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold ${
                                    active
                                      ? 'text-amber-200'
                                      : isVerifiedKuaEmployee
                                      ? 'text-teal-700 dark:text-teal-400'
                                      : 'text-indigo-700 dark:text-indigo-400'
                                  }`}
                                >
                                  {!isVerifiedKuaEmployee && <Lock className="w-2.5 h-2.5 shrink-0" />}
                                  <span>
                                    {isVerifiedKuaEmployee
                                      ? 'Khusus Pegawai KUA (Terbuka)'
                                      : 'Khusus Pegawai KUA Kecamatan'}
                                  </span>
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {visibleUnits.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Sub-menu layanan tidak ditemukan.
          </div>
        )}
      </nav>
    </aside>
  );
}
