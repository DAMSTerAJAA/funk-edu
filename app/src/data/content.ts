// ============================================================
// FUNK EDU — Dummy Assessment & Clinical Case Data
// ============================================================
import type { Question } from "../types";

export const PRETEST_QUESTIONS: Question[] = [
  {
    id: 1,
    domain: "Diagnosis Infeksi",
    vignette: "Laki-laki 24 th datang dengan nyeri tenggorokan 2 hari, demam 38,2°C, nyeri menelan, tanpa batuk. Faring hiperemis dengan eksudat tonsil, limfadenopati servikal anterior nyeri tekan.",
    question: "Berdasarkan Centor Score, pendekatan paling tepat adalah:",
    options: [
      { key: "A", text: "Langsung berikan Amoksisilin 500 mg TID 10 hari" },
      { key: "B", text: "Lakukan rapid antigen test / kultur usap tenggorokan sebelum antibiotik" },
      { key: "C", text: "Berikan Azitromisin 500 mg sekali sehari 3 hari" },
      { key: "D", text: "Terapi simptomatik saja, pasti viral" },
    ],
    correct: "B",
    rationale: "Centor score 3 (demam, eksudat, LAD, tanpa batuk) → probabilitas GAS sedang; konfirmasi RADT/kultur dianjurkan sebelum antibiotik untuk mencegah peresepan tidak perlu.",
  },
  {
    id: 2,
    domain: "Mekanisme Aksi",
    vignette: "Seorang residen meresepkan antibiotik yang bekerja menghambat sintesis dinding sel dengan berikatan pada PBP (penicillin-binding protein).",
    question: "Kelas antibiotik yang dimaksud adalah:",
    options: [
      { key: "A", text: "Makrolida" },
      { key: "B", text: "Fluorokuinolon" },
      { key: "C", text: "β-laktam (Penisilin/Sefalosporin)" },
      { key: "D", text: "Aminoglikosida" },
    ],
    correct: "C",
    rationale: "β-laktam berikatan pada PBP dan menghambat transpeptidasi peptidoglikan dinding sel → efek bakterisidal time-dependent.",
  },
  {
    id: 3,
    domain: "PK/PD",
    vignette: "Piperacillin-tazobactam direncanakan untuk pneumonia nosokomial dengan MIC Pseudomonas 8 mcg/mL.",
    question: "Parameter PK/PD yang paling menentukan efikasi β-laktam adalah:",
    options: [
      { key: "A", text: "Cmax/MIC ≥ 10" },
      { key: "B", text: "AUC/MIC ≥ 125" },
      { key: "C", text: "%fT > MIC (fraksi waktu kadar bebas di atas MIC)" },
      { key: "D", text: "Kadar trough < MIC" },
    ],
    correct: "C",
    rationale: "β-laktam bersifat time-dependent: target %fT > MIC 50–70% (hingga 100% pada pasien kritis). Extended/prolonged infusion meningkatkan parameter ini.",
  },
  {
    id: 4,
    domain: "Spektrum & AWaRe",
    vignette: "Pasien ISK tanpa komplikasi, kultur E. coli sensitif terhadap semua agen uji.",
    question: "Pilihan antibiotik paling tepat menurut prinsip stewardship & WHO AWaRe:",
    options: [
      { key: "A", text: "Meropenem 1 g q8h" },
      { key: "B", text: "Piperacillin-tazobactam 4,5 g q8h" },
      { key: "C", text: "Nitrofurantoin atau Fosfomycin (agen Access, spektrum sempit)" },
      { key: "D", text: "Levofloxacin 750 mg q24h" },
    ],
    correct: "C",
    rationale: "Gunakan agen kelompok ACCESS berspektrum sempit selama sensitif. Karbapenem & kombinasi broad-spectrum disimpan untuk infeksi resisten.",
  },
  {
    id: 5,
    domain: "Resistensi",
    vignette: "Terapi β-laktam diberikan dengan kadar plasma berulang kali berada di bawah MIC selama interval dosis.",
    question: "Konsekuensi mikrobiologis utama dari kondisi tersebut:",
    options: [
      { key: "A", text: "Eradikasi kuman lebih cepat" },
      { key: "B", text: "Seleksi subpopulasi mutan resisten (mutant selection window)" },
      { key: "C", text: "Tidak ada dampak selama dosis cukup tinggi" },
      { key: "D", text: "Kuman berubah menjadi bentuk L yang avirulen" },
    ],
    correct: "B",
    rationale: "Paparan sub-MIC berulang membuka mutant selection window → klon resisten (mis. AmpC derepressed, upregulasi efflux) terseleksi dan dominan.",
  },
  {
    id: 6,
    domain: "De-eskalasi",
    vignette: "Pasien CAP berat membaik secara klinis pada hari ke-3. Kultur sputum: S. pneumoniae sensitif Amoksisilin. Saat ini masih mendapat Ceftriaxone + Azitromisin IV.",
    question: "Langkah stewardship paling tepat:",
    options: [
      { key: "A", text: "Lanjutkan regimen IV sampai 14 hari" },
      { key: "B", text: "Ganti ke Meropenem untuk cakupan lebih luas" },
      { key: "C", text: "De-eskalasi ke Amoksisilin oral (IV-to-oral switch) sesuai kultur" },
      { key: "D", text: "Hentikan semua antibiotik segera" },
    ],
    correct: "C",
    rationale: "Antibiotic time-out 48–72 jam: sesuaikan terapi dengan kultur (streamlining) + switch oral bila hemodinamik stabil & fungsi GI baik.",
  },
  {
    id: 7,
    domain: "PK/PD",
    vignette: "Gentamicin once-daily direncanakan untuk pielonefritis berat.",
    question: "Strategi pemberian yang memaksimalkan efikasi aminoglikosida:",
    options: [
      { key: "A", text: "Dosis besar interval panjang (Cmax/MIC ≥ 10, manfaatkan PAE)" },
      { key: "B", text: "Dosis kecil 3× sehari agar kadar selalu di atas MIC" },
      { key: "C", text: "Infus kontinu 24 jam" },
      { key: "D", text: "Dosis dikurangi untuk menghindari Cmax tinggi" },
    ],
    correct: "A",
    rationale: "Aminoglikosida concentration-dependent dengan post-antibiotic effect → dosis besar interval panjang memaksimalkan killing dan menekan toksisitas akumulasi.",
  },
  {
    id: 8,
    domain: "Diagnosis Infeksi",
    vignette: "Nasocomial sepsis pada pasien ICU dengan kateter vena sentral > 7 hari, demam baru, tanpa sumber jelas.",
    question: "Langkah awal paling tepat sebelum antibiotik empiris:",
    options: [
      { key: "A", text: "Langsung mulai antibiotik broad-spectrum" },
      { key: "B", text: "Ambil 2 set kultur darah (perifer + kateter) lalu mulai antibiotik empiris tanpa menunda" },
      { key: "C", text: "Tunggu hasil kultur 3 hari" },
      { key: "D", text: "Cabut kateter tanpa kultur" },
    ],
    correct: "B",
    rationale: "Kultur sebelum antibiotik meningkatkan yield dan memungkinkan de-eskalasi; pada sepsis, antibiotik empiris tidak boleh tertunda > 1 jam.",
  },
  {
    id: 9,
    domain: "5 Benar (5R)",
    vignette: "Audit resep di bangsal menemukan: Sefiksim 2×200 mg untuk 'faringitis akut' pada anak 8 th dengan rinore, batuk, tanpa eksudat.",
    question: "Pelanggaran prinsip 5 Benar yang paling utama:",
    options: [
      { key: "A", text: "Benar dosis" },
      { key: "B", text: "Benar indikasi/pasien (tidak ada indikasi antibiotik — viral URTI)" },
      { key: "C", text: "Benar rute" },
      { key: "D", text: "Benar waktu" },
    ],
    correct: "B",
    rationale: "Faringitis dengan batuk + rinore mengarah ke viral; antibiotik tidak diindikasikan. Prinsip pertama stewardship: right patient/right indication.",
  },
  {
    id: 10,
    domain: "PK/PD",
    vignette: "Vancomycin untuk pneumonia MRSA dengan MIC 1 mcg/mL.",
    question: "Target monitoring farmakokinetik yang direkomendasikan saat ini:",
    options: [
      { key: "A", text: "Kadar trough 15–20 mcg/mL sebagai target utama" },
      { key: "B", text: "AUC24/MIC 400–600 (bayesian-guided)" },
      { key: "C", text: "Cmax/MIC ≥ 10" },
      { key: "D", text: "%fT > MIC 100%" },
    ],
    correct: "B",
    rationale: "Pedoman konsensus 2020 merekomendasikan AUC-guided dosing/monitoring vancomisin (AUC 400–600 mg·h/L) menggantikan target trough semata.",
  },
];

