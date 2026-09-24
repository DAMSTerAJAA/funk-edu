// ============================================================
// FUNK EDU — Misi 3: Spectrum Strategy (AWaRe & Mikrobioma)
// ============================================================
import { useState } from "react";
import { useStore } from "../../store";

const OPTIONS = [
  {
    id: "narrow",
    name: "Amoksisilin",
    aware: "ACCESS",
    spectrum: "Sempit",
    collateral: 12,
    coverage: "S. pneumoniae, S. pyogenes, enterokokus (sebagian)",
    note: "Pilihan first-line bila patogen teridentifikasi & sensitif. Kolateral damage minimal pada mikrobioma.",
  },
  {
    id: "broad",
    name: "Piperacillin–Tazobactam",
    aware: "WATCH",
    spectrum: "Luas",
    collateral: 55,
    coverage: "Gram +/−, anaerob, Pseudomonas",
    note: "Cadangan untuk infeksi berat/polimikroba. Menekan flora usus bermakna → risiko C. difficile & kolonisasi MDRO.",
  },
  {
    id: "reserve",
    name: "Meropenem",
    aware: "WATCH (karbapenem)",
    spectrum: "Sangat luas",
    collateral: 80,
    coverage: "ESBL, Pseudomonas, anaerob, mayoritas MDRO",
    note: "Simpan untuk terapi directed ESBL/MDRO. Penggunaan empiris rutin menggerogoti opsi masa depan.",
  },
];

export default function Mission3() {
  const { completeMission, addXP } = useStore();
  const [picked, setPicked] = useState<string | null>(null);

  // skenario: pneumonia komunitas, kultur S. pneumoniae sensitif amoksisilin
  const correctId = "narrow";
  const result = picked
    ? picked === correctId
      ? { ok: true, text: "TEPAT! Patogen teridentifikasi & sensitif → narrow-spectrum ACCESS menang. Mikrobioma terlindungi, tekanan seleksi minimal." }
      : { ok: false, text: "Overkill! Spektrum lebih luas dari kebutuhan klinis meningkatkan collateral damage: disbiosis, C. difficile, dan tekanan seleksi AMR tanpa benefit tambahan." }
    : null;

  function choose(id: string) {
    setPicked(id);
    if (id === correctId) {
      addXP(40);
      completeMission(3, 120);
    }
  }

  return (
    <div className="anim-in">
      <div className="card" style={{ marginBottom: 20 }}>
        <span className="tag tag-amber">MISI 03 — SPECTRUM STRATEGY</span>
        <h2 style={{ fontSize: 24, margin: "12px 0 6px" }}>Skenario: De-eskalasi CAP</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 880, lineHeight: 1.7 }}>
          Tn. B, 60 th, pneumonia komunitas. Kultur sputum: <strong className="mono">S. pneumoniae</strong> — sensitif Amoksisilin (MIC 0,12).
          Klinis membaik. Pilih agen dengan <em>spektrum tersempit yang tetap adekuat</em> menurut WHO AWaRe.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <div style={{ display: "grid", gap: 14 }}>
          {OPTIONS.map((o) => {
            const active = picked === o.id;
            const border = active ? (o.id === correctId ? "var(--secondary)" : "var(--red)") : "var(--surface-highest)";
            return (
              <button
                key={o.id}
                onClick={() => choose(o.id)}
                className="card"
                style={{ textAlign: "left", cursor: "pointer", borderColor: border, color: "var(--text-primary)", transition: "var(--transition)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h3 style={{ fontSize: 18, flex: 1 }}>{o.name}</h3>
                  <span className={`tag ${o.aware === "ACCESS" ? "tag-mint" : o.spectrum === "Luas" ? "tag-amber" : "tag-red"}`}>{o.aware}</span>
                  <span className="tag tag-gray">spektrum {o.spectrum}</span>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 8 }}>{o.coverage}</p>
                <div style={{ marginTop: 10 }}>
                  <div className="label" style={{ fontSize: 9, marginBottom: 4 }}>COLLATERAL DAMAGE INDEX</div>
                  <div className="progress-track">
                    <div className={`progress-fill ${o.collateral < 30 ? "mint" : o.collateral < 65 ? "amber" : "red"}`} style={{ width: `${o.collateral}%` }} />
                  </div>
                </div>
                {active && <p style={{ fontSize: 12.5, color: "var(--amber)", marginTop: 10 }}>{o.note}</p>}
              </button>
            );
          })}
        </div>

        {/* Gut microbiome radar */}
        <div className="card" style={{ alignSelf: "start" }}>
          <div className="label">GUT MICROBIOME RADAR</div>
          <h3 style={{ fontSize: 17, margin: "8px 0 12px" }}>Dampak thd Flora Usus</h3>
          <MicrobiomeBars damage={picked ? OPTIONS.find((o) => o.id === picked)!.collateral : 0} />
          {result && (
            <div
              className="anim-in"
              style={{
                marginTop: 14,
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                lineHeight: 1.7,
                background: result.ok ? "var(--secondary-dim)" : "var(--red-dim)",
                border: `1px solid ${result.ok ? "var(--secondary)" : "var(--red)"}`,
              }}
            >
              {result.text}
              {result.ok && <div className="mono" style={{ marginTop: 8, color: "var(--secondary)", fontWeight: 700 }}>+120 XP • MISI 3 SELESAI ✓</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MicrobiomeBars({ damage }: { damage: number }) {
  const phyla = [
    { name: "Bacteroidetes", base: 90 },
    { name: "Firmicutes", base: 85 },
    { name: "Actinobacteria", base: 70 },
    { name: "Proteobacteria (baik)", base: 40 },
    { name: "C. difficile (kontrol)", base: 95 },
  ];
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {phyla.map((p) => {
        const val = Math.max(5, Math.round(p.base - (damage / 100) * (p.base * 0.9)));
        return (
          <div key={p.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
              <span style={{ color: "var(--text-secondary)" }}>{p.name}</span>
              <span className="mono" style={{ color: val > 60 ? "var(--secondary)" : val > 30 ? "var(--amber)" : "var(--danger)" }}>{val}%</span>
            </div>
            <div className="progress-track">
              <div className={`progress-fill ${val > 60 ? "mint" : val > 30 ? "amber" : "red"}`} style={{ width: `${val}%` }} />
            </div>
          </div>
        );
      })}
      <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
        {damage === 0 ? "PILIH AGEN UNTUK MELIHAT DAMPAK" : `ESTIMASI DAMPAK: ${damage}/100 COLLATERAL INDEX`}
      </div>
    </div>
  );
}
