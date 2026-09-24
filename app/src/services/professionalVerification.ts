import type { ProfessionalRole, ProfessionalVerificationRequest } from "../types";
import { submitVerification, checkVerification } from "./backend";

export interface ProfessionalVerificationService {
  submit(request: ProfessionalVerificationRequest): Promise<ProfessionalVerificationResult>;
  check(requestId: string): Promise<ProfessionalVerificationResult>;
}

export type ProfessionalVerificationResult =
  | { status: "pending"; requestId: string; checkedAt: string }
  | { status: "verified"; requestId: string; checkedAt: string; verifiedRole: ProfessionalRole; verifiedName: string }
  | { status: "rejected"; requestId: string; checkedAt: string; reason: string };

/** Server-backed verification adapter; no embedded fixtures. */
export const professionalVerificationService: ProfessionalVerificationService = {
  async submit(request) {
    const { result } = await submitVerification(request);
    if (result.status === "verified") {
      return {
        status: "verified",
        requestId: result.requestId,
        checkedAt: result.checkedAt,
        verifiedRole: result.verifiedRole as ProfessionalRole,
        verifiedName: result.verifiedName ?? request.legalName,
      };
    }
    if (result.status === "pending") return { status: "pending", requestId: result.requestId, checkedAt: result.checkedAt };
    return { status: "rejected", requestId: result.requestId, checkedAt: result.checkedAt, reason: result.reason ?? "Data registrasi tidak ditemukan atau tidak cocok" };
  },
  async check(requestId) {
    const { result } = await checkVerification(requestId);
    if (result.status === "verified") {
      return {
        status: "verified",
        requestId: result.requestId,
        checkedAt: result.checkedAt,
        verifiedRole: result.verifiedRole as ProfessionalRole,
        verifiedName: result.verifiedName ?? "",
      };
    }
    if (result.status === "pending") return { status: "pending", requestId: result.requestId, checkedAt: result.checkedAt };
    return { status: "rejected", requestId: result.requestId, checkedAt: result.checkedAt, reason: result.reason ?? "Data registrasi tidak ditemukan atau tidak cocok" };
  },
};
