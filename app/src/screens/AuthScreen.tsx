import { useState } from "react";
import { PERSONAS } from "../data/personas";
import { useStore } from "../store";
import type { Experience } from "../types";

export default function AuthScreen() {
  const { registerStudent, startProfessionalRegistration, quickDemoStudent, quickDemoProfessional } = useStore();
  const [stage, setStage] = useState<"track" | "account">("track");
  const [intent, setIntent] = useState<Experience>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const valid = name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(email.trim());

  function selectTrack(track: Experience) {
    setIntent(track);
    setStage("account");
  }

  function submit() {
    if (!valid) return;
    const account = { name: name.trim(), email: email.trim() };
    if (intent === "student") registerStudent(account);
    else startProfessionalRegistration(account);
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.1fr 1fr", maxWidth: 1480, margin: "0 auto" }}>
      <div style={{ padding: "64px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="tag tag-cyan" style={{ alignSelf: "flex-start", marginBottom: 22 }}>BIOLAB ACCESS TERMINAL v3.0</div>
        <h1 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.06 }}>FUNK <span style={{ color: "var(--primary)" }}>EDU</span></h1>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-secondary)", marginTop: 14, maxWidth: 520 }}>One application. Separate Student foundations and verified Professional clinical progression.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 36, maxWidth: 520 }}>
          {[{ label: "Student Track", value: "6 fundamentals missions" }, { label: "Professional Track", value: "Verification + clinical baseline" }, { label: "Progress", value: "Foundations carried forward" }, { label: "Credential", value: "Prototype educational only" }].map((item) => (
            <div className="card card-low" key={item.label} style={{ padding: 14 }}><div className="label">{item.label}</div><div style={{ fontSize: 13, marginTop: 4 }}>{item.value}</div></div>
          ))}
        </div>
        <div className="mono" style={{ marginTop: 40, fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em" }}>MEDICAL CONTENT AND VERIFICATION DATA ARE PROTOTYPE-ONLY</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div className="card anim-in" style={{ width: "100%", maxWidth: 480, padding: 32 }}>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>{stage === "track" ? "Choose your track" : `${intent === "student" ? PERSONAS.student.label : "Professional"} account`}</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>{stage === "track" ? "Professional access is granted only after successful prototype verification." : intent === "student" ? "Create a Student account and continue to the fundamentals pre-test." : "Create the account first, then submit a professional claim for verification."}</p>

          {stage === "track" ? (
            <div style={{ display: "grid", gap: 12 }}>
              <TrackButton icon={PERSONAS.student.icon} label={PERSONAS.student.label} description={PERSONAS.student.description} onClick={() => selectTrack("student")} />
              <TrackButton icon="🩺" label="Professional" description="GP, resident, or clinical pharmacist. Verification required." onClick={() => selectTrack("professional")} />
            </div>
          ) : (
            <>
              <label className="label">Nama Lengkap</label>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama sesuai identitas" style={inputStyle} />
              <label className="label" style={{ marginTop: 16 }}>Email</label>
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@institusi.ac.id" type="email" style={inputStyle} />
              <button className="btn btn-primary" disabled={!valid} style={{ width: "100%", justifyContent: "center", marginTop: 24, padding: 13 }} onClick={submit}>
                {intent === "student" ? "Create Student account →" : "Continue to verification →"}
              </button>
              <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => setStage("track")}>← Change track</button>
            </>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}><div style={{ flex: 1, height: 1, background: "var(--surface-highest)" }} /><span className="label">prototype demo</span><div style={{ flex: 1, height: 1, background: "var(--surface-highest)" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="btn btn-ghost" onClick={quickDemoStudent}>Student demo</button>
            <button className="btn btn-secondary" onClick={quickDemoProfessional}>Verified Professional demo</button>
          </div>
          <div className="mono" style={{ marginTop: 18, fontSize: 10, color: "var(--amber)", textAlign: "center" }}>Simulasi verifikasi — bukan validasi KKI/SATUSEHAT</div>
        </div>
      </div>
    </div>
  );
}

function TrackButton({ icon, label, description, onClick }: { icon: string; label: string; description: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-highest)", background: "var(--surface-low)", color: "var(--text-primary)", cursor: "pointer", textAlign: "left" }}><span style={{ fontSize: 24 }}>{icon}</span><span><strong style={{ display: "block" }}>{label}</strong><span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{description}</span></span><span style={{ marginLeft: "auto", color: "var(--primary)" }}>→</span></button>;
}

const inputStyle: React.CSSProperties = { width: "100%", marginTop: 8, padding: "11px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-highest)", background: "var(--surface-lowest)", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" };
