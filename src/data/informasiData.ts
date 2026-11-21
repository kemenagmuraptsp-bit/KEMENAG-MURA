import { KUA_BRANCHES } from '@/src/data/kemenagData';

export type SeksiKeyId =
  | 'sekretariat'
  | 'bimas-islam'
  | 'pendis'
  | 'bimas-hindu'
  | 'bimas-kristen'
  | 'kepegawaian';

export type InformasiUnitId =
  | 'kepegawaian'
  | 'bimas-islam'
  | 'pendis'
  | 'bimas-hindu'
  | 'penyelenggara-kristen'
  | 'sekretariat-jenderal';

export interface InfoMetric {
  label: string;
  value: string;
  note?: string;
}

export interface InfoOrgNode {
  role: string;
  name: string;
  nip?: string;
  level: 'pimpinan' | 'koordinator' | 'pelaksana';
  division?: string;
}

export interface InfoSection {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  metrics: InfoMetric[];
  columns?: string[];
  rows?: string[][];
  orgNodes?: InfoOrgNode[];
  footnote?: string;
}

export interface InformasiUnitConfig {
  id: InformasiUnitId;
  seksiUnitId: SeksiKeyId;
  title: string;
  shortTitle: string;
  description: string;
  externalUrl?: string;
  sections: InfoSection[];
}

