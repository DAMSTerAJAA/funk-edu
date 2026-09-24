// ============================================================
// FUNK EDU — Screen 06: Laporan Kompetensi & Sertifikasi
// ============================================================
import { useMemo } from "react";
import { useStore } from "../store";
import { BADGES } from "../data/content";
import RadarChart from "../components/RadarChart";

function hashString(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

export default function CertificateScreen() {
  const { user, assessment, navigate } = useStore();
  const pre = assessment.pretestScore ?? 0;
  const post = assessment.posttestScore ?? 0;
  const delta = post - pre;
  const grade = post >= 9 ? "A+" : post >= 8 ? "A" : post >= 7 ? "B+" : "B";

  const credential = useMemo(() => {
    const id = `FE-ABX-2026-${String(8000 + ((user.name.length * 37 + post * 13) % 1999)).padStart(4, "0")}`;
    const hash = hashString(id + user.name + post) + hashString(user.name + id).slice(0, 4);
    return { id, hash };
  }, [user.name, post]);

  const domainScores = [
    Math.min(98, pre * 7 + (assessment.completedMissions.includes(1) ? 35 : 10)),
    Math.min(98, pre * 7 + (assessment.completedMissions.includes(2) ? 38 : 10)),
    Math.min(98, pre * 6 + (assessment.completedMissions.includes(4) ? 45 : 12)),
    Math.min(98, pre * 7 + (assessment.completedMissions.includes(3) ? 36 : 10)),
    Math.min(98, pre * 6 + (assessment.completedMissions.includes(5) ? 40 : 12)),
  ];

  return (
    <div className="anim-in" style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* ---------- Scorecard ---------- */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="label">OVERALL SCORE</div>
          <RadialScore value={Math.round((post / 10) * 100)} grade={grade} />
          <div className="mono" style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
            Post-test: <strong style={{ color: "var(--secondary)" }}>{post}/10</strong> • Pre-test: {pre}/10
          </div>
          <div className={`tag ${delta >= 0 ? "tag-mint" : "tag-red"}`} style={{ marginTop: 8 }}>
            Δ {delta >= 0 ? "+" : ""}{delta} peningkatan
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <RadarChart labels={["Diagnosis", "MOA", "PK/PD", "Spektrum", "Resistensi"]} values={domainScores} size={220} />
          <div style={{ flex: 1 }}>
            <div className="label">DOMAIN MASTERY — 5 KOMPETENSI</div>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {["Diagnosis Infeksi", "Mekanisme Aksi", "PK/PD Optimization", "Spektrum & AWaRe", "Resistensi & Stewardship"].map((d, i) => (
                <div key={d}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{d}</span>
                    <span className="mono" style={{ fontWeight: 700, color: domainScores[i] >= 80 ? "var(--secondary)" : "var(--amber)" }}>{Math.round(domainScores[i])}%</span>
                  </div>
                  <div className="progress-track">
                    <div className={`progress-fill ${domainScores[i] >= 80 ? "mint" : "amber"}`} style={{ width: `${domainScores[i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Badges ---------- */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="label" style={{ marginBottom: 12 }}>HEXAGONAL BADGES GALLERY</div>
        <div style={{ display: "flex", gap: 18 }}>
          {BADGES.map((b) => {
            const owned = assessment.earnedBadges.includes(b.id);
            return (
              <div key={b.id} style={{ textAlign: "center", opacity: owned ? 1 : 0.35 }}>
                <svg viewBox="0 0 100 100" style={{ width: 86, height: 86 }}>
                  <polygon
                    points="50,4 92,27 92,73 50,96 8,73 8,27"
                    fill={owned ? "rgba(78,222,163,0.14)" : "var(--surface-low)"}
                    stroke={owned ? "#4edea3" : "#2b344d"}
                    strokeWidth="2.5"
                    style={owned ? { filter: "drop-shadow(0 0 8px rgba(78,222,163,0.5))" } : undefined}
                  />
                  <text x="50" y="58" textAnchor="middle" fontSize="26">{owned ? "🏅" : "🔒"}</text>
                </svg>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", maxWidth: 150 }}>{b.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- Certificate ---------- */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          border: "1px solid var(--primary-dim)",
          background: "linear-gradient(160deg, var(--surface-low) 0%, var(--surface-lowest) 100%)",
        }}
      >
        <div style={{ padding: "36px 44px", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, var(--primary), var(--secondary))" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="tag tag-cyan">CERTIFICATE OF COMPETENCY</div>
              <h2 style={{ fontSize: 30, marginTop: 12 }}>FUNK EDU — Antibiotic Stewardship Program</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Antibiotic Fundamentals Lab &amp; PK/PD Clinical Decision Simulator</p>
            </div>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: "linear-gradient(135deg, var(--primary), var(--secondary-container))", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "#04222a", boxShadow: "var(--glow-cyan)" }}>
              F
            </div>
          </div>

          <div style={{ margin: "28px 0", borderTop: "1px dashed var(--surface-highest)", borderBottom: "1px dashed var(--surface-highest)", padding: "22px 0", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Diberikan kepada</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 700, color: "var(--primary)", margin: "6px 0" }}>{user.name}</div>
            <div style={{ fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto" }}>
              atas keberhasilan menyelesaikan seluruh modul simulasi peresepan antimikroba rasional dengan post-test score{" "}
              <strong className="mono" style={{ color: "var(--secondary)" }}>{post}/10 ({Math.round((post / 10) * 100)}%)</strong> — Grade {grade}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            {/* QR validator (pseudo) */}
            <div style={{ textAlign: "center" }}>
              <svg viewBox="0 0 100 100" style={{ width: 92, height: 92, background: "#e2e8f5", borderRadius: 8, padding: 6 }}>
                {Array.from({ length: 49 }).map((_, i) => {
                  const x = (i % 7) * 13 + 4;
                  const y = Math.floor(i / 7) * 13 + 4;
                  const on = (parseInt(credential.hash[i % credential.hash.length], 16) + i) % 3 !== 0;
                  return on ? <rect key={i} x={x} y={y} width="10" height="10" fill="#040d24" /> : null;
                })}
              </svg>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 6 }}>QR VALIDATOR</div>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="mono" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                CREDENTIAL ID: <span style={{ color: "var(--primary)", fontWeight: 700 }}>{credential.id}</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 6, wordBreak: "break-all" }}>
                INTEGRITY HASH: {credential.hash} • PPRA KEMENKES 2026
              </div>
              <div style={{ marginTop: 14, fontSize: 13 }}>
                <div style={{ borderBottom: "1px solid var(--surface-highest)", width: 220, paddingBottom: 4, fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--text-secondary)" }}>
                  dr. S. Wijaya, Sp.PD-KPTI
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Chief Medical Officer — Digital Signature</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-primary" onClick={() => window.print()}>⬇ Export PDF</button>
              <button className="btn btn-ghost" onClick={() => navigate("dashboard")}>Kembali ke Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadialScore({ value, grade }: { value: number; grade: string }) {
  const R = 84;
  const C = 2 * Math.PI * R;
  const off = C - (value / 100) * C;
  return (
    <div style={{ position: "relative", width: 190, height: 190, margin: "14px auto 0" }}>
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--surface-highest)" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)", filter: "drop-shadow(0 0 8px rgba(78,222,163,0.5))" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#4edea3" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div>
          <div className="mono" style={{ fontSize: 38, fontWeight: 700 }}>{value}</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>/ 100</div>
          <div className="tag tag-mint" style={{ marginTop: 4, fontSize: 13 }}>{grade}</div>
        </div>
      </div>
    </div>
  );
}
