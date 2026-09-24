// ============================================================
// FUNK EDU — Interactive Plasma Curve (SVG, neon glow)
// ============================================================
import { useMemo, useState } from "react";
import type { PlasmaPoint } from "../data/pkEngine";

interface Props {
  points: PlasmaPoint[];
  mic: number;
  tau: number;
  height?: number;
  showFree?: boolean;
}

const W = 900;
const H = 340;
const PAD = { l: 56, r: 16, t: 18, b: 34 };

export default function PlasmaCurve({ points, mic, tau, height = 340, showFree = true }: Props) {
  const [hover, setHover] = useState<{ x: number; p: PlasmaPoint } | null>(null);

  const { path, freePath, micY, tEnd, cMaxY, xTicks, yTicks } = useMemo(() => {
    const tEnd = points.length ? points[points.length - 1].t : 48;
    const maxC = Math.max(mic * 2.2, ...points.map((p) => p.total)) * 1.08;
    const sx = (t: number) => PAD.l + (t / tEnd) * (W - PAD.l - PAD.r);
    const sy = (c: number) => H - PAD.b - (c / maxC) * (H - PAD.t - PAD.b);
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.t).toFixed(1)},${sy(p.total).toFixed(1)}`).join(" ");
    const freePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.t).toFixed(1)},${sy(p.free).toFixed(1)}`).join(" ");
    const xTicks: number[] = [];
    for (let t = 0; t <= tEnd; t += 6) xTicks.push(t);
    const yTicks: number[] = [];
    const yStep = maxC / 5;
    for (let i = 0; i <= 5; i++) yTicks.push(Math.round(yStep * i * 10) / 10);
    return { path, freePath, micY: sy(mic), tEnd, cMaxY: maxC, xTicks, yTicks, sx, sy };
  }, [points, mic]);

  const sx = (t: number) => PAD.l + (t / tEnd) * (W - PAD.l - PAD.r);
  const sy = (c: number) => H - PAD.b - (c / cMaxY) * (H - PAD.t - PAD.b);

  const doseLines: number[] = [];
  for (let t = 0; t < tEnd; t += tau) doseLines.push(t);

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const t = ((relX - PAD.l) / (W - PAD.l - PAD.r)) * tEnd;
    if (t < 0 || t > tEnd) return setHover(null);
    const idx = Math.min(points.length - 1, Math.max(0, Math.round(t / 0.1)));
    setHover({ x: sx(points[idx].t), p: points[idx] });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, display: "block" }}>
      <defs>
        <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* grid */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} stroke="#202941" strokeWidth="1" />
          <text x={PAD.l - 8} y={sy(v) + 4} textAnchor="end" fontSize="10" fill="#5b6a8c" fontFamily="JetBrains Mono">
            {v}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={t}>
          <line y1={PAD.t} y2={H - PAD.b} x1={sx(t)} x2={sx(t)} stroke="#151f36" strokeWidth="1" />
          <text x={sx(t)} y={H - PAD.b + 16} textAnchor="middle" fontSize="10" fill="#5b6a8c" fontFamily="JetBrains Mono">
            {t}h
          </text>
        </g>
      ))}

      {/* dose markers */}
      {doseLines.map((t) => (
        <line key={t} x1={sx(t)} x2={sx(t)} y1={PAD.t} y2={H - PAD.b} stroke="#00f0ff" strokeOpacity="0.18" strokeDasharray="3 5" />
      ))}

      {/* MIC line */}
      <line x1={PAD.l} x2={W - PAD.r} y1={micY} y2={micY} stroke="#fbbf24" strokeWidth="1.6" strokeDasharray="7 5" />
      <text x={W - PAD.r} y={micY - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="#fbbf24" fontFamily="JetBrains Mono">
        MIC {mic} mcg/mL
      </text>

      {/* area + curves */}
      <path d={`${path} L${sx(tEnd)},${sy(0)} L${sx(0)},${sy(0)} Z`} fill="url(#curveFill)" />
      <path d={path} fill="none" stroke="#00f0ff" strokeWidth="2.4" filter="url(#neon)" />
      {showFree && <path d={freePath} fill="none" stroke="#4edea3" strokeWidth="1.8" strokeDasharray="2 4" opacity="0.9" />}

      {/* hover probe */}
      <rect
        x={PAD.l}
        y={PAD.t}
        width={W - PAD.l - PAD.r}
        height={H - PAD.t - PAD.b}
        fill="transparent"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: "crosshair" }}
      />
      {hover && (
        <g pointerEvents="none">
          <line x1={hover.x} x2={hover.x} y1={PAD.t} y2={H - PAD.b} stroke="#e2e8f5" strokeOpacity="0.4" />
          <circle cx={hover.x} cy={sy(hover.p.total)} r="4.5" fill="#00f0ff" filter="url(#neon)" />
          <circle cx={hover.x} cy={sy(hover.p.free)} r="3.5" fill="#4edea3" />
          <g transform={`translate(${Math.min(hover.x + 10, W - 190)}, ${Math.max(sy(hover.p.total) - 54, PAD.t)})`}>
            <rect width="182" height="50" rx="8" fill="#040d24" stroke="#2b344d" />
            <text x="10" y="18" fontSize="11" fill="#00f0ff" fontFamily="JetBrains Mono" fontWeight="700">
              t={hover.p.t.toFixed(1)}h • total {hover.p.total.toFixed(2)}
            </text>
            <text x="10" y="36" fontSize="11" fill="#4edea3" fontFamily="JetBrains Mono">
              bebas fC {hover.p.free.toFixed(2)} mcg/mL
            </text>
          </g>
        </g>
      )}

      {/* axis labels */}
      <text x={PAD.l - 40} y={PAD.t + 6} fontSize="10" fill="#5b6a8c" fontFamily="JetBrains Mono" transform={`rotate(-90 ${PAD.l - 40} ${PAD.t + 6})`}>
        mcg/mL
      </text>
    </svg>
  );
}
