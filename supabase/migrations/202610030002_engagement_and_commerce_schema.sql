-- Supporting domain records. These tables are populated by trusted server jobs.
create table public.tiers (
  code text primary key,
  display_name text not null,
  min_qualifying_points bigint not null check (min_qualifying_points >= 0),
  benefits jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.tier_history (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.loyalty_accounts(id),
  tier_code text not null references public.tiers(code),
  reason text not null,
  effective_at timestamptz not null default now()
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  points_reward bigint not null default 0 check (points_reward >= 0),
  cashback_reward bigint not null default 0 check (cashback_reward >= 0),
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.mission_rules (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  rule_type text not null,
  configuration jsonb not null,
  created_at timestamptz not null default now()
);

create table public.mission_progress (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id),
  customer_id uuid not null references public.customer_profiles(id),
  progress jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  rewarded_at timestamptz,
  unique(mission_id, customer_id)
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  points_cost bigint not null default 0 check (points_cost >= 0),
  cashback_cost bigint not null default 0 check (cashback_cost >= 0),
  stock integer check (stock is null or stock >= 0),
  active boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards(id),
  customer_id uuid not null references public.customer_profiles(id),
  status text not null check (status in ('pending', 'fulfilled', 'cancelled')),
  idempotency_key text not null unique,
  external_reference text,
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz
);

create table public.shopify_orders (
  id uuid primary key default gen_random_uuid(),
  shopify_order_id text not null unique,
  customer_id uuid references public.customer_profiles(id),
  financial_status text not null,
  currency char(3) not null,
  total_amount bigint not null check (total_amount >= 0),
  paid_at timestamptz,
  cancelled_at timestamptz,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table public.shopify_refunds (
  id uuid primary key default gen_random_uuid(),
  shopify_refund_id text not null unique,
  shopify_order_id text not null references public.shopify_orders(shopify_order_id),
  total_amount bigint not null check (total_amount >= 0),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table public.customer_consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customer_profiles(id),
  purpose text not null,
  granted boolean not null,
  source text not null,
  captured_at timestamptz not null default now(),
  unique(customer_id, purpose, captured_at)
);

create table public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('support', 'marketing', 'operator', 'admin')),
  assigned_at timestamptz not null default now()
);

alter table public.tiers enable row level security;
alter table public.tier_history enable row level security;
alter table public.missions enable row level security;
alter table public.mission_rules enable row level security;
alter table public.mission_progress enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.shopify_orders enable row level security;
alter table public.shopify_refunds enable row level security;
alter table public.customer_consents enable row level security;
alter table public.admin_roles enable row level security;

create policy "customers read active missions" on public.missions for select using (active = true);
create policy "customers read own mission progress" on public.mission_progress for select using (customer_id = auth.uid());
create policy "customers read active rewards" on public.rewards for select using (active = true);
create policy "customers read own redemptions" on public.reward_redemptions for select using (customer_id = auth.uid());
create policy "customers read own consents" on public.customer_consents for select using (customer_id = auth.uid());
