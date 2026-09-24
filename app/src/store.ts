// ============================================================
// FUNK EDU — Global Store (Zustand, dummy client-side state)
// ============================================================
import { create } from "zustand";
import type { AssessmentState, Role, SimulationConfig, UserState } from "./types";
import { DEFAULT_SIM } from "./data/drugs";

export type Route =
  | "auth"
  | "pretest"
  | "dashboard"
  | "mission"
  | "workbench"
  | "clinical-room"
  | "final-challenge"
  | "posttest"
  | "certificate";

export interface Store {
  route: Route;
  activeMission: number;
  user: UserState;
  simulation: SimulationConfig;
  assessment: AssessmentState;
  // exam session
  examIndex: number;
  examMode: "pre" | "post" | "final";

  navigate: (r: Route) => void;
  setMission: (m: number) => void;
  login: (name: string, role: Role) => void;
  quickDemo: () => void;
  updateSim: (patch: Partial<SimulationConfig>) => void;
  setExam: (mode: "pre" | "post" | "final") => void;
  answerQuestion: (idx: number, key: string) => void;
  setExamIndex: (i: number) => void;
  finishExam: (score: number) => void;
  completeMission: (m: number, xp: number) => void;
  addXP: (xp: number) => void;
  setClinicalDone: () => void;
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
  for (const [min, r] of RANKS) if (xp >= min) return r;
  return "Probationer";
}

const initialUser: UserState = {
  name: "",
  role: "mahasiswa",
  xp: 0,
  coins: 0,
  streakDays: 1,
  rank: "Probationer",
};

const initialAssessment: AssessmentState = {
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

export const useStore = create<Store>((set, get) => ({
  route: "auth",
  activeMission: 1,
  user: initialUser,
  simulation: { ...DEFAULT_SIM },
  assessment: initialAssessment,
  examIndex: 0,
  examMode: "pre",

  navigate: (route) => set({ route }),
  setMission: (activeMission) => set({ activeMission }),

  login: (name, role) =>
    set({
      user: { ...initialUser, name, role, xp: 120, coins: 40, rank: rankFor(120) },
      route: "pretest",
      examMode: "pre",
      examIndex: 0,
    }),

  quickDemo: () =>
    set({
      user: { name: "dr. Althea Vance", role: "residen", xp: 120, coins: 40, streakDays: 7, rank: "Probationer" },
      route: "pretest",
      examMode: "pre",
      examIndex: 0,
    }),

  updateSim: (patch) => set({ simulation: { ...get().simulation, ...patch } }),

  setExam: (examMode) => set({ examMode, examIndex: 0, assessment: { ...get().assessment, answersMap: {} } }),

  answerQuestion: (idx, key) =>
    set({
      assessment: {
        ...get().assessment,
        answersMap: { ...get().assessment.answersMap, [idx]: key },
      },
    }),

  setExamIndex: (examIndex) => set({ examIndex }),

  finishExam: (score) => {
    const { examMode, assessment, user } = get();
    const bonusXP = score * 10;
    if (examMode === "pre") {
      set({
        assessment: { ...assessment, pretestScore: score, pretestDone: true, answersMap: {} },
        user: { ...user, xp: user.xp + bonusXP, rank: rankFor(user.xp + bonusXP) },
        route: "dashboard",
      });
    } else {
      const passed = score >= 8;
      set({
        assessment: {
          ...assessment,
          posttestScore: score,
          posttestDone: true,
          finalChallengeDone: examMode === "final" ? true : assessment.finalChallengeDone,
          answersMap: {},
        },
        user: { ...user, xp: user.xp + bonusXP, rank: rankFor(user.xp + bonusXP) },
        route: passed ? "certificate" : "dashboard",
      });
    }
  },

  completeMission: (m, xp) => {
    const { assessment, user } = get();
    if (assessment.completedMissions.includes(m)) return;
    const completed = [...assessment.completedMissions, m];
    const unlocked = assessment.unlockedMissions.includes(m + 1)
      ? assessment.unlockedMissions
      : [...assessment.unlockedMissions, Math.min(6, m + 1)];
    const badgeMap: Record<number, string> = { 1: "detective", 2: "target", 3: "spectrum", 4: "pkpd" };
    const earnedBadges = badgeMap[m]
      ? [...assessment.earnedBadges, badgeMap[m]]
      : assessment.earnedBadges;
    const newXP = user.xp + xp;
    set({
      assessment: { ...assessment, completedMissions: completed, unlockedMissions: unlocked, earnedBadges },
      user: { ...user, xp: newXP, coins: user.coins + Math.round(xp / 5), rank: rankFor(newXP) },
    });
  },

  addXP: (xp) => {
    const { user } = get();
    const newXP = Math.max(0, user.xp + xp);
    set({ user: { ...user, xp: newXP, coins: user.coins + Math.max(0, Math.round(xp / 10)), rank: rankFor(newXP) } });
  },

  setClinicalDone: () =>
    set({ assessment: { ...get().assessment, clinicalRoomDone: true } }),

  reset: () =>
    set({
      route: "auth",
      activeMission: 1,
      user: initialUser,
      simulation: { ...DEFAULT_SIM },
      assessment: initialAssessment,
      examIndex: 0,
      examMode: "pre",
    }),
}));
