// ============================================================
// FUNK EDU — Global Store (Zustand, prototype client-side state)
// ============================================================
import { create } from "zustand";
import { resolveRoute, type Route, type RouteState } from "./routes";
import { professionalVerificationService } from "./services/professionalVerification";
import { fetchMe, registerAccount, loginAccount, saveProgress, clearSession, logoutAccount, type AccountResponse } from "./services/backend";
import { DEFAULT_SIM } from "./data/drugs";
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
  studentAssessment: AssessmentState;
  professionalAssessment: ProfessionalAssessmentState;
  examIndex: number;
  examMode: ExamMode;
  examAnswers: Record<number, string>;
  /** PK/PD Workbench exploration state — per-browser only, never persisted to the account. */
  simulation: SimulationConfig;
  /** false while a session-restore request is in flight — guards against racing a fresh local registration */
  backendReady: boolean;
  /** true once the account exists on the backend; enables progress persistence */
  backendSynced: boolean;

  navigate: (route: Route) => void;
  setMission: (mission: number) => void;
  registerStudent: (account: { name: string; email: string }) => Promise<void>;
  /** Restore an existing account by email and resume its stored progress. */
  loginStudent: (email: string) => Promise<{ ok: boolean; error?: string }>;
  startProfessionalRegistration: (account: { name: string; email: string }) => Promise<void>;
  hydrateFromBackend: () => Promise<void>;
  beginProfessionalUpgrade: () => void;
  continueAsStudent: () => void;
  submitProfessionalVerification: (request: ProfessionalVerificationRequest) => Promise<void>;
  checkProfessionalVerification: () => Promise<void>;
  setExam: (mode: ExamMode) => void;
  updateSim: (patch: Partial<SimulationConfig>) => void;
  answerQuestion: (questionId: number, key: string) => void;
  setExamIndex: (index: number) => void;
  finishExam: (score: number) => void;
  completeMission: (mission: number, xp: number) => void;
  completeSharedModule: (module: "resistance-lab" | "clinical-room" | "prescription-audit", target: LearningTarget) => void;
  /** One-time bonus XP for a mission objective; returns false when it was already granted. */
  awardMissionBonus: (mission: number, xp: number) => boolean;
  addXP: (xp: number) => void;
  reset: () => void;
  /** Revoke the session server-side and return to the auth screen; saved progress stays on the account. */
  logout: () => Promise<void>;
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
  bonusMissions: [],
  earnedBadges: [],
  finalChallengeDone: false,
  clinicalRoomDone: false,
};

/** Accounts persisted before a field existed come back incomplete — fill the gaps. */
function normalizeAssessment(stored: Partial<AssessmentState> | null | undefined): AssessmentState {
  return {
    ...initialStudentAssessment,
    ...(stored ?? {}),
    unlockedMissions: stored?.unlockedMissions ?? initialStudentAssessment.unlockedMissions,
    completedMissions: stored?.completedMissions ?? [],
    bonusMissions: stored?.bonusMissions ?? [],
    earnedBadges: stored?.earnedBadges ?? [],
  };
}

export const emptyProfessionalAssessment: ProfessionalAssessmentState = {
  baselineScore: null,
  baselineDone: false,
  resistanceLabDone: false,
  clinicalRoomDone: false,
  prescriptionAuditDone: false,
  posttestScore: null,
  posttestDone: false,
  professionalCertificateUnlocked: false,
};

/**
 * Normalize a persisted professional assessment.
 * Accounts written before the Resistance Lab replaced the PK/PD Workbench carry
 * `workbenchDone` instead of `resistanceLabDone`; a completed Workbench is the
 * equivalent credit for the same progression slot, so carry it forward rather
 * than silently re-locking the post-test gate.
 */
function normalizeProfessionalAssessment(stored: Record<string, unknown> | null | undefined): ProfessionalAssessmentState {
  const source = (stored ?? {}) as Partial<ProfessionalAssessmentState> & { workbenchDone?: boolean };
  const legacyWorkbenchDone = source.workbenchDone === true;
  return {
    ...emptyProfessionalAssessment,
    ...source,
    resistanceLabDone: source.resistanceLabDone ?? legacyWorkbenchDone,
  };
}

/**
 * Persist progress, serialized.
 *
 * A single action can commit twice in quick succession (Mission 1 awards the
 * bonus and then completes the mission), and each call snapshots the whole
 * account. Firing both at once let the second request overwrite the first,
 * so the losing half of the update was silently dropped. Saves are now
 * coalesced through a single in-flight request: only the newest snapshot is
 * sent, and it is sent after the previous request settles.
 */
let saveInFlight: Promise<unknown> | null = null;
let queuedSave: Parameters<typeof saveProgress>[0] | null = null;

