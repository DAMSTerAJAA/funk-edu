// ============================================================
// FUNK EDU — Resistance Evolution Engine (S vs R populations)
// Model edukatif disederhanakan: tekanan seleksi, fitness cost,
// MIC, mutasi & transfer gen horizontal, eliminasi oleh imun.
// ============================================================

export const GROWTH_S = 0.55;
export const FITNESS_COST = 0.12;
export const GROWTH_R = GROWTH_S * (1 - FITNESS_COST);
export const K = 5_000_000;
export const MIC_S = 1.0;
export const MIC_R = 8.0;
export const KILL_MAX = 1.4;
export const MUT_RATE = 2e-6;
export const CONJ_RATE = 0.02;
export const IMMUNE_THRESHOLD = 800;
export const IMMUNE_MAX = 1.1;
export const MAX_DAYS = 34;
const SUBSTEPS = 10;

export const START_TOTAL = 100_000;
export const START_R = 20;

export type Verdict = "cured" | "resistant" | "relapse" | "ended";

export interface DayPoint {
  day: number;
  N: number;
  pctR: number;
  C: number;
}

export interface ResistanceSim {
  day: number;
  S: number;
  R: number;
  history: DayPoint[];
  crossed50: boolean;
  finished: boolean;
  verdict: Verdict | null;
  narrative: string;
}

export type PresetKey = "full" | "early" | "sub" | "none";

export const PRESETS: Record<PresetKey, { title: string; desc: string; dose: (day: number) => number }> = {
  full: { title: "Kepatuhan Penuh", desc: "4× MIC selama 12 hari — dosis dan durasi sesuai resep.", dose: (d) => (d < 12 ? 4.0 : 0) },
  early: { title: "Berhenti Dini", desc: "4× MIC tapi dihentikan hari ke-4 (gejala \"sudah mendingan\").", dose: (d) => (d < 4 ? 4.0 : 0) },
  sub: { title: "Dosis Sub-terapeutik", desc: "1,2× MIC terus-menerus — dosis \"aman\" tapi kurang.", dose: (d) => (d < 12 ? 1.2 : 0) },
  none: { title: "Tanpa Pengobatan", desc: "Kontrol — biarkan infeksi tumbuh tanpa antibiotik.", dose: () => 0 },
};

export const INTRO_NARRATIVE =
  "Infeksi baru dimulai. Populasi didominasi galur rentan; segelintir sel resisten (~0,02%) sudah ada dari awal — bukan hasil obat, melainkan mutasi acak yang lebih dulu ada.";

function killRate(C: number, mic: number) {
  const r = Math.pow(C / mic, 2);
  return (KILL_MAX * r) / (1 + r);
}

