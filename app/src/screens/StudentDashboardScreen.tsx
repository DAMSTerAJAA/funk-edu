// ============================================================
// FUNK EDU — Screen 03: Dashboard Lab Fundamentals & Missions
// ============================================================
import { useStore } from "../store";
import { BADGES } from "../data/content";
import RadarChart from "../components/RadarChart";

const MISSIONS = [
  { id: 1, name: "Infection Detective", desc: "Centor Score & diferensiasi viral vs bakteri", icon: "🔍", xp: 100, color: "var(--primary)" },
  { id: 2, name: "Target Hunter", desc: "Peta mekanisme aksi seluler bakteri", icon: "🎯", xp: 120, color: "var(--secondary)" },
  { id: 3, name: "Spectrum Strategy", desc: "WHO AWaRe & perlindungan mikrobioma usus", icon: "🛡️", xp: 120, color: "var(--amber)" },
  { id: 4, name: "MIC Battle Lab", desc: "Kinetika %fT vs Cmax di PK/PD Workbench", icon: "📈", xp: 150, color: "var(--primary)" },
  { id: 5, name: "Resistance Evolution", desc: "Seleksi klon mutan & mutant selection window", icon: "🧫", xp: 140, color: "var(--danger)" },
  { id: 6, name: "Wise Guardian", desc: "Audit resep EMR berbasis 5 Benar", icon: "⚖️", xp: 130, color: "var(--secondary)" },
];

