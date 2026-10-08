-- Foundation only. No tag tap, Wallet pass, or check-in awards points by itself.
-- Apply in order after the existing loyalty migrations. Provider credentials and
-- trusted issuance/check-in services are deliberately not part of this migration.

create table public.member_cards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customer_profiles(id) on delete cascade,
  public_ref text not null unique default encode(gen_random_bytes(16), 'hex')
    check (public_ref ~ '^[0-9a-f]{32}$'),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended', 'revoked')),
  issued_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.member_cards is
  'One opaque membership identity per customer; public_ref is not a login or redemption credential.';

create table public.member_nfc_tags (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.member_cards(id) on delete cascade,
  token_sha256 bytea not null unique check (octet_length(token_sha256) = 32),
  label text,
  status text not null default 'unassigned'
    check (status in ('unassigned', 'active', 'lost', 'revoked')),
  assigned_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (status <> 'active' or card_id is not null)
);
create index member_nfc_tags_card_idx on public.member_nfc_tags(card_id) where card_id is not null;
comment on table public.member_nfc_tags is
  'Hash of a random URL token written to a physical NDEF tag; a tap only opens the Club.';

create table public.member_wallet_passes (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.member_cards(id) on delete cascade,
  provider text not null check (provider in ('apple', 'google')),
  provider_object_id text,
  status text not null default 'pending'
    check (status in ('pending', 'issued', 'suspended', 'revoked', 'failed')),
  issued_at timestamptz,
  last_synced_at timestamptz,
  revoked_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(card_id, provider),
  unique(provider, provider_object_id)
);
comment on table public.member_wallet_passes is
  'Provider lifecycle metadata only; no signing key, Apple authentication token, or Google service-account key is stored here.';

create table public.member_checkins (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customer_profiles(id) on delete cascade,
  venue_code text not null,
  event_code text not null,
  method text not null check (method in ('staff_qr', 'staff_nfc', 'manual_review')),
  idempotency_key text not null unique,
  verified_by uuid not null references auth.users(id),
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(customer_id, event_code)
);
create index member_checkins_customer_time_idx on public.member_checkins(customer_id, verified_at desc);
comment on table public.member_checkins is
  'Verified attendance, separate from web visits and raw tag taps; a future approved rule may reference this event once.';

alter table public.member_cards enable row level security;
alter table public.member_nfc_tags enable row level security;
alter table public.member_wallet_passes enable row level security;
alter table public.member_checkins enable row level security;

create policy "members read own card" on public.member_cards
  for select using (customer_id = auth.uid());
create policy "members read own wallet pass status" on public.member_wallet_passes
  for select using (card_id in (select id from public.member_cards where customer_id = auth.uid()));
create policy "members read own verified checkins" on public.member_checkins
  for select using (customer_id = auth.uid());

-- No browser policy exists for physical tags or for writes to any of these
-- tables. Issuance, assignment, revocation and check-in must use a trusted
-- server case with authorization, rate limits, audit and idempotency.
