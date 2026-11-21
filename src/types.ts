export type PageView =
  | 'beranda'
  | 'profil'
  | 'layanan'
  | 'informasi'
  | 'berita'
  | 'galeri'
  | 'ppid'
  | 'zona-integritas'
  | 'e-pengaduan'
  | 'kontak';

export interface ServiceTemplate {
  id: string;
  title: string;
  description: string;
  fileName: string;
  previewText: string;
  contentHtml: string;
}

export interface SubService {
  id: string;
  title: string;
  sla: string;
  fee: string;
  requirements: string[];
  output: string;
  restrictedScope?: 'pegawai' | 'kua';
  templates?: ServiceTemplate[];
}

export interface ServiceUnit {
  id: string;
  code: string;
  title: string;
  shortDesc: string;
  officer: string;
  subServices: SubService[];
}

export interface LeadershipQuote {
  id: string;
  name: string;
  role: string;
  paragraphs: string[];
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  section: 'hari-ini' | 'kegiatan' | 'nasional' | 'terpopuler';
  date: string;
  readTime: string;
  views: number;
  image: string;
  excerpt: string;
  content: string[];
  reactions: {
    bermanfaat: number;
    informatif: number;
    inspiratif: number;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  category: string;
  location: string;
  image: string;
}

export type InfografisCategory = 'utama' | 'islam' | 'kristen' | 'katolik' | 'hindu';

export interface InfografisContent {
  id: InfografisCategory;
  label: string;
  title: string;
  subtitle: string;
  quote?: string;
  quoteSource?: string;
  body: string[];
  highlights: { label: string; value: string }[];
}

export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  date: string;
  category: string;
  description: string;
  thumbnail: string;
  youtubeUrl: string;
}

export interface ExternalApp {
  id: string;
  name: string;
  description: string;
  url: string;
  domain: string;
}

export interface PPIDDocument {
  id: string;
  code: string;
  title: string;
  category: 'Berkala' | 'Serta Merta' | 'Setiap Saat';
  year: string;
  format: string;
  summary: string;
}

export interface KUABranch {
  id: string;
  kecamatan: string;
  address: string;
  head: string;
  hours: string;
}

export interface PTSPTicket {
  ticketNo: string;
  unitTitle: string;
  serviceTitle: string;
  applicantName: string;
  phone: string;
  submittedAt: string;
  status: 'Diproses Verifikasi' | 'Menunggu Berkas' | 'Selesai';
}

export interface ComplaintSubmission {
  ticketNo: string;
  category: string;
  subject: string;
  reporter: string;
  submittedAt: string;
  status: 'Diterima Inspektorat Internal';
}
