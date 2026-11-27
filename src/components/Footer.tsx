import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import { OFFICE_INFO } from '@/src/data/kemenagData';
import { PageView } from '@/src/types';
import { KemenagEmblem } from '@/src/components/KemenagEmblem';

interface FooterProps {
  onNavigate: (view: PageView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-emerald-950 text-emerald-50 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-emerald-900/80">
          {/* Institutional Brand & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <KemenagEmblem className="w-11 h-11 shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-300 font-medium">
                  Kementerian Agama Republik Indonesia
                </p>
                <h2 className="text-lg font-bold text-white leading-snug">
                  Kabupaten Murung Raya
                </h2>
              </div>
            </div>

            <p className="text-sm text-emerald-100/80 leading-relaxed max-w-md">
              Pelayanan publik keagamaan dan pendidikan madrasah yang prima, transparan, dan
              akuntabel untuk seluruh masyarakat di sepuluh kecamatan Kabupaten Murung Raya,
              Kalimantan Tengah.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-200/90">
              {OFFICE_INFO.serviceValues.map((val, idx) => (
                <span key={val.word} className="inline-flex items-center gap-1">
                  <strong className="text-amber-300 font-semibold">{val.letter}</strong>
                  <span>{val.word.slice(1)}</span>
                  {idx < OFFICE_INFO.serviceValues.length - 1 && (
                    <span aria-hidden="true" className="ml-3 text-emerald-700">·</span>
                  )}
                </span>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('kontak')}
                className="px-4 py-2.5 sm:py-2 min-h-[40px] text-xs font-semibold text-emerald-950 bg-white hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
              >
                Hubungi Kami
              </button>
              <button
                type="button"
                onClick={() => onNavigate('profil')}
                className="px-4 py-2.5 sm:py-2 min-h-[40px] text-xs font-semibold text-emerald-100 border border-emerald-700 hover:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap"
              >
                Profil Kantor
              </button>
            </div>
          </div>

          {/* Tautan Cepat */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">
              Tautan Cepat
            </h3>
            <ul className="space-y-1.5 text-sm text-emerald-100/85">
              {[
                { id: 'beranda' as PageView, label: 'Beranda' },
                { id: 'profil' as PageView, label: 'Profil & Visi Misi' },
                { id: 'layanan' as PageView, label: 'Katalog Layanan PTSP' },
                { id: 'berita' as PageView, label: 'Berita & Media Center' },
                { id: 'galeri' as PageView, label: 'Galeri Dokumentasi' },
                { id: 'ppid' as PageView, label: 'PPID & Informasi Publik' },
                { id: 'zona-integritas' as PageView, label: 'Zona Integritas (WBK)' },
                {
                  id: 'e-pengaduan' as PageView,
                  label: 'E-Pengaduan Masyarakat',
                  sectionId: 'formulir-pengaduan',
                  markerClass:
                    'px-2.5 py-1.5 rounded-lg border-2 border-emerald-400/75 bg-emerald-900/65 text-emerald-50 hover:bg-emerald-800/80 font-semibold',
                },
                {
                  id: 'e-pengaduan' as PageView,
                  label: 'SPAN LAPOR (Integrasi Pusat)',
                  sectionId: 'span-lapor',
                  markerClass:
                    'px-2.5 py-1.5 rounded-lg border-2 border-rose-400/80 bg-rose-950/65 text-rose-100 hover:bg-rose-900/75 font-semibold',
                },
                {
                  id: 'e-pengaduan' as PageView,
                  label: 'Survei Kepuasan Masyarakat (SKM)',
                  sectionId: 'survei-skm',
                  markerClass:
                    'px-2.5 py-1.5 rounded-lg border-2 border-sky-400/80 bg-sky-950/65 text-sky-100 hover:bg-sky-900/75 font-semibold',
                },
              ].map((link) => (
                <li
                  key={`${link.id}-${link.label}`}
                  className={
                    'markerClass' in link && link.markerClass
                      ? 'pt-1'
                      : 'py-1 border-b border-emerald-900/50 last:border-b-0'
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(link.id);
                      if ('sectionId' in link && link.sectionId) {
                        const targetSection = link.sectionId;
                        window.setTimeout(() => {
                          window.dispatchEvent(
                            new CustomEvent('kemenag:section-focus', { detail: targetSection })
                          );
                          document
                            .getElementById(targetSection)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 120);
                      }
                    }}
                    className={`menu-expand-btn-left w-full text-left transition-colors ${
                      'markerClass' in link && link.markerClass
                        ? link.markerClass
                        : 'hover:text-white hover:underline underline-offset-4'
                    }`}
                  >
                    <span className="menu-expand-label">{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak & Wilayah */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">
              Kontak & Lokasi Layanan
            </h3>
            <div className="space-y-3 text-sm text-emerald-100/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{OFFICE_INFO.address}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="min-w-0 break-all sm:break-normal">{OFFICE_INFO.email} · {OFFICE_INFO.ptspEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono-tabular">{OFFICE_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono-tabular">WhatsApp PTSP: {OFFICE_INFO.whatsapp}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p>{OFFICE_INFO.hoursWeekday}</p>
                  <p>{OFFICE_INFO.hoursFriday}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Footer Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-emerald-300/80">
          <p>
            © 2026 Kantor Kementerian Agama Kabupaten Murung Raya. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('ppid')}
              className="hover:text-white transition-colors"
            >
              Keterbukaan Informasi
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                onNavigate('zona-integritas');
                window.setTimeout(() => {
                  document
                    .getElementById('maklumat-pelayanan')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="hover:text-white transition-colors"
            >
              Maklumat Pelayanan
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
