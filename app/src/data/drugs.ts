// ============================================================
// FUNK EDU — Drug reference contracts; populated at runtime from
// the backend content API. No embedded fixtures.
// ============================================================
import type { DrugInfo, SimulationConfig } from "../types";

export const DRUGS: Record<string, DrugInfo> = {};

export const DEFAULT_SIM: SimulationConfig = {
  activeDrug: "piperacillin_tazo",
  doseGrams: 0,
  intervalHours: 8,
  infusionDurationHours: 0.5,
  micTarget: 1,
  patientWeightKg: 0,
  crCl: 0,
  steadyStateDoses: 0,
};
