create table if not exists funkedu_accounts (
  id text primary key,
  email text not null unique,
  display_name text not null,
  experience text not null default 'student' check (experience in ('student','professional')),
  onboarding_intent text not null default 'student' check (onboarding_intent in ('student','professional')),
  xp integer not null default 0,
  coins integer not null default 0,
  streak_days integer not null default 1,
  rank text not null default 'Probationer',
  student_assessment jsonb not null default '{"pretestScore":null,"pretestDone":false,"posttestScore":null,"posttestDone":false,"answersMap":{},"unlockedMissions":[1],"completedMissions":[],"earnedBadges":[],"finalChallengeDone":false,"clinicalRoomDone":false}',
  professional_assessment jsonb not null default '{"baselineScore":null,"baselineDone":false,"workbenchDone":false,"clinicalRoomDone":false,"prescriptionAuditDone":false,"posttestScore":null,"posttestDone":false,"professionalCertificateUnlocked":false}',
  professional_verification jsonb not null default '{"status":"not_started","requestId":null,"request":null,"verifiedRole":null,"verifiedName":null,"rejectionReason":null,"lastCheckedAt":null}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists funkedu_sessions (
  token text primary key,
  account_id text not null references funkedu_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists funkedu_verification_requests (
  id text primary key,
  account_id text not null references funkedu_accounts(id) on delete cascade,
  request jsonb not null,
  status text not null check (status in ('pending','verified','rejected')),
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists funkedu_content (
  kind text not null,
  id text not null,
  payload jsonb not null,
  primary key (kind, id)
);
