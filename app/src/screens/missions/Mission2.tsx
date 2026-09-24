// ============================================================
// FUNK EDU — Misi 2: Target Hunter (MOA Sel Bakteri)
// ============================================================
import { useState } from "react";
import { useStore } from "../../store";

const TARGETS = [
  { id: "cell-wall", label: "Dinding Sel (PBP)", x: 380, y: 60, mechanism: "β-laktam (Penisilin, Sefalosporin, Karbapenem) & Glikopeptida berikatan pada PBP/menghambat transpeptidasi peptidoglikan → lisis sel. Time-dependent: %fT > MIC.", drugs: ["Penisilin", "Seftriakson", "Meropenem", "Vankomisin"] },
  { id: "ribosome-30s", label: "Ribosom 30S", x: 160, y: 300, mechanism: "Aminoglikosida & Tetrasiklin mengikat subunit 30S → misreading mRNA. Concentration-dependent: Cmax/MIC ≥ 10.", drugs: ["Gentamicin", "Amikasin", "Doksisiklin"] },
  { id: "ribosome-50s", label: "Ribosom 50S", x: 600, y: 300, mechanism: "Makrolida, Linkosamida, Oksazolidinon menghambat translokasi peptidil-tRNA pada subunit 50S. Umumnya bakteriostatik.", drugs: ["Azitromisin", "Klindamisin", "Linezolid"] },
  { id: "dna-gyrase", label: "DNA Gyrase / Topo IV", x: 380, y: 400, mechanism: "Fluorokuinolon menghambat DNA gyrase & topoisomerase IV → fragmentasi DNA. Concentration-dependent: AUC/MIC ≥ 125 (Gram negatif).", drugs: ["Levofloxacin", "Siprofloksasin"] },
  { id: "folate", label: "Jalur Folat (DHFR/DHPS)", x: 640, y: 120, mechanism: "Sulfonamid + Trimetoprim menghambat sintesis folat berurutan (DHPS → DHFR) → blokade sintesis nukleotida. Bakteriostatik/bakterisidal kombinasi.", drugs: ["Cotrimoxazole"] },
];

const QUIZ_DRUGS = [
  { name: "Meropenem", target: "cell-wall" },
  { name: "Gentamicin", target: "ribosome-30s" },
  { name: "Levofloxacin", target: "dna-gyrase" },
  { name: "Azitromisin", target: "ribosome-50s" },
  { name: "Cotrimoxazole", target: "folate" },
];

