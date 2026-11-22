import {
  ArrowLeft,
  Compass,
  FileCheck2,
  FolderArchive,
  GitBranch,
  Globe,
  LayoutGrid,
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
  icon: typeof LayoutGrid;
}

const SIGNPOST_ITEMS: SignpostPlankItem[] = [
  {
    id: 'katalog-ptsp',
    number: '1',
    labelId: 'Katalog Layanan PTSP',
    labelEn: 'PTSP Service Catalog',
    icon: LayoutGrid,
  },
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
        lang === 'en' ? 'Quick Access Signpost' : 'Tiang Penanda Akses Cepat Layanan PTSP'
      }
      className="relative w-auto lg:h-full select-none flex items-stretch justify-end pointer-events-none"
    >
      {/* Left Side of Pole: Compact Icon Planks That Reveal Service Label on Hover/Focus */}
      <div className="flex flex-col items-end gap-2 pt-2.5 pb-20 lg:pb-16 relative z-20 pointer-events-auto">
        {SIGNPOST_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const label = lang === 'en' ? item.labelEn : item.labelId;
          return (
            <div key={item.id} className="relative flex items-center justify-end">
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-label={`${item.number}. ${label}`}
                title={`${item.number}. ${label}`}
                style={{ animationDelay: `${idx * 150}ms` }}
                className="group relative flex items-center justify-center w-11 sm:w-12 min-h-[42px] lg:min-h-[36px] signpost-tosca-plank animate-signpost-icon-pulse rounded-l-md hover:rounded-l-none focus-visible:rounded-l-none border border-r-0 border-teal-200/35 text-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 hover:z-30 focus-visible:z-30"
              >
                {/* Hover/Focus Expanded Service Label Plank Gliding Out to the Left */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-full top-[-1px] bottom-[-1px] flex items-center gap-2 pl-3 pr-2.5 rounded-l-md signpost-tosca-plank border border-r-0 border-teal-200/35 whitespace-nowrap opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-teal-50 shrink-0" strokeWidth={2.6} />
                  <span className="text-[11px] font-bold tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]">
                    <span className="font-mono-tabular text-teal-100 mr-1">{item.number}.</span>
                    <span>{label}</span>
                  </span>
                </span>

                {/* Resting Icon Tile */}
                <span className="w-6 h-6 rounded bg-white/15 border border-white/25 flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
                  <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
                </span>
              </button>

              {/* Mounting Bracket Bridging Plank to Far-Right Pole */}
              <div
                className="w-1.5 h-3.5 bg-teal-950 border-y border-teal-500/45 shrink-0"
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>

      {/* Far-Right Edge Supporting Pole Extending All the Way Down to Bottom of Hero */}
      <div
        className="relative z-10 w-4 sm:w-5 shrink-0 flex flex-col items-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-full h-2.5 rounded-tl-full bg-teal-900 border-l border-t border-teal-300/45 shadow-sm" />
        <div className="w-full flex-1 min-h-[120px] signpost-post-pillar border-l border-teal-300/35" />

        {/* Grass Cluster Planted at Very Bottom-Right Corner Around Base of Pole */}
        <div className="absolute bottom-0 right-0 z-20 pointer-events-none">
          <svg
            viewBox="0 0 110 46"
            className="w-24 sm:w-28 h-10 sm:h-11 drop-shadow-[0_2px_6px_rgba(2,6,23,0.7)]"
          >
            <ellipse cx="86" cy="43" rx="56" ry="5" fill="#064e3b" opacity="0.95" />
            <ellipse cx="92" cy="42" rx="40" ry="4" fill="#065f46" opacity="0.98" />
            <path d="M40 44 Q33 26 24 18 Q36 27 45 44 Z" fill="#047857" />
            <path d="M52 44 Q47 21 43 11 Q53 23 58 44 Z" fill="#065f46" />
            <path d="M65 44 Q62 17 60 6 Q69 20 72 44 Z" fill="#047857" />
            <path d="M78 44 Q77 14 78 3 Q84 19 85 44 Z" fill="#065f46" />
            <path d="M90 44 Q92 15 96 5 Q96 22 97 44 Z" fill="#047857" />
            <path d="M100 44 Q104 20 109 12 Q107 27 107 44 Z" fill="#065f46" />

            <path d="M46 44 Q41 28 34 21 Q44 29 51 44 Z" fill="#10b981" />
            <path d="M58 44 Q55 23 52 13 Q61 25 64 44 Z" fill="#059669" />
            <path d="M71 44 Q70 19 69 7 Q76 21 77 44 Z" fill="#10b981" />
            <path d="M83 44 Q84 18 87 7 Q89 23 90 44 Z" fill="#34d399" />
            <path d="M94 44 Q97 21 102 12 Q101 27 101 44 Z" fill="#10b981" />
            <path d="M103 44 Q106 27 110 20 Q109 32 109 44 Z" fill="#059669" />
          </svg>
        </div>
      </div>
    </nav>
  );
}
