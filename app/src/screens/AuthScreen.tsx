// ============================================================
// FUNK EDU — Screen 01: Auth & Role Onboarding
// ============================================================
import { useState } from "react";
import { useStore } from "../store";
import type { Role } from "../types";

const ROLES: { id: Role; label: string; desc: string; icon: string }[] = [
  { id: "mahasiswa", label: "Mahasiswa Kedokteran", desc: "Pre-klinik & klinik (koas)", icon: "🎓" },
  { id: "dokter_umum", label: "Dokter Umum / GP", desc: "Internship, hospitalist, IGD", icon: "🩺" },
  { id: "residen", label: "Residen PPDS", desc: "Penyakit Dalam / Anestesi / Pediatri", icon: "🧬" },
  { id: "farmasis", label: "Farmasis Klinis", desc: "ID Stewards / apoteker RS", icon: "💊" },
];

export default function AuthScreen() {
  const { login, quickDemo } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("mahasiswa");

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.1fr 1fr", maxWidth: 1480, margin: "0 auto" }}>
      {/* ---------- Hero panel ---------- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 64px",
          background: "radial-gradient(800px 500px at 20% 30%, rgba(0,240,255,0.09), transparent 60%), var(--surface-lowest)",
        }}
      >
        <div className="tag tag-cyan" style={{ alignSelf: "flex-start", marginBottom: 22 }}>
          BIOLAB ACCESS TERMINAL v2.0
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.06 }}>
          FUNK <span style={{ color: "var(--primary)", textShadow: "0 0 24px rgba(0,240,255,0.6)" }}>EDU</span>
        </h1>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-secondary)", marginTop: 14, maxWidth: 520 }}>
          Antibiotic Fundamentals Lab &amp; PK/PD Clinical Decision Simulator
        </p>
        <p style={{ color: "var(--text-muted)", marginTop: 18, maxWidth: 480, fontSize: 15 }}>
          <em style={{ color: "var(--secondary)" }}>“Understand the drug. Outsmart resistance. Protect the future.”</em>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 44, maxWidth: 520 }}>
          {[
            { n: "6", t: "Misi Interaktif", c: "var(--primary)" },
            { n: "5", t: "Agen Antimikroba", c: "var(--secondary)" },
            { n: "48h", t: "Simulasi PK Real-time", c: "var(--amber)" },
            { n: "80%", t: "Passing Grade Ketat", c: "var(--danger)" },
          ].map((s) => (
            <div key={s.t} className="card card-low" style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.t}</div>
            </div>
          ))}
        </div>

        <div className="mono" style={{ marginTop: 48, fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em" }}>
          COMPLIANCE: WHO AWaRe • PPRA KEMENKES RI 2026 • IDSA/ATS • EUCAST
        </div>
      </div>

      {/* ---------- Login form ---------- */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div className="card anim-in" style={{ width: "100%", maxWidth: 440, padding: 32 }}>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>BioLab Gate</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            Autentikasi SSO medis atau email institusi untuk memulai assessment.
          </p>

          <label className="label">Nama Lengkap</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="dr. Nama Anda" style={inputStyle} />

          <label className="label" style={{ marginTop: 16 }}>Email Institusi</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@rs.institusi.ac.id" type="email" style={inputStyle} />

          <label className="label" style={{ marginTop: 16 }}>Role / Profesi</label>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${role === r.id ? "var(--primary)" : "var(--surface-highest)"}`,
                  background: role === r.id ? "var(--primary-container)" : "var(--surface-low)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "var(--transition)",
                }}
              >
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                <span>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 13.5 }}>{r.label}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)" }}>{r.desc}</span>
                </span>
                {role === r.id && <span style={{ marginLeft: "auto", color: "var(--primary)" }}>◉</span>}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 24, padding: "13px" }}
            onClick={() => login(name.trim() || "dr. Peserta", role)}
          >
            Masuk &amp; Mulai Pre-Test →
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--surface-highest)" }} />
            <span className="label">atau</span>
            <div style={{ flex: 1, height: 1, background: "var(--surface-highest)" }} />
          </div>

          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={quickDemo}>
            ⚡ Quick Demo — dr. Althea Vance (Residen)
          </button>

          <div className="mono" style={{ marginTop: 20, fontSize: 10, color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.08em" }}>
            🔒 SECURED BY PPRA KEMENKES 2026 PROTOCOL
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 8,
  padding: "11px 14px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--surface-highest)",
  background: "var(--surface-lowest)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  outline: "none",
};
