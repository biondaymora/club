-- Initial schema: all financial-style movements are append-only.
create extension if not exists pgcrypto;

create type public.ledger_event_type as enum ('earn', 'redeem', 'reverse', 'expire', 'adjustment');
create type public.webhook_status as enum ('received', 'processing', 'processed', 'failed', 'ignored');
create type public.delivery_status as enum ('pending', 'delivered', 'failed');

create table public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shopify_customer_id text unique,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customer_profiles(id),
  tier_code text not null default 'member',
  points_balance bigint not null default 0 check (points_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.loyalty_accounts(id),
  event_type public.ledger_event_type not null,
  amount bigint not null check (amount <> 0),
  source_type text not null,
  source_id text not null,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index points_ledger_account_occurred_idx on public.points_ledger(account_id, occurred_at desc);
create unique index points_ledger_source_idx on public.points_ledger(source_type, source_id, event_type);

create table public.cashback_wallets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customer_profiles(id),
  currency char(3) not null default 'COP',
  available_amount bigint not null default 0 check (available_amount >= 0),
  reserved_amount bigint not null default 0 check (reserved_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cashback_ledger (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.cashback_wallets(id),
  event_type public.ledger_event_type not null,
  amount bigint not null check (amount <> 0),
  source_type text not null,
  source_id text not null,
  idempotency_key text not null unique,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index cashback_ledger_wallet_expiry_idx on public.cashback_ledger(wallet_id, expires_at) where expires_at is not null;

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  topic text not null,
  payload jsonb not null,
  status public.webhook_status not null default 'received',
  attempts integer not null default 0,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  unique(provider, provider_event_id)
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  destination text not null,
  event_name text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  idempotency_key text not null unique,
  payload jsonb not null,
  status public.delivery_status not null default 'pending',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index outbox_pending_idx on public.outbox_events(destination, available_at) where status <> 'delivered';

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.points_ledger enable row level security;
alter table public.cashback_wallets enable row level security;
alter table public.cashback_ledger enable row level security;
alter table public.webhook_events enable row level security;
alter table public.outbox_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "customers read own profile" on public.customer_profiles for select using (id = auth.uid());
create policy "customers read own loyalty account" on public.loyalty_accounts for select using (customer_id = auth.uid());
create policy "customers read own points ledger" on public.points_ledger for select using (account_id in (select id from public.loyalty_accounts where customer_id = auth.uid()));
create policy "customers read own cashback wallet" on public.cashback_wallets for select using (customer_id = auth.uid());
create policy "customers read own cashback ledger" on public.cashback_ledger for select using (wallet_id in (select id from public.cashback_wallets where customer_id = auth.uid()));

-- No client policy exists for webhooks, outbox or audit logs. Server roles only.
