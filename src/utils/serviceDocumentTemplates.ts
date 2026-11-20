import { OFFICE_INFO, SERVICE_UNITS } from '@/src/data/kemenagData';
import type {
  CloudPtspTicketRecord,
  TicketAttachmentDraft,
  TicketAttachmentMimeType,
} from '@/src/firebase';

const MAX_DATA_URL_CHARS = 780000;
const MAX_PDF_BYTES = 560 * 1024;
const MAX_IMAGE_RAW_BYTES = 10 * 1024 * 1024;

export function formatAttachmentBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function inferAttachmentMimeType(file: File): TicketAttachmentMimeType | null {
  const mime = (file.type || '').toLowerCase();
  if (mime === 'application/pdf') return 'application/pdf';
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'image/jpeg';
  if (mime === 'image/png') return 'image/png';
  if (mime === 'image/webp') return 'image/webp';

  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  return null;
}

function readFileAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca berkas.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas yang dipilih.'));
    reader.readAsDataURL(blob);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gambar tidak dapat dimuat atau format rusak.'));
    img.src = src;
  });
}

async function compressImageToDataUrl(
  file: File,
  preferredMime: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<{ dataUrl: string; mimeType: TicketAttachmentMimeType }> {
  const originalDataUrl = await readFileAsDataUrl(file);
  if (
    originalDataUrl.length <= MAX_DATA_URL_CHARS &&
    /^data:(image\/jpeg|image\/png|image\/webp);base64,[A-Za-z0-9+/=]+$/.test(originalDataUrl)
  ) {
    return { dataUrl: originalDataUrl, mimeType: preferredMime };
  }

  const img = await loadImageElement(originalDataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Peramban tidak mendukung kompresi gambar otomatis.');
  }

  const maxDims = [1400, 1100, 880, 680];
  const qualities = [0.82, 0.68, 0.54, 0.42];

  for (const maxDim of maxDims) {
    const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (const q of qualities) {
      const compressed = canvas.toDataURL('image/jpeg', q);
      if (compressed.length <= MAX_DATA_URL_CHARS) {
        return { dataUrl: compressed, mimeType: 'image/jpeg' };
      }
    }
  }

  throw new Error(
    'Ukuran gambar masih terlalu besar setelah dikompresi. Gunakan foto beresolusi lebih ringkas.'
  );
}

export async function prepareRequirementAttachmentFile(
  file: File,
  requirementIndex: number,
  requirementLabel: string
): Promise<TicketAttachmentDraft> {
  const detectedMime = inferAttachmentMimeType(file);
  if (!detectedMime) {
    throw new Error(
      'Format berkas tidak didukung. Unggah berkas berformat PDF, JPG, PNG, atau WEBP.'
    );
  }

  if (file.size <= 0) {
    throw new Error('Berkas kosong atau rusak.');
  }

  if (detectedMime === 'application/pdf') {
    if (file.size > MAX_PDF_BYTES) {
      throw new Error(
        `Ukuran PDF "${file.name}" (${formatAttachmentBytes(file.size)}) melebihi batas maksimal 560 KB per berkas. Silakan kompres PDF terlebih dahulu.`
      );
    }
    const rawDataUrl = await readFileAsDataUrl(file);
    // Normalize any ';filename=...' parameters so the strict base64 dataUrl regex passes
    const commaIdx = rawDataUrl.indexOf(',');
    const base64Part = commaIdx >= 0 ? rawDataUrl.slice(commaIdx + 1).replace(/\s+/g, '') : '';
    const dataUrl = `data:application/pdf;base64,${base64Part}`;
    if (dataUrl.length > 800000 || !base64Part) {
      throw new Error('Ukuran PDF terenkode melebihi batas penyimpanan daring (maks 560 KB).');
    }
    return {
      requirementIndex,
      requirementLabel,
      fileName: file.name.slice(0, 180),
      mimeType: 'application/pdf',
      fileSize: file.size,
      dataUrl,
    };
  }

  if (file.size > MAX_IMAGE_RAW_BYTES) {
    throw new Error('Ukuran gambar melebihi batas maksimal 10 MB.');
  }

  const { dataUrl, mimeType } = await compressImageToDataUrl(file, detectedMime);
  return {
    requirementIndex,
    requirementLabel,
    fileName: file.name.slice(0, 180),
    mimeType,
    fileSize: file.size,
    dataUrl,
  };
}

/* -------------------------------------------------------------------------- */
/* DOKUMEN RESMI TTE PIMPINAN SESUAI LAYANAN YANG DIPILIH                     */
/* -------------------------------------------------------------------------- */

export interface OfficialTteDocumentModel {
  docNumber: string;
  docHeading: string;
  docSubHeading: string;
  perihal: string;
  unitSectionName: string;
  legalBasis: string[];
  openingParagraph: string;
  detailRows: { label: string; value: string }[];
  decisionTitle: string;
  decisionClauses: string[];
  closingParagraph: string;
  verifiedRequirements: { label: string; checked: boolean }[];
  signerName: string;
  signerTitle: string;
  signerNip: string;
  signedAtLabel: string;
  verificationCode: string;
  isEndorsed: boolean;
}

interface SubServiceDocSpec {
  docHeading: string;
  docSubHeading: string;
  klasifikasiKode: string;
  unitSectionName: string;
  perihalPrefix: string;
  legalBasis: string[];
  openingParagraph: string;
  decisionTitle: string;
  decisionClauses: (ticket: CloudPtspTicketRecord) => string[];
  closingParagraph: string;
}

function getYearFromTicket(ticket: CloudPtspTicketRecord): string {
  const m = ticket.ticketNo.match(/(20\d{2})/);
  return m ? m[1] : String(new Date().getFullYear());
}

function getNumericCodeFromTicket(ticket: CloudPtspTicketRecord): string {
  const m = ticket.ticketNo.match(/(\d{4})/);
  return m ? m[1] : '0101';
}

function getDefaultKlasifikasiByUnit(unitId: string): {
  satkerCode: string;
  kode: string;
  unitSectionName: string;
} {
  switch (unitId) {
    case 'sekretariat':
      return {
        satkerCode: 'Kk.15.10.1',
        kode: 'HM.01',
        unitSectionName: 'Sub Bagian Tata Usaha / Sekretariat',
      };
    case 'bimas-islam':
      return {
        satkerCode: 'Kk.15.10.3',
        kode: 'BA.00',
        unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
      };
    case 'pendis':
      return {
        satkerCode: 'Kk.15.10.2',
        kode: 'PP.00',
        unitSectionName: 'Seksi Pendidikan Islam',
      };
    case 'bimas-hindu':
      return {
        satkerCode: 'Kk.15.10.4',
        kode: 'BA.03',
        unitSectionName: 'Penyelenggara Bimbingan Masyarakat Hindu',
      };
    case 'bimas-kristen':
      return {
        satkerCode: 'Kk.15.10.5',
        kode: 'BA.02',
        unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
      };
    case 'kepegawaian':
      return {
        satkerCode: 'Kk.15.10.1',
        kode: 'KP.01',
        unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
      };
    default:
      return {
        satkerCode: 'Kk.15.10.1',
        kode: 'OT.01',
        unitSectionName: 'Pelayanan Terpadu Satu Pintu (PTSP)',
      };
  }
}

export function generateSuggestedTteDocNumber(ticket: CloudPtspTicketRecord): string {
  if (ticket.tteDocNumber && ticket.tteDocNumber.trim()) {
    return ticket.tteDocNumber.trim();
  }
  const spec = SERVICE_DOC_SPECS[ticket.subServiceId];
  const fallbackUnit = getDefaultKlasifikasiByUnit(ticket.unitId);
  const satkerKode = spec?.klasifikasiKode || `${fallbackUnit.satkerCode}/${fallbackUnit.kode}`;
  const num = getNumericCodeFromTicket(ticket);
  const yr = getYearFromTicket(ticket);
  const nowMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  return `B-${num}/${satkerKode}/${nowMonth}/${yr}`;
}

const SERVICE_DOC_SPECS: Record<string, SubServiceDocSpec> = {
  // ---- A. SEKRETARIAT ----
  'sek-magang': {
    docHeading: 'SURAT PERSETUJUAN PENEMPATAN MAGANG / PKL',
    docSubHeading: 'Diterbitkan Melalui Pelayanan Terpadu Satu Pintu (PTSP)',
    klasifikasiKode: 'Kk.15.10.1/KP.01.2',
    unitSectionName: 'Sub Bagian Tata Usaha / Sekretariat',
    perihalPrefix: 'Persetujuan Praktik Kerja Lapangan (PKL) / Magang Mahasiswa & Siswa',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 19 Tahun 2019 tentang Organisasi dan Tata Kerja Instansi Vertikal Kementerian Agama;',
      'Hasil verifikasi surat pengantar akademik dan telaah Sub Bagian Tata Usaha Kankemenag Kabupaten Murung Raya.',
    ],
    openingParagraph:
      'Menindaklanjuti permohonan izin magang/Praktik Kerja Lapangan (PKL) yang telah melalui verifikasi loket PTSP dan telaah Sub Bagian Tata Usaha, Kepala Kantor Kementerian Agama Kabupaten Murung Raya dengan ini memberikan persetujuan kepada:',
    decisionTitle: 'Ketentuan Pelaksanaan Magang / PKL:',
    decisionClauses: (t) => [
      `Pemohon / Penanggung Jawab (${t.applicantName}${t.institution ? ` · ${t.institution}` : ''}) disetujui melaksanakan kegiatan Magang/PKL pada unit kerja yang ditetapkan oleh Subbag Tata Usaha.`,
      'Peserta wajib mematuhi jam kerja ASN (Senin–Kamis 07.30–16.00 WIB, Jumat 07.30–16.30 WIB), mengenakan identitas/almamater, dan menjaga kerahasiaan dokumen dinas.',
      'Surat persetujuan ini sah digunakan sebagai bukti penerimaan penempatan magang oleh lembaga pengirim.',
    ],
    closingParagraph:
      'Demikian surat persetujuan penempatan magang ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'sek-legalisir': {
    docHeading: 'SURAT KETERANGAN LEGALISASI DOKUMEN RESMI',
    docSubHeading: 'Pengesahan Salinan Dokumen Sekretariat Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/HM.01',
    unitSectionName: 'Sub Bagian Tata Usaha / Sekretariat',
    perihalPrefix: 'Pengesahan Salinan / Legalisir Dokumen Kedinasan',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 19 Tahun 2019 tentang Organisasi dan Tata Kerja Instansi Vertikal Kementerian Agama;',
      'Hasil pencocokan salinan dokumen dengan berkas asli pada Sekretariat Kankemenag Kabupaten Murung Raya.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan fisik dan verifikasi keabsahan salinan dokumen yang diajukan melalui Pelayanan Terpadu Satu Pintu (PTSP), Kepala Kantor Kementerian Agama Kabupaten Murung Raya menyatakan bahwa dokumen atas nama pemohon:',
    decisionTitle: 'Keterangan Pengesahan Legalisir:',
    decisionClauses: () => [
      'Salinan dokumen yang dilampirkan telah dicocokkan dan dinyatakan sesuai dengan dokumen asli yang diterbitkan / tercatat di instansi.',
      'Pengesahan ini berlaku sebagai bukti keabsahan salinan fotokopi untuk keperluan administrasi resmi pemohon.',
    ],
    closingParagraph:
      'Demikian pengesahan legalisasi ini diterbitkan secara elektronik dan berkekuatan hukum sah.',
  },
  'sek-data-info': {
    docHeading: 'SURAT PEMBERIAN DATA & INFORMASI KEAGAMAAN (PPID)',
    docSubHeading: 'Pejabat Pengelola Informasi dan Dokumentasi (PPID) Pelaksana',
    klasifikasiKode: 'Kk.15.10.1/HM.00',
    unitSectionName: 'Sub Bagian Tata Usaha / PPID & Humas',
    perihalPrefix: 'Penyampaian Data dan Informasi Publik Keagamaan',
    legalBasis: [
      'Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik;',
      'Keputusan Menteri Agama RI tentang Pedoman Layanan Informasi Publik pada Kementerian Agama.',
    ],
    openingParagraph:
      'Menindaklanjuti permohonan informasi publik yang telah diverifikasi oleh Pejabat Pengelola Informasi dan Dokumentasi (PPID) Pelaksana, bersama ini disampaikan persetujuan pemberian data/informasi keagamaan kepada:',
    decisionTitle: 'Ketentuan Penggunaan Data & Informasi:',
    decisionClauses: () => [
      'Data dan informasi keagamaan Kabupaten Murung Raya yang diserahkan bersumber dari basis data resmi Kankemenag Kabupaten Murung Raya.',
      'Pemohon wajib mencantumkan sumber resmi dan menggunakan data sesuai tujuan permohonan yang tercatat.',
    ],
    closingParagraph:
      'Demikian surat pemberian data dan informasi keagamaan ini disampaikan untuk dipergunakan sebagaimana mestinya.',
  },
  'sek-konsultasi': {
    docHeading: 'BERITA ACARA & RESUME LAYANAN KONSULTASI',
    docSubHeading: 'Sub Bagian Tata Usaha / PTSP Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/OT.01',
    unitSectionName: 'Sub Bagian Tata Usaha / Sekretariat',
    perihalPrefix: 'Hasil Telaah dan Konsultasi Administrasi Umum',
    legalBasis: [
      'Standar Operasional Prosedur Pelayanan Terpadu Satu Pintu (PTSP) Kankemenag Kab. Murung Raya.',
    ],
    openingParagraph:
      'Berdasarkan permohonan konsultasi administrasi/layanan umum yang diajukan melalui portal PTSP Kankemenag Kabupaten Murung Raya, telah dilaksanakan telaah dan pemberian penjelasan resmi kepada:',
    decisionTitle: 'Ringkasan Tindak Lanjut Konsultasi:',
    decisionClauses: (t) => [
      `Konsultasi atas nama ${t.applicantName} telah ditindaklanjuti oleh petugas teknis ${t.dispatchedUnitTitle || t.unitTitle}.`,
      t.adminNote
        ? `Rekomendasi tindak lanjut: ${t.adminNote}`
        : 'Pemohon dapat melanjutkan pengajuan layanan teknis sesuai persyaratan standar yang telah disampaikan.',
    ],
    closingParagraph:
      'Berita acara konsultasi ini disahkan secara elektronik sebagai arsip pelayanan publik Kankemenag Kabupaten Murung Raya.',
  },
  'sek-rohaniwan': {
    docHeading: 'SURAT TUGAS ROHANIAWAN / PEMBACA DOA / PENCERAMAH',
    docSubHeading: 'Penugasan Resmi Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.04',
    unitSectionName: 'Sub Bagian Tata Usaha / Sekretariat',
    perihalPrefix: 'Penugasan Rohaniawan / Pembaca Doa / Penceramah Agama',
    legalBasis: [
      'Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara;',
      'Permohonan penugasan rohaniwan/pembaca doa dari instansi/panitia penyelenggara kegiatan.',
    ],
    openingParagraph:
      'Menindaklanjuti surat permohonan resmi instansi/panitia penyelenggara acara yang telah ditelaah Sub Bagian Tata Usaha, Kepala Kantor Kementerian Agama Kabupaten Murung Raya menugaskan petugas rohaniwan/pembaca doa/penceramah agama untuk melayani permohonan dari:',
    decisionTitle: 'Ketentuan Pelaksanaan Tugas Rohaniwan:',
    decisionClauses: () => [
      'Petugas yang ditunjuk wajib hadir tepat waktu sesuai jadwal, tempat, dan tata acara yang dimohonkan instansi/panitia.',
      'Melaksanakan tugas pengukuhan sumpah/pembacaan doa/ceramah keagamaan secara khidmat, netral, dan menjunjung moderasi beragama.',
    ],
    closingParagraph:
      'Demikian surat tugas ini ditetapkan untuk dilaksanakan dengan penuh tanggung jawab.',
  },
  'sek-sewa-aula': {
    docHeading: 'SURAT IZIN PENGGUNAAN AULA KANKEMENAG',
    docSubHeading: 'Pengelolaan Barang Milik Negara (BMN) Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KS.01',
    unitSectionName: 'Sub Bagian Tata Usaha / Pengelola BMN',
    perihalPrefix: 'Persetujuan Peminjaman / Penggunaan Aula Kantor',
    legalBasis: [
      'Peraturan Pemerintah tentang Pengelolaan Barang Milik Negara dan Ketentuan PNBP Kementerian Agama;',
      'Hasil verifikasi jadwal ketersediaan Aula Kankemenag Kabupaten Murung Raya.',
    ],
    openingParagraph:
      'Menindaklanjuti permohonan penggunaan Aula Kankemenag Kabupaten Murung Raya, Kepala Kantor dengan ini menyetujui permohonan pemanfaatan fasilitas aula kepada:',
    decisionTitle: 'Kewajiban Pengguna Fasilitas Aula:',
    decisionClauses: () => [
      'Menjaga kebersihan, ketertiban, keamanan perangkat audio-visual, dan keutuhan inventaris BMN di lingkungan kantor.',
      'Menyelesaikan kewajiban administrasi sesuai ketentuan yang berlaku dan berkoordinasi dengan petugas Subbag Tata Usaha sebelum pelaksanaan acara.',
    ],
    closingParagraph:
      'Demikian surat izin penggunaan aula ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },

  // ---- B. BIMAS ISLAM ----
  'bi-legalisir': {
    docHeading: 'SURAT PENGESAHAN LEGALISIR DOKUMEN BIMAS ISLAM',
    docSubHeading: 'Seksi Bimbingan Masyarakat Islam Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.3/BA.00',
    unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
    perihalPrefix: 'Pengesahan Salinan Dokumen Nikah / Rujuk / Majelis Taklim',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 20 Tahun 2019 tentang Pencatatan Pernikahan;',
      'Hasil pencocokan dokumen asli dengan register arsip Seksi Bimas Islam Kankemenag Murung Raya.',
    ],
    openingParagraph:
      'Setelah dilakukan pemeriksaan keaslian berkas oleh Seksi Bimbingan Masyarakat Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya mengesahkan salinan dokumen atas nama:',
    decisionTitle: 'Pernyataan Keabsahan:',
    decisionClauses: () => [
      'Fotokopi / salinan dokumen Bimas Islam yang dilampirkan dinyatakan sesuai dengan register arsip atau buku nikah/piagam asli.',
      'Pengesahan bertanda tangan elektronik ini berlaku sah untuk keperluan administrasi di instansi pemerintah maupun swasta.',
    ],
    closingParagraph:
      'Demikian pengesahan legalisasi dokumen Bimas Islam ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'bi-sarpras-masjid': {
    docHeading: 'SURAT REKOMENDASI BANTUAN SARANA PRASARANA RUMAH IBADAH',
    docSubHeading: 'Rekomendasi Resmi Seksi Bimbingan Masyarakat Islam',
    klasifikasiKode: 'Kk.15.10.3/BA.01',
    unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
    perihalPrefix: 'Rekomendasi Kelayakan Bantuan Sarana & Prasarana Masjid/Mushalla',
    legalBasis: [
      'Keputusan Direktur Jenderal Bimbingan Masyarakat Islam tentang Standar Pembinaan Kemasjidan;',
      'Verifikasi ID SIMAS, rekomendasi KUA Kecamatan, proposal RAB, dan status tanah rumah ibadah.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan berkas administrasi, rekomendasi KUA Kecamatan, dan validasi profil rumah ibadah oleh Seksi Bimas Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya memberikan rekomendasi kelayakan bantuan sarana prasarana kepada:',
    decisionTitle: 'Pokok Rekomendasi Kemasjidan:',
    decisionClauses: (t) => [
      `Rumah ibadah / Takmir pemohon (${t.institution || t.applicantName}) tercatat aktif dan memenuhi syarat administrasi untuk diusulkan menerima bantuan pembangunan/rehabilitasi/sarana prasarana.`,
      'Penggunaan dana bantuan wajib dipertanggungjawabkan secara transparan dan akuntabel sesuai Rencana Anggaran Biaya (RAB).',
    ],
    closingParagraph:
      'Demikian surat rekomendasi bantuan rumah ibadah ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'bi-kiblat': {
    docHeading: 'SERTIFIKAT & BERITA ACARA PENGUKURAN ARAH KIBLAT',
    docSubHeading: 'Tim Hisab Rukyat Seksi Bimas Islam Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.3/BA.03.2',
    unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
    perihalPrefix: 'Penetapan & Sertifikat Pengukuran Arah Kiblat Resmi',
    legalBasis: [
      'Fatwa MUI Nomor 05 Tahun 2010 tentang Arah Kiblat;',
      'Hasil verifikasi koordinat geografis dan perhitungan azimut kiblat oleh Tim Hisab Rukyat Seksi Bimas Islam.',
    ],
    openingParagraph:
      'Berdasarkan permohonan pengukuran arah kiblat serta hasil verifikasi teknis Tim Hisab Rukyat Kankemenag Kabupaten Murung Raya, dengan ini diterbitkan pengesahan Sertifikat Arah Kiblat untuk:',
    decisionTitle: 'Keterangan Pengukuran Arah Kiblat:',
    decisionClauses: (t) => [
      `Lokasi rumah ibadah / pembangunan (${t.institution || t.applicantName}) telah terverifikasi secara geografis di wilayah Kabupaten Murung Raya.`,
      'Penetapan garis shaf dan arah bangunan masjid/mushalla mengacu pada hasil berita acara pengukuran resmi Tim Bimas Islam.',
    ],
    closingParagraph:
      'Demikian Sertifikat Pengukuran Arah Kiblat ini ditetapkan dan disahkan secara elektronik.',
  },
  'bi-majelis-taklim': {
    docHeading: 'SURAT KETERANGAN TERDAFTAR (SKT) & PIAGAM MAJELIS TAKLIM',
    docSubHeading: 'Penetapan Kelembagaan Pendidikan Keagamaan Islam',
    klasifikasiKode: 'Kk.15.10.3/BA.01.2',
    unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
    perihalPrefix: 'Penetapan Surat Keterangan Terdaftar (SKT) Majelis Taklim',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 29 Tahun 2019 tentang Majelis Taklim;',
      'Surat Keterangan Domisili, Susunan Pengurus, Daftar Jamaah, dan Rekomendasi KUA Kecamatan.',
    ],
    openingParagraph:
      'Menimbang kelengkapan berkas administrasi dan hasil verifikasi Seksi Bimbingan Masyarakat Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya menetapkan Surat Keterangan Terdaftar (SKT) Majelis Taklim kepada:',
    decisionTitle: 'Ketentuan Kelembagaan Majelis Taklim:',
    decisionClauses: () => [
      'Majelis Taklim tercatat secara resmi dalam pembinaan Kankemenag Kabupaten Murung Raya dan KUA Kecamatan setempat.',
      'SKT ini berlaku selama 5 (lima) tahun dan wajib menyelenggarakan pembinaan keagamaan yang berhaluan moderasi beragama serta Pancasila.',
    ],
    closingParagraph:
      'Demikian Surat Keterangan Terdaftar Majelis Taklim ini ditetapkan untuk dilaksanakan dengan penuh tanggung jawab.',
  },
  'bi-perpanjangan-majelis-taklim': {
    docHeading: 'SK & PIAGAM PERPANJANGAN SKT MAJELIS TAKLIM',
    docSubHeading: 'Perpanjangan Masa Berlaku Kelembagaan Majelis Taklim',
    klasifikasiKode: 'Kk.15.10.3/BA.01.2',
    unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
    perihalPrefix: 'Perpanjangan Surat Keterangan Terdaftar (SKT) Majelis Taklim',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 29 Tahun 2019 tentang Majelis Taklim;',
      'Hasil evaluasi laporan kegiatan pengajian, kepengurusan aktif, dan rekomendasi KUA Kecamatan.',
    ],
    openingParagraph:
      'Berdasarkan evaluasi berkas perpanjangan dan laporan aktivitas jamaah oleh Seksi Bimas Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya mengesahkan perpanjangan SKT Majelis Taklim kepada:',
    decisionTitle: 'Ketentuan Perpanjangan SKT:',
    decisionClauses: () => [
      'Masa berlaku Surat Keterangan Terdaftar (SKT) Majelis Taklim diperpanjang untuk periode 5 (lima) tahun berikutnya.',
      'Pengurus agar terus menyampaikan laporan kegiatan tahunan kepada Penyuluh Agama Islam / KUA Kecamatan.',
    ],
    closingParagraph:
      'Demikian keputusan perpanjangan SKT Majelis Taklim ini disahkan secara elektronik.',
  },
  'bi-tauliyah-wali-hakim': {
    docHeading: 'SURAT KEPUTUSAN TAULIYAH WALI HAKIM',
    docSubHeading: 'Pelimpahan Kewenangan Wali Hakim Pernikahan (Khusus KUA Kecamatan)',
    klasifikasiKode: 'Kk.15.10.3/PW.01',
    unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
    perihalPrefix: 'Penetapan Tauliyah Wali Hakim bagi Kepala KUA / Penghulu Kecamatan',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 20 Tahun 2019 tentang Pencatatan Pernikahan;',
      'Berita Acara Pemeriksaan (BAP) Wali Nikah dan berkas Model N1–N4 dari Kepala KUA Kecamatan.',
    ],
    openingParagraph:
      'Memperhatikan surat permohonan Kepala KUA Kecamatan serta Berita Acara Pemeriksaan (BAP) sebab berhaknya penggunaan Wali Hakim dalam akad nikah, Kepala Kantor Kementerian Agama Kabupaten Murung Raya memberikan Tauliyah Wali Hakim kepada:',
    decisionTitle: 'Diktum Penetapan Tauliyah Wali Hakim:',
    decisionClauses: (t) => [
      `Memberikan kuasa tauliyah sebagai Wali Hakim kepada Kepala KUA / Penghulu pemohon (${t.applicantName}${t.nip ? ` · NIP ${t.nip}` : ''}) untuk melangsungkan akad nikah dimaksud sesuai syariat Islam dan perundang-undangan.`,
      'Penetapan ini hanya berlaku khusus untuk peristiwa nikah yang tercatat dalam BAP permohonan KUA Kecamatan terkait dan wajib dicatat dalam register akta nikah SIMKAH.',
    ],
    closingParagraph:
      'Demikian Surat Keputusan Tauliyah Wali Hakim ini ditetapkan di Puruk Cahu untuk dilaksanakan sebagaimana mestinya.',
  },
  'bi-kitab-suci': {
    docHeading: 'BERITA ACARA PENYERAHAN BANTUAN KITAB SUCI AL-QUR’AN',
    docSubHeading: 'Seksi Bimbingan Masyarakat Islam Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.3/BA.00',
    unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
    perihalPrefix: 'Persetujuan & Berita Acara Penyerahan Bantuan Mushaf Al-Qur’an',
    legalBasis: [
      'Program Pembinaan Liturgi dan Fasilitasi Kitab Suci Kementerian Agama RI;',
      'Verifikasi daftar penerima manfaat oleh Seksi Bimbingan Masyarakat Islam.',
    ],
    openingParagraph:
      'Berdasarkan permohonan bantuan kitab suci yang telah diverifikasi ketersediaannya oleh Seksi Bimas Islam, disetujui penyerahan bantuan Mushaf Al-Qur’an kepada:',
    decisionTitle: 'Ketentuan Penyerahan Kitab Suci:',
    decisionClauses: () => [
      'Kitab suci yang diserahkan adalah milik hibah negara (gratis / dilarang diperjualbelikan) untuk dimanfaatkan jamaah/santri.',
      'Pengambilan fisik dilakukan pada loket PTSP dengan menunjukkan dokumen TTE ini beserta bukti identitas penerima.',
    ],
    closingParagraph:
      'Demikian berita acara persetujuan penyerahan kitab suci ini diterbitkan secara sah.',
  },
  'bi-buku-agama': {
    docHeading: 'BERITA ACARA PENYERAHAN BUKU KEAGAMAAN ISLAM',
    docSubHeading: 'Seksi Bimbingan Masyarakat Islam Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.3/BA.00',
    unitSectionName: 'Seksi Bimbingan Masyarakat Islam',
    perihalPrefix: 'Persetujuan Penyaluran Buku Keagamaan Islam',
    legalBasis: [
      'Program Penguatan Literasi Keagamaan Kankemenag Kabupaten Murung Raya.',
    ],
    openingParagraph:
      'Berdasarkan telaah Seksi Bimbingan Masyarakat Islam, permohonan bantuan buku keagamaan untuk perpustakaan masjid/majelis taklim disetujui kepada:',
    decisionTitle: 'Ketentuan Pemanfaatan Buku Keagamaan:',
    decisionClauses: () => [
      'Buku keagamaan dimanfaatkan secara terbuka sebagai bahan literasi umat di masjid, mushalla, atau majelis taklim.',
      'Dilarang memperjualbelikan bantuan buku keagamaan yang bersumber dari anggaran Kementerian Agama.',
    ],
    closingParagraph:
      'Demikian berita acara penyerahan buku keagamaan ini disahkan secara elektronik.',
  },

  // ---- C. PENDIDIKAN ISLAM (PENDIS) ----
  'pendis-penelitian': {
    docHeading: 'SURAT IZIN / REKOMENDASI PENELITIAN KEAGAMAAN',
    docSubHeading: 'Seksi Pendidikan Islam Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.2/PP.00',
    unitSectionName: 'Seksi Pendidikan Islam (Pendis)',
    perihalPrefix: 'Izin Penelitian pada Madrasah / Pondok Pesantren / Satuan Pendidikan Islam',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 90 Tahun 2013 tentang Penyelenggaraan Pendidikan Madrasah;',
      'Verifikasi surat pengantar Perguruan Tinggi dan proposal penelitian oleh Seksi Pendidikan Islam.',
    ],
    openingParagraph:
      'Menindaklanjuti surat pengantar dan proposal penelitian yang telah diverifikasi Seksi Pendidikan Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya memberikan izin/rekomendasi penelitian kepada:',
    decisionTitle: 'Ketentuan Pelaksanaan Penelitian:',
    decisionClauses: () => [
      'Peneliti berkoordinasi terlebih dahulu dengan Kepala Madrasah / Pimpinan Pondok Pesantren lokasi penelitian di Kabupaten Murung Raya.',
      'Kegiatan penelitian tidak mengganggu jadwal pembelajaran, menjunjung etika akademik, dan menyerahkan 1 (satu) eksemplar ringkasan hasil penelitian kepada Seksi Pendis.',
    ],
    closingParagraph:
      'Demikian surat izin penelitian ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'pendis-ijazah-kesalahan': {
    docHeading: 'SURAT KETERANGAN RALAT / PENGGANTI KESALAHAN PENULISAN IJAZAH',
    docSubHeading: 'Seksi Pendidikan Islam — Pengesahan Data Ijazah Madrasah',
    klasifikasiKode: 'Kk.15.10.2/PP.01.1',
    unitSectionName: 'Seksi Pendidikan Islam (Pendis)',
    perihalPrefix: 'Pengesahan Ralat Penulisan Data pada Ijazah Madrasah',
    legalBasis: [
      'Keputusan Dirjen Pendidikan Islam tentang Petunjuk Teknis Penulisan Blangko Ijazah Madrasah;',
      'Verifikasi Ijazah Asli, Akta Kelahiran, Kartu Keluarga, Buku Induk Siswa, dan Surat Keterangan Kepala Madrasah.',
    ],
    openingParagraph:
      'Setelah memeriksa kebenaran dokumen autentik (Buku Induk, Akta Kelahiran, KK, dan Ijazah asli) melalui Seksi Pendidikan Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya menerbitkan Surat Keterangan Kesalahan Penulisan Ijazah kepada:',
    decisionTitle: 'Keterangan Pengesahan Ralat Ijazah:',
    decisionClauses: () => [
      'Surat Keterangan ini merupakan lampiran resmi yang tidak terpisahkan dari Ijazah Madrasah asli pemilik.',
      'Data perbaikan nama/tempat tanggal lahir/identitas orang tua sebagaimana tercantum dalam telaah Seksi Pendis dinyatakan sah menurut catatan Buku Induk Madrasah.',
    ],
    closingParagraph:
      'Demikian surat keterangan ralat penulisan ijazah ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'pendis-ijop': {
    docHeading: 'PIAGAM & REKOMENDASI IZIN OPERASIONAL (IJOP) LEMBAGA',
    docSubHeading: 'Penyelenggaraan Lembaga Pendidikan Agama & Keagamaan Islam',
    klasifikasiKode: 'Kk.15.10.2/PP.00.7',
    unitSectionName: 'Seksi Pendidikan Islam (Pendis)',
    perihalPrefix: 'Penetapan / Rekomendasi Izin Operasional Pendirian Lembaga Pendidikan Islam',
    legalBasis: [
      'Peraturan Pemerintah Nomor 55 Tahun 2007 tentang Pendidikan Agama dan Pendidikan Keagamaan;',
      'Peraturan Menteri Agama RI Nomor 90 Tahun 2013 serta PMA Nomor 13 Tahun 2014 / PMA Nomor 30 Tahun 2020;',
      'Hasil verifikasi faktual sarana prasarana, tenaga pendidik, santri/siswa, dan legalitas yayasan oleh Seksi Pendis.',
    ],
    openingParagraph:
      'Berdasarkan kelengkapan dokumen yayasan/pengelola dan hasil verifikasi kelayakan oleh Seksi Pendidikan Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya menyetujui penerbitan/rekomendasi Izin Operasional (IJOP) kepada:',
    decisionTitle: 'Diktum Izin Operasional Lembaga:',
    decisionClauses: (t) => [
      `Menyetujui penyelenggaraan operasional pendidikan keagamaan oleh lembaga ${t.institution || t.applicantName} sesuai jenjang dan kurikulum Kementerian Agama RI.`,
      'Lembaga wajib memperbarui data EMIS secara berkala per semester dan mematuhi standar mutu pendidik serta nilai moderasi beragama.',
    ],
    closingParagraph:
      'Demikian keputusan/rekomendasi Izin Operasional ini ditetapkan untuk dilaksanakan dengan penuh tanggung jawab.',
  },
  'pendis-mutasi': {
    docHeading: 'SURAT REKOMENDASI & PENGESAHAN MUTASI SISWA MADRASAH',
    docSubHeading: 'Seksi Pendidikan Islam Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.2/PP.00.4',
    unitSectionName: 'Seksi Pendidikan Islam (Pendis)',
    perihalPrefix: 'Pengesahan Perpindahan / Mutasi Peserta Didik Madrasah',
    legalBasis: [
      'Pedoman Pengelolaan Peserta Didik dan Aplikasi EMIS Direktorat KSKK Madrasah Kemenag RI;',
      'Surat Keterangan Pindah dari Madrasah Asal, Surat Kesediaan Menerima Madrasah Tujuan, dan Rapor/EMIS.',
    ],
    openingParagraph:
      'Menindaklanjuti surat pindah dan surat penerimaan peserta didik dari madrasah terkait serta verifikasi status EMIS pada Seksi Pendidikan Islam, dengan ini disahkan mutasi siswa atas nama:',
    decisionTitle: 'Ketentuan Administrasi Mutasi:',
    decisionClauses: () => [
      'Operator EMIS madrasah asal dan madrasah tujuan agar segera memproses sinkronisasi mutasi peserta didik pada portal EMIS.',
      'Surat rekomendasi ini sah digunakan sebagai dasar penerimaan administrasi pindah sekolah/madrasah.',
    ],
    closingParagraph:
      'Demikian surat rekomendasi mutasi siswa madrasah ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'pendis-bantuan': {
    docHeading: 'SURAT REKOMENDASI KELAYAKAN BANTUAN LEMBAGA PENDIS',
    docSubHeading: 'Seksi Pendidikan Islam Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.2/PP.00',
    unitSectionName: 'Seksi Pendidikan Islam (Pendis)',
    perihalPrefix: 'Rekomendasi Penerima Bantuan Lembaga Madrasah / Pontren / TPQ / MDT',
    legalBasis: [
      'Petunjuk Teknis Bantuan Sarana Prasarana / Operasional Direktorat Jenderal Pendidikan Islam;',
      'Verifikasi SK IJOP/NSPP aktif, NPWP, Rekening Lembaga, dan Proposal Bantuan.',
    ],
    openingParagraph:
      'Berdasarkan verifikasi legalitas lembaga (IJOP/NSPP) dan kesesuaian proposal bantuan pada Seksi Pendidikan Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya merekomendasikan kelayakan bantuan kepada:',
    decisionTitle: 'Keterangan Rekomendasi Bantuan:',
    decisionClauses: (t) => [
      `Lembaga ${t.institution || t.applicantName} berstatus aktif menyelenggarakan pendidikan keagamaan Islam di Kabupaten Murung Raya.`,
      'Rekomendasi ini diberikan untuk proses pengusulan bantuan yang pelaksanaannya wajib mematuhi juknis dan akuntabilitas pelaporan.',
    ],
    closingParagraph:
      'Demikian surat rekomendasi bantuan lembaga pendidikan Islam ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'pendis-perpanjangan-ijop-pki': {
    docHeading: 'SK & PIAGAM PERPANJANGAN IJOP PENDIDIKAN KEAGAMAAN ISLAM',
    docSubHeading: 'Seksi Pendidikan Islam — Pontren / MDT / LPQ (TPQ-TPA) / PKPPS',
    klasifikasiKode: 'Kk.15.10.2/PP.00.8',
    unitSectionName: 'Seksi Pendidikan Islam (Pendis)',
    perihalPrefix: 'Perpanjangan Tanda Daftar / Izin Operasional Pendidikan Keagamaan Islam',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 13 Tahun 2014 dan PMA Nomor 30 Tahun 2020;',
      'Verifikasi Piagam/SK IJOP sebelumnya, daftar santri dan ustadz di EMIS, serta keterangan aktif lembaga.',
    ],
    openingParagraph:
      'Berdasarkan hasil verifikasi administrasi dan keaktifan pembelajaran pada EMIS oleh Seksi Pendidikan Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya mengesahkan perpanjangan Tanda Daftar / IJOP Pendidikan Keagamaan Islam kepada:',
    decisionTitle: 'Diktum Perpanjangan Tanda Daftar / IJOP:',
    decisionClauses: (t) => [
      `Memperpanjang masa berlaku Tanda Daftar / Izin Operasional lembaga ${t.institution || t.applicantName} untuk periode 5 (lima) tahun ke depan.`,
      'Lembaga wajib melakukan pemutakhiran data santri dan tenaga pendidik pada aplikasi EMIS setiap semester.',
    ],
    closingParagraph:
      'Demikian keputusan perpanjangan izin operasional ini disahkan secara elektronik.',
  },
  'pendis-perpanjangan-ijop-madrasah': {
    docHeading: 'SURAT REKOMENDASI PERPANJANGAN IJOP MADRASAH',
    docSubHeading: 'Seksi Pendidikan Islam — Jenjang RA / MI / MTs / MA',
    klasifikasiKode: 'Kk.15.10.2/PP.00.4',
    unitSectionName: 'Seksi Pendidikan Islam (Pendis)',
    perihalPrefix: 'Rekomendasi Perpanjangan Izin Operasional (IJOP) & NSM Madrasah',
    legalBasis: [
      'Keputusan Menteri Agama RI dan Peraturan Dirjen Pendis tentang Perizinan Pendirian/Perpanjangan Madrasah;',
      'Verifikasi Akta Yayasan Kemenkumham, Piagam NSM/IJOP lama, dan validitas data EMIS Madrasah.',
    ],
    openingParagraph:
      'Setelah menelaah kelengkapan legalitas yayasan penyelenggara dan keaktifan data EMIS melalui Seksi Pendidikan Islam, Kepala Kantor Kementerian Agama Kabupaten Murung Raya memberikan rekomendasi perpanjangan Izin Operasional Madrasah kepada:',
    decisionTitle: 'Keterangan Perpanjangan IJOP Madrasah:',
    decisionClauses: (t) => [
      `Madrasah yang dikelola oleh ${t.institution || t.applicantName} memenuhi persyaratan administratif dan standar penyelenggaraan pendidikan untuk diperpanjang izin operasionalnya.`,
      'Pengelolaan madrasah agar terus berpedoman pada Standar Nasional Pendidikan dan kebijakan Kurikulum Kementerian Agama RI.',
    ],
    closingParagraph:
      'Demikian surat rekomendasi perpanjangan IJOP madrasah ini diterbitkan untuk diproses sesuai kewenangan.',
  },
  'pendis-akun-emis-siaga': {
    docHeading: 'SURAT KETERANGAN AKTIVASI AKUN EMIS / SIAGA PAI',
    docSubHeading: 'Seksi Pendidikan Islam — Pengelolaan Pendataan Digital',
    klasifikasiKode: 'Kk.15.10.2/PP.00.1',
    unitSectionName: 'Seksi Pendidikan Islam (Pendis)',
    perihalPrefix: 'Pengesahan Permohonan Pembuatan / Aktivasi Akun EMIS / SIAGA PAI',
    legalBasis: [
      'Pedoman Pengelolaan Data EMIS dan Aplikasi SIAGA Guru PAI Direktorat Jenderal Pendidikan Islam;',
      'Verifikasi Surat Tugas Operator / SK Pembagian Tugas Mengajar Guru PAI dan identitas pemohon.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan SK pengangkatan/surat tugas operator maupun jadwal mengajar GPAI oleh Admin Seksi Pendidikan Islam, dengan ini disetujui aktivasi akses pendataan EMIS / SIAGA PAI kepada:',
    decisionTitle: 'Ketentuan Pengelolaan Akun EMIS / SIAGA:',
    decisionClauses: () => [
      'Kredensial akses wajib dijaga kerahasiaannya oleh pemilik akun / operator resmi madrasah atau sekolah.',
      'Pemohon agar segera melakukan pembaruan profil PTK, jadwal mengajar, dan sinkronisasi data semester berjalan.',
    ],
    closingParagraph:
      'Demikian surat keterangan aktivasi akun ini diterbitkan dan disahkan secara elektronik.',
  },

  // ---- D. BIMAS HINDU ----
  'bh-legalisir': {
    docHeading: 'SURAT PENGESAHAN LEGALISIR DOKUMEN BIMAS HINDU',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Hindu Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.4/BA.03',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Hindu',
    perihalPrefix: 'Pengesahan Salinan Dokumen Resmi Bimas Hindu',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 19 Tahun 2019 tentang Organisasi dan Tata Kerja Instansi Vertikal Kementerian Agama;',
      'Pencocokan dokumen asli dengan salinan pada Penyelenggara Bimas Hindu.',
    ],
    openingParagraph:
      'Berdasarkan verifikasi Penyelenggara Bimbingan Masyarakat Hindu, Kepala Kantor Kementerian Agama Kabupaten Murung Raya mengesahkan salinan dokumen atas nama:',
    decisionTitle: 'Pernyataan Legalisasi:',
    decisionClauses: () => [
      'Salinan dokumen dinyatakan sah dan sesuai dengan dokumen asli yang tercatat di Penyelenggara Bimas Hindu.',
    ],
    closingParagraph:
      'Demikian pengesahan legalisasi ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'bh-bantuan-rumah-ibadah': {
    docHeading: 'SURAT REKOMENDASI BANTUAN RUMAH IBADAH HINDU',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Hindu Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.4/BA.03.1',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Hindu',
    perihalPrefix: 'Rekomendasi Bantuan Pembangunan / Rehabilitasi Pura / Balai Basarah',
    legalBasis: [
      'Petunjuk Teknis Bantuan Rumah Ibadah Direktorat Jenderal Bimbingan Masyarakat Hindu;',
      'Verifikasi Tanda Daftar Rumah Ibadah, proposal RAB, bukti kepemilikan lahan, dan rekening pengurus.',
    ],
    openingParagraph:
      'Menindaklanjuti hasil verifikasi berkas oleh Penyelenggara Bimas Hindu, Kepala Kantor Kementerian Agama Kabupaten Murung Raya memberikan rekomendasi kelayakan bantuan pembangunan/rehabilitasi rumah ibadah kepada:',
    decisionTitle: 'Pokok Rekomendasi:',
    decisionClauses: (t) => [
      `Rumah ibadah (${t.institution || t.applicantName}) telah terdaftar aktif dan layak diusulkan menerima bantuan sarana prasarana.`,
      'Pertanggungjawaban pemanfaatan bantuan wajib disusun sesuai ketentuan RAB dan peraturan perundang-undangan.',
    ],
    closingParagraph:
      'Demikian surat rekomendasi ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'bh-tanda-daftar-pasraman': {
    docHeading: 'SURAT REKOMENDASI & TANDA DAFTAR PASRAMAN HINDU',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Hindu Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.4/PP.00',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Hindu',
    perihalPrefix: 'Penetapan / Rekomendasi Tanda Daftar Pendidikan Keagamaan Pasraman',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 10 Tahun 2020 tentang Pendidikan Keagamaan Hindu (Pasraman);',
      'Verifikasi data pendidik, jumlah siswa pasraman, domisili, dan kepengurusan.',
    ],
    openingParagraph:
      'Berdasarkan kelengkapan persyaratan administrasi dan verifikasi Penyelenggara Bimas Hindu, Kepala Kantor Kementerian Agama Kabupaten Murung Raya menerbitkan Rekomendasi Tanda Daftar Pasraman kepada:',
    decisionTitle: 'Ketentuan Penyelenggaraan Pasraman:',
    decisionClauses: (t) => [
      `Pasraman ${t.institution || t.applicantName} resmi tercatat dalam pembinaan Penyelenggara Bimas Hindu Kankemenag Kab. Murung Raya.`,
      'Pengelola wajib menyelenggarakan pembelajaran keagamaan Hindu secara aktif dan melaporkan perkembangan peserta didik setiap tahun.',
    ],
    closingParagraph:
      'Demikian rekomendasi tanda daftar pasraman ini disahkan secara elektronik.',
  },
  'bh-perpanjangan-tanda-daftar-pasraman': {
    docHeading: 'REKOMENDASI PERPANJANGAN TANDA DAFTAR PASRAMAN',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Hindu Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.4/PP.00',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Hindu',
    perihalPrefix: 'Perpanjangan Tanda Daftar Lembaga Pasraman Hindu',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 10 Tahun 2020 tentang Pendidikan Keagamaan Hindu;',
      'Evaluasi laporan keaktifan dan pembaruan daftar pendidik serta siswa oleh Penyelenggara Bimas Hindu.',
    ],
    openingParagraph:
      'Menindaklanjuti permohonan perpanjangan dan telaah Penyelenggara Bimas Hindu, Kepala Kantor mengesahkan perpanjangan Tanda Daftar Pasraman kepada:',
    decisionTitle: 'Ketentuan Perpanjangan:',
    decisionClauses: () => [
      'Tanda Daftar Pasraman dinyatakan tetap aktif dan diperpanjang sesuai masa berlaku ketentuan Ditjen Bimas Hindu.',
    ],
    closingParagraph:
      'Demikian rekomendasi perpanjangan ini ditetapkan untuk dilaksanakan dengan penuh tanggung jawab.',
  },
  'bh-kitab-suci': {
    docHeading: 'BERITA ACARA PENYERAHAN KITAB SUCI WEDA / PANATURAN',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Hindu Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.4/BA.03',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Hindu',
    perihalPrefix: 'Persetujuan Penyerahan Bantuan Kitab Suci Hindu / Kaharingan',
    legalBasis: [
      'Program Fasilitasi Kitab Suci Keagamaan Ditjen Bimas Hindu Kementerian Agama RI.',
    ],
    openingParagraph:
      'Berdasarkan hasil verifikasi permohonan pengurus rumah ibadah/pasraman oleh Penyelenggara Bimas Hindu, disetujui penyerahan bantuan kitab suci kepada:',
    decisionTitle: 'Ketentuan Penerimaan Kitab Suci:',
    decisionClauses: () => [
      'Bantuan kitab suci bersifat hibah pembinaan umat (gratis) dan tidak diperkenankan untuk diperjualbelikan.',
    ],
    closingParagraph:
      'Demikian berita acara penyerahan bantuan kitab suci ini disahkan secara elektronik.',
  },
  'bh-buku-agama': {
    docHeading: 'BERITA ACARA PENYERAHAN BUKU KEAGAMAAN HINDU',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Hindu Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.4/BA.03',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Hindu',
    perihalPrefix: 'Persetujuan Penyerahan Buku Keagamaan Hindu / Kaharingan',
    legalBasis: [
      'Program Peningkatan Literasi Keagamaan Ditjen Bimas Hindu Kementerian Agama RI.',
    ],
    openingParagraph:
      'Berdasarkan telaah Penyelenggara Bimas Hindu, permohonan buku keagamaan untuk umat/pasraman disetujui kepada:',
    decisionTitle: 'Ketentuan Pemanfaatan:',
    decisionClauses: () => [
      'Buku keagamaan digunakan untuk kepentingan pembinaan umat, pasraman, dan perpustakaan Balai Basarah / Pura.',
    ],
    closingParagraph:
      'Demikian berita acara ini diterbitkan dan disahkan secara elektronik.',
  },
  'bh-aktivasi-simpatika': {
    docHeading: 'SURAT KETERANGAN AKTIVASI PTK SIMPATIKA BIMAS HINDU',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Hindu Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.4/PP.00',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Hindu',
    perihalPrefix: 'Pengesahan Aktivasi Akun PTK Guru Pendidikan Agama Hindu (SIMPATIKA)',
    legalBasis: [
      'Petunjuk Teknis Pengelolaan SIMPATIKA Guru Pendidikan Agama Hindu Kemenag RI;',
      'Verifikasi SK Pengangkatan/Pembagian Tugas Mengajar dan ijazah guru oleh Penyelenggara Bimas Hindu.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan berkas kepegawaian pendidik dan surat pengantar Kepala Sekolah/Pasraman oleh Penyelenggara Bimas Hindu, disetujui aktivasi akun SIMPATIKA Guru Pendidikan Agama Hindu atas nama:',
    decisionTitle: 'Ketentuan Keaktifan SIMPATIKA:',
    decisionClauses: () => [
      'Guru agar melengkapi riwayat jadwal mengajar dan sinkronisasi semester aktif pada portal SIMPATIKA Kemenag RI.',
    ],
    closingParagraph:
      'Demikian surat keterangan aktivasi SIMPATIKA ini disahkan secara elektronik.',
  },

  // ---- E. BIMAS KRISTEN ----
  'bk-daftar-gereja': {
    docHeading: 'SURAT TANDA LAPOR / PENDAFTARAN GEREJA',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/BA.02',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Pengesahan Tanda Lapor / Pendaftaran Gereja',
    legalBasis: [
      'Keputusan Dirjen Bimbingan Masyarakat Kristen tentang Pendaftaran Organisasi Gereja dan Lembaga Keagamaan;',
      'Verifikasi surat Sinode Induk, domisili jemaat, susunan majelis, daftar jemaat, dan lokasi gereja.',
    ],
    openingParagraph:
      'Berdasarkan penelitian kelengkapan berkas oleh Penyelenggara Bimbingan Masyarakat Kristen, Kepala Kantor Kementerian Agama Kabupaten Murung Raya menetapkan Surat Tanda Lapor / Pendaftaran Gereja kepada:',
    decisionTitle: 'Keterangan Pendaftaran Gereja:',
    decisionClauses: (t) => [
      `Jemaat / Gereja (${t.institution || t.applicantName}) telah terdaftar secara resmi dalam pembinaan Penyelenggara Bimas Kristen Kankemenag Kabupaten Murung Raya.`,
      'Majelis jemaat agar melaporkan pembaruan data jemaat dan kepengurusan secara berkala serta terus merawat kerukunan umat beragama.',
    ],
    closingParagraph:
      'Demikian Surat Tanda Lapor Pendaftaran Gereja ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'bk-daftar-yayasan': {
    docHeading: 'SURAT TANDA DAFTAR YAYASAN AGAMA & KEAGAMAAN KRISTEN',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/BA.02',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Pendaftaran Yayasan Keagamaan Kristen',
    legalBasis: [
      'Peraturan Menteri Agama RI tentang Pembinaan Lembaga Keagamaan Kristen;',
      'Verifikasi Akta Notaris Yayasan, SK Kemenkumham RI, NPWP, AD/ART, dan domisili kantor.',
    ],
    openingParagraph:
      'Menindaklanjuti hasil pemeriksaan legalitas akta yayasan dan pengesahan Kemenkumham RI oleh Penyelenggara Bimas Kristen, Kepala Kantor menerbitkan Surat Tanda Daftar Yayasan kepada:',
    decisionTitle: 'Ketentuan Kelembagaan Yayasan:',
    decisionClauses: () => [
      'Yayasan keagamaan Kristen tercatat resmi dalam pembinaan Kankemenag Kabupaten Murung Raya.',
      'Melaksanakan kegiatan pelayanan sosial-keagamaan sesuai AD/ART dan peraturan perundang-undangan yang berlaku.',
    ],
    closingParagraph:
      'Demikian Surat Tanda Daftar Yayasan ini ditetapkan dan disahkan secara elektronik.',
  },
  'bk-td-lembaga-agama': {
    docHeading: 'PIAGAM TANDA DAFTAR LEMBAGA KEAGAMAAN KRISTEN',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/BA.02',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Penerbitan Tanda Daftar Lembaga Agama & Keagamaan Kristen',
    legalBasis: [
      'Ketentuan Pendaftaran Lembaga Keagamaan Direktorat Jenderal Bimbingan Masyarakat Kristen Kemenag RI.',
    ],
    openingParagraph:
      'Berdasarkan verifikasi AD/ART, struktur pengurus, program kerja, dan domisili oleh Penyelenggara Bimas Kristen, disahkan Tanda Daftar Lembaga Keagamaan Kristen kepada:',
    decisionTitle: 'Ketentuan Pembinaan Lembaga:',
    decisionClauses: () => [
      'Lembaga tercatat dalam register Penyelenggara Bimas Kristen Kankemenag Kabupaten Murung Raya dan wajib menyampaikan laporan tahunan.',
    ],
    closingParagraph:
      'Demikian Piagam Tanda Daftar Lembaga Keagamaan Kristen ini diterbitkan secara elektronik.',
  },
  'bk-bantuan-sarpras': {
    docHeading: 'SURAT REKOMENDASI BANTUAN SARANA PRASARANA GEREJA',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/BA.02.1',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Rekomendasi Bantuan Pembangunan / Sarpras Rumah Ibadah Kristen',
    legalBasis: [
      'Petunjuk Teknis Bantuan Sarana Prasarana Gereja Ditjen Bimas Kristen Kemenag RI;',
      'Verifikasi Tanda Daftar Gereja aktif, proposal RAB, foto kondisi, dan rekening jemaat/panitia.',
    ],
    openingParagraph:
      'Berdasarkan verifikasi berkas oleh Penyelenggara Bimas Kristen, Kepala Kantor Kementerian Agama Kabupaten Murung Raya memberikan rekomendasi kelayakan bantuan sarana prasarana kepada:',
    decisionTitle: 'Pokok Rekomendasi:',
    decisionClauses: (t) => [
      `Rumah ibadah / Majelis Jemaat (${t.institution || t.applicantName}) memenuhi syarat administrasi untuk diusulkan menerima bantuan sarana dan prasarana.`,
      'Penggunaan bantuan dipertanggungjawabkan secara akuntabel sesuai RAB yang diajukan.',
    ],
    closingParagraph:
      'Demikian surat rekomendasi bantuan sarana prasarana gereja ini diterbitkan secara sah.',
  },
  'bk-perpanjangan-yayasan': {
    docHeading: 'REKOMENDASI PERPANJANGAN TANDA DAFTAR YAYASAN KRISTEN',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/BA.02',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Perpanjangan Pendaftaran Yayasan Agama & Keagamaan Kristen',
    legalBasis: [
      'Ketentuan Pendaftaran Lembaga Keagamaan Ditjen Bimas Kristen serta evaluasi laporan tahunan yayasan.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan salinan Tanda Daftar lama dan laporan kegiatan yayasan oleh Penyelenggara Bimas Kristen, dengan ini diterbitkan rekomendasi perpanjangan pendaftaran yayasan kepada:',
    decisionTitle: 'Keterangan Perpanjangan:',
    decisionClauses: () => [
      'Status pendaftaran yayasan keagamaan Kristen diperpanjang dan tetap aktif dalam pembinaan Kankemenag Kabupaten Murung Raya.',
    ],
    closingParagraph:
      'Demikian rekomendasi perpanjangan pendaftaran yayasan ini disahkan secara elektronik.',
  },
  'bk-perpanjangan-gereja': {
    docHeading: 'REKOMENDASI PERPANJANGAN PENDAFTARAN GEREJA',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/BA.02',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Perpanjangan Surat Tanda Lapor / Pendaftaran Gereja',
    legalBasis: [
      'Ketentuan Pendaftaran Gereja Ditjen Bimas Kristen Kemenag RI.',
    ],
    openingParagraph:
      'Setelah memverifikasi surat permohonan Sinode/Majelis Jemaat dan pembaruan data jemaat oleh Penyelenggara Bimas Kristen, dengan ini disahkan perpanjangan pendaftaran gereja kepada:',
    decisionTitle: 'Keterangan Perpanjangan:',
    decisionClauses: () => [
      'Surat Tanda Lapor / Pendaftaran Gereja diperpanjang dan berlaku sah sebagai dokumen registrasi kelembagaan gereja.',
    ],
    closingParagraph:
      'Demikian rekomendasi perpanjangan pendaftaran gereja ini disahkan secara elektronik.',
  },
  'bk-kitab-suci': {
    docHeading: 'BERITA ACARA PENYERAHAN BANTUAN ALKITAB',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/BA.02',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Persetujuan Penyerahan Bantuan Kitab Suci Alkitab',
    legalBasis: [
      'Program Pengadaan & Penyaluran Kitab Suci Ditjen Bimas Kristen Kemenag RI.',
    ],
    openingParagraph:
      'Berdasarkan telaah Penyelenggara Bimas Kristen, disetujui penyerahan bantuan Kitab Suci Alkitab kepada:',
    decisionTitle: 'Ketentuan Penyerahan:',
    decisionClauses: () => [
      'Kitab Suci Alkitab diserahkan secara gratis untuk pelayanan jemaat/sekolah dan dilarang diperjualbelikan.',
    ],
    closingParagraph:
      'Demikian berita acara penyerahan bantuan Alkitab ini disahkan secara elektronik.',
  },
  'bk-aktivasi-simpatika': {
    docHeading: 'SURAT KETERANGAN AKTIVASI SIMPATIKA GURU PAK',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/PP.00',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Pengesahan Aktivasi Akun PTK Guru Pendidikan Agama Kristen (SIMPATIKA)',
    legalBasis: [
      'Petunjuk Teknis Pengelolaan Data PTK SIMPATIKA Ditjen Bimas Kristen Kemenag RI.',
    ],
    openingParagraph:
      'Berdasarkan verifikasi surat pengantar Kepala Sekolah dan SK Pembagian Tugas Mengajar oleh Penyelenggara Bimas Kristen, disetujui aktivasi akun SIMPATIKA atas nama:',
    decisionTitle: 'Ketentuan Pengelolaan Akun:',
    decisionClauses: () => [
      'Guru agar melakukan aktivasi dan pemutakhiran data keaktifan semester berjalan pada layanan SIMPATIKA.',
    ],
    closingParagraph:
      'Demikian surat keterangan aktivasi SIMPATIKA ini disahkan secara elektronik.',
  },
  'bk-aktivasi-pakat': {
    docHeading: 'SURAT KETERANGAN AKTIVASI SISTEM INFORMASI PAKAT',
    docSubHeading: 'Penyelenggara Bimbingan Masyarakat Kristen Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.5/PP.00',
    unitSectionName: 'Penyelenggara Bimbingan Masyarakat Kristen',
    perihalPrefix: 'Pengesahan Aktivasi Akun Guru PAK pada Sistem Informasi PAKAT',
    legalBasis: [
      'Pedoman Pengelolaan Sistem Informasi Pendidikan Agama Kristen Terintegrasi (PAKAT) Ditjen Bimas Kristen.',
    ],
    openingParagraph:
      'Setelah memverifikasi SK Pembagian Tugas Mengajar PAK, NPK/NUPTK, dan email aktif guru pemohon oleh Penyelenggara Bimas Kristen, dengan ini disetujui aktivasi akun PAKAT kepada:',
    decisionTitle: 'Ketentuan Akses PAKAT:',
    decisionClauses: () => [
      'Pemohon dapat mengakses portal PAKAT menggunakan akun terverifikasi untuk pelaporan jam mengajar dan tunjangan profesi guru.',
    ],
    closingParagraph:
      'Demikian surat keterangan aktivasi akun PAKAT ini disahkan secara elektronik.',
  },

  // ---- F. KEPEGAWAIAN ----
  'kep-kenaikan-pangkat': {
    docHeading: 'SURAT PENGANTAR & PENGESAHAN USULAN KENAIKAN PANGKAT ASN',
    docSubHeading: 'Urusan Kepegawaian / Sub Bagian Tata Usaha Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.04.1',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pengesahan Kelengkapan Berkas Usulan Kenaikan Pangkat PNS/PPPK',
    legalBasis: [
      'Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara;',
      'Peraturan BKN Nomor 4 Tahun 2023 tentang Periodisasi Kenaikan Pangkat PNS;',
      'Hasil verifikasi SK Pangkat terakhir, SKP 2 tahun terakhir, dan berkas pendukung oleh Analis SDM Aparatur.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan kelengkapan berkas usulan kenaikan pangkat oleh Urusan Kepegawaian Kankemenag Kabupaten Murung Raya, Kepala Kantor menerbitkan pengesahan pengusulan kepada Kanwil Kemenag Prov. Kalimantan Tengah / BKN atas nama pegawai:',
    decisionTitle: 'Keterangan Verifikasi Usulan Kenaikan Pangkat:',
    decisionClauses: () => [
      'Seluruh berkas persyaratan kenaikan pangkat dinyatakan lengkap dan memenuhi syarat kinerja minimal bernilai Baik pada 2 (dua) tahun terakhir.',
      'Usulan diteruskan ke aplikasi SIASN BKN / SIMPEG Kemenag sesuai periode kenaikan pangkat yang berlaku.',
    ],
    closingParagraph:
      'Demikian surat pengesahan pengusulan kenaikan pangkat ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'kep-kgb': {
    docHeading: 'SURAT PEMBERITAHUAN KENAIKAN GAJI BERKALA (KGB)',
    docSubHeading: 'Kantor Kementerian Agama Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.04.2',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pemberitahuan Kenaikan Gaji Berkala (KGB) Pegawai ASN',
    legalBasis: [
      'Peraturan Pemerintah Nomor 5 Tahun 2024 tentang Perubahan Gaji Pokok Pegawai Negeri Sipil (atau Peraturan Gaji PPPK);',
      'Hasil verifikasi SK Pangkat terakhir, SK KGB sebelumnya, dan Penilaian Kinerja (SKP) tahun terakhir.',
    ],
    openingParagraph:
      'Dengan ini diberitahukan bahwa berhubung telah dipenuhinya masa kerja golongan dan syarat penilaian kinerja yang ditentukan, kepada pegawai yang namanya tercantum di bawah ini diberikan Kenaikan Gaji Berkala (KGB):',
    decisionTitle: 'Ketentuan Pelaksanaan Pembayaran KGB:',
    decisionClauses: () => [
      'Kenaikan Gaji Berkala ini berlaku terhitung mulai tanggal 1 bulan berikutnya setelah jatuh tempo masa kerja golongan berdasarkan data SK terakhir.',
      'Dokumen TTE ini disampaikan kepada Pejabat Pembuat Daftar Gaji / KPPN terkait sebagai dasar penyesuaian pembayaran gaji pokok.',
    ],
    closingParagraph:
      'Demikian Surat Pemberitahuan Kenaikan Gaji Berkala ini ditetapkan untuk dilaksanakan sebagaimana mestinya.',
  },
  'kep-cuti-pegawai': {
    docHeading: 'SURAT IZIN CUTI PEGAWAI APARATUR SIPIL NEGARA',
    docSubHeading: 'Pejabat Yang Berwenang Memberikan Cuti — Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.05.3',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pemberian Izin Cuti Pegawai ASN',
    legalBasis: [
      'Peraturan Badan Kepegawaian Negara Nomor 24 Tahun 2017 tentang Tata Cara Pemberian Cuti PNS / Ketentuan Cuti PPPK;',
      'Persetujuan Atasan Langsung dan hasil verifikasi hak cuti oleh Urusan Kepegawaian.',
    ],
    openingParagraph:
      'Memperhatikan formulir permohonan cuti yang telah disetujui atasan langsung dan hasil verifikasi administrasi kepegawaian, Kepala Kantor Kementerian Agama Kabupaten Murung Raya memberikan Izin Cuti kepada:',
    decisionTitle: 'Ketentuan Pelaksanaan Cuti:',
    decisionClauses: () => [
      'Pelaksanaan cuti sesuai jenis dan durasi hari kerja yang disetujui dalam permohonan serta catatan kepegawaian.',
      'Sebelum menjalankan cuti wajib menyerahkan pekerjaan kepada atasan langsung atau pegawai pengganti, dan melaporkan diri kembali kepada atasan setelah selesai cuti.',
    ],
    closingParagraph:
      'Demikian Surat Izin Cuti Pegawai ini ditetapkan untuk dilaksanakan sebagaimana mestinya.',
  },
  'kep-pensiun-pegawai': {
    docHeading: 'SURAT PENGANTAR & TANDA TERIMA USULAN PENSIUN ASN',
    docSubHeading: 'Urusan Kepegawaian / Sub Bagian Tata Usaha Kankemenag Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.06.1',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pengesahan Berkas Usulan Pensiun Pegawai ke Kanwil / BKN / PT Taspen',
    legalBasis: [
      'Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara dan PP Nomor 11 Tahun 2017 jo. PP Nomor 17 Tahun 2020;',
      'Hasil verifikasi kelengkapan berkas pensiun dan Surat Keterangan Tidak Pernah Dijatuhi Hukuman Disiplin.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan berkas kepegawaian dan data keluarga oleh Urusan Kepegawaian, Kepala Kantor Kementerian Agama Kabupaten Murung Raya mengesahkan berkas usulan penetapan pensiun pegawai atas nama:',
    decisionTitle: 'Keterangan Pengusulan Pensiun:',
    decisionClauses: () => [
      'Seluruh dokumen persyaratan (SK CPNS, SK PNS, SK Pangkat terakhir, Daftar Susunan Keluarga, dan SKP terakhir) dinyatakan lengkap.',
      'Berkas usulan diteruskan ke Kanwil Kemenag Prov. Kalimantan Tengah dan BKN/PT Taspen untuk penerbitan SK Pensiun resmi.',
    ],
    closingParagraph:
      'Demikian pengesahan berkas usulan pensiun ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'kep-mutasi-pegawai': {
    docHeading: 'SURAT REKOMENDASI & PENGANTAR MUTASI PEGAWAI ASN',
    docSubHeading: 'Kantor Kementerian Agama Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.07.1',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Persetujuan / Rekomendasi Mutasi Wilayah Kerja Pegawai',
    legalBasis: [
      'Peraturan BKN Nomor 5 Tahun 2019 tentang Tata Cara Pelaksanaan Mutasi;',
      'Verifikasi surat lolos butuh, Analisis Jabatan/ABK, dan SKP 2 tahun terakhir.',
    ],
    openingParagraph:
      'Menindaklanjuti permohonan mutasi pegawai serta hasil telaah kebutuhan formasi (Anjab/ABK) oleh Urusan Kepegawaian, Kepala Kantor Kementerian Agama Kabupaten Murung Raya memberikan rekomendasi/pengantar mutasi atas nama:',
    decisionTitle: 'Ketentuan Rekomendasi Mutasi:',
    decisionClauses: () => [
      'Usulan mutasi diteruskan sesuai kewenangan kepada Kepala Kanwil Kemenag Prov. Kalimantan Tengah / Pejabat Pembina Kepegawaian.',
      'Pegawai tetap melaksanakan tugas pada satuan kerja asal hingga Surat Keputusan (SK) Mutasi definitif diterbitkan.',
    ],
    closingParagraph:
      'Demikian surat rekomendasi mutasi pegawai ini ditetapkan untuk diproses sesuai ketentuan peraturan perundang-undangan.',
  },
  'kep-karpeg-karis-karsu': {
    docHeading: 'SURAT PENGANTAR USULAN KARPEG / KARIS / KARSU',
    docSubHeading: 'Urusan Kepegawaian Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.01',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pengesahan Usulan Penerbitan Karpeg / Karis / Karsu ke Kanwil / BKN',
    legalBasis: [
      'Keputusan Kepala BKN tentang Tata Cara Permintaan dan Penetapan Kartu Pegawai, Kartu Istri, dan Kartu Suami.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan berkas SK CPNS, SK PNS, STTPL Latsar, serta dokumen perkawinan sah oleh Urusan Kepegawaian, dengan ini diterbitkan pengesahan usulan Karpeg/Karis/Karsu atas nama:',
    decisionTitle: 'Keterangan Pengusulan:',
    decisionClauses: () => [
      'Berkas permohonan penerbitan/penggantian kartu dinyatakan lengkap dan memenuhi syarat untuk diusulkan kepada Kantor Regional BKN melalui Kanwil Kemenag.',
    ],
    closingParagraph:
      'Demikian surat pengantar usulan Karpeg/Karis/Karsu ini disahkan secara elektronik.',
  },
  'kep-satyalancana': {
    docHeading: 'SURAT PENGANTAR USULAN TANDA KEHORMATAN SATYALANCANA',
    docSubHeading: 'Urusan Kepegawaian Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.08.4',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pengusulan Tanda Kehormatan Satyalancana Karya Satya (10/20/30 Tahun)',
    legalBasis: [
      'Peraturan Pemerintah Nomor 35 Tahun 2010 tentang Pelaksanaan UU Nomor 20 Tahun 2009 tentang Gelar, Tanda Jasa, dan Tanda Kehormatan.',
    ],
    openingParagraph:
      'Setelah dilakukan verifikasi masa kerja pengabdian dan integritas disiplin oleh Urusan Kepegawaian, Kepala Kantor mengusulkan penganugerahan Tanda Kehormatan Satyalancana Karya Satya atas nama:',
    decisionTitle: 'Keterangan Kelayakan Usulan:',
    decisionClauses: () => [
      'Pegawai yang diusulkan telah memenuhi masa kerja pengabdian tanpa terputus serta tidak pernah dijatuhi hukuman disiplin tingkat sedang atau berat.',
      'Usulan disampaikan secara berjenjang ke Kanwil Kemenag Prov. Kalimantan Tengah dan Biro SDM Kementerian Agama RI.',
    ],
    closingParagraph:
      'Demikian surat pengesahan usulan Satyalancana Karya Satya ini diterbitkan untuk diproses sebagaimana mestinya.',
  },
  'kep-izin-tugas-belajar': {
    docHeading: 'SURAT REKOMENDASI / IZIN BELAJAR & TUGAS BELAJAR ASN',
    docSubHeading: 'Kantor Kementerian Agama Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.02.2',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Persetujuan Izin Belajar / Rekomendasi Tugas Belajar Pegawai ASN',
    legalBasis: [
      'Surat Edaran Menteri PANRB Nomor 28 Tahun 2021 tentang Pengembangan Kompetensi bagi PNS Melalui Jalur Pendidikan;',
      'Verifikasi akreditasi program studi, rekomendasi pimpinan satker, dan penilaian kinerja (SKP) oleh Urusan Kepegawaian.',
    ],
    openingParagraph:
      'Memperhatikan surat permohonan pegawai, keterangan diterima di Perguruan Tinggi terakreditasi, serta telaah Urusan Kepegawaian, Kepala Kantor memberikan persetujuan Izin Belajar / Rekomendasi Tugas Belajar kepada:',
    decisionTitle: 'Ketentuan Pelaksanaan Studi:',
    decisionClauses: () => [
      'Untuk Izin Belajar: perkuliahan dilaksanakan di luar jam kerja dinas dan tidak mengganggu pelaksanaan tugas pokok serta fungsi sebagai ASN.',
      'Tidak menuntut penyesuaian pangkat/ijazah secara otomatis sebelum memenuhi persyaratan formasi jabatan dan regulasi kepegawaian yang berlaku.',
    ],
    closingParagraph:
      'Demikian surat persetujuan/rekomendasi belajar ini ditetapkan untuk dilaksanakan dengan penuh tanggung jawab.',
  },
  'kep-penyesuaian-ijazah-gelar': {
    docHeading: 'SURAT PENGESAHAN USULAN PENYESUAIAN IJAZAH / GELAR',
    docSubHeading: 'Urusan Kepegawaian Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.04.1',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pengusulan Pencantuman Gelar Akademik / Ujian Penyesuaian Ijazah',
    legalBasis: [
      'Surat Edaran BKN tentang Pencantuman Gelar Akademik Pegawai ASN;',
      'Verifikasi SK Izin Belajar, legalisir Ijazah/Transkrip, dan keabsahan data lulusan pada PDDikti.',
    ],
    openingParagraph:
      'Berdasarkan pemeriksaan keabsahan Ijazah, Transkrip Nilai, cetakan PDDikti, dan SK Izin Belajar oleh Urusan Kepegawaian, dengan ini diterbitkan pengesahan pengusulan pencantuman gelar/penyesuaian ijazah atas nama:',
    decisionTitle: 'Keterangan Pengusulan:',
    decisionClauses: () => [
      'Berkas akademik dinyatakan terverifikasi pada PDDikti dan memenuhi syarat untuk diusulkan pencantuman gelar ke Kanwil Kemenag / BKN.',
    ],
    closingParagraph:
      'Demikian surat pengesahan ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'kep-surat-tugas-keterangan': {
    docHeading: 'SURAT TUGAS / SURAT KETERANGAN KEPEGAWAIAN',
    docSubHeading: 'Kantor Kementerian Agama Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.00',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Penerbitan Surat Tugas / Surat Keterangan Kedinasan Pegawai',
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 19 Tahun 2019 dan data kepegawaian aktif Kankemenag Kab. Murung Raya.',
    ],
    openingParagraph:
      'Berdasarkan nota dinas permohonan dan verifikasi data kepegawaian aktif oleh Sub Bagian Tata Usaha, Kepala Kantor Kementerian Agama Kabupaten Murung Raya menerbitkan Surat Tugas / Surat Keterangan Kepegawaian untuk:',
    decisionTitle: 'Pernyataan & Penugasan Kedinasan:',
    decisionClauses: (t) => [
      `Pegawai bersangkutan (${t.applicantName}${t.nip ? ` · NIP ${t.nip}` : ''}) adalah pegawai aktif di lingkungan Kankemenag Kabupaten Murung Raya.`,
      t.adminNote
        ? `Keterangan khusus: ${t.adminNote}`
        : 'Surat keterangan/tugas ini sah digunakan sesuai maksud pengajuan kedinasan yang tercatat.',
    ],
    closingParagraph:
      'Demikian surat tugas / surat keterangan kepegawaian ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
  'kep-legalisasi-dokumen': {
    docHeading: 'SURAT PENGESAHAN LEGALISASI DOKUMEN KEPEGAWAIAN',
    docSubHeading: 'Urusan Kepegawaian Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.00',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pengesahan Salinan / Legalisir SK & Dokumen Kepegawaian',
    legalBasis: [
      'Hasil pencocokan dokumen SK kepegawaian asli dengan salinan fotokopi oleh Urusan Kepegawaian.',
    ],
    openingParagraph:
      'Berdasarkan hasil pemeriksaan keaslian berkas kepegawaian (SK CPNS/PNS/Pangkat/Jabatan/KGB), dengan ini disahkan salinan dokumen kepegawaian atas nama:',
    decisionTitle: 'Pernyataan Legalisasi Kepegawaian:',
    decisionClauses: () => [
      'Salinan dokumen kepegawaian telah dicocokkan dan dinyatakan sesuai dengan dokumen asli pada arsip kepegawaian Kankemenag Kabupaten Murung Raya.',
    ],
    closingParagraph:
      'Demikian pengesahan legalisasi dokumen kepegawaian ini diterbitkan secara elektronik.',
  },
  'kep-perubahan-data': {
    docHeading: 'SURAT KETERANGAN PEMBARUAN DATA KEPEGAWAIAN',
    docSubHeading: 'Urusan Kepegawaian Kankemenag Kabupaten Murung Raya',
    klasifikasiKode: 'Kk.15.10.1/KP.01',
    unitSectionName: 'Urusan Kepegawaian / Subbag Tata Usaha',
    perihalPrefix: 'Pengesahan Perubahan Data Keluarga / KP4 / Jabatan Fungsional',
    legalBasis: [
      'Verifikasi dokumen bukti autentik (Akta Nikah/Akta Lahir/KP4/SK Jabatan Fungsional) pada aplikasi SIMPEG & SIASN.',
    ],
    openingParagraph:
      'Berdasarkan verifikasi bukti autentik perubahan data pegawai dan keluarga oleh Urusan Kepegawaian, Kepala Kantor mengesahkan pembaruan data kepegawaian atas nama:',
    decisionTitle: 'Keterangan Pembaruan Data:',
    decisionClauses: () => [
      'Perubahan data telah divalidasi untuk dimutakhirkan pada basis data SIMPEG Kementerian Agama, SIASN BKN, serta daftar tunjangan keluarga (KP4).',
    ],
    closingParagraph:
      'Demikian surat keterangan pembaruan data kepegawaian ini diterbitkan untuk dipergunakan sebagaimana mestinya.',
  },
};

function resolveTicketRequirementsWithFlags(ticket: CloudPtspTicketRecord): {
  label: string;
  checked: boolean;
}[] {
  const unit = SERVICE_UNITS.find((u) => u.id === ticket.unitId);
  const sub =
    unit?.subServices.find((s) => s.id === ticket.subServiceId) ||
    unit?.subServices.find((s) => s.title.toLowerCase() === ticket.serviceTitle.toLowerCase());
  const reqs =
    sub && sub.requirements.length > 0
      ? sub.requirements
      : [
          'Surat Permohonan / Formulir Resmi Layanan',
          'Identitas Pemohon (KTP / NIP / Kartu Pegawai)',
          'Dokumen Pendukung Kelengkapan Usulan',
        ];
  return reqs.map((label, idx) => ({
    label,
    checked: ticket.checkedDocsPattern?.[idx] === '1',
  }));
}

function generateVerificationHash(ticket: CloudPtspTicketRecord, docNumber: string): string {
  const seed = `${ticket.id}|${ticket.ticketNo}|${docNumber}|${ticket.subServiceId}|KEMENAGMURA`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const yr = getYearFromTicket(ticket);
  return `TTE-MURA-${yr}-${hex}`;
}

export function buildOfficialTteDocument(
  ticket: CloudPtspTicketRecord
): OfficialTteDocumentModel {
  const spec = SERVICE_DOC_SPECS[ticket.subServiceId];
  const fallback = getDefaultKlasifikasiByUnit(ticket.unitId);
  const docNumber = generateSuggestedTteDocNumber(ticket);
  const isEndorsed = ticket.status === 'TTE Sah (Selesai)' || ticket.status === 'Selesai';
  const unitSectionName =
    spec?.unitSectionName || ticket.dispatchedUnitTitle || fallback.unitSectionName;

  const detailRows: { label: string; value: string }[] = [
    { label: 'Nama Pemohon / Pengusul', value: ticket.applicantName },
  ];
  if (ticket.nip) {
    detailRows.push({ label: 'NIP / Identitas ASN', value: ticket.nip });
  }
  detailRows.push({
    label: 'Instansi / Lembaga / Satker',
    value: ticket.institution || ticket.userEmail,
  });
  detailRows.push({
    label: 'Nomor Kontak / WhatsApp',
    value: ticket.phone,
  });
  detailRows.push({
    label: 'Jenis Layanan PTSP',
    value: ticket.serviceTitle,
  });
  detailRows.push({
    label: 'Nomor Registrasi Tiket',
    value: `${ticket.ticketNo} (Masuk: ${ticket.submittedAtLabel})`,
  });
  if (ticket.notes) {
    detailRows.push({
      label: 'Keterangan Permohonan',
      value: ticket.notes,
    });
  }
  if (ticket.seksiReviewer) {
    detailRows.push({
      label: 'Pemeriksa Teknis Seksi',
      value: `${ticket.seksiReviewer} (${unitSectionName})`,
    });
  }

  const signerName = ticket.tteSignerName || 'H. Maslan, S.Ag., M.Pd.';
  const signerTitle =
    ticket.tteSignerTitle ||
    `Kepala ${OFFICE_INFO.officialName}`;
  const signerNip = ticket.tteSignerNip || '197005121998031004';
  const signedAtLabel =
    ticket.tteSignedAtLabel ||
    new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  if (spec) {
    return {
      docNumber,
      docHeading: spec.docHeading,
      docSubHeading: spec.docSubHeading,
      perihal: spec.perihalPrefix,
      unitSectionName,
      legalBasis: spec.legalBasis,
      openingParagraph: spec.openingParagraph,
      detailRows,
      decisionTitle: spec.decisionTitle,
      decisionClauses: spec.decisionClauses(ticket),
      closingParagraph: spec.closingParagraph,
      verifiedRequirements: resolveTicketRequirementsWithFlags(ticket),
      signerName,
      signerTitle,
      signerNip,
      signedAtLabel,
      verificationCode: generateVerificationHash(ticket, docNumber),
      isEndorsed,
    };
  }

  // Fallback general consultation/service template (covers sek-konsultasi, bi-konsultasi, pendis-konsultasi, bh-konsultasi, bk-konsultasi, etc.)
  const isConsultation = ticket.subServiceId.includes('konsultasi');
  return {
    docNumber,
    docHeading: isConsultation
      ? `BERITA ACARA & RESUME KONSULTASI ${ticket.unitTitle}`
      : `SURAT KETERANGAN / PENGESAHAN LAYANAN ${ticket.unitTitle}`,
    docSubHeading: `Diterbitkan Melalui PTSP — ${unitSectionName}`,
    perihal: ticket.serviceTitle,
    unitSectionName,
    legalBasis: [
      'Peraturan Menteri Agama RI Nomor 19 Tahun 2019 tentang Organisasi dan Tata Kerja Instansi Vertikal Kementerian Agama;',
      `Hasil verifikasi berkas Pelayanan Terpadu Satu Pintu (PTSP) dan telaah ${unitSectionName}.`,
    ],
    openingParagraph: isConsultation
      ? `Menindaklanjuti permohonan konsultasi layanan pada ${unitSectionName}, telah dilakukan verifikasi dan pemberian arahan/tindak lanjut resmi kepada pemohon:`
      : `Berdasarkan hasil pemeriksaan kelengkapan persyaratan melalui loket PTSP dan telaah teknis ${unitSectionName}, Kepala Kantor Kementerian Agama Kabupaten Murung Raya dengan ini menerbitkan pengesahan layanan kepada:`,
    detailRows,
    decisionTitle: isConsultation
      ? 'Hasil Konsultasi & Arahan Petugas:'
      : 'Ketentuan Pengesahan Layanan:',
    decisionClauses: [
      `Layanan "${ticket.serviceTitle}" atas nama ${ticket.applicantName} telah memenuhi persyaratan administrasi dan selesai diverifikasi oleh ${unitSectionName}.`,
      ticket.adminNote ||
        ticket.tteLeaderNote ||
        'Dokumen pengesahan ini dapat digunakan pemohon sebagai bukti resmi penyelesaian layanan dari Kankemenag Kabupaten Murung Raya.',
    ],
    closingParagraph:
      'Demikian dokumen resmi ini diterbitkan dan ditandatangani secara elektronik untuk dipergunakan sebagaimana mestinya.',
    verifiedRequirements: resolveTicketRequirementsWithFlags(ticket),
    signerName,
    signerTitle,
    signerNip,
    signedAtLabel,
    verificationCode: generateVerificationHash(ticket, docNumber),
    isEndorsed,
  };
}
