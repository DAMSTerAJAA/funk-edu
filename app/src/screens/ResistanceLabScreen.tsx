// ============================================================
// FUNK EDU — Resistance Lab: Simulator Evolusi Resistensi
// Modul eksplorasi bebas (bukan misi ber-XP). Berdampingan
// dengan PK/PD Workbench (Misi 4) — tidak saling menggantikan.
// ============================================================
import { useEffect, useRef, useState } from "react";
import {
  advance, fmtDose, fmtInt, fmtPct, initialSim, INTRO_NARRATIVE, IMMUNE_THRESHOLD,
  K, MAX_DAYS, PRESETS, type DayPoint, type PresetKey, type ResistanceSim, type Verdict,
} from "../data/resistanceEngine";

type Mode = "idle" | "auto" | "preset";

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PETRI_SLOTS = (() => {
  const rand = mulberry(4242);
  const slots: { x: number; y: number; r: number; p: number }[] = [];
  for (let i = 0; i < 150; i++) {
    const a = rand() * Math.PI * 2;
    const rad = Math.sqrt(rand()) * 112;
    slots.push({ x: 130 + Math.cos(a) * rad, y: 130 + Math.sin(a) * rad, r: 2.2 + rand() * 2, p: rand() });
  }
  return slots.sort((a, b) => a.p - b.p);
})();

const VERDICTS: Record<Verdict, { label: string; tag: string; color: string }> = {
  cured: { label: "SEMBUH TOTAL", tag: "tag-mint", color: "var(--secondary)" },
  resistant: { label: "RESISTENSI TERSELEKSI KUAT", tag: "tag-red", color: "var(--danger)" },
  relapse: { label: "INFEKSI KAMBUH (RELAPSE)", tag: "tag-amber", color: "var(--amber)" },
  ended: { label: "SIMULASI BERAKHIR", tag: "tag-gray", color: "var(--text-secondary)" },
};

function verdictDetail(v: Verdict, day: number, N: number, pctR: number) {
  if (v === "cured") return `Infeksi dieliminasi sepenuhnya pada hari ke-${day}. Rejimen (dosis & durasi) cukup untuk menekan populasi hingga sistem imun mampu menuntaskan sisanya.`;
  if (v === "resistant") return `Pada hari ke-${day}, ${fmtPct(pctR)} populasi (≈${fmtInt(N)} sel) adalah galur resisten. Tekanan dosis yang terlalu lama di bawah MIC efektif memberi keunggulan selektif pada galur ini.`;
  if (v === "relapse") return `Populasi rebound ke ${fmtInt(N)} sel setelah obat dihentikan sebelum tuntas. Sebagian besar tetap galur rentan, namun terapi gagal mencapai eradikasi — infeksi berpotensi kambuh secara klinis.`;
  return `Batas ${MAX_DAYS} hari tercapai dengan populasi ${fmtInt(N)} sel (${fmtPct(pctR)} resisten).`;
}

