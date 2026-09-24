# Product Requirement Document (PRD) — Edisi Komprehensif Teknis & Arsitektur Frontend
## FUNK EDU — Antibiotic Fundamentals Lab & PK/PD Clinical Decision Simulator
*Version: 2.0.0-PROD | Status: Approved Specification | Target: Web Desktop Medical Workstation (1440px+)*

---

### 1. Ringkasan Eksekutif & Karakteristik Platform
- **Nama Produk:** FUNK EDU — Antibiotic Fundamentals Lab & PK/PD Decision Platform
- **Slogan:** *Understand the drug. Outsmart resistance. Protect the future.*
- **Target Pengguna:** Mahasiswa Kedokteran (Klinik & Pre-klinik), Dokter Internship/Umum (GP/Hospitalist), Residen PPDS (Penyakit Dalam/Anestesi/Pediatri), dan Farmasis Klinis ID Stewards.
- **Tujuan Pedagogis:** Melatih pengambilan keputusan peresepan antimikroba rasional secara objektif dan terukur melalui simulasi farmakokinetik/farmakodinamik (PK/PD), kepatuhan WHO AWaRe classification, dan prinsip 5 Benar (Right Patient, Drug, Dose, Route, Duration) untuk mencegah laju *Antimicrobial Resistance (AMR)*.

---

### 2. Arsitektur Alur Pengguna (Detailed Multi-Tier User Journey & State Flow)

```
                          ┌─────────────────────────────────────────────────┐
                          │         [01. AUTH & ROLE ONBOARDING]            │
                          │  • SSO Medis / Email Institusi                  │
                          │  • Role Selector (Mahasiswa, GP, Sp.PD, Farmasis)│
                          │  • Quick Demo Switcher (dr. Althea Vance)       │
                          └────────────────────────┬────────────────────────┘
                                                   │
                                                   ▼
                          ┌─────────────────────────────────────────────────┐
                          │      [02. PRE-TEST ASSESSMENT SUITE]            │
                          │  • 10 Soal Vignette Klinis Terintegrasi         │
                          │  • Timer Mundur 25 Menit (Session Lock)         │
                          │  • Diagnostic Baseline Radar (5 Domain)         │
                          └────────────────────────┬────────────────────────┘
                                                   │
                                                   ▼
                          ┌─────────────────────────────────────────────────┐
                          │   [03. DASHBOARD LAB FUNDAMENTALS & MISSIONS]   │
                          │  • Top HUD: XP Counter, Lab Coins, Streak, Rank │
                          │  • Modular Level Progression Gate (Level 1-6)   │
                          └────────────────────────┬────────────────────────┘
                                                   │
         ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
         ▼                                         ▼                                         ▼
┌───────────────────────────┐    ┌───────────────────────────────────┐     ┌───────────────────────────────────┐
│   [6 MISI INTERAKTIF]     │    │   [PK/PD WORKBENCH SIMULATOR]     │     │   [CLINICAL DECISION ROOM]        │
│                           │    │                                   │     │                                   │
│ 1. Infection Detective    │    │ • Pemilihan 5 Agen Antimikroba    │     │ • Perjalanan Pasien 8 Milestones  │
│    (Centor Score & Viral) │    │ • Slider Dosis Gram & Interval τ  │     │   (D0 IGD s/d D7 Discharge)       │
│ 2. Target Hunter          │    │ • Toggle Durasi Infus (30m vs EI) │     │ • Formulasi Terapi Empiris IDSA   │
│    (MOA Seluler Bakteri)  │    │ • Real-time SVG Plasma Curve      │     │ • Evaluasi Antibiogram Sputum     │
│ 3. Spectrum Strategy      │    │ • Kalkulator %fT > MIC Attainment │     │ • 48-72h Antibiotic Time-Out      │
│    (AWaRe & Usus Radar)   │    │ • Dinamika Koloni Cawan Petri     │     │ • De-eskalasi IV ke Oral Switch   │
│ 4. MIC Battle Lab         │    │ • Donut Bakterisidal vs Resisten  │     │ • Spider Chart 6 Domain           │
│    (Kinetika fT vs Cmax)  │    └─────────────────┬─────────────────┘     └─────────────────┬─────────────────┘
│ 5. Resistance Evolution   │                      │                                         │
│    (Seleksi Klon Mutan)   │                      │                                         │
│ 6. Wise Guardian          │                      │                                         │
│    (Audit 5T EMR Preskripsi)                     │                                         │
└─────────────┬─────────────┘                      │                                         │
              │                                    │                                         │
              └────────────────────────────────────┼─────────────────────────────────────────┘
                                                   │
                                                   ▼
                          ┌─────────────────────────────────────────────────┐
                          │         [04. FINAL COMPREHENSIVE CHALLENGE]     │
                          │  • Kasus Kritis Sepsis Nosokomial ICU           │
                          │  • Ujian Mandiri Tanpa Bantuan Hint             │
                          │  • Penalti XP pada Keputusan Suboptimal         │
                          └────────────────────────┬────────────────────────┘
                                                   │
                                                   ▼
                          ┌─────────────────────────────────────────────────┐
                          │         [05. POST-TEST EVALUATION SUITE]        │
                          │  • 10 Soal Kasus Lanjutan                       │
                          │  • Passing Grade Ketat: Minimal 80% (8/10)      │
                          │  • Evaluasi Delta Peningkatan Pemahaman         │
                          └────────────────────────┬────────────────────────┘
                                                   │
                                                   ▼
                          ┌─────────────────────────────────────────────────┐
                          │   [06. LAPORAN KOMPETENSI & SERTIFIKASI RESMI]  │
                          │  • Scorecard A+ & Radar 5 Domain Kompetensi     │
                          │  • 4 Lencana Heksagonal Riset Terbuka           │
                          │  • Sertifikat Digital PDF & QR Validator ID     │
                          │  • Hash Integritas Medis PPRA Kemenkes 2026     │
                          └─────────────────────────────────────────────────┘
```

