import { useMemo, useState } from "react";
import { PERSONAS, PROFESSIONAL_PERSONAS } from "../data/personas";
import { useStore } from "../store";
import type { ProfessionalRole, ProfessionalVerificationRequest } from "../types";

const STEPS = ["Profesi", "Data registrasi", "Review", "Status"] as const;
type Errors = Partial<Record<"legalName" | "professionalRole" | "registrationNumber" | "institution" | "specialtyOrProgram" | "consent", string>>;

export default function ProfessionalVerificationScreen() {
  const { user, submitProfessionalVerification, checkProfessionalVerification, continueAsStudent, navigate } = useStore();
  const verification = user.professionalVerification;
  const verified = verification.status === "verified";
  const [step, setStep] = useState(verification.status === "not_started" ? 0 : 3);
  const [errors, setErrors] = useState<Errors>({});
  const [draft, setDraft] = useState<ProfessionalVerificationRequest>(() => verification.request ?? {
    legalName: user.name,
    professionalRole: "dokter_umum",
    registrationNumber: "",
    institution: "",
    specialtyOrProgram: "",
    consent: true,
  });
  const persona = PERSONAS[draft.professionalRole];
  const isInitialApplicant = user.onboardingIntent === "professional" && user.experience === "student";
  const statusClass = verification.status === "verified" ? "tag-mint" : verification.status === "pending" || verification.status === "submitting" ? "tag-amber" : verification.status === "rejected" || verification.status === "unavailable" ? "tag-red" : "tag-gray";

  const requestSummary = useMemo(() => verification.request ?? draft, [verification.request, draft]);

  function validate(): Errors {
    const next: Errors = {};
    if (draft.legalName.trim().length < 2) next.legalName = "Nama legal wajib diisi.";
    if (!draft.professionalRole) next.professionalRole = "Pilih profesi.";
    const registration = draft.registrationNumber.trim();
    if (!/^[A-Z0-9/.-]{5,64}$/.test(registration)) next.registrationNumber = "Gunakan 5–64 karakter: huruf kapital, angka, /, . atau -.";
    if (draft.institution.trim().length < 2) next.institution = "Institusi wajib diisi.";
    if (draft.professionalRole === "residen" && draft.specialtyOrProgram.trim().length < 2) next.specialtyOrProgram = "Program spesialis / departemen wajib diisi.";
    if (!draft.consent) next.consent = "Persetujuan wajib diberikan.";
    return next;
  }

  function nextStep() {
    const nextErrors = validate();
    if (step === 0 && !draft.professionalRole) { setErrors(nextErrors); return; }
    if (step === 1 && Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }
    setErrors({});
    setStep((current) => Math.min(2, current + 1));
  }

  async function submit() {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); setStep(1); return; }
    const request: ProfessionalVerificationRequest = {
      ...draft,
      legalName: draft.legalName.trim(),
      registrationNumber: draft.registrationNumber.trim(),
      institution: draft.institution.trim(),
      specialtyOrProgram: draft.professionalRole === "residen" ? draft.specialtyOrProgram.trim() : "",
      consent: true,
    };
    setStep(3);
    await submitProfessionalVerification(request);
  }

  if (verified) {
    const role = verification.verifiedRole ? PERSONAS[verification.verifiedRole] : null;
    return <div className="anim-in" style={{ maxWidth: 860, margin: "0 auto" }}><div className="card" style={{ textAlign: "center", padding: 40, borderColor: "var(--secondary)" }}><span className="tag tag-mint">VERIFIED PROFESSIONAL</span><h2 style={{ marginTop: 16 }}>{verification.verifiedName}</h2><p style={{ color: "var(--text-secondary)", marginTop: 8 }}>{role?.label} • claim is read-only in this prototype.</p><p className="mono" style={{ color: "var(--amber)", fontSize: 11, marginTop: 14 }}>Simulasi verifikasi — bukan validasi KKI/SATUSEHAT</p><button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => navigate("professional-dashboard")}>Professional Dashboard →</button></div></div>;
  }

  return (
    <div className="anim-in" style={{ maxWidth: 980, margin: "0 auto" }}>
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start" }}><div><span className="tag tag-amber">SERVER VERIFICATION</span><h2 style={{ margin: "12px 0 6px" }}>Professional access verification</h2><p style={{ color: "var(--text-secondary)", fontSize: 13.5 }}>Server-validated professional registration. No browser call or scrape to KKI/SATUSEHAT.</p></div><span className={`tag ${statusClass}`}>{verification.status.replace("_", " ").toUpperCase()}</span></div>
        <div className="mono" style={{ color: "var(--amber)", fontSize: 11, marginTop: 14 }}>Simulasi verifikasi — bukan validasi KKI/SATUSEHAT</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>{STEPS.map((label, index) => <div key={label} className="card card-low" style={{ padding: 12, borderColor: step === index ? "var(--primary)" : "var(--surface-highest)", opacity: step >= index ? 1 : 0.5 }}><span className="mono" style={{ color: step === index ? "var(--primary)" : "var(--text-muted)" }}>0{index + 1}</span> <span style={{ fontSize: 12 }}>{label}</span></div>)}</div>

      {step === 0 && <div className="card"><div className="label" style={{ marginBottom: 12 }}>PILIH PROFESI</div><div style={{ display: "grid", gap: 10 }}>{PROFESSIONAL_PERSONAS.map((option) => <button key={option.id} onClick={() => setDraft({ ...draft, professionalRole: option.id as ProfessionalRole, specialtyOrProgram: option.id === "residen" ? draft.specialtyOrProgram : "" })} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 10, cursor: "pointer", textAlign: "left", color: "var(--text-primary)", background: draft.professionalRole === option.id ? "var(--primary-container)" : "var(--surface-low)", border: `1px solid ${draft.professionalRole === option.id ? "var(--primary)" : "var(--surface-highest)"}` }}><span style={{ fontSize: 24 }}>{option.icon}</span><span><strong>{option.label}</strong><span style={{ display: "block", color: "var(--text-muted)", fontSize: 12, marginTop: 3 }}>{option.description}</span></span></button>)}</div><div style={{ textAlign: "right", marginTop: 18 }}><button className="btn btn-primary" onClick={nextStep}>Data registrasi →</button></div></div>}

      {step === 1 && <div className="card"><Field label="Nama legal" value={draft.legalName} error={errors.legalName} onChange={(value) => setDraft({ ...draft, legalName: value })} /><Field label="Nomor registrasi" value={draft.registrationNumber} error={errors.registrationNumber} onChange={(value) => setDraft({ ...draft, registrationNumber: value.toUpperCase() })} placeholder="REG-2026-XXXXX" /><Field label={persona.institutionLabel ?? "Institusi"} value={draft.institution} error={errors.institution} onChange={(value) => setDraft({ ...draft, institution: value })} />{draft.professionalRole === "residen" && <Field label={persona.specialtyLabel ?? "Program spesialis / departemen"} value={draft.specialtyOrProgram} error={errors.specialtyOrProgram} onChange={(value) => setDraft({ ...draft, specialtyOrProgram: value })} />}<label style={{ display: "flex", gap: 10, marginTop: 18, fontSize: 13, color: "var(--text-secondary)" }}><input type="checkbox" checked={draft.consent} onChange={(event) => setDraft({ ...draft, consent: event.target.checked as true })} />Saya menyetujui pengiriman data ini untuk simulasi verifikasi otomatis.</label>{errors.consent && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 5 }}>{errors.consent}</div>}<div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}><button className="btn btn-ghost" onClick={() => setStep(0)}>← Profesi</button><button className="btn btn-primary" onClick={nextStep}>Review →</button></div></div>}

      {step === 2 && <div className="card"><div className="label">REVIEW CLAIM</div><Review request={draft} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}><button className="btn btn-ghost" onClick={() => setStep(1)}>← Edit data</button><button className="btn btn-secondary" onClick={submit}>Submit prototype verification →</button></div></div>}

      {step === 3 && <div className="card"><div className="label">STATUS</div>{verification.status === "submitting" && <Status title="Submitting claim…" detail="Please wait for the prototype adapter." color="var(--amber)" />}{verification.status === "pending" && <><Status title="Verification pending" detail="Student experience and progress remain active. Professional routes stay locked." color="var(--amber)" /><Review request={requestSummary} /><button className="btn btn-primary" style={{ marginTop: 18 }} onClick={checkProfessionalVerification}>Check status</button></>}{verification.status === "rejected" && <><Status title="Verification rejected" detail={verification.rejectionReason ?? "Data registrasi tidak cocok."} color="var(--danger)" /><button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => { setDraft(requestSummary); setStep(1); }}>Try verification again</button></>}{verification.status === "unavailable" && <><Status title="Verification service unavailable" detail="Draft is preserved. Retry without changing Student access." color="var(--danger)" /><button className="btn btn-primary" style={{ marginTop: 18 }} onClick={submit}>Retry submission</button></>}{verification.status === "not_started" && <Status title="Claim not submitted" detail="Complete the previous steps." color="var(--text-muted)" />}{isInitialApplicant && verification.status !== "submitting" && <button className="btn btn-ghost" style={{ marginTop: 18, marginLeft: 10 }} onClick={continueAsStudent}>Continue as Student</button>}</div>}
    </div>
  );
}

