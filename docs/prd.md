# Product Requirement Document (PRD) — Edisi Komprehensif Teknis & Arsitektur Frontend
## FUNK EDU — Antibiotic Fundamentals Lab & Resistance Evolution Simulator
*Version: 2.0.0-PROD | Status: Approved Specification | Target: Web Desktop Medical Workstation (1440px+)*

---

### 1. Ringkasan Eksekutif & Karakteristik Platform
- **Nama Produk:** FUNK EDU — Antibiotic Fundamentals Lab & PK/PD Decision Platform
- **Slogan:** *Understand the drug. Outsmart resistance. Protect the future.*
- **Target Pengguna:** Mahasiswa Kedokteran (Klinik & Pre-klinik), Dokter Internship/Umum (GP/Hospitalist), Residen PPDS (Penyakit Dalam/Anestesi/Pediatri), dan Farmasis Klinis ID Stewards.
- **Tujuan Pedagogis:** Melatih pengambilan keputusan peresepan antimikroba rasional secara objektif dan terukur melalui simulasi farmakokinetik/farmakodinamik (PK/PD), kepatuhan WHO AWaRe classification, dan prinsip 5 Benar (Right Patient, Drug, Dose, Route, Duration) untuk mencegah laju *Antimicrobial Resistance (AMR)*.

---

### 2. Arsitektur Alur Pengguna: Student dan Verified Professional

FUNK EDU tetap satu SPA dengan satu account state, tetapi akses efektif dipisahkan menjadi dua experience:

1. **Track selection**: onboarding pertama memilih `Student` atau `Professional`, lalu mengisi nama dan email.
2. **Student registration**: masuk ke Student pre-test, Student dashboard, enam misi fundamental, Decision Room, post-test, dan Student Completion Certificate.
3. **Professional registration**: tidak langsung memperoleh akses. Pengguna masuk ke full-page Professional Verification dengan langkah `Profesi`, `Data registrasi`, `Review`, dan `Status`.
4. **Student upgrade**: Student dapat membuka verifikasi dari Student dashboard. Status pending, rejected, atau unavailable tidak mengubah effective experience dan tidak menghapus XP, badges, skor, atau mission completion Student.
5. **Verified Professional**: hanya result `verified` yang mengubah `experience` menjadi `professional`. Setelah itu pengguna wajib menyelesaikan Professional Clinical Baseline enam soal sebelum Resistance Lab, Clinical Decision Room, atau Prescription Audit.
6. **Professional completion**: Professional post-test terbuka setelah tiga modul klinis selesai. Passing grade tetap `>= 8/10` dan menghasilkan Professional Track Certificate yang berbeda dari Student certificate.

State efektif yang dirender:

- `student`: Student dashboard dan progression aktif.
- `verification pending/rejected/unavailable`: effective experience tetap Student; initial Professional applicant tetap berada pada verification gate sampai memilih **Continue as Student**.
- `verified professional`: Professional dashboard aktif, verified role tampil sebagai persona badge, dan Student fundamentals hanya menjadi historical evidence.

Route policy terpusat menjaga boundary pada setiap `navigate()` dan redirect action. Tombol disabled hanya affordance visual, bukan enforcement. Verified Professional diarahkan dari Student dashboard ke Professional dashboard; pengguna yang belum verified diarahkan keluar dari semua Professional routes; Professional yang belum menyelesaikan baseline diarahkan ke `professional-baseline`.

Professional verification saat ini adalah adapter dummy deterministik di balik `ProfessionalVerificationService`. Fixture `DEMO-VERIFIED-GP`, `DEMO-VERIFIED-RESIDENT`, dan `DEMO-VERIFIED-PHARMACIST` menghasilkan verified role yang cocok; `DEMO-PENDING` menghasilkan pending; input non-fixture menghasilkan rejected. UI wajib menampilkan **“Simulasi verifikasi — bukan validasi KKI/SATUSEHAT”**. Produksi memerlukan integrasi server-to-server berizin dengan registry/data service Indonesia yang relevan; browser tidak boleh memanggil atau scrape layanan tersebut langsung.

Credential yang dihasilkan adalah educational prototype. Professional certificate menampilkan verified professional role serta disclaimer bahwa credential bukan lisensi profesi atau dokumen verifikasi KKI/SATUSEHAT.
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
  │     │     ├── Misi 4: <ResistanceLabModule>
  │     │     │     ├── <DoseControlSlider value="0-10x MIC-S" />
  │     │     │     ├── <PresetScenarioList (Full|EarlyStop|SubTherapeutic|NoTreatment) />
  │     │     │     ├── <PopulationPetriDish (S vs R colonies, log scale) />
  │     │     │     ├── <PopulationLogChart /> & <ResistantFractionChart />
  │     │     │     ├── <KeyConceptCards (FitnessCost|MIC|Mutation|HGT|ImmuneClearance) />
  │     │     │     └── <ClinicalVerdictBanner (Cured|Resistant|Relapse|Ended) />
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
  │     └── [Screen: Student / Professional Educational Credential]
  │           ├── <OverallScoreSummary />
  │           ├── <DomainRadarChart />
  │           ├── <CertificateCredentialCard printable="true" />
  │           │     ├── <LocalPrototypeCredentialId />
  │           │     └── <LocalPrototypeIntegrityHash />
  │           └── <ActionExportPDFButtonGroup />
  │
  └── <PersistentLabFooter>
        ├── <EducationalPrototypeDisclaimer />
        └── <VerificationSimulationDisclaimer text="Not KKI/SATUSEHAT validation" />
