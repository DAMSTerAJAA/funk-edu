// ============================================================
// FUNK EDU — Screen 02/05: Exam Suite (Pre-Test, Post-Test, Final Challenge)
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store";
import { PRETEST_QUESTIONS, POSTTEST_QUESTIONS } from "../data/content";
import type { Question } from "../types";

export default function ExamScreen() {
  const { examMode, examIndex, setExamIndex, assessment, answerQuestion, finishExam, navigate } = useStore();
  const isFinal = examMode === "final";
  const questions: Question[] = examMode === "pre" ? PRETEST_QUESTIONS : POSTTEST_QUESTIONS;
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showRationale, setShowRationale] = useState<number | null>(null);
  const [locked, setLocked] = useState<Record<number, string>>({});

  const q = questions[examIndex];
  const lockedAnswer = locked[q.id];

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  const score = useMemo(
    () =>
      questions.reduce(
        (acc, qq) => acc + ((locked[qq.id] ?? assessment.answersMap[qq.id - 1]) === qq.correct ? 1 : 0),
        0
      ),
    [locked, assessment.answersMap, questions]
  );

  function selectOption(key: string) {
    if (lockedAnswer) return;
    answerQuestion(q.id - 1, key);
    setLocked((l) => ({ ...l, [q.id]: key }));
    if (!isFinal) setShowRationale(q.id);
  }

  function handleFinish() {
    const final = questions.reduce((acc, qq) => acc + ((locked[qq.id] ?? assessment.answersMap[qq.id - 1]) === qq.correct ? 1 : 0), 0);
    finishExam(final);
  }

  return (
    <div className="anim-in" style={{ maxWidth: 1080, margin: "0 auto" }}>
      {/* ---------- Header timer ---------- */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20, padding: "16px 24px" }}>
        <div style={{ flex: 1 }}>
          <div className="label">{isFinal ? "FINAL COMPREHENSIVE CHALLENGE — ICU SEPSIS" : examMode === "pre" ? "PRE-TEST DIAGNOSTIC BASELINE" : "POST-TEST EVALUATION"}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>
            {isFinal ? "Kasus Sepsis Nosokomial — Tanpa Hint" : "10 Soal Vignette Klinis Terintegrasi"}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            className="mono"
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: timeLeft < 300 ? "var(--danger)" : "var(--amber)",
              animation: timeLeft < 300 ? "pulseGlow 1.2s infinite" : undefined,
              borderRadius: 8,
              padding: "0 8px",
            }}
          >
            {mm}:{ss}
          </div>
          <div className="label" style={{ fontSize: 9 }}>SESSION LOCK</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>
            {Object.keys(locked).length}/{questions.length}
          </div>
          <div className="label" style={{ fontSize: 9 }}>ANSWERED</div>
        </div>
      </div>

      {/* ---------- Segmented progress ---------- */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {questions.map((qq, i) => {
          const a = locked[qq.id];
          const isCurrent = i === examIndex;
          return (
            <button
              key={qq.id}
              onClick={() => setExamIndex(i)}
              style={{
                flex: 1,
                height: 26,
                borderRadius: 6,
                border: `1px solid ${isCurrent ? "var(--primary)" : "var(--surface-highest)"}`,
                background: a
                  ? a === qq.correct
                    ? "var(--secondary-container)"
                    : "var(--red)"
                  : isCurrent
                    ? "var(--primary-container)"
                    : "var(--surface-low)",
                color: a || isCurrent ? "#fff" : "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                transition: "var(--transition)",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* ---------- Question card ---------- */}
      <div className="card anim-in" key={q.id}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <span className="tag tag-cyan">{q.domain}</span>
          <span className="tag tag-gray">SOAL {examIndex + 1} / {questions.length}</span>
        </div>

        <div
          style={{
            background: "var(--surface-low)",
            borderLeft: "3px solid var(--primary-dim)",
            borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
            padding: "14px 18px",
            fontSize: 14.5,
            color: "var(--text-secondary)",
            marginBottom: 16,
            lineHeight: 1.7,
          }}
        >
          🩺 <strong style={{ color: "var(--text-primary)" }}>Vignette:</strong> {q.vignette}
        </div>

        <h3 style={{ fontSize: 18, marginBottom: 18 }}>{q.question}</h3>

        <div style={{ display: "grid", gap: 10 }}>
          {q.options.map((opt) => {
            const selected = lockedAnswer === opt.key;
            const isCorrect = lockedAnswer && opt.key === q.correct;
            const isWrongPick = selected && opt.key !== q.correct;
            return (
              <button
                key={opt.key}
                onClick={() => selectOption(opt.key)}
                disabled={!!lockedAnswer}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "13px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${
                    isCorrect ? "var(--secondary)" : isWrongPick ? "var(--red)" : selected ? "var(--primary)" : "var(--surface-highest)"
                  }`,
                  background: isCorrect ? "var(--secondary-dim)" : isWrongPick ? "var(--red-dim)" : "var(--surface-low)",
                  color: "var(--text-primary)",
                  cursor: lockedAnswer ? "default" : "pointer",
                  textAlign: "left",
                  fontSize: 14,
                  transition: "var(--transition)",
                }}
              >
                <span
                  className="mono"
                  style={{
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 6,
                    background: isCorrect ? "var(--secondary-container)" : isWrongPick ? "var(--red)" : "var(--surface-high)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {opt.key}
                </span>
                <span style={{ paddingTop: 3 }}>{opt.text}</span>
                {isCorrect && <span style={{ marginLeft: "auto", color: "var(--secondary)" }}>✓</span>}
                {isWrongPick && <span style={{ marginLeft: "auto", color: "var(--danger)" }}>✗</span>}
              </button>
            );
          })}
        </div>

        {/* ---------- Rationale drawer ---------- */}
        {showRationale === q.id && !isFinal && (
          <div
            className="anim-in"
            style={{
              marginTop: 16,
              padding: "14px 18px",
              borderRadius: "var(--radius-sm)",
              background: lockedAnswer === q.correct ? "var(--secondary-dim)" : "var(--amber-dim)",
              border: `1px solid ${lockedAnswer === q.correct ? "var(--secondary)" : "var(--amber)"}`,
              fontSize: 13.5,
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: lockedAnswer === q.correct ? "var(--secondary)" : "var(--amber)" }}>
              {lockedAnswer === q.correct ? "✓ BENAR — " : "✗ KURANG TEPAT — "}Rasional Klinis:
            </strong>{" "}
            {q.rationale}
          </div>
        )}
        {isFinal && lockedAnswer && (
          <div className="mono" style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)" }}>
            Jawaban terkunci. Hint dinonaktifkan pada mode ujian mandiri.
          </div>
        )}

        {/* ---------- Nav buttons ---------- */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button className="btn btn-ghost" disabled={examIndex === 0} onClick={() => setExamIndex(examIndex - 1)}>
            ← Sebelumnya
          </button>
          {examIndex < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setExamIndex(examIndex + 1)}>
              Berikutnya →
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              disabled={Object.keys(locked).length < questions.length}
              onClick={handleFinish}
              title={Object.keys(locked).length < questions.length ? "Jawab semua soal dulu" : ""}
            >
              Selesai &amp; Kunci Jawaban (skor sementara: {score})
            </button>
          )}
        </div>
      </div>

      {examMode === "pre" && (
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate("dashboard")}>
          Lewati pre-test (demo) →
        </button>
      )}
    </div>
  );
}
