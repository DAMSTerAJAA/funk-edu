// ============================================================
// FUNK EDU — App Shell: Persistent Header HUD + Footer
// ============================================================
import type { ReactNode } from "react";
import { useStore, type Route, type Store } from "../store";

const NAV: { route: Route; label: string; locked?: (s: Store) => boolean }[] = [
  { route: "dashboard", label: "Lab Dashboard" },
  { route: "mission", label: "Missions" },
  { route: "workbench", label: "PK/PD Workbench" },
  { route: "clinical-room", label: "Decision Room", locked: (s) => s.assessment.completedMissions.length < 6 },
  { route: "certificate", label: "Certification", locked: (s) => !s.assessment.posttestDone || (s.assessment.posttestScore ?? 0) < 8 },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { route, navigate, user, assessment, reset } = useStore();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ---------- Persistent Header HUD ---------- */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(4,13,36,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--surface-highest)",
          padding: "0 28px",
        }}
      >
        <div style={{ maxWidth: 1480, margin: "0 auto", display: "flex", alignItems: "center", gap: 28, height: 64 }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("dashboard")}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--primary), var(--secondary-container))",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "#04222a",
                fontSize: 18,
                boxShadow: "var(--glow-cyan)",
              }}
            >
              F
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "0.06em" }}>
                FUNK <span style={{ color: "var(--primary)" }}>EDU</span>
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.14em" }}>
                ANTIBIOTIC FUNDAMENTALS LAB
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 4, flex: 1 }}>
            {NAV.map((n) => {
              const locked = n.locked?.(useStore.getState()) ?? false;
              const active = route === n.route;
              return (
                <button
                  key={n.route}
                  className="btn btn-ghost"
                  disabled={locked}
                  onClick={() => navigate(n.route)}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    borderColor: active ? "var(--primary)" : "transparent",
                    color: locked ? "var(--text-muted)" : active ? "var(--primary)" : "var(--text-secondary)",
                    background: active ? "var(--primary-container)" : "transparent",
                  }}
                >
                  {locked ? "🔒 " : ""}
                  {n.label}
                </button>
              );
            })}
          </nav>

          {/* Gamification telemetry */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <HUDMetric label="XP" value={user.xp.toLocaleString()} color="var(--primary)" pulse />
            <HUDMetric label="COINS" value={user.coins.toString()} color="var(--amber)" />
            <HUDMetric label="STREAK" value={`${user.streakDays}d`} color="var(--secondary)" />
            <div style={{ textAlign: "right" }}>
              <div className="tag tag-cyan">{user.rank}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{user.name || "Guest"}</div>
            </div>
            <div
              title={`${user.role} — klik untuk logout`}
              onClick={reset}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--surface-high)",
                border: "2px solid var(--primary-dim)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--primary)",
                cursor: "pointer",
              }}
            >
              {user.name ? user.name.replace(/^dr\.\s*/i, "").slice(0, 1).toUpperCase() : "?"}
            </div>
          </div>
        </div>

        {/* mission progress strip */}
        <div style={{ maxWidth: 1480, margin: "0 auto", display: "flex", gap: 6, paddingBottom: 8 }}>
          {[1, 2, 3, 4, 5, 6].map((m) => (
            <div
              key={m}
              title={`Misi ${m}`}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: assessment.completedMissions.includes(m)
                  ? "var(--secondary)"
                  : assessment.unlockedMissions.includes(m)
                    ? "var(--primary-dim)"
                    : "var(--surface-highest)",
                boxShadow: assessment.completedMissions.includes(m) ? "0 0 6px rgba(78,222,163,0.6)" : "none",
                transition: "var(--transition)",
              }}
            />
          ))}
          <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 8, alignSelf: "center" }}>
            {assessment.completedMissions.length}/6 MISSIONS
          </span>
        </div>
      </header>

      {/* ---------- Main ---------- */}
      <main style={{ flex: 1, maxWidth: 1480, width: "100%", margin: "0 auto", padding: "28px 28px 48px" }}>{children}</main>

      {/* ---------- Persistent Lab Footer ---------- */}
      <footer
        style={{
          borderTop: "1px solid var(--surface-highest)",
          background: "var(--surface-lowest)",
          padding: "10px 28px",
        }}
      >
        <div
          className="mono"
          style={{ maxWidth: 1480, margin: "0 auto", display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-muted)", letterSpacing: "0.08em" }}
        >
          <span>
            SYSTEM PROTOCOL: <span style={{ color: "var(--secondary)" }}>WHO AWaRe v4.8 VERIFIED</span> • IDSA/ATS 2019 • EUCAST v14
          </span>
          <span>
            TELEMETRY: <span style={{ color: "var(--primary)" }}>NOMINAL • 60 FPS</span> • PPRA KEMENKES 2026
          </span>
        </div>
      </footer>
    </div>
  );
}

function HUDMetric({ label, value, color, pulse }: { label: string; value: string; color: string; pulse?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ fontSize: 16, fontWeight: 700, color, animation: pulse ? "pulseGlow 2.4s infinite" : undefined, borderRadius: 6 }}>
        {value}
      </div>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
    </div>
  );
}
