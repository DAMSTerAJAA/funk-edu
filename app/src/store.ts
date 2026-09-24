// ============================================================
// FUNK EDU — Global Store (Zustand, prototype client-side state)
// ============================================================
import { create } from "zustand";
import { DEFAULT_SIM } from "./data/drugs";
import { resolveRoute, type Route, type RouteState } from "./routes";
import { professionalVerificationService } from "./services/professionalVerification";
import { fetchMe, registerAccount, saveProgress, clearSession } from "./services/backend";
import type {
  AssessmentState,
  ProfessionalAssessmentState,
  ProfessionalVerificationRequest,
  SimulationConfig,
  UserState,
} from "./types";

export type ExamMode = "pre" | "post" | "final" | "professional-baseline" | "professional-post";
export type LearningTarget = "student" | "professional";

export interface Store {
  route: Route;
  activeMission: number;
  user: UserState;
  simulation: SimulationConfig;
  studentAssessment: AssessmentState;
  professionalAssessment: ProfessionalAssessmentState;
  examIndex: number;
  examMode: ExamMode;
  examAnswers: Record<number, string>;

  navigate: (route: Route) => void;
  setMission: (mission: number) => void;
  registerStudent: (account: { name: string; email: string }) => void;
  startProfessionalRegistration: (account: { name: string; email: string }) => void;
  hydrateFromBackend: () => Promise<void>;
  beginProfessionalUpgrade: () => void;
  continueAsStudent: () => void;
  submitProfessionalVerification: (request: ProfessionalVerificationRequest) => Promise<void>;
  checkProfessionalVerification: () => Promise<void>;
  updateSim: (patch: Partial<SimulationConfig>) => void;
  setExam: (mode: ExamMode) => void;
  answerQuestion: (questionId: number, key: string) => void;
  setExamIndex: (index: number) => void;
  finishExam: (score: number) => void;
  completeMission: (mission: number, xp: number) => void;
  completeSharedModule: (module: "workbench" | "clinical-room" | "prescription-audit", target: LearningTarget) => void;
  addXP: (xp: number) => void;
  reset: () => void;
}

const RANKS: [number, string][] = [
  [2500, "Chief Steward"],
  [1500, "Senior Steward"],
  [800, "Steward"],
  [300, "Junior Steward"],
  [0, "Probationer"],
];

function rankFor(xp: number): string {
  for (const [minimum, rank] of RANKS) if (xp >= minimum) return rank;
  return "Probationer";
}

const initialVerification: UserState["professionalVerification"] = {
  status: "not_started",
  requestId: null,
  request: null,
  verifiedRole: null,
  verifiedName: null,
  rejectionReason: null,
  lastCheckedAt: null,
};

const initialUser: UserState = {
  name: "",
  email: "",
  experience: "student",
  onboardingIntent: "student",
  professionalVerification: initialVerification,
  xp: 0,
  coins: 0,
  streakDays: 1,
  rank: "Probationer",
};

const initialStudentAssessment: AssessmentState = {
  pretestScore: null,
  pretestDone: false,
  posttestScore: null,
  posttestDone: false,
  answersMap: {},
  unlockedMissions: [1],
  completedMissions: [],
  earnedBadges: [],
  finalChallengeDone: false,
  clinicalRoomDone: false,
};

export const emptyProfessionalAssessment: ProfessionalAssessmentState = {
  baselineScore: null,
  baselineDone: false,
  workbenchDone: false,
  clinicalRoomDone: false,
  prescriptionAuditDone: false,
  posttestScore: null,
  posttestDone: false,
  professionalCertificateUnlocked: false,
};

function persistProgress(state: Store) {
  saveProgress({
    experience: state.user.experience,
    onboardingIntent: state.user.onboardingIntent,
    xp: state.user.xp,
    coins: state.user.coins,
    streakDays: state.user.streakDays,
    rank: state.user.rank,
    studentAssessment: state.studentAssessment,
    professionalAssessment: state.professionalAssessment,
    professionalVerification: state.user.professionalVerification,
  }).catch((error: unknown) => console.error("Progress save failed", error));
}

function routeState(state: Store): RouteState {
  return {
    name: state.user.name,
    experience: state.user.experience,
    onboardingIntent: state.user.onboardingIntent,
    professionalVerification: state.user.professionalVerification,
    studentAssessment: state.studentAssessment,
    professionalAssessment: state.professionalAssessment,
  };
}

