# FUNK EDU — Antibiotic Fundamentals Lab & PK/PD Clinical Decision Simulator

> *Understand the drug. Outsmart resistance. Protect the future.*

Platform edukasi web untuk melatih pengambilan keputusan peresepan antimikroba rasional melalui simulasi farmakokinetik/farmakodinamik (PK/PD), kepatuhan **WHO AWaRe**, dan prinsip **5 Benar** — ditujukan untuk mahasiswa kedokteran, dokter umum, residen PPDS, dan farmasis klinis.

![Status](https://img.shields.io/badge/status-prototype-00f0ff)
![Stack](https://img.shields.io/badge/stack-React%2019%20%C2%B7%20TypeScript%20%C2%B7%20Vite%20%C2%B7%20Zustand-4edea3)

---

## Fitur Utama

| Modul | Deskripsi |
|---|---|
| **Track-first Onboarding** | Pilih Student atau Professional; Professional masuk ke verifikasi sebelum memperoleh akses |
| **Prototype Professional Verification** | Adapter deterministik dengan status pending/verified/rejected/unavailable; bukan validasi KKI/SATUSEHAT |
| **Student Assessment Suite** | Pre-test, 6 misi fundamental, Decision Room, post-test, dan Student Completion Certificate |
| **Professional Clinical Track** | Baseline 6 soal, PK/PD Workbench, Clinical Decision Room, Prescription Audit, post-test, dan Professional Track Certificate |
| **Progress Preservation** | Fondasi Student tetap tersimpan saat upgrade; tidak memenuhi gate atau sertifikat Professional |
| **PK/PD Workbench** | Simulasi 1-kompartemen IV infus real-time: 5 agen, slider dosis/τ/Tinf/MIC, kurva plasma 48 jam, %fT>MIC attainment, dinamika cawan petri |

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** — state management terpisah untuk identitas, Student assessment, Professional assessment, dan verification state
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
        ├── data/               # pkEngine, drugs, content, centralized personas
        ├── services/           # ProfessionalVerificationService + deterministic prototype adapter
        ├── screens/            # Track onboarding, verification, Student/Professional dashboards, learning, certificates
        │   └── missions/       # Misi 1–6
        ├── routes.ts           # Central route metadata, access, and progression guards
        ├── store.ts            # Zustand identity and separate progression state
        └── types.ts            # Account, verification, and assessment domain types
```

## Model Farmakokinetik

Workbench mengimplementasikan model satu-kompartemen IV infus (PRD §4.2):

- Konsentrasi selama infus: `C(t) = Dosis/(Tinf·CL) × (1 − e^(−ke·t))`
- Eliminasi pasca-infus: `C(t) = Cpeak × e^(−ke·(t−Tinf))`
- Target β-laktam: **%fT > MIC ≥ 70%** (bakterisidal optimal)
- Target aminoglikosida: **Cmax/MIC ≥ 10**; FQ/vankomisin: **AUC/MIC**

## Disclaimer

Konten medis dalam repositori ini adalah **dummy data untuk tujuan edukasi dan pengembangan UI** — bukan panduan terapi klinis. Verifikasi Professional saat ini memakai data fixture deterministik dan selalu ditandai **“Simulasi verifikasi — bukan validasi KKI/SATUSEHAT”**. Memilih track atau profesi tidak memverifikasi identitas dan tidak memberi akses Professional. Integrasi produksi memerlukan layanan server-to-server berizin dengan registry/data service Indonesia yang relevan. Sertifikat yang dihasilkan adalah credential edukasi lokal, bukan lisensi profesi atau dokumen verifikasi eksternal.

---

© 2026 FUNK EDU Team — Prototype v2.0.0
