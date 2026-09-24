// ============================================================
// FUNK EDU — Misi 5: Resistance Evolution (Seleksi Klon Mutan)
// ============================================================
import { useState } from "react";
import { useStore } from "../../store";
import PetriDish from "../../components/PetriDish";

const TIMELINE = [
  {
    day: 0,
    title: "Hari 0 — Populasi Basal",
    text: "10⁸ CFU/mL populasi campuran. Mayoritas wild-type sensitif (MIC 2); ~10⁻⁷ frekuensi mutan spontan (AmpC derepressed / efflux upregulasi, MIC ≥ 16).",
    kill: 0,
    resistant: 0.02,
  },
  {
    day: 5,
    title: "Hari 5 — Regimen Sub-optimal",
    text: "Dosis standar infus 30 mnt dengan MIC tinggi: %fT > MIC hanya 35%. Wild-type tertekan sebagian, namun kadar berulang di dalam mutant selection window → klon resisten terseleksi.",
    kill: 0.45,
    resistant: 0.35,
  },
  {
    day: 10,
    title: "Hari 10 — Mutan Dominan",
    text: "Kegagalan terapi: koloni resisten (merah) kini dominan. Demam berlanjut, marker inflamasi naik. Dibutuhkan regimen optimal (extended infusion / kombinasi) berbasis kultur ulang.",
    kill: 0.2,
    resistant: 0.85,
  },
];

