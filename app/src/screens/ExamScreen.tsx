import { useEffect, useMemo, useState } from "react";
import { POSTTEST_QUESTIONS, PRETEST_QUESTIONS, PROFESSIONAL_BASELINE_QUESTIONS } from "../data/content";
import { useStore } from "../store";
import type { Question } from "../types";

export default function ExamScreen() {
  const { examMode, examIndex, setExamIndex, examAnswers, answerQuestion, finishExam, navigate, user } = useStore();
  const isProfessionalBaseline = examMode === "professional-baseline";
  const isProfessionalPost = examMode === "professional-post";
  const isFinal = examMode === "final";
  const questions: Question[] = isProfessionalBaseline ? PROFESSIONAL_BASELINE_QUESTIONS : examMode === "pre" ? PRETEST_QUESTIONS : POSTTEST_QUESTIONS;
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showRationale, setShowRationale] = useState<number | null>(null);
  const q = questions[examIndex];
  const selected = examAnswers[q.id];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = window.setTimeout(() => setTimeLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft]);

  const score = useMemo(() => questions.reduce((total, question) => total + (examAnswers[question.id] === question.correct ? 1 : 0), 0), [examAnswers, questions]);
  const answeredCount = questions.filter((question) => examAnswers[question.id]).length;
  const label = isProfessionalBaseline ? "PROFESSIONAL CLINICAL BASELINE — PROTOTYPE" : isProfessionalPost ? "PROFESSIONAL POST-TEST" : isFinal ? "FINAL COMPREHENSIVE CHALLENGE" : examMode === "pre" ? "STUDENT PRE-TEST DIAGNOSTIC BASELINE" : "STUDENT POST-TEST EVALUATION";
  const title = isProfessionalBaseline ? "6-question clinical baseline" : `${questions.length} Soal Vignette Klinis Terintegrasi`;

  function selectOption(key: string) {
    if (selected) return;
    answerQuestion(q.id, key);
    if (!isFinal) setShowRationale(q.id);
  }

  return <div className="anim-in" style={{ maxWidth: 1080, margin: "0 auto" }}>
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20, padding: "16px 24px" }}><div style={{ flex: 1 }}><div className="label">{label}</div><div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{title}</div>{isProfessionalBaseline && <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 5 }}>Completion-based: answer all six questions. Score is recorded but does not block completion.</p>}</div><div className="mono" style={{ fontSize: 28, color: timeLeft < 300 ? "var(--danger)" : "var(--amber)" }}>{String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</div></div>
    <div className="card card-low" style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", gap: 10 }}><span className="mono">QUESTION {examIndex + 1}/{questions.length}</span><span className="mono">ANSWERED {answeredCount}/{questions.length}</span></div>
    <div className="card anim-in" key={q.id}><span className="tag tag-cyan">{q.domain}</span><p style={{ marginTop: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>{q.vignette}</p><h3 style={{ margin: "18px 0 14px", fontSize: 18 }}>{q.question}</h3><div style={{ display: "grid", gap: 9 }}>{q.options.map((option) => { const picked = selected === option.key; const revealed = !!selected; return <button key={option.key} className="btn btn-ghost" onClick={() => selectOption(option.key)} disabled={!!selected} style={{ justifyContent: "flex-start", textAlign: "left", padding: "13px 15px", background: picked ? (option.key === q.correct ? "var(--secondary-dim)" : "var(--red-dim)") : revealed && option.key === q.correct ? "var(--secondary-dim)" : undefined, borderColor: revealed && option.key === q.correct ? "var(--secondary)" : undefined }}><span className="mono" style={{ width: 22 }}>{option.key}</span>{option.text}</button>; })}</div>{showRationale === q.id && <div className="card card-low anim-in" style={{ marginTop: 16, borderColor: selected === q.correct ? "var(--secondary)" : "var(--amber)", fontSize: 13, lineHeight: 1.65 }}><strong>{selected === q.correct ? "Correct." : "Review."}</strong> {q.rationale}</div>}<div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}><button className="btn btn-ghost" disabled={examIndex === 0} onClick={() => setExamIndex(examIndex - 1)}>← Sebelumnya</button>{examIndex < questions.length - 1 ? <button className="btn btn-primary" onClick={() => setExamIndex(examIndex + 1)}>Berikutnya →</button> : <button className="btn btn-secondary" disabled={answeredCount < questions.length} onClick={() => finishExam(score)}>Selesai & Kunci Jawaban ({score}/{questions.length})</button>}</div></div>
    {examMode === "pre" && user.onboardingIntent === "student" && <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate("student-dashboard")}>Lewati pre-test (demo) →</button>}
  </div>;
}
