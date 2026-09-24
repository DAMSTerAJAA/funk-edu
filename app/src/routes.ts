import type { Experience, ProfessionalVerificationState } from "./types";

export type Route =
  | "auth" | "pretest" | "student-dashboard" | "professional-dashboard" | "professional-verification" | "professional-baseline"
  | "mission" | "workbench" | "clinical-room" | "professional-audit" | "final-challenge" | "posttest" | "certificate" | "profile";

export interface RouteMeta {
  label: string;
  shellVisible: boolean;
  requiredExperience?: Experience;
  progressionGuard?: (state: RouteState) => boolean;
}

export interface RouteState {
  name: string;
  experience: Experience;
  onboardingIntent: Experience;
  professionalVerification: ProfessionalVerificationState;
  studentAssessment: { completedMissions: number[]; clinicalRoomDone: boolean; posttestDone: boolean; posttestScore: number | null };
  professionalAssessment: { baselineDone: boolean; workbenchDone: boolean; clinicalRoomDone: boolean; prescriptionAuditDone: boolean; posttestDone: boolean; professionalCertificateUnlocked: boolean };
}

export const ROUTES: Record<Route, RouteMeta> = {
  auth: { label: "Auth", shellVisible: false },
  pretest: { label: "Pre-Test", shellVisible: true, requiredExperience: "student" },
  "student-dashboard": { label: "Student Dashboard", shellVisible: true, requiredExperience: "student" },
  "professional-dashboard": { label: "Professional Dashboard", shellVisible: true, requiredExperience: "professional" },
  "professional-verification": { label: "Professional Verification", shellVisible: true },
  "professional-baseline": { label: "Professional Baseline", shellVisible: true, requiredExperience: "professional" },
  mission: { label: "Missions", shellVisible: true, requiredExperience: "student", progressionGuard: (s) => s.studentAssessment.completedMissions.includes(1) },
  workbench: { label: "PK/PD Workbench", shellVisible: true },
  "clinical-room": { label: "Decision Room", shellVisible: true },
  "professional-audit": { label: "Prescription Audit", shellVisible: true, requiredExperience: "professional" },
  "final-challenge": { label: "Final Challenge", shellVisible: true },
  posttest: { label: "Post-Test", shellVisible: true },
  certificate: { label: "Certification", shellVisible: true },
  profile: { label: "Profile", shellVisible: true },
};

export function resolveRoute(requested: Route, state: RouteState): Route {
  if (requested === "auth" || !state.name) return "auth";
  const verified = state.professionalVerification.status === "verified" && state.experience === "professional";
  const initialProfessional = state.onboardingIntent === "professional" && !verified;
  if (requested === "professional-verification") return requested;
  if (initialProfessional) return "professional-verification";
  if (requested === "profile") return requested;
  if (verified && requested === "student-dashboard") return "professional-dashboard";
  if (!verified && requested === "professional-dashboard") return "student-dashboard";
  if (!verified && requested === "professional-baseline") return "student-dashboard";
  if (verified && requested === "professional-baseline" && state.professionalAssessment.baselineDone) return "professional-dashboard";
  if (verified && !state.professionalAssessment.baselineDone && ["workbench", "clinical-room", "professional-audit", "final-challenge", "posttest", "certificate"].includes(requested)) return "professional-baseline";
  if (verified && requested === "mission") return "professional-dashboard";
  if (!verified && requested === "professional-audit") return "student-dashboard";
  if (requested === "certificate") {
    const allowed = verified ? state.professionalAssessment.professionalCertificateUnlocked : state.studentAssessment.posttestDone && (state.studentAssessment.posttestScore ?? 0) >= 8;
    if (!allowed) return verified ? "professional-dashboard" : "student-dashboard";
  }
  if (requested === "clinical-room" && !verified && state.studentAssessment.completedMissions.length < 6) return "student-dashboard";
  if (requested === "posttest") {
    if (verified && !(state.professionalAssessment.workbenchDone && state.professionalAssessment.clinicalRoomDone && state.professionalAssessment.prescriptionAuditDone)) return "professional-dashboard";
    if (!verified && !state.studentAssessment.clinicalRoomDone) return "student-dashboard";
  }
  if (!verified && requested === "final-challenge" && state.studentAssessment.completedMissions.length < 6) return "student-dashboard";
  return requested;
}
