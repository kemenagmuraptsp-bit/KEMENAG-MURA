import { useEffect, useRef } from 'react';

interface HeroOfficeBackgroundProps {
  imageSrc: string;
  alt: string;
  preserveAspectRatio?: string;
}

export const HERO_FACADE_WIDTH = 1376;
export const HERO_FACADE_HEIGHT = 768;

// Left-side flagpole & lowered Bendera Merah Putih geometry in 1376x768 facade coordinates:
// Positioned cleanly to the left of the left videotron (which starts at x=133.5 / 9.7%, y=421 / 54.8%)
// and lowered so the finial + waving flag sit fully visible below the fixed top Navbar.
const POLE_CENTER_X = 94;
const POLE_TOP_Y = 186; // 24.2% — comfortably below fixed desktop Navbar (~14%–17%)
const POLE_BASE_Y = 558; // Meets upper concrete plinth collar emerging from behind front garden hedge (y~572)
const HOIST_X = 96.5;
const HOIST_TOP_Y = 196; // 25.5%
const FLAG_HEIGHT = 78; // Official 3:2 proportion (117 x 78); top red: 39, bottom white: 39
const FLAG_LENGTH = 117;
const SEGMENTS = 26;
const SHADING_STRIPS = 18;

interface WavePoint {
  x: number;
  yTop: number;
  yMid: number;
  yBot: number;
  slope: number;
}

function computeFlagPoints(t: number): WavePoint[] {
  const points: WavePoint[] = [];
  const gust = 1 + 0.16 * Math.sin(t * 1.15) + 0.08 * Math.sin(t * 2.35 + 1.1);

  for (let i = 0; i <= SEGMENTS; i += 1) {
    const u = i / SEGMENTS;
    // Envelope keeps hoist edge pinned to pole and increases ripple toward fly edge
    const env = Math.pow(u, 1.18);

    // Gentle natural gravity droop toward fly end, lifted subtly by gusts
    const droop = 18 * Math.pow(u, 1.32) - 2.8 * gust * u;

    // Traveling cloth waves (primary billow + secondary flutter)
    const phaseTop = u * 5.6 - t * 4.3;
    const phaseMid = u * 5.6 - t * 4.3 - 0.22;
    const phaseBot = u * 5.6 - t * 4.3 - 0.44;

    const waveTop =
      (Math.sin(phaseTop) * 7.2 + Math.sin(u * 10.4 - t * 6.8) * 1.9) * env * gust;
    const waveMid =
      (Math.sin(phaseMid) * 7.8 + Math.sin(u * 10.4 - t * 6.8 - 0.25) * 2.1) * env * gust;
    const waveBot =
      (Math.sin(phaseBot) * 8.4 + Math.sin(u * 10.4 - t * 6.8 - 0.48) * 2.3) * env * gust;

    // Slight horizontal foreshortening as folds travel across the cloth
    const foreshorten = (1 - Math.cos(phaseMid)) * 2.2 * env;
    const x = HOIST_X + u * FLAG_LENGTH - foreshorten;

    const yTop = HOIST_TOP_Y + droop + waveTop;
    const yMid = HOIST_TOP_Y + FLAG_HEIGHT * 0.5 + droop * 1.02 + waveMid;
    const yBot = HOIST_TOP_Y + FLAG_HEIGHT + droop * 1.05 + waveBot;

    // Instantaneous wave derivative for realistic sunlit crest / shaded trough lighting
    const slope =
      (Math.cos(phaseMid) * 5.6 * 0.72 + Math.cos(u * 10.4 - t * 6.8 - 0.25) * 2.1) *
      Math.pow(u, 0.75);

    points.push({ x, yTop, yMid, yBot, slope });
  }

  return points;
}

function buildBandPath(
  points: WavePoint[],
  topKey: 'yTop' | 'yMid',
  botKey: 'yMid' | 'yBot'
): string {
  const first = points[0];
  let d = `M ${first.x.toFixed(1)} ${first[topKey].toFixed(1)}`;
  for (let i = 1; i < points.length; i += 1) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i][topKey].toFixed(1)}`;
  }
  for (let i = points.length - 1; i >= 0; i -= 1) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i][botKey].toFixed(1)}`;
  }
  d += ' Z';
  return d;
}