```

---

### 4. Spesifikasi State Management & Kinetika Real-Time (Client-Side)

#### 4.1. Global Store State Schema
```typescript
interface GlobalBiolabState {
  user: {
    name: string;
    email: string;
    experience: 'student' | 'professional';
    onboardingIntent: 'student' | 'professional';
    professionalVerification: {
      status: 'not_started' | 'submitting' | 'pending' | 'verified' | 'rejected' | 'unavailable';
      requestId: string | null;
      request: ProfessionalVerificationRequest | null;
      verifiedRole: 'dokter_umum' | 'residen' | 'farmasis' | null;
      verifiedName: string | null;
      rejectionReason: string | null;
      lastCheckedAt: string | null;
    };
    xp: number;
    coins: number;
    streakDays: number;
    rank: string;
  };
  studentAssessment: {
    pretestScore: number | null;
    pretestDone: boolean;
    posttestScore: number | null;
    posttestDone: boolean;
    answersMap: Record<number, string>;
    unlockedMissions: number[];
    completedMissions: number[];
    earnedBadges: string[];
    finalChallengeDone: boolean;
    clinicalRoomDone: boolean;
  };
  professionalAssessment: {
    baselineScore: number | null;
    baselineDone: boolean;
    resistanceLabDone: boolean;
    clinicalRoomDone: boolean;
    prescriptionAuditDone: boolean;
    posttestScore: number | null;
    posttestDone: boolean;
    professionalCertificateUnlocked: boolean;
  };
}
```

Student assessment tidak disalin ke Professional assessment. Upgrade mempertahankan Student evidence tetapi selalu menginisialisasi Professional baseline, module flags, post-test, dan certificate state sebagai kosong.

#### 4.2. Algoritma Simulasi Evolusi Resistensi (Model Populasi S vs R)
Model edukatif yang disederhanakan — bukan farmakokinetik klinis riil. Galur rentan (S) dan resisten (R) dibagi dengan `SUBSTEPS = 10` langkah per hari:

1. **Laju Bunuh Bergantung Konsentrasi:**
   $$k(C, \text{MIC}) = \frac{K_{\max} \cdot (C/\text{MIC})^2}{1 + (C/\text{MIC})^2}, \quad K_{\max} = 1.4$$
2. **Tekanan Kapasitas (Carrying Capacity) $K = 5 \times 10^6$:**
   $$\text{crowd} = 1 - \frac{N}{K}, \quad N = S + R$$
3. **Flux Mutasi & Transfer Gen Horizontal:**
   $$\text{mutFlux} = S \cdot g_S \cdot \mu, \quad \mu = 2 \times 10^{-6}$$
   $$\text{hgtFlux} = \frac{c \cdot S \cdot R}{K} \left(1 + \frac{0.5 \, C}{\text{MIC}_S}\right), \quad c = 0.02$$
4. **Eliminasi Imun Inang** (aktif hanya saat beban rendah):
   $$k_{\text{imun}} = k_{\text{imun,max}} \left(1 - \frac{N}{N_{\text{threshold}}}\right) \quad \text{bila } N < 800$$
5. **Persamaan Diferensial Populasi:**
   $$\frac{dS}{dt} = S\,(g_S \cdot \text{crowd} - k_S - k_{\text{imun}}) - \text{mutFlux} - \text{hgtFlux}$$
   $$\frac{dR}{dt} = R\,(g_R \cdot \text{crowd} - k_R - k_{\text{imun}}) + \text{mutFlux} + \text{hgtFlux}$$
   dengan $g_S = 0.55$ dan fitness cost 12%: $g_R = g_S (1 - 0.12)$.
6. **Konstanta MIC:** $\text{MIC}_S = 1.0$ dan $\text{MIC}_R = 8.0$ (kelipatan MIC galur rentan).
7. **Verdict Akhir** (setelah `MAX_DAYS = 34` atau eradikasi):
   - $N < 0.5 \rightarrow$ **Sembuh Total** (eradikasi).
   - $\%R > 40 \rightarrow$ **Resistensi Terseleksi Kuat**.
   - $N > 5 \times 10^5 \rightarrow$ **Infeksi Kambuh (Relapse)**.
   - Selainnya $\rightarrow$ **Simulasi Berakhir**.

Verdict **Sembuh Total** menyelesaikan Misi 4 dan mengklaim +150 XP.

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
   - Cawan petri mikrobiologi merender koloni berbentuk lingkaran SVG secara dinamis berdasarkan kepadatan dan proporsi galur resisten pada skala logaritmik.
   - State transisi hover tombol dan stepper menerapkan `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)` dengan efek active scale `0.98`.

---

### 6. Rencana Implementasi & Pengujian Kualitas
- **Unit Testing Model Resistensi:** Validasi arah tren populasi S vs R terhadap perilaku yang diharapkan (dosis sub-MIC menyeleksi R; eradikasi hanya saat kadar melampaui MIC-R).
- **Rendering Benchmark:** Memastikan seluruh animasi kurva SVG, diagram sel bakteri, dan timeline cawan petri beroperasi stabil pada $\ge 60 \text{ FPS}$ di resolusi desktop $1440 \times 900$ hingga $2560 \times 1440$.
- **Responsivitas Layar:** Menggunakan CSS Grid modular (12 kolom desktop) yang secara adaptif dapat dirampingkan ke tablet tanpa menghilangkan visibilitas telemetri pasien.