#### Rincian Transisi State Antar-Layar:
1. **State `AUTH_GUEST`**: Pengguna baru atau demo mengakses layar login/registrasi. Memilih role menentukan bobot kasus default dan glosarium referensi.
2. **State `PRETEST_LOCKED`**: Pre-test bersifat wajib diselesaikan sekali di awal untuk membangun *baseline scoring*. Sesi dibatasi timer 25 menit. Skor pre-test otomatis mengunci data awal pada Radar Kompetensi.
3. **State `MISSION_PROGRESSION`**: Misi 1 sampai 6 dirancang terbuka secara bertahap (*unlock on previous success*), dengan umpan balik instan jika klinisi mengambil keputusan kontraproduktif (misal: memberikan sefalosporin pada etiologi rhinovirus viral akan memicu penalti -30 XP dan alert disbiosis usus).
4. **State `WORKBENCH_RUNNING`**: Pengguna bebas bereksperimen dengan kombinasi obat dan durasi infus. Tombol "Jalankan Simulasi" menghitung ulang matriks kinetika dalam memori klien dan merender grafik kurva plasma 48 jam.
5. **State `CLINICAL_DECISION_STAGES`**: Pasien rawat inap mengikuti alur hari Day 0 s/d Day 7. Setiap pemilihan obat empiris, pembacaan kultur sputum, hingga *Antibiotic Time-Out 48–72h* memiliki cabang konsekuensi langsung terhadap durasi rawat inap dan skor efisiensi farmasi.
6. **State `POSTTEST_PASSED`**: Hanya dapat diakses setelah 6 Misi dan Kasus CAP selesai. Bila skor $\ge 80\%$, kredensial unik diterbitkan (misal: `FE-ABX-2026-8829`) dan sertifikat PDF resmi dibuka untuk diunduh.

---

### 3. Arsitektur Frontend & Hierarki Komponen UI