export function HeroOfficeBackground({
  imageSrc,
  alt,
  preserveAspectRatio = 'xMidYMid slice',
}: HeroOfficeBackgroundProps) {
  const redPathRef = useRef<SVGPathElement | null>(null);
  const whitePathRef = useRef<SVGPathElement | null>(null);
  const seamPathRef = useRef<SVGPathElement | null>(null);
  const shadeRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderFrame = (timeSec: number) => {
      const pts = computeFlagPoints(timeSec);

      if (redPathRef.current) {
        redPathRef.current.setAttribute('d', buildBandPath(pts, 'yTop', 'yMid'));
      }
      if (whitePathRef.current) {
        whitePathRef.current.setAttribute('d', buildBandPath(pts, 'yMid', 'yBot'));
      }
      if (seamPathRef.current) {
        let seam = `M ${pts[0].x.toFixed(1)} ${pts[0].yMid.toFixed(1)}`;
        for (let i = 1; i < pts.length; i += 1) {
          seam += ` L ${pts[i].x.toFixed(1)} ${pts[i].yMid.toFixed(1)}`;
        }
        seamPathRef.current.setAttribute('d', seam);
      }

      // Update dynamic fold highlight/shadow strips across the waving cloth
      for (let s = 0; s < SHADING_STRIPS; s += 1) {
        const el = shadeRefs.current[s];
        if (!el) continue;
        const idxA = Math.floor((s / SHADING_STRIPS) * SEGMENTS);
        const idxB = Math.min(SEGMENTS, Math.ceil(((s + 1) / SHADING_STRIPS) * SEGMENTS));
        const a = pts[idxA];
        const b = pts[idxB];

        const stripPath =
          `M ${a.x.toFixed(1)} ${a.yTop.toFixed(1)} ` +
          `L ${b.x.toFixed(1)} ${b.yTop.toFixed(1)} ` +
          `L ${b.x.toFixed(1)} ${b.yBot.toFixed(1)} ` +
          `L ${a.x.toFixed(1)} ${a.yBot.toFixed(1)} Z`;
        el.setAttribute('d', stripPath);

        const avgSlope = (a.slope + b.slope) * 0.5;
        if (avgSlope >= 0) {
          const alpha = Math.min(0.24, avgSlope * 0.048);
          el.setAttribute('fill', '#ffffff');
          el.setAttribute('fill-opacity', alpha.toFixed(3));
        } else {
          const alpha = Math.min(0.26, Math.abs(avgSlope) * 0.052);
          el.setAttribute('fill', '#0f172a');
          el.setAttribute('fill-opacity', alpha.toFixed(3));
        }
      }
    };

    renderFrame(0.6);

    if (prefersReduced) return;

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsedSec = (now - start) / 1000;
      renderFrame(elapsedSec);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#3d9ef7] via-[#67befb] to-[#0b1d3d]">
      <svg
        viewBox={`0 0 ${HERO_FACADE_WIDTH} ${HERO_FACADE_HEIGHT}`}
        preserveAspectRatio={preserveAspectRatio}
        role="img"
        aria-label={alt}
        className="w-full h-full block"
      >
        <defs>
          {/* Realistic sunlit stainless/white cylindrical flagpole shading */}
          <linearGradient id="leftPoleShaftGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="32%" stopColor="#f8fafc" />
            <stop offset="68%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Warm brass/silver finial sphere gradient */}
          <radialGradient id="poleFinialGrad" cx="35%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="45%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </radialGradient>

          {/* Pedestal concrete & natural stone base gradients */}
          <linearGradient id="pedestalConcreteGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="38%" stopColor="#f8fafc" />
            <stop offset="72%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <linearGradient id="pedestalStoneGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#948979" />
            <stop offset="42%" stopColor="#dfd3c3" />
            <stop offset="78%" stopColor="#b8ab9a" />
            <stop offset="100%" stopColor="#7a7063" />
          </linearGradient>

          {/* Rich sunlit Merah Putih fabric base gradients */}
          <linearGradient id="flagRedBase" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#c81018" />
            <stop offset="35%" stopColor="#e51922" />
            <stop offset="75%" stopColor="#dc1420" />
            <stop offset="100%" stopColor="#b91019" />
          </linearGradient>

          <linearGradient id="flagWhiteBase" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#e8eef5" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="80%" stopColor="#f3f7fb" />
            <stop offset="100%" stopColor="#dce5f0" />
          </linearGradient>

          <filter id="flagDropShadow" x="-12%" y="-12%" width="128%" height="132%">
            <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#072244" floodOpacity="0.24" />
          </filter>

          <filter id="poleShadow" x="-40%" y="-5%" width="180%" height="110%">
            <feDropShadow dx="1.5" dy="2" stdDeviation="1.6" floodColor="#07182b" floodOpacity="0.28" />
          </filter>

          {/* Soft organic mask tracing the exact top crest of the manicured garden hedge (y~571..574) */}
          <filter id="foliageEdgeFeather" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <mask id="leftGardenPlantsMask">
            <rect x="0" y="0" width={HERO_FACADE_WIDTH} height={HERO_FACADE_HEIGHT} fill="black" />
            <path
              d="M 60 573 Q 68 569 76 572 Q 84 568 92 571 Q 99 568 107 572 Q 115 569 124 572 L 130 574 L 130 656 L 60 656 Z"
              fill="white"
              filter="url(#foliageEdgeFeather)"
            />
          </mask>
        </defs>

        {/* Main Official Kantor Kemenag Murung Raya Facade Photo (Clean Right Lawn Without Old Flagpole) */}
        <image
          href={imageSrc}
          x="0"
          y="0"
          width={HERO_FACADE_WIDTH}
          height={HERO_FACADE_HEIGHT}
          preserveAspectRatio="none"
        />

        {/* LEFT-SIDE FLAGPOLE, PEDESTAL BEHIND GARDEN PLANTS & WAVING BENDERA MERAH PUTIH */}
        <g aria-label="Tiang dan Bendera Merah Putih di sisi kiri kantor">
          {/* Lower natural stone stepped base tucked behind the manicured garden hedge (y=574..616) */}
          <rect
            x={POLE_CENTER_X - 18}
            y={575}
            width="36"
            height="42"
            rx="2"
            fill="url(#pedestalStoneGrad)"
            stroke="#6b6257"
            strokeWidth="0.8"
          />
          <line x1={POLE_CENTER_X - 18} y1={589} x2={POLE_CENTER_X + 18} y2={589} stroke="#6b6257" strokeWidth="0.6" opacity="0.55" />
          <line x1={POLE_CENTER_X - 18} y1={603} x2={POLE_CENTER_X + 18} y2={603} stroke="#6b6257" strokeWidth="0.6" opacity="0.55" />

          {/* Upper white concrete stepped plinth peeking cleanly just above the back of the hedge */}
          <rect
            x={POLE_CENTER_X - 13.5}
            y={567}
            width="27"
            height="9"
            rx="1"
            fill="url(#pedestalConcreteGrad)"
            stroke="#94a3b8"
            strokeWidth="0.6"
          />
          <rect
            x={POLE_CENTER_X - 8.5}
            y={559}
            width="17"
            height="9"
            rx="1"
            fill="url(#pedestalConcreteGrad)"
            stroke="#94a3b8"
            strokeWidth="0.6"
          />
          {/* Steel base collar */}
          <rect
            x={POLE_CENTER_X - 4.8}
            y={553}
            width="9.6"
            height="6.5"
            rx="1"
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="0.6"
          />

          {/* Tapered Flagpole Shaft (lowered height for clear homepage visibility) */}
          <g filter="url(#poleShadow)">
            <polygon
              points={`${POLE_CENTER_X - 1.9},${POLE_TOP_Y + 4} ${POLE_CENTER_X + 1.9},${POLE_TOP_Y + 4} ${POLE_CENTER_X + 3.0},${POLE_BASE_Y} ${POLE_CENTER_X - 3.0},${POLE_BASE_Y}`}
              fill="url(#leftPoleShaftGrad)"
            />
            {/* Top Finial Collar & Golden Orb */}
            <rect
              x={POLE_CENTER_X - 3.2}
              y={POLE_TOP_Y + 2.5}
              width="6.4"
              height="2.6"
              rx="1"
              fill="#eab308"
            />
            <circle
              cx={POLE_CENTER_X}
              cy={POLE_TOP_Y - 1}
              r="4.2"
              fill="url(#poleFinialGrad)"
              stroke="#713f12"
              strokeWidth="0.45"
            />
          </g>

          {/* Halyard Rope & Hoist Attachment Rings */}
          <line
            x1={HOIST_X - 0.3}
            y1={POLE_TOP_Y + 6}
            x2={HOIST_X - 0.3}
            y2={POLE_BASE_Y - 24}
            stroke="#f1f5f9"
            strokeWidth="0.85"
            opacity="0.82"
          />
          <circle
            cx={HOIST_X - 0.3}
            cy={HOIST_TOP_Y + 3}
            r="1.7"
            fill="#f8fafc"
            stroke="#64748b"
            strokeWidth="0.55"
          />
          <circle
            cx={HOIST_X - 0.3}
            cy={HOIST_TOP_Y + FLAG_HEIGHT - 3}
            r="1.7"
            fill="#f8fafc"
            stroke="#64748b"
            strokeWidth="0.55"
          />

          {/* Live Waving Bendera Merah Putih */}
          <g filter="url(#flagDropShadow)">
            <path ref={redPathRef} fill="url(#flagRedBase)" />
            <path ref={whitePathRef} fill="url(#flagWhiteBase)" />
            <path
              ref={seamPathRef}
              fill="none"
              stroke="#991b1b"
              strokeOpacity="0.18"
              strokeWidth="0.8"
            />

            {/* Dynamic 3D Cloth Fold Highlights & Shadows */}
            {Array.from({ length: SHADING_STRIPS }).map((_, idx) => (
              <path
                key={idx}
                ref={(el) => {
                  shadeRefs.current[idx] = el;
                }}
              />
            ))}
          </g>
        </g>

        {/* FOREGROUND REAL GARDEN PLANTS OVERLAY: Places the Flagpole Pedestal Naturally Behind the Greenery */}
        <image
          href={imageSrc}
          x="0"
          y="0"
          width={HERO_FACADE_WIDTH}
          height={HERO_FACADE_HEIGHT}
          preserveAspectRatio="none"
          mask="url(#leftGardenPlantsMask)"
        />
      </svg>
    </div>
  );
}
