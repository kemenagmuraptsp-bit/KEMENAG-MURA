import { ServiceTemplate } from '@/src/types';
import { wrapWordHtml } from '@/src/data/pendisTemplates';

function makeLetterTemplate(opts: {
  id: string;
  title: string;
  description: string;
  fileName: string;
  kop: string;
  subKop?: string;
  perihal: string;
  tujuanCta: string;
  lampiran?: string;
  intro: string;
  fields: [string, string][];
  closing: string;
  signerTitle: string;
  extraTableHtml?: string;
  extraPreviewText?: string;
}): ServiceTemplate {
  const lampiran = opts.lampiran || '1 (satu) berkas persyaratan';
  const maxFieldLen = Math.max(...opts.fields.map(([k]) => k.length), 18);
  const previewFields = opts.fields
    .map(([k, v]) => `  ${k.padEnd(maxFieldLen)} : ${v}`)
    .join('\n');

  const previewText = `[${opts.kop}]
------------------------------------------------------------------------
Nomor      : .../....../2026
Lampiran   : ${lampiran}
Hal        : ${opts.perihal}

Kepada Yth.
Kepala Kantor Kementerian Agama Kabupaten Murung Raya
Cq. ${opts.tujuanCta}
di - Puruk Cahu

Dengan hormat,
${opts.intro}

${previewFields}
${opts.extraPreviewText ? `\n${opts.extraPreviewText}\n` : ''}
${opts.closing}

Puruk Cahu, ...................... 2026
${opts.signerTitle},


(........................................)`;

  const rowsHtml = opts.fields
    .map(
      ([k, v]) =>
        `<tr><td style="width:195px">${k}</td><td>: ${v}</td></tr>`
    )
    .join('');

  const bodyHtml = `<div class="kop">
  <h2>[${opts.kop}]</h2>
  <p>${opts.subKop || 'Alamat Lengkap, Nomor Telepon, dan Email Resmi Lembaga/Instansi'}</p>
</div>
<table class="meta">
  <tr><td style="width:90px">Nomor</td><td>: ....... / ....... / 2026</td><td style="text-align:right">Puruk Cahu, ................. 2026</td></tr>
  <tr><td>Lampiran</td><td>: ${lampiran}</td><td></td></tr>
  <tr><td>Perihal</td><td>: <strong>${opts.perihal}</strong></td><td></td></tr>
</table>
<p>Kepada Yth.<br/>Kepala Kantor Kementerian Agama Kabupaten Murung Raya<br/>Cq. ${opts.tujuanCta}<br/>di - Puruk Cahu</p>
<p>Dengan hormat,<br/>${opts.intro}</p>
<table class="meta">
  ${rowsHtml}
</table>
${opts.extraTableHtml || ''}
<p>${opts.closing}</p>
<table class="ttd">
  <tr><td></td><td>${opts.signerTitle},<br/><br/><br/><br/><u>(..........................................)</u></td></tr>
</table>`;

  return {
    id: opts.id,
    title: opts.title,
    description: opts.description,
    fileName: opts.fileName,
    previewText,
    contentHtml: wrapWordHtml(opts.title, bodyHtml),
  };
}

