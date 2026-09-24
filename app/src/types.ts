// ============================================================
// FUNK EDU — Shared domain types
// ============================================================

export type Experience = "student" | "professional";
export type ProfessionalRole = "dokter_umum" | "residen" | "farmasis";
export type VerificationStatus = "not_started" | "submitting" | "pending" | "verified" | "rejected" | "unavailable";

export interface ProfessionalVerificationRequest {
  legalName: string;
  professionalRole: ProfessionalRole;
  registrationNumber: string;
  institution: string;
  specialtyOrProgram: string;
  consent: true;
}

export interface ProfessionalVerificationState {
  status: VerificationStatus;
  requestId: string | null;
  request: ProfessionalVerificationRequest | null;
  verifiedRole: ProfessionalRole | null;
  verifiedName: string | null;
  rejectionReason: string | null;
  lastCheckedAt: string | null;
}

export interface ProfessionalAssessmentState {
  baselineScore: number | null;
  baselineDone: boolean;
  workbenchDone: boolean;
  clinicalRoomDone: boolean;
  prescriptionAuditDone: boolean;
  posttestScore: number | null;
  posttestDone: boolean;
  professionalCertificateUnlocked: boolean;
}

export type DrugId = "piperacillin_tazo" | "meropenem" | "vancomycin" | "gentamicin" | "levofloxacin";

export interface DrugInfo {
  id: DrugId;
  name: string;
  klass: string;
  aware: "ACCESS" | "WATCH" | "RESERVE";
  category: "time" | "concentration" | "auc";
  halfLifeH: number;
  vdPerKg: number;
  proteinBinding: number;
  doseOptionsG: number[];
  tauOptionsH: number[];
  tinfOptionsH: number[];
  micOptions: number[];
  targetDesc: string;
  targetPct: number;
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
  email: string;
  experience: Experience;
  onboardingIntent: Experience;
  professionalVerification: ProfessionalVerificationState;
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
