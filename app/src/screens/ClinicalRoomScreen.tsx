// ============================================================
// FUNK EDU — Clinical Decision Room: Perjalanan Pasien CAP D0–D7
// ============================================================
import { useState } from "react";
import { useStore } from "../store";
import { CAP_JOURNEY, ANTIBIOGRAM } from "../data/content";

export default function ClinicalRoomScreen() {
  const { addXP, setClinicalDone, navigate } = useStore();
  const [dayIdx, setDayIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showCXR, setShowCXR] = useState(false);

  const day = CAP_JOURNEY[dayIdx];
  const answered = answers[dayIdx];
  const decisionDays = CAP_JOURNEY.map((d, i) => (d.decision ? i : -1)).filter((i) => i >= 0);
  const allDecided = decisionDays.every((i) => answers[i]);
  const totalXP = CAP_JOURNEY.reduce((acc, d, i) => {
    const a = answers[i];
    if (!a || !d.decision) return acc;
    const opt = d.decision.options.find((o) => o.key === a);
    return acc + (opt?.xp ?? 0);
  }, 0);

  function decide(key: string) {
    if (answered || !day.decision) return;
    setAnswers((s) => ({ ...s, [dayIdx]: key }));
    const opt = day.decision.options.find((o) => o.key === key);
    if (opt) addXP(opt.xp);
  }

  function finish() {
    setClinicalDone();
    navigate("dashboard");
  }

  return (
    <div className="anim-in">
      {/* ---------- Horizontal stepper 8 hari ---------- */}
      <div className="card" style={{ marginBottom: 18, padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {CAP_JOURNEY.map((d, i) => {
            const hasDecision = !!d.decision;
            const a = answers[i];
            const opt = a && d.decision ? d.decision.options.find((o) => o.key === a) : null;
            const state = opt ? (opt.correct ? "good" : "bad") : i === dayIdx ? "current" : hasDecision ? "pending" : "plain";
            return (
              <button
                key={d.day}
                onClick={() => setDayIdx(i)}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${
                    state === "good" ? "var(--secondary)" : state === "bad" ? "var(--red)" : state === "current" ? "var(--primary)" : "var(--surface-highest)"
                  }`,
                  background:
                    state === "good" ? "var(--secondary-dim)" : state === "bad" ? "var(--red-dim)" : state === "current" ? "var(--primary-container)" : "var(--surface-low)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "var(--transition)",
                }}
              >
                <div className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{d.label}</div>
                <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 2 }}>
                  {hasDecision ? (opt ? (opt.correct ? "✓ keputusan" : "✗ keputusan") : "⚡ keputusan") : "observasi"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        {/* ---------- Narasi + keputusan ---------- */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 22 }}>{day.title}</h2>
              <span className="tag tag-cyan">CAP • CURB-65 = 2</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)", marginTop: 12 }}>{day.narrative}</p>

            {/* Vitals sensors */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 16 }}>
              {[
                { l: "HR", v: day.vitals.hr, warn: parseInt(day.vitals.hr) > 100 },
                { l: "TD", v: day.vitals.bp, warn: false },
                { l: "RR", v: day.vitals.rr, warn: parseInt(day.vitals.rr) >= 24 },
                { l: "SUHU", v: day.vitals.temp, warn: parseFloat(day.vitals.temp) >= 38 },
                { l: "SpO2", v: day.vitals.spo2, warn: parseInt(day.vitals.spo2) < 94 },
              ].map((s) => (
                <div key={s.l} className="card card-low" style={{ padding: 10, textAlign: "center", borderColor: s.warn ? "var(--amber)" : "var(--surface-highest)" }}>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: s.warn ? "var(--amber)" : "var(--secondary)" }}>{s.v}</div>
                  <div className="label" style={{ fontSize: 8.5 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision module */}
          {day.decision && (
            <div className="card" style={{ borderColor: answered ? "var(--surface-highest)" : "var(--amber)" }}>
              <div className="label" style={{ color: "var(--amber)", marginBottom: 8 }}>⚡ {day.day === 3 ? "ANTIBIOTIC TIME-OUT 48–72H" : "KEPUTUSAN KLINIS"}</div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{day.decision.prompt}</p>
              <div style={{ display: "grid", gap: 8 }}>
                {day.decision.options.map((o) => {
                  const picked = answered === o.key;
                  const revealed = !!answered;
                  return (
                    <div key={o.key}>
                      <button
                        className="btn"
                        disabled={revealed}
                        onClick={() => decide(o.key)}
                        style={{
                          width: "100%",
                          justifyContent: "flex-start",
                          textAlign: "left",
                          background: picked ? (o.correct ? "var(--secondary-container)" : "var(--red)") : revealed && o.correct ? "var(--secondary-dim)" : "var(--surface-high)",
                          border: revealed && o.correct ? "1px solid var(--secondary)" : "1px solid transparent",
                        }}
                      >
                        <span className="mono" style={{ fontWeight: 700, marginRight: 8 }}>{o.key}</span> {o.text}
                        {picked && <span style={{ marginLeft: "auto" }} className="mono">{o.xp > 0 ? `+${o.xp}` : o.xp} XP</span>}
                      </button>
                      {picked && (
                        <div className="anim-in" style={{ marginTop: 6, padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13, lineHeight: 1.65, background: o.correct ? "var(--secondary-dim)" : "var(--red-dim)", border: `1px solid ${o.correct ? "var(--secondary)" : "var(--red)"}` }}>
                          {o.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn btn-ghost" disabled={dayIdx === 0} onClick={() => setDayIdx(dayIdx - 1)}>← Hari sebelumnya</button>
            {dayIdx < CAP_JOURNEY.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setDayIdx(dayIdx + 1)}>Hari berikutnya →</button>
            ) : (
              <button className="btn btn-secondary" disabled={!allDecided} onClick={finish} title={allDecided ? "" : "Selesaikan semua keputusan"}>
                Selesaikan Kasus (total {totalXP} XP) ✓
              </button>
            )}
          </div>
        </div>

        {/* ---------- Panel kanan: CXR + antibiogram + radar ---------- */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="label">CHEST X-RAY VIEWER</div>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setShowCXR(!showCXR)}>
                {showCXR ? "zoom −" : "zoom +"}
              </button>
            </div>
            <svg viewBox="0 0 300 260" style={{ width: "100%", borderRadius: "var(--radius-sm)", background: "#050a18", transform: showCXR ? "scale(1.35) translateY(14px)" : "none", transition: "var(--transition)", transformOrigin: "center 60%" }}>
              {/* paru skematik */}
              <ellipse cx="105" cy="135" rx="62" ry="95" fill="#0d1830" stroke="#33415f" strokeWidth="2" />
              <ellipse cx="195" cy="135" rx="62" ry="95" fill="#0d1830" stroke="#33415f" strokeWidth="2" />
              <rect x="138" y="30" width="24" height="190" rx="10" fill="#101d38" />
              {/* infiltrat lobus kanan bawah (sisi kiri gambar) */}
              {dayIdx < 6 && (
                <ellipse cx="110" cy="195" rx="42" ry="30" fill="#8fa3c8" opacity={dayIdx < 2 ? 0.55 : dayIdx < 5 ? 0.35 : 0.2} style={{ filter: "blur(6px)" }} />
              )}
              <text x="150" y="250" textAnchor="middle" fontSize="9" fill="#5b6a8c" fontFamily="JetBrains Mono">
                {dayIdx < 2 ? "INFILTRAT LOBUS KANAN BAWAH (+)" : dayIdx < 6 ? "INFILTRAT MEMBAIK" : "RESOLUSI HAMPIR PENUH"}
              </text>
            </svg>
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>ANTIBIOGRAM — S. pneumoniae (CLSI)</div>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "var(--text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 4px", fontFamily: "var(--font-mono)", fontSize: 10 }}>AGEN</th>
                  <th style={{ textAlign: "right", padding: "6px 4px", fontFamily: "var(--font-mono)", fontSize: 10 }}>MIC</th>
                  <th style={{ textAlign: "right", padding: "6px 4px", fontFamily: "var(--font-mono)", fontSize: 10 }}>S/I/R</th>
                </tr>
              </thead>
              <tbody className="mono">
                {ANTIBIOGRAM.map((a) => (
                  <tr key={a.agent} style={{ borderTop: "1px solid var(--surface-highest)" }}>
                    <td style={{ padding: "6px 4px", fontFamily: "var(--font-body)" }}>{a.agent}</td>
                    <td style={{ textAlign: "right", padding: "6px 4px", fontSize: 11.5 }}>{a.mic}</td>
                    <td style={{ textAlign: "right", padding: "6px 4px" }}>
                      <span className={`tag ${a.sir === "S" ? "tag-mint" : "tag-red"}`} style={{ fontSize: 9 }}>{a.sir}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 8 }}>
              {dayIdx >= 3 ? "TERSEDIA SEJAK D3 — GUNAKAN UNTUK DE-ESKALASI" : "MENUNGGU HASIL KULTUR (±48–72 JAM)…"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
