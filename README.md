# FUNK EDU — Antibiotic Fundamentals Lab & Resistance Evolution Simulator

> *Understand the drug. Outsmart resistance. Protect the future.*

Platform edukasi web untuk melatih pengambilan keputusan peresepan antimikroba rasional melalui simulasi evolusi resistensi, kepatuhan **WHO AWaRe**, dan prinsip **5 Benar** — ditujukan untuk mahasiswa kedokteran, dokter umum, residen PPDS, dan farmasis klinis.

![Status](https://img.shields.io/badge/status-prototype-00f0ff)
![Stack](https://img.shields.io/badge/stack-React%2019%20%C2%B7%20TypeScript%20%C2%B7%20Vite%20%C2%B7%20Zustand-4edea3)

---

## Fitur Utama

| Modul | Deskripsi |
|---|---|
| **Track-first Onboarding** | Pilih Student atau Professional; Professional masuk ke verifikasi sebelum memperoleh akses |
| **Prototype Professional Verification** | Adapter deterministik dengan status pending/verified/rejected/unavailable; bukan validasi KKI/SATUSEHAT |
| **Student Assessment Suite** | Pre-test, 6 misi fundamental, Decision Room, post-test, dan Student Completion Certificate |
| **Professional Clinical Track** | Baseline 6 soal, Resistance Lab, Clinical Decision Room, Prescription Audit, post-test, dan Professional Track Certificate |
| **Progress Preservation** | Fondasi Student tetap tersimpan saat upgrade; tidak memenuhi gate atau sertifikat Professional |
| **Resistance Lab (Misi 4)** | Simulasi evolusi populasi rentan (S) vs resisten (R): slider dosis × MIC, 4 skenario preset, cawan petri, grafik populasi & proporsi resisten, verdict klinis |

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** — state management terpisah untuk identitas, Student assessment, Professional assessment, dan verification state
- **SVG custom** — grafik populasi neon, petri dish, radar chart (tanpa chart library)
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
        ├── components/         # AppShell, MissionFooter, PetriDish, RadarChart
        ├── data/               # resistanceEngine, content, centralized personas
        ├── services/           # ProfessionalVerificationService + deterministic prototype adapter
        ├── screens/            # Track onboarding, verification, Student/Professional dashboards, learning, certificates
        │   └── missions/       # Misi 1–6
        ├── routes.ts           # Central route metadata, access, and progression guards
        ├── store.ts            # Zustand identity and separate progression state
        └── types.ts            # Account, verification, and assessment domain types
```

## Model Simulasi Resistensi

Resistance Lab mengimplementasikan model populasi S vs R tereduksi (PRD §4.2):

- Laju bunuh bergantung konsentrasi: `k(C, MIC) = Kmax·(C/MIC)² / (1 + (C/MIC)²)`
- Flux mutasi spontan (μ = 2×10⁻⁶) dan transfer gen horizontal (konjugasi plasmid)
- Fitness cost galur resisten 12% saat tidak ada tekanan obat
- Eliminasi oleh imun inang saat beban bakteri < 800 sel
- Verdict **Sembuh Total** (eradikasi) menyelesaikan Misi 4 dan mengklaim +150 XP

## Disclaimer

Konten medis dalam repositori ini adalah **dummy data untuk tujuan edukasi dan pengembangan UI** — bukan panduan terapi klinis. Verifikasi Professional saat ini memakai data fixture deterministik dan selalu ditandai **“Simulasi verifikasi — bukan validasi KKI/SATUSEHAT”**. Memilih track atau profesi tidak memverifikasi identitas dan tidak memberi akses Professional. Integrasi produksi memerlukan layanan server-to-server berizin dengan registry/data service Indonesia yang relevan. Sertifikat yang dihasilkan adalah credential edukasi lokal, bukan lisensi profesi atau dokumen verifikasi eksternal.

---

© 2026 FUNK EDU Team — Prototype v2.0.0