export const OTHER_UNIT_TEMPLATES_BY_SUB_ID: Record<string, ServiceTemplate[]> = {
  /* ------------------------------ SEKRETARIAT ------------------------------ */
  'sek-magang': [
    makeLetterTemplate({
      id: 'tpl-sek-magang',
      title: 'Format Surat Pengantar Permohonan Magang / PKL',
      description: 'Acuan surat pengantar resmi dari Sekolah (SMK/SMA/MA) atau Perguruan Tinggi beserta daftar peserta magang.',
      fileName: 'Format_Permohonan_Magang_PKL_Sekretariat.doc',
      kop: 'KOP SURAT SEKOLAH / PERGURUAN TINGGI',
      perihal: 'Permohonan Izin Penempatan Magang / PKL',
      tujuanCta: 'Kepala Sub Bagian Tata Usaha (Sekretariat)',
      lampiran: 'Daftar Nama Peserta & Fotokopi Kartu Pelajar/Mahasiswa',
      intro: 'Sehubungan dengan pelaksanaan program Praktik Kerja Lapangan (PKL) / Magang akademik tahun 2026, bersama ini kami memohon izin penempatan peserta didik/mahasiswa pada Kantor Kementerian Agama Kab. Murung Raya:',
      fields: [
        ['Asal Sekolah / Kampus', '................................................'],
        ['Jurusan / Program Studi', '................................................'],
        ['Jumlah Peserta', '........ orang (daftar terlampir)'],
        ['Periode Magang / PKL', '........ s.d. ........ 2026'],
        ['Kontak Pembimbing', '................................................'],
      ],
      extraPreviewText: `Daftar Peserta:\n1. Nama: .......................... | NIS/NIM: ...............\n2. Nama: .......................... | NIS/NIM: ...............`,
      extraTableHtml: `<table class="data"><tr><th>No</th><th>Nama Peserta</th><th>NIS / NIM</th><th>Jurusan / Prodi</th></tr><tr><td>1</td><td></td><td></td><td></td></tr><tr><td>2</td><td></td><td></td><td></td></tr></table>`,
      closing: 'Demikian permohonan ini disampaikan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.',
      signerTitle: 'Kepala Sekolah / Dekan / Ketua Prodi',
    }),
  ],

  'sek-legalisir': [
    {
      id: 'tpl-sek-legalisir-kuasa',
      title: 'Format Surat Kuasa Legalisir Dokumen (Jika Diwakilkan)',
      description: 'Hanya diperlukan apabila pengurusan legalisir dokumen diwakilkan kepada pihak lain.',
      fileName: 'Format_Surat_Kuasa_Legalisir_Sekretariat.doc',
      previewText: `                         SURAT KUASA PENGURUSAN LEGALISIR
------------------------------------------------------------------------
Saya yang bertanda tangan di bawah ini:
  Nama Pemberi Kuasa  : ................................................
  NIK                 : ................................................
  Alamat / No. HP     : ................................................

Memberikan kuasa kepada:
  Nama Penerima Kuasa : ................................................
  NIK                 : ................................................
  Hubungan            : ................................................

Untuk mengurus dan mengambil legalisir dokumen resmi pada PTSP Kantor Kementerian Agama Kab. Murung Raya berupa [Sebutkan Jenis Dokumen].

Puruk Cahu, ...................... 2026
Penerima Kuasa,                          Pemberi Kuasa,


(.......................)                [Meterai] (.......................)`,
      contentHtml: wrapWordHtml(
        'Format Surat Kuasa Legalisir Dokumen',
        `<p class="judul">SURAT KUASA PENGURUSAN LEGALISIR DOKUMEN</p>
        <p>Saya yang bertanda tangan di bawah ini:</p>
        <table class="meta">
          <tr><td style="width:185px">Nama Pemberi Kuasa</td><td>: ....................................................</td></tr>
          <tr><td>NIK</td><td>: ....................................................</td></tr>
          <tr><td>Alamat &amp; Nomor HP</td><td>: ....................................................</td></tr>
        </table>
        <p>Dengan ini memberikan kuasa kepada:</p>
        <table class="meta">
          <tr><td style="width:185px">Nama Penerima Kuasa</td><td>: ....................................................</td></tr>
          <tr><td>NIK</td><td>: ....................................................</td></tr>
          <tr><td>Alamat &amp; Nomor HP</td><td>: ....................................................</td></tr>
        </table>
        <p>Untuk melakukan pengurusan dan pengambilan legalisir dokumen pada loket PTSP Kantor Kementerian Agama Kabupaten Murung Raya berupa: <strong>[Sebutkan Jenis &amp; Jumlah Dokumen]</strong>.</p>
        <table class="ttd">
          <tr><td>Penerima Kuasa,<br/><br/><br/><br/><u>(..........................................)</u></td><td>Puruk Cahu, ................. 2026<br/>Pemberi Kuasa,<br/><br/>[Meterai Rp10.000]<br/><br/><u>(..........................................)</u></td></tr>
        </table>`
      ),
    },
  ],

  'sek-data-info': [
    makeLetterTemplate({
      id: 'tpl-sek-data-info',
      title: 'Format Formulir Permohonan Data & Informasi Keagamaan (PPID)',
      description: 'Formulir permohonan resmi untuk permintaan data statistik keagamaan, rumah ibadah, atau informasi publik.',
      fileName: 'Format_Permohonan_Data_Informasi_PPID.doc',
      kop: 'FORMULIR PERMOHONAN DATA & INFORMASI KEAGAMAAN (PPID)',
      subKop: 'Kantor Kementerian Agama Kabupaten Murung Raya · Puruk Cahu',
      perihal: 'Permohonan Data dan Informasi Agama / Keagamaan',
      tujuanCta: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID / Subbag TU)',
      lampiran: 'Fotokopi KTP Pemohon / Surat Tugas Lembaga',
      intro: 'Yang bertanda tangan di bawah ini mengajukan permohonan perolehan data dan informasi publik bidang keagamaan dengan rincian:',
      fields: [
        ['Nama Pemohon / Instansi', '................................................'],
        ['NIK / Nomor Identitas', '................................................'],
        ['Nomor WhatsApp & Email', '................................................'],
        ['Rincian Data Dibutuhkan', '................................................'],
        ['Tujuan Penggunaan Data', '................................................'],
        ['Cara Memperoleh Salinan', '[Softfile PDF/Excel / Cetak Hardcopy]'],
      ],
      closing: 'Data yang diperoleh akan digunakan secara bertanggung jawab sesuai ketentuan perundang-undangan yang berlaku.',
      signerTitle: 'Pemohon Data / Informasi',
    }),
  ],

  'sek-rohaniwan': [
    makeLetterTemplate({
      id: 'tpl-sek-rohaniwan',
      title: 'Format Surat Permohonan Rohaniawan / Pembaca Doa / Penceramah',
      description: 'Surat permohonan resmi dari instansi atau panitia acara untuk penugasan rohaniawan pelantikan, doa, atau ceramah.',
      fileName: 'Format_Permohonan_Rohaniwan_Doa_Sekretariat.doc',
      kop: 'KOP SURAT INSTANSI / PANITIA PENYELENGGARA ACARA',
      perihal: 'Permohonan Penugasan Rohaniawan / Pembaca Doa / Penceramah',
      tujuanCta: 'Kepala Sub Bagian Tata Usaha (Sekretariat)',
      lampiran: 'Susunan Acara / Rundown Kegiatan',
      intro: 'Sehubungan dengan akan dilaksanakannya kegiatan resmi instansi/organisasi kami, bersama ini kami mohon kesediaan Bapak/Ibu untuk menugaskan Rohaniawan / Pembaca Doa / Penceramah Agama dengan rincian jadwal sebagai berikut:',
      fields: [
        ['Nama Kegiatan / Acara', '................................................'],
        ['Hari / Tanggal', '................................................'],
        ['Waktu Pelaksanaan', 'Pukul .......... WIB s.d. selesai'],
        ['Tempat / Lokasi Acara', '................................................'],
        ['Agama Rohaniawan', '[Islam / Kristen / Katolik / Hindu / Buddha]'],
        ['Jumlah & Peran Petugas', '[1 Orang Rohaniawan Sumpah / Pembaca Doa / Penceramah]'],
      ],
      closing: 'Demikian permohonan ini disampaikan. Atas perhatian dan bantuannya diucapkan terima kasih.',
      signerTitle: 'Pimpinan Instansi / Ketua Panitia',
    }),
  ],

  'sek-sewa-aula': [
    makeLetterTemplate({
      id: 'tpl-sek-sewa-aula',
      title: 'Format Surat Permohonan Penggunaan / Sewa Aula Kantor',
      description: 'Surat resmi peminjaman/sewa Aula Kantor Kementerian Agama Kabupaten Murung Raya beserta rincian jadwal acara.',
      fileName: 'Format_Permohonan_Sewa_Aula_Sekretariat.doc',
      kop: 'KOP SURAT INSTANSI / ORGANISASI / PANITIA PEMOHON',
      perihal: 'Permohonan Izin Penggunaan / Sewa Aula Kankemenag Murung Raya',
      tujuanCta: 'Kepala Sub Bagian Tata Usaha (Sekretariat)',
      lampiran: 'Jadwal Kegiatan & Fotokopi KTP Penanggung Jawab',
      intro: 'Bersama ini kami mengajukan permohonan izin pemakaian / sewa Aula Kantor Kementerian Agama Kabupaten Murung Raya untuk menyelenggarakan kegiatan:',
      fields: [
        ['Nama Kegiatan', '................................................'],
        ['Hari / Tanggal Pemakaian', '................................................'],
        ['Waktu Pemakaian', 'Pukul .......... s.d. .......... WIB'],
        ['Perkiraan Jumlah Peserta', '........ orang'],
        ['Nama Penanggung Jawab', '................................................'],
        ['Nomor WhatsApp Aktif', '................................................'],
      ],
      closing: 'Kami bersedia menjaga kebersihan, ketertiban, keamanan fasilitas gedung, serta mematuhi ketentuan yang berlaku.',
      signerTitle: 'Penanggung Jawab / Ketua Panitia',
    }),
  ],

  /* ------------------------------ BIMAS ISLAM ------------------------------ */
  'bi-sarpras-masjid': [
    makeLetterTemplate({
      id: 'tpl-bi-sarpras-masjid',
      title: 'Format Permohonan Rekomendasi Bantuan Sarpras Masjid/Mushalla',
      description: 'Surat resmi pengurus takmir diketahui KUA Kecamatan dilengkapi rincian ID SIMAS dan usulan RAB.',
      fileName: 'Format_Permohonan_Bantuan_Masjid_BimasIslam.doc',
      kop: 'KOP SURAT PENGURUS TAKMIR MASJID / MUSHALLA',
      perihal: 'Permohonan Rekomendasi Bantuan Sarana dan Prasarana Rumah Ibadah',
      tujuanCta: 'Kepala Seksi Bimbingan Masyarakat Islam',
      lampiran: 'Proposal Bantuan, RAB, ID SIMAS, Rekening Bank, Status Lahan & Foto',
      intro: 'Dengan memohon ridha Allah SWT, kami pengurus takmir rumah ibadah mengajukan permohonan Surat Keterangan / Rekomendasi Bantuan Sarana dan Prasarana dengan data sebagai berikut:',
      fields: [
        ['Nama Masjid / Mushalla', '................................................'],
        ['Nomor ID Masjid (SIMAS)', '................................................'],
        ['Alamat Lengkap & Kec.', '................................................'],
        ['Rencana Anggaran (RAB)', 'Rp .............................................'],
        ['Bank & No. Rekening Masjid', '................................................'],
      ],
      closing: 'Terlampir proposal bantuan beserta RAB, fotokopi SKT/ID SIMAS, rekening bank atas nama masjid/mushalla, bukti status lahan, foto kondisi, serta diketahui Kepala KUA Kecamatan.',
      signerTitle: 'Ketua Takmir (Diketahui Kepala KUA Kecamatan)',
    }),
  ],

  'bi-kiblat': [
    makeLetterTemplate({
      id: 'tpl-bi-kiblat',
      title: 'Format Surat Permohonan Pengukuran & Sertifikat Arah Kiblat',
      description: 'Surat permohonan dari takmir/panitia pembangunan untuk jadwal pengukuran tim falakiyah Bimas Islam.',
      fileName: 'Format_Permohonan_Pengukuran_Arah_Kiblat.doc',
      kop: 'KOP SURAT TAKMIR MASJID / PANITIA PEMBANGUNAN',
      perihal: 'Permohonan Pengukuran dan Penerbitan Sertifikat Arah Kiblat',
      tujuanCta: 'Kepala Seksi Bimbingan Masyarakat Islam (Tim Kalibrasi Kiblat)',
      lampiran: 'Rekomendasi Awal KUA Kecamatan & Titik Koordinat Lokasi',
      intro: 'Sehubungan dengan pembangunan / kalibrasi arah kiblat rumah ibadah di wilayah Kabupaten Murung Raya, kami memohon penjadwalan tim pengukuran arah kiblat pada:',
      fields: [
        ['Nama Masjid / Mushalla', '................................................'],
        ['Alamat / Desa / Kecamatan', '................................................'],
        ['Titik Koordinat (Lat, Lng)', '................................................'],
        ['Rekomendasi KUA Kec.', 'Nomor : ........................................'],
        ['Kontak Pengurus di Lokasi', '................................................'],
      ],
      closing: 'Demikian permohonan ini kami ajukan agar dapat diterbitkan Berita Acara dan Sertifikat Arah Kiblat resmi.',
      signerTitle: 'Ketua Takmir / Panitia Pembangunan',
    }),
  ],

  'bi-majelis-taklim': [
    makeLetterTemplate({
      id: 'tpl-bi-majelis-taklim-surat',
      title: 'Format Surat Permohonan SKT & SK Majelis Taklim',
      description: 'Surat permohonan pendaftaran baru SKT/SK Majelis Taklim dilengkapi rekomendasi KUA & domisili.',
      fileName: 'Format_Permohonan_SKT_Majelis_Taklim.doc',
      kop: 'KOP SURAT PENGURUS MAJELIS TAKLIM',
      perihal: 'Permohonan Penerbitan SKT dan SK Majelis Taklim',
      tujuanCta: 'Kepala Seksi Bimbingan Masyarakat Islam',
      lampiran: 'Domisili Desa/Lurah, Rekomendasi KUA, Struktur Pengurus & Daftar Jamaah',
      intro: 'Bersama ini kami pengurus Majelis Taklim mengajukan permohonan penerbitan Surat Keterangan Terdaftar (SKT) dan Surat Keputusan Majelis Taklim dengan data:',
      fields: [
        ['Nama Majelis Taklim', '................................................'],
        ['Alamat / Tempat Pengajian', '................................................'],
        ['Ketua / Sekretaris / Bend.', '.................... / ............. / ...........'],
        ['Jumlah Jamaah Aktif', '........ orang (minimal 15 orang)'],
        ['Jadwal Rutin Pengajian', '................................................'],
      ],
      closing: 'Terlampir Surat Keterangan Domisili Desa/Kelurahan, Rekomendasi KUA Kecamatan, susunan kepengurusan, fotokopi KTP pengurus inti, dan daftar minimal 15 jamaah aktif.',
      signerTitle: 'Ketua Majelis Taklim',
    }),
    {
      id: 'tpl-bi-majelis-taklim-daftar',
      title: 'Format Susunan Pengurus & Daftar Min. 15 Anggota Jamaah',
      description: 'Lampiran tabel kepengurusan (Ketua, Sekretaris, Bendahara) serta daftar anggota jamaah aktif.',
      fileName: 'Format_Daftar_Pengurus_Jamaah_Majelis_Taklim.doc',
      previewText: `LAMPIRAN SUSUNAN PENGURUS & DAFTAR JAMAAH AKTIF MAJELIS TAKLIM
Nama Majelis Taklim : ................................................
Kecamatan           : ................................................

A. SUSUNAN KEPENGURUSAN
1. Pembina / Penasehat : ..............................................
2. Ketua               : .......................... (NIK: ............)
3. Sekretaris          : .......................... (NIK: ............)
4. Bendahara           : .......................... (NIK: ............)

B. DAFTAR ANGGOTA JAMAAH AKTIF (MINIMAL 15 ORANG)
No | Nama Lengkap | Alamat | No. HP | Tanda Tangan
1. |              |        |        |
... (isi minimal 15 nama jamaah aktif) ...
15.|              |        |        |

Ketua Majelis Taklim,                    Sekretaris,


(......................)                 (......................)`,
      contentHtml: wrapWordHtml(
        'Format Daftar Pengurus dan Jamaah Majelis Taklim',
        `<p class="judul">SUSUNAN PENGURUS &amp; DAFTAR JAMAAH AKTIF MAJELIS TAKLIM</p>
        <p class="nomor">Nama Majelis Taklim : ................................................</p>
        <p><strong>A. Susunan Kepengurusan</strong></p>
        <table class="meta">
          <tr><td style="width:170px">1. Pembina / Penasehat</td><td>: ....................................................</td></tr>
          <tr><td>2. Ketua</td><td>: .................................. (NIK: ............)</td></tr>
          <tr><td>3. Sekretaris</td><td>: .................................. (NIK: ............)</td></tr>
          <tr><td>4. Bendahara</td><td>: .................................. (NIK: ............)</td></tr>
        </table>
        <p><strong>B. Daftar Anggota Jamaah Aktif (Minimal 15 Orang)</strong></p>
        <table class="data">
          <tr><th>No</th><th>Nama Lengkap</th><th>Alamat</th><th>No. HP</th><th>Tanda Tangan</th></tr>
          <tr><td>1</td><td></td><td></td><td></td><td></td></tr>
          <tr><td>2</td><td></td><td></td><td></td><td></td></tr>
          <tr><td>...</td><td colspan="4" style="text-align:center">Lanjutkan hingga minimal 15 anggota jamaah aktif</td></tr>
          <tr><td>15</td><td></td><td></td><td></td><td></td></tr>
        </table>
        <table class="ttd">
          <tr><td>Ketua Majelis Taklim,<br/><br/><br/><br/><u>(...........................)</u></td><td>Sekretaris,<br/><br/><br/><br/><u>(...........................)</u></td></tr>
        </table>`
      ),
    },
  ],

  'bi-perpanjangan-majelis-taklim': [
    makeLetterTemplate({
      id: 'tpl-bi-perpanjangan-majelis-taklim',
      title: 'Format Surat Permohonan Perpanjangan SKT & SK Majelis Taklim',
      description: 'Surat pengajuan perpanjangan masa berlaku SKT/SK Majelis Taklim beserta ringkasan laporan kegiatan.',
      fileName: 'Format_Perpanjangan_SKT_Majelis_Taklim.doc',
      kop: 'KOP SURAT PENGURUS MAJELIS TAKLIM',
      perihal: 'Permohonan Perpanjangan SKT dan SK Majelis Taklim',
      tujuanCta: 'Kepala Seksi Bimbingan Masyarakat Islam',
      lampiran: 'Salinan SKT/Piagam Lama, Laporan Kegiatan, Susunan Pengurus & Rekomendasi KUA',
      intro: 'Sehubungan dengan berakhirnya masa berlaku Surat Keterangan Terdaftar (SKT) Majelis Taklim kami, bersama ini kami mengajukan permohonan perpanjangan dengan data:',
      fields: [
        ['Nama Majelis Taklim', '................................................'],
        ['Nomor SKT / Piagam Lama', '................................................'],
        ['Alamat / Kecamatan', '................................................'],
        ['Jumlah Jamaah Aktif Kini', '........ orang'],
        ['Rekomendasi Perpanjangan KUA', 'Nomor : ........................................'],
      ],
      closing: 'Terlampir salinan SKT & Piagam sebelumnya, laporan kegiatan pengajian terakhir, susunan kepengurusan terbaru, dan rekomendasi KUA Kecamatan setempat.',
      signerTitle: 'Ketua Majelis Taklim',
    }),
  ],

  'bi-tauliyah-wali-hakim': [
    makeLetterTemplate({
      id: 'tpl-bi-tauliyah-wali-hakim',
      title: 'Format Surat Permohonan & BAP Tauliyah Wali Hakim (Khusus KUA)',
      description: 'Format resmi permohonan Kepala KUA/Penghulu beserta ringkasan Berita Acara Pemeriksaan (BAP) Wali Hakim.',
      fileName: 'Format_Permohonan_BAP_Tauliyah_Wali_Hakim_KUA.doc',
      kop: 'KOP SURAT KANTOR URUSAN AGAMA (KUA) KECAMATAN ..........',
      subKop: 'Kantor Kementerian Agama Kabupaten Murung Raya',
      perihal: 'Permohonan Penerbitan Surat Tauliyah Wali Hakim',
      tujuanCta: 'Kepala Seksi Bimbingan Masyarakat Islam (Khusus KUA Kecamatan)',
      lampiran: 'BAP Pemeriksaan Wali Hakim, Berkas Model N1–N4 & KTP Calon Pengantin',
      intro: 'Berdasarkan hasil pemeriksaan kehendak nikah dan Berita Acara Pemeriksaan (BAP) pada KUA Kecamatan kami, bersama ini dimohon penerbitan Tauliyah Wali Hakim untuk pernikahan:',
      fields: [
        ['Nama Calon Mempelai Wanita', '................................................'],
        ['Nama Calon Mempelai Pria', '................................................'],
        ['Rencana Tgl / Tempat Akad', '................................................'],
        ['Sebab Menggunakan Wali Hakim', '[Wali nasab tidak ada / mafqud / adhal PA / >= 2 marhalah]'],
        ['Nama Kepala KUA / Penghulu', '.................................. (NIP. ...........)'],
      ],
      closing: 'Seluruh berkas pemeriksaan Model N1–N4 dan BAP sebab wali hakim telah diverifikasi lengkap di KUA Kecamatan.',
      signerTitle: 'Kepala KUA Kecamatan / Penghulu',
    }),
  ],

  'bi-kitab-suci': [
    makeLetterTemplate({
      id: 'tpl-bi-kitab-suci',
      title: 'Format Surat Permohonan Bantuan Kitab Suci Al-Qur’an',
      description: 'Surat resmi pengurus masjid, mushalla, majelis taklim, atau TPQ untuk permohonan mushaf Al-Qur’an.',
      fileName: 'Format_Permohonan_Kitab_Suci_Islam.doc',
      kop: 'KOP SURAT MASJID / MUSHALLA / MAJELIS TAKLIM / TPQ',
      perihal: 'Permohonan Bantuan Kitab Suci Al-Qur’an',
      tujuanCta: 'Kepala Seksi Bimbingan Masyarakat Islam',
      lampiran: 'Daftar Penerima Manfaat & Fotokopi KTP Penanggung Jawab',
      intro: 'Dalam rangka mendukung kegiatan tadarus dan pembinaan baca tulis Al-Qur’an, kami mengajukan permohonan bantuan mushaf Al-Qur’an dengan rincian:',
      fields: [
        ['Nama Lembaga / Masjid', '................................................'],
        ['Alamat / Kecamatan', '................................................'],
        ['Jumlah Kebutuhan Mushaf', '........ eksemplar'],
        ['Penanggung Jawab / No. WA', '................................................'],
      ],
      closing: 'Bantuan Al-Qur’an akan dimanfaatkan sepenuhnya untuk kepentingan jamaah/santri dan tidak untuk diperjualbelikan.',
      signerTitle: 'Ketua Takmir / Pimpinan Lembaga',
    }),
  ],

  'bi-buku-agama': [
    makeLetterTemplate({
      id: 'tpl-bi-buku-agama',
      title: 'Format Surat Permohonan Bantuan Buku Keagamaan Islam',
      description: 'Surat permohonan bantuan buku bacaan/literatur keagamaan Islam untuk perpustakaan masjid/majelis taklim.',
      fileName: 'Format_Permohonan_Buku_Agama_Islam.doc',
      kop: 'KOP SURAT LEMBAGA KEAGAMAAN / TAKMIR MASJID',
      perihal: 'Permohonan Bantuan Buku Keagamaan Islam',
      tujuanCta: 'Kepala Seksi Bimbingan Masyarakat Islam',
      lampiran: 'Daftar Judul / Tema Buku yang Dibutuhkan',
      intro: 'Guna memperkaya literatur pembinaan keagamaan bagi masyarakat dan jamaah, bersama ini kami mengajukan permohonan bantuan buku agama Islam:',
      fields: [
        ['Nama Lembaga / Perpustakaan', '................................................'],
        ['Alamat Lengkap & Kec.', '................................................'],
        ['Tema / Judul Buku Dimohon', '................................................'],
        ['Perkiraan Jumlah Kebutuhan', '........ eksemplar'],
      ],
      closing: 'Atas perhatian dan bantuan Bapak/Ibu, kami ucapkan terima kasih.',
      signerTitle: 'Pimpinan Lembaga / Pengurus Masjid',
    }),
  ],

  /* ------------------------------ BIMAS HINDU ------------------------------ */
  'bh-buku-agama': [
    makeLetterTemplate({
      id: 'tpl-bh-buku-agama',
      title: 'Format Surat Permohonan Bantuan Buku Keagamaan Hindu/Kaharingan',
      description: 'Surat resmi pengurus Balai Basarah, Pura, Pasraman, atau Majelis Agama untuk pengajuan buku keagamaan.',
      fileName: 'Format_Permohonan_Buku_Agama_Hindu.doc',
      kop: 'KOP SURAT BALAI BASARAH / PURA / PASRAMAN / MAJELIS AGAMA HINDU',
      perihal: 'Permohonan Bantuan Buku Keagamaan Hindu / Kaharingan',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Hindu',
      lampiran: 'Daftar Kebutuhan Judul Buku & Jumlah Penerima',
      intro: 'Dalam rangka meningkatkan literasi keagamaan umat Hindu/Kaharingan di Kabupaten Murung Raya, kami mengajukan permohonan bantuan buku keagamaan:',
      fields: [
        ['Nama Lembaga / Rumah Ibadah', '................................................'],
        ['Alamat / Kecamatan', '................................................'],
        ['Jenis / Judul Buku Dimohon', '................................................'],
        ['Jumlah Penerima Manfaat', '........ orang / ........ eksemplar'],
      ],
      closing: 'Demikian permohonan ini disampaikan, atas perhatian dan perkenannya diucapkan terima kasih.',
      signerTitle: 'Pengurus Lembaga / Balai Basarah / Pura',
    }),
  ],

  'bh-bantuan-rumah-ibadah': [
    makeLetterTemplate({
      id: 'tpl-bh-bantuan-rumah-ibadah',
      title: 'Format Permohonan Rekomendasi Bantuan Pura / Balai Basarah',
      description: 'Surat pengajuan rekomendasi bantuan pembangunan atau rehabilitasi rumah ibadah Hindu/Kaharingan.',
      fileName: 'Format_Permohonan_Bantuan_Rumah_Ibadah_Hindu.doc',
      kop: 'KOP SURAT PENGURUS PURA / BALAI BASARAH',
      perihal: 'Permohonan Rekomendasi Bantuan Pembangunan/Rehabilitasi Rumah Ibadah',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Hindu',
      lampiran: 'Proposal, RAB, Tanda Daftar Rumah Ibadah, Bukti Tanah & Rekening Bank',
      intro: 'Sehubungan dengan rencana pembangunan/rehabilitasi rumah ibadah umat Hindu/Kaharingan di wilayah kami, bersama ini kami mohon penerbitan Surat Rekomendasi Bantuan:',
      fields: [
        ['Nama Pura / Balai Basarah', '................................................'],
        ['Nomor Tanda Daftar', '................................................'],
        ['Alamat Lengkap & Kec.', '................................................'],
        ['Nilai Usulan RAB', 'Rp .............................................'],
        ['Bank & No. Rekening Panitia', '................................................'],
      ],
      closing: 'Terlampir proposal lengkap beserta RAB, Tanda Daftar Rumah Ibadah, bukti status tanah, foto kondisi terkini, dan fotokopi rekening bank atas nama panitia/pengurus.',
      signerTitle: 'Ketua Pengurus Pura / Balai Basarah',
    }),
  ],

  'bh-tanda-daftar-pasraman': [
    makeLetterTemplate({
      id: 'tpl-bh-tanda-daftar-pasraman',
      title: 'Format Permohonan Rekomendasi Tanda Daftar Pasraman',
      description: 'Surat permohonan pengurus Pasraman lengkap dengan profil pendidik, jumlah siswa, dan jadwal pembelajaran.',
      fileName: 'Format_Permohonan_Tanda_Daftar_Pasraman.doc',
      kop: 'KOP SURAT PENGURUS PASRAMAN / LEMBAGA PENDIDIKAN HINDU',
      perihal: 'Permohonan Rekomendasi Tanda Daftar Pasraman',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Hindu',
      lampiran: 'Domisili Desa/Lurah, Susunan Pengurus, Daftar Pendidik, Siswa & Jadwal',
      intro: 'Dalam rangka tertib administrasi pendidikan keagamaan Hindu/Kaharingan, kami pengurus Pasraman mengajukan permohonan Rekomendasi Tanda Daftar Pasraman:',
      fields: [
        ['Nama Pasraman', '................................................'],
        ['Jenjang / Bentuk Pasraman', '[Pratama / Adi / Madya / Utama Widya Pasraman / Nonformal]'],
        ['Alamat / Desa / Kecamatan', '................................................'],
        ['Jumlah Pendidik & Siswa', '...... Pendidik / ...... Siswa Pasraman'],
        ['Jadwal Pembelajaran', '................................................'],
      ],
      closing: 'Terlampir surat keterangan domisili dari Kepala Desa/Lurah, susunan pengurus, daftar tenaga pendidik, daftar siswa, serta jadwal pembelajaran aktif.',
      signerTitle: 'Ketua Pengurus Pasraman',
    }),
  ],

  'bh-perpanjangan-tanda-daftar-pasraman': [
    makeLetterTemplate({
      id: 'tpl-bh-perpanjangan-tanda-daftar-pasraman',
      title: 'Format Permohonan Perpanjangan Tanda Daftar Pasraman',
      description: 'Surat pengajuan perpanjangan masa berlaku Tanda Daftar Pasraman beserta pembaruan data siswa & pendidik.',
      fileName: 'Format_Perpanjangan_Tanda_Daftar_Pasraman.doc',
      kop: 'KOP SURAT PENGURUS PASRAMAN',
      perihal: 'Permohonan Rekomendasi Perpanjangan Tanda Daftar Pasraman',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Hindu',
      lampiran: 'Salinan Tanda Daftar Lama, Pembaruan Data Pendidik/Siswa & Suket Aktif',
      intro: 'Mengingat berakhirnya masa berlaku Tanda Daftar Pasraman kami, bersama ini kami memohon Rekomendasi Perpanjangan Tanda Daftar Pasraman:',
      fields: [
        ['Nama Pasraman', '................................................'],
        ['Nomor Tanda Daftar Lama', '................................................'],
        ['Alamat / Kecamatan', '................................................'],
        ['Data Terbaru Pendidik/Siswa', '...... Pendidik / ...... Siswa aktif'],
      ],
      closing: 'Terlampir salinan Tanda Daftar lama, daftar pendidik, siswa dan jadwal terbaru, serta surat keterangan aktif dari Desa/Kelurahan atau Majelis Agama Hindu.',
      signerTitle: 'Ketua Pengurus Pasraman',
    }),
  ],

  'bh-kitab-suci': [
    makeLetterTemplate({
      id: 'tpl-bh-kitab-suci',
      title: 'Format Surat Permohonan Kitab Suci Weda / Panaturan',
      description: 'Surat permohonan bantuan Kitab Suci Hindu / Panaturan untuk Pura, Balai Basarah, atau Pasraman.',
      fileName: 'Format_Permohonan_Kitab_Suci_Hindu.doc',
      kop: 'KOP SURAT PURA / BALAI BASARAH / PASRAMAN',
      perihal: 'Permohonan Bantuan Kitab Suci Weda / Panaturan',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Hindu',
      lampiran: 'Daftar Kebutuhan & Nama Penerima Manfaat',
      intro: 'Untuk menunjang pelaksanaan peribadatan dan pembinaan umat Hindu/Kaharingan, kami mengajukan permohonan bantuan kitab suci sebagai berikut:',
      fields: [
        ['Nama Lembaga / Rumah Ibadah', '................................................'],
        ['Jenis Kitab Suci Dimohon', '[Kitab Suci Weda / Kitab Suci Panaturan]'],
        ['Jumlah Kebutuhan', '........ eksemplar'],
        ['Alamat & Kontak Pengurus', '................................................'],
      ],
      closing: 'Atas perhatian dan bantuan Bapak/Ibu, kami ucapkan terima kasih.',
      signerTitle: 'Ketua Pengurus / Pinandita / Basir',
    }),
  ],

  'bh-aktivasi-simpatika': [
    makeLetterTemplate({
      id: 'tpl-bh-aktivasi-simpatika',
      title: 'Format Surat Pengantar Aktivasi SIMPATIKA Guru Agama Hindu',
      description: 'Surat pengantar Kepala Sekolah / Pimpinan Pasraman untuk aktivasi PTK Guru Pendidikan Agama Hindu.',
      fileName: 'Format_Pengantar_Aktivasi_SIMPATIKA_Hindu.doc',
      kop: 'KOP SURAT SEKOLAH / PASRAMAN',
      perihal: 'Permohonan Aktivasi Akun PTK SIMPATIKA Guru Agama Hindu',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Hindu (Admin SIMPATIKA)',
      lampiran: 'SK Pengangkatan/Pembagian Tugas Mengajar, KTP & Ijazah Terakhir',
      intro: 'Dengan hormat, kami memohon pengaktifan / pengesahan akun PTK pada layanan SIMPATIKA bagi Guru Pendidikan Agama Hindu pada satuan pendidikan kami:',
      fields: [
        ['Nama Guru PTK', '................................................'],
        ['PegID / NUPTK (jika ada)', '................................................'],
        ['Nama Sekolah / Pasraman', '................................................'],
        ['Beban Mengajar / Minggu', '........ jam pelajaran'],
        ['Email Aktif & No. WA Guru', '................................................'],
      ],
      closing: 'Terlampir SK Pengangkatan / Pembagian Tugas Mengajar, fotokopi KTP, dan ijazah terakhir.',
      signerTitle: 'Kepala Sekolah / Pimpinan Pasraman',
    }),
  ],

  /* ---------------------------- PENYELENGGARA KRISTEN ---------------------------- */
  'bk-daftar-gereja': [
    makeLetterTemplate({
      id: 'tpl-bk-daftar-gereja',
      title: 'Format Surat Permohonan Pendaftaran Gereja',
      description: 'Surat permohonan resmi dari Sinode Induk / Majelis Jemaat untuk tanda lapor pendaftaran gereja.',
      fileName: 'Format_Permohonan_Pendaftaran_Gereja.doc',
      kop: 'KOP SURAT SINODE INDUK / MAJELIS JEMAAT GEREJA',
      perihal: 'Permohonan Pendaftaran Gereja',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'Domisili Desa/Lurah, Susunan Majelis, Daftar Anggota Jemaat & Status Lahan',
      intro: 'Dalam rangka tertib administrasi kelembagaan gereja di Kabupaten Murung Raya, kami mengajukan permohonan pendaftaran gereja dengan data sebagai berikut:',
      fields: [
        ['Nama Gereja / Jemaat', '................................................'],
        ['Sinode Induk', '................................................'],
        ['Alamat Lengkap & Kec.', '................................................'],
        ['Ketua Majelis / Pendeta', '................................................'],
        ['Jumlah Anggota Jemaat', '........ jiwa / ........ KK'],
      ],
      closing: 'Terlampir surat keterangan domisili Desa/Lurah, susunan majelis gereja, daftar anggota jemaat, status lahan, dan foto gedung gereja.',
      signerTitle: 'Pimpinan Sinode / Ketua Majelis Jemaat',
    }),
  ],

  'bk-daftar-yayasan': [
    makeLetterTemplate({
      id: 'tpl-bk-daftar-yayasan',
      title: 'Format Surat Permohonan Pendaftaran Yayasan Keagamaan Kristen',
      description: 'Surat permohonan resmi pengurus yayasan Kristen dilampiri Akta Notaris & SK Kemenkumham RI.',
      fileName: 'Format_Permohonan_Pendaftaran_Yayasan_Kristen.doc',
      kop: 'KOP SURAT YAYASAN AGAMA DAN KEAGAMAAN KRISTEN',
      perihal: 'Permohonan Pendaftaran Yayasan Agama dan Keagamaan',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'Akta Notaris, SK Kemenkumham RI, NPWP Yayasan, AD/ART & Domisili',
      intro: 'Bersama ini kami pengurus Yayasan mengajukan permohonan penerbitan Surat Tanda Daftar Yayasan Agama dan Keagamaan Kristen pada Kankemenag Kab. Murung Raya:',
      fields: [
        ['Nama Yayasan', '................................................'],
        ['No. Akta Notaris & Kemenkumham', '................................................'],
        ['NPWP Yayasan', '................................................'],
        ['Alamat Kantor Yayasan', '................................................'],
        ['Ketua / Pengurus Inti', '................................................'],
      ],
      closing: 'Terlampir Akta Notaris, SK pengesahan Kemenkumham RI, NPWP Yayasan, AD/ART, dan surat keterangan domisili kantor.',
      signerTitle: 'Ketua Yayasan',
    }),
  ],

  'bk-td-lembaga-agama': [
    makeLetterTemplate({
      id: 'tpl-bk-td-lembaga-agama',
      title: 'Format Permohonan Tanda Daftar Lembaga Agama & Keagamaan',
      description: 'Surat permohonan pimpinan lembaga/persekutuan Kristen untuk penerbitan Piagam Tanda Daftar.',
      fileName: 'Format_Permohonan_TD_Lembaga_Kristen.doc',
      kop: 'KOP SURAT LEMBAGA / PERSEKUTUAN KEAGAMAAN KRISTEN',
      perihal: 'Permohonan Tanda Daftar Lembaga Agama dan Keagamaan',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'AD/ART, Struktur Pengurus, Program Kerja & Domisili Desa/Kelurahan',
      intro: 'Bersama ini kami pimpinan lembaga keagamaan Kristen mengajukan permohonan Tanda Daftar Lembaga pada Penyelenggara Bimas Kristen Kankemenag Kab. Murung Raya:',
      fields: [
        ['Nama Lembaga / Persekutuan', '................................................'],
        ['Bidang Pelayanan', '................................................'],
        ['Alamat Sekretariat & Kec.', '................................................'],
        ['Nama Ketua / Penanggung Jawab', '................................................'],
      ],
      closing: 'Terlampir AD/ART, struktur pengurus, program kerja lembaga, dan surat keterangan domisili dari Desa/Kelurahan di Kab. Murung Raya.',
      signerTitle: 'Pimpinan Lembaga Keagamaan',
    }),
  ],

  'bk-bantuan-sarpras': [
    makeLetterTemplate({
      id: 'tpl-bk-bantuan-sarpras',
      title: 'Format Permohonan Rekomendasi Bantuan Sarpras Gereja',
      description: 'Surat pengajuan rekomendasi bantuan sarana/prasarana gereja lengkap dengan proposal & RAB.',
      fileName: 'Format_Permohonan_Bantuan_Sarpras_Gereja.doc',
      kop: 'KOP SURAT MAJELIS GEREJA',
      perihal: 'Permohonan Rekomendasi Bantuan Sarana dan Prasarana Rumah Ibadah',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'Proposal & RAB, Tanda Daftar Gereja Berlaku, Foto & Rekening Bank Gereja',
      intro: 'Dengan kasih karunia Tuhan Yang Maha Esa, kami majelis jemaat gereja memohon penerbitan Surat Rekomendasi Bantuan Sarana dan Prasarana Rumah Ibadah:',
      fields: [
        ['Nama Gereja / Jemaat', '................................................'],
        ['Nomor Tanda Daftar Gereja', '................................................'],
        ['Alamat Lengkap & Kec.', '................................................'],
        ['Total Nilai RAB Usulan', 'Rp .............................................'],
        ['Bank & No. Rekening Gereja', '................................................'],
      ],
      closing: 'Terlampir proposal bantuan, RAB, fotokopi Tanda Daftar Gereja berlaku, foto kondisi bangunan gereja, dan fotokopi rekening bank atas nama gereja/panitia.',
      signerTitle: 'Ketua Majelis Jemaat / Panitia Pembangunan',
    }),
  ],

  'bk-perpanjangan-yayasan': [
    makeLetterTemplate({
      id: 'tpl-bk-perpanjangan-yayasan',
      title: 'Format Permohonan Perpanjangan Pendaftaran Yayasan Kristen',
      description: 'Surat pengajuan rekomendasi perpanjangan Surat Tanda Daftar Yayasan Agama dan Keagamaan.',
      fileName: 'Format_Perpanjangan_Yayasan_Kristen.doc',
      kop: 'KOP SURAT YAYASAN AGAMA DAN KEAGAMAAN KRISTEN',
      perihal: 'Permohonan Rekomendasi Perpanjangan Pendaftaran Yayasan',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'Salinan Tanda Daftar Yayasan Lama, Laporan Kegiatan 1 Tahun & Pengurus Terbaru',
      intro: 'Sehubungan dengan habisnya masa berlaku Tanda Daftar Yayasan kami, bersama ini kami mengajukan permohonan Rekomendasi Perpanjangan Pendaftaran Yayasan:',
      fields: [
        ['Nama Yayasan', '................................................'],
        ['Nomor Tanda Daftar Lama', '................................................'],
        ['Alamat Kantor Yayasan', '................................................'],
        ['Ketua Yayasan Sekarang', '................................................'],
      ],
      closing: 'Terlampir salinan Surat Tanda Daftar Yayasan sebelumnya, laporan kegiatan 1 tahun terakhir, dan susunan pengurus terbaru.',
      signerTitle: 'Ketua Yayasan',
    }),
  ],

  'bk-perpanjangan-gereja': [
    makeLetterTemplate({
      id: 'tpl-bk-perpanjangan-gereja',
      title: 'Format Permohonan Perpanjangan Pendaftaran Gereja',
      description: 'Surat pengajuan rekomendasi perpanjangan Tanda Lapor / Pendaftaran Gereja dari Sinode atau Majelis Jemaat.',
      fileName: 'Format_Perpanjangan_Gereja_Kristen.doc',
      kop: 'KOP SURAT SINODE / MAJELIS JEMAAT GEREJA',
      perihal: 'Permohonan Rekomendasi Perpanjangan Pendaftaran Gereja',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'Salinan Tanda Lapor Gereja Sebelumnya & Pembaruan Data Jemaat/Majelis',
      intro: 'Mengingat habisnya masa berlaku Surat Tanda Lapor / Pendaftaran Gereja kami, bersama ini kami memohon penerbitan Rekomendasi Perpanjangan Pendaftaran Gereja:',
      fields: [
        ['Nama Gereja / Jemaat', '................................................'],
        ['Nomor Tanda Lapor Lama', '................................................'],
        ['Alamat & Kecamatan', '................................................'],
        ['Jumlah Jemaat Aktif Kini', '........ jiwa / ........ KK'],
      ],
      closing: 'Terlampir salinan Surat Tanda Lapor gereja sebelumnya serta pembaruan data jemaat dan susunan majelis aktif.',
      signerTitle: 'Pimpinan Sinode / Ketua Majelis Jemaat',
    }),
  ],

  'bk-kitab-suci': [
    makeLetterTemplate({
      id: 'tpl-bk-kitab-suci',
      title: 'Format Surat Permohonan Bantuan Kitab Suci Alkitab',
      description: 'Surat resmi gereja, sekolah, atau kelompok persekutuan doa untuk bantuan Kitab Suci Alkitab.',
      fileName: 'Format_Permohonan_Kitab_Suci_Kristen.doc',
      kop: 'KOP SURAT GEREJA / SEKOLAH / PERSEKUTUAN DOA',
      perihal: 'Permohonan Bantuan Kitab Suci Alkitab',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'Daftar Penerima Manfaat Alkitab',
      intro: 'Guna menunjang pelayanan ibadah dan pembinaan iman jemaat/peserta didik, kami mengajukan permohonan bantuan Kitab Suci Alkitab sebagai berikut:',
      fields: [
        ['Nama Gereja / Sekolah', '................................................'],
        ['Alamat Lengkap & Kec.', '................................................'],
        ['Jumlah Alkitab Dimohon', '........ eksemplar'],
        ['Penanggung Jawab / No. WA', '................................................'],
      ],
      closing: 'Bantuan Kitab Suci ini akan disalurkan secara langsung kepada jemaat/siswa yang membutuhkan.',
      signerTitle: 'Ketua Majelis / Pimpinan Lembaga',
    }),
  ],

  'bk-aktivasi-simpatika': [
    makeLetterTemplate({
      id: 'tpl-bk-aktivasi-simpatika',
      title: 'Format Surat Pengantar Aktivasi SIMPATIKA Guru PAK',
      description: 'Surat pengantar resmi Kepala Sekolah / Pimpinan Lembaga untuk aktivasi akun PTK Guru PAK pada SIMPATIKA.',
      fileName: 'Format_Pengantar_Aktivasi_SIMPATIKA_Kristen.doc',
      kop: 'KOP SURAT SEKOLAH / LEMBAGA PENDIDIKAN',
      perihal: 'Permohonan Aktivasi Akun SIMPATIKA Guru Pendidikan Agama Kristen',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'SK Pembagian Tugas Mengajar Guru PAK, KTP & Ijazah Terakhir',
      intro: 'Dengan hormat, kami memohon pengaktifan dan pengesahan akun PTK SIMPATIKA bagi Guru Pendidikan Agama Kristen pada satuan pendidikan kami:',
      fields: [
        ['Nama Guru PAK', '................................................'],
        ['PegID / NUPTK (jika ada)', '................................................'],
        ['Nama Sekolah / NPSN', '................................................'],
        ['Email Aktif & No. WA', '................................................'],
      ],
      closing: 'Terlampir SK Pengangkatan / SK Pembagian Tugas Mengajar Guru PAK, fotokopi KTP, dan ijazah terakhir.',
      signerTitle: 'Kepala Sekolah / Pimpinan Lembaga',
    }),
  ],

  'bk-aktivasi-pakat': [
    makeLetterTemplate({
      id: 'tpl-bk-aktivasi-pakat',
      title: 'Format Surat Permohonan Aktivasi Akun PAKAT Guru PAK',
      description: 'Surat permohonan aktivasi akun Sistem Informasi Guru Pendidikan Agama Kristen (PAKAT).',
      fileName: 'Format_Permohonan_Aktivasi_PAKAT_Kristen.doc',
      kop: 'KOP SURAT SEKOLAH / LEMBAGA PENDIDIKAN',
      perihal: 'Permohonan Aktivasi Akun Sistem Informasi PAKAT',
      tujuanCta: 'Penyelenggara Bimbingan Masyarakat Kristen',
      lampiran: 'SK Pembagian Tugas Mengajar Guru PAK Semester Berjalan & KTP',
      intro: 'Sehubungan dengan pelaporan data Guru Pendidikan Agama Kristen melalui aplikasi PAKAT, kami mengajukan permohonan aktivasi akun PAKAT untuk:',
      fields: [
        ['Nama Guru Pemohon', '................................................'],
        ['NPK / NUPTK', '................................................'],
        ['Unit Kerja / Sekolah', '................................................'],
        ['Alamat Email Aktif Guru', '................................................'],
        ['Nomor WhatsApp Aktif', '................................................'],
      ],
      closing: 'Terlampir SK Pengangkatan / SK Pembagian Tugas Mengajar semester berjalan dan fotokopi KTP pemohon.',
      signerTitle: 'Kepala Sekolah / Guru PAK Pemohon',
    }),
  ],

  /* ------------------------------ KEPEGAWAIAN ------------------------------ */
  'kep-kenaikan-pangkat': [
    makeLetterTemplate({
      id: 'tpl-kep-kenaikan-pangkat',
      title: 'Format Surat Pengantar Usulan Kenaikan Pangkat Satker',
      description: 'Surat pengantar resmi Kepala Satuan Kerja / Atasan Langsung untuk pengusulan berkas Kenaikan Pangkat ASN.',
      fileName: 'Format_Pengantar_Kenaikan_Pangkat_ASN.doc',
      kop: 'KOP SURAT SATUAN KERJA / MADRASAH / KUA KECAMATAN',
      perihal: 'Usulan Kenaikan Pangkat Periode [Bulan] Tahun 2026',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'SK CPNS, SK PNS, SK Pangkat Terakhir, SKP 2 Tahun & Dokumen KP',
      intro: 'Dengan hormat, bersama ini kami sampaikan berkas usulan Kenaikan Pangkat Pegawai Negeri Sipil di lingkungan satuan kerja kami atas nama:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['Pangkat / Gol. Saat Ini', '................................................'],
        ['Jabatan & Satuan Kerja', '................................................'],
        ['Jenis Kenaikan Pangkat', '[Reguler / Pilihan Fungsional / Penyesuaian Ijazah]'],
        ['Usulan Pangkat / Gol. Baru', '................................................'],
      ],
      closing: 'Seluruh dokumen persyaratan (SK CPNS/PNS/KP terakhir, SKP 2 tahun terakhir minimal Baik, serta SK Jabatan/PAK) kami lampirkan lengkap.',
      signerTitle: 'Kepala Satuan Kerja / Atasan Langsung',
    }),
  ],

  'kep-kgb': [
    makeLetterTemplate({
      id: 'tpl-kep-kgb',
      title: 'Format Surat Permohonan Penerbitan KGB Pegawai',
      description: 'Surat pengantar / permohonan penerbitan Surat Pemberitahuan Kenaikan Gaji Berkala (KGB).',
      fileName: 'Format_Permohonan_KGB_ASN.doc',
      kop: 'KOP SURAT SATUAN KERJA / UNIT KERJA',
      perihal: 'Permohonan Penerbitan Kenaikan Gaji Berkala (KGB)',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'Fotokopi SK Pangkat Terakhir, SK KGB Terakhir & SKP Terakhir',
      intro: 'Sehubungan dengan telah terpenuhinya masa kerja golongan untuk Kenaikan Gaji Berkala (KGB), kami mengajukan penerbitan KGB atas nama:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['Pangkat / Golongan Ruang', '................................................'],
        ['Masa Kerja Golongan Lama', '........ Tahun ........ Bulan'],
        ['TMT KGB Terakhir', '................................................'],
        ['Unit Kerja', '................................................'],
      ],
      closing: 'Terlampir fotokopi SK Pangkat terakhir, SK KGB terakhir, dan penilaian kinerja (SKP) tahun terakhir.',
      signerTitle: 'Kepala Unit Kerja / Pemohon',
    }),
  ],

  'kep-cuti-pegawai': [
    {
      id: 'tpl-kep-cuti-pegawai',
      title: 'Format Formulir Permintaan dan Pemberian Cuti ASN',
      description: 'Sesuai format standar Peraturan BKN tentang Tata Cara Pemberian Cuti Pegawai ASN (disetujui atasan langsung).',
      fileName: 'Format_Formulir_Cuti_Pegawai_ASN.doc',
      previewText: `FORMULIR PERMINTAAN DAN PEMBERIAN CUTI ASN
------------------------------------------------------------------------
I. DATA PEGAWAI
  Nama          : ....................................................
  NIP           : ....................................................
  Jabatan       : ....................................................
  Unit Kerja    : ....................................................
  Masa Kerja    : ........ Tahun ........ Bulan

II. JENIS CUTI YANG DIAMBIL
  [ ] Cuti Tahunan         [ ] Cuti Melahirkan
  [ ] Cuti Besar           [ ] Cuti Karena Alasan Penting
  [ ] Cuti Sakit           [ ] Cuti di Luar Tanggungan Negara

III. ALASAN & LAMANYA CUTI
  Alasan Cuti   : ....................................................
  Selama        : ...... hari, mulai tgl .......... s.d. .............
  Alamat & HP   : ....................................................

IV. PERTIMBANGAN ATASAN LANGSUNG : [ ] Disetujui  [ ] Perubahan  [ ] Ditangguhkan
V.  KEPUTUSAN PEJABAT BERWENANG  : [ ] Disetujui  [ ] Ditolak

Puruk Cahu, ...................... 2026
Atasan Langsung,                         Pegawai yang Mengajukan,


(.......................)                (.......................)`,
      contentHtml: wrapWordHtml(
        'Format Formulir Permintaan dan Pemberian Cuti ASN',
        `<p class="judul">FORMULIR PERMINTAAN DAN PEMBERIAN CUTI ASN</p>
        <p class="nomor">Puruk Cahu, ........................ 2026</p>
        <table class="data">
          <tr><th colspan="4">I. DATA PEGAWAI</th></tr>
          <tr><td style="width:130px">Nama</td><td>.................................</td><td style="width:110px">NIP</td><td>.................................</td></tr>
          <tr><td>Jabatan</td><td>.................................</td><td>Masa Kerja</td><td>...... Thn ...... Bln</td></tr>
          <tr><td>Unit Kerja</td><td colspan="3">..................................................................</td></tr>
          <tr><th colspan="4">II. JENIS CUTI YANG DIAMBIL</th></tr>
          <tr><td colspan="2">[ ] Cuti Tahunan</td><td colspan="2">[ ] Cuti Besar / Sakit / Melahirkan / Alasan Penting</td></tr>
          <tr><th colspan="4">III. ALASAN &amp; LAMANYA CUTI</th></tr>
          <tr><td>Alasan Cuti</td><td colspan="3">..................................................................</td></tr>
          <tr><td>Lamanya Cuti</td><td>...... hari kerja</td><td>Mulai s.d. Tgl</td><td>.............. s.d. ..............</td></tr>
          <tr><td>Alamat &amp; No. HP</td><td colspan="3">..................................................................</td></tr>
          <tr><th colspan="4">IV. PERTIMBANGAN ATASAN LANGSUNG</th></tr>
          <tr><td colspan="4">[ ] Disetujui &nbsp;&nbsp;&nbsp; [ ] Perubahan &nbsp;&nbsp;&nbsp; [ ] Ditangguhkan &nbsp;&nbsp;&nbsp; [ ] Tidak Disetujui</td></tr>
        </table>
        <table class="ttd">
          <tr><td>Atasan Langsung,<br/><br/><br/><br/><u>(..........................................)</u><br/>NIP.</td><td>Hormat saya,<br/><br/><br/><br/><u>(..........................................)</u><br/>NIP.</td></tr>
        </table>`
      ),
    },
  ],

  'kep-pensiun-pegawai': [
    makeLetterTemplate({
      id: 'tpl-kep-pensiun',
      title: 'Format Permohonan Pensiun & Daftar Susunan Keluarga ASN',
      description: 'Surat permohonan pensiun (BUP / APS / Janda-Duda / Keuzuran Jasmani) dilengkapi susunan keluarga.',
      fileName: 'Format_Permohonan_Pensiun_ASN.doc',
      kop: 'PERMOHONAN PENSIUN PEGAWAI NEGERI SIPIL',
      subKop: 'Kantor Kementerian Agama Kabupaten Murung Raya',
      perihal: 'Permohonan Pensiun [BUP / Atas Permintaan Sendiri / Janda-Duda]',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'SK CPNS, PNS, KP Terakhir, Karpeg, KK, Akta Nikah, Suket Bebas Disiplin & SKP',
      intro: 'Dengan hormat, saya yang bertanda tangan di bawah ini mengajukan permohonan usulan pemberhentian dengan hormat dengan hak pensiun:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['Tempat, Tanggal Lahir', '................................................'],
        ['Pangkat / Golongan / Jabatan', '................................................'],
        ['Unit Kerja', '................................................'],
        ['Jenis & TMT Pensiun', '[BUP / APS / Janda-Duda] TMT .....................'],
        ['Alamat Setelah Pensiun', '................................................'],
      ],
      extraPreviewText: `Daftar Susunan Keluarga:\n- Istri/Suami : ........................... (Tgl Nikah: ............)\n- Anak Kandung : 1. ........................ 2. ....................`,
      extraTableHtml: `<p><strong>Daftar Susunan Keluarga Tertanggung:</strong></p><table class="data"><tr><th>No</th><th>Nama Lengkap</th><th>Hubungan Keluarga</th><th>Tanggal Lahir</th></tr><tr><td>1</td><td></td><td>Istri / Suami</td><td></td></tr><tr><td>2</td><td></td><td>Anak Kandung</td><td></td></tr></table>`,
      closing: 'Seluruh berkas persyaratan sesuai ketentuan BKN dan PT Taspen kami lampirkan lengkap bersama surat ini.',
      signerTitle: 'Pegawai Pemohon (Mengetahui Kepala Satker)',
    }),
  ],

  'kep-mutasi-pegawai': [
    makeLetterTemplate({
      id: 'tpl-kep-mutasi',
      title: 'Format Permohonan Mutasi / Pindah Wilayah Kerja Pegawai',
      description: 'Surat permohonan mutasi bermeterai disertai keterangan lolos butuh atasan dan rincian Anjab/ABK.',
      fileName: 'Format_Permohonan_Mutasi_Pegawai_ASN.doc',
      kop: 'PERMOHONAN MUTASI / PINDAH UNIT KERJA ASN',
      subKop: 'Kantor Kementerian Agama Kabupaten Murung Raya',
      perihal: 'Permohonan Mutasi / Pindah Tugas Pegawai',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'Lolos Butuh Asal & Tujuan, SK CPNS/PNS/KP/Jabatan, SKP 2 Tahun & Anjab/ABK',
      intro: 'Dengan hormat, saya mengajukan permohonan mutasi / pindah tugas pegawai dengan pertimbangan kedinasan/keluarga sebagai berikut:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['Pangkat / Jabatan Sekarang', '................................................'],
        ['Satuan Kerja Asal', '................................................'],
        ['Satuan Kerja Tujuan', '................................................'],
        ['Alasan Mengajukan Mutasi', '................................................'],
      ],
      closing: 'Terlampir surat persetujuan/lolos butuh dari pimpinan satker asal dan tujuan, fotokopi SK CPNS s.d. terakhir, SKP 2 tahun terakhir, serta dokumen Anjab/ABK.',
      signerTitle: 'Pegawai Pemohon [Meterai Rp10.000]',
    }),
  ],

  'kep-karpeg-karis-karsu': [
    makeLetterTemplate({
      id: 'tpl-kep-karpeg-karis-karsu',
      title: 'Format Usulan Karpeg / Karis / Karsu & Laporan Perkawinan',
      description: 'Surat pengantar pengajuan Kartu Pegawai (Karpeg), Kartu Istri (Karis), atau Kartu Suami (Karsu).',
      fileName: 'Format_Permohonan_Karpeg_Karis_Karsu.doc',
      kop: 'KOP SURAT SATUAN KERJA / UNIT KERJA',
      perihal: 'Usulan Penerbitan [Karpeg / Karis / Karsu]',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'SK CPNS, SK PNS, STTPL Latsar, Buku Nikah Legalisir KUA & Pasfoto 3x4',
      intro: 'Dengan hormat, bersama ini kami ajukan berkas usulan penerbitan [Karpeg / Karis / Karsu] pegawai di lingkungan Kankemenag Kab. Murung Raya:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['Jenis Kartu Diusulkan', '[Karpeg / Karis / Karsu - Baru / Pengganti Hilang]'],
        ['Nama Pasangan (Karis/Karsu)', '................................................'],
        ['Tanggal Perkawinan / No. Akta', '................................................'],
        ['Unit Kerja', '................................................'],
      ],
      closing: 'Terlampir SK CPNS, SK PNS, STTPL Latsar/Prajabatan, fotokopi Buku Nikah legalisir KUA (untuk Karis/Karsu), pasfoto 3x4, atau surat kehilangan kepolisian (jika penggantian ulang).',
      signerTitle: 'Kepala Unit Kerja / Pemohon',
    }),
  ],

  'kep-satyalancana': [
    makeLetterTemplate({
      id: 'tpl-kep-satyalancana',
      title: 'Format Pengantar & DRH Usulan Satyalancana Karya Satya',
      description: 'Surat usulan dan ringkasan Daftar Riwayat Hidup (DRH) masa pengabdian 10, 20, atau 30 tahun.',
      fileName: 'Format_DRH_Usulan_Satyalancana_Karya_Satya.doc',
      kop: 'KOP SURAT SATUAN KERJA / UNIT KERJA',
      perihal: 'Usulan Tanda Kehormatan Satyalancana Karya Satya [10/20/30] Tahun',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'DRH Lengkap, SK CPNS, SK Pangkat Terakhir, Suket Tidak Kena Hukdis & Piagam Lama',
      intro: 'Sehubungan dengan masa pengabdian Pegawai Negeri Sipil secara terus-menerus dan tanpa catatan hukuman disiplin, kami mengusulkan penganugerahan Satyalancana Karya Satya:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['TMT CPNS', '................................................'],
        ['Pangkat / Jabatan Sekarang', '................................................'],
        ['Kategori Satyalancana', '[10 Tahun / 20 Tahun / 30 Tahun]'],
        ['No. Piagam Sebelumnya (20/30)', '................................................'],
      ],
      closing: 'Terlampir Daftar Riwayat Hidup (DRH), SK CPNS, SK Pangkat terakhir, dan Surat Keterangan Tidak Pernah Dijatuhi Hukuman Disiplin dari atasan langsung.',
      signerTitle: 'Kepala Satuan Kerja / Atasan Langsung',
    }),
  ],

  'kep-izin-tugas-belajar': [
    makeLetterTemplate({
      id: 'tpl-kep-izin-tugas-belajar',
      title: 'Format Permohonan & Rekomendasi Atasan Izin / Tugas Belajar',
      description: 'Surat permohonan pegawai dilengkapi rekomendasi atasan untuk melanjutkan studi jenjang S1/S2/S3.',
      fileName: 'Format_Permohonan_Izin_Tugas_Belajar.doc',
      kop: 'PERMOHONAN IZIN BELAJAR / TUGAS BELAJAR ASN',
      subKop: 'Kantor Kementerian Agama Kabupaten Murung Raya',
      perihal: 'Permohonan Rekomendasi / SK [Izin Belajar / Tugas Belajar]',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'Suket Lulus PT Terakreditasi B/Baik Sekali, SK PNS/KP, Ijazah, SKP & Jadwal',
      intro: 'Dengan hormat, dalam rangka peningkatan kompetensi akademik sesuai kebutuhan organisasi, bersama ini saya mengajukan permohonan [Izin Belajar / Tugas Belajar]:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['Unit Kerja & Jabatan', '................................................'],
        ['Perguruan Tinggi & Akreditasi', '.................... (Akreditasi: ...........)'],
        ['Program Studi & Jenjang', '................................................'],
        ['Jenis Studi & Jadwal Kuliah', '[Izin Belajar Luar Jam Kerja / Tugas Belajar Beasiswa]'],
      ],
      closing: 'Saya berkomitmen tidak mengganggu pelaksanaan tugas kedinasan (untuk Izin Belajar) serta melampirkan seluruh persyaratan sesuai ketentuan.',
      signerTitle: 'Pegawai Pemohon (Disetujui Atasan Langsung)',
    }),
  ],

  'kep-penyesuaian-ijazah-gelar': [
    makeLetterTemplate({
      id: 'tpl-kep-penyesuaian-ijazah',
      title: 'Format Pengantar Usulan Penyesuaian Ijazah / Pencantuman Gelar',
      description: 'Surat pengantar satker untuk usulan Ujian Penyesuaian Kenaikan Pangkat atau Pencantuman Gelar Akademik.',
      fileName: 'Format_Usulan_Penyesuaian_Ijazah_Gelar.doc',
      kop: 'KOP SURAT SATUAN KERJA / UNIT KERJA',
      perihal: 'Usulan [Penyesuaian Ijazah / Pencantuman Gelar Akademik]',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'SK Izin/Tugas Belajar, Ijazah & Transkrip Legalisir, Cetakan PDDikti & SK Terakhir',
      intro: 'Bersama ini kami menyampaikan usulan [Penyesuaian Ijazah / Pencantuman Gelar Akademik] pegawai yang telah menyelesaikan pendidikan tinggi sesuai Izin/Tugas Belajar:',
      fields: [
        ['Nama Pegawai (Gelar Baru)', '................................................'],
        ['NIP / Pangkat / Golongan', '................................................'],
        ['Nomor SK Izin/Tugas Belajar', '................................................'],
        ['Perguruan Tinggi & Prodi', '................................................'],
        ['Nomor Ijazah & Tahun Lulus', '................................................'],
      ],
      closing: 'Terlampir SK Izin/Tugas Belajar, fotokopi Ijazah & Transkrip dilegalisir Perguruan Tinggi, tangkapan layar PDDikti, SK CPNS/PNS/Pangkat terakhir, dan uraian tugas relevan.',
      signerTitle: 'Kepala Satuan Kerja',
    }),
  ],

  'kep-surat-tugas-keterangan': [
    makeLetterTemplate({
      id: 'tpl-kep-surat-tugas-keterangan',
      title: 'Format Nota Dinas / Permohonan Surat Tugas & Keterangan Pegawai',
      description: 'Untuk pengajuan Surat Tugas, Surat Keterangan Penghasilan/Rincian Gaji, Pengaktifan Kembali, atau Izin Kawin/Cerai ASN.',
      fileName: 'Format_Permohonan_Surat_Tugas_Keterangan_Pegawai.doc',
      kop: 'PERMOHONAN SURAT TUGAS / SURAT KETERANGAN KEPEGAWAIAN',
      subKop: 'Kantor Kementerian Agama Kabupaten Murung Raya',
      perihal: 'Permohonan Penerbitan [Surat Tugas / Surat Keterangan Kepegawaian]',
      tujuanCta: 'Analis SDM Aparatur / Subbag Tata Usaha (Kepegawaian)',
      lampiran: 'Fotokopi SK Terakhir, Identitas Pegawai & Dokumen Pendukung',
      intro: 'Dengan hormat, saya yang bertanda tangan di bawah ini mengajukan permohonan penerbitan [Surat Tugas / Surat Keterangan Kepegawaian] dengan keperluan:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['Jabatan & Unit Kerja', '................................................'],
        ['Jenis Surat Dimohon', '[Surat Tugas / Ket. Penghasilan / Izin Kawin-Cerai / Lainnya]'],
        ['Tujuan / Keperluan Surat', '................................................'],
        ['Nomor WhatsApp Aktif', '................................................'],
      ],
      closing: 'Demikian permohonan ini disampaikan untuk dapat diproses sesuai kewenangan pejabat berwenang.',
      signerTitle: 'Pegawai Pemohon',
    }),
  ],

  'kep-perubahan-data': [
    makeLetterTemplate({
      id: 'tpl-kep-perubahan-data',
      title: 'Format Permohonan Perubahan Data Kepegawaian & KP4 Keluarga',
      description: 'Untuk pembaruan data SIMPEG/SIASN, daftar keluarga/tunjangan keluarga (KP4), atau data jabatan fungsional.',
      fileName: 'Format_Permohonan_Perubahan_Data_KP4_Pegawai.doc',
      kop: 'FORMULIR PERMOHONAN PERUBAHAN DATA KEPEGAWAIAN',
      subKop: 'Kantor Kementerian Agama Kabupaten Murung Raya',
      perihal: 'Permohonan Pembaruan Data Kepegawaian / KP4 Tunjangan Keluarga',
      tujuanCta: 'Analis SDM Aparatur / Pengelola SIMPEG & Keuangan',
      lampiran: 'Dokumen Bukti Autentik (Akta Nikah/Cerai, Akta Lahir, KTP/KK, SK JF/PAK)',
      intro: 'Dengan hormat, bersama ini saya mengajukan pemutakhiran data kepegawaian pada sistem SIMPEG / SIASN / Daftar Gaji dengan rincian perubahan sebagai berikut:',
      fields: [
        ['Nama Pegawai / NIP', '................................ / ...................'],
        ['Unit Kerja', '................................................'],
        ['Elemen Data Diubah', '[Data Keluarga KP4 / Status Nikah / Alamat-KK / Jabatan Fungsional]'],
        ['Data Semula', '................................................'],
        ['Menjadi (Data Baru)', '................................................'],
      ],
      closing: 'Terlampir dokumen bukti autentik terbaru (Akta Nikah/Cerai, Akta Kelahiran anak, KK/KTP terbaru, atau SK Inpassing/PAK) beserta fotokopi SK terakhir.',
      signerTitle: 'Pegawai Pemohon',
    }),
  ],
};
