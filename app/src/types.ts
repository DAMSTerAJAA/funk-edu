// ============================================================
// FUNK EDU — Types (PRD §4.1)
// ============================================================

export type Role = "mahasiswa" | "residen" | "dokter_umum" | "farmasis";

export type DrugId =
  | "piperacillin_tazo"
  | "meropenem"
  | "vancomycin"
  | "gentamicin"
  | "levofloxacin";

export interface DrugInfo {
  id: DrugId;
  name: string;
  klass: string;
  aware: "ACCESS" | "WATCH" | "RESERVE";
  category: "time" | "concentration" | "auc";
  halfLifeH: number; // jam
  vdPerKg: number; // L/kg
  proteinBinding: number; // fraksi (0-1)
  doseOptionsG: number[];
  tauOptionsH: number[];
  tinfOptionsH: number[];
  micOptions: number[];
  targetDesc: string;
  targetPct: number; // target attainment %
  spectrum: "narrow" | "broad" | "reserve";
}

export interface SimulationConfig {
  activeDrug: DrugId;
  doseGrams: number;
  intervalHours: number;
  infusionDurationHours: number;
  micTarget: number;
  patientWeightKg: number;
  crCl: number;
  steadyStateDoses: number;
}

export interface SimulationMetrics {
  cMax: number;
  cTrough: number;
  auc24: number;
  fTOverMic: number;
  cMaxOverMic: number;
  aucOverMic: number;
  isOptimal: boolean;
  status: "optimal" | "suboptimal" | "failure";
  colonyCountLive: number;
  resistantMutantCount: number;
  microbiomePreservation: number;
}

export interface AssessmentState {
  pretestScore: number | null;
  pretestDone: boolean;
  posttestScore: number | null;
  posttestDone: boolean;
  answersMap: Record<number, string>;
  unlockedMissions: number[];
  completedMissions: number[];
  earnedBadges: string[];
  finalChallengeDone: boolean;
  clinicalRoomDone: boolean;
}

export interface UserState {
  name: string;
  role: Role;
  xp: number;
  coins: number;
  streakDays: number;
  rank: string;
}

export interface Question {
  id: number;
  domain: string;
  vignette: string;
  question: string;
  options: { key: string; text: string }[];
  correct: string;
  rationale: string;
}
