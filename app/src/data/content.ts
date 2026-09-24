// ============================================================
// FUNK EDU — Content contracts; populated at runtime from the
// backend content API (funkedu_content table). No fixtures here.
// ============================================================
import type { Question } from "../types";

export const PRETEST_QUESTIONS: Question[] = [];
export const POSTTEST_QUESTIONS: Question[] = [];
export const PROFESSIONAL_BASELINE_QUESTIONS: Question[] = [];

export interface JourneyDay {
  day: number;
  label: string;
  title: string;
  narrative: string;
  vitals: { hr: string; bp: string; rr: string; temp: string; spo2: string };
  decision?: {
    prompt: string;
    options: { key: string; text: string; correct: boolean; feedback: string; xp: number }[];
  };
}
export const CAP_JOURNEY: JourneyDay[] = [];
export const ANTIBIOGRAM: readonly { agent: string; mic: string; sir: string }[] = [];

export interface AuditCase {
  id: string;
  title: string;
  prescription: string;
  issues: string[];
  verdict: string;
  status: "watch" | "violation" | "correct";
}
export const AUDIT_CASES: AuditCase[] = [];

export const BADGES: readonly { id: string; name: string; desc: string }[] = [];
export const DOMAINS = [
  "Diagnosis Infeksi",
  "Mekanisme Aksi",
  "PK/PD",
  "Spektrum & AWaRe",
  "Resistensi & Stewardship",
] as const;