export const INFORMASI_UNITS: InformasiUnitConfig[] = [
  {
    id: 'kepegawaian',
    seksiUnitId: 'kepegawaian',
    title: 'Informasi Kepegawaian',
    shortTitle: 'Kepegawaian',
    description:
      'Data kepegawaian Aparatur Sipil Negara (ASN) PNS dan PPPK pada Kantor Kementerian Agama Kabupaten Murung Raya, KUA Kecamatan, serta Madrasah Negeri.',
    sections: [
      {
        id: 'data-asn-kemenag',
        label: 'Data ASN Kemenag',
        title: 'Data ASN Kemenag Kabupaten Murung Raya',
        subtitle:
          'Rekapitulasi distribusi Aparatur Sipil Negara (PNS & PPPK) berdasarkan satuan kerja dan unit penempatan aktif tahun 2026.',
        updatedAt: 'Pemutakhiran Data · November 2026',
        metrics: [
          { label: 'Total ASN Aktif', value: '248 Pegawai', note: 'PNS & PPPK Terdaftar SIMPEG 5' },
          { label: 'Pegawai Negeri Sipil (PNS)', value: '164 Pegawai', note: 'Struktural, Fungsional & Pelaksana' },
          { label: 'PPPK Kemenag', value: '84 Pegawai', note: 'Penyuluh, Penghulu, Guru & Teknis' },
        ],
        columns: ['No', 'Unit Penempatan / Satker', 'PNS', 'PPPK', 'Total ASN', 'Keterangan Jabatan Dominan'],
        rows: [
          ['1', 'Sekretariat / Subbag Tata Usaha Kankemenag', '24', '12', '36', 'Analis SDM, Perencana, Pranata Keuangan, Arsiparis'],
          ['2', 'Seksi Bimbingan Masyarakat Islam & 10 KUA', '32', '26', '58', 'Penghulu, Penyuluh Agama Islam, Staf KUA'],
          ['3', 'Seksi Pendidikan Islam & Madrasah Negeri', '86', '34', '120', 'Guru Madrasah (MIN, MTsN, MAN), Pengawas, TU'],
          ['4', 'Penyelenggara Bimas Hindu', '8', '5', '13', 'Penyuluh Agama Hindu, Guru Agama Hindu, Staf'],
          ['5', 'Penyelenggara Bimas Kristen', '10', '6', '16', 'Penyuluh Agama Kristen, Guru PAK, Pengadministrasi'],
          ['6', 'Pembinaan Masyarakat Katolik & Penyelenggara Zawa', '4', '1', '5', 'Penyuluh Katolik, Pelaksana Zakat Wakaf'],
        ],
        footnote:
          'Sumber data: Subbag Tata Usaha (Kepegawaian) melalui integrasi SIMPEG 5 & ASN Digital BKN.',
      },
    ],
  },
  {
    id: 'bimas-islam',
    seksiUnitId: 'bimas-islam',
    title: 'Informasi Bimas Islam',
    shortTitle: 'Bimas Islam',
    description:
      'Pusat data publik Seksi Bimbingan Masyarakat Islam mencakup KUA Kecamatan, Masjid, Musholla, Penyuluh Agama Islam, dan Struktur Organisasi.',
    sections: [
      {
        id: 'data-kua',
        label: 'Data KUA',
        title: 'Data Kantor Urusan Agama (KUA) Kecamatan',
        subtitle:
          'Daftar Kantor Urusan Agama Kecamatan di wilayah Kabupaten Murung Raya beserta alamat dan layanan pencatatan nikah/wakaf.',
        updatedAt: 'Data Aktif · 2026',
        metrics: [
          { label: 'Jumlah KUA Kecamatan', value: '10 Kecamatan', note: 'Melayani Seluruh Kab. Murung Raya' },
          { label: 'Layanan SIMKAH', value: 'Terintegrasi', note: 'Pencatatan Nikah & Rujuk Daring' },
          { label: 'Jam Pelayanan', value: '07:30–16:00 WIB', note: 'Senin sampai Jum’at' },
        ],
        columns: ['No', 'Nama KUA Kecamatan', 'Alamat Kantor', 'Kepala / Status Pelayanan', 'Jam Layanan'],
        rows: [
          ...KUA_BRANCHES.map((kua, idx) => [
            String(idx + 1),
            kua.kecamatan,
            kua.address,
            kua.head,
            kua.hours,
          ]),
          ['7', 'KUA Kecamatan Sungai Babuat', 'Tumbang Bantian, Kec. Sungai Babuat', 'Pelayanan Aktif Kec. Sungai Babuat', 'Senin–Jum’at · 07:30–16:00 WIB'],
          ['8', 'KUA Kecamatan Tanah Siang Selatan', 'Datah Kotou, Kec. Tanah Siang Selatan', 'Pelayanan Aktif Kec. Tanah Siang Selatan', 'Senin–Jum’at · 07:30–16:00 WIB'],
          ['9', 'KUA Kecamatan Seribu Riam', 'Muara Joloi I, Kec. Seribu Riam', 'Pelayanan Aktif Kec. Seribu Riam', 'Senin–Jum’at · 07:30–16:00 WIB'],
          ['10', 'KUA Kecamatan Uut Murung', 'Kalasin, Kec. Uut Murung', 'Pelayanan Aktif Kec. Uut Murung', 'Senin–Jum’at · 07:30–16:00 WIB'],
        ],
        footnote: 'Sumber data: Seksi Bimas Islam Kankemenag Kabupaten Murung Raya.',
      },
      {
        id: 'data-mesjid',
        label: 'Data Mesjid',
        title: 'Data Mesjid Terdaftar (SIMAS) Kab. Murung Raya',
        subtitle:
          'Daftar Masjid Agung, Masjid Besar Kecamatan, dan Masjid Jami yang terdata pada Sistem Informasi Masjid (SIMAS).',
        updatedAt: 'Rekap SIMAS · 2026',
        metrics: [
          { label: 'Total Masjid Terdata', value: '74 Masjid', note: 'Tersebar di 10 Kecamatan' },
          { label: 'Masjid Agung Kabupaten', value: '1 Masjid', note: 'Masjid Agung Al-Istiqlal Puruk Cahu' },
          { label: 'Masjid Besar Kecamatan', value: '10 Masjid', note: 'Tersertifikasi Arah Kiblat & ID SIMAS' },
        ],
        columns: ['No', 'Nama Masjid', 'Tipologi', 'Kecamatan', 'Alamat / Lokasi', 'Status ID SIMAS'],
        rows: [
          ['1', 'Masjid Agung Al-Istiqlal', 'Masjid Agung', 'Murung', 'Jl. Jend. Sudirman, Puruk Cahu', 'Terdaftar & Ber-ID SIMAS'],
          ['2', 'Masjid Besar Nurul Islam', 'Masjid Besar', 'Murung', 'Kel. Beriwit, Puruk Cahu', 'Terdaftar & Ber-ID SIMAS'],
          ['3', 'Masjid Besar Darussalam', 'Masjid Besar', 'Laung Tuhup', 'Muara Laung I, Laung Tuhup', 'Terdaftar & Ber-ID SIMAS'],
          ['4', 'Masjid Besar Baiturrahman', 'Masjid Besar', 'Tanah Siang', 'Saripoi, Tanah Siang', 'Terdaftar & Ber-ID SIMAS'],
          ['5', 'Masjid Besar Al-Mujahidin', 'Masjid Besar', 'Permata Intan', 'Tumbang Lahung, Permata Intan', 'Terdaftar & Ber-ID SIMAS'],
          ['6', 'Masjid Besar Al-Muhajirin', 'Masjid Besar', 'Sumber Barito', 'Tumbang Kunyi, Sumber Barito', 'Terdaftar & Ber-ID SIMAS'],
          ['7', 'Masjid Jami At-Taqwa', 'Masjid Jami', 'Barito Tuhup Raya', 'Makunjung, Barito Tuhup Raya', 'Terdaftar & Ber-ID SIMAS'],
          ['8', 'Masjid Al-Ikhlas', 'Masjid Jami', 'Tanah Siang Selatan', 'Datah Kotou, Tanah Siang Selatan', 'Terdaftar & Ber-ID SIMAS'],
        ],
        footnote: 'Pengurus masjid dapat mengajukan pembaruan ID SIMAS dan pengukuran arah kiblat melalui Layanan PTSP Bimas Islam.',
      },
      {
        id: 'data-musholla',
        label: 'Data Musholla',
        title: 'Data Musholla / Langgar Kabupaten Murung Raya',
        subtitle:
          'Rekapitulasi persebaran musholla dan langgar di lingkungan permukiman, perkantoran, serta fasilitas umum per kecamatan.',
        updatedAt: 'Rekap SIMAS · 2026',
        metrics: [
          { label: 'Total Musholla Terdata', value: '112 Musholla', note: 'Lingkungan Desa, Kelurahan & Kantor' },
          { label: 'Kecamatan Terbanyak', value: 'Kec. Murung (38)', note: 'Wilayah Ibu Kota Kabupaten' },
          { label: 'Status Pembinaan', value: 'Aktif', note: 'Didampingi Penyuluh & KUA Setempat' },
        ],
        columns: ['No', 'Kecamatan', 'Jumlah Musholla / Langgar', 'Musholla Perkantoran/Fasum', 'Koordinator Wilayah'],
        rows: [
          ['1', 'Kecamatan Murung', '38', '11', 'KUA Kecamatan Murung'],
          ['2', 'Kecamatan Laung Tuhup', '22', '4', 'KUA Kecamatan Laung Tuhup'],
          ['3', 'Kecamatan Permata Intan', '16', '3', 'KUA Kecamatan Permata Intan'],
          ['4', 'Kecamatan Tanah Siang', '11', '2', 'KUA Kecamatan Tanah Siang'],
          ['5', 'Kecamatan Sumber Barito', '9', '2', 'KUA Kecamatan Sumber Barito'],
          ['6', 'Kecamatan Barito Tuhup Raya', '7', '1', 'KUA Kecamatan Barito Tuhup Raya'],
          ['7', 'Kecamatan Lainnya (4 Kec.)', '9', '2', 'KUA Kecamatan Masing-masing'],
        ],
        footnote: 'Pendataan musholla diperbarui berkala bersama takmir dan Penyuluh Agama Islam Kecamatan.',
      },
      {
        id: 'data-penyuluh',
        label: 'Data Penyuluh',
        title: 'Data Penyuluh Agama Islam Kabupaten Murung Raya',
        subtitle:
          'Sebaran Penyuluh Agama Islam Fungsional (PNS & PPPK) serta Penyuluh Non-PNS di 10 kecamatan binaan.',
        updatedAt: 'Data Bimas Islam · 2026',
        metrics: [
          { label: 'Total Penyuluh Islam', value: '48 Orang', note: 'PNS, PPPK & Penyuluh Non-PNS' },
          { label: 'Fokus Binaan', value: '8 Bidang Spesialisasi', note: 'Moderasi, Wakaf, Keluarga Sakinah, TPQ' },
          { label: 'Cakupan Wilayah', value: '10 Kecamatan', note: 'Kelompok Majelis Taklim & Desa Binaan' },
        ],
        columns: ['No', 'Wilayah Tugas / Kecamatan', 'Jumlah Penyuluh', 'Status Kepegawaian', 'Fokus Pembinaan Utama'],
        rows: [
          ['1', 'Kecamatan Murung', '12 Orang', 'PNS, PPPK & Non-PNS', 'Majelis Taklim, Pemberantasan Buta Aksara Al-Qur’an, Moderasi'],
          ['2', 'Kecamatan Laung Tuhup', '8 Orang', 'PPPK & Non-PNS', 'Bimbingan Keluarga Sakinah, Zakat Wakaf, Remaja Masjid'],
          ['3', 'Kecamatan Permata Intan', '6 Orang', 'PPPK & Non-PNS', 'Pembinaan TPQ/TPA, Kerukunan Umat Beragama'],
          ['4', 'Kecamatan Tanah Siang', '6 Orang', 'PPPK & Non-PNS', 'Penyuluhan Desa Binaan & Produk Halal'],
          ['5', 'Kecamatan Sumber Barito', '5 Orang', 'PPPK & Non-PNS', 'Pembinaan Muallaf & Majelis Taklim Hulu Barito'],
          ['6', 'Kecamatan Barito Tuhup Raya & Lainnya', '11 Orang', 'PPPK & Non-PNS', 'Literasi Keagamaan & Pendampingan Rumah Ibadah'],
        ],
      },
      {
        id: 'struktur-organisasi',
        label: 'Struktur Organisasi',
        title: 'Struktur Organisasi Seksi Bimbingan Masyarakat Islam',
        subtitle:
          'Susunan tata kerja dan pejabat pengelola layanan pada Seksi Bimas Islam & Penyelenggaraan Haji/Zakat Wakaf Kankemenag Murung Raya.',
        updatedAt: 'Struktur Aktif · 2026',
        metrics: [
          { label: 'Pimpinan Kantor', value: 'Kepala Kankemenag', note: 'H. Maslan, S.Ag., M.Pd.' },
          { label: 'Unit Pelaksana Teknis', value: '10 KUA Kecamatan', note: 'Koordinasi Langsung Bimas Islam' },
          { label: 'Kelompok Fungsional', value: 'Penghulu & Penyuluh', note: 'Pembinaan Keagamaan Umat Islam' },
        ],
        orgNodes: [
          {
            role: 'Kepala Kantor Kemenag Kab. Murung Raya',
            name: 'H. Maslan, S.Ag., M.Pd.',
            level: 'pimpinan',
            division: 'Pembina & Penanggung Jawab Utama',
          },
          {
            role: 'Kepala Seksi Bimbingan Masyarakat Islam',
            name: 'Koordinator Seksi Bimas Islam',
            level: 'koordinator',
            division: 'Perumusan Kebijakan, Pembinaan KUA, Masjid & Penyuluhan',
          },
          {
            role: 'Pengadministrasi Layanan KUA & Kepenghuluan',
            name: 'Tim Pelaksana Urusan KUA & Nikah',
            level: 'pelaksana',
            division: 'Monitoring SIMKAH, Rekomendasi Nikah, Akreditasi KUA',
          },
          {
            role: 'Pengelola Kemasjidan, Hisab Rukyat & Produk Halal',
            name: 'Tim Pelaksana Kemasjidan & Kiblat',
            level: 'pelaksana',
            division: 'SIMAS, Pengukuran Arah Kiblat, Pembinaan Majelis Taklim',
          },
          {
            role: 'Penyelenggara Zakat & Wakaf / Penyuluh Agama',
            name: 'Tim Fungsional Penyuluh & Zawa',
            level: 'pelaksana',
            division: 'Akta Ikrar Wakaf (AIW), Nazhir, Bimbingan Penyuluh',
          },
        ],
      },
    ],
  },
  {
    id: 'pendis',
    seksiUnitId: 'pendis',
    title: 'Informasi Pendidikan Islam',
    shortTitle: 'Pendidikan Islam',
    externalUrl: 'https://sipendismura.my.id',
    description:
      'Data lembaga Pendidikan Islam (RA/Madrasah, Pondok Pesantren, TPQ, dan Guru PAI) Kabupaten Murung Raya serta tautan portal layanan SIPENDISMURA (sipendismura.my.id).',
    sections: [
      {
        id: 'data-madrasah',
        label: 'Data Madrasah',
        title: 'Data RA & Madrasah Kabupaten Murung Raya',
        subtitle:
          'Rekapitulasi Raudhatul Athfal (RA), Madrasah Ibtidaiyah (MI), Madrasah Tsanawiyah (MTs), dan Madrasah Aliyah (MA) Negeri & Swasta.',
        updatedAt: 'Data EMIS · 2026',
        metrics: [
          { label: 'Total Satuan Pendidikan', value: '36 Lembaga', note: 'RA, MI, MTs & MA Negeri/Swasta' },
          { label: 'Madrasah Negeri', value: '7 Madrasah', note: 'MIN, MTsN & MAN Kab. Murung Raya' },
          { label: 'Aplikasi Terkait', value: 'SIPENDISMURA', note: 'sipendismura.my.id & EMIS 4.0' },
        ],
        columns: ['No', 'Jenjang / Nama Lembaga', 'NSM', 'Kecamatan', 'Status'],
        rows: [
          ['1', 'MAN 1 Murung Raya', '131162120001', 'Murung (Puruk Cahu)', 'Negeri · Terakreditasi'],
          ['2', 'MTsN 1 Murung Raya', '121162120001', 'Murung (Puruk Cahu)', 'Negeri · Terakreditasi'],
          ['3', 'MTsN 2 Murung Raya', '121162120002', 'Laung Tuhup', 'Negeri · Terakreditasi'],
          ['4', 'MIN 1 Murung Raya', '111162120001', 'Murung (Puruk Cahu)', 'Negeri · Terakreditasi'],
          ['5', 'MI & MTs Swasta Binaan Pendis', 'Terdata EMIS', 'Tersebar di Kec. Murung, Laung Tuhup & Permata Intan', 'Swasta · Berizin Operasional'],
        ],
        footnote: 'Untuk layanan data terperinci dan pengajuan Pendis kunjungi https://sipendismura.my.id.',
      },
      {
        id: 'data-pontren-tpq',
        label: 'Data Pontren & TPQ',
        title: 'Data Pondok Pesantren, MDT & LPQ/TPQ',
        subtitle:
          'Daftar Pondok Pesantren, Madrasah Diniyah Takmiliyah (MDT), dan Taman Pendidikan Al-Qur’an (TPQ) terdaftar di Kabupaten Murung Raya.',
        updatedAt: 'Data EMIS · 2026',
        metrics: [
          { label: 'Pondok Pesantren', value: '8 Pontren', note: 'Memiliki Nomor Statistik Pesantren (NSP)' },
          { label: 'Lembaga TPQ / LPQ', value: '64 Lembaga', note: 'Aktif di 10 Kecamatan' },
          { label: 'Madrasah Diniyah', value: '12 MDT', note: 'Terdaftar EMIS Pontren' },
        ],
        columns: ['No', 'Jenis Lembaga', 'Jumlah Terdaftar', 'Kecamatan Utama', 'Status Izin Operasional'],
        rows: [
          ['1', 'Pondok Pesantren (Salafiyah & Modern)', '8 Lembaga', 'Murung, Laung Tuhup, Permata Intan', 'Ber-NSP & Aktif EMIS'],
          ['2', 'Taman Pendidikan Al-Qur’an (TPQ / LPQ)', '64 Lembaga', 'Seluruh 10 Kecamatan', 'Terdaftar SKT / Ijop Kemenag'],
          ['3', 'Madrasah Diniyah Takmiliyah (MDT)', '12 Lembaga', 'Murung, Tanah Siang, Laung Tuhup', 'Terdaftar EMIS'],
        ],
      },
      {
        id: 'data-guru-pai',
        label: 'Data Guru PAI & Madrasah',
        title: 'Data Guru Pendidikan Agama Islam (PAI) & Guru Madrasah',
        subtitle:
          'Sebaran Guru PAI pada sekolah umum (SD/SMP/SMA/SMK) serta Guru Madrasah terdata di aplikasi SIAGA dan EMIS.',
        updatedAt: 'Data SIAGA & EMIS · 2026',
        metrics: [
          { label: 'Guru Madrasah Terdata', value: '245 Guru', note: 'PNS, PPPK & Guru Non-ASN Madrasah' },
          { label: 'Guru PAI Sekolah Umum', value: '98 Guru', note: 'Terdaftar pada Aplikasi SIAGA Pendis' },
          { label: 'Pengawas PAI & Madrasah', value: '4 Pengawas', note: 'Pendampingan Kurikulum & Mutu' },
        ],
        columns: ['No', 'Kategori Pendidik', 'Jumlah Guru', 'Sistem Pendataan', 'Keterangan'],
        rows: [
          ['1', 'Guru Madrasah (RA, MI, MTs, MA)', '245 Guru', 'EMIS 4.0 & Simpatika', 'PNS Kemenag, PPPK & Guru Yayasan'],
          ['2', 'Guru Pendidikan Agama Islam (GPAI) SD/SMP/SMA', '98 Guru', 'SIAGA Pendis', 'ASN Kemenag, ASN Pemda & Non-ASN'],
          ['3', 'Pengawas Madrasah & Pengawas PAI', '4 Orang', 'SIAGA & Simpatika', 'Pembinaan Mutu Pembelajaran'],
        ],
      },
      {
        id: 'struktur-organisasi',
        label: 'Struktur Organisasi',
        title: 'Struktur Organisasi Seksi Pendidikan Islam (Pendis)',
        subtitle:
          'Susunan pelaksana Seksi Pendidikan Islam pada Kantor Kementerian Agama Kabupaten Murung Raya.',
        updatedAt: 'Struktur Aktif · 2026',
        metrics: [
          { label: 'Pimpinan Kantor', value: 'Kepala Kankemenag', note: 'H. Maslan, S.Ag., M.Pd.' },
          { label: 'Koordinator Seksi', value: 'Kepala Seksi Pendis', note: 'Pembinaan Madrasah, Pontren & PAI' },
          { label: 'Portal Terintegrasi', value: 'SIPENDISMURA', note: 'sipendismura.my.id' },
        ],
        orgNodes: [
          {
            role: 'Kepala Kantor Kemenag Kab. Murung Raya',
            name: 'H. Maslan, S.Ag., M.Pd.',
            level: 'pimpinan',
            division: 'Penanggung Jawab Utama Instansi',
          },
          {
            role: 'Kepala Seksi Pendidikan Islam',
            name: 'Koordinator Seksi Pendidikan Islam',
            level: 'koordinator',
            division: 'Pengelolaan RA/Madrasah, Pondok Pesantren & Pendidikan Agama Islam',
          },
          {
            role: 'Pengembang & Operator EMIS / Kurikulum Madrasah',
            name: 'Tim Pelaksana Kelembagaan Madrasah',
            level: 'pelaksana',
            division: 'Ijop Madrasah, Data EMIS, BOS & Asesmen Madrasah',
          },
          {
            role: 'Pelaksana Pendidikan Diniyah, Pontren & TPQ',
            name: 'Tim Pelaksana PD-Pontren',
            level: 'pelaksana',
            division: 'Izin Operasional TPQ/MDT, Statistik Pontren & Tunjangan',
          },
          {
            role: 'Pelaksana Pendidikan Agama Islam (PAI) & Pengawas',
            name: 'Tim Pelaksana PAI & Pengawas',
            level: 'pelaksana',
            division: 'SIAGA GPAI, PPG PAI & Supervisi Sekolah/Madrasah',
          },
        ],
      },
    ],
  },
  {
    id: 'bimas-hindu',
    seksiUnitId: 'bimas-hindu',
    title: 'Informasi Bimas Hindu',
    shortTitle: 'Bimas Hindu',
    description:
      'Data layanan informasi Penyelenggara Bimas Hindu Kabupaten Murung Raya meliputi Rumah Ibadah, Penyuluh, Pasraman, Guru Agama Hindu, dan Struktur Organisasi.',
    sections: [
      {
        id: 'data-rumah-ibadah',
        label: 'Data Rumah Ibadah',
        title: 'Data Rumah Ibadah Hindu / Balai Basarah',
        subtitle:
          'Daftar Pura dan Balai Basarah Hindu Kaharingan yang terdaftar di Penyelenggara Bimas Hindu Kabupaten Murung Raya.',
        updatedAt: 'Data Aktif · 2026',
        metrics: [
          { label: 'Rumah Ibadah Terdata', value: '34 Unit', note: 'Balai Basarah & Pura' },
          { label: 'Tanda Daftar Resmi', value: 'Terverifikasi', note: 'Direktorat Jenderal Bimas Hindu' },
          { label: 'Cakupan Kecamatan', value: '8 Kecamatan', note: 'Murung, Tanah Siang, Sungai Babuat, dll.' },
        ],
        columns: ['No', 'Nama Rumah Ibadah', 'Jenis', 'Kecamatan', 'Status Pendaftaran'],
        rows: [
          ['1', 'Balai Basarah Hintan Kaharingan', 'Balai Basarah', 'Murung (Puruk Cahu)', 'Terdaftar Resmi Kemenag'],
          ['2', 'Balai Basarah Ranying Hatalla', 'Balai Basarah', 'Tanah Siang', 'Terdaftar Resmi Kemenag'],
          ['3', 'Balai Basarah Penyang Hinje Simpei', 'Balai Basarah', 'Laung Tuhup', 'Terdaftar Resmi Kemenag'],
          ['4', 'Balai Basarah Sinar Kaharingan', 'Balai Basarah', 'Tanah Siang Selatan', 'Terdaftar Resmi Kemenag'],
          ['5', 'Balai Basarah Lewu Mandau', 'Balai Basarah', 'Sungai Babuat', 'Terdaftar Resmi Kemenag'],
          ['6', 'Balai Basarah Taman Sari', 'Balai Basarah', 'Permata Intan', 'Terdaftar Resmi Kemenag'],
        ],
      },
      {
        id: 'data-penyuluh',
        label: 'Data Penyuluh',
        title: 'Data Penyuluh Agama Hindu',
        subtitle:
          'Rekapitulasi Penyuluh Agama Hindu PNS, PPPK, dan Non-PNS yang bertugas membina umat dan kelompok Tandak Intan Kaharingan.',
        updatedAt: 'Data Bimas Hindu · 2026',
        metrics: [
          { label: 'Total Penyuluh Hindu', value: '12 Orang', note: 'ASN PPPK & Penyuluh Non-PNS' },
          { label: 'Kelompok Binaan', value: '28 Kelompok', note: 'Majelis Umat & Pemuda Hindu' },
          { label: 'Pembinaan Seni Budaya', value: 'Tandak Intan', note: 'Pelestarian Tradisi Kaharingan' },
        ],
        columns: ['No', 'Wilayah Binaan', 'Jumlah Penyuluh', 'Kategori', 'Program Pembinaan Rutin'],
        rows: [
          ['1', 'Kecamatan Murung', '3 Orang', 'PPPK & Non-PNS', 'Pembinaan Umat Perkotaan & Pasraman Akhir Pekan'],
          ['2', 'Kecamatan Tanah Siang & Tanah Siang Selatan', '4 Orang', 'PPPK & Non-PNS', 'Pembinaan Balai Basarah & Tandak Intan Kaharingan'],
          ['3', 'Kecamatan Laung Tuhup & BTR', '3 Orang', 'Non-PNS', 'Pendampingan Administrasi Rumah Ibadah & Moderasi'],
          ['4', 'Kecamatan Sungai Babuat & Sumber Barito', '2 Orang', 'Non-PNS', 'Pembinaan Keluarga Sakinah Hindu & Desa Binaan'],
        ],
      },
      {
        id: 'data-pasraman',
        label: 'Data Pasraman',
        title: 'Data Pasraman Kabupaten Murung Raya',
        subtitle:
          'Informasi lembaga pendidikan keagamaan Hindu (Pasraman Non-Formal dan Pendidikan Keagamaan Hindu) di Kabupaten Murung Raya.',
        updatedAt: 'Data Aktif · 2026',
        metrics: [
          { label: 'Pasraman Terdaftar', value: '9 Lembaga', note: 'Berizin Tanda Daftar Operasional' },
          { label: 'Peserta Didik / Siswa', value: '310 Siswa', note: 'Tingkat Pratama & Adi Widya' },
          { label: 'Status Pembinaan', value: 'Aktif', note: 'Pendampingan Bimas Hindu' },
        ],
        columns: ['No', 'Nama Pasraman', 'Kecamatan', 'Jenjang / Program', 'Status Operasional'],
        rows: [
          ['1', 'Pasraman Widya Dharma Puruk Cahu', 'Murung', 'Non-Formal (Mingguan)', 'Aktif · Berizin Kemenag'],
          ['2', 'Pasraman Kaharingan Lestari', 'Tanah Siang', 'Non-Formal (Mingguan)', 'Aktif · Berizin Kemenag'],
          ['3', 'Pasraman Ranying Pandohop', 'Laung Tuhup', 'Non-Formal (Mingguan)', 'Aktif · Berizin Kemenag'],
          ['4', 'Pasraman Bintang Timur', 'Tanah Siang Selatan', 'Non-Formal (Mingguan)', 'Aktif · Berizin Kemenag'],
          ['5', 'Pasraman Sinar Dharma', 'Sungai Babuat', 'Non-Formal (Mingguan)', 'Aktif · Berizin Kemenag'],
        ],
      },
      {
        id: 'data-guru-agama-hindu',
        label: 'Data Guru Agama Hindu',
        title: 'Data Guru Pendidikan Agama Hindu (PAH)',
        subtitle:
          'Sebaran Guru Pendidikan Agama Hindu di jenjang SD, SMP, dan SMA/SMK di lingkungan Kabupaten Murung Raya.',
        updatedAt: 'Data Bimas Hindu · 2026',
        metrics: [
          { label: 'Total Guru PAH', value: '27 Guru', note: 'ASN Kemenag, Pemda & Honorer' },
          { label: 'Sekolah Binaan', value: '41 Sekolah', note: 'SD, SMP, dan SMA/SMK' },
          { label: 'Guru Bersertifikat', value: '18 Guru', note: 'Sudah Lulus PPG Pendidikan Hindu' },
        ],
        columns: ['No', 'Jenjang Pendidikan', 'Jumlah Guru PAH', 'Status Kepegawaian', 'Asosiasi Profesi'],
        rows: [
          ['1', 'Sekolah Dasar (SD)', '16 Guru', 'PNS, PPPK & Non-ASN', 'KKG Pendidikan Agama Hindu Kab. Mura'],
          ['2', 'Sekolah Menengah Pertama (SMP)', '7 Guru', 'PNS & PPPK', 'MGMP Pendidikan Agama Hindu Kab. Mura'],
          ['3', 'Sekolah Menengah Atas/Kejuruan (SMA/SMK)', '4 Guru', 'PNS & PPPK', 'MGMP Pendidikan Agama Hindu Prov. Kalteng'],
        ],
      },
      {
        id: 'struktur-organisasi',
        label: 'Struktur Organisasi',
        title: 'Struktur Organisasi Penyelenggara Bimas Hindu',
        subtitle:
          'Susunan pelaksana tugas Penyelenggara Bimbingan Masyarakat Hindu Kantor Kemenag Kabupaten Murung Raya.',
        updatedAt: 'Struktur Aktif · 2026',
        metrics: [
          { label: 'Pimpinan Kantor', value: 'Kepala Kankemenag', note: 'H. Maslan, S.Ag., M.Pd.' },
          { label: 'Pimpinan Unit', value: 'Penyelenggara Hindu', note: 'Pembinaan Umat & Pendidikan Hindu' },
          { label: 'Tenaga Fungsional', value: 'Penyuluh & Guru PAH', note: 'Pendampingan Umat & Pasraman' },
        ],
        orgNodes: [
          {
            role: 'Kepala Kantor Kemenag Kab. Murung Raya',
            name: 'H. Maslan, S.Ag., M.Pd.',
            level: 'pimpinan',
            division: 'Penanggung Jawab Utama Kantor',
          },
          {
            role: 'Penyelenggara Bimas Hindu',
            name: 'Koordinator Penyelenggara Hindu',
            level: 'koordinator',
            division: 'Pelayanan Keagamaan, Rumah Ibadah & Pendidikan Hindu',
          },
          {
            role: 'Pengadministrasi Rumah Ibadah & Lembaga Hindu',
            name: 'Tim Pelaksana Urusan Agama Hindu',
            level: 'pelaksana',
            division: 'Tanda Daftar Balai Basarah, Bantuan & Pasraman',
          },
          {
            role: 'Kelompok Fungsional Penyuluh & Guru PAH',
            name: 'Tim Penyuluh & Guru Agama Hindu',
            level: 'pelaksana',
            division: 'Pembinaan Umat, KKG/MGMP & Moderasi Beragama',
          },
        ],
      },
    ],
  },
  {
    id: 'penyelenggara-kristen',
    seksiUnitId: 'bimas-kristen',
    title: 'Informasi Penyelenggara Kristen',
    shortTitle: 'Penyelenggara Kristen',
    description:
      'Data layanan informasi Penyelenggara Bimas Kristen Kabupaten Murung Raya: Rumah Ibadah, Penyuluh, Fastor/Pendeta, Data Guru Agama Kristen, Sekolah Kristen, dan Struktur Organisasi.',
    sections: [
      {
        id: 'data-rumah-ibadah',
        label: 'Data Rumah Ibadah',
        title: 'Data Rumah Ibadah / Gereja Kristen',
        subtitle:
          'Rekapitulasi Gereja dari berbagai aras dan sinode yang terdaftar di Penyelenggara Bimas Kristen Kab. Murung Raya.',
        updatedAt: 'Data Aktif · 2026',
        metrics: [
          { label: 'Total Gereja Terdata', value: '128 Gereja', note: 'GKE, GPdI, GBI, GKII & Sinode Lainnya' },
          { label: 'Terdaftar Kemenag', value: '118 Gereja', note: 'Memiliki Surat Tanda Daftar Gereja' },
          { label: 'Cakupan Wilayah', value: '10 Kecamatan', note: 'Puruk Cahu hingga Kecamatan Hulu' },
        ],
        columns: ['No', 'Sinode / Aras Gereja', 'Jumlah Gereja', 'Sebaran Utama', 'Status Tanda Daftar'],
        rows: [
          ['1', 'Gereja Kalimantan Evangelis (GKE)', '76 Gereja', 'Seluruh 10 Kecamatan', 'Terdaftar & Aktif'],
          ['2', 'Gereja Pantekosta di Indonesia (GPdI)', '19 Gereja', 'Murung, Laung Tuhup, Tanah Siang', 'Terdaftar & Aktif'],
          ['3', 'Gereja Kemah Injil Indonesia (GKII)', '14 Gereja', 'Sumber Barito, Seribu Riam, Murung', 'Terdaftar & Aktif'],
          ['4', 'Gereja Bethel Indonesia (GBI)', '9 Gereja', 'Murung, Permata Intan, Laung Tuhup', 'Terdaftar & Aktif'],
          ['5', 'Sinode Gereja Kristen Lainnya', '10 Gereja', 'Tersebar di Kab. Murung Raya', 'Terdaftar & Aktif'],
        ],
      },
      {
        id: 'data-penyuluh',
        label: 'Data Penyuluh',
        title: 'Data Penyuluh Agama Kristen',
        subtitle:
          'Data Penyuluh Agama Kristen PNS, PPPK, dan Non-PNS yang aktif mendampingi jemaat dan pembinaan rohani di wilayah Murung Raya.',
        updatedAt: 'Data Bimas Kristen · 2026',
        metrics: [
          { label: 'Total Penyuluh Kristen', value: '18 Orang', note: 'PNS, PPPK & Penyuluh Non-PNS' },
          { label: 'Kelompok Jemaat Binaan', value: '42 Kelompok', note: 'Pemuda, Lansia, Warga Binaan & Desa' },
          { label: 'Pelayanan Rohani', value: 'Terjadwal', note: 'Ibadah Oikumene & Pembinaan Keluarga' },
        ],
        columns: ['No', 'Wilayah Pelayanan', 'Jumlah Penyuluh', 'Status Kepegawaian', 'Fokus Pembinaan'],
        rows: [
          ['1', 'Kecamatan Murung & Puruk Cahu', '6 Orang', 'PNS, PPPK & Non-PNS', 'Pembinaan Pemuda Gereja, Lapas/Rutan, Kerukunan'],
          ['2', 'Kecamatan Tanah Siang & Tanah Siang Selatan', '4 Orang', 'PPPK & Non-PNS', 'Bimbingan Keluarga Kristen & Pelayanan Desa'],
          ['3', 'Kecamatan Laung Tuhup & Permata Intan', '4 Orang', 'PPPK & Non-PNS', 'Pendampingan Administrasi Gereja & Moderasi'],
          ['4', 'Kecamatan Sumber Barito, Seribu Riam & Uut Murung', '4 Orang', 'Non-PNS', 'Pelayanan Rohani & Penguatan Sekolah Minggu'],
        ],
      },
      {
        id: 'data-fastor-pendeta',
        label: 'Data Fastor/Pendeta',
        title: 'Data Fastor / Pendeta Pelayan Jemaat',
        subtitle:
          'Inventarisasi Pendeta, Vikaris, dan Pelayan Rohani (Fastor/Pendeta) resmi pada gereja-gereja binaan di Kabupaten Murung Raya.',
        updatedAt: 'Data Bimas Kristen · 2026',
        metrics: [
          { label: 'Pendeta / Pelayan Terdata', value: '94 Orang', note: 'Pendeta Jemaat & Rohaniwan Aktif' },
          { label: 'Kesesuaian Surat Tugas', value: 'Terverifikasi', note: 'Rekomendasi Sinode Masing-masing' },
          { label: 'Sinergi Lintas Iman', value: 'Aktif FKUB', note: 'Penggerak Moderasi Beragama' },
        ],
        columns: ['No', 'Kategori Pelayan Rohani', 'Jumlah Terdata', 'Sinode / Lingkup Pelayanan', 'Keterangan Administrasi'],
        rows: [
          ['1', 'Pendeta Residen & Ketua Majelis Resort', '52 Orang', 'GKE, GPdI, GKII, GBI', 'Terdaftar pada Rekomendasi Sinode'],
          ['2', 'Pendeta Pelayanan / Vikaris Jemaat', '28 Orang', 'Gereja Cabang & Pos Pelayanan', 'Melayani Jemaat Kecamatan & Desa'],
          ['3', 'Fastor / Pelayan Rohani Khusus & Oikumene', '14 Orang', 'Lingkup Antar Denominasi', 'Mitra Rohaniwan Kegiatan Resmi Daerah'],
        ],
      },
      {
        id: 'data-guru-agama-kristen',
        label: 'Data Guru Agama Kristen',
        title: 'Data Guru Pendidikan Agama Kristen (PAK)',
        subtitle:
          'Data pembinaan tenaga pendidik Guru Pendidikan Agama Kristen (PAK) binaan Penyelenggara Kristen pada sekolah umum dan sekolah Kristen di Kab. Murung Raya.',
        updatedAt: 'Data Pendidikan Agama · 2026',
        metrics: [
          { label: 'Guru PAK Terdata', value: '56 Guru', note: 'Guru PAK SD, SMP & SMA/SMK' },
          { label: 'Sekolah Sasaran', value: '68 Sekolah', note: 'SD, SMP & SMA/SMK Negeri/Swasta' },
          { label: 'Status Sertifikasi', value: '39 Guru', note: 'Tunjangan Profesi Guru Terverifikasi' },
        ],
        columns: ['No', 'Lingkup Pendidik Agama', 'Jumlah Guru', 'Jenjang Sekolah', 'Status Kepegawaian'],
        rows: [
          ['1', 'Guru Pendidikan Agama Kristen (PAK) SD', '31 Guru', 'SD Negeri & Swasta', 'PNS, PPPK & Honorer'],
          ['2', 'Guru Pendidikan Agama Kristen (PAK) SMP/SMA', '15 Guru', 'SMP & SMA/SMK', 'PNS & PPPK'],
          ['3', 'Guru Pendidikan Agama Kristen (PAK) Non-ASN & Sekolah Minggu', '10 Guru', 'SD, SMP & Lembaga Binaan', 'Terkoordinasi Dapodik & Kemenag'],
        ],
        footnote:
          'Data Guru Pendidikan Agama Kristen pada sekolah umum dan sekolah Kristen diperbarui per semester bersama Dinas Pendidikan dan Kankemenag.',
      },
      {
        id: 'data-sekolah-kristen',
        label: 'Data Sekolah Kristen',
        title: 'Data Sekolah Kristen & Pendidikan Keagamaan Kristen',
        subtitle:
          'Daftar lembaga pendidikan berciri khas Kristen serta Sekolah Minggu / Pendidikan Keagamaan Kristen di Kabupaten Murung Raya.',
        updatedAt: 'Data Aktif · 2026',
        metrics: [
          { label: 'Lembaga Pendidikan Kristen', value: '11 Lembaga', note: 'PAUD, SD, SMP & Pendidikan Keagamaan' },
          { label: 'Izin Operasional', value: 'Terdaftar', note: 'Koordinasi Kemenag & Disdik' },
          { label: 'Pembinaan Kurikulum', value: 'Berkala', note: 'Pendampingan Pengawas & Penyelenggara' },
        ],
        columns: ['No', 'Nama Sekolah / Lembaga', 'Jenjang', 'Kecamatan', 'Yayasan Penyelenggara'],
        rows: [
          ['1', 'TK / PAUD Kristen Puruk Cahu', 'PAUD / TK', 'Murung', 'Yayasan Pendidikan Kristen Mura'],
          ['2', 'SD Kristen Puruk Cahu', 'Sekolah Dasar', 'Murung', 'Yayasan Pendidikan Kristen Mura'],
          ['3', 'SMP Kristen Puruk Cahu', 'Sekolah Menengah Pertama', 'Murung', 'Yayasan Pendidikan Kristen Mura'],
          ['4', 'Sekolah Alkitab / Pembinaan Warga Gereja', 'Non-Formal', 'Laung Tuhup & Tanah Siang', 'Majelis Resort Gereja Setempat'],
        ],
      },
      {
        id: 'struktur-organisasi',
        label: 'Struktur Organisasi',
        title: 'Struktur Organisasi Penyelenggara Kristen',
        subtitle:
          'Susunan organisasi dan tata kerja Penyelenggara Bimbingan Masyarakat Kristen pada Kantor Kemenag Kabupaten Murung Raya.',
        updatedAt: 'Struktur Aktif · 2026',
        metrics: [
          { label: 'Pimpinan Kantor', value: 'Kepala Kankemenag', note: 'H. Maslan, S.Ag., M.Pd.' },
          { label: 'Pimpinan Unit', value: 'Penyelenggara Kristen', note: 'Pembinaan Gereja & Pendidikan PAK' },
          { label: 'Fungsional Binaan', value: 'Penyuluh & Guru PAK', note: 'Pelayanan Umat di 10 Kecamatan' },
        ],
        orgNodes: [
          {
            role: 'Kepala Kantor Kemenag Kab. Murung Raya',
            name: 'H. Maslan, S.Ag., M.Pd.',
            level: 'pimpinan',
            division: 'Pembina & Penanggung Jawab Kantor',
          },
          {
            role: 'Penyelenggara Bimas Kristen',
            name: 'Koordinator Penyelenggara Kristen',
            level: 'koordinator',
            division: 'Pelayanan Keagamaan, Gereja, Yayasan & Pendidikan Kristen',
          },
          {
            role: 'Pengadministrasi Gereja, Yayasan & Bantuan',
            name: 'Tim Pelaksana Urusan Agama Kristen',
            level: 'pelaksana',
            division: 'Tanda Daftar Gereja, Rekomendasi & Pendataan Pendeta',
          },
          {
            role: 'Kelompok Fungsional Penyuluh & Guru PAK',
            name: 'Tim Penyuluh & Guru Agama Kristen',
            level: 'pelaksana',
            division: 'Pembinaan Jemaat, KKG/MGMP PAK & Sekolah Kristen',
          },
        ],
      },
    ],
  },
  {
    id: 'sekretariat-jenderal',
    seksiUnitId: 'sekretariat',
    title: 'Informasi Sekretariat Jenderal',
    shortTitle: 'Sekretariat Jenderal',
    description:
      'Keterbukaan data perencanaan kinerja dan anggaran Sekretariat / Sub Bagian Tata Usaha: Data Perkin, Data POK, serta Struktur Organisasi Kankemenag Kab. Murung Raya.',
    sections: [
      {
        id: 'data-perkin',
        label: 'Data Perkin',
        title: 'Data Perjanjian Kinerja (Perkin) Tahun 2026',
        subtitle:
          'Ringkasan Perjanjian Kinerja Kepala Kantor, Kepala Subbag Tata Usaha, serta Para Kepala Seksi / Penyelenggara di lingkungan Kemenag Kab. Murung Raya.',
        updatedAt: 'Dokumen SAKIP · Tahun 2026',
        metrics: [
          { label: 'Dokumen Perkin', value: '7 Dokumen Utama', note: 'Kepala Kantor & Seluruh Unit Kerja' },
          { label: 'Indikator Kinerja (IKU)', value: '24 Sasaran Strategis', note: 'Selaras Renstra Kemenag RI 2025–2029' },
          { label: 'Target Capaian IKM', value: '≥ 92,00 (Sangat Baik)', note: 'Evaluasi Pelayanan Publik PTSP' },
        ],
        columns: ['No', 'Jabatan Penandatangan Perkin', 'Tahun Anggaran', 'Fokus Sasaran Kinerja Utama', 'Status Dokumen'],
        rows: [
          ['1', 'Kepala Kantor Kemenag Kab. Murung Raya', '2026', 'Indeks Kerukunan Umat Beragama, Kualitas Layanan KUA & Madrasah, Tata Kelola WBK', 'Tersedia · TTE Resmi'],
          ['2', 'Kepala Sub Bagian Tata Usaha', '2026', 'Nilai Reformasi Birokrasi, Akuntabilitas Kinerja (SAKIP), Kualitas Pengelolaan Keuangan & SDM', 'Tersedia · TTE Resmi'],
          ['3', 'Kepala Seksi Bimbingan Masyarakat Islam', '2026', 'Kualitas Layanan KUA Kecamatan, Pembinaan Masjid/Keluarga Sakinah, Sertifikasi Wakaf', 'Tersedia · TTE Resmi'],
          ['4', 'Kepala Seksi Pendidikan Islam', '2026', 'Mutu Akademik Madrasah, Akreditasi Lembaga & Validitas Data EMIS/SIAGA', 'Tersedia · TTE Resmi'],
          ['5', 'Penyelenggara Bimas Hindu & Bimas Kristen', '2026', 'Pembinaan Umat, Tanda Daftar Rumah Ibadah & Peningkatan Kualitas Guru Agama', 'Tersedia · TTE Resmi'],
        ],
        footnote: 'Salinan lengkap dokumen Perjanjian Kinerja tersedia pada menu PPID (Kategori Berkala).',
      },
      {
        id: 'data-pok',
        label: 'Data POK',
        title: 'Data Petunjuk Operasional Kegiatan (POK) & DIPA 2026',
        subtitle:
          'Ringkasan alokasi program dan kegiatan pada Petunjuk Operasional Kegiatan (POK) Kantor Kementerian Agama Kabupaten Murung Raya TA 2026.',
        updatedAt: 'DIPA Tahun Anggaran 2026',
        metrics: [
          { label: 'Satuan Kerja Pengelola', value: '6 Unit Program', note: 'Sekjen, Bimas Islam, Pendis, Hindu, Kristen, Zawa' },
          { label: 'Transparansi Anggaran', value: 'Sesuai UU KIP', note: 'Pelaporan Berkala Melalui E-Monev & OM-SPAN' },
          { label: 'Periode Pelaksanaan', value: 'Januari–Desember 2026', note: 'Monitoring Triwulanan' },
        ],
        columns: ['No', 'Kode Program / Unit', 'Nama Program Operasional POK', 'Fokus Belanja & Output Kegiatan', 'Pengelola'],
        rows: [
          ['1', 'Dukungan Manajemen (025.01)', 'Dukungan Manajemen & Pelaksanaan Tugas Teknis Lainnya', 'Operasional Kantor, Gaji & Tunjangan ASN, Layanan PTSP & Kearsipan SRIKANDI', 'Subbag Tata Usaha'],
          ['2', 'Bimas Islam (025.03)', 'Program Kualitas Kehidupan Beragama — Bimas Islam', 'Operasional 10 KUA Kecamatan, Tunjangan Penyuluh, Pengukuran Kiblat & Zakat Wakaf', 'Seksi Bimas Islam'],
          ['3', 'Pendidikan Islam (025.04)', 'Program Kualitas Pengajaran & Pembelajaran — Pendis', 'Tunjangan Profesi Guru, BOS Madrasah/Pontren, Monitoring Mutu & Asesmen', 'Seksi Pendidikan Islam'],
          ['4', 'Bimas Kristen (025.05)', 'Program Kerukunan Umat & Layanan Bimas Kristen', 'Pembinaan Jemaat, Tunjangan Penyuluh & Guru PAK, Bantuan Lembaga', 'Penyelenggara Kristen'],
          ['5', 'Bimas Hindu (025.07)', 'Program Kerukunan Umat & Layanan Bimas Hindu', 'Pembinaan Balai Basarah, Tandak Intan, Pasraman & Guru PAH', 'Penyelenggara Hindu'],
        ],
        footnote: 'Informasi detail pagu rincian output per DIPA dapat diakses melalui meja PPID Kankemenag Murung Raya.',
      },
      {
        id: 'struktur-organisasi',
        label: 'Struktur Organisasi',
        title: 'Struktur Organisasi Kantor Kemenag Kab. Murung Raya (Sekretariat Jenderal)',
        subtitle:
          'Bagan tata kelola dan struktur organisasi Kantor Kementerian Agama Kabupaten Murung Raya berdasarkan PMA tentang Organisasi dan Tata Kerja Instansi Vertikal.',
        updatedAt: 'OTK Aktif · 2026',
        metrics: [
          { label: 'Kepala Kantor', value: 'Eselon III.a', note: 'H. Maslan, S.Ag., M.Pd.' },
          { label: 'Unit Eselon IV / Koordinator', value: 'Subbag TU & Seksi', note: 'Sekretariat, Bimas Islam, Pendis & Penyelenggara' },
          { label: 'Satker Binaan', value: 'KUA & Madrasah Negeri', note: '10 KUA Kecamatan & Madrasah se-Mura' },
        ],
        orgNodes: [
          {
            role: 'Kepala Kantor Kementerian Agama Kab. Murung Raya',
            name: 'H. Maslan, S.Ag., M.Pd.',
            level: 'pimpinan',
            division: 'Pemimpin & Penanggung Jawab Penuh Instansi',
          },
          {
            role: 'Kepala Sub Bagian Tata Usaha (Sekretariat)',
            name: 'Koordinator Sekretariat / Subbag TU',
            level: 'koordinator',
            division: 'Urusan Kepegawaian, Keuangan, Perencanaan, Umum & Humas PTSP',
          },
          {
            role: 'Kepala Seksi Bimbingan Masyarakat Islam',
            name: 'Koordinator Bimas Islam & Haji/Zawa',
            level: 'pelaksana',
            division: 'Pembinaan KUA, Kemasjidan, Kepenghuluan & Zakat Wakaf',
          },
          {
            role: 'Kepala Seksi Pendidikan Islam',
            name: 'Koordinator Pendidikan Islam (Pendis)',
            level: 'pelaksana',
            division: 'Pembinaan RA/Madrasah, Pontren & Pendidikan Agama Islam',
          },
          {
            role: 'Penyelenggara Bimas Kristen & Bimas Hindu',
            name: 'Para Penyelenggara & Pembina Umat',
            level: 'pelaksana',
            division: 'Pelayanan Keagamaan, Rumah Ibadah & Guru Agama Kristen/Hindu',
          },
        ],
      },
    ],
  },
];

export function getInformasiUnitBySeksiId(
  seksiUnitId?: string
): InformasiUnitConfig | undefined {
  if (!seksiUnitId) return undefined;
  return INFORMASI_UNITS.find(
    (u) => u.seksiUnitId === seksiUnitId || u.id === seksiUnitId
  );
}