export default function Mission2() {
  const { completeMission, addXP } = useStore();
  const [selected, setSelected] = useState(TARGETS[0]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const quiz = QUIZ_DRUGS[quizIdx];

  function answerQuiz(targetId: string) {
    if (done) return;
    const correct = targetId === quiz.target;
    if (correct) {
      setScore((s) => s + 1);
      setFeedback(`✓ Tepat! ${quiz.name} bekerja pada ${TARGETS.find((t) => t.id === quiz.target)?.label}.`);
    } else {
      setFeedback(`✗ Kurang tepat. ${quiz.name} menargetkan ${TARGETS.find((t) => t.id === quiz.target)?.label}.`);
    }
    setTimeout(() => {
      setFeedback(null);
      if (quizIdx + 1 >= QUIZ_DRUGS.length) {
        setDone(true);
        const finalScore = correct ? score + 1 : score;
        if (finalScore >= 4) {
          addXP(40);
          completeMission(2, 120);
        }
      } else {
        setQuizIdx((i) => i + 1);
      }
    }, 1400);
  }

  return (
    <div className="anim-in" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
      {/* Sel bakteri interaktif */}
      <div className="card">
        <span className="tag tag-mint">MISI 02 — TARGET HUNTER</span>
        <h2 style={{ fontSize: 24, margin: "12px 0" }}>Bacterial Cell Map</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
          Klik zona target untuk mempelajari mekanisme aksi. Mode kuis: pilih lokasi target obat yang ditampilkan.
        </p>

        {/* Quiz bar */}
        <div className="card card-low" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, padding: "10px 16px" }}>
          <span className="label">DRUG SELECTOR DECK</span>
          {!done ? (
            <>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--amber)" }}>{quiz.name}</span>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
                {quizIdx + 1}/{QUIZ_DRUGS.length} • skor {score}
              </span>
            </>
          ) : (
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: score >= 4 ? "var(--secondary)" : "var(--amber)" }}>
              KUIS SELESAI — skor {score}/{QUIZ_DRUGS.length} {score >= 4 ? "• MISI 2 ✓ +120 XP" : "• butuh ≥ 4, coba ulangi (reset halaman)"}
            </span>
          )}
        </div>

        <svg viewBox="0 0 760 480" style={{ width: "100%", background: "var(--surface-lowest)", borderRadius: "var(--radius-sm)" }}>
          {/* badan sel */}
          <ellipse cx="380" cy="240" rx="330" ry="180" fill="#0c1530" stroke="#2b344d" strokeWidth="3" />
          <ellipse cx="380" cy="240" rx="300" ry="152" fill="none" stroke="#202941" strokeWidth="10" opacity="0.7" />
          {/* DNA */}
          <path d="M250 240 q60 -70 130 -20 q70 50 130 -20" fill="none" stroke="#7c6bf5" strokeWidth="5" opacity="0.65" strokeLinecap="round" />
          <path d="M270 280 q60 -60 110 -15 q60 45 120 -25" fill="none" stroke="#7c6bf5" strokeWidth="4" opacity="0.45" strokeLinecap="round" />
          {/* ribosom */}
          {Array.from({ length: 26 }).map((_, i) => {
            const a = (i / 26) * Math.PI * 2;
            const rx = 380 + Math.cos(a) * (140 + (i % 5) * 28);
            const ry = 240 + Math.sin(a) * (70 + (i % 4) * 20);
            return <circle key={i} cx={rx} cy={ry} r="5" fill="#4a5678" opacity="0.8" />;
          })}

          {TARGETS.map((t) => {
            const active = selected.id === t.id;
            return (
              <g key={t.id} onClick={() => { setSelected(t); if (!done) answerQuiz(t.id); }} style={{ cursor: "pointer" }}>
                <circle cx={t.x} cy={t.y} r="34" fill={active ? "rgba(0,240,255,0.18)" : "rgba(0,240,255,0.06)"} stroke={active ? "#00f0ff" : "#2b6f7a"} strokeWidth="2"
                  style={active ? { filter: "drop-shadow(0 0 10px rgba(0,240,255,0.8))" } : undefined} />
                <circle cx={t.x} cy={t.y} r="7" fill={active ? "#00f0ff" : "#3d8a96"} />
                <text x={t.x} y={t.y - 44} textAnchor="middle" fontSize="13" fontWeight="700" fill={active ? "#00f0ff" : "#93a0bd"} fontFamily="Space Grotesk">
                  {t.label}
                </text>
              </g>
            );
          })}
        </svg>
        {feedback && (
          <div className="anim-in" style={{ marginTop: 10, padding: "10px 16px", borderRadius: "var(--radius-sm)", fontSize: 13.5, background: "var(--surface-low)", border: "1px solid var(--surface-highest)" }}>
            {feedback}
          </div>
        )}
      </div>

      {/* Mechanism intelligence feed */}
      <div className="card" style={{ alignSelf: "start" }}>
        <div className="label">MECHANISM INTELLIGENCE FEED</div>
        <h3 style={{ fontSize: 20, margin: "8px 0 4px", color: "var(--primary)" }}>{selected.label}</h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "var(--text-secondary)" }}>{selected.mechanism}</p>
        <div className="label" style={{ marginTop: 16, marginBottom: 8 }}>AGEN TERKAIT</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {selected.drugs.map((d) => (
            <span key={d} className="pill" style={{ cursor: "default" }}>{d}</span>
          ))}
        </div>
        <div className="card card-low" style={{ marginTop: 18, padding: 14, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--amber)" }}>Clinical pearl:</strong> Mengetahui target seluler menentukan parameter PK/PD
          yang harus dioptimalkan — β-laktam: waktu di atas MIC; aminoglikosida & FQ: puncak/AUC terhadap MIC.
        </div>
      </div>
    </div>
  );
}
