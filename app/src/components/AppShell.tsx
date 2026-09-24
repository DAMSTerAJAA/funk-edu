import type { ReactNode } from "react";
import { PERSONAS } from "../data/personas";
import { ROUTES, type Route } from "../routes";
import { useStore } from "../store";

const STUDENT_NAV: Route[] = ["student-dashboard", "mission", "workbench", "clinical-room", "certificate"];
const PROFESSIONAL_NAV: Route[] = ["professional-dashboard", "professional-baseline", "workbench", "clinical-room", "certificate"];

export default function AppShell({ children }: { children: ReactNode }) {
  const { route, navigate, user, studentAssessment, professionalAssessment } = useStore();
  const professional = user.experience === "professional" && user.professionalVerification.status === "verified";
  const nav = professional ? PROFESSIONAL_NAV : STUDENT_NAV;
  const role = user.professionalVerification.verifiedRole;
  const audience = professional && role ? PERSONAS[role].label : "STUDENT";
  const verification = user.professionalVerification.status;

  function locked(target: Route) {
    if (professional && !professionalAssessment.baselineDone && ["workbench", "clinical-room", "certificate"].includes(target)) return true;
    if (!professional && target === "clinical-room") return studentAssessment.completedMissions.length < 6;
    if (!professional && target === "certificate") return !studentAssessment.posttestDone || (studentAssessment.posttestScore ?? 0) < 8;
    if (professional && target === "certificate") return !professionalAssessment.professionalCertificateUnlocked;
    return false;
  }

  return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(4,13,36,0.96)", borderBottom: "1px solid var(--surface-highest)", backdropFilter: "blur(14px)" }}>
      <div style={{ maxWidth: 1480, margin: "0 auto", display: "flex", alignItems: "center", gap: 22, height: 68, padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate(professional ? "professional-dashboard" : "student-dashboard")}><div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--secondary-container))", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, color: "#04222a", fontSize: 18 }}>F</div><div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>FUNK <span style={{ color: "var(--primary)" }}>EDU</span></div><div className="mono" style={{ fontSize: 9, color: "var(--text-muted)" }}>{professional ? "PROFESSIONAL TRACK" : "STUDENT FUNDAMENTALS"}</div></div></div>
        <nav style={{ display: "flex", gap: 3, flex: 1 }}>{nav.filter((target) => ROUTES[target].shellVisible).map((target) => { const disabled = locked(target); return <button key={target} className="btn btn-ghost" disabled={disabled} onClick={() => navigate(target)} style={{ padding: "8px 11px", fontSize: 12, borderColor: route === target ? "var(--primary)" : "transparent", color: route === target ? "var(--primary)" : undefined }}>{disabled ? "🔒 " : ""}{ROUTES[target].label}</button>; })}</nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ textAlign: "right" }}><div><span className={`tag ${professional ? "tag-mint" : "tag-cyan"}`}>{audience}</span> <span className={`tag ${verification === "verified" ? "tag-mint" : verification === "pending" || verification === "submitting" ? "tag-amber" : verification === "rejected" || verification === "unavailable" ? "tag-red" : "tag-gray"}`}>{verification.replace("_", " ").toUpperCase()}</span></div><div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{user.name}</div></div><button className="btn btn-ghost" title="Open profile" onClick={() => navigate("profile")} style={{ width: 40, height: 40, borderRadius: "50%", padding: 0 }}>{user.name.replace(/^dr\.\s*/i, "").slice(0, 1).toUpperCase()}</button></div>
      </div>
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 24px 8px", display: "flex", gap: 6 }}>{professional ? [professionalAssessment.baselineDone, professionalAssessment.workbenchDone, professionalAssessment.clinicalRoomDone, professionalAssessment.prescriptionAuditDone, professionalAssessment.professionalCertificateUnlocked].map((done, index) => <div key={index} style={{ flex: 1, height: 4, borderRadius: 2, background: done ? "var(--secondary)" : "var(--surface-highest)" }} />) : [1,2,3,4,5,6].map((mission) => <div key={mission} style={{ flex: 1, height: 4, borderRadius: 2, background: studentAssessment.completedMissions.includes(mission) ? "var(--secondary)" : studentAssessment.unlockedMissions.includes(mission) ? "var(--primary-dim)" : "var(--surface-highest)" }} />)}</div>
    </header>
    <main style={{ flex: 1, maxWidth: 1480, width: "100%", margin: "0 auto", padding: "28px 28px 48px" }}>{children}</main>
    <footer style={{ borderTop: "1px solid var(--surface-highest)", background: "var(--surface-lowest)", padding: "10px 28px" }}><div className="mono" style={{ maxWidth: 1480, margin: "0 auto", display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}><span>EDUCATIONAL PROTOTYPE • MEDICAL CONTENT USES DUMMY DATA</span><span>VERIFICATION SIMULATION • NOT KKI/SATUSEHAT VALIDATION</span></div></footer>
  </div>;
}
