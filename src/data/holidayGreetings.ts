export interface CalendarHolidayGreeting {
  id: string;
  month: number; // 1-12
  day: number; // 1-31
  windowBeforeDays?: number;
  windowAfterDays?: number;
  dateLabel: string;
  badge: string;
  shortTitle: string;
  headline: string;
  theme: string;
  message: string;
  bgGradient: string;
  accentColor: string;
  borderGlow: string;
}

export const LEADERSHIP_PROFILES = {
  kepalaKantor: {
    name: 'H. Maslan, S.Ag., M.Pd.',
    shortName: 'H. Maslan, S.Ag., M.Pd.',
    role: 'Kepala Kantor',
    fullRole: 'Kepala Kantor Kementerian Agama Kab. Murung Raya',
  },
  kasubbagTu: {
    name: 'Hj. Nina Narly, S.Ag., M.H',
    shortName: 'Hj. Nina Narly, S.Ag., M.H',
    role: 'Kasubbag TU',
    fullRole: 'Kepala Sub Bagian Tata Usaha Kankemenag Kab. Murung Raya',
  },
} as const;

/**
 * Kalender Hari Besar Nasional & Hari Besar Kementerian Agama RI.
 * Sistem otomatis memilih ucapan yang paling sesuai dengan tanggal kalender saat ini.
 */