export const useStore = create<Store>((set, get) => ({
  route: "auth",
  activeMission: 1,
  user: initialUser,
  simulation: { ...DEFAULT_SIM },
  studentAssessment: initialStudentAssessment,
  professionalAssessment: emptyProfessionalAssessment,
  examIndex: 0,
  examMode: "pre",
  examAnswers: {},

  navigate: (requested) => {
    const state = get();
    set({ route: resolveRoute(requested, routeState(state)) });
  },
  setMission: (activeMission) => set({ activeMission }),

  registerStudent: ({ name, email }) => {
    set({
      user: { ...initialUser, name, email, experience: "student", onboardingIntent: "student", xp: 0, coins: 0, rank: rankFor(0) },
      route: "pretest",
      examMode: "pre",
      examIndex: 0,
      examAnswers: {},
    });
    registerAccount(name, email, "student").catch((error: unknown) => console.error("Backend registration failed", error));
  },

  startProfessionalRegistration: ({ name, email }) => {
    set({
      user: { ...initialUser, name, email, experience: "student", onboardingIntent: "professional", xp: 0, coins: 0, rank: rankFor(0) },
      route: "professional-verification",
    });
    registerAccount(name, email, "professional").catch((error: unknown) => console.error("Backend registration failed", error));
  },

  hydrateFromBackend: async () => {
    const result = await fetchMe();
    if (!result) return;
    const account = result.account;
    set({
      user: {
        name: account.name,
        email: account.email,
        experience: account.experience,
        onboardingIntent: account.onboardingIntent,
        professionalVerification: account.professionalVerification,
        xp: account.xp,
        coins: account.coins,
        streakDays: account.streakDays,
        rank: account.rank,
      },
      studentAssessment: account.studentAssessment,
      professionalAssessment: account.professionalAssessment,
      route: account.experience === "professional" && !account.professionalAssessment.baselineDone ? "professional-baseline" : account.experience === "professional" ? "professional-dashboard" : account.studentAssessment.pretestDone ? "student-dashboard" : "pretest",
      examMode: account.experience === "professional" ? "professional-baseline" : "pre",
    });
  },

  beginProfessionalUpgrade: () => set({ route: "professional-verification" }),
  continueAsStudent: () => {
    const state = get();
    set({
      user: { ...state.user, experience: "student", onboardingIntent: "student" },
      route: state.studentAssessment.pretestDone ? "student-dashboard" : "pretest",
      examMode: state.studentAssessment.pretestDone ? state.examMode : "pre",
    });
    persistProgress(get());
  },

  submitProfessionalVerification: async (request) => {
    const before = get();
    set({
      user: {
        ...before.user,
        professionalVerification: {
          ...before.user.professionalVerification,
          status: "submitting",
          request,
          rejectionReason: null,
        },
      },
    });
    try {
      const result = await professionalVerificationService.submit(request);
      const current = get();
      if (result.status === "verified") {
        set({
          user: {
            ...current.user,
            name: result.verifiedName,
            experience: "professional",
            professionalVerification: {
              status: "verified",
              requestId: result.requestId,
              request,
              verifiedRole: result.verifiedRole,
              verifiedName: result.verifiedName,
              rejectionReason: null,
              lastCheckedAt: result.checkedAt,
            },
          },
          professionalAssessment: { ...emptyProfessionalAssessment },
          route: "professional-baseline",
          examMode: "professional-baseline",
          examIndex: 0,
          examAnswers: {},
        });
        persistProgress(get());
        return;
      }
      set({
        user: {
          ...current.user,
          experience: "student",
          professionalVerification: {
            status: result.status,
            requestId: result.requestId,
            request,
            verifiedRole: null,
            verifiedName: null,
            rejectionReason: result.status === "rejected" ? result.reason : null,
            lastCheckedAt: result.checkedAt,
          },
        },
      });
      persistProgress(get());
    } catch {
      const current = get();
      set({
        user: {
          ...current.user,
          experience: "student",
          professionalVerification: {
            ...current.user.professionalVerification,
            status: "unavailable",
            request,
            rejectionReason: null,
            lastCheckedAt: new Date().toISOString(),
          },
        },
      });
    }
  },

  checkProfessionalVerification: async () => {
    const state = get();
    const verification = state.user.professionalVerification;
    if (!verification.requestId || !verification.request) return;
    set({ user: { ...state.user, professionalVerification: { ...verification, status: "submitting" } } });
    try {
      const result = await professionalVerificationService.check(verification.requestId);
      const current = get();
      if (result.status === "verified") {
        set({
          user: {
            ...current.user,
            name: verification.request.legalName,
            experience: "professional",
            professionalVerification: {
              status: "verified",
              requestId: result.requestId,
              request: verification.request,
              verifiedRole: result.verifiedRole,
              verifiedName: verification.request.legalName,
              rejectionReason: null,
              lastCheckedAt: result.checkedAt,
            },
          },
          professionalAssessment: { ...emptyProfessionalAssessment },
          route: "professional-baseline",
          examMode: "professional-baseline",
          examIndex: 0,
          examAnswers: {},
        });
        persistProgress(get());
        return;
      }
      set({
        user: {
          ...current.user,
          professionalVerification: {
            ...verification,
            status: result.status,
            rejectionReason: result.status === "rejected" ? result.reason : null,
            lastCheckedAt: result.checkedAt,
          },
        },
      });
      persistProgress(get());
    } catch {
      const current = get();
      set({ user: { ...current.user, professionalVerification: { ...verification, status: "unavailable", lastCheckedAt: new Date().toISOString() } } });
    }
  },

  updateSim: (patch) => set({ simulation: { ...get().simulation, ...patch } }),
  setExam: (examMode) => set({ examMode, examIndex: 0, examAnswers: {} }),
  answerQuestion: (questionId, key) => set({ examAnswers: { ...get().examAnswers, [questionId]: key } }),
  setExamIndex: (examIndex) => set({ examIndex }),

  finishExam: (score) => {
    const state = get();
    const bonusXP = score * 10;
    if (state.examMode === "professional-baseline") {
      set({
        professionalAssessment: { ...state.professionalAssessment, baselineScore: score, baselineDone: true },
        route: "professional-dashboard",
        examAnswers: {},
      });
      persistProgress(get());
      return;
    }
    if (state.examMode === "professional-post") {
      const modulesDone = state.professionalAssessment.workbenchDone && state.professionalAssessment.clinicalRoomDone && state.professionalAssessment.prescriptionAuditDone;
      const passed = score >= 8 && modulesDone;
      set({
        professionalAssessment: {
          ...state.professionalAssessment,
          posttestScore: score,
          posttestDone: true,
          professionalCertificateUnlocked: passed,
        },
        route: passed ? "certificate" : "professional-dashboard",
        examAnswers: {},
      });
      persistProgress(get());
      return;
    }
    if (state.examMode === "pre") {
      set({
        studentAssessment: { ...state.studentAssessment, pretestScore: score, pretestDone: true, answersMap: {} },
        user: { ...state.user, xp: state.user.xp + bonusXP, rank: rankFor(state.user.xp + bonusXP) },
        route: "student-dashboard",
        examAnswers: {},
      });
      persistProgress(get());
      return;
    }
    const passed = score >= 8;
    set({
      studentAssessment: {
        ...state.studentAssessment,
        posttestScore: score,
        posttestDone: true,
        finalChallengeDone: state.examMode === "final" ? true : state.studentAssessment.finalChallengeDone,
        answersMap: {},
      },
      user: { ...state.user, xp: state.user.xp + bonusXP, rank: rankFor(state.user.xp + bonusXP) },
      route: passed ? "certificate" : "student-dashboard",
      examAnswers: {},
    });
    persistProgress(get());
  },

  completeMission: (mission, xp) => {
    const state = get();
    if (state.studentAssessment.completedMissions.includes(mission)) return;
    const completedMissions = [...state.studentAssessment.completedMissions, mission];
    const unlockedMissions = state.studentAssessment.unlockedMissions.includes(mission + 1)
      ? state.studentAssessment.unlockedMissions
      : [...state.studentAssessment.unlockedMissions, Math.min(6, mission + 1)];
    const badgeMap: Record<number, string> = { 1: "detective", 2: "target", 3: "spectrum", 4: "pkpd" };
    const earnedBadges = badgeMap[mission] ? [...state.studentAssessment.earnedBadges, badgeMap[mission]] : state.studentAssessment.earnedBadges;
    const newXP = state.user.xp + xp;
    set({
      studentAssessment: { ...state.studentAssessment, completedMissions, unlockedMissions, earnedBadges },
      user: { ...state.user, xp: newXP, coins: state.user.coins + Math.round(xp / 5), rank: rankFor(newXP) },
    });
    persistProgress(get());
  },

  completeSharedModule: (module, target) => {
    const state = get();
    if (target === "student") {
      if (module === "workbench") state.completeMission(4, 150);
      if (module === "clinical-room") set({ studentAssessment: { ...state.studentAssessment, clinicalRoomDone: true } });
      if (module === "prescription-audit") state.completeMission(6, 130);
      return;
    }
    const field = module === "workbench" ? "workbenchDone" : module === "clinical-room" ? "clinicalRoomDone" : "prescriptionAuditDone";
    set({ professionalAssessment: { ...state.professionalAssessment, [field]: true } });
    persistProgress(get());
  },

  addXP: (xp) => {
    const state = get();
    const newXP = Math.max(0, state.user.xp + xp);
    set({ user: { ...state.user, xp: newXP, coins: state.user.coins + Math.max(0, Math.round(xp / 10)), rank: rankFor(newXP) } });
  },

  reset: () => {
    clearSession();
    set({
      route: "auth",
      activeMission: 1,
      user: initialUser,
      simulation: { ...DEFAULT_SIM },
      studentAssessment: initialStudentAssessment,
      professionalAssessment: emptyProfessionalAssessment,
      examIndex: 0,
      examMode: "pre",
      examAnswers: {},
    });
  },
}));

export type { Route } from "./routes";
