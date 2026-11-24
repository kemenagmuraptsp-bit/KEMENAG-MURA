import { Info } from 'lucide-react';

interface HeroInfoBoardProps {
  lang: 'id' | 'en';
  hidden?: boolean;
}

export function HeroInfoBoard({ lang, hidden = false }: HeroInfoBoardProps) {
  return (
    <aside
      aria-label={lang === 'en' ? 'Information Board' : 'Papan Informasi Kemenag Murung Raya'}
      className={`pointer-events-auto relative flex flex-col items-center select-none transition-all duration-700 ${
        hidden ? 'opacity-0 -translate-x-5 pointer-events-none' : 'opacity-100 translate-x-0'
      }`}
    >
      {/* Freestanding Architectural Information Board Frame */}
      <div className="relative z-20 w-[268px] sm:w-[292px] rounded-2xl p-[3px] bg-gradient-to-br from-amber-300 via-amber-500 to-emerald-700 shadow-[0_18px_40px_rgba(2,12,24,0.62)]">
        <div className="relative rounded-[13px] overflow-hidden bg-gradient-to-b from-[#064e3b]/96 via-[#053b2c]/96 to-[#02241b]/98 backdrop-blur-md border border-white/15">
          {/* Top Subtle Architectural Gloss Highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/12 to-transparent"
          />

          {/* Board Header Bar */}
          <div className="relative flex items-center gap-2 px-3.5 py-2.5 border-b border-amber-300/30 bg-emerald-950/65">
            <span className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-300/50 flex items-center justify-center shrink-0">
              <Info className="w-3.5 h-3.5 text-amber-300" strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300 leading-none">
                {lang === 'en' ? 'Information Board' : 'Papan Informasi'}
              </p>
              <p className="text-[9.5px] font-semibold text-emerald-100/80 mt-0.5 truncate">
                Kemenag Kab. Murung Raya
              </p>
            </div>
          </div>

          {/* Board Content Text */}
          <div className="relative px-4 py-3.5">
            <p className="text-[12px] sm:text-[12.5px] leading-[1.6] font-semibold text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
              {lang === 'en' ? (
                <>
                  Official website for religious services and information that is{' '}
                  <span className="text-amber-300 font-bold">
                    Professional, Responsive, Integrity-driven, Modern, and Accountable
                  </span>{' '}
                  for all residents of Murung Raya Regency.
                </>
              ) : (
                <>
                  Website resmi pelayanan dan informasi keagamaan yang{' '}
                  <span className="text-amber-300 font-bold">
                    Profesional, Responsif, Integritas, Modern, dan Akuntabel
                  </span>{' '}
                  bagi seluruh masyarakat Kabupaten Murung Raya
                </>
              )}
            </p>
          </div>

          {/* Bottom Fine Gold Trim Accent */}
          <div
            aria-hidden="true"
            className="h-1 w-full bg-gradient-to-r from-emerald-500/40 via-amber-400/90 to-emerald-500/40"
          />
        </div>
      </div>

      {/* Supporting Twin Architectural Stand Posts Anchored Into Swaying Grass */}
      <div
        aria-hidden="true"
        className="relative z-10 w-[210px] h-14 sm:h-16 flex items-stretch justify-between px-4 -mt-0.5 pointer-events-none"
      >
        <div className="w-3.5 h-full signpost-post-pillar border-x border-teal-300/35 shadow-md" />
        <div className="w-3.5 h-full signpost-post-pillar border-x border-teal-300/35 shadow-md" />

        {/* Swaying Grass Cluster Anchoring the Left Board Posts */}
        <svg
          viewBox="0 0 220 44"
          className="absolute -bottom-1 -left-4 w-[242px] h-11 overflow-visible drop-shadow-[0_3px_6px_rgba(2,6,23,0.7)]"
        >
          <defs>
            <linearGradient id="leftBoardGrassMid" x1="0" y1="1" x2="0.1" y2="0">
              <stop offset="0%" stopColor="#062c1b" />
              <stop offset="50%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
            <linearGradient id="leftBoardGrassSun" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#14532d" />
              <stop offset="55%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#bef264" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="41" rx="96" ry="5" fill="#07190e" opacity="0.92" />
          <g className="grass-blade-group animate-grass-slow">
            <path d="M26 42 Q18 24 10 14 Q23 23 31 42 Z" fill="url(#leftBoardGrassMid)" />
            <path d="M40 42 Q35 19 31 7 Q42 19 46 42 Z" fill="url(#leftBoardGrassSun)" />
            <path d="M54 42 Q58 21 66 11 Q61 24 59 42 Z" fill="url(#leftBoardGrassMid)" />
          </g>
          <g className="grass-blade-group animate-grass-mid">
            <path d="M164 42 Q156 22 148 11 Q161 21 169 42 Z" fill="url(#leftBoardGrassMid)" />
            <path d="M179 42 Q178 18 180 6 Q185 19 185 42 Z" fill="url(#leftBoardGrassSun)" />
            <path d="M192 42 Q200 23 209 13 Q202 25 197 42 Z" fill="url(#leftBoardGrassMid)" />
          </g>
          <g className="grass-blade-group animate-grass-tip">
            <path d="M33 42 Q29 28 24 19 Q34 27 38 42 Z" fill="url(#leftBoardGrassSun)" />
            <path d="M47 42 Q49 25 53 16 Q52 28 51 42 Z" fill="url(#leftBoardGrassSun)" />
            <path d="M171 42 Q168 27 164 17 Q173 27 176 42 Z" fill="url(#leftBoardGrassSun)" />
            <path d="M186 42 Q191 27 196 18 Q192 29 190 42 Z" fill="url(#leftBoardGrassSun)" />
          </g>
        </svg>
      </div>
    </aside>
  );
}