export const POSTTEST_QUESTIONS: Question[] = PRETEST_QUESTIONS.map((q, i) => ({
  ...q,
  id: i + 101,
  vignette: "[Lanjutan] " + q.vignette,
}));
export const PROFESSIONAL_BASELINE_QUESTIONS: Question[] = [3, 4, 6, 7, 8, 10].map((sourceId, index) => ({
  ...PRETEST_QUESTIONS.find((question) => question.id === sourceId)!,
  id: 201 + index,
}));

// ---------- Clinical Decision Room: kasus CAP ----------
export interface JourneyDay {
  day: number;
  label: string;
  title: string;
  narrative: string;
  vitals: { hr: string; bp: string; rr: string; temp: string; spo2: string };
  decision?: {
    prompt: string;
    options: { key: string; text: string; correct: boolean; feedback: string; xp: number }[];
  };
}

export const CAP_JOURNEY: JourneyDay[] = [
  {
    day: 0,
    label: "D0 IGD",
    title: "Admisi IGD — Susp CAP",
    narrative:
      "Tn. Rahmat, 58 th, DM tipe 2 terkontrol. Datang dengan demam 38,6°C, batuk purulen 4 hari, sesak. CURB-65 = 2 (usia < 65 → 0, RR 30 → 1, BUN normal, TD 118/72, sadar penuh → total 2 dengan urea). Foto toraks: infiltrat lobus kanan bawah. Diagnosis: Community-Acquired Pneumonia non-berat dengan komorbid.",
    vitals: { hr: "102x/m", bp: "118/72", rr: "30x/m", temp: "38.6°C", spo2: "92%" },
    decision: {
      prompt: "Pilih terapi empiris rawat inap non-ICU (sesuai IDSA/ATS 2019):",
      options: [
        { key: "A", text: "Amoksisilin oral saja", correct: false, xp: -20, feedback: "Kurang adekuat untuk CAP rawat inap dengan komorbid; risiko S. pneumoniae resisten & H. influenzae." },
        { key: "B", text: "Ampisilin-sulbaktam IV + Azitromisin (β-laktam + makrolida)", correct: true, xp: 50, feedback: "Tepat! Regimen standar CAP rawat inap non-ICU: β-laktam + makrolida/respiratori FQ." },
        { key: "C", text: "Meropenem 1 g q8h IV", correct: false, xp: -30, feedback: "Berlebihan — karbapenem (RESERVE-like use) tanpa faktor risiko MDRO. Stewardship buruk, kolateral damage besar." },
        { key: "D", text: "Seftriakson IV + Levofloxacin (duplikasi)", correct: false, xp: -20, feedback: "Duplikasi agen respiratori; cukup satu kombinasi rasional." },
      ],
    },
  },
  {
    day: 1,
    label: "D1",
    title: "Rawat Inap Hari 1",
    narrative:
      "Terapi empiris dimulai: Ampisilin-sulbaktam 3 g q6h IV + Azitromisin 500 mg q24h. Kultur sputum & darah diambil sebelum dosis pertama. Pasien masih demam 38,2°C, namun SpO2 membaik 94% dengan O2 nasal 2 lpm.",
    vitals: { hr: "96x/m", bp: "120/76", rr: "26x/m", temp: "38.2°C", spo2: "94%" },
  },
  {
    day: 2,
    label: "D2",
    title: "Hari 2 — Menunggu Kultur",
    narrative:
      "Perbaikan klinis bertahap. Demam menurun 37,8°C. Prokalsitonin 0,8 ng/mL (turun). Belum ada hasil kultur definitif. Antibiotik dilanjutkan sesuai rencana.",
    vitals: { hr: "90x/m", bp: "122/78", rr: "22x/m", temp: "37.8°C", spo2: "95%" },
  },
  {
    day: 3,
    label: "D3 Time-Out",
    title: "Antibiotic Time-Out 48–72 Jam",
    narrative:
      "Hasil kultur sputum: Streptococcus pneumoniae — SENSITIF: Penisilin (S), Amoksisilin (S), Seftriakson (S); RESISTEN: Eritromisin. Kultur darah steril. Pasien afebris 37,1°C, SpO2 96% udara ruang, makan minum baik.",
    vitals: { hr: "82x/m", bp: "124/80", rr: "18x/m", temp: "37.1°C", spo2: "96%" },
    decision: {
      prompt: "Keputusan Antibiotic Time-Out yang paling tepat:",
      options: [
        { key: "A", text: "Lanjutkan regimen empiris IV sampai 10–14 hari", correct: false, xp: -20, feedback: "Tidak perlu — kultur sudah memberi jawaban; prolong broad-spectrum meningkatkan risiko C. difficile & resistensi." },
        { key: "B", text: "De-eskalasi: stop Azitromisin, switch ke Amoksisilin oral 1 g TID", correct: true, xp: 60, feedback: "Sempurna! Streamlining sesuai antibiogram + IV-to-oral switch (stabil, GI berfungsi). Durasi total 5–7 hari." },
        { key: "C", text: "Ganti ke Levofloxacin oral untuk 'mempercepat pulang'", correct: false, xp: -15, feedback: "FQ tidak diperlukan; spektrum lebih luas dari kebutuhan dan risiko kolateral (tendinopathy, QT, disbiosis)." },
        { key: "D", text: "Hentikan antibiotik sepenuhnya hari ini", correct: false, xp: -25, feedback: "Terlalu dini — CAP memerlukan durasi minimal 5 hari & stabil klinis ≥ 48–72 jam." },
      ],
    },
  },
  {
    day: 4,
    label: "D4",
    title: "Hari 4 — Pasca De-eskalasi",
    narrative:
      "Amoksisilin oral ditoleransi baik. Pasien mobilisasi aktif, batuk berkurang, nafsu makan membaik. Tanda vital stabil.",
    vitals: { hr: "78x/m", bp: "126/80", rr: "16x/m", temp: "36.8°C", spo2: "97%" },
  },
  {
    day: 5,
    label: "D5",
    title: "Hari 5 — Evaluasi Durasi",
    narrative:
      "Stabil klinis ≥ 72 jam: afebris, HR < 100, RR < 24, saturasi ≥ 94% udara ruang, dapat makan oral, mental normal. Kriteria klinis untuk penghentian antibiotik terpenuhi pada hari ke-5.",
    vitals: { hr: "76x/m", bp: "124/78", rr: "16x/m", temp: "36.7°C", spo2: "98%" },
    decision: {
      prompt: "Rencana durasi & pulang yang tepat:",
      options: [
        { key: "A", text: "Hentikan antibiotik hari ke-5 (total 5 hari), pasien boleh pulang dengan kontrol", correct: true, xp: 50, feedback: "Tepat! Durasi 5 hari cukup untuk CAP dengan respons klinis baik (IDSA/ATS). Edukasi tanda bahaya diberikan." },
        { key: "B", text: "Lanjutkan antibiotik 14 hari 'untuk memastikan'", correct: false, xp: -20, feedback: "Over-treatment: tidak ada bukti manfaat, meningkatkan risiko efek samping & AMR." },
        { key: "C", text: "Pulangkan dengan antibiotik IV berlanjut di rumah", correct: false, xp: -25, feedback: "Tidak ada indikasi OPAT; oral cukup dan lebih aman." },
        { key: "D", text: "Ganti antibiotik profilaksis jangka panjang", correct: false, xp: -30, feedback: "Profilaksis tanpa indikasi = pelanggaran stewardship berat." },
      ],
    },
  },
  {
    day: 6,
    label: "D6",
    title: "Hari 6 — Persiapan Pulang",
    narrative:
      "Edukasi selesai: kepatuhan, tanda bahaya, kontrol poli 1 minggu. Foto toraks evaluasi: infiltrat membaik. Administrasi kepulangan diproses.",
    vitals: { hr: "74x/m", bp: "122/76", rr: "15x/m", temp: "36.6°C", spo2: "98%" },
  },
  {
    day: 7,
    label: "D7 Pulang",
    title: "Hari 7 — Discharge",
    narrative:
      "Tn. Rahmat pulang dalam kondisi baik. Total durasi antibiotik 5 hari. Skor efisiensi farmasi dihitung dari ketepatan empiris, de-eskalasi tepat waktu, dan durasi minimal efektif.",
    vitals: { hr: "72x/m", bp: "120/76", rr: "14x/m", temp: "36.6°C", spo2: "98%" },
  },
];

