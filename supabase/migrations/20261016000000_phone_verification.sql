-- Phone verification and leads for the ApexWall 3D website.
-- Run once in Supabase (SQL editor, or `supabase db push`).
-- Only the website's server (service-role key) can read or write these tables:
-- row level security is on and no public policies are defined.

-- Verified visitors: one row per phone number
create table if not exists public.leads (
  phone             text primary key check (phone ~ '^\+91[6-9][0-9]{9}$'),
  first_verified_at timestamptz not null default now(),
  last_verified_at  timestamptz not null default now(),
  consent_version   text not null,
  consent_text      text not null,
  source            text,
  user_agent        text
);

-- What each lead did: mockup download/share, WhatsApp quote, contact form
create table if not exists public.lead_events (
  id         bigint generated always as identity primary key,
  phone      text not null references public.leads (phone) on delete cascade,
  action     text not null check (action in ('mockup_download', 'mockup_share', 'whatsapp_quote', 'contact_form')),
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists lead_events_phone_idx on public.lead_events (phone, created_at desc);

-- The current one-time code per number (stored only as a keyed hash)
create table if not exists public.otp_codes (
  phone      text primary key,
  code_hash  text not null,
  expires_at timestamptz not null,
  attempts   integer not null default 0,
  created_at timestamptz not null default now()
);

-- Every code sent, for rate limits (per number and per IP address)
create table if not exists public.otp_sends (
  id         bigint generated always as identity primary key,
  phone      text not null,
  ip         text not null,
  created_at timestamptz not null default now()
);
create index if not exists otp_sends_phone_idx on public.otp_sends (phone, created_at);
create index if not exists otp_sends_ip_idx on public.otp_sends (ip, created_at);

alter table public.leads       enable row level security;
alter table public.lead_events enable row level security;
alter table public.otp_codes   enable row level security;
alter table public.otp_sends   enable row level security;

-- Atomic wrong-guess counter
create or replace function public.otp_add_attempt(p_phone text)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.otp_codes set attempts = attempts + 1 where phone = p_phone returning attempts;
$$;

-- Create the lead on first verification; refresh it afterwards (keeps first_verified_at)
create or replace function public.upsert_verified_lead(
  p_phone text, p_consent_version text, p_consent_text text, p_source text, p_user_agent text, p_at timestamptz
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.leads (phone, first_verified_at, last_verified_at, consent_version, consent_text, source, user_agent)
  values (p_phone, p_at, p_at, p_consent_version, p_consent_text, p_source, p_user_agent)
  on conflict (phone) do update
    set last_verified_at = excluded.last_verified_at,
        consent_version  = excluded.consent_version,
        consent_text     = excluded.consent_text,
        user_agent       = excluded.user_agent;
$$;

-- Only the server's service role may call these
revoke all on function public.otp_add_attempt(text) from public, anon, authenticated;
revoke all on function public.upsert_verified_lead(text, text, text, text, text, timestamptz) from public, anon, authenticated;

-- Housekeeping: drop expired codes and send logs older than a day.
-- Schedule with pg_cron (Database → Extensions → pg_cron), e.g. hourly:
--   select cron.schedule('otp-cleanup', '0 * * * *', $$select public.otp_cleanup()$$);
create or replace function public.otp_cleanup()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.otp_codes where expires_at < now() - interval '1 hour';
  delete from public.otp_sends where created_at < now() - interval '1 day';
$$;
revoke all on function public.otp_cleanup() from public, anon, authenticated;
