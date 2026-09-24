// ============================================================
// FUNK EDU — Misi 6: Wise Guardian (Audit 5T EMR)
// ============================================================
import { useState } from "react";
import { useStore } from "../../store";
import { AUDIT_CASES } from "../../data/content";

const FIVE_R = [
  { id: "patient", label: "Right Patient", desc: "Indikasi infeksi bakteri terkonfirmasi/dugaan kuat" },
  { id: "drug", label: "Right Drug", desc: "Agen tersempit efektif sesuai antibiogram/AWaRe" },
  { id: "dose", label: "Right Dose", desc: "Dosis & penyesuaian organ (ginjal/hati) tepat" },
  { id: "route", label: "Right Route", desc: "Switch IV→oral segera bila memenuhi kriteria" },
  { id: "duration", label: "Right Duration", desc: "Durasi minimal efektif sesuai pedoman" },
];

export default function Mission6() {
  const { completeMission, addXP } = useStore();
  const [checks, setChecks] = useState<string[]>([]);
  const [verdicts, setVerdicts] = useState<Record<string, string>>({});

  const allAudited = Object.keys(verdicts).length === AUDIT_CASES.length;
  const correctCount = AUDIT_CASES.filter((c) => verdicts[c.id] === c.status).length;

  function toggleCheck(id: string) {
    setChecks((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function judge(caseId: string, verdict: string) {
    const next = { ...verdicts, [caseId]: verdict };
    setVerdicts(next);
    if (Object.keys(next).length === AUDIT_CASES.length) {
      const cc = AUDIT_CASES.filter((c) => next[c.id] === c.status).length;
      if (cc === AUDIT_CASES.length) {
        addXP(50);
        completeMission(6, 130);
      }
    }
  }

  return (
    <div className="anim-in">
      <div className="card" style={{ marginBottom: 20 }}>
        <span className="tag tag-mint">MISI 06 — WISE GUARDIAN</span>
        <h2 style={{ fontSize: 24, margin: "12px 0 6px" }}>Audit Preskripsi EMR — Prinsip 5 Benar</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 900 }}>
          Tinjau 3 resep dari rekam medis elektronik bangsal. Terapkan checklist 5 Benar lalu berikan verdict audit.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>
        {/* 5R checklist */}
        <div className="card" style={{ alignSelf: "start" }}>
          <div className="label" style={{ marginBottom: 12 }}>FIVE RIGHTS CHECKLIST</div>
          <div style={{ display: "grid", gap: 8 }}>
            {FIVE_R.map((r) => {
              const on = checks.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleCheck(r.id)}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${on ? "var(--secondary)" : "var(--surface-highest)"}`,
                    background: on ? "var(--secondary-dim)" : "var(--surface-low)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "var(--transition)",
                  }}
                >
                  <span className="mono" style={{ color: on ? "var(--secondary)" : "var(--text-muted)", fontWeight: 700 }}>{on ? "✓" : "○"}</span>
                  <span>
                    <span style={{ display: "block", fontWeight: 600, fontSize: 13.5 }}>{r.label}</span>
                    <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)" }}>{r.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mono" style={{ marginTop: 14, fontSize: 11, color: "var(--text-muted)" }}>
            {checks.length}/5 PRINSIP DITINJAU
          </div>
        </div>

        {/* Audit cases */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {AUDIT_CASES.map((c) => {
            const v = verdicts[c.id];
            const correct = v === c.status;
            return (
              <div key={c.id} className="card" style={{ borderColor: v ? (correct ? "var(--secondary)" : "var(--red)") : "var(--surface-highest)" }}>
                <h3 style={{ fontSize: 16 }}>{c.title}</h3>
                <div className="card card-low mono" style={{ margin: "10px 0", padding: "12px 16px", fontSize: 12.5, color: "var(--amber)", lineHeight: 1.7 }}>
                  ℞ {c.prescription}
                </div>
                <ul style={{ fontSize: 12.5, color: "var(--text-secondary)", paddingLeft: 18, display: "grid", gap: 4 }}>
                  {c.issues.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  {[
                    { key: "correct", label: "✓ Tepat", cls: "btn-secondary" },
                    { key: "watch", label: "⚠ Perlu Konfirmasi", cls: "btn" },
                    { key: "violation", label: "✗ Pelanggaran", cls: "btn-danger" },
                  ].map((o) => (
                    <button key={o.key} className={`btn ${o.cls}`} onClick={() => judge(c.id, o.key)} disabled={!!v}>
                      {o.label}
                    </button>
                  ))}
                  {v && (
                    <span className="anim-in" style={{ fontSize: 13, alignSelf: "center", color: correct ? "var(--secondary)" : "var(--danger)" }}>
                      {correct ? `Benar: ${c.verdict}` : `Kurang tepat — seharusnya: ${c.verdict}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {allAudited && (
            <div
              className="card anim-in"
              style={{
                borderColor: correctCount === 3 ? "var(--secondary)" : "var(--amber)",
                background: correctCount === 3 ? "var(--secondary-dim)" : "var(--amber-dim)",
              }}
            >
              <strong style={{ fontSize: 15 }}>
                Audit selesai: {correctCount}/3 verdict tepat.
              </strong>
              {correctCount === 3 ? (
                <div className="mono" style={{ color: "var(--secondary)", fontWeight: 700, marginTop: 6 }}>+130 XP • MISI 6 SELESAI ✓ — SEMUA MISI TUNTAS, DECISION ROOM TERBUKA!</div>
              ) : (
                <div style={{ fontSize: 13, marginTop: 6, color: "var(--text-secondary)" }}>Muat ulang halaman misi untuk mencoba lagi hingga 3/3 tepat.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
