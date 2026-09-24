import type {
  AssessmentState,
  ProfessionalAssessmentState,
  ProfessionalVerificationRequest,
  UserState,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface AccountResponse {
  id: string;
  name: string;
  email: string;
  experience: UserState["experience"];
  onboardingIntent: UserState["onboardingIntent"];
  xp: number;
  coins: number;
  streakDays: number;
  rank: string;
  studentAssessment: AssessmentState;
  professionalAssessment: ProfessionalAssessmentState;
  professionalVerification: UserState["professionalVerification"];
}

export interface RegisterResponse {
  token: string;
  account: AccountResponse;
}

export interface VerificationResult {
  status: "pending" | "verified" | "rejected";
  requestId: string;
  checkedAt: string;
  verifiedRole?: string;
  verifiedName?: string;
  reason?: string;
}

async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem("funkedu_session");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function registerAccount(name: string, email: string, intent: string): Promise<RegisterResponse> {
  const result = await apiCall<RegisterResponse>("/accounts/register", {
    method: "POST",
    body: JSON.stringify({ name, email, intent }),
  });
  sessionStorage.setItem("funkedu_session", result.token);
  return result;
}

export async function fetchMe(): Promise<{ account: AccountResponse } | null> {
  if (!sessionStorage.getItem("funkedu_session")) return null;
  try {
    return await apiCall<{ account: AccountResponse }>("/accounts/me");
  } catch {
    sessionStorage.removeItem("funkedu_session");
    return null;
  }
}

export async function saveProgress(patch: Partial<AccountResponse>): Promise<{ account: AccountResponse }> {
  return apiCall<{ account: AccountResponse }>("/accounts/progress", {
    method: "POST",
    body: JSON.stringify(patch),
  });
}

export async function submitVerification(req: ProfessionalVerificationRequest): Promise<{
  result: VerificationResult;
  account: AccountResponse;
}> {
  return apiCall("/verification/submit", { method: "POST", body: JSON.stringify(req) });
}

export async function checkVerification(requestId: string): Promise<{
  result: VerificationResult;
  account: AccountResponse;
}> {
  return apiCall("/verification/check", { method: "POST", body: JSON.stringify({ requestId }) });
}

export async function fetchContent(kind: string): Promise<unknown[]> {
  const result = await apiCall<{ items: unknown[] }>(`/content/${kind}`);
  return result.items;
}

export function clearSession() {
  sessionStorage.removeItem("funkedu_session");
}
