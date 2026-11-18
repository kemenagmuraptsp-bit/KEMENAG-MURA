import { ServiceTemplate } from '@/src/types';

export function wrapWordHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  @page { size: A4; margin: 2.2cm 2.2cm 2.2cm 2.5cm; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; color: #111; }
  .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px; }
  .kop h2 { margin: 0; font-size: 13pt; text-transform: uppercase; }
  .kop p { margin: 2px 0 0 0; font-size: 10pt; }
  .judul { text-align: center; font-weight: bold; text-decoration: underline; margin: 14px 0 4px 0; text-transform: uppercase; }
  .nomor { text-align: center; margin: 0 0 14px 0; font-size: 11pt; }
  table.meta { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  table.meta td { padding: 2px 4px; vertical-align: top; }
  table.data { width: 100%; border-collapse: collapse; margin: 10px 0 14px 0; }
  table.data th, table.data td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; text-align: left; }
  table.data th { background-color: #f3f4f6; }
  .ttd { width: 100%; margin-top: 26px; }
  .ttd td { width: 50%; vertical-align: top; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export const PENDIS_TEMPLATES_BY_SUB_ID: Record<string, ServiceTemplate[]> = {
  'pendis-penelitian': [
    {
      id: 'tpl-pendis-penelitian',
      title: 'Format Surat Permohonan Izin Penelitian',
      description: 'Digunakan sebagai acuan surat permohonan/pengantar izin penelitian pada madrasah/pesantren di Kab. Murung Raya.',
      fileName: 'Format_Surat_Permohonan_Izin_Penelitian_Pendis.doc',
      previewText: `[KOP SURAT PERGURUAN TINGGI / LEMBAGA PENELITI]
------------------------------------------------------------------------
Nomor      : .../....../2026
Lampiran   : 1 (satu) berkas proposal ringkas
Hal        : Permohonan Izin Penelitian

Kepada Yth.
Kepala Kantor Kementerian Agama Kabupaten Murung Raya
Cq. Kepala Seksi Pendidikan Islam
di - Puruk Cahu

Dengan hormat,
Sehubungan dengan pelaksanaan tugas akhir / penelitian akademik, bersama ini kami mohon kesediaan Bapak/Ibu untuk memberikan izin penelitian kepada:

  Nama Peneliti        : ................................................
  NIM / NIDN / NIK     : ................................................
  Program Studi / Unit : ................................................
  Judul Penelitian     : ................................................
  Lembaga Tujuan       : [Nama Madrasah / Pondok Pesantren di Murung Raya]
  Waktu Pelaksanaan    : ........ s.d. ........ 2026

Sebagai bahan pertimbangan, terlampir proposal ringkas penelitian dan fotokopi KTP/KTM peneliti.
Demikian permohonan ini kami sampaikan, atas perhatian dan perkenannya diucapkan terima kasih.

Puruk Cahu, ...................... 2026
Pimpinan / Dekan / Ketua Lembaga,


(........................................)
NIP/NIDN.`,
      contentHtml: wrapWordHtml(
        'Format Surat Permohonan Izin Penelitian',
        `<div class="kop">
          <h2>[KOP SURAT PERGURUAN TINGGI / LEMBAGA PENELITI]</h2>
          <p>Alamat Lengkap, Nomor Telepon, dan Email Resmi Lembaga</p>
        </div>
        <table class="meta">
          <tr><td style="width:90px">Nomor</td><td>: ....... / ....... / 2026</td><td style="text-align:right">Puruk Cahu, ................. 2026</td></tr>
          <tr><td>Lampiran</td><td>: 1 (satu) berkas proposal ringkas</td><td></td></tr>
          <tr><td>Perihal</td><td>: <strong>Permohonan Izin Penelitian</strong></td><td></td></tr>
        </table>
        <p>Kepada Yth.<br/>Kepala Kantor Kementerian Agama Kabupaten Murung Raya<br/>Cq. Kepala Seksi Pendidikan Islam<br/>di - Puruk Cahu</p>
        <p>Dengan hormat,<br/>Sehubungan dengan penyusunan karya ilmiah / penelitian keagamaan dan pendidikan, bersama ini kami mengajukan permohonan izin penelitian kepada:</p>
        <table class="meta">
          <tr><td style="width:180px">Nama Peneliti</td><td>: ....................................................</td></tr>
          <tr><td>NIM / NIDN / NIK</td><td>: ....................................................</td></tr>
          <tr><td>Program Studi / Instansi</td><td>: ....................................................</td></tr>
          <tr><td>Judul Penelitian</td><td>: ....................................................</td></tr>
          <tr><td>Lokasi Tujuan</td><td>: [Nama Madrasah / Pondok Pesantren di Kab. Murung Raya]</td></tr>
          <tr><td>Waktu Pelaksanaan</td><td>: .................... s.d. .................... 2026</td></tr>
        </table>
        <p>Sebagai kelengkapan administrasi, kami lampirkan proposal ringkas penelitian dan fotokopi KTP/KTM peneliti. Demikian permohonan ini disampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>
        <table class="ttd">
          <tr><td></td><td>Pimpinan / Dekan / Ketua Lembaga,<br/><br/><br/><br/><u>(..........................................)</u><br/>NIP/NIDN.</td></tr>
        </table>`
      ),
    },
  ],

  'pendis-ijazah-kesalahan': [
    {
      id: 'tpl-pendis-ijazah-pemohon',
      title: 'Format Surat Permohonan Ralat Ijazah (Pemohon)',
      description: 'Surat permohonan resmi dari pemilik/wali ijazah kepada Kepala Madrasah penerbit dan Kankemenag Kab. Murung Raya.',
      fileName: 'Format_Permohonan_Ralat_Ijazah_Pemohon.doc',
      previewText: `Puruk Cahu, ...................... 2026

Hal : Permohonan Surat Keterangan Kesalahan Penulisan Ijazah Madrasah

Kepada Yth.
Kepala Kantor Kementerian Agama Kab. Murung Raya
Cq. Kepala Seksi Pendidikan Islam
Melalui Kepala [Nama Madrasah Penerbit Ijazah]
di - Puruk Cahu

Dengan hormat,
Saya yang bertanda tangan di bawah ini:
  Nama Lengkap        : ................................................
  Tempat, Tgl Lahir   : ................................................
  Tahun Lulus / NSM   : ................ / .............................
  Nomor Seri Ijazah   : ................................................
  Alamat / No. HP/WA  : ................................................

Mengajukan permohonan penerbitan Surat Keterangan Pengganti/Ralat Kesalahan Penulisan Ijazah karena terdapat kesalahan penulisan pada bagian [Nama / Tempat-Tgl Lahir / Nama Orang Tua], yaitu:
  - Tertulis pada Ijazah : .............................................
  - Seharusnya (Benar)   : .............................................

Terlampir berkas pendukung (Ijazah asli, fotokopi Akta Kelahiran, KK, Buku Induk dilegalisir, dan pasfoto 3x4).

Hormat saya,
Pemohon,


(........................................)`,
      contentHtml: wrapWordHtml(
        'Format Permohonan Ralat Ijazah Madrasah',
        `<p style="text-align:right">Puruk Cahu, ...................... 2026</p>
        <p>Perihal : <strong>Permohonan Surat Keterangan Kesalahan Penulisan Ijazah Madrasah</strong></p>
        <p>Kepada Yth.<br/>Kepala Kantor Kementerian Agama Kabupaten Murung Raya<br/>Cq. Kepala Seksi Pendidikan Islam<br/>Melalui Kepala [Nama Madrasah Penerbit]<br/>di - Puruk Cahu</p>
        <p>Dengan hormat, saya yang bertanda tangan di bawah ini:</p>
        <table class="meta">
          <tr><td style="width:180px">Nama Lengkap</td><td>: ....................................................</td></tr>
          <tr><td>Tempat, Tanggal Lahir</td><td>: ....................................................</td></tr>
          <tr><td>Asal Madrasah / Tahun Lulus</td><td>: ....................................................</td></tr>
          <tr><td>Nomor Seri Ijazah</td><td>: ....................................................</td></tr>
          <tr><td>Alamat / Nomor WhatsApp</td><td>: ....................................................</td></tr>
        </table>
        <p>Mengajukan permohonan penerbitan Surat Keterangan Kesalahan Penulisan Ijazah Madrasah dengan rincian perbaikan data sebagai berikut:</p>
        <table class="data">
          <tr><th>Jenis Data</th><th>Tertulis pada Ijazah</th><th>Seharusnya (Sesuai Akta/Buku Induk)</th></tr>
          <tr><td>[Contoh: Nama Siswa / Tgl Lahir]</td><td>................................</td><td>................................</td></tr>
        </table>
        <p>Sebagai bahan verifikasi, terlampir ijazah asli, fotokopi Akta Kelahiran, Kartu Keluarga, Buku Induk Siswa dilegalisir madrasah, dan pasfoto 3x4 sebanyak 2 lembar.</p>
        <table class="ttd">
          <tr><td></td><td>Pemohon,<br/><br/><br/><br/><u>(..........................................)</u></td></tr>
        </table>`
      ),
    },
    {
      id: 'tpl-pendis-ijazah-kepmad',
      title: 'Format Surat Keterangan Kepala Madrasah Penerbit',
      description: 'Wajib diterbitkan oleh Kepala Madrasah asal untuk menerangkan kesalahan penulisan sesuai Buku Induk.',
      fileName: 'Format_Suket_Kesalahan_Ijazah_Kepala_Madrasah.doc',
      previewText: `[KOP SURAT MADRASAH PENERBIT IJAZAH]
------------------------------------------------------------------------
                 SURAT KETERANGAN KESALAHAN PENULISAN IJAZAH
                 Nomor : .../Mts.../PP.01.1/../2026

Yang bertanda tangan di bawah ini Kepala [Nama Madrasah], Kabupaten Murung Raya, menerangkan dengan sesungguhnya bahwa:
  Nama Siswa          : ................................................
  Nomor Induk / NISN  : ................................................
  Nomor Seri Ijazah   : ................................................
  Tahun Pelajaran     : ................................................

Berdasarkan Buku Induk Siswa dan Akta Kelahiran yang sah, terdapat kesalahan penulisan pada Ijazah asli tersebut, yaitu:
  - Tertulis pada Ijazah : .............................................
  - Seharusnya (Benar)   : .............................................

Surat Keterangan ini diterbitkan sebagai dasar pengesahan ralat ijazah pada Seksi Pendidikan Islam Kankemenag Kab. Murung Raya.

Puruk Cahu, ...................... 2026
Kepala Madrasah,

[Meterai / Stempel & Pasfoto 3x4]

(........................................)
NIP.`,
      contentHtml: wrapWordHtml(
        'Format Surat Keterangan Kesalahan Penulisan Ijazah Kepala Madrasah',
        `<div class="kop">
          <h2>[KOP SURAT MADRASAH PENERBIT IJAZAH]</h2>
          <p>NSM : ...................... | NPSN : ...................... | Kab. Murung Raya</p>
        </div>
        <p class="judul">SURAT KETERANGAN KESALAHAN PENULISAN IJAZAH</p>
        <p class="nomor">Nomor : ....... / ....... / PP.01.1 / .... / 2026</p>
        <p>Yang bertanda tangan di bawah ini Kepala Madrasah ........................................ Kabupaten Murung Raya menerangkan dengan sesungguhnya bahwa:</p>
        <table class="meta">
          <tr><td style="width:180px">Nama Lengkap</td><td>: ....................................................</td></tr>
          <tr><td>NIS / NISN</td><td>: ....................................................</td></tr>
          <tr><td>Nomor Seri Ijazah</td><td>: ....................................................</td></tr>
          <tr><td>Tahun Lulus</td><td>: ....................................................</td></tr>
        </table>
        <p>Berdasarkan Buku Induk Siswa dan dokumen kependudukan yang sah, terdapat kekeliruan penulisan pada lembar Ijazah Asli yang bersangkutan dengan rincian:</p>
        <table class="data">
          <tr><th>Elemen Data</th><th>Tertulis pada Ijazah</th><th>Seharusnya (Benar)</th></tr>
          <tr><td>[Nama / TTL / Nama Ortu]</td><td>................................</td><td>................................</td></tr>
        </table>
        <p>Demikian Surat Keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya dan diajukan ke Seksi Pendidikan Islam Kankemenag Kab. Murung Raya.</p>
        <table class="ttd">
          <tr><td style="vertical-align:bottom"><div style="border:1px solid #000;width:85px;height:110px;text-align:center;line-height:110px;font-size:10pt;">Foto 3x4</div></td><td>Puruk Cahu, ................. 2026<br/>Kepala Madrasah,<br/><br/><br/><br/><u>(..........................................)</u><br/>NIP.</td></tr>
        </table>`
      ),
    },
  ],

  'pendis-ijop': [
    {
      id: 'tpl-pendis-ijop-permohonan',
      title: 'Format Surat Permohonan Pendirian / Izin Operasional (IJOP)',
      description: 'Surat pengajuan resmi dari Yayasan atau Pengurus Pondok Pesantren / MDT / LPQ / Madrasah.',
      fileName: 'Format_Permohonan_IJOP_Pendis_Mura.doc',
      previewText: `[KOP SURAT YAYASAN / LEMBAGA PENDIDIKAN]
------------------------------------------------------------------------
Nomor      : .../....../2026
Lampiran   : 1 (satu) berkas proposal pendirian lembaga
Hal        : Permohonan Izin Pendirian / Operasional Lembaga (IJOP)

Kepada Yth.
Kepala Kantor Kementerian Agama Kabupaten Murung Raya
Cq. Kepala Seksi Pendidikan Islam
di - Puruk Cahu

Dengan hormat,
Dalam rangka mendukung peningkatan mutu pendidikan Islam dan dakwah di Kabupaten Murung Raya, kami pengurus [Yayasan / Pondok Pesantren / TPQ / MDT / Madrasah] mengajukan permohonan Izin Pendirian / Operasional (IJOP) dengan data berikut:

  Nama Lembaga         : ................................................
  Jenjang / Jenis      : [RA / MI / MTs / MA / Pontren / MDT / TPQ-LPQ]
  Alamat Lengkap       : Desa/Kel. .............. Kec. ..................
  Nama Yayasan/Pengurus: ................................................
  Jumlah Pendidik      : ........ orang
  Jumlah Santri/Siswa  : ........ orang (minimal 15 aktif)

Terlampir Akta Notaris & SK Kemenkumham (bila berbadan hukum), Surat Keterangan Domisili Desa/Kelurahan, profil sarpras, daftar pendidik, dan daftar santri/peserta didik aktif.

Puruk Cahu, ...................... 2026
Ketua Yayasan / Pimpinan Lembaga,


(........................................)`,
      contentHtml: wrapWordHtml(
        'Format Surat Permohonan IJOP Lembaga',
        `<div class="kop">
          <h2>[KOP SURAT YAYASAN / PENGURUS LEMBAGA PENDIDIKAN]</h2>
          <p>Alamat Sekretariat Lembaga - Kabupaten Murung Raya</p>
        </div>
        <table class="meta">
          <tr><td style="width:90px">Nomor</td><td>: ....... / ....... / 2026</td><td style="text-align:right">Puruk Cahu, ................. 2026</td></tr>
          <tr><td>Lampiran</td><td>: 1 (satu) berkas persyaratan IJOP</td><td></td></tr>
          <tr><td>Perihal</td><td>: <strong>Permohonan Izin Pendirian / Operasional (IJOP)</strong></td><td></td></tr>
        </table>
        <p>Kepada Yth.<br/>Kepala Kantor Kementerian Agama Kabupaten Murung Raya<br/>Cq. Kepala Seksi Pendidikan Islam<br/>di - Puruk Cahu</p>
        <p>Dengan hormat, bersama surat ini kami mengajukan permohonan penerbitan Izin Operasional (IJOP) / Tanda Daftar Lembaga Pendidikan Islam dengan profil singkat sebagai berikut:</p>
        <table class="meta">
          <tr><td style="width:190px">Nama Lembaga</td><td>: ....................................................</td></tr>
          <tr><td>Jenis / Satuan Pendidikan</td><td>: [RA / MI / MTs / MA / Pontren / MDT / TPQ]</td></tr>
          <tr><td>Alamat Lokasi Lembaga</td><td>: Desa/Kel. ................ Kec. .................</td></tr>
          <tr><td>Yayasan Penyelenggara</td><td>: ....................................................</td></tr>
          <tr><td>Jumlah Pendidik / Ustadz</td><td>: ........ orang</td></tr>
          <tr><td>Jumlah Santri / Siswa Aktif</td><td>: ........ orang</td></tr>
        </table>
        <p>Terlampir dokumen persyaratan: Akta Notaris &amp; SK Kemenkumham, Surat Domisili Desa/Kelurahan, profil sarana prasarana, kurikulum, daftar pendidik, dan daftar minimal 15 santri/siswa aktif.</p>
        <table class="ttd">
          <tr><td></td><td>Ketua Yayasan / Pimpinan Lembaga,<br/><br/><br/><br/><u>(..........................................)</u></td></tr>
        </table>`
      ),
    },
    {
      id: 'tpl-pendis-ijop-daftar',
      title: 'Format Daftar Tenaga Pendidik & Minimal 15 Santri/Siswa',
      description: 'Lampiran wajib untuk pengajuan IJOP baru (daftar ustadz/guru beserta jadwal & daftar 15 santri/peserta didik aktif).',
      fileName: 'Format_Daftar_Pendidik_Santri_IJOP.doc',
      previewText: `LAMPIRAN DATA PENDIDIK & SANTRI/PESERTA DIDIK AKTIF
Nama Lembaga : ....................................................
Alamat       : Desa/Kel. ................... Kec. .................

A. DAFTAR TENAGA PENDIDIK / USTADZ
No | Nama Lengkap | Pendidikan Terakhir | Mata Pelajaran / Bidang | No. KTP/HP
1. |              |                     |                         |
2. |              |                     |                         |

B. DAFTAR SANTRI / PESERTA DIDIK AKTIF (MINIMAL 15 ORANG)
No | Nama Lengkap | Jenis Kelamin | Tempat, Tgl Lahir | Nama Orang Tua | Alamat
1. |              | L / P         |                   |                |
... (isi minimal 15 santri/siswa aktif) ...
15.|              | L / P         |                   |                |

Mengetahui,
Pimpinan Lembaga,


(........................................)`,
      contentHtml: wrapWordHtml(
        'Format Daftar Pendidik dan Santri IJOP',
        `<p class="judul">LAMPIRAN DATA TENAGA PENDIDIK &amp; SANTRI / PESERTA DIDIK AKTIF</p>
        <p class="nomor">Nama Lembaga : ....................................................</p>
        <p><strong>A. Daftar Tenaga Pendidik / Ustadz</strong></p>
        <table class="data">
          <tr><th>No</th><th>Nama Lengkap</th><th>Pendidikan Terakhir</th><th>Bidang Ajar</th><th>NIK / No. HP</th></tr>
          <tr><td>1</td><td></td><td></td><td></td><td></td></tr>
          <tr><td>2</td><td></td><td></td><td></td><td></td></tr>
          <tr><td>3</td><td></td><td></td><td></td><td></td></tr>
        </table>
        <p><strong>B. Daftar Santri / Peserta Didik Aktif (Minimal 15 Orang)</strong></p>
        <table class="data">
          <tr><th>No</th><th>Nama Lengkap</th><th>L/P</th><th>Tempat, Tanggal Lahir</th><th>Nama Orang Tua</th><th>Alamat</th></tr>
          <tr><td>1</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>2</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>3</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td>...</td><td colspan="5" style="text-align:center">Lanjutkan baris hingga minimal 15 santri/peserta didik aktif</td></tr>
          <tr><td>15</td><td></td><td></td><td></td><td></td><td></td></tr>
        </table>
        <table class="ttd">
          <tr><td></td><td>Pimpinan Lembaga,<br/><br/><br/><br/><u>(..........................................)</u></td></tr>
        </table>`
      ),
    },
  ],

  'pendis-mutasi': [
    {
      id: 'tpl-pendis-mutasi-asal',
      title: 'Format Surat Keterangan Pindah/Mutasi (Madrasah Asal)',
      description: 'Surat keterangan mutasi keluar siswa ber-NPSN dan NSM dari Kepala Madrasah asal.',
      fileName: 'Format_Surat_Pindah_Mutasi_Madrasah_Asal.doc',
      previewText: `[KOP SURAT MADRASAH ASAL]
------------------------------------------------------------------------
                 SURAT KETERANGAN PINDAH / MUTASI SISWA
                 Nomor : .../....../PP.01.1/../2026

Yang bertanda tangan di bawah ini Kepala [Nama Madrasah Asal] (NSM: ............ / NPSN: ............), menerangkan bahwa:
  Nama Siswa          : ................................................
  NIS / NISN          : ................................................
  Kelas / Semester    : ................................................
  Nama Orang Tua/Wali : ................................................

Adalah benar siswa aktif pada madrasah kami dan mengajukan pindah/mutasi ke [Nama Madrasah / Sekolah Tujuan] dengan alasan [ikut pindah tugas orang tua / lainnya].
Status siswa bersangkutan siap dimutasikan pada aplikasi EMIS setelah mendapat pengesahan dari Seksi Pendidikan Islam Kankemenag Kab. Murung Raya.

Puruk Cahu, ...................... 2026
Kepala Madrasah Asal,


(........................................)
NIP.`,
      contentHtml: wrapWordHtml(
        'Format Surat Keterangan Mutasi Madrasah Asal',
        `<div class="kop">
          <h2>[KOP SURAT MADRASAH ASAL]</h2>
          <p>NSM : ...................... | NPSN : ......................</p>
        </div>
        <p class="judul">SURAT KETERANGAN PINDAH / MUTASI SISWA</p>
        <p class="nomor">Nomor : ....... / ....... / PP.01.1 / .... / 2026</p>
        <p>Yang bertanda tangan di bawah ini Kepala Madrasah ........................................ menerangkan bahwa peserta didik berikut:</p>
        <table class="meta">
          <tr><td style="width:180px">Nama Lengkap Siswa</td><td>: ....................................................</td></tr>
          <tr><td>NIS / NISN</td><td>: ....................................................</td></tr>
          <tr><td>Tempat, Tanggal Lahir</td><td>: ....................................................</td></tr>
          <tr><td>Kelas / Tingkat</td><td>: ....................................................</td></tr>
          <tr><td>Nama Orang Tua / Wali</td><td>: ....................................................</td></tr>
        </table>
        <p>Berdasarkan permohonan orang tua/wali, siswa tersebut mengajukan pindah ke <strong>[Nama Madrasah/Sekolah Tujuan]</strong> dengan alasan ......................................... Siswa tersebut tercatat aktif di EMIS dan telah memenuhi ketentuan mutasi madrasah.</p>
        <table class="ttd">
          <tr><td></td><td>Puruk Cahu, ................. 2026<br/>Kepala Madrasah Asal,<br/><br/><br/><br/><u>(..........................................)</u><br/>NIP.</td></tr>
        </table>`
      ),
    },
    {
      id: 'tpl-pendis-mutasi-tujuan',
      title: 'Format Surat Kesediaan Menerima (Madrasah Tujuan)',
      description: 'Surat pernyataan dari Kepala Madrasah tujuan bahwa kuota kelas tersedia dan bersedia menerima siswa pindahan.',
      fileName: 'Format_Surat_Kesediaan_Menerima_Madrasah_Tujuan.doc',
      previewText: `[KOP SURAT MADRASAH TUJUAN]
------------------------------------------------------------------------
               SURAT KETERANGAN BERSEDIA MENERIMA SISWA PINDAHAN
               Nomor : .../....../2026

Kepala [Nama Madrasah Tujuan] (NSM: ............ / NPSN: ............) menerangkan bahwa kami BERSEDIA MENERIMA siswa pindahan atas nama:
  Nama Siswa          : ................................................
  NISN                : ................................................
  Asal Madrasah       : ................................................
  Diterima di Kelas   : ................................................

Demikian surat keterangan ini dibuat untuk melengkapi pengesahan mutasi siswa pada Seksi Pendidikan Islam Kankemenag Kab. Murung Raya dan proses mutasi EMIS.

Puruk Cahu, ...................... 2026
Kepala Madrasah Tujuan,


(........................................)
NIP.`,
      contentHtml: wrapWordHtml(
        'Format Surat Kesediaan Menerima Siswa Pindahan',
        `<div class="kop">
          <h2>[KOP SURAT MADRASAH TUJUAN]</h2>
          <p>NSM : ...................... | NPSN : ......................</p>
        </div>
        <p class="judul">SURAT KETERANGAN BERSEDIA MENERIMA SISWA PINDAHAN</p>
        <p class="nomor">Nomor : ....... / ....... / 2026</p>
        <p>Yang bertanda tangan di bawah ini Kepala Madrasah ........................................ menerangkan bahwa madrasah kami <strong>bersedia menerima</strong> peserta didik pindahan dengan identitas:</p>
        <table class="meta">
          <tr><td style="width:180px">Nama Lengkap Siswa</td><td>: ....................................................</td></tr>
          <tr><td>NISN</td><td>: ....................................................</td></tr>
          <tr><td>Madrasah Asal</td><td>: ....................................................</td></tr>
          <tr><td>Akan Diterima di Kelas</td><td>: ....................................................</td></tr>
        </table>
        <p>Demikian surat keterangan ini dibuat sebagai dasar penerbitan Rekomendasi Mutasi Siswa pada Seksi Pendidikan Islam Kankemenag Kab. Murung Raya.</p>
        <table class="ttd">
          <tr><td></td><td>Puruk Cahu, ................. 2026<br/>Kepala Madrasah Tujuan,<br/><br/><br/><br/><u>(..........................................)</u><br/>NIP.</td></tr>
        </table>`
      ),
    },
  ],

  'pendis-bantuan': [
    {
      id: 'tpl-pendis-bantuan',
      title: 'Format Surat Permohonan Rekomendasi & Kerangka Proposal Bantuan',
      description: 'Acuan surat permohonan rekomendasi dan susunan bab proposal bantuan sarpras/operasional lembaga.',
      fileName: 'Format_Permohonan_Rekomendasi_Bantuan_Pendis.doc',
      previewText: `[KOP SURAT MADRASAH / PONTREN / TPQ / MDT]
------------------------------------------------------------------------
Nomor      : .../....../2026
Lampiran   : 1 (satu) berkas proposal bantuan + RAB
Hal        : Permohonan Surat Rekomendasi Bantuan Lembaga

Kepada Yth.
Kepala Kantor Kementerian Agama Kabupaten Murung Raya
Cq. Kepala Seksi Pendidikan Islam
di - Puruk Cahu

Dengan hormat,
Sehubungan dengan pengajuan proposal bantuan [Sarana Prasarana / Operasional Lembaga] kepada [Kemenag RI / Pemkab Murung Raya / Lembaga Mitra], kami memohon penerbitan Surat Rekomendasi Kelayakan Lembaga dengan data:

  Nama Lembaga         : ................................................
  Nomor IJOP / NSPP    : ................................................
  NPWP & No. Rekening  : .................... / Bank ....................
  Total Usulan RAB     : Rp .............................................

Terlampir Proposal Bantuan, Fotokopi SK IJOP/NSPP yang masih berlaku, NPWP Lembaga, Rekening Bank atas nama lembaga, dan foto kondisi terkini.

Puruk Cahu, ...................... 2026
Pimpinan Lembaga / Kepala Madrasah,


(........................................)`,
      contentHtml: wrapWordHtml(
        'Format Permohonan Rekomendasi Bantuan Lembaga Pendis',
        `<div class="kop">
          <h2>[KOP SURAT MADRASAH / PONTREN / TPQ / MDT]</h2>
          <p>Nomor IJOP / NSPP : ...................... | Kab. Murung Raya</p>
        </div>
        <table class="meta">
          <tr><td style="width:90px">Nomor</td><td>: ....... / ....... / 2026</td><td style="text-align:right">Puruk Cahu, ................. 2026</td></tr>
          <tr><td>Lampiran</td><td>: 1 (satu) berkas proposal &amp; RAB</td><td></td></tr>
          <tr><td>Perihal</td><td>: <strong>Permohonan Rekomendasi Bantuan Lembaga</strong></td><td></td></tr>
        </table>
        <p>Kepada Yth.<br/>Kepala Kantor Kementerian Agama Kabupaten Murung Raya<br/>Cq. Kepala Seksi Pendidikan Islam<br/>di - Puruk Cahu</p>
        <p>Dengan hormat, kami mengajukan permohonan Surat Rekomendasi Kelayakan Penerima Bantuan Lembaga dengan data sebagai berikut:</p>
        <table class="meta">
          <tr><td style="width:190px">Nama Lembaga</td><td>: ....................................................</td></tr>
          <tr><td>Nomor SK IJOP / NSPP</td><td>: ....................................................</td></tr>
          <tr><td>Tujuan Pengajuan Bantuan</td><td>: [Kemenag RI / Pemkab Murung Raya / Mitra]</td></tr>
          <tr><td>Jenis Bantuan &amp; Nilai RAB</td><td>: Rp ...............................................</td></tr>
          <tr><td>NPWP &amp; Rekening Lembaga</td><td>: ....................................................</td></tr>
        </table>
        <p><strong>Sistematika Lampiran Proposal:</strong> (1) Latar Belakang &amp; Profil Lembaga, (2) Rencana Anggaran Biaya (RAB), (3) Fotokopi SK IJOP/NSPP berlaku, (4) NPWP &amp; Buku Rekening Bank atas nama lembaga, (5) Foto kondisi lokasi.</p>
        <table class="ttd">
          <tr><td></td><td>Pimpinan Lembaga / Kepala Madrasah,<br/><br/><br/><br/><u>(..........................................)</u></td></tr>
        </table>`
      ),
    },
  ],

  'pendis-perpanjangan-ijop-pki': [
    {
      id: 'tpl-pendis-perpanjangan-pki',
      title: 'Format Permohonan Perpanjangan IJOP PKI (Pontren / MDT / LPQ)',
      description: 'Surat pengajuan perpanjangan tanda daftar/IJOP Pendidikan Keagamaan Islam beserta surat keterangan aktif lembaga.',
      fileName: 'Format_Permohonan_Perpanjangan_IJOP_PKI.doc',
      previewText: `[KOP SURAT PONTREN / MDT / TPQ / PKPPS]
------------------------------------------------------------------------
Nomor      : .../....../2026
Lampiran   : 1 (satu) berkas dokumen perpanjangan IJOP
Hal        : Permohonan Perpanjangan Tanda Daftar / IJOP Pendidikan Keagamaan Islam

Kepada Yth.
Kepala Kantor Kementerian Agama Kabupaten Murung Raya
Cq. Kepala Seksi Pendidikan Islam
di - Puruk Cahu

Dengan hormat,
Mengingat masa berlaku Piagam/SK Izin Operasional lembaga kami akan/telah berakhir, kami mengajukan permohonan Perpanjangan Tanda Daftar / IJOP Pendidikan Keagamaan Islam:

  Nama Lembaga         : ................................................
  Jenis PKI            : [Pondok Pesantren / MDT / LPQ (TPQ-TPA) / PKPPS]
  NSPP / Nomor Statistik: ...............................................
  No. SK IJOP Lama     : ................................................
  Jumlah Ustadz/Santri : ...... Ustadz / ...... Santri aktif di EMIS

Terlampir salinan Piagam & SK IJOP sebelumnya, profil lembaga & daftar santri/ustadz terbaru, serta Surat Keterangan Aktif dari Desa/Kelurahan atau KUA setempat.

Puruk Cahu, ...................... 2026
Pimpinan Lembaga,


(........................................)`,
      contentHtml: wrapWordHtml(
        'Format Permohonan Perpanjangan IJOP Pendidikan Keagamaan Islam',
        `<div class="kop">
          <h2>[KOP SURAT PONTREN / MDT / TPQ-TPA / PKPPS]</h2>
          <p>Alamat Lembaga - Kabupaten Murung Raya</p>
        </div>
        <table class="meta">
          <tr><td style="width:90px">Nomor</td><td>: ....... / ....... / 2026</td><td style="text-align:right">Puruk Cahu, ................. 2026</td></tr>
          <tr><td>Lampiran</td><td>: 1 (satu) berkas perpanjangan IJOP</td><td></td></tr>
          <tr><td>Perihal</td><td>: <strong>Permohonan Perpanjangan Tanda Daftar / IJOP PKI</strong></td><td></td></tr>
        </table>
        <p>Kepada Yth.<br/>Kepala Kantor Kementerian Agama Kabupaten Murung Raya<br/>Cq. Kepala Seksi Pendidikan Islam<br/>di - Puruk Cahu</p>
        <p>Dengan hormat, bersama ini kami mengajukan permohonan perpanjangan Izin Operasional / Tanda Daftar Lembaga Pendidikan Keagamaan Islam:</p>
        <table class="meta">
          <tr><td style="width:200px">Nama Lembaga</td><td>: ....................................................</td></tr>
          <tr><td>Jenis Lembaga PKI</td><td>: [Pontren / MDT / LPQ (TPQ/TPA) / PKPPS]</td></tr>
          <tr><td>NSPP / Nomor Statistik</td><td>: ....................................................</td></tr>
          <tr><td>Nomor SK &amp; Piagam Lama</td><td>: ....................................................</td></tr>
          <tr><td>Jumlah Ustadz &amp; Santri</td><td>: ...... Ustadz / ...... Santri aktif EMIS</td></tr>
        </table>
        <p>Terlampir fotokopi SK &amp; Piagam IJOP lama, pembaruan profil dan daftar santri/ustadz EMIS, serta Surat Keterangan Aktif dari Kepala Desa/Lurah atau KUA Kecamatan setempat.</p>
        <table class="ttd">
          <tr><td></td><td>Pimpinan Lembaga,<br/><br/><br/><br/><u>(..........................................)</u></td></tr>
        </table>`
      ),
    },
  ],

  'pendis-perpanjangan-ijop-madrasah': [
    {
      id: 'tpl-pendis-perpanjangan-madrasah',
      title: 'Format Permohonan Perpanjangan IJOP Lembaga Madrasah',
      description: 'Surat resmi dari Yayasan penyelenggara RA/MI/MTs/MA untuk perpanjangan Izin Operasional Madrasah.',
      fileName: 'Format_Permohonan_Perpanjangan_IJOP_Madrasah.doc',
      previewText: `[KOP SURAT YAYASAN PENYELENGGARA MADRASAH]
------------------------------------------------------------------------
Nomor      : .../....../2026
Lampiran   : 1 (satu) berkas dokumen perpanjangan IJOP Madrasah
Hal        : Permohonan Perpanjangan Tanda Daftar / IJOP Lembaga Madrasah

Kepada Yth.
Kepala Kantor Kementerian Agama Kabupaten Murung Raya
Cq. Kepala Seksi Pendidikan Islam
di - Puruk Cahu

Dengan hormat,
Kami pengurus Yayasan penyelenggara Madrasah mengajukan permohonan Perpanjangan Izin Operasional (IJOP) Lembaga Madrasah dengan rincian:

  Nama Yayasan         : ................................................
  Nama Madrasah        : [RA / MI / MTs / MA] ..........................
  NSM / NPSN           : .................... / .........................
  No. SK IJOP Lama     : ................................................
  Data EMIS Terbaru    : ...... Siswa / ...... Guru & Tendik

Terlampir SK IJOP & Piagam NSM sebelumnya, salinan Akta Notaris Yayasan & SK Kemenkumham RI, serta rekapitulasi data EMIS peserta didik, PTK, dan sarana prasarana madrasah.

Puruk Cahu, ...................... 2026
Ketua Yayasan,


(........................................)`,
      contentHtml: wrapWordHtml(
        'Format Permohonan Perpanjangan IJOP Madrasah',
        `<div class="kop">
          <h2>[KOP SURAT YAYASAN PENYELENGGARA MADRASAH]</h2>
          <p>SK Kemenkumham RI Nomor : .................................</p>
        </div>
        <table class="meta">
          <tr><td style="width:90px">Nomor</td><td>: ....... / ....... / 2026</td><td style="text-align:right">Puruk Cahu, ................. 2026</td></tr>
          <tr><td>Lampiran</td><td>: 1 (satu) berkas persyaratan IJOP Madrasah</td><td></td></tr>
          <tr><td>Perihal</td><td>: <strong>Permohonan Perpanjangan IJOP Lembaga Madrasah</strong></td><td></td></tr>
        </table>
        <p>Kepada Yth.<br/>Kepala Kantor Kementerian Agama Kabupaten Murung Raya<br/>Cq. Kepala Seksi Pendidikan Islam<br/>di - Puruk Cahu</p>
        <p>Dengan hormat, bersama surat ini kami mengajukan permohonan perpanjangan Izin Operasional (IJOP) Lembaga Madrasah dengan identitas:</p>
        <table class="meta">
          <tr><td style="width:190px">Nama Yayasan</td><td>: ....................................................</td></tr>
          <tr><td>Nama Madrasah (RA/MI/MTs/MA)</td><td>: ....................................................</td></tr>
          <tr><td>NSM / NPSN</td><td>: ....................................................</td></tr>
          <tr><td>Nomor SK IJOP Lama</td><td>: ....................................................</td></tr>
          <tr><td>Rekap EMIS Terakhir</td><td>: ...... Peserta Didik / ...... PTK</td></tr>
        </table>
        <p>Terlampir fotokopi SK IJOP &amp; Piagam NSM sebelumnya, Akta Notaris Yayasan &amp; SK Kemenkumham RI masih berlaku, serta cetakan data EMIS terbaru.</p>
        <table class="ttd">
          <tr><td></td><td>Ketua Yayasan,<br/><br/><br/><br/><u>(..........................................)</u></td></tr>
        </table>`
      ),
    },
  ],

  'pendis-akun-emis-siaga': [
    {
      id: 'tpl-pendis-akun-emis-siaga',
      title: 'Format Surat Permohonan & Tugas Operator EMIS / SIAGA PAI',
      description: 'Surat pengantar resmi pimpinan lembaga/kepala sekolah sekaligus penunjukan operator EMIS atau aktivasi akun guru SIAGA PAI.',
      fileName: 'Format_Permohonan_Akun_EMIS_SIAGA_PAI.doc',
      previewText: `[KOP SURAT MADRASAH / SEKOLAH / LEMBAGA]
------------------------------------------------------------------------
Nomor      : .../....../2026
Lampiran   : 1 (satu) berkas
Hal        : Permohonan Pembuatan / Aktivasi Akun [EMIS / SIAGA PAI]

Kepada Yth.
Kepala Kantor Kementerian Agama Kabupaten Murung Raya
Cq. Kepala Seksi Pendidikan Islam (Admin EMIS / SIAGA PAI)
di - Puruk Cahu

Dengan hormat,
Sehubungan dengan pengelolaan pendataan pendidikan Islam pada satuan pendidikan kami ([Nama Lembaga] - NPSN/NSM: ............), bersama ini kami mengajukan pembuatan/aktivasi akun [EMIS / SIAGA PAI] untuk:

  Nama Lengkap         : ................................................
  NIK                  : ................................................
  NUPTK / PegID / NPK  : ................................................
  Jabatan / Tugas      : [Operator EMIS Lembaga / Guru PAI]
  Email Aktif          : ................................................
  Nomor WhatsApp       : ................................................

Terlampir SK Pengangkatan / Surat Tugas resmi lembaga, fotokopi KTP, serta (khusus SIAGA PAI) jadwal mengajar semester berjalan.

Puruk Cahu, ...................... 2026
Kepala Sekolah / Pimpinan Lembaga,


(........................................)
NIP.`,
      contentHtml: wrapWordHtml(
        'Format Surat Permohonan Akun EMIS dan SIAGA PAI',
        `<div class="kop">
          <h2>[KOP SURAT MADRASAH / SEKOLAH / LEMBAGA PENDIDIKAN]</h2>
          <p>NPSN / NSM : ...................... | Kab. Murung Raya</p>
        </div>
        <table class="meta">
          <tr><td style="width:90px">Nomor</td><td>: ....... / ....... / 2026</td><td style="text-align:right">Puruk Cahu, ................. 2026</td></tr>
          <tr><td>Lampiran</td><td>: 1 (satu) berkas pendukung</td><td></td></tr>
          <tr><td>Perihal</td><td>: <strong>Permohonan Pembuatan / Aktivasi Akun EMIS / SIAGA PAI</strong></td><td></td></tr>
        </table>
        <p>Kepada Yth.<br/>Kepala Kantor Kementerian Agama Kabupaten Murung Raya<br/>Cq. Kepala Seksi Pendidikan Islam<br/>di - Puruk Cahu</p>
        <p>Dengan hormat, bersama surat ini kami menugaskan sekaligus memohonkan pembuatan / aktivasi akun aplikasi <strong>[EMIS / SIAGA PAI]</strong> kepada:</p>
        <table class="meta">
          <tr><td style="width:190px">Nama Lengkap</td><td>: ....................................................</td></tr>
          <tr><td>NIK</td><td>: ....................................................</td></tr>
          <tr><td>NPK / NUPTK / PegID</td><td>: ....................................................</td></tr>
          <tr><td>Jabatan pada Lembaga</td><td>: [Operator EMIS / Guru Pendidikan Agama Islam]</td></tr>
          <tr><td>Alamat Email Aktif</td><td>: ....................................................</td></tr>
          <tr><td>Nomor WhatsApp</td><td>: ....................................................</td></tr>
        </table>
        <p>Terlampir SK Pengangkatan / Surat Tugas resmi lembaga, fotokopi KTP, dan khusus pengajuan SIAGA PAI dilampirkan SK Pembagian Tugas &amp; Jadwal Mengajar semester berjalan.</p>
        <table class="ttd">
          <tr><td></td><td>Kepala Sekolah / Pimpinan Lembaga,<br/><br/><br/><br/><u>(..........................................)</u><br/>NIP.</td></tr>
        </table>`
      ),
    },
  ],
};
