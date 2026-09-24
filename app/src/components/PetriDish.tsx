// ============================================================
// FUNK EDU — Petri Dish Colony Renderer (SVG)
// ============================================================
import { useMemo } from "react";

interface Props {
  /** 0 = penuh koloni, 1 = eradicated */
  killFraction: number; // 0..1
  resistantFraction?: number; // 0..1 dari koloni tersisa
  size?: number;
  label?: string;
  seed?: number;
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function PetriDish({ killFraction, resistantFraction = 0.05, size = 150, label, seed = 7 }: Props) {
  const colonies = useMemo(() => {
    const rand = mulberry(seed * 1337 + 11);
    const total = Math.round(160 * (1 - killFraction));
    const list: { x: number; y: number; r: number; resistant: boolean; o: number }[] = [];
    const R = 100;
    for (let i = 0; i < total; i++) {
      const ang = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * (R - 14);
      list.push({
        x: 110 + Math.cos(ang) * dist,
        y: 110 + Math.sin(ang) * dist,
        r: 1.6 + rand() * 3.4,
        resistant: rand() < resistantFraction,
        o: 0.55 + rand() * 0.45,
      });
    }
    return list;
  }, [killFraction, resistantFraction, seed]);

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 220 220" style={{ width: size, height: size }}>
        <defs>
          <radialGradient id={`agar-${seed}`} cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="#1a2440" />
            <stop offset="100%" stopColor="#0c1530" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="110" r="104" fill={`url(#agar-${seed})`} stroke="#2b344d" strokeWidth="5" />
        <circle cx="110" cy="110" r="104" fill="none" stroke="#00f0ff" strokeOpacity="0.15" strokeWidth="1.5" />
        {colonies.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={c.r}
            fill={c.resistant ? "#ef4444" : "#e8e4c9"}
            opacity={c.o}
            style={c.resistant ? { filter: "drop-shadow(0 0 3px rgba(239,68,68,0.9))" } : undefined}
          />
        ))}
        {colonies.length === 0 && (
          <text x="110" y="116" textAnchor="middle" fontSize="13" fill="#4edea3" fontFamily="JetBrains Mono" fontWeight="700">
            NO GROWTH
          </text>
        )}
      </svg>
      {label && (
        <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {label}
        </div>
      )}
    </div>
  );
}
