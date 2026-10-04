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

/**
 * Session token storage.
 *
 * Persisted in localStorage so a registered account survives a browser
 * restart and can resume its progress — the token is the only credential
 * and it expires server-side after 30 days. The legacy sessionStorage
 * location is still read once so an in-flight session is not lost.
 */
const SESSION_KEY = "funkedu_session";

function readToken(): string | null {
  const persistent = localStorage.getItem(SESSION_KEY);
  if (persistent) return persistent;
  const legacy = sessionStorage.getItem(SESSION_KEY);
  if (legacy) {
    localStorage.setItem(SESSION_KEY, legacy);
    sessionStorage.removeItem(SESSION_KEY);
    return legacy;
  }
  return null;
}

function writeToken(token: string) {
  localStorage.setItem(SESSION_KEY, token);
  sessionStorage.removeItem(SESSION_KEY);
}

async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = readToken();
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
  writeToken(result.token);
  return result;
}

/** Restore an existing account by email and resume its stored progress. */
export async function loginAccount(email: string): Promise<RegisterResponse> {
  const result = await apiCall<RegisterResponse>("/accounts/login", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  writeToken(result.token);
  return result;
}

export async function fetchMe(): Promise<{ account: AccountResponse } | null> {
  if (!readToken()) return null;
  try {
    return await apiCall<{ account: AccountResponse }>("/accounts/me");
  } catch {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
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
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Revoke the current session on the server, then clear it locally.
 * Best-effort: the local token is always cleared, so a network failure can
 * never strand the user in a signed-in state.
 */
export async function logoutAccount(): Promise<void> {
  const token = readToken();
  clearSession();
  if (!token) return;
  try {
    await fetch(`${API_BASE}/accounts/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
  } catch {
    // Offline — the row expires on its own.
  }
}
