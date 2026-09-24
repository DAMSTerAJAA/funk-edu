import { PERSONAS } from "../data/personas";
import { useStore } from "../store";
import RadarChart from "../components/RadarChart";

export default function ProfessionalDashboardScreen() {
  const { user, studentAssessment, professionalAssessment, navigate, setExam } = useStore();
  const role = user.professionalVerification.verifiedRole;
  const persona = role ? PERSONAS[role] : null;
  const modulesDone = professionalAssessment.workbenchDone && professionalAssessment.clinicalRoomDone && professionalAssessment.prescriptionAuditDone;
  const fundamentals = [
    Math.min(98, (studentAssessment.pretestScore ?? 0) * 8 + studentAssessment.completedMissions.length * 4),
    Math.min(98, 30 + studentAssessment.completedMissions.length * 8),
    Math.min(98, 25 + studentAssessment.completedMissions.length * 9),
    Math.min(98, 35 + studentAssessment.earnedBadges.length * 12),
    Math.min(98, 30 + studentAssessment.completedMissions.length * 7),
  ];
  const modules = [
    { title: "PK/PD Workbench", done: professionalAssessment.workbenchDone, route: "workbench" as const, description: "Complete one optimal PK/PD challenge." },
    { title: "Clinical Decision Room", done: professionalAssessment.clinicalRoomDone, route: "clinical-room" as const, description: "Complete the CAP decision journey." },
    { title: "Prescription Audit", done: professionalAssessment.prescriptionAuditDone, route: "professional-audit" as const, description: "Audit all three prescriptions correctly." },
  ];

  return <div className="anim-in">
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 24 }}>
      <div className="card" style={{ display: "flex", gap: 22, alignItems: "center" }}><RadarChart labels={["Diagnosis", "MOA", "PK/PD", "Spectrum", "Stewardship"]} values={fundamentals} size={220} /><div><span className="tag tag-mint">VERIFIED PROFESSIONAL</span><h2 style={{ margin: "10px 0 6px" }}>{persona?.icon} {persona?.label}</h2><p style={{ color: "var(--text-secondary)", fontSize: 13.5 }}>Welcome, {user.professionalVerification.verifiedName}. Complete a fresh clinical baseline and professional modules; Student evidence is historical only.</p></div></div>
      <div className="card"><div className="label">FUNDAMENTALS CARRIED FORWARD</div><div className="mono" style={{ fontSize: 32, color: "var(--primary)", marginTop: 10 }}>{studentAssessment.completedMissions.length}/6</div><p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 8 }}>Student missions retained. They do not satisfy Professional baseline, module, post-test, leaderboard, or certificate gates.</p></div>
    </div>

    <div className="label" style={{ marginBottom: 12 }}>PROFESSIONAL CLINICAL PROGRESSION</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      <ModuleCard title="Professional Clinical Baseline" description="Six-question prototype baseline. Completion unlocks Professional modules." done={professionalAssessment.baselineDone} action={professionalAssessment.baselineDone ? "Baseline complete" : "Start baseline"} onClick={() => { setExam("professional-baseline"); navigate("professional-baseline"); }} />
      {modules.map((module) => <ModuleCard key={module.title} title={module.title} description={module.description} done={module.done} locked={!professionalAssessment.baselineDone} action={module.done ? "Complete" : "Open module"} onClick={() => navigate(module.route)} />)}
      <ModuleCard title="Professional Post-Test & Certificate" description="Requires Workbench, Decision Room, and Prescription Audit. Passing grade ≥ 8/10." done={professionalAssessment.professionalCertificateUnlocked} locked={!modulesDone} action={professionalAssessment.professionalCertificateUnlocked ? "View certificate" : modulesDone ? "Start post-test" : "Complete three modules"} onClick={() => { if (professionalAssessment.professionalCertificateUnlocked) navigate("certificate"); else { setExam("professional-post"); navigate("posttest"); } }} />
    </div>
  </div>;
}

function ModuleCard({ title, description, done, locked = false, action, onClick }: { title: string; description: string; done: boolean; locked?: boolean; action: string; onClick: () => void }) {
  return <div className="card" style={{ borderColor: done ? "var(--secondary)" : locked ? "var(--surface-highest)" : "var(--primary-dim)", opacity: locked ? 0.55 : 1 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><h3>{title}</h3><span className={`tag ${done ? "tag-mint" : locked ? "tag-gray" : "tag-cyan"}`}>{done ? "DONE" : locked ? "LOCKED" : "OPEN"}</span></div><p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "9px 0 16px" }}>{description}</p><button className="btn btn-primary" disabled={locked} onClick={onClick}>{action} →</button></div>;
}