export default function Mission5() {
  const { completeMission, addXP } = useStore();
  const [dayIdx, setDayIdx] = useState(0);
  const [quiz, setQuiz] = useState<string | null>(null);

  const day = TIMELINE[dayIdx];

  function answer(key: string) {
    setQuiz(key);
    if (key === "ei") {
      addXP(40);
      completeMission(5, 140);
    }
  }

  return (
    <div className="anim-in">
      <div className="card" style={{ marginBottom: 20 }}>
        <span className="tag tag-red">MISI 05 — RESISTANCE EVOLUTION</span>
        <h2 style={{ fontSize: 24, margin: "12px 0 6px" }}>Seleksi Klon Mutan dalam Mutant Selection Window</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 900, lineHeight: 1.7 }}>
          Kasus: pneumonia nosokomial <em>P. aeruginosa</em> (MIC 8). Simulasi evolusi populasi saat regimen tidak mencapai target PK/PD.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div className="card">
          {/* Timeline stepper */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {TIMELINE.map((t, i) => (
              <button
                key={t.day}
                className={`pill ${dayIdx === i ? "active-red" : ""}`}
                style={{ flex: 1, padding: "10px" }}
                onClick={() => setDayIdx(i)}
              >
                DAY {t.day}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <PetriDish killFraction={day.kill} resistantFraction={day.resistant} size={230} seed={day.day + 11} label="" />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, color: dayIdx === 2 ? "var(--danger)" : "var(--text-primary)" }}>{day.title}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "var(--text-secondary)", marginTop: 8 }}>{day.text}</p>
              <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
                <LegendDot color="#e8e4c9" label="Wild-type sensitif" />
                <LegendDot color="#ef4444" label="Mutan resisten" />
              </div>
            </div>
          </div>

          {/* Comparative kill curve */}
          <div className="card card-low" style={{ marginTop: 20 }}>
            <div className="label" style={{ marginBottom: 8 }}>COMPARATIVE KILL CURVE — SUB-OPTIMAL vs EXTENDED INFUSION</div>
            <svg viewBox="0 0 700 220" style={{ width: "100%" }}>
              {[0, 2, 4, 6, 8].map((log) => (
                <g key={log}>
                  <line x1="50" x2="680" y1={190 - log * 22} y2={190 - log * 22} stroke="#202941" />
                  <text x="44" y={194 - log * 22} textAnchor="end" fontSize="10" fill="#5b6a8c" fontFamily="JetBrains Mono">1e{log}</text>
                </g>
              ))}
              {[0, 2, 4, 6, 8, 10].map((d) => (
                <text key={d} x={50 + (d / 10) * 630} y="210" textAnchor="middle" fontSize="10" fill="#5b6a8c" fontFamily="JetBrains Mono">D{d}</text>
              ))}
              {/* suboptimal: turun lalu rebound */}
              <path d="M50 14 C 160 90, 220 120, 320 110 C 420 100, 520 40, 680 20" fill="none" stroke="#ef4444" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.6))" }} />
              {/* EI: turun terus */}
              <path d="M50 14 C 180 110, 300 165, 430 182 C 520 190, 600 191, 680 191" fill="none" stroke="#4edea3" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 6px rgba(78,222,163,0.6))" }} />
              <text x="690" y="24" textAnchor="end" fontSize="11" fill="#ef4444" fontFamily="JetBrains Mono">Sub-optimal → rebound resisten</text>
              <text x="690" y="186" textAnchor="end" fontSize="11" fill="#4edea3" fontFamily="JetBrains Mono">Extended infusion → eradikasi</text>
            </svg>
          </div>
        </div>

        {/* Inspector + quiz */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <div className="label">EFFLUX & AmpC INSPECTOR</div>
            <div style={{ display: "grid", gap: 10, marginTop: 12, fontSize: 13 }}>
              <div className="card card-low" style={{ padding: 12 }}>
                <strong style={{ color: "var(--danger)" }}>AmpC β-laktamase derepressed</strong>
                <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 12.5, lineHeight: 1.6 }}>
                  Mutasi ampR → produksi AmpC konstitutif → hidrolisis sefalosporin gen-3 & pip-tazo pada sebagian galur.
                </p>
              </div>
              <div className="card card-low" style={{ padding: 12 }}>
                <strong style={{ color: "var(--danger)" }}>Upregulasi Efflux (MexAB-OprM)</strong>
                <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 12.5, lineHeight: 1.6 }}>
                  Pompa efflux menurunkan kadar intrasel FQ & β-laktam → MIC naik 4–8 lipat tanpa mutasi target.
                </p>
              </div>
              <div className="card card-low" style={{ padding: 12 }}>
                <strong style={{ color: "var(--amber)" }}>Mutant Prevention Concentration (MPC)</strong>
                <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 12.5, lineHeight: 1.6 }}>
                  Jaga kadar di atas MPC/menutup MSW: dosis adekuat, extended infusion, dan durasi minimal efektif.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>DECISION POINT</div>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 12 }}>
              Hari 10 kultur ulang: P. aeruginosa MIC 16 (pip-tazo). Strategi paling rasional:
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { key: "same", text: "Lanjutkan regimen sama, tambah durasi", ok: false, fb: "Salah — mempertahankan kadar sub-MIC memperkuat seleksi mutan." },
                { key: "ei", text: "Pip-tazo dosis tinggi extended infusion 4 jam + kultur-guided, evaluasi kombinasi/agen aktif lain", ok: true, fb: "TEPAT! Extended infusion memaksimalkan %fT > MIC; terapi dipandu antibiogram terbaru." },
                { key: "stop", text: "Stop semua antibiotik", ok: false, fb: "Berbahaya — pasien septik memerlukan terapi adekuat segera." },
              ].map((o) => (
                <div key={o.key}>
                  <button
                    className="btn"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      background: quiz === o.key ? (o.ok ? "var(--secondary-container)" : "var(--red)") : "var(--surface-high)",
                    }}
                    onClick={() => answer(o.key)}
                  >
                    {o.text}
                  </button>
                  {quiz === o.key && (
                    <div className="anim-in" style={{ marginTop: 6, fontSize: 12.5, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: o.ok ? "var(--secondary-dim)" : "var(--red-dim)", lineHeight: 1.6 }}>
                      {o.fb} {o.ok && <div className="mono" style={{ color: "var(--secondary)", fontWeight: 700, marginTop: 6 }}>+140 XP • MISI 5 SELESAI ✓</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: color === "#ef4444" ? "0 0 6px rgba(239,68,68,0.8)" : "none" }} />
      {label}
    </span>
  );
}
