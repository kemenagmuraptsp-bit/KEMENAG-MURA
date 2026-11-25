import {
  Compass,
  FileCheck2,
  FolderArchive,
  GitBranch,
  Globe,
  Lightbulb,
} from 'lucide-react';

export type QuickSignpostAction =
  | 'katalog-ptsp'
  | 'dokumen-penting'
  | 'sop-ptsp'
  | 'diagram-alur-ptsp'
  | 'panduan-ptsp'
  | 'aplikasi-eksternal'
  | 'inovasi-mura';

interface SignpostPlankItem {
  id: QuickSignpostAction;
  number: string;
  labelId: string;
  labelEn: string;
  icon: typeof Compass;
}

const SIGNPOST_ITEMS: SignpostPlankItem[] = [
  {
    id: 'dokumen-penting',
    number: '2',
    labelId: 'Dokumen Penting',
    labelEn: 'Important Documents',
    icon: FolderArchive,
  },
  {
    id: 'sop-ptsp',
    number: '3',
    labelId: 'SOP Layanan PTSP',
    labelEn: 'PTSP Service SOPs',
    icon: FileCheck2,
  },
  {
    id: 'diagram-alur-ptsp',
    number: '4',
    labelId: 'Diagram Alur Data PTSP',
    labelEn: 'PTSP Data Flow Diagram',
    icon: GitBranch,
  },
  {
    id: 'panduan-ptsp',
    number: '5',
    labelId: 'Panduan Layanan PTSP',
    labelEn: 'PTSP Service Guide',
    icon: Compass,
  },
  {
    id: 'aplikasi-eksternal',
    number: '6',
    labelId: 'Aplikasi Eksternal Kemenag',
    labelEn: 'External Kemenag Apps',
    icon: Globe,
  },
  {
    id: 'inovasi-mura',
    number: '7',
    labelId: 'Inovasi Kemenag Mura',
    labelEn: 'Kemenag Mura Innovations',
    icon: Lightbulb,
  },
];

interface WayfindingSignpostProps {
  lang: 'id' | 'en';
  onSelect: (action: QuickSignpostAction) => void;
}

export function WayfindingSignpost({ lang, onSelect }: WayfindingSignpostProps) {
  return (
    <nav
      aria-label={
        lang === 'en' ? 'Quick Access Floating Menu' : 'Tombol Akses Cepat Layanan PTSP'
      }
      className="w-full flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 select-none"
    >
      {SIGNPOST_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const label = lang === 'en' ? item.labelEn : item.labelId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-label={`${item.number}. ${label}`}
            title={label}
            style={{ animationDelay: `${idx * 120}ms` }}
            className="group relative inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl signpost-tosca-plank border border-teal-200/45 text-white shadow-[0_10px_22px_-6px_rgba(13,148,136,0.48),0_4px_10px_-2px_rgba(2,6,23,0.18)] hover:-translate-y-1 hover:shadow-[0_16px_28px_-6px_rgba(13,148,136,0.58),0_6px_12px_-2px_rgba(2,6,23,0.24)] active:translate-y-0 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
          >
            <span className="w-7 h-7 rounded-lg bg-white/18 border border-white/25 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
            </span>
            <span className="text-xs sm:text-[13px] font-bold tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] whitespace-nowrap">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