#### 3.1. Struktur Modul & Komponen UI (Component Tree)
```
<AppLayout>
  ├── <PersistentHeaderHUD>
  │     ├── <BrandLogoBadge> (FUNK EDU + Biolab Emblem)
  │     ├── <AppNavigationBar> (Active Route Tracker)
  │     ├── <GamificationTelemetryStrip>
  │     │     ├── <XPCounter animate="pulse" />
  │     │     ├── <CoinBalance />
  │     │     ├── <StreakCounter />
  │     │     └── <RankBadge title="Junior Steward" />
  │     └── <UserProfileSnapshot avatarUrl="..." status="online" />
  │
  ├── <MainContentArea viewport="1440px+">
  │     │
  │     ├── [Screen: Auth / Registrasi]
  │     │     ├── <BioLabGateCard>
  │     │     ├── <FormInput icon="mail" />
  │     │     ├── <RoleDropdownSelector />
  │     │     ├── <QuickDemoSwitcher />
  │     │     └── <SecurityBadgePPRA />
  │     │
  │     ├── [Screen: Pre-Test & Post-Test Hub]
  │     │     ├── <ExamHeaderCountdownTimer value="25:00" />
  │     │     ├── <QuestionStepProgress indicator="segmented_5_or_10" />
  │     │     ├── <ClinicalVignetteCard patientPhoto="..." text="..." />
  │     │     ├── <InteractiveOptionMatrix multipleChoice="A|B|C|D" />
  │     │     ├── <ClinicalRationaleDrawer collapsible="true" />
  │     │     ├── <InlineSVG_PKPDCurveTarget />
  │     │     └── <AnswerSheetMatrix answeredCount="n/10" />
  │     │
  │     ├── [Screen: 6 Misi Interaktif]
  │     │     ├── Misi 1: <InfectionDetectiveModule>
  │     │     │     ├── <PatientDossierURTI />
  │     │     │     ├── <CentorScoreCalculator liveCalc="true" />
  │     │     │     ├── <ViralVsBacterialComparator />
  │     │     │     └── <DecisionActionButtons />
  │     │     │
  │     │     ├── Misi 2: <TargetHunterModule>
  │     │     │     ├── <BacterialCellInteractiveSVG viewBox="760x480">
  │     │     │     │     ├── <TargetZone id="cell-wall" pbp="true" />
  │     │     │     │     ├── <TargetZone id="ribosome-30s" />
  │     │     │     │     ├── <TargetZone id="ribosome-50s" />
  │     │     │     │     ├── <TargetZone id="dna-gyrase" />
  │     │     │     │     └── <TargetZone id="folate-pathway" />
  │     │     │     ├── <DrugSelectorDeck (5 Drugs) />
  │     │     │     └── <MechanismIntelligenceFeed />
  │     │     │
  │     │     ├── Misi 3: <SpectrumStrategyModule>
  │     │     │     ├── <GutMicrobiomeRadarSVG />
  │     │     │     ├── <SpectrumTrioCards (Narrow vs Broad vs Reserve) />
  │     │     │     └── <CollateralDamageVerdictTray />
  │     │     │
  │     │     ├── Misi 4 & Workbench: <PKPDWorkbenchModule>
  │     │     │     ├── <PatientBioDataICU />
  │     │     │     ├── <RegimenControllerSteppers>
  │     │     │     │     ├── <DoseStepper Gram="2.25|3.375|4.5|6.75" />
  │     │     │     │     ├── <IntervalPills tau="6h|8h|12h" />
  │     │     │     │     ├── <InfusionDurationPills Tinf="30m|3h|4h" />
  │     │     │     │     └── <MICBreakpointPills value="0.5-16.0" />
  │     │     │     ├── <InteractiveMultiDoseSVGChart (8 Doses, 0-48h) />
  │     │     │     ├── <AttainmentProgressBar target="70%" current="%" />
  │     │     │     ├── <BacterialDynamicsPetriDish (0h, 12h, 24h, 36h, 48h) />
  │     │     │     └── <StewardshipScorecardBreakdown />
  │     │     │
  │     │     ├── Misi 5: <ResistanceEvolutionModule>
  │     │     │     ├── <PetriTimelineArray (Day 0, Day 5, Day 10) />
  │     │     │     ├── <ComparativeKillCurveSVG (Suboptimal vs EI) />
  │     │     │     └── <EffluxAndAmpCInspector />
  │     │     │
  │     │     └── Misi 6: <WiseGuardianModule>
  │     │           ├── <FiveRightsChecklist interactive="true" />
  │     │           └── <WardPrescriptionAuditTrio (Case A, B, C) />
  │     │
  │     ├── [Screen: Clinical Decision Room — GP / IGD]
  │     │     ├── <PatientJourneyHorizontalStepper (8 Days) />
  │     │     ├── <PatientAdmissionCard CURB65="2" />
  │     │     ├── <VitalsDiagnosticSensors SpO2="92%" Temp="38.6" />
  │     │     ├── <ChestXRayViewerWithZoom />
  │     │     ├── <AntibiogramTable matrix="CLSI" />
  │     │     ├── <TimeOutDecisionModule action="de-escalate" />
  │     │     └── <RadarChartSixDomains />
  │     │
  │     └── [Screen: Laporan Capaian Belajar & Sertifikasi]
  │           ├── <OverallScoreRadialProgress score="86/100" grade="A+" />
  │           ├── <DomainMasteryBars (5 Domains) />
  │           ├── <HexagonalBadgesGallery (4 Badges Unlocked) />
  │           ├── <CertificateCredentialCard printable="true" />
  │           │     ├── <QRValidatorCode />
  │           │     ├── <DigitalCMOSignature />
  │           │     └── <CryptoSecurityHash />
  │           └── <ActionExportPDFButtonGroup />
  │
  └── <PersistentLabFooter>
        ├── <SystemProtocolLegend text="WHO AWaRe v4.8 Verified" />
        └── <OnlineTelemetryStatus text="NOMINAL • 60 FPS" />
```

