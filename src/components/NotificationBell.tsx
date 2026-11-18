import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Bell,
  CheckCheck,
  ChevronDown,
  FileClock,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuthRole, type PortalNotification } from '@/src/context/AuthRoleContext';

interface HeaderAccountControlsProps {
  isTransparentHeroHeader: boolean;
  onNavigateToHistory: () => void;
  onNavigateToKepegawaian: () => void;
}

const TONE_BADGE_CLASSES: Record<PortalNotification['tone'], string> = {
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
};

export function HeaderAccountControls({
  isTransparentHeroHeader,
  onNavigateToHistory,
  onNavigateToKepegawaian,
}: HeaderAccountControlsProps) {
  const {
    user,
    isAdmin,
    isVerifiedEmployee,
    isVerifiedKuaEmployee,
    myVerifiedEmployee,
    accountTier,
    isNipSession,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    signOut,
  } = useAuthRole();

  const [bellOpen, setBellOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bellOpen && !accountOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setBellOpen(false);
        setAccountOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBellOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [bellOpen, accountOpen]);

  if (!user) return null;

  const displayName =
    myVerifiedEmployee?.fullName ||
    user.displayName ||
    (isNipSession ? user.email?.split('@')[0] : user.email?.split('@')[0]) ||
    'Pengguna';

  const shortName = displayName.split(' ').slice(0, 2).join(' ');
  const tierLabel = isAdmin
    ? 'Admin PTSP'
    : isVerifiedKuaEmployee
    ? 'Pegawai KUA'
    : isVerifiedEmployee
    ? 'Pegawai'
    : 'Google';

  const handleNotificationClick = (item: PortalNotification) => {
    markNotificationRead(item.signature);
    setBellOpen(false);
    if (item.targetUnitId === 'kepegawaian' && !isAdmin) {
      onNavigateToKepegawaian();
    } else {
      onNavigateToHistory();
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      {/* Bell Notification Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setBellOpen((prev) => !prev);
            setAccountOpen(false);
          }}
          aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
          title="Notifikasi Pembaruan Berkas & Pesan Petugas"
          className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
            isTransparentHeroHeader
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-slate-950 font-mono-tabular">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {bellOpen && (
          <div className="absolute right-0 top-full mt-2 w-[330px] sm:w-[370px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifikasi Terbaru
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black font-mono-tabular">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Tandai dibaca</span>
                </button>
              )}
            </div>

            <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-6 text-center space-y-1.5">
                  <Bell className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Belum ada pesan atau pembaruan berkas
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pembaruan status pengajuan PTSP dan pesan dari petugas akan tampil di sini.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-2.5 ${
                      !item.read
                        ? 'bg-emerald-50/55 dark:bg-emerald-950/25 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        !item.read ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${TONE_BADGE_CLASSES[item.tone]}`}
                        >
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {item.timeLabel}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => {
                  setBellOpen(false);
                  onNavigateToHistory();
                }}
                className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <FileClock className="w-3.5 h-3.5" />
                <span>Lihat Seluruh Riwayat Pengajuan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Account Dropdown Pill */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setAccountOpen((prev) => !prev);
            setBellOpen(false);
          }}
          className={`inline-flex items-center gap-2 pl-2 pr-2.5 h-9 rounded-full border text-xs font-bold transition-colors ${
            isTransparentHeroHeader
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
              isAdmin
                ? 'bg-amber-500 text-slate-950'
                : isVerifiedEmployee
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : isVerifiedEmployee ? (
              <BadgeCheck className="w-3.5 h-3.5" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
          </span>
          <span className="hidden xl:inline max-w-[115px] truncate">{shortName}</span>
          <span
            className={`hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
              isAdmin
                ? 'bg-amber-400 text-slate-950'
                : isVerifiedEmployee
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {tierLabel}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-75" />
        </button>

        {accountOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {myVerifiedEmployee?.nip
                  ? `NIP ${myVerifiedEmployee.nip}`
                  : isNipSession
                  ? `NIP ${user.email?.split('@')[0]}`
                  : user.email}
              </p>
              {myVerifiedEmployee?.unitKerja && (
                <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                  {myVerifiedEmployee.unitKerja}
                </p>
              )}
            </div>

            <div className="p-1.5 space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  onNavigateToHistory();
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <FileClock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Riwayat Layanan & Berkas</span>
              </button>

              {accountTier === 'masyarakat' && (
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    onNavigateToKepegawaian();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                  <span>Verifikasi Akun Pegawai</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  void signOut();
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
