// ============================================================
// FUNK EDU — PK Engine (PRD §4.2)
// One-compartment IV infusion model, free plasma concentration
// ============================================================
import type { DrugInfo, SimulationConfig, SimulationMetrics } from "../types";
import { DRUGS } from "./drugs";

export interface PlasmaPoint {
  t: number; // jam
  total: number; // konsentrasi total mcg/mL
  free: number; // konsentrasi bebas fC
  mic: number;
}

function keFor(drug: DrugInfo, crCl: number): number {
  // koreksi eliminasi thd CrCl (dummy linear, baseline 100 mL/min)
  const baseKe = Math.LN2 / drug.halfLifeH;
  const renalFactor = 0.25 + 0.75 * Math.min(1.25, Math.max(0.2, crCl / 100));
  return baseKe * renalFactor;
}

/** Konsentrasi total plasma pada waktu t (jam) untuk dosis ke-n dimulai di tStart */
function concentrationAt(
  doseMg: number,
  tInf: number,
  ke: number,
  vd: number,
  tSinceStart: number
): number {
  if (tSinceStart < 0) return 0;
  const rate = doseMg / tInf; // mg/jam
  const cl = ke * vd;
  if (tSinceStart <= tInf) {
    // fase infus
    return (rate / cl) * (1 - Math.exp(-ke * tSinceStart));
  }
  // fase eliminasi pasca infus
  const cPeak = (rate / cl) * (1 - Math.exp(-ke * tInf));
  return cPeak * Math.exp(-ke * (tSinceStart - tInf));
}

export function simulate(cfg: SimulationConfig): {
  points: PlasmaPoint[];
  metrics: SimulationMetrics;
} {
  const drug = DRUGS[cfg.activeDrug];
  const ke = keFor(drug, cfg.crCl);
  const vd = drug.vdPerKg * cfg.patientWeightKg;
  const doseMg = cfg.doseGrams * 1000;
  const tau = cfg.intervalHours;
  const nDoses = cfg.steadyStateDoses;
  const fu = 1 - drug.proteinBinding;
  const tEnd = nDoses * tau; // 48 jam default
  const step = 0.1;

  const points: PlasmaPoint[] = [];
  let cMax = 0;
  let aucTotal = 0;
  let timeAboveMicLastInterval = 0;

  const lastIntervalStart = (nDoses - 1) * tau;

  let prevFree = 0;
  let prevT = 0;
  let prevTotal = 0;

  for (let t = 0; t <= tEnd + 0.0001; t += step) {
    let total = 0;
    for (let d = 0; d < nDoses; d++) {
      total += concentrationAt(doseMg, cfg.infusionDurationHours, ke, vd, t - d * tau);
    }
    const free = total * fu;
    points.push({ t, total, free, mic: cfg.micTarget });
    cMax = Math.max(cMax, total);
    // AUC trapesium (total, 48 jam → AUC24 = setengah)
    aucTotal += ((prevTotal + total) / 2) * (t - prevT);

    // waktu di atas MIC pada interval terakhir (steady state), pakai free
    if (t >= lastIntervalStart && t <= tEnd) {
      const abovePrev = prevFree >= cfg.micTarget;
      const aboveNow = free >= cfg.micTarget;
      if (abovePrev && aboveNow) {
        timeAboveMicLastInterval += t - prevT;
      } else if (abovePrev !== aboveNow && t > prevT) {
        // interpolasi linear titik crossing
        const frac = (cfg.micTarget - prevFree) / (free - prevFree);
        const crossT = prevT + frac * (t - prevT);
        if (abovePrev) timeAboveMicLastInterval += crossT - prevT;
        else timeAboveMicLastInterval += t - crossT;
      }
    }
    prevFree = free;
    prevT = t;
    prevTotal = total;
  }

  // trough = kadar bebas tepat sebelum dosis terakhir berikutnya (akhir interval)
  const cTrough = points[points.length - 1]?.free ?? 0;
  const fTOverMic = Math.min(100, (timeAboveMicLastInterval / tau) * 100);
  const auc24 = aucTotal / (tEnd / 24);
  const aucFree24 = auc24 * fu;
  const cMaxFree = cMax * fu;
  const cMaxOverMic = cMaxFree / cfg.micTarget;
  const aucOverMic = aucFree24 / cfg.micTarget;

  // penilaian attainment per kategori obat
  let attainment: number;
  if (drug.category === "time") attainment = fTOverMic;
  else if (drug.category === "concentration")
    attainment = Math.min(100, (cMaxOverMic / 10) * 100);
  else attainment = Math.min(100, (aucOverMic / 125) * 100);

  const isOptimal = attainment >= drug.targetPct;
  const status: SimulationMetrics["status"] =
    attainment >= drug.targetPct
      ? "optimal"
      : attainment >= 50
        ? "suboptimal"
        : "failure";

  // dinamika koloni (dummy regresi thd attainment)
  const kill = attainment / 100;
  const colonyCountLive = Math.round(1e8 * Math.pow(1 - kill * 0.999, 4));
  const resistantMutantCount =
    status === "failure"
      ? Math.round(1e4 * (1 + (50 - attainment)))
      : status === "suboptimal"
        ? Math.round(1e3 * (1 + (drug.targetPct - attainment)))
        : Math.round(10 * Math.random() + 2);

  const microbiomePreservation = Math.round(
    Math.min(98, Math.max(15, 95 - (drug.spectrum === "narrow" ? 8 : drug.spectrum === "broad" ? 30 : 45) + (isOptimal ? 10 : 0)))
  );

  return {
    points,
    metrics: {
      cMax,
      cTrough,
      auc24,
      fTOverMic,
      cMaxOverMic,
      aucOverMic,
      isOptimal,
      status,
      colonyCountLive,
      resistantMutantCount,
      microbiomePreservation,
    },
  };
}