function persistProgress(state: Store) {
  if (!state.backendSynced) return;
  queuedSave = {
    experience: state.user.experience,
    onboardingIntent: state.user.onboardingIntent,
    xp: state.user.xp,
    coins: state.user.coins,
    streakDays: state.user.streakDays,
    rank: state.user.rank,
    studentAssessment: state.studentAssessment,
    professionalAssessment: state.professionalAssessment,
    professionalVerification: state.user.professionalVerification,
  };
  if (saveInFlight) return;
  saveInFlight = (async () => {
    try {
      while (queuedSave) {
        const payload = queuedSave;
        queuedSave = null;
        await saveProgress(payload);
      }
    } catch (error) {
      console.error("Progress save failed", error);
    } finally {
      saveInFlight = null;
    }
  })();
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

/**
 * Map a backend account onto local store state. Shared by session restore and
 * explicit login so both land the user on the same screen with the same
 * normalized assessment and resumed progress.
 */
function accountToState(account: AccountResponse): Partial<Store> {
  const professional = account.experience === "professional";
  const baselineDone = account.professionalAssessment?.baselineDone === true;
  const verified = account.professionalVerification?.status === "verified" && professional;
  // Mirrors resolveRoute: an unverified professional applicant stays on the
  // verification gate rather than falling through to the student pretest.
  const applicant = account.onboardingIntent === "professional" && !verified;
  return {
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
    studentAssessment: normalizeAssessment(account.studentAssessment),
    professionalAssessment: normalizeProfessionalAssessment(account.professionalAssessment as unknown as Record<string, unknown>),
    backendSynced: true,
    route: applicant ? "professional-verification" : professional && !baselineDone ? "professional-baseline" : professional ? "professional-dashboard" : account.studentAssessment.pretestDone ? "student-dashboard" : "pretest",
    examMode: professional ? "professional-baseline" : "pre",
    examIndex: 0,
    examAnswers: {},
  };
}

export const useStore = create<Store>((set, get) => ({
  route: "auth",
  activeMission: 1,
  user: initialUser,
  studentAssessment: initialStudentAssessment,
  professionalAssessment: emptyProfessionalAssessment,
  examIndex: 0,
  examMode: "pre",
  examAnswers: {},
  simulation: { ...DEFAULT_SIM },
  backendReady: true,
  backendSynced: false,

  navigate: (requested) => {
    const state = get();
    set({ route: resolveRoute(requested, routeState(state)) });
  },
  setMission: (activeMission) => set({ activeMission }),

  registerStudent: async ({ name, email }) => {
    set({
      user: { ...initialUser, name, email, experience: "student", onboardingIntent: "student", xp: 0, coins: 0, rank: rankFor(0) },
      route: "pretest",
      examMode: "pre",
      examIndex: 0,
      examAnswers: {},
      backendSynced: false,
    });
    try {
      const { account } = await registerAccount(name, email, "student");
      const current = get();
      // A session restore may have finished while registration was in flight — never clobber it
      if (current.user.email.toLowerCase() !== email.toLowerCase()) return;
      // Re-registering an existing email returns that account, so resume its progress
      set(accountToState(account));
    } catch (error) {
      // Backend unreachable (e.g. protected deployment) — keep local session usable
      console.error("Backend registration failed", error);
    }
  },

  startProfessionalRegistration: async ({ name, email }) => {
    set({
      user: { ...initialUser, name, email, experience: "student", onboardingIntent: "professional", xp: 0, coins: 0, rank: rankFor(0) },
      route: "professional-verification",
      backendSynced: false,
    });
    try {
      const { account } = await registerAccount(name, email, "professional");
      const current = get();
      if (current.user.email.toLowerCase() !== email.toLowerCase()) return;
      set(accountToState(account));
    } catch (error) {
      console.error("Backend registration failed", error);
    }
  },

  hydrateFromBackend: async () => {
    set({ backendReady: false });
    try {
      const result = await fetchMe();
      if (!result) return;
      set(accountToState(result.account));
    } finally {
      set({ backendReady: true });
    }
  },

  loginStudent: async (email) => {
    try {
      const { account } = await loginAccount(email);
      set(accountToState(account));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Login failed" };
    }
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

  setExam: (examMode) => set({ examMode, examIndex: 0, examAnswers: {} }),
  updateSim: (patch) => set({ simulation: { ...get().simulation, ...patch } }),
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
      const modulesDone = state.professionalAssessment.resistanceLabDone && state.professionalAssessment.clinicalRoomDone && state.professionalAssessment.prescriptionAuditDone;
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
      if (module === "resistance-lab") state.completeMission(4, 150);
      if (module === "clinical-room") set({ studentAssessment: { ...state.studentAssessment, clinicalRoomDone: true } });
      if (module === "prescription-audit") state.completeMission(6, 130);
      return;
    }
    const field = module === "resistance-lab" ? "resistanceLabDone" : module === "clinical-room" ? "clinicalRoomDone" : "prescriptionAuditDone";
    set({ professionalAssessment: { ...state.professionalAssessment, [field]: true } });
    persistProgress(get());
  },

  awardMissionBonus: (mission, xp) => {
    const state = get();
    if (state.studentAssessment.bonusMissions.includes(mission)) return false;
    const newXP = Math.max(0, state.user.xp + xp);
    set({
      studentAssessment: { ...state.studentAssessment, bonusMissions: [...state.studentAssessment.bonusMissions, mission] },
      user: { ...state.user, xp: newXP, coins: state.user.coins + Math.max(0, Math.round(xp / 10)), rank: rankFor(newXP) },
    });
    persistProgress(get());
    return true;
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
      studentAssessment: initialStudentAssessment,
      professionalAssessment: emptyProfessionalAssessment,
      examIndex: 0,
      examMode: "pre",
      examAnswers: {},
      simulation: { ...DEFAULT_SIM },
      backendReady: true,
      backendSynced: false,
    });
  },

  logout: async () => {
    await logoutAccount();
    set({
      route: "auth",
      activeMission: 1,
      user: initialUser,
      studentAssessment: initialStudentAssessment,
      professionalAssessment: emptyProfessionalAssessment,
      examIndex: 0,
      examMode: "pre",
      examAnswers: {},
      simulation: { ...DEFAULT_SIM },
      backendReady: true,
      backendSynced: false,
    });
  },
}));

export type { Route } from "./routes";
