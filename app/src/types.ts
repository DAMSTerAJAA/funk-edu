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
  resistanceLabDone: boolean;
  clinicalRoomDone: boolean;
  prescriptionAuditDone: boolean;
  posttestScore: number | null;
  posttestDone: boolean;
  professionalCertificateUnlocked: boolean;
}

export interface AssessmentState {
  pretestScore: number | null;
  pretestDone: boolean;
  posttestScore: number | null;
  posttestDone: boolean;
  answersMap: Record<number, string>;
  unlockedMissions: number[];
  completedMissions: number[];
  /** Missions whose one-time bonus XP has been granted — blocks farming on re-answer. */
  bonusMissions: number[];
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
