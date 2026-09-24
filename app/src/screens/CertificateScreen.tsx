import { useMemo } from "react";
import { PERSONAS } from "../data/personas";
import { useStore } from "../store";
import RadarChart from "../components/RadarChart";

function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 0x01000193); }
  return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

export default function CertificateScreen() {
  const { user, studentAssessment, professionalAssessment, navigate } = useStore();
  const professional = user.experience === "professional";
  const post = professional ? professionalAssessment.posttestScore ?? 0 : studentAssessment.posttestScore ?? 0;
  const pre = professional ? professionalAssessment.baselineScore ?? 0 : studentAssessment.pretestScore ?? 0;
  const role = user.professionalVerification.verifiedRole;
  const title = professional ? "Professional Track Certificate" : "Student Completion Certificate";
  const credential = useMemo(() => { const id = `FE-${professional ? "PRO" : "STU"}-2026-${String(8000 + ((user.name.length * 37 + post * 13) % 1999)).padStart(4, "0")}`; return { id, hash: hashString(id + user.name + post) + hashString(user.name + id).slice(0, 4) }; }, [professional, user.name, post]);
  const values = professional ? [professionalAssessment.baselineDone ? 72 : 30, professionalAssessment.workbenchDone ? 86 : 35, professionalAssessment.clinicalRoomDone ? 90 : 30, professionalAssessment.prescriptionAuditDone ? 88 : 32, post * 10] : [Math.min(98, pre * 7 + 20), Math.min(98, pre * 7 + 25), Math.min(98, pre * 6 + 30), Math.min(98, pre * 7 + 22), post * 10];

  return <div className="anim-in" style={{ maxWidth: 1100, margin: "0 auto" }}>
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, marginBottom: 20 }}><div className="card" style={{ textAlign: "center" }}><div className="label">OVERALL SCORE</div><div className="mono" style={{ fontSize: 64, color: "var(--secondary)", marginTop: 20 }}>{post * 10}%</div><p style={{ color: "var(--text-secondary)", marginTop: 8 }}>{professional ? "Professional post-test" : "Student post-test"}: {post}/10</p></div><div className="card" style={{ display: "flex", alignItems: "center", gap: 24 }}><RadarChart labels={["Diagnosis", "MOA", "PK/PD", "Spectrum", "Stewardship"]} values={values} size={220} /><div><span className={`tag ${professional ? "tag-mint" : "tag-cyan"}`}>{professional ? "PROFESSIONAL" : "STUDENT"}</span><h2 style={{ marginTop: 12 }}>{title}</h2><p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Locally generated prototype educational credential.</p></div></div></div>
    <div className="card" style={{ padding: 0, overflow: "hidden", borderColor: "var(--primary-dim)" }}><div style={{ height: 4, background: "linear-gradient(90deg, var(--primary), var(--secondary))" }} /><div style={{ padding: "38px 44px" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div className="tag tag-cyan">{title.toUpperCase()}</div><h2 style={{ fontSize: 30, marginTop: 12 }}>FUNK EDU — Antibiotic Stewardship Program</h2></div><div style={{ width: 64, height: 64, borderRadius: 14, background: "linear-gradient(135deg, var(--primary), var(--secondary-container))", display: "grid", placeItems: "center", color: "#04222a", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28 }}>F</div></div><div style={{ margin: "28px 0", borderTop: "1px dashed var(--surface-highest)", borderBottom: "1px dashed var(--surface-highest)", padding: "24px 0", textAlign: "center" }}><p style={{ color: "var(--text-muted)" }}>Diberikan kepada</p><div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 700, color: "var(--primary)", margin: "6px 0" }}>{user.name}</div>{professional && role && <div style={{ color: "var(--secondary)", marginBottom: 8 }}>{PERSONAS[role].label} • verified prototype identity</div>}<p style={{ color: "var(--text-secondary)" }}>Completed the {professional ? "verified Professional clinical track" : "Student fundamentals track"} with score <strong className="mono">{post}/10</strong>.</p></div>{professional && <div className="card card-low" style={{ borderColor: "var(--amber)", color: "var(--amber)", marginBottom: 22 }}>Prototype educational credential — not a professional license or KKI/SATUSEHAT verification document</div>}<div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-end" }}><div><div className="mono" style={{ fontSize: 12 }}>CREDENTIAL ID: <span style={{ color: "var(--primary)" }}>{credential.id}</span></div><div className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>LOCAL PROTOTYPE HASH: {credential.hash}</div></div><div style={{ display: "flex", gap: 10 }}><button className="btn btn-primary" onClick={() => window.print()}>Export PDF</button><button className="btn btn-ghost" onClick={() => navigate(professional ? "professional-dashboard" : "student-dashboard")}>Dashboard</button></div></div></div></div>
  </div>;
}
