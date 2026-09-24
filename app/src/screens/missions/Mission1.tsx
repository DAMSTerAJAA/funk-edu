// ============================================================
// FUNK EDU — Misi 1: Infection Detective (Centor Score & Viral)
// ============================================================
import { useState } from "react";
import { useStore } from "../../store";

const CENTOR_ITEMS = [
  { id: "fever", label: "Demam > 38°C (riwayat/pengukuran)", present: true },
  { id: "exudate", label: "Eksudat / pembengkakan tonsil", present: true },
  { id: "lad", label: "Limfadenopati servikal anterior nyeri", present: true },
  { id: "noCough", label: "Tidak ada batuk", present: false },
];

export default function Mission1() {
  const { completeMission, addXP } = useStore();
  const [checked, setChecked] = useState<string[]>(["fever", "exudate", "lad"]);
  const [decision, setDecision] = useState<string | null>(null);

  const score = checked.length + 0; // usia 24 → +1? Centor: 15-44 = 0 koreksi; total = jumlah kriteria
  const verdict =
    score <= 1
      ? { text: "Probabilitas GAS rendah (<10%) → terapi simptomatik saja, TANPA antibiotik.", color: "var(--secondary)" }
      : score <= 3
        ? { text: "Probabilitas GAS sedang → konfirmasi Rapid Antigen Test / kultur usap tenggorokan sebelum antibiotik.", color: "var(--amber)" }
        : { text: "Probabilitas GAS tinggi (>50%) → antibiotik (Penisilin V/Amoksisilin) dapat dipertimbangkan.", color: "var(--danger)" };

  const decisions = [
    { key: "symptomatic", text: "Terapi simptomatik saja (parasetamol, hidrasi)", correct: false, fb: "Kurang tepat — dengan Centor 3, probabilitas bakteri tidak bisa diabaikan tanpa konfirmasi." },
    { key: "radt", text: "Lakukan Rapid Antigen Test dahulu, antibiotik bila positif", correct: true, fb: "TEPAT! Konfirmasi sebelum antibiotik = stewardship. Centor 3 → RADT dianjurkan." },
    { key: "cefixime", text: "Beri Sefiksim 2×200 mg empiris", correct: false, fb: "BERBAHAYA! Sefalosporin oral broad untuk dugaan viral/GAS tanpa konfirmasi → penalti -30 XP, risiko disbiosis usus & seleksi ESBL." },
    { key: "azithro", text: "Beri Azitromisin 500 mg 3 hari", correct: false, fb: "Prematur — makrolida bukan lini pertama GAS (resistensi meningkat), dan belum ada konfirmasi bakteri." },
  ];

  function choose(d: (typeof decisions)[number]) {
    setDecision(d.key);
    if (d.correct) {
      addXP(50);
      completeMission(1, 100);
    } else if (d.key === "cefixime") {
      addXP(-30);
    }
  }

  return (
    <div className="anim-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Dossier pasien */}
      <div className="card">
        <span className="tag tag-cyan">MISI 01 — INFECTION DETECTIVE</span>
        <h2 style={{ fontSize: 24, margin: "12px 0" }}>Patient Dossier: URTI</h2>
        <div style={{ background: "var(--surface-low)", borderRadius: "var(--radius-sm)", padding: 16, fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>Rn. Clara, 24 th, mahasiswi.</strong> Keluhan nyeri menelan sejak 2 hari,
          demam terukur 38,4°C. <span style={{ color: "var(--danger)" }}>Tidak batuk, tidak pilek.</span> Faring hiperemis,
          tonsil T2-T2 dengan eksudat folikel, KGB servikal anterior bilateral nyeri tekan. Suara tidak serak, mukosa hidung tenang.
        </div>

        <h3 style={{ fontSize: 16, margin: "20px 0 10px" }}>🧮 Centor Score Calculator</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {CENTOR_ITEMS.map((c) => {
            const on = checked.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setChecked((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${on ? "var(--primary)" : "var(--surface-highest)"}`,
                  background: on ? "var(--primary-container)" : "var(--surface-low)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 13.5,
                  textAlign: "left",
                  transition: "var(--transition)",
                }}
              >
                <span className="mono" style={{ color: on ? "var(--primary)" : "var(--text-muted)", fontWeight: 700 }}>
                  {on ? "[+1]" : "[  ]"}
                </span>
                {c.label}
              </button>
            );
          })}
        </div>
        <div className="card card-low" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16 }}>
          <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: "var(--primary)" }}>{score}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
            <div className="label">CENTOR SCORE</div>
            {verdict.text}
          </div>
        </div>
      </div>

      {/* Viral vs bacterial + decision */}
      <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>🔬 Viral vs Bacterial Comparator</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5 }}>
            <div className="card card-low" style={{ padding: 12 }}>
              <div className="tag tag-mint" style={{ marginBottom: 8 }}>VIRAL (Rhinovirus dll)</div>
              <ul style={{ paddingLeft: 16, color: "var(--text-secondary)", display: "grid", gap: 5 }}>
                <li>Batuk + rinore dominan</li>
                <li>Suara serak / konjungtivitis</li>
                <li>Tanpa eksudat tonsil</li>
                <li>Self-limited 5–7 hari</li>
              </ul>
            </div>
            <div className="card card-low" style={{ padding: 12 }}>
              <div className="tag tag-red" style={{ marginBottom: 8 }}>BAKTERI (GAS)</div>
              <ul style={{ paddingLeft: 16, color: "var(--text-secondary)", display: "grid", gap: 5 }}>
                <li>Demam mendadak + odinofagia</li>
                <li><strong>Tanpa batuk</strong></li>
                <li>Eksudat tonsil + LAD nyeri</li>
                <li>Centor ≥ 3 → konfirmasi</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--amber)", marginTop: 12 }}>
            ⚠ Memberikan sefalosporin untuk etiologi rhinovirus viral memicu penalti -30 XP dan alert disbiosis usus.
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>⚕ Decision Action</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {decisions.map((d) => {
              const picked = decision === d.key;
              return (
                <button
                  key={d.key}
                  className="btn"
                  onClick={() => choose(d)}
                  style={{
                    justifyContent: "flex-start",
                    background: picked ? (d.correct ? "var(--secondary-container)" : "var(--red)") : "var(--surface-high)",
                    border: picked ? `1px solid ${d.correct ? "var(--secondary)" : "var(--danger)"}` : "1px solid transparent",
                  }}
                >
                  {d.text}
                </button>
              );
            })}
          </div>
          {decision && (
            <div
              className="anim-in"
              style={{
                marginTop: 14,
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13.5,
                lineHeight: 1.7,
                background: decisions.find((d) => d.key === decision)?.correct ? "var(--secondary-dim)" : "var(--red-dim)",
                border: `1px solid ${decisions.find((d) => d.key === decision)?.correct ? "var(--secondary)" : "var(--red)"}`,
              }}
            >
              {decisions.find((d) => d.key === decision)?.fb}
              {decisions.find((d) => d.key === decision)?.correct && (
                <div className="mono" style={{ marginTop: 8, color: "var(--secondary)", fontWeight: 700 }}>+100 XP • MISI 1 SELESAI ✓</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