export const CALENDAR_HOLIDAY_GREETINGS: CalendarHolidayGreeting[] = [
  {
    id: 'tahun-baru',
    month: 1,
    day: 1,
    windowBeforeDays: 4,
    windowAfterDays: 1,
    dateLabel: '1 Januari',
    badge: 'TAHUN BARU',
    shortTitle: 'Tahun Baru Masehi',
    headline: 'Selamat Tahun Baru',
    theme: 'Semangat Baru Melayani Umat dengan PRIMA',
    message:
      'Semoga di tahun yang baru seluruh masyarakat Kabupaten Murung Raya senantiasa diberikan kesehatan, kedamaian, dan keberkahan dalam kerukunan umat beragama.',
    bgGradient: 'from-[#062c24] via-[#0b4638] to-[#081c2b]',
    accentColor: '#fbbf24',
    borderGlow: 'rgba(251, 191, 36, 0.45)',
  },
  {
    id: 'hab-kemenag',
    month: 1,
    day: 3,
    windowBeforeDays: 2,
    windowAfterDays: 12,
    dateLabel: '3 Januari',
    badge: 'HAB KEMENAG RI',
    shortTitle: 'Hari Amal Bakti Kemenag',
    headline: 'Selamat Hari Amal Bakti Kemenag RI',
    theme: 'Umat Rukun Menuju Indonesia Emas',
    message:
      'Memperingati Hari Amal Bakti Kementerian Agama Republik Indonesia dengan komitmen pelayanan keagamaan yang Profesional, Responsif, Integritas, Modern, dan Akuntabel.',
    bgGradient: 'from-[#032c1d] via-[#065f46] to-[#042f2e]',
    accentColor: '#fde047',
    borderGlow: 'rgba(16, 185, 129, 0.5)',
  },
  {
    id: 'isra-miraj',
    month: 1,
    day: 27,
    windowBeforeDays: 7,
    windowAfterDays: 5,
    dateLabel: '27 Rajab',
    badge: 'HARI BESAR ISLAM',
    shortTitle: "Isra Mi'raj Nabi Muhammad SAW",
    headline: "Selamat Memperingati Isra Mi'raj",
    theme: 'Meneguhkan Kualitas Ibadah & Akhlak Mulia',
    message:
      "Semoga hikmah peristiwa Isra Mi'raj Nabi Muhammad SAW semakin menguatkan keimanan, ketakwaan, serta semangat pengabdian kita bagi umat dan bangsa.",
    bgGradient: 'from-[#052922] via-[#0c4a3e] to-[#132a13]',
    accentColor: '#fcd34d',
    borderGlow: 'rgba(252, 211, 77, 0.45)',
  },
  {
    id: 'nyepi',
    month: 3,
    day: 19,
    windowBeforeDays: 6,
    windowAfterDays: 3,
    dateLabel: 'Hari Suci Nyepi',
    badge: 'HARI RAYA HINDU',
    shortTitle: 'Hari Suci Nyepi Tahun Baru Saka',
    headline: 'Selamat Hari Suci Nyepi',
    theme: 'Catur Brata Penyepian untuk Kedamaian Semesta',
    message:
      'Keluarga Besar Kankemenag Kabupaten Murung Raya mengucapkan Selamat Hari Suci Nyepi Tahun Baru Saka kepada seluruh umat Hindu. Rahajeng Rahina Nyepi.',
    bgGradient: 'from-[#3b1c0a] via-[#78350f] to-[#1c1917]',
    accentColor: '#fdba74',
    borderGlow: 'rgba(251, 146, 60, 0.45)',
  },
  {
    id: 'idul-fitri',
    month: 3,
    day: 21,
    windowBeforeDays: 7,
    windowAfterDays: 10,
    dateLabel: '1 Syawal',
    badge: 'IDUL FITRI',
    shortTitle: 'Hari Raya Idul Fitri',
    headline: 'Selamat Hari Raya Idul Fitri',
    theme: 'Taqabbalallahu Minna Wa Minkum · Mohon Maaf Lahir & Batin',
    message:
      'Semoga cahaya fitrah mempererat tali silaturahmi, memperkuat moderasi beragama, dan membawa keberkahan bagi seluruh masyarakat Kabupaten Murung Raya.',
    bgGradient: 'from-[#042f24] via-[#065f46] to-[#0f3d2e]',
    accentColor: '#fde047',
    borderGlow: 'rgba(250, 204, 21, 0.5)',
  },
  {
    id: 'kartini',
    month: 4,
    day: 21,
    windowBeforeDays: 4,
    windowAfterDays: 3,
    dateLabel: '21 April',
    badge: 'HARI NASIONAL',
    shortTitle: 'Hari Kartini',
    headline: 'Selamat Hari Kartini',
    theme: 'Habis Gelap Terbitlah Terang · Perempuan Berdaya Bangsa Mulia',
    message:
      'Meneladani semangat perjuangan R.A. Kartini dalam memajukan pendidikan, kesetaraan, dan peran perempuan bagi kemajuan Kabupaten Murung Raya.',
    bgGradient: 'from-[#1e1b4b] via-[#3730a3] to-[#0f172a]',
    accentColor: '#fde68a',
    borderGlow: 'rgba(129, 140, 248, 0.45)',
  },
  {
    id: 'hardiknas',
    month: 5,
    day: 2,
    windowBeforeDays: 5,
    windowAfterDays: 5,
    dateLabel: '2 Mei',
    badge: 'PENDIDIKAN NASIONAL',
    shortTitle: 'Hari Pendidikan Nasional',
    headline: 'Selamat Hari Pendidikan Nasional',
    theme: 'Madrasah Maju, Bermutu, dan Mendunia',
    message:
      'Bersama memajukan kualitas pendidikan agama dan keagamaan demi melahirkan generasi Murung Raya yang cerdas, berkarakter, dan berakhlak mulia.',
    bgGradient: 'from-[#0c2d48] via-[#075985] to-[#082f49]',
    accentColor: '#fde047',
    borderGlow: 'rgba(56, 189, 248, 0.45)',
  },
  {
    id: 'waisak',
    month: 5,
    day: 31,
    windowBeforeDays: 5,
    windowAfterDays: 2,
    dateLabel: 'Tri Suci Waisak',
    badge: 'HARI RAYA BUDDHA',
    shortTitle: 'Hari Raya Tri Suci Waisak',
    headline: 'Selamat Hari Raya Waisak',
    theme: 'Sabbe Satta Bhavantu Sukhitatta · Semoga Semua Makhluk Berbahagia',
    message:
      'Keluarga Besar Kantor Kementerian Agama Kabupaten Murung Raya mengucapkan Selamat Memperingati Hari Tri Suci Waisak. Semoga kedamaian menyertai kita semua.',
    bgGradient: 'from-[#422006] via-[#854d0e] to-[#1c1917]',
    accentColor: '#fef08a',
    borderGlow: 'rgba(250, 204, 21, 0.45)',
  },
  {
    id: 'lahir-pancasila',
    month: 6,
    day: 1,
    windowBeforeDays: 3,
    windowAfterDays: 7,
    dateLabel: '1 Juni',
    badge: 'HARI NASIONAL',
    shortTitle: 'Hari Lahir Pancasila',
    headline: 'Selamat Hari Lahir Pancasila',
    theme: 'Pancasila Jiwa Pemersatu Bangsa dalam Kerukunan Umat',
    message:
      'Mengamalkan nilai-nilai luhur Pancasila untuk menjaga persatuan, toleransi, dan moderasi beragama di Bumi Tana Malai Tolung Lingu.',
    bgGradient: 'from-[#450a0a] via-[#7f1d1d] to-[#1c1917]',
    accentColor: '#fde047',
    borderGlow: 'rgba(248, 113, 113, 0.45)',
  },
  {
    id: 'idul-adha',
    month: 5,
    day: 27,
    windowBeforeDays: 5,
    windowAfterDays: 4,
    dateLabel: '10 Dzulhijjah',
    badge: 'IDUL ADHA',
    shortTitle: 'Hari Raya Idul Adha',
    headline: 'Selamat Hari Raya Idul Adha',
    theme: 'Semangat Berkurban, Keikhlasan & Kepedulian Sosial',
    message:
      'Semoga semangat pengorbanan dan keikhlasan di Hari Raya Idul Adha menguatkan solidaritas serta kepedulian terhadap sesama.',
    bgGradient: 'from-[#052e16] via-[#14532d] to-[#064e3b]',
    accentColor: '#fcd34d',
    borderGlow: 'rgba(52, 211, 153, 0.45)',
  },
  {
    id: 'tahun-baru-islam',
    month: 6,
    day: 16,
    windowBeforeDays: 6,
    windowAfterDays: 6,
    dateLabel: '1 Muharram',
    badge: 'TAHUN BARU HIJRIYAH',
    shortTitle: 'Tahun Baru Islam 1 Muharram',
    headline: 'Selamat Tahun Baru Islam',
    theme: 'Spirit Hijrah Menuju Pelayanan Umat yang Lebih Baik',
    message:
      'Mari jadikan momentum 1 Muharram untuk berhijrah menuju kebaikan, memperkokoh ukhuwah, dan meningkatkan kualitas pengabdian.',
    bgGradient: 'from-[#042f2e] via-[#0f766e] to-[#064e3b]',
    accentColor: '#fde047',
    borderGlow: 'rgba(45, 212, 191, 0.45)',
  },
  {
    id: 'hut-ri',
    month: 8,
    day: 17,
    windowBeforeDays: 14,
    windowAfterDays: 10,
    dateLabel: '17 Agustus',
    badge: 'DIRGAHAYU RI',
    shortTitle: 'Hari Kemerdekaan RI',
    headline: 'Dirgahayu Republik Indonesia',
    theme: 'Bersatu Berdaulat, Rakyat Sejahtera, Indonesia Maju',
    message:
      'Dengan semangat kemerdekaan 17 Agustus, Kankemenag Kabupaten Murung Raya terus menghadirkan pelayanan keagamaan yang inklusif dan akuntabel.',
    bgGradient: 'from-[#7f1d1d] via-[#991b1b] to-[#1e1b18]',
    accentColor: '#fde047',
    borderGlow: 'rgba(239, 68, 68, 0.55)',
  },
  {
    id: 'maulid-nabi',
    month: 8,
    day: 25,
    windowBeforeDays: 6,
    windowAfterDays: 6,
    dateLabel: '12 Rabiul Awal',
    badge: 'HARI BESAR ISLAM',
    shortTitle: 'Maulid Nabi Muhammad SAW',
    headline: 'Selamat Maulid Nabi Muhammad SAW',
    theme: 'Meneladani Akhlak Rasulullah sebagai Rahmatan Lil Alamin',
    message:
      'Semoga keteladanan Rasulullah SAW senantiasa menginspirasi kita dalam menebar kasih sayang, kedamaian, dan pelayanan terbaik bagi umat.',
    bgGradient: 'from-[#022c22] via-[#065f46] to-[#115e59]',
    accentColor: '#fde047',
    borderGlow: 'rgba(16, 185, 129, 0.5)',
  },
  {
    id: 'hari-santri',
    month: 10,
    day: 22,
    windowBeforeDays: 10,
    windowAfterDays: 5,
    dateLabel: '22 Oktober',
    badge: 'HARI SANTRI NASIONAL',
    shortTitle: 'Hari Santri Nasional',
    headline: 'Selamat Hari Santri Nasional',
    theme: 'Menyambung Juang Merengkuh Masa Depan',
    message:
      'Mengapresiasi dedikasi para kiai, ustadz, dan santri dalam menjaga nilai keagamaan, kebangsaan, serta moderasi beragama di Kabupaten Murung Raya.',
    bgGradient: 'from-[#022c22] via-[#047857] to-[#0f3d2e]',
    accentColor: '#fde047',
    borderGlow: 'rgba(52, 211, 153, 0.55)',
  },
  {
    id: 'sumpah-pemuda',
    month: 10,
    day: 28,
    windowBeforeDays: 4,
    windowAfterDays: 4,
    dateLabel: '28 Oktober',
    badge: 'HARI NASIONAL',
    shortTitle: 'Hari Sumpah Pemuda',
    headline: 'Selamat Hari Sumpah Pemuda',
    theme: 'Maju Bersama Pemuda Rukun & Berdaya Saing',
    message:
      'Satu Nusa, Satu Bangsa, Satu Bahasa Indonesia. Bersama generasi muda Murung Raya membangun harmoni dan kemajuan daerah.',
    bgGradient: 'from-[#7c2d12] via-[#991b1b] to-[#1e293b]',
    accentColor: '#fde047',
    borderGlow: 'rgba(248, 113, 113, 0.5)',
  },
  {
    id: 'hari-pahlawan',
    month: 11,
    day: 10,
    windowBeforeDays: 7,
    windowAfterDays: 5,
    dateLabel: '10 November',
    badge: 'HARI PAHLAWAN',
    shortTitle: 'Hari Pahlawan Nasional',
    headline: 'Selamat Hari Pahlawan',
    theme: 'Teladani Pahlawanmu, Cintai Negerimu',
    message:
      'Mengenang jasa para pahlawan bangsa dengan melanjutkan perjuangan melalui pengabdian tulus dan pelayanan publik yang berintegritas.',
    bgGradient: 'from-[#450a0a] via-[#7f1d1d] to-[#1c1917]',
    accentColor: '#fcd34d',
    borderGlow: 'rgba(248, 113, 113, 0.5)',
  },
  {
    id: 'hari-guru',
    month: 11,
    day: 25,
    windowBeforeDays: 10,
    windowAfterDays: 8,
    dateLabel: '25 November',
    badge: 'HARI GURU NASIONAL',
    shortTitle: 'Peringatan Hari Guru Nasional',
    headline: 'Selamat Hari Guru Nasional',
    theme: 'Guru Berdaya, Madrasah & Sekolah Hebat, Indonesia Kuat',
    message:
      'Keluarga Besar Kantor Kementerian Agama Kabupaten Murung Raya mengucapkan Selamat Hari Guru Nasional. Terima kasih atas dedikasi seluruh guru madrasah, guru pendidikan agama, dan pendidik bangsa dalam mencerdaskan generasi penerus.',
    bgGradient: 'from-[#042f24] via-[#065f46] to-[#0c3547]',
    accentColor: '#fde047',
    borderGlow: 'rgba(250, 204, 21, 0.55)',
  },
  {
    id: 'hakordia',
    month: 12,
    day: 9,
    windowBeforeDays: 5,
    windowAfterDays: 5,
    dateLabel: '9 Desember',
    badge: 'ZONA INTEGRITAS',
    shortTitle: 'Hari Antikorupsi Sedunia',
    headline: 'Selamat Hari Antikorupsi Sedunia',
    theme: 'Teguhkan Komitmen Berantas Korupsi untuk Indonesia Maju',
    message:
      'Kankemenag Kabupaten Murung Raya berkomitmen penuh membangun Zona Integritas menuju WBK/WBBM yang bersih, transparan, dan bebas pungli.',
    bgGradient: 'from-[#064e3b] via-[#0f172a] to-[#022c22]',
    accentColor: '#34d399',
    borderGlow: 'rgba(52, 211, 153, 0.5)',
  },
  {
    id: 'hari-ibu',
    month: 12,
    day: 22,
    windowBeforeDays: 4,
    windowAfterDays: 1,
    dateLabel: '22 Desember',
    badge: 'HARI NASIONAL',
    shortTitle: 'Hari Ibu Nasional',
    headline: 'Selamat Hari Ibu',
    theme: 'Perempuan Berdaya, Keluarga Sakinah, Indonesia Maju',
    message:
      'Penghargaan setinggi-tingginya kepada seluruh Ibu atas cinta, doa, dan peran mulia dalam membangun keluarga serta generasi berakhlak mulia.',
    bgGradient: 'from-[#4c0519] via-[#881337] to-[#1f2937]',
    accentColor: '#fde68a',
    borderGlow: 'rgba(251, 113, 133, 0.5)',
  },
  {
    id: 'natal',
    month: 12,
    day: 25,
    windowBeforeDays: 2,
    windowAfterDays: 4,
    dateLabel: '25 Desember',
    badge: 'HARI RAYA NATAL',
    shortTitle: 'Hari Raya Natal',
    headline: 'Selamat Hari Raya Natal',
    theme: 'Damai di Bumi, Kasih & Kerukunan bagi Semua Umat',
    message:
      'Keluarga Besar Kantor Kementerian Agama Kabupaten Murung Raya mengucapkan Selamat Hari Raya Natal kepada seluruh umat Kristiani. Semoga damai dan sukacita Natal menyertai kita semua.',
    bgGradient: 'from-[#052e16] via-[#14532d] to-[#7f1d1d]',
    accentColor: '#fde047',
    borderGlow: 'rgba(250, 204, 21, 0.5)',
  },
];

