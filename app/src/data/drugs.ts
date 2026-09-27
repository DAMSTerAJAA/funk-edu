// ============================================================
// FUNK EDU — Drug reference; local fixtures below are the offline
// fallback. Primary source is the backend content API (funkedu_content,
// kind="drugs"), overridden at runtime by initDrugs().
// ============================================================
import type { DrugInfo, SimulationConfig } from "../types";

const LOCAL_DRUGS: Record<string, DrugInfo> = {
  piperacillin_tazo: {
    id: "piperacillin_tazo",
    name: "Piperacillin–Tazobactam",
    klass: "β-laktam / Penisilin antipseudomonas + inhibitor β-laktamase",
    aware: "WATCH",
    category: "time",
    halfLifeH: 1.0,
    vdPerKg: 0.2,
    proteinBinding: 0.3,
    doseOptionsG: [2.25, 3.375, 4.5, 6.75],
    tauOptionsH: [6, 8, 12],
    tinfOptionsH: [0.5, 3, 4],
    micOptions: [0.5, 1, 2, 4, 8, 16],
    targetDesc: "%fT > MIC ≥ 70%",
    targetPct: 70,
    spectrum: "broad",
  },
  meropenem: {
    id: "meropenem",
    name: "Meropenem",
    klass: "Karbapenem",
    aware: "WATCH",
    category: "time",
    halfLifeH: 1.0,
    vdPerKg: 0.25,
    proteinBinding: 0.02,
    doseOptionsG: [0.5, 1, 2],
    tauOptionsH: [6, 8, 12],
    tinfOptionsH: [0.5, 3, 4],
    micOptions: [0.5, 1, 2, 4, 8, 16],
    targetDesc: "%fT > MIC ≥ 70%",
    targetPct: 70,
    spectrum: "reserve",
  },
  vancomycin: {
    id: "vancomycin",
    name: "Vancomycin",
    klass: "Glikopeptida",
    aware: "WATCH",
    category: "auc",
    halfLifeH: 6.0,
    vdPerKg: 0.7,
    proteinBinding: 0.5,
    doseOptionsG: [0.5, 1, 1.25, 1.5],
    tauOptionsH: [8, 12, 24],
    tinfOptionsH: [1, 2],
    micOptions: [0.5, 1, 2],
    targetDesc: "AUC/MIC ≥ 400 (proksi 100)",
    targetPct: 80,
    spectrum: "narrow",
  },
  gentamicin: {
    id: "gentamicin",
    name: "Gentamicin",
    klass: "Aminoglikosida",
    aware: "ACCESS",
    category: "concentration",
    halfLifeH: 2.5,
    vdPerKg: 0.25,
    proteinBinding: 0.1,
    doseOptionsG: [0.24, 0.35, 0.5],
    tauOptionsH: [8, 12, 24],
    tinfOptionsH: [0.5, 1],
    micOptions: [0.5, 1, 2, 4],
    targetDesc: "Cmax/MIC ≥ 10",
    targetPct: 85,
    spectrum: "narrow",
  },
  levofloxacin: {
    id: "levofloxacin",
    name: "Levofloxacin",
    klass: "Fluorokuinolon",
    aware: "WATCH",
    category: "auc",
    halfLifeH: 7.0,
    vdPerKg: 1.1,
    proteinBinding: 0.3,
    doseOptionsG: [0.5, 0.75],
    tauOptionsH: [24],
    tinfOptionsH: [1, 1.5],
    micOptions: [0.25, 0.5, 1, 2],
    targetDesc: "AUC/MIC ≥ 125",
    targetPct: 80,
    spectrum: "broad",
  },
};

export const DEFAULT_SIM: SimulationConfig = {
  activeDrug: "piperacillin_tazo" as const,
  doseGrams: 4.5,
  intervalHours: 8,
  infusionDurationHours: 0.5,
  micTarget: 4,
  patientWeightKg: 70,
  crCl: 68,
  steadyStateDoses: 6,
};

// ============================================================
// Runtime drug registry — overridden from the backend content
// API (kind="drugs") when seeded; local fixtures otherwise.
// ============================================================
import { fetchContent } from "../services/backend";
import { notifyContentChange } from "./content";

export const DRUGS: Record<string, DrugInfo> = { ...LOCAL_DRUGS };

function isDrugInfo(value: unknown): value is DrugInfo {
  const candidate = value as Partial<DrugInfo> | null;
  return !!candidate
    && typeof candidate.id === "string"
    && typeof candidate.name === "string"
    && typeof candidate.halfLifeH === "number"
    && typeof candidate.vdPerKg === "number"
    && Array.isArray(candidate.doseOptionsG)
    && Array.isArray(candidate.tauOptionsH)
    && Array.isArray(candidate.tinfOptionsH)
    && Array.isArray(candidate.micOptions);
}

let drugsPromise: Promise<void> | null = null;

/** Load the drug reference from the backend content API. Idempotent. */
export function initDrugs(): Promise<void> {
  if (drugsPromise) return drugsPromise;
  drugsPromise = (async () => {
    const items = await fetchContent("drugs");
    const valid = items.filter(isDrugInfo);
    if (valid.length === 0) return; // not seeded — keep local fixtures
    for (const key of Object.keys(DRUGS)) delete DRUGS[key];
    for (const drug of valid) DRUGS[drug.id] = drug;
    notifyContentChange();
  })().catch(() => undefined);
  return drugsPromise;
}
