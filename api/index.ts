import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
  });
}

function id(prefix: string) { return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`; }
function token() { return `sess_${crypto.randomUUID().replaceAll("-", "")}`; }

async function accountFromSession(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const result = await pool.query(
    "select a.* from funkedu_sessions s join funkedu_accounts a on a.id=s.account_id where s.token=$1 and s.expires_at>now()",
    [header.slice(7)]
  );
  return result.rows[0] ?? null;
}

interface AccountRow {
  id: string; display_name: string; email: string; experience: string; onboarding_intent: string;
  xp: number; coins: number; streak_days: number; rank: string;
  student_assessment: unknown; professional_assessment: unknown; professional_verification: unknown;
}

function accountPayload(row: AccountRow) {
  return {
    id: row.id, name: row.display_name, email: row.email,
    experience: row.experience, onboardingIntent: row.onboarding_intent,
    xp: row.xp, coins: row.coins, streakDays: row.streak_days, rank: row.rank,
    studentAssessment: row.student_assessment,
    professionalAssessment: row.professional_assessment,
    professionalVerification: row.professional_verification,
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, authorization", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/health")) return json({ ok: true });

  if (url.pathname.endsWith("/accounts/me")) {
    const row = await accountFromSession(req) as AccountRow | null;
    if (!row) return json({ error: "unauthorized" }, 401);
    return json({ account: accountPayload(row) });
  }

  const contentMatch = url.pathname.match(/\/content\/(\w+)$/);
  if (contentMatch) {
    const result = await pool.query("select payload from funkedu_content where kind=$1 order by id", [contentMatch[1]]);
    return json({ items: result.rows.map((r: Record<string, unknown>) => r.payload) });
  }

  return json({ error: "not found" }, 404);
}

export async function POST(req: Request) {
  const url = new URL(req.url);

  if (url.pathname.endsWith("/accounts/register")) {
    const body = await req.json() as { name?: string; email?: string; intent?: string };
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const intent = body.intent === "professional" ? "professional" : "student";
    if (!name || !email) return json({ error: "name and email are required" }, 400);
    const existing = await pool.query("select * from funkedu_accounts where email=$1", [email]);
    let row = existing.rows[0] as AccountRow | undefined;
    if (!row) {
      const inserted = await pool.query(
        "insert into funkedu_accounts(id,email,display_name,onboarding_intent) values($1,$2,$3,$4) returning *",
        [id("acct"), email, name, intent]
      );
      row = inserted.rows[0] as AccountRow;
    }
    const sessionToken = token();
    await pool.query("insert into funkedu_sessions(token,account_id,expires_at) values($1,$2,now()+interval '30 days')", [sessionToken, row.id]);
    return json({ token: sessionToken, account: accountPayload(row) });
  }

  if (url.pathname.endsWith("/accounts/progress")) {
    const row = await accountFromSession(req) as AccountRow | null;
    if (!row) return json({ error: "unauthorized" }, 401);
    const body = await req.json() as Record<string, unknown>;
    const updated = await pool.query(
      "update funkedu_accounts set experience=$2,onboarding_intent=$3,xp=$4,coins=$5,streak_days=$6,rank=$7,student_assessment=$8,professional_assessment=$9,professional_verification=$10,updated_at=now() where id=$1 returning *",
      [
        row.id,
        body.experience === "professional" ? "professional" : "student",
        body.onboardingIntent === "professional" ? "professional" : "student",
        Number(body.xp ?? row.xp),
        Number(body.coins ?? row.coins),
        Number(body.streakDays ?? row.streak_days),
        String(body.rank ?? row.rank),
        body.studentAssessment ?? row.student_assessment,
        body.professionalAssessment ?? row.professional_assessment,
        body.professionalVerification ?? row.professional_verification,
      ]
    );
    return json({ account: accountPayload(updated.rows[0] as AccountRow) });
  }

  if (url.pathname.endsWith("/verification/submit")) {
    const row = await accountFromSession(req) as AccountRow | null;
    if (!row) return json({ error: "unauthorized" }, 401);
    const request = await req.json() as Record<string, unknown>;
    const requestId = id("verreq");
    const registration = String(request.registrationNumber ?? "").trim();
    const role = String(request.professionalRole ?? "");
    const checkedAt = new Date().toISOString();
    const fixture: Record<string, string> = {
      "DEMO-VERIFIED-GP": "dokter_umum",
      "DEMO-VERIFIED-RESIDENT": "residen",
      "DEMO-VERIFIED-PHARMACIST": "farmasis",
    };
    let result: Record<string, unknown>;
    if (fixture[registration] === role) result = { status: "verified", requestId, checkedAt, verifiedRole: role, verifiedName: String(request.legalName ?? row.display_name) };
    else if (registration === "DEMO-PENDING") result = { status: "pending", requestId, checkedAt };
    else result = { status: "rejected", requestId, checkedAt, reason: "Data registrasi tidak ditemukan atau tidak cocok" };
    await pool.query("insert into funkedu_verification_requests(id,account_id,request,status,result) values($1,$2,$3,$4,$5)", [requestId, row.id, request, result.status, result]);
    const verification = { status: result.status, requestId, request, verifiedRole: result.verifiedRole ?? null, verifiedName: result.verifiedName ?? null, rejectionReason: result.reason ?? null, lastCheckedAt: checkedAt };
    const updated = await pool.query(
      "update funkedu_accounts set professional_verification=$2, experience=case when $3='verified' then 'professional' else 'student' end, updated_at=now() where id=$1 returning *",
      [row.id, JSON.stringify(verification), result.status]
    );
    return json({ result, account: accountPayload(updated.rows[0] as AccountRow) });
  }

  if (url.pathname.endsWith("/verification/check")) {
    const row = await accountFromSession(req) as AccountRow | null;
    if (!row) return json({ error: "unauthorized" }, 401);
    const { requestId } = await req.json() as { requestId?: string };
    if (!requestId) return json({ error: "requestId required" }, 400);
    const existing = await pool.query("select * from funkedu_verification_requests where id=$1 and account_id=$2", [requestId, row.id]);
    const record = existing.rows[0] as Record<string, unknown> | undefined;
    if (!record) return json({ error: "not found" }, 404);
    const checkedAt = new Date().toISOString();
    const stored = record.result as Record<string, unknown>;
    const result: Record<string, unknown> = { ...stored, checkedAt };
    const verification = { status: String(result.status ?? "pending"), requestId, request: record.request, verifiedRole: result.verifiedRole ?? null, verifiedName: result.verifiedName ?? null, rejectionReason: result.reason ?? null, lastCheckedAt: checkedAt };
    const updated = await pool.query("update funkedu_accounts set professional_verification=$2, experience=case when $3='verified' then 'professional' else 'student' end, updated_at=now() where id=$1 returning *", [row.id, JSON.stringify(verification), String(result.status ?? "pending")]);
    return json({ result, account: accountPayload(updated.rows[0] as AccountRow) });
  }

  return json({ error: "not found" }, 404);
}