export default function ResistanceLabScreen() {
  const [sim, setSim] = useState<ResistanceSim>(() => initialSim());
  const [dose, setDose] = useState(0);
  const [mode, setMode] = useState<Mode>("idle");
  const [presetKey, setPresetKey] = useState<PresetKey | null>(null);

  const simRef = useRef(sim);
  const doseRef = useRef(dose);
  useEffect(() => { doseRef.current = dose; }, [dose]);

  function commit(next: ResistanceSim) {
    simRef.current = next;
    setSim(next);
  }

  function stopRun() {
    setMode("idle");
    setPresetKey(null);
  }

  // Timer for autoplay & preset scenarios
  useEffect(() => {
    if (mode === "idle") return;
    const id = setInterval(() => {
      const cur = simRef.current;
      if (cur.finished) { setMode("idle"); setPresetKey(null); return; }
      let C = doseRef.current;
      if (mode === "preset" && presetKey) {
        C = PRESETS[presetKey].dose(cur.day);
        setDose(C);
      }
      const next = advance(cur, C);
      commit(next);
      if (next.finished) { setMode("idle"); setPresetKey(null); }
    }, mode === "auto" ? 550 : 190);
    return () => clearInterval(id);
  }, [mode, presetKey]);

  function step() {
    stopRun();
    commit(advance(simRef.current, dose));
  }

  function reset() {
    stopRun();
    setDose(0);
    doseRef.current = 0;
    commit(initialSim());
  }

  function runPreset(key: PresetKey) {
    commit(initialSim());
    setDose(PRESETS[key].dose(0));
    setPresetKey(key);
    setMode("preset");
  }

  const last = sim.history[sim.history.length - 1];
  const N = last.N;
  const locked = mode === "preset";
  const shownDose = mode === "preset" ? last.C : dose;
  const done = sim.finished && sim.verdict;

  return (
    <div className="anim-in">
      {/* ---------- Header ---------- */}
      <div className="card" style={{ marginBottom: 18 }}>
        <span className="tag tag-cyan">MODUL EKSPLORASI — RESISTANCE LAB</span>
        <h2 style={{ fontSize: 24, marginTop: 8 }}>Simulator Evolusi Resistensi Antibiotik</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: 6, maxWidth: 760 }}>
          Model populasi bakteri rentan (S) vs. resisten (R) di bawah tekanan seleksi antibiotik. Atur dosis, jalankan skenario, dan amati bagaimana keputusan terapi menentukan apakah infeksi tuntas — atau justru melahirkan galur yang lebih sulit dibasmi.
        </p>
      </div>

      {/* ---------- Stat bar ---------- */}
      <div className="wb-stats">
        <Stat label="Hari ke-" value={String(sim.day)} />
        <Stat label="Populasi total" value={N < 1 ? "0" : fmtInt(N)} color="var(--primary)" />
        <Stat label="% galur resisten" value={fmtPct(last.pctR)} color={last.pctR > 40 ? "var(--danger)" : "var(--secondary)"} />
        <Stat label="Dosis aktif" value={`${fmtDose(last.C)}× MIC`} color="var(--amber)" />
      </div>

      <div className="wb-grid">
        {/* ---------- LEFT: controls ---------- */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>KONTROL DOSIS</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="mono" style={{ fontSize: 24, color: "var(--primary)", fontWeight: 700 }}>{fmtDose(shownDose)}</span>
              <span className="label" style={{ fontSize: 9 }}>× MIC galur rentan</span>
            </div>
            <input
              className="wb-range" type="range" min={0} max={10} step={0.1}
              value={shownDose} disabled={locked} aria-label="Dosis dalam kelipatan MIC"
              onChange={(e) => setDose(parseFloat(e.target.value))}
            />
            <div className="mono" style={{ position: "relative", height: 16, fontSize: 9.5 }}>
              <span style={{ position: "absolute", left: "10%", transform: "translateX(-50%)", color: "var(--secondary)", whiteSpace: "nowrap" }}>↑ MIC-S (1×)</span>
              <span style={{ position: "absolute", left: "80%", transform: "translateX(-50%)", color: "var(--danger)", whiteSpace: "nowrap" }}>↑ MIC-R (8×)</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", padding: "9px 12px", fontSize: 13 }} disabled={locked || sim.finished} onClick={step}>▶ Maju 1 hari</button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: "center", padding: "9px 12px", fontSize: 13, borderColor: mode === "auto" ? "var(--primary)" : undefined, color: mode === "auto" ? "var(--primary)" : undefined }}
                disabled={locked || sim.finished}
                onClick={() => (mode === "auto" ? stopRun() : setMode("auto"))}
              >
                {mode === "auto" ? "⏸ Jeda" : "⏵ Autoplay"}
              </button>
              <button className="btn btn-ghost" style={{ padding: "9px 12px", fontSize: 13 }} onClick={reset}>↺ Reset</button>
            </div>
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>SKENARIO PRESET</div>
            <div style={{ display: "grid", gap: 8 }}>
              {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
                <button key={key} className={`wb-preset ${presetKey === key ? "running" : ""}`} disabled={mode === "auto"} onClick={() => runPreset(key)}>
                  <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5 }}>{PRESETS[key].title}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.45 }}>{PRESETS[key].desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 12 }}>KONSEP KUNCI</div>
            <div style={{ display: "grid", gap: 12 }}>
              <Concept color="var(--secondary)" title="Galur Rentan (S)" body="Tumbuh lebih cepat tanpa tekanan obat, tapi mati di atas MIC-nya." />
              <Concept color="var(--red)" title="Galur Resisten (R)" body={<>Butuh konsentrasi jauh lebih tinggi untuk terbunuh, namun menanggung <em>fitness cost</em> — tumbuh ~12% lebih lambat saat obat tak ada.</>} />
              <Concept color="var(--primary)" title="MIC (Kadar Hambat Minimum)" body="Konsentrasi minimum obat untuk menekan pertumbuhan galur tertentu. Dosis di bawah MIC = tekanan seleksi tanpa efek terapeutik penuh." />
              <Concept color="var(--amber)" title="Mutasi & Transfer Gen Horizontal" body="Resistensi bisa muncul dari mutasi spontan, atau menyebar antar sel lewat konjugasi plasmid — dipercepat oleh tekanan sub-letal." />
              <Concept color="var(--text-secondary)" title="Eliminasi oleh Imun Inang" body={`Saat beban bakteri sudah sangat rendah (< ${fmtInt(IMMUNE_THRESHOLD)} sel), sistem imun ikut menuntaskan sisa infeksi — inilah alasan medis kenapa kepatuhan penuh penting, bukan cuma sampai gejala hilang.`} />
            </div>
          </div>
        </div>

        {/* ---------- RIGHT: visuals ---------- */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <div className="label" style={{ marginBottom: 12 }}>CAWAN PETRI — VISUALISASI POPULASI</div>
            <div className="wb-petri">
              <div style={{ width: 260, maxWidth: "100%" }}>
                <Petri N={N} pctR={last.pctR} />
                <div className="mono" style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", marginTop: 8 }}>kepadatan & proporsi galur, skala logaritmik</div>
                <div className="mono" style={{ display: "flex", justifyContent: "center", gap: 14, fontSize: 11, marginTop: 6 }}>
                  <span style={{ color: "var(--secondary)" }}>● rentan</span>
                  <span style={{ color: "var(--danger)" }}>● resisten</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260, display: "grid", gap: 14 }}>
                <LineChart title="POPULASI TOTAL (SKALA LOG)" points={sim.history} color="var(--primary)" value={(p) => p.N} norm={(v) => (v < 1 ? 0 : Math.max(0, Math.min(1, Math.log10(v + 1) / Math.log10(K))))} yLabel={logLabel} />
                <LineChart title="PROPORSI GALUR RESISTEN (%)" points={sim.history} color="var(--red)" value={(p) => p.pctR} norm={(v) => Math.max(0, Math.min(1, v / 100))} yLabel={(f) => `${Math.round(f * 100)}%`} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>STATUS KLINIS</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, minHeight: 46 }} aria-live="polite">{sim.narrative || INTRO_NARRATIVE}</p>

            {done && (
              <div className="card card-low anim-in" style={{ marginTop: 12, borderLeft: `3px solid ${VERDICTS[sim.verdict!].color}` }}>
                <span className={`tag ${VERDICTS[sim.verdict!].tag}`}>{VERDICTS[sim.verdict!].label}</span>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>{verdictDetail(sim.verdict!, sim.day, N, last.pctR)}</p>
              </div>
            )}

            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14, lineHeight: 1.55 }}>
              Modul eksplorasi bebas — tidak memengaruhi XP maupun progres misi. Untuk tantangan ber-XP, selesaikan Misi 4 di PK/PD Workbench.
            </p>
          </div>
        </div>
      </div>

      <p className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", textAlign: "center", marginTop: 22 }}>
        Model edukatif disederhanakan untuk ilustrasi konsep (tekanan seleksi, fitness cost, MIC, transfer gen horizontal) — bukan data farmakokinetik klinis riil.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ */

function logLabel(frac: number) {
  const val = Math.pow(10, frac * Math.log10(K));
  if (val < 1) return "0";
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}jt`;
  if (val >= 1e3) return `${Math.round(val / 1e3)}rb`;
  return String(Math.round(val));
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="card card-low" style={{ padding: 14 }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div className="stat-value" style={{ fontSize: 22, marginTop: 4, color: color ?? "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

function Concept({ color, title, body }: { color: string; title: string; body: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        {title}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55, marginTop: 2 }}>{body}</div>
    </div>
  );
}

function Petri({ N, pctR }: { N: number; pctR: number }) {
  const density = N < 1 ? 0 : Math.max(0, Math.min(1, Math.log10(N + 1) / Math.log10(K)));
  const alive = Math.round(PETRI_SLOTS.length * density);
  const red = Math.round(alive * (N > 0 ? pctR / 100 : 0));
  return (
    <svg viewBox="0 0 260 260" width="100%" role="img" aria-label={`Cawan petri: ${fmtInt(N)} sel, ${fmtPct(pctR)} resisten`} style={{ display: "block" }}>
      <defs>
        <radialGradient id="dishBg" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#151f36" />
          <stop offset="100%" stopColor="#040d24" />
        </radialGradient>
      </defs>
      <circle cx="130" cy="130" r="127" fill="url(#dishBg)" stroke="var(--surface-highest)" strokeWidth="2" />
      <circle cx="130" cy="130" r="118" fill="none" stroke="rgba(0,240,255,0.14)" />
      {PETRI_SLOTS.slice(0, alive).map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={i < red ? "#ef4444" : "#4edea3"} opacity={0.88} />
      ))}
    </svg>
  );
}

function LineChart({ title, points, color, value, norm, yLabel }: {
  title: string; points: DayPoint[]; color: string;
  value: (p: DayPoint) => number; norm: (v: number) => number; yLabel: (frac: number) => string;
}) {
  const W = 560, H = 132, padL = 44, padR = 12, padT = 10, padB = 20;
  const xFor = (d: number) => padL + (W - padL - padR) * (d / MAX_DAYS);
  const yFor = (v: number) => padT + (H - padT - padB) * (1 - norm(v));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.day).toFixed(1)},${yFor(value(p)).toFixed(1)}`).join(" ");
  const lp = points[points.length - 1];
  return (
    <div>
      <div className="label" style={{ fontSize: 9.5, marginBottom: 4 }}>{title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title} style={{ display: "block", background: "var(--surface-lowest)", border: "1px solid var(--surface-highest)", borderRadius: "var(--radius-sm)" }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padT + ((H - padT - padB) * i) / 4;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="rgba(147,160,189,0.12)" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">{yLabel(1 - i / 4)}</text>
            </g>
          );
        })}
        {[0, MAX_DAYS / 2, MAX_DAYS].map((d) => (
          <text key={d} x={xFor(d)} y={H - 5} textAnchor={d === 0 ? "start" : d === MAX_DAYS ? "end" : "middle"} fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">hari {d}</text>
        ))}
        {points.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />}
        <circle cx={xFor(lp.day)} cy={yFor(value(lp))} r="3.5" fill={color} />
      </svg>
    </div>
  );
}
