import type { ProfessionalRole, ProfessionalVerificationRequest } from "../types";

export interface ProfessionalVerificationService {
  submit(request: ProfessionalVerificationRequest): Promise<ProfessionalVerificationResult>;
  check(requestId: string): Promise<ProfessionalVerificationResult>;
}

export type ProfessionalVerificationResult =
  | { status: "pending"; requestId: string; checkedAt: string }
  | { status: "verified"; requestId: string; checkedAt: string; verifiedRole: ProfessionalRole; verifiedName: string }
  | { status: "rejected"; requestId: string; checkedAt: string; reason: string };

const FIXTURES: Record<string, ProfessionalRole> = {
  "DEMO-VERIFIED-GP": "dokter_umum",
  "DEMO-VERIFIED-RESIDENT": "residen",
  "DEMO-VERIFIED-PHARMACIST": "farmasis",
};

function checkedAt() { return new Date().toISOString(); }
function requestId(number: string) { return `prototype-${number.toLowerCase()}-${number.length}`; }

/** Prototype-only deterministic adapter. Replace with an authorized server adapter in production. */
export const professionalVerificationService: ProfessionalVerificationService = {
  async submit(request) {
    const id = requestId(request.registrationNumber);
    const at = checkedAt();
    const role = FIXTURES[request.registrationNumber];
    if (role && role === request.professionalRole) return { status: "verified", requestId: id, checkedAt: at, verifiedRole: role, verifiedName: request.legalName };
    if (request.registrationNumber === "DEMO-PENDING") return { status: "pending", requestId: id, checkedAt: at };
    return { status: "rejected", requestId: id, checkedAt: at, reason: "Data registrasi tidak ditemukan atau tidak cocok" };
  },
  async check(id) {
    const fixture = Object.entries(FIXTURES).find(([number]) => requestId(number) === id);
    const at = checkedAt();
    if (fixture) return { status: "verified", requestId: id, checkedAt: at, verifiedRole: fixture[1], verifiedName: "Nama terverifikasi" };
    return { status: "pending", requestId: id, checkedAt: at };
  },
};
