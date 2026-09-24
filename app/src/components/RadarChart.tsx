// ============================================================
// FUNK EDU — Radar / Spider Chart (SVG, 5-6 domains)
// ============================================================
interface Props {
  labels: string[];
  values: number[]; // 0..100
  compare?: number[]; // baseline (opsional)
  size?: number;
}

export default function RadarChart({ labels, values, compare, size = 280 }: Props) {
  const C = 150;
  const R = 108;
  const n = labels.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number) => `${C + Math.cos(angle(i)) * r},${C + Math.sin(angle(i)) * r}`;
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, (v / 100) * R)).join(" ");

  return (
    <svg viewBox="0 0 300 300" style={{ width: size, height: size }}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={Array.from({ length: n }, (_, i) => pt(i, R * f)).join(" ")}
          fill="none"
          stroke="#2b344d"
          strokeWidth="1"
        />
      ))}
      {labels.map((_, i) => (
        <line key={i} x1={C} y1={C} x2={C + Math.cos(angle(i)) * R} y2={C + Math.sin(angle(i)) * R} stroke="#2b344d" strokeWidth="1" />
      ))}
      {compare && (
        <polygon points={poly(compare)} fill="rgba(251,191,36,0.12)" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 4" />
      )}
      <polygon points={poly(values)} fill="rgba(0,240,255,0.18)" stroke="#00f0ff" strokeWidth="2" style={{ filter: "drop-shadow(0 0 6px rgba(0,240,255,0.5))" }} />
      {values.map((v, i) => {
        const [x, y] = pt(i, (v / 100) * R).split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#00f0ff" />;
      })}
      {labels.map((l, i) => {
        const lx = C + Math.cos(angle(i)) * (R + 24);
        const ly = C + Math.sin(angle(i)) * (R + 24);
        return (
          <text
            key={l}
            x={lx}
            y={ly}
            textAnchor={Math.abs(Math.cos(angle(i))) < 0.3 ? "middle" : Math.cos(angle(i)) > 0 ? "start" : "end"}
            dominantBaseline="middle"
            fontSize="9.5"
            fill="#93a0bd"
            fontFamily="JetBrains Mono"
          >
            {l}
          </text>
        );
      })}
    </svg>
  );
}