function dayOfYear(month: number, day: number, year: number): number {
  const start = new Date(year, 0, 0);
  const target = new Date(year, month - 1, day);
  return Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function circularDayDiff(fromDoy: number, toDoy: number, yearDays: number): number {
  let diff = toDoy - fromDoy;
  if (diff > yearDays / 2) diff -= yearDays;
  if (diff < -yearDays / 2) diff += yearDays;
  return diff;
}

/**
 * Mengembalikan ucapan hari besar yang paling relevan dengan tanggal kalender saat ini.
 * Jika tanggal saat ini berada dalam rentang peringatan suatu hari besar (contoh: 24-25 November -> Hari Guru Nasional),
 * hari besar tersebut langsung dipilih; jika di luar jendela aktif, memilih hari besar terdekat berikutnya.
 */
export function getActiveHolidayGreeting(referenceDate: Date = new Date()): CalendarHolidayGreeting {
  const year = referenceDate.getFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const yearDays = isLeap ? 366 : 365;
  const todayDoy = dayOfYear(referenceDate.getMonth() + 1, referenceDate.getDate(), year);

  // 1. Cari hari besar yang sedang dalam jendela peringatan aktif (paling dekat dengan tanggal hari ini)
  let bestActive: { item: CalendarHolidayGreeting; absDiff: number } | null = null;
  for (const item of CALENDAR_HOLIDAY_GREETINGS) {
    const targetDoy = dayOfYear(item.month, item.day, year);
    const diff = circularDayDiff(todayDoy, targetDoy, yearDays);
    const before = item.windowBeforeDays ?? 7;
    const after = item.windowAfterDays ?? 5;
    // diff >= 0 means upcoming in `diff` days; diff < 0 means passed `-diff` days ago
    if (diff <= before && diff >= -after) {
      const absDiff = Math.abs(diff);
      if (!bestActive || absDiff < bestActive.absDiff) {
        bestActive = { item, absDiff };
      }
    }
  }
  if (bestActive) return bestActive.item;

  // 2. Fallback: pilih hari besar terdekat berikutnya pada kalender
  let nextUpcoming: { item: CalendarHolidayGreeting; daysAhead: number } | null = null;
  for (const item of CALENDAR_HOLIDAY_GREETINGS) {
    const targetDoy = dayOfYear(item.month, item.day, year);
    let ahead = targetDoy - todayDoy;
    if (ahead < 0) ahead += yearDays;
    if (!nextUpcoming || ahead < nextUpcoming.daysAhead) {
      nextUpcoming = { item, daysAhead: ahead };
    }
  }

  return nextUpcoming?.item ?? CALENDAR_HOLIDAY_GREETINGS[16];
}

export function formatIndonesianCalendarDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return '25 November 2026';
  }
}
