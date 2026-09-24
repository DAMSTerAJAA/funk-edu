# FUNK EDU — Antibiotic Fundamentals Lab & PK/PD Clinical Decision Simulator

> *Understand the drug. Outsmart resistance. Protect the future.*

Platform edukasi web untuk melatih pengambilan keputusan peresepan antimikroba rasional melalui simulasi farmakokinetik/farmakodinamik (PK/PD), kepatuhan **WHO AWaRe**, dan prinsip **5 Benar** — ditujukan untuk mahasiswa kedokteran, dokter umum, residen PPDS, dan farmasis klinis.

![Status](https://img.shields.io/badge/status-prototype-00f0ff)
![Stack](https://img.shields.io/badge/stack-React%2019%20%C2%B7%20TypeScript%20%C2%B7%20Vite%20%C2%B7%20Zustand-4edea3)

---

## Fitur Utama

| Modul | Deskripsi |
|---|---|
| **Auth & Role Onboarding** | Role selector (mahasiswa, GP, residen, farmasis) + quick demo |
| **Pre/Post-Test Suite** | 10 soal vignette klinis, timer 25 menit, rationale drawer |
| **6 Misi Interaktif** | Infection Detective, Target Hunter, Spectrum Strategy, MIC Battle Lab, Resistance Evolution, Wise Guardian — unlock bertahap |
| **PK/PD Workbench** | Simulasi 1-kompartemen IV infus real-time: 5 agen, slider dosis/τ/Tinf/MIC, kurva plasma 48 jam, %fT>MIC attainment, dinamika cawan petri |
| **Clinical Decision Room** | Kasus CAP 8 hari: terapi empiris → antibiogram → Antibiotic Time-Out 48–72 jam → de-eskalasi IV→oral |
| **Sertifikasi** | Scorecard radial, radar 5 domain, 4 lencana heksagonal, credential ID + QR validator |

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** — state management (user, simulasi, assessment)
- **SVG custom** — kurva plasma neon, petri dish, radar chart (tanpa chart library)
- Font: Space Grotesk · JetBrains Mono · Plus Jakarta Sans

## Menjalankan Lokal

```bash
cd app
npm install
npm run dev      # http://localhost:5173
```

Build production:

```bash
npm run build    # output: app/dist
```

## Struktur Proyek

```
FUNKEDU/
├── docs/
│   └── prd.md                  # Product Requirement Document (spesifikasi penuh)
└── app/                        # Frontend React
    └── src/
        ├── components/         # AppShell, PlasmaCurve, PetriDish, RadarChart
        ├── data/               # pkEngine (model PK), drugs, content (soal & kasus)
        ├── screens/            # Auth, Exam, Dashboard, Workbench, ClinicalRoom, Certificate
        │   └── missions/       # Misi 1–6
        ├── store.ts            # Zustand global store
        └── types.ts            # Skema state (PRD §4.1)
```

## Model Farmakokinetik

Workbench mengimplementasikan model satu-kompartemen IV infus (PRD §4.2):

- Konsentrasi selama infus: `C(t) = Dosis/(Tinf·CL) × (1 − e^(−ke·t))`
- Eliminasi pasca-infus: `C(t) = Cpeak × e^(−ke·(t−Tinf))`
- Target β-laktam: **%fT > MIC ≥ 70%** (bakterisidal optimal)
- Target aminoglikosida: **Cmax/MIC ≥ 10**; FQ/vankomisin: **AUC/MIC**

## Disclaimer

Konten medis dalam repositori ini adalah **dummy data untuk tujuan edukasi dan pengembangan UI** — bukan panduan terapi klinis. Selalu rujuk pedoman resmi (IDSA/ATS, EUCAST, PPRA Kemenkes) dan antibiogram lokal.

---

© 2026 FUNK EDU Team — Prototype v2.0.0