---

### 4. Spesifikasi State Management & Kinetika Real-Time (Client-Side)

#### 4.1. Global Store State Schema
```typescript
interface GlobalBiolabState {
  user: {
    name: string;
    role: 'mahasiswa' | 'residen' | 'dokter_umum' | 'farmasis';
    xp: number;
    coins: number;
    streakDays: number;
    rank: string;
  };
  simulation: {
    activeDrug: 'piperacillin_tazo' | 'meropenem' | 'vancomycin' | 'gentamicin' | 'levofloxacin';
    doseGrams: number;       // default 4.5
    intervalHours: number;   // tau: 6, 8, atau 12
    infusionDurationHours: number; // 0.5 (30 min), 3.0, atau 4.0
    micTarget: number;       // 0.5, 1.0, 2.0, 4.0, 8.0, 16.0 mcg/mL
    patientWeightKg: number; // default 70 kg
    crCl: number;            // default 68 mL/min
    steadyStateDoses: number;// 8 dosis (48 jam)
  };
  metrics: {
    cMax: number;
    cTrough: number;
    auc24: number;
    fT_over_mic_percentage: number;
    isOptimalAttained: boolean;
    colonyCountLive: number;
    resistantMutantCount: number;
    microbiomePreservationScore: number;
  };
  assessment: {
    pretestScore: number | null;
    posttestScore: number | null;
    currentQuestionIndex: number;
    answersMap: Record<number, string>;
    unlockedMissions: number[]; // e.g. [1, 2, 3, 4, 5, 6]
    earnedBadges: string[];
  };
}
```

#### 4.2. Algoritma Perhitungan Kinetika Plasma Bebas ($fC$) Satu Kompartemen IV Infus
Untuk obat *Time-Dependent* seperti Piperacillin-Tazobactam:
1. **Klirens Obat ($CL$) dan Volume Distribusi ($V_d$):**
   $$V_d = 0.20 \times \text{Berat Badan (kg)}$$
   $$k_e = \frac{\ln(2)}{t_{1/2}} \approx \frac{0.693}{1.0} = 0.693 \text{ jam}^{-1}$$
   $$CL = k_e \times V_d$$