export const ANTIBIOGRAM = [
  { agent: "Penisilin G", mic: "0,06", sir: "S" },
  { agent: "Amoksisilin", mic: "0,12", sir: "S" },
  { agent: "Ampisilin-Sulbaktam", mic: "0,25", sir: "S" },
  { agent: "Seftriakson", mic: "0,12", sir: "S" },
  { agent: "Eritromisin", mic: "> 8", sir: "R" },
  { agent: "Levofloxacin", mic: "1,0", sir: "S" },
  { agent: "Klindamisin", mic: "> 4", sir: "R" },
  { agent: "Vankomisin", mic: "0,5", sir: "S" },
] as const;

// ---------- Misi 6: audit resep ----------
export const AUDIT_CASES = [
  {
    id: "A",
    title: "Resep A — Bangsal Penyakit Dalam",
    prescription: "Ceftriaxone 2×1 g IV untuk 'typhoid fever' klinis hari ke-2, Widal Slide S. typhi O 1/320",
    issues: ["Widal bukan diagnosis definitif (gold standard: kultur darah)", "Perlu evaluasi durasi & respons klinis"],
    verdict: "Perlu konfirmasi diagnostik; terapi dapat diterima bila klinis kuat",
    status: "watch" as const,
  },
  {
    id: "B",
    title: "Resep B — IGD",
    prescription: "Ciprofloxacin 2×500 mg oral 3 hari untuk diare akut watery tanpa darah, tanpa demam, vital stabil",
    issues: ["Diare akut non-invasif mayoritas viral/self-limited", "Tidak ada indikasi antibiotik", "FQ meningkatkan risiko resistensi & efek samping"],
    verdict: "Tidak tepat — antibiotik tidak diindikasikan",
    status: "violation" as const,
  },
  {
    id: "C",
    title: "Resep C — Bangsal Anak",
    prescription: "Amoksisilin 3×250 mg oral 5 hari untuk otitis media akut terkonfirmasi otoskopi pada anak 4 th",
    issues: ["Indikasi jelas, agen first-line spektrum sempit", "Dosis & durasi sesuai pedoman"],
    verdict: "Tepat — sesuai prinsip 5 Benar",
    status: "correct" as const,
  },
];

// ---------- Lencana & domain ----------
export const BADGES = [
  { id: "detective", name: "Infection Detective", desc: "Menguasai diagnosis infeksi bakteri vs viral" },
  { id: "target", name: "Target Hunter", desc: "Memetakan mekanisme aksi antimikroba" },
  { id: "spectrum", name: "Spectrum Strategist", desc: "Bijak memilih spektrum & AWaRe" },
  { id: "pkpd", name: "PK/PD Master", desc: "Optimalisasi dosis berbasis PK/PD" },
];

export const DOMAINS = [
  "Diagnosis Infeksi",
  "Mekanisme Aksi",
  "PK/PD",
  "Spektrum & AWaRe",
  "Resistensi & Stewardship",
] as const;