export function fmtInt(n: number) {
  return Math.round(n).toLocaleString("id-ID");
}
export function fmtPct(p: number) {
  return p.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
}
export function fmtDose(c: number) {
  return c.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function initialSim(): ResistanceSim {
  const S = START_TOTAL - START_R;
  const R = START_R;
  return {
    day: 0,
    S,
    R,
    history: [{ day: 0, N: S + R, pctR: (R / (S + R)) * 100, C: 0 }],
    crossed50: false,
    finished: false,
    verdict: null,
    narrative: INTRO_NARRATIVE,
  };
}

function narrate(sim: { day: number; crossed50: boolean }, N: number, pctR: number, C: number, prevN: number): { text: string; crossedNow: boolean } {
  if (N < 0.5) return { text: "Infeksi tuntas. Populasi bakteri — termasuk sisa galur resisten — berhasil dieliminasi total lewat kombinasi efek antibiotik dan sistem imun inang.", crossedNow: false };
  if (!sim.crossed50 && pctR > 50) {
    return { text: `Titik kritis hari ke-${sim.day}: galur resisten kini menjadi MAYORITAS populasi. Terapi dengan obat ini kemungkinan besar akan gagal jika diteruskan tanpa evaluasi ulang.`, crossedNow: true };
  }
  if (N < IMMUNE_THRESHOLD && N > 0) {
    return { text: `Beban bakteri sudah sangat rendah (${fmtInt(N)} sel) — sistem imun inang mulai berperan menuntaskan sisa infeksi. Menghentikan obat sekarang berisiko menyisakan galur yang bertahan.`, crossedNow: false };
  }
  if (C === 0) {
    return {
      text: prevN > 0 && N > prevN
        ? "Tanpa tekanan antibiotik, populasi tumbuh bebas kembali. Galur resisten tidak diuntungkan di sini — cost kebugarannya membuatnya kalah bersaing dari galur rentan."
        : "Tidak ada obat diberikan. Populasi berkembang mengikuti dinamika alami tanpa tekanan seleksi dari antibiotik.",
      crossedNow: false,
    };
  }
  if (C < MIC_S) return { text: `Dosis ${C.toFixed(1)}× berada DI BAWAH MIC galur rentan. Ini bukan dosis terapeutik — efeknya justru menyeleksi sel yang sedikit lebih toleran, tanpa membasmi infeksi.`, crossedNow: false };
  if (C < MIC_R) return { text: `Dosis ${C.toFixed(1)}× membunuh galur rentan secara efektif (di atas MIC-nya), tapi masih jauh di bawah MIC galur resisten — populasi resisten nyaris tidak tersentuh oleh obat.`, crossedNow: false };
  return { text: `Dosis ${C.toFixed(1)}× melampaui MIC bahkan untuk galur resisten — kedua populasi tertekan kuat. Perlu diingat: dosis setinggi ini seringkali dibatasi toksisitas obat pada pasien di dunia nyata.`, crossedNow: false };
}

function judge(N: number, pctR: number): Verdict {
  if (N < 0.5) return "cured";
  if (pctR > 40) return "resistant";
  if (N > 500_000) return "relapse";
  return "ended";
}

/** Advance the simulation by one day at drug concentration C (× MIC-S). Pure. */
export function advance(prev: ResistanceSim, C: number): ResistanceSim {
  if (prev.finished || prev.day >= MAX_DAYS) return prev;

  let S = prev.S;
  let R = prev.R;
  const prevN = S + R;
  const dt = 1 / SUBSTEPS;
  for (let i = 0; i < SUBSTEPS; i++) {
    const N = S + R;
    const crowd = 1 - N / K;
    const kS = killRate(C, MIC_S);
    const kR = killRate(C, MIC_R);
    const immuneKill = N < IMMUNE_THRESHOLD ? IMMUNE_MAX * (1 - N / IMMUNE_THRESHOLD) : 0;
    const mutFlux = S * GROWTH_S * MUT_RATE;
    const hgtFlux = ((CONJ_RATE * S * R) / K) * (1 + (0.5 * C) / MIC_S);
    const dS = S * (GROWTH_S * crowd - kS - immuneKill) - mutFlux - hgtFlux;
    const dR = R * (GROWTH_R * crowd - kR - immuneKill) + mutFlux + hgtFlux;
    S = Math.max(0, S + dS * dt);
    R = Math.max(0, R + dR * dt);
  }

  const day = prev.day + 1;
  const N = S + R;
  const lastPct = prev.history[prev.history.length - 1]?.pctR ?? 0;
  const pctR = N > 0 ? (R / N) * 100 : lastPct;
  const history = [...prev.history, { day, N, pctR, C }];

  const note = narrate({ day, crossed50: prev.crossed50 }, N, pctR, C, prevN);
  const finished = day >= MAX_DAYS || (N < 0.5 && day > 2);

  return {
    day,
    S,
    R,
    history,
    crossed50: prev.crossed50 || note.crossedNow,
    finished,
    verdict: finished ? judge(N, pctR) : null,
    narrative: note.text,
  };
}