export default function StudentDashboardScreen() {
  const { studentAssessment: assessment, user, navigate, setMission, setExam, beginProfessionalUpgrade } = useStore();
  const pre = assessment.pretestScore;
  const baseline = [40, 35, 30, 45, 38];
  const current = [
    Math.min(95, (pre ?? 4) * 8 + (assessment.completedMissions.includes(1) ? 30 : 0)),
    Math.min(95, (pre ?? 4) * 7 + (assessment.completedMissions.includes(2) ? 35 : 0)),
    Math.min(95, (pre ?? 4) * 7 + (assessment.completedMissions.includes(4) ? 40 : 0)),
    Math.min(95, (pre ?? 4) * 8 + (assessment.completedMissions.includes(3) ? 30 : 0)),
    Math.min(95, (pre ?? 4) * 7 + (assessment.completedMissions.includes(5) || assessment.completedMissions.includes(6) ? 35 : 0)),
  ];

  const allMissionsDone = assessment.completedMissions.length >= 6;

  return (
    <div className="anim-in">
      {/* ---------- Welcome row ---------- */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <RadarChart labels={["Diagnosis", "MOA", "PK/PD", "Spektrum", "Resistensi"]} values={current} compare={baseline} size={230} />
          <div style={{ flex: 1 }}>
            <div className="label">DIAGNOSTIC BASELINE RADAR — 5 DOMAIN</div>
            <h2 style={{ fontSize: 26, margin: "6px 0" }}>
              Selamat datang, <span style={{ color: "var(--primary)" }}>{user.name}</span>
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Pre-test: <strong className="mono" style={{ color: "var(--amber)" }}>{pre !== null ? `${pre}/10` : "—"}</strong>
              {" • "}Garis kuning putus-putus = baseline awal; area cyan = kompetensi saat ini. Selesaikan 6 misi untuk membuka Decision Room.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {BADGES.map((b) => {
                const owned = assessment.earnedBadges.includes(b.id);
                return (
                  <span key={b.id} title={b.desc} className={`tag ${owned ? "tag-mint" : "tag-gray"}`} style={{ opacity: owned ? 1 : 0.5 }}>
                    {owned ? "⬢" : "⬡"} {b.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* XP / rank card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="label">STEWARD PROGRESSION</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="mono" style={{ fontSize: 34, fontWeight: 700, color: "var(--primary)" }}>{user.xp.toLocaleString()}</span>
            <span className="tag tag-cyan">{user.rank}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.min(100, (user.xp / 2500) * 100)}%` }} />
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {Math.min(100, Math.round((user.xp / 2500) * 100))}% menuju CHIEF STEWARD
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
            <div className="card card-low" style={{ padding: 12, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{user.coins}</div>
              <div className="label" style={{ fontSize: 9 }}>LAB COINS</div>
            </div>
            <div className="card card-low" style={{ padding: 12, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--secondary)" }}>{user.streakDays}d</div>
              <div className="label" style={{ fontSize: 9 }}>STREAK</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 24, borderColor: user.professionalVerification.status === "verified" ? "var(--secondary)" : "var(--amber)", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
        <div>
          <span className={`tag ${user.professionalVerification.status === "pending" ? "tag-amber" : user.professionalVerification.status === "rejected" || user.professionalVerification.status === "unavailable" ? "tag-red" : user.professionalVerification.status === "verified" ? "tag-mint" : "tag-cyan"}`}>PROFESSIONAL TRACK</span>
          <h3 style={{ marginTop: 10 }}>Upgrade to Professional</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 5 }}>Preserve fundamentals progress. Professional clinical baseline and modules start separately after verification.</p>
        </div>
        <button className="btn btn-secondary" onClick={beginProfessionalUpgrade}>{user.professionalVerification.status === "pending" ? "View pending status" : user.professionalVerification.status === "rejected" || user.professionalVerification.status === "unavailable" ? "Fix verification data" : user.professionalVerification.status === "verified" ? "Professional verified" : "Start verification"}</button>
      </div>

      {/* ---------- Mission grid ---------- */}
      <div className="label" style={{ marginBottom: 12 }}>MODULAR LEVEL PROGRESSION — 6 MISI</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {MISSIONS.map((m) => {
          const done = assessment.completedMissions.includes(m.id);
          const unlocked = assessment.unlockedMissions.includes(m.id);
          return (
            <div
              key={m.id}
              className="card anim-in"
              style={{
                position: "relative",
                borderColor: done ? "var(--secondary)" : unlocked ? "var(--surface-highest)" : "var(--surface-low)",
                opacity: unlocked ? 1 : 0.45,
                cursor: unlocked ? "pointer" : "not-allowed",
                transition: "var(--transition)",
              }}
              onClick={() => {
                if (!unlocked) return;
                setMission(m.id);
                navigate(m.id === 4 ? "workbench" : "mission");
              }}
              onMouseEnter={(e) => unlocked && (e.currentTarget.style.borderColor = m.color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = done ? "var(--secondary)" : "var(--surface-highest)")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 30 }}>{m.icon}</span>
                {done ? <span className="tag tag-mint">✓ SELESAI</span> : unlocked ? <span className="tag tag-cyan">TERBUKA</span> : <span className="tag tag-gray">🔒 TERKUNCI</span>}
              </div>
              <h3 style={{ fontSize: 18, margin: "12px 0 4px" }}>
                <span className="mono" style={{ color: m.color, fontSize: 13 }}>0{m.id}</span> {m.name}
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", minHeight: 38 }}>{m.desc}</p>
              <div className="mono" style={{ fontSize: 11, color: "var(--amber)", marginTop: 8 }}>+{m.xp} XP</div>
            </div>
          );
        })}
      </div>

      {/* ---------- Advanced modules ---------- */}
      <div className="label" style={{ marginBottom: 12 }}>MODUL LANJUTAN</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div className="card" style={{ borderColor: "var(--primary-dim)" }}>
          <h3 style={{ fontSize: 17 }}>🧪 PK/PD Workbench</h3>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "8px 0 14px" }}>
            Eksperimen bebas: 5 agen, slider dosis, extended infusion, kurva plasma 48 jam real-time.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("workbench")}>Buka Simulator →</button>
        </div>
        <div className="card" style={{ borderColor: allMissionsDone ? "var(--secondary)" : "var(--surface-highest)", opacity: allMissionsDone ? 1 : 0.5 }}>
          <h3 style={{ fontSize: 17 }}>🏥 Clinical Decision Room</h3>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "8px 0 14px" }}>
            Kasus CAP 8 hari: empiris → antibiogram → time-out 48–72h → de-eskalasi IV→oral.
          </p>
          <button className="btn btn-secondary" disabled={!allMissionsDone} onClick={() => navigate("clinical-room")}>
            {allMissionsDone ? "Masuk Ruangan →" : "🔒 Selesaikan 6 misi dulu"}
          </button>
        </div>
        <div className="card" style={{ borderColor: assessment.clinicalRoomDone ? "var(--amber)" : "var(--surface-highest)", opacity: assessment.clinicalRoomDone ? 1 : 0.5 }}>
          <h3 style={{ fontSize: 17 }}>⚡ Final Challenge + Post-Test</h3>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "8px 0 14px" }}>
            Sepsis nosokomial ICU tanpa hint, lalu 10 soal post-test. Passing grade ≥ 80%.
          </p>
          <button
            className="btn btn-danger"
            disabled={!assessment.clinicalRoomDone}
            onClick={() => {
              setExam("post");
              navigate("posttest");
            }}
          >
            {assessment.clinicalRoomDone ? "Mulai Ujian →" : "🔒 Decision Room dulu"}
          </button>
        </div>
      </div>
    </div>
  );
}