2. **Konsentrasi Plasma Selama Infus ($0 \le t \le T_{\text{inf}}$):**
   $$C(t) = \frac{\text{Dosis}}{T_{\text{inf}} \times CL} \times \left(1 - e^{-k_e \cdot t}\right) + C_0 \cdot e^{-k_e \cdot t}$$
3. **Konsentrasi Plasma Pasca Infus / Fase Eliminasi ($t > T_{\text{inf}}$):**
   $$C(t) = C_{\text{peak}} \times e^{-k_e \cdot (t - T_{\text{inf}})}$$
4. **Fraksi Waktu Bebas di Atas MIC ($\%fT > \text{MIC}$):**
   Fraksi konsentrasi obat tak terikat protein ($f_u = 1 - 0.30 = 0.70$):
   $$fC(t) = C(t) \times f_u$$
   $$\%fT > \text{MIC} = \frac{\text{Waktu kumulatif di mana } fC(t) \ge \text{MIC}}{\tau} \times 100\%$$
   - Bila $\%fT > \text{MIC} \ge 70\% \rightarrow$ **Optimal Bakterisidal** (Eradikasi kuman total, mutasi tertekan).
   - Bila $50\% \le \%fT > \text{MIC} < 70\% \rightarrow$ **Sub-optimal Bakteriostatik** (Risiko kolonisasi resisten sekunder).
   - Bila $\%fT > \text{MIC} < 50\% \rightarrow$ **Kegagalan Terapi / Seleksi Mutan Aktif**.

---

### 5. Panduan Desain Token & Interaksi Komponen Frontend

1. **Palet Warna & Kontras Cyber-Clinical:**
   - Background Master: `#081229` (Deep Naval Biolab)
   - Surface Containers: `#040d24` (Lowest), `#111b32` (Low), `#151f36` (Container), `#202941` (High), `#2b344d` (Highest)
   - Aksen Utama: `#00f0ff` (Primary Cyan) & `#00dbe9` (Primary Fixed Dim)
   - Aksen Sensitif/Optimal/Success: `#4edea3` (Secondary Mint) & `#00a572` (Container)
   - Aksen Batas Kritis/MIC/Watch: `#fbbf24` (Amber Gold)
   - Aksen Mutan Resisten/Bahaya/Reserve: `#ffb4ab` & `#ef4444` (Crimson Red)

2. **Tipografi Hirarki Medis:**
   - Display & Headline: **Space Grotesk** (600/700 font weight) — Menampilkan judul laboratorium, nama modul, dan skor capaian.
   - Telemetri & Monospace: **JetBrains Mono** (500/600/700) — Untuk angka numerik konsentrasi plasma, MIC, timer countdown, rumus kinetika, dan hash kredensial.
   - Body & Penjelasan Klinis: **Plus Jakarta Sans** (400/500/600) — Kenyamanan membaca anamnesis panjang, vignette pasien, dan rasional farmakologi.

3. **Interaktivitas Visual & Animasi:**
   - Kurva gelombang plasma SVG menggunakan efek drop-shadow / filter neon glow `#00f0ff`.
   - Cawan petri mikrobiologi merender koloni berbentuk lingkaran SVG secara dinamis berdasarkan parameter regresi waktu (0 jam hingga 48 jam).
   - State transisi hover tombol dan stepper menerapkan `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)` dengan efek active scale `0.98`.

---

### 6. Rencana Implementasi & Pengujian Kualitas
- **Unit Testing Kinetika:** Validasi keakuratan rumus $\%fT > \text{MIC}$ terhadap data rujukan *EUCAST* dan *Clinical Pharmacokinetics Handbook*.
- **Rendering Benchmark:** Memastikan seluruh animasi kurva SVG, diagram sel bakteri, dan timeline cawan petri beroperasi stabil pada $\ge 60 \text{ FPS}$ di resolusi desktop $1440 \times 900$ hingga $2560 \times 1440$.
- **Responsivitas Layar:** Menggunakan CSS Grid modular (12 kolom desktop) yang secara adaptif dapat dirampingkan ke tablet tanpa menghilangkan visibilitas telemetri pasien.