function Field({ label, value, onChange, error, placeholder }: { label: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string }) { return <label style={{ display: "block", marginTop: 16 }}><span className="label">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} style={{ width: "100%", marginTop: 7, padding: "11px 13px", borderRadius: 8, border: `1px solid ${error ? "var(--danger)" : "var(--surface-highest)"}`, background: "var(--surface-lowest)", color: "var(--text-primary)" }} />{error && <span style={{ display: "block", color: "var(--danger)", fontSize: 12, marginTop: 5 }}>{error}</span>}</label>; }
function Review({ request }: { request: ProfessionalVerificationRequest }) { return <div className="card card-low" style={{ marginTop: 14, display: "grid", gap: 8, fontSize: 13 }}><div><span className="label">NAME</span><br />{request.legalName}</div><div><span className="label">ROLE</span><br />{PERSONAS[request.professionalRole].label}</div><div><span className="label">REGISTRATION</span><br /><span className="mono">{request.registrationNumber}</span></div><div><span className="label">INSTITUTION</span><br />{request.institution}</div>{request.specialtyOrProgram && <div><span className="label">PROGRAM</span><br />{request.specialtyOrProgram}</div>}</div>; }
function Status({ title, detail, color }: { title: string; detail: string; color: string }) { return <div style={{ marginTop: 14 }}><h3 style={{ color }}>{title}</h3><p style={{ color: "var(--text-secondary)", marginTop: 7, lineHeight: 1.6 }}>{detail}</p></div>; }
