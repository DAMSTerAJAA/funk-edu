// ============================================================
// FUNK EDU — Misi 4 + PK/PD Workbench Simulator (PRD §4)
// ============================================================
import { useMemo, useState } from "react";
import { useStore } from "../store";
import { DRUGS } from "../data/drugs";
import { simulate } from "../data/pkEngine";
import type { DrugId } from "../types";
import PlasmaCurve from "../components/PlasmaCurve";
import PetriDish from "../components/PetriDish";

const PETRI_TIMES = [0, 12, 24, 36, 48];

export default function WorkbenchScreen() {
  const { simulation, updateSim, completeMission, addXP, assessment } = useStore();
  const drug = DRUGS[simulation.activeDrug];
  const [challengeDone, setChallengeDone] = useState(assessment.completedMissions.includes(4));

  const { points, metrics } = useMemo(() => simulate(simulation), [simulation]);

  const statusColor = metrics.status === "optimal" ? "var(--secondary)" : metrics.status === "suboptimal" ? "var(--amber)" : "var(--danger)";
  const statusLabel =
    metrics.status === "optimal" ? "OPTIMAL BAKTERISIDAL" : metrics.status === "suboptimal" ? "SUB-OPTIMAL BAKTERIOSTATIK" : "KEGAGALAN / SELEKSI MUTAN";

  const attainmentPct = drug.category === "time" ? metrics.fTOverMic : drug.category === "concentration" ? Math.min(100, (metrics.cMaxOverMic / 10) * 100) : Math.min(100, (metrics.aucOverMic / 125) * 100);

  function claimChallenge() {
    if (metrics.isOptimal && !challengeDone) {
      addXP(50);
      completeMission(4, 150);
      setChallengeDone(true);
    }
  }

  const killAt = (t: number) => Math.min(1, (attainmentPct / 100) * Math.min(1, t / 36));

  return (
    <div className="anim-in">
      {/* ---------- Header + drug picker ---------- */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="tag tag-cyan">MISI 04 — MIC BATTLE LAB</span>
            <h2 style={{ fontSize: 24, marginTop: 8 }}>PK/PD Workbench Simulator</h2>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(Object.keys(DRUGS) as DrugId[]).map((id) => (
              <button
                key={id}
                className={`pill ${simulation.activeDrug === id ? "active" : ""}`}
                onClick={() => {
                  const d = DRUGS[id];
                  updateSim({ activeDrug: id, doseGrams: d.doseOptionsG[d.doseOptionsG.length - 2] ?? d.doseOptionsG[0], intervalHours: d.tauOptionsH[0], infusionDurationHours: d.tinfOptionsH[0], micTarget: d.micOptions[Math.min(2, d.micOptions.length - 1)] });
                }}
              >
                {DRUGS[id].name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span className={`tag ${drug.aware === "ACCESS" ? "tag-mint" : "tag-amber"}`}>WHO AWaRe: {drug.aware}</span>
          <span className="tag tag-gray">{drug.klass}</span>
          <span className="tag tag-cyan">TARGET: {drug.targetDesc}</span>
          <span className="tag tag-gray">t½ {drug.halfLifeH}h • Vd {drug.vdPerKg} L/kg • PB {Math.round(drug.proteinBinding * 100)}%</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
        {/* ---------- Regimen controller ---------- */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>PATIENT BIO DATA (ICU)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
              <div>
                <div className="label" style={{ fontSize: 9 }}>BERAT BADAN</div>
                <div className="mono" style={{ fontSize: 18, color: "var(--primary)" }}>{simulation.patientWeightKg} kg</div>
                <input type="range" min={45} max={110} value={simulation.patientWeightKg} onChange={(e) => updateSim({ patientWeightKg: +e.target.value })} style={{ width: "100%" }} />
              </div>
              <div>
                <div className="label" style={{ fontSize: 9 }}>CrCl</div>
                <div className="mono" style={{ fontSize: 18, color: "var(--primary)" }}>{simulation.crCl} mL/min</div>
                <input type="range" min={20} max={130} value={simulation.crCl} onChange={(e) => updateSim({ crCl: +e.target.value })} style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 12 }}>REGIMEN CONTROLLER</div>

            <div className="label" style={{ fontSize: 9, marginBottom: 6 }}>DOSIS (gram)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {drug.doseOptionsG.map((d) => (
                <button key={d} className={`pill ${simulation.doseGrams === d ? "active" : ""}`} onClick={() => updateSim({ doseGrams: d })}>
                  {d} g
                </button>
              ))}
            </div>

            <div className="label" style={{ fontSize: 9, marginBottom: 6 }}>INTERVAL τ (jam)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {drug.tauOptionsH.map((t) => (
                <button key={t} className={`pill ${simulation.intervalHours === t ? "active" : ""}`} onClick={() => updateSim({ intervalHours: t })}>
                  q{t}h
                </button>
              ))}
            </div>

            <div className="label" style={{ fontSize: 9, marginBottom: 6 }}>DURASI INFUS (Tinf)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {drug.tinfOptionsH.map((t) => (
                <button key={t} className={`pill ${simulation.infusionDurationHours === t ? "active-mint" : ""}`} onClick={() => updateSim({ infusionDurationHours: t })}>
                  {t < 1 ? `${t * 60} mnt` : `${t} jam`} {t >= 3 && drug.category === "time" ? "• EI" : ""}
                </button>
              ))}
            </div>

            <div className="label" style={{ fontSize: 9, marginBottom: 6 }}>MIC TARGET (mcg/mL)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {drug.micOptions.map((m) => (
                <button key={m} className={`pill ${simulation.micTarget === m ? "active-amber" : ""}`} onClick={() => updateSim({ micTarget: m })}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics readout */}
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>TELEMETRI STEADY-STATE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Metric label="Cmax" value={`${metrics.cMax.toFixed(1)}`} unit="mg/L" />
              <Metric label="C-trough (bebas)" value={`${metrics.cTrough.toFixed(2)}`} unit="mg/L" />
              <Metric label="AUC24" value={`${metrics.auc24.toFixed(0)}`} unit="mg·h/L" />
              <Metric
                label={drug.category === "time" ? "%fT > MIC" : drug.category === "concentration" ? "Cmax/MIC" : "AUC/MIC"}
                value={drug.category === "time" ? `${metrics.fTOverMic.toFixed(0)}%` : drug.category === "concentration" ? `${metrics.cMaxOverMic.toFixed(1)}` : `${metrics.aucOverMic.toFixed(0)}`}
                unit=""
                highlight
                color={statusColor}
              />
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span className="label" style={{ fontSize: 9 }}>ATTAINMENT vs TARGET ({drug.targetPct}%)</span>
                <span className="mono" style={{ color: statusColor, fontWeight: 700 }}>{attainmentPct.toFixed(0)}%</span>
              </div>
              <div className="progress-track" style={{ height: 12 }}>
                <div className={`progress-fill ${metrics.status === "optimal" ? "mint" : metrics.status === "suboptimal" ? "amber" : "red"}`} style={{ width: `${Math.min(100, attainmentPct)}%` }} />
              </div>
              <div className="mono" style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
            </div>

            <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 14 }} disabled={!metrics.isOptimal || challengeDone} onClick={claimChallenge}>
              {challengeDone ? "✓ MISI 4 SELESAI (+150 XP)" : metrics.isOptimal ? "Klaim: Regimen Optimal Tercapai ✓" : "Capai regimen optimal untuk klaim XP"}
            </button>
          </div>
        </div>

        {/* ---------- Chart + petri dynamics ---------- */}
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div className="label">KURVA PLASMA MULTI-DOSIS — {simulation.steadyStateDoses} DOSIS / {simulation.steadyStateDoses * simulation.intervalHours} JAM</div>
              <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                <span className="mono" style={{ color: "var(--primary)" }}>— total C</span>
                <span className="mono" style={{ color: "var(--secondary)" }}>┄ bebas fC</span>
                <span className="mono" style={{ color: "var(--amber)" }}>┅ MIC</span>
              </div>
            </div>
            <PlasmaCurve points={points} mic={simulation.micTarget} tau={simulation.intervalHours} />
            <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              Model 1-kompartemen IV infus • ke disesuaikan CrCl • hover untuk inspeksi titik. Garis vertikal putus-putus = waktu pemberian dosis.
            </div>
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>DINAMIKA KOLONI CAWAN PETRI — RESPON BAKTERI</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              {PETRI_TIMES.map((t) => (
                <PetriDish
                  key={t}
                  seed={t + 3}
                  killFraction={t === 0 ? 0 : killAt(t)}
                  resistantFraction={metrics.status === "optimal" ? 0.01 : metrics.status === "suboptimal" ? 0.15 : 0.5}
                  size={132}
                  label={`t = ${t}h`}
                />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
              <Metric label="Koloni Hidup (CFU/mL)" value={metrics.colonyCountLive.toExponential(1)} unit="" color="var(--amber)" />
              <Metric label="Mutan Resisten" value={metrics.resistantMutantCount.toLocaleString()} unit="CFU" color={metrics.resistantMutantCount > 1000 ? "var(--danger)" : "var(--secondary)"} />
              <Metric label="Mikrobioma Terjaga" value={`${metrics.microbiomePreservation}%`} unit="" color="var(--primary)" />
            </div>
          </div>

          {/* Stewardship scorecard */}
          <div className="card">
            <div className="label" style={{ marginBottom: 10 }}>STEWARDSHIP SCORECARD BREAKDOWN</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, fontSize: 12 }}>
              <Score label="PK/PD Attainment" pct={attainmentPct} />
              <Score label="Spektrum Bijaksana" pct={drug.spectrum === "narrow" ? 95 : drug.spectrum === "broad" ? 60 : 35} />
              <Score label="Perlindungan Mikrobioma" pct={metrics.microbiomePreservation} />
              <Score label="Penekanan Mutan" pct={Math.max(5, 100 - Math.min(100, metrics.resistantMutantCount / 20))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, highlight, color }: { label: string; value: string; unit: string; highlight?: boolean; color?: string }) {
  return (
    <div className="card card-low" style={{ padding: 12, border: highlight ? "1px solid var(--surface-highest)" : undefined }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div className="mono" style={{ fontSize: 19, fontWeight: 700, color: color ?? "var(--text-primary)", marginTop: 2 }}>
        {value} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>{unit}</span>
      </div>
    </div>
  );
}

function Score({ label, pct }: { label: string; pct: number }) {
  const c = pct >= 70 ? "mint" : pct >= 50 ? "amber" : "red";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="mono" style={{ fontWeight: 700 }}>{Math.round(pct)}</span>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${c}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
