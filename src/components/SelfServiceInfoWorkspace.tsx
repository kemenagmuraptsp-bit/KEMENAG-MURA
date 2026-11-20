import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  LogIn,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  auth,
  mapFirebaseAuthError,
  recordDocumentDownload,
  signInWithGoogleAndRecord,
  signOutGoogle,
  subscribeAllGoogleUsers,
  subscribeUserDownloadLogs,
  upsertGoogleUserProfile,
  type DownloadLogRecord,
  type UserProfileRecord,
} from '@/src/firebase';
import { ZakatCalculator, ZAKAT_RATES_BY_YEAR } from '@/src/components/ZakatCalculator';

interface SelfServiceDoc {
  id: string;
  title: string;
  subtitle: string;
  formatLabel: string;
  fileName: string;
  buildContent: () => string;
}

interface YearScheduleRow {
  day: string;
  dateLabel: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

const AVAILABLE_YEARS = [2026, 2025, 2024] as const;

const HIJRI_LABELS: Record<number, string> = {
  2026: '1447 H',
  2025: '1446 H',
  2024: '1445 H',
};

const IMSAKIYAH_BY_YEAR: Record<number, YearScheduleRow[]> = {
  2026: [
    { day: '1 Ramadhan', dateLabel: '19 Feb 2026', imsak: '04:21', subuh: '04:31', terbit: '05:44', dzuhur: '11:55', ashar: '15:10', maghrib: '17:59', isya: '19:08' },
    { day: '5 Ramadhan', dateLabel: '23 Feb 2026', imsak: '04:21', subuh: '04:31', terbit: '05:44', dzuhur: '11:54', ashar: '15:08', maghrib: '17:58', isya: '19:07' },
    { day: '10 Ramadhan', dateLabel: '28 Feb 2026', imsak: '04:20', subuh: '04:30', terbit: '05:43', dzuhur: '11:53', ashar: '15:04', maghrib: '17:57', isya: '19:06' },
    { day: '15 Ramadhan', dateLabel: '05 Mar 2026', imsak: '04:19', subuh: '04:29', terbit: '05:41', dzuhur: '11:52', ashar: '15:00', maghrib: '17:55', isya: '19:04' },
    { day: '20 Ramadhan', dateLabel: '10 Mar 2026', imsak: '04:18', subuh: '04:28', terbit: '05:40', dzuhur: '11:51', ashar: '14:55', maghrib: '17:54', isya: '19:02' },
    { day: '25 Ramadhan', dateLabel: '15 Mar 2026', imsak: '04:17', subuh: '04:27', terbit: '05:38', dzuhur: '11:49', ashar: '14:51', maghrib: '17:52', isya: '19:00' },
    { day: '30 Ramadhan', dateLabel: '20 Mar 2026', imsak: '04:15', subuh: '04:25', terbit: '05:37', dzuhur: '11:48', ashar: '14:49', maghrib: '17:50', isya: '18:59' },
  ],
  2025: [
    { day: '1 Ramadhan', dateLabel: '01 Mar 2025', imsak: '04:20', subuh: '04:30', terbit: '05:42', dzuhur: '11:53', ashar: '15:03', maghrib: '17:57', isya: '19:05' },
    { day: '5 Ramadhan', dateLabel: '05 Mar 2025', imsak: '04:19', subuh: '04:29', terbit: '05:41', dzuhur: '11:52', ashar: '15:00', maghrib: '17:55', isya: '19:04' },
    { day: '10 Ramadhan', dateLabel: '10 Mar 2025', imsak: '04:18', subuh: '04:28', terbit: '05:40', dzuhur: '11:51', ashar: '14:55', maghrib: '17:54', isya: '19:02' },
    { day: '15 Ramadhan', dateLabel: '15 Mar 2025', imsak: '04:17', subuh: '04:27', terbit: '05:38', dzuhur: '11:49', ashar: '14:51', maghrib: '17:52', isya: '19:00' },
    { day: '20 Ramadhan', dateLabel: '20 Mar 2025', imsak: '04:15', subuh: '04:25', terbit: '05:37', dzuhur: '11:48', ashar: '14:49', maghrib: '17:50', isya: '18:59' },
    { day: '25 Ramadhan', dateLabel: '25 Mar 2025', imsak: '04:14', subuh: '04:24', terbit: '05:35', dzuhur: '11:46', ashar: '14:50', maghrib: '17:49', isya: '18:57' },
    { day: '30 Ramadhan', dateLabel: '30 Mar 2025', imsak: '04:12', subuh: '04:22', terbit: '05:34', dzuhur: '11:45', ashar: '14:52', maghrib: '17:47', isya: '18:55' },
  ],
  2024: [
    { day: '1 Ramadhan', dateLabel: '12 Mar 2024', imsak: '04:17', subuh: '04:27', terbit: '05:39', dzuhur: '11:50', ashar: '14:53', maghrib: '17:53', isya: '19:01' },
    { day: '5 Ramadhan', dateLabel: '16 Mar 2024', imsak: '04:16', subuh: '04:26', terbit: '05:38', dzuhur: '11:49', ashar: '14:51', maghrib: '17:51', isya: '19:00' },
    { day: '10 Ramadhan', dateLabel: '21 Mar 2024', imsak: '04:15', subuh: '04:25', terbit: '05:37', dzuhur: '11:47', ashar: '14:49', maghrib: '17:50', isya: '18:58' },
    { day: '15 Ramadhan', dateLabel: '26 Mar 2024', imsak: '04:14', subuh: '04:24', terbit: '05:35', dzuhur: '11:46', ashar: '14:50', maghrib: '17:48', isya: '18:57' },
    { day: '20 Ramadhan', dateLabel: '31 Mar 2024', imsak: '04:12', subuh: '04:22', terbit: '05:34', dzuhur: '11:44', ashar: '14:52', maghrib: '17:47', isya: '18:55' },
    { day: '25 Ramadhan', dateLabel: '05 Apr 2024', imsak: '04:11', subuh: '04:21', terbit: '05:32', dzuhur: '11:43', ashar: '14:54', maghrib: '17:45', isya: '18:54' },
    { day: '30 Ramadhan', dateLabel: '10 Apr 2024', imsak: '04:09', subuh: '04:19', terbit: '05:31', dzuhur: '11:42', ashar: '14:56', maghrib: '17:44', isya: '18:53' },
  ],
};

function triggerBlobDownload(fileName: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getDocsForCategoryAndYear(
  category: 'zakat' | 'imsakiyah',
  year: number
): SelfServiceDoc[] {
  const hijri = HIJRI_LABELS[year] || '1447 H';

  if (category === 'zakat') {
    const rate = ZAKAT_RATES_BY_YEAR[year] || ZAKAT_RATES_BY_YEAR[2026];
    const nisabYearly = rate.goldPricePerGram * 85;
    return [
      {
        id: `doc_ketentuan_zakat_${year}`,
        title: `Keputusan Nisab & Kadar Zakat Fitrah/Maal Tahun ${year} (${hijri})`,
        subtitle: `Acuan resmi Kemenag & BAZNAS Kab. Murung Raya (${rate.skReference})`,
        formatLabel: 'TXT Resmi',
        fileName: `Ketentuan_Zakat_Murung_Raya_${year}.txt`,
        buildContent: () =>
          [
            `KANTOR KEMENTERIAN AGAMA KABUPATEN MURUNG RAYA`,
            `KETENTUAN NISAB ZAKAT & KONVERSI ZAKAT FITRAH TAHUN ${year} (${hijri})`,
            `========================================================================`,
            `Referensi   : ${rate.skReference}`,
            `Wilayah     : Kabupaten Murung Raya (Puruk Cahu & 10 Kecamatan)`,
            ``,
            `1. Acuan Harga Emas (Nisab 85 Gram) : Rp ${rate.goldPricePerGram.toLocaleString('id-ID')} / gram`,
            `2. Total Nisab Tahunan (Maal/Profesi): Rp ${nisabYearly.toLocaleString('id-ID')} / tahun`,
            `3. Setara Nisab Bulanan (Profesi)   : Rp ${Math.round(nisabYearly / 12).toLocaleString('id-ID')} / bulan`,
            `4. Kadar Zakat Penghasilan & Maal   : 2,5%`,
            `5. Takaran Zakat Fitrah (Beras)     : 2,5 Kg atau 3,5 Liter per jiwa`,
            `6. Konversi Uang Zakat Fitrah       : Rp ${rate.ricePricePerKg.toLocaleString('id-ID')}/kg = Rp ${(rate.ricePricePerKg * 2.5).toLocaleString('id-ID')} / jiwa`,
            ``,
            `Ditetapkan untuk panduan masyarakat & UPZ Masjid/KUA se-Kab. Murung Raya.`,
          ].join('\n'),
      },
      {
        id: `doc_panduan_upz_${year}`,
        title: `Panduan Teknis Pengumpulan & Penyaluran Zakat (UPZ) Tahun ${year}`,
        subtitle: `Tata cara perhitungan, mustahiq 8 asnaf, dan pelaporan BAZNAS/KUA Murung Raya`,
        formatLabel: 'TXT Panduan',
        fileName: `Panduan_Zakat_UPZ_Murung_Raya_${year}.txt`,
        buildContent: () =>
          [
            `PANDUAN TEKNIS ZAKAT & PELAPORAN UPZ TAHUN ${year} (${hijri})`,
            `Seksi Bimbingan Masyarakat Islam - Kankemenag Kab. Murung Raya`,
            `========================================================================`,
            `- Jenis Zakat : Zakat Fitrah, Zakat Penghasilan (Profesi), Zakat Maal (Simpanan/Perniagaan/Emas)`,
            `- Penerima (8 Asnaf) : Fakir, Miskin, Amil, Muallaf, Riqab, Gharimin, Fisabilillah, Ibnu Sabil`,
            `- Penyaluran Resmi   : BAZNAS Kabupaten Murung Raya & UPZ KUA Kecamatan setempat.`,
          ].join('\n'),
      },
    ];
  }

  const rows = IMSAKIYAH_BY_YEAR[year] || IMSAKIYAH_BY_YEAR[2026];
  return [
    {
      id: `doc_imsakiyah_${year}`,
      title: `Jadwal Imsakiyah Ramadhan ${hijri} / ${year} Kab. Murung Raya`,
      subtitle: `Waktu Imsak, Subuh, Terbit, Dzuhur, Ashar, Maghrib & Isya (Puruk Cahu WIB)`,
      formatLabel: 'CSV Jadwal',
      fileName: `Jadwal_Imsakiyah_Murung_Raya_${year}_${hijri.replace(/\s+/g, '')}.csv`,
      buildContent: () => {
        const header = 'Hari,Tanggal,Imsak,Subuh,Terbit,Dzuhur,Ashar,Maghrib,Isya';
        const lines = rows.map(
          (r) => `${r.day},${r.dateLabel},${r.imsak},${r.subuh},${r.terbit},${r.dzuhur},${r.ashar},${r.maghrib},${r.isya}`
        );
        return [header, ...lines].join('\n');
      },
    },
    {
      id: `doc_waktu_sholat_${year}`,
      title: `Pedoman Jadwal Sholat Fardhu Sepanjang Tahun ${year} (Puruk Cahu)`,
      subtitle: `Koordinat 0°38' LS - 114°34' BT · Zona Waktu Indonesia Barat (WIB)`,
      formatLabel: 'TXT Resmi',
      fileName: `Jadwal_Waktu_Sholat_Murung_Raya_${year}.txt`,
      buildContent: () =>
        [
          `KANTOR KEMENTERIAN AGAMA KABUPATEN MURUNG RAYA`,
          `PEDOMAN JADWAL WAKTU SHOLAT KABUPATEN MURUNG RAYA TAHUN ${year} (${hijri})`,
          `Titik Koordinat: Puruk Cahu (0°38' LS, 114°34' BT) · WIB`,
          `========================================================================`,
          ...rows.map(
            (r) =>
              `${r.day.padEnd(13)} | ${r.dateLabel} | Imsak ${r.imsak} | Subuh ${r.subuh} | Dzuhur ${r.dzuhur} | Ashar ${r.ashar} | Maghrib ${r.maghrib} | Isya ${r.isya}`
          ),
          ``,
          `Catatan Koreksi Waktu Kecamatan Hulu Sungai Barito:`,
          `- Kec. Seribu Riam / Uut Murung: -2 menit`,
          `- Kec. Laung Tuhup / Tanah Siang: -1 menit`,
        ].join('\n'),
    },
  ];
}

export function SelfServiceInfoWorkspace({
  mode,
}: {
  mode: 'zakat' | 'imsakiyah';
}) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [busyDocId, setBusyDocId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [downloadLogs, setDownloadLogs] = useState<DownloadLogRecord[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfileRecord[]>([]);

  const isAdmin = Boolean(user?.email && user.email === ADMIN_EMAIL && user.emailVerified);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        void upsertGoogleUserProfile(currentUser).catch(() => {
          // handled in firebase.ts
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setDownloadLogs([]);
      setRegisteredUsers([]);
      return;
    }

    const unsubLogs = subscribeUserDownloadLogs(
      user,
      isAdmin,
      (logs) => setDownloadLogs(logs),
      () => {
        // surfaced through handleFirestoreError
      }
    );

    let unsubUsers: (() => void) | null = null;
    if (isAdmin) {
      unsubUsers = subscribeAllGoogleUsers(
        (users) => setRegisteredUsers(users),
        () => {
          // surfaced through handleFirestoreError
        }
      );
    }

    return () => {
      unsubLogs();
      if (unsubUsers) unsubUsers();
    };
  }, [user, isAdmin]);

  const handleGoogleSignIn = async (): Promise<User | null> => {
    try {
      setNotice(null);
      const signedInUser = await signInWithGoogleAndRecord();
      if (!signedInUser) {
        return null;
      }
      setNotice({
        type: 'success',
        text: `Berhasil masuk sebagai ${signedInUser.displayName || signedInUser.email}. Data akses Google Anda telah dicatat.`,
      });
      return signedInUser;
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      setNotice({
        type: 'error',
        text: msg.includes('popup-closed-by-user')
          ? 'Login Google dibatalkan. Silakan masuk dengan akun Google untuk mengunduh dan mencatat akses dokumen.'
          : mapFirebaseAuthError(error, 'google'),
      });
      return null;
    }
  };

  const handleDownloadWithGoogleLog = async (docItem: {
    id: string;
    title: string;
    fileName: string;
    content: string;
    mimeType?: string;
  }) => {
    setBusyDocId(docItem.id);
    setNotice(null);

    try {
      let activeUser = auth.currentUser;
      if (!activeUser) {
        activeUser = await handleGoogleSignIn();
        if (!activeUser) {
          setBusyDocId(null);
          return;
        }
      }

      await recordDocumentDownload({
        user: activeUser,
        documentId: docItem.id,
        documentTitle: docItem.title,
        category: mode,
        year: selectedYear,
      });

      triggerBlobDownload(docItem.fileName, docItem.content, docItem.mimeType);

      setNotice({
        type: 'success',
        text: `Dokumen "${docItem.title}" berhasil diunduh dan tercatat atas akun ${activeUser.email}.`,
      });
    } catch {
      setNotice({
        type: 'error',
        text: 'Gagal mencatat pengunduhan ke database. Silakan coba beberapa saat lagi.',
      });
    } finally {
      setBusyDocId(null);
    }
  };

  const handleExportLogsCsv = () => {
    const header = 'Nama Pengguna,Email Google,Kategori,Tahun,Judul Dokumen,Waktu Unduh';
    const rows = downloadLogs.map((l) => {
      const dt = l.downloadedAt?.toDate ? l.downloadedAt.toDate().toLocaleString('id-ID') : '-';
      return `"${l.userName}","${l.userEmail}",${l.category},${l.year},"${l.documentTitle}","${dt}"`;
    });
    triggerBlobDownload(
      `Rekap_Pendownload_${mode}_${selectedYear}.csv`,
      [header, ...rows].join('\n'),
      'text/csv;charset=utf-8'
    );
  };

  const docs = getDocsForCategoryAndYear(mode, selectedYear);
  const scheduleRows = IMSAKIYAH_BY_YEAR[selectedYear] || IMSAKIYAH_BY_YEAR[2026];
  const filteredYearLogs = downloadLogs.filter((l) => l.category === mode && l.year === selectedYear);

  return (
    <div className="space-y-6">
      {/* Year Selector & Google Account Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Year Tabs */}
        <div className="lg:col-span-6 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Pilih Tahun Tampilan & Dokumen</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_YEARS.map((yr) => {
              const active = selectedYear === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono-tabular transition-colors ${
                    active
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-600'
                  }`}
                >
                  {yr} ({HIJRI_LABELS[yr]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Google Account Identity Recorder */}
        <div className="lg:col-span-6 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Pencatatan Pengguna & Pengunduh (Akun Google)</span>
            </span>
          </div>

          {authLoading ? (
            <p className="text-xs text-slate-500">Memeriksa sesi akun Google...</p>
          ) : user ? (
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Foto Profil Google'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.displayName || 'Pengguna Google'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void signOutGoogle()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Masuk dengan Google agar data pengunduh dokumen tercatat otomatis.
              </p>
              <button
                type="button"
                onClick={() => void handleGoogleSignIn()}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Google</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-xl px-4 py-3 text-xs font-medium flex items-start gap-2.5 border ${
            notice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* Interactive Content: Kalkulator Zakat OR Jadwal Imsakiyah Table */}
      {mode === 'zakat' ? (
        <ZakatCalculator
          selectedYear={selectedYear}
          downloading={busyDocId === `simulasi_zakat_${selectedYear}`}
          onDownloadSimulation={(summaryText) =>
            void handleDownloadWithGoogleLog({
              id: `simulasi_zakat_${selectedYear}`,
              title: `Hasil Simulasi Kalkulator Zakat Tahun ${selectedYear} (${HIJRI_LABELS[selectedYear]})`,
              fileName: `Simulasi_Zakat_Murung_Raya_${selectedYear}.txt`,
              content: summaryText,
            })
          }
        />
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="px-5 py-4 bg-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                Puruk Cahu · Waktu Indonesia Barat (WIB)
              </p>
              <h3 className="text-sm font-extrabold mt-0.5">
                Jadwal Imsakiyah Ramadhan {HIJRI_LABELS[selectedYear]} / Tahun {selectedYear}
              </h3>
            </div>
            <span className="text-[11px] font-mono-tabular text-emerald-200">
              Kabupaten Murung Raya
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <th className="py-2.5 px-3 font-bold">Hari</th>
                  <th className="py-2.5 px-3 font-bold">Tanggal</th>
                  <th className="py-2.5 px-3 font-bold text-emerald-800 dark:text-emerald-400">Imsak</th>
                  <th className="py-2.5 px-3 font-bold">Subuh</th>
                  <th className="py-2.5 px-3 font-bold">Terbit</th>
                  <th className="py-2.5 px-3 font-bold">Dzuhur</th>
                  <th className="py-2.5 px-3 font-bold">Ashar</th>
                  <th className="py-2.5 px-3 font-bold text-emerald-800 dark:text-emerald-400">Maghrib</th>
                  <th className="py-2.5 px-3 font-bold">Isya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono-tabular">
                {scheduleRows.map((row) => (
                  <tr
                    key={row.day}
                    className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200"
                  >
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {row.day}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {row.dateLabel}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800 dark:text-emerald-400">
                      {row.imsak}
                    </td>
                    <td className="py-2.5 px-3">{row.subuh}</td>
                    <td className="py-2.5 px-3">{row.terbit}</td>
                    <td className="py-2.5 px-3">{row.dzuhur}</td>
                    <td className="py-2.5 px-3">{row.ashar}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800 dark:text-emerald-400">
                      {row.maghrib}
                    </td>
                    <td className="py-2.5 px-3">{row.isya}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yearly Downloadable Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Dokumen Resmi Tersedia — Tahun {selectedYear} ({HIJRI_LABELS[selectedYear]})
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Unduhan dicatat via akun Google
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {docs.map((docItem) => (
            <div
              key={docItem.id}
              className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {docItem.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {docItem.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono-tabular font-bold uppercase text-emerald-700 dark:text-emerald-400">
                  {docItem.formatLabel} · {selectedYear}
                </span>
                <button
                  type="button"
                  disabled={busyDocId === docItem.id}
                  onClick={() =>
                    void handleDownloadWithGoogleLog({
                      id: docItem.id,
                      title: docItem.title,
                      fileName: docItem.fileName,
                      content: docItem.buildContent(),
                      mimeType: docItem.fileName.endsWith('.csv')
                        ? 'text/csv;charset=utf-8'
                        : 'text/plain;charset=utf-8',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{busyDocId === docItem.id ? 'Menyimpan...' : 'Unduh Dokumen'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recorded Access & Download Logs */}
      {user && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/70 dark:bg-slate-900/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                {isAdmin
                  ? `Catatan Pengguna & Pendownload Tahun ${selectedYear} (Admin)`
                  : `Riwayat Unduhan Akun Anda (${selectedYear})`}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isAdmin
                  ? `Menampilkan catatan resmi dari Google Auth & Firestore (${registeredUsers.length} pengguna Google terdaftar).`
                  : `Tercatat otomatis untuk ${user.email}.`}
              </p>
            </div>
            {isAdmin && downloadLogs.length > 0 && (
              <button
                type="button"
                onClick={handleExportLogsCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Rekap CSV</span>
              </button>
            )}
          </div>

          {filteredYearLogs.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {filteredYearLogs.map((log) => (
                <div
                  key={log.id}
                  className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {log.documentTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {log.userName} ({log.userEmail})
                    </p>
                  </div>
                  <span className="font-mono-tabular text-[11px] text-emerald-800 dark:text-emerald-400 shrink-0">
                    {log.downloadedAt?.toDate
                      ? log.downloadedAt.toDate().toLocaleString('id-ID')
                      : 'Baru saja tercatat'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum ada unduhan dokumen kategori ini untuk tahun {selectedYear}.
            </p>
          )}

          {isAdmin && registeredUsers.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Users className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Daftar Pengguna Akun Google Terdaftar ({registeredUsers.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {registeredUsers.slice(0, 12).map((u) => (
                  <div
                    key={u.uid}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {u.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] font-mono-tabular text-slate-400 shrink-0">
                      {u.lastLoginAt?.toDate
                        ? u.lastLoginAt.toDate().toLocaleDateString('id-ID')
                        : 'Aktif'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
