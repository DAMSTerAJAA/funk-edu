import type { ProfessionalRole } from "../types";

export interface PersonaMetadata {
  id: "student" | ProfessionalRole;
  label: string;
  description: string;
  icon: string;
  institutionLabel?: string;
  specialtyLabel?: string;
  specialtyRequired?: boolean;
}

export const PERSONAS: Record<"student" | ProfessionalRole, PersonaMetadata> = {
  student: { id: "student", label: "Student", description: "Fondasi antibiotik, PK/PD, dan stewardship klinis", icon: "🎓" },
  dokter_umum: { id: "dokter_umum", label: "Dokter Umum / GP", description: "Praktik layanan primer, rumah sakit, dan IGD", icon: "🩺", institutionLabel: "Fasilitas pelayanan / institusi" },
  residen: { id: "residen", label: "Residen PPDS", description: "Program spesialis dengan simulasi keputusan klinis", icon: "🧬", institutionLabel: "Institusi pendidikan / rumah sakit pendidikan", specialtyLabel: "Program spesialis / departemen", specialtyRequired: true },
  farmasis: { id: "farmasis", label: "Farmasis Klinis", description: "Stewardship, audit resep, dan optimasi terapi", icon: "💊", institutionLabel: "Rumah sakit / fasilitas pelayanan" },
};

export const PROFESSIONAL_PERSONAS = [PERSONAS.dokter_umum, PERSONAS.residen, PERSONAS.farmasis];
