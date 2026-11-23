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

        {/* Realistic Layered Grass Cluster Continuously Swaying Around Base of Pole */}
        <div className="absolute bottom-0 right-0 z-20 pointer-events-none overflow-visible">
          <svg
            viewBox="0 0 150 74"
            className="w-32 sm:w-40 h-16 sm:h-20 overflow-visible drop-shadow-[0_3px_8px_rgba(2,6,23,0.75)]"
          >
            <defs>
              <radialGradient id="soilShadowGrad" cx="68%" cy="85%" r="65%">
                <stop offset="0%" stopColor="#091a10" stopOpacity="0.98" />
                <stop offset="60%" stopColor="#14331d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#052e16" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="grassBackGrad" x1="0" y1="1" x2="0.2" y2="0">
                <stop offset="0%" stopColor="#062c1b" />
                <stop offset="45%" stopColor="#14532d" />
                <stop offset="100%" stopColor="#3f6212" />
              </linearGradient>
              <linearGradient id="grassMidGrad" x1="0" y1="1" x2="0.15" y2="0">
                <stop offset="0%" stopColor="#0c3b21" />
                <stop offset="40%" stopColor="#15803d" />
                <stop offset="82%" stopColor="#4d7c0f" />
                <stop offset="100%" stopColor="#84cc16" />
              </linearGradient>
              <linearGradient id="grassSunGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#14532d" />
                <stop offset="48%" stopColor="#22c55e" />
                <stop offset="85%" stopColor="#84cc16" />
                <stop offset="100%" stopColor="#bef264" />
              </linearGradient>
              <linearGradient id="grassHighlightGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#166534" />
                <stop offset="55%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#d9f99d" />
              </linearGradient>
              <linearGradient id="seedPlumeGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#65a30d" />
                <stop offset="65%" stopColor="#bef264" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>

            {/* Natural earth & moss bed anchoring the pole into the ground */}
            <ellipse cx="112" cy="71" rx="68" ry="8" fill="url(#soilShadowGrad)" />
            <path
              d="M36 74 Q64 64 96 66 Q128 62 152 68 L152 74 Z"
              fill="#0b2416"
              opacity="0.96"
            />
            <path
              d="M54 74 Q82 67 112 68 Q134 65 152 70 L152 74 Z"
              fill="#1a3b20"
              opacity="0.95"
            />

            {/* Back Layer: Deep shaded tall meadow blades */}
            <g className="grass-blade-group animate-grass-slow">
              <path
                d="M56 72 Q42 50 26 37 Q44 47 61 72 Z"
                fill="url(#grassBackGrad)"
              />
              <path
                d="M72 72 Q60 44 49 23 Q66 41 78 72 Z"
                fill="url(#grassBackGrad)"
              />
              <path
                d="M92 72 Q86 39 81 14 Q93 38 98 72 Z"
                fill="url(#grassBackGrad)"
              />
              <path
                d="M113 72 Q111 36 113 10 Q118 37 119 72 Z"
                fill="url(#grassBackGrad)"
              />
              <path
                d="M132 72 Q137 40 144 17 Q141 43 138 72 Z"
                fill="url(#grassBackGrad)"
              />
            </g>

            {/* Mid-Back Layer: Wild grass stalks with fine golden-green seed plumes */}
            <g className="grass-blade-group animate-grass-breeze">
              <path
                d="M66 72 Q53 45 43 18 Q56 44 69 72 Z"
                fill="url(#grassMidGrad)"
              />
              <path
                d="M43 18 Q40 13 38 9 M43 18 Q45 13 46 9 M41 14 Q37 12 35 11 M42 14 Q46 11 48 10"
                stroke="url(#seedPlumeGrad)"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M121 72 Q125 40 132 12 Q128 41 125 72 Z"
                fill="url(#grassMidGrad)"
              />
              <path
                d="M132 12 Q134 7 136 3 M132 12 Q129 8 128 5 M133 9 Q137 7 139 6"
                stroke="url(#seedPlumeGrad)"
                strokeWidth="1.25"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Mid Layer: Full arching meadow blades with crisp natural taper */}
            <g className="grass-blade-group animate-grass-mid">
              <path
                d="M46 73 Q34 57 18 48 Q36 53 51 73 Z"
                fill="url(#grassMidGrad)"
              />
              <path
                d="M63 72 Q54 47 41 30 Q58 45 68 72 Z"
                fill="url(#grassMidGrad)"
              />
              <path
                d="M80 72 Q73 41 65 19 Q79 40 86 72 Z"
                fill="url(#grassMidGrad)"
              />
              <path
                d="M99 72 Q98 37 97 12 Q104 38 105 72 Z"
                fill="url(#grassMidGrad)"
              />
              <path
                d="M116 72 Q119 39 125 15 Q123 42 122 72 Z"
                fill="url(#grassMidGrad)"
              />
              <path
                d="M136 72 Q142 46 149 28 Q145 48 142 72 Z"
                fill="url(#grassMidGrad)"
              />
              {/* Subtle center midrib veins for botanical realism */}
              <path
                d="M83 71 Q76 46 67 24 M102 71 Q100 42 98 16 M119 71 Q121 44 124 20"
                stroke="#bef264"
                strokeOpacity="0.32"
                strokeWidth="0.7"
                fill="none"
              />
            </g>

            {/* Sunlit Foreground Blades: Crisp lighter tips overlapping pole base */}
            <g className="grass-blade-group animate-grass-tip">
              <path
                d="M52 73 Q43 57 32 45 Q47 54 57 73 Z"
                fill="url(#grassSunGrad)"
              />
              <path
                d="M72 73 Q65 50 56 32 Q70 48 77 73 Z"
                fill="url(#grassSunGrad)"
              />
              <path
                d="M89 73 Q85 45 80 24 Q91 45 94 73 Z"
                fill="url(#grassHighlightGrad)"
              />
              <path
                d="M107 73 Q107 43 108 19 Q113 44 113 73 Z"
                fill="url(#grassSunGrad)"
              />
              <path
                d="M126 73 Q131 48 139 27 Q134 50 131 73 Z"
                fill="url(#grassHighlightGrad)"
              />
              <path
                d="M142 73 Q146 56 151 42 Q148 58 147 73 Z"
                fill="url(#grassSunGrad)"
              />
            </g>

            {/* Low Fine Foreground Tuft Blades */}
            <g className="grass-blade-group animate-grass-slow">
              <path
                d="M64 73 Q58 61 48 53 Q60 58 68 73 Z"
                fill="url(#grassHighlightGrad)"
              />
              <path
                d="M95 73 Q92 56 87 43 Q96 55 100 73 Z"
                fill="url(#grassHighlightGrad)"
              />
              <path
                d="M119 73 Q123 58 128 45 Q125 60 124 73 Z"
                fill="url(#grassSunGrad)"
              />
              <path
                d="M134 73 Q139 61 145 52 Q141 62 139 73 Z"
                fill="url(#grassHighlightGrad)"
              />
            </g>
          </svg>
        </div>
      </div>
    </nav>
  );
}
