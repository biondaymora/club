-- Safe, forward-only correction for balances and member identity.
-- A reversed purchase can leave a debt when points were already spent. Keep
-- spendable balance non-negative and carry that debt into future earnings.
alter table public.loyalty_accounts
  add column if not exists points_debt bigint not null default 0 check (points_debt >= 0);

create table if not exists public.club_runtime_settings (
  key text primary key,
  enabled boolean not null,
  updated_at timestamptz not null default now()
);
alter table public.club_runtime_settings enable row level security;
insert into public.club_runtime_settings (key, enabled)
values ('redemptions_enabled', false)
on conflict (key) do nothing;

create or replace function public.refresh_loyalty_balance(p_account_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_net bigint;
begin
  select coalesce(sum(amount), 0) into v_net
  from points_ledger where account_id = p_account_id;

  update loyalty_accounts
  set points_balance = greatest(v_net, 0),
      points_debt = greatest(-v_net, 0),
      updated_at = now()
  where id = p_account_id;
end;
$$;

revoke all on function public.refresh_loyalty_balance(uuid) from public;
grant execute on function public.refresh_loyalty_balance(uuid) to service_role;

-- An authenticated browser must not choose a Shopify ID or impersonate an
-- email address in a profile. Only the service-role webhook may set the link.
drop policy if exists "customers insert own profile" on public.customer_profiles;
create policy "customers insert verified own profile" on public.customer_profiles
  for insert to authenticated
  with check (
    id = auth.uid()
    and shopify_customer_id is null
    and lower(coalesce(email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
  );
drop policy if exists "customers update own profile" on public.customer_profiles;

-- Disable a benefit that has no cashback funding/fulfilment path yet. Existing
-- redemptions remain visible to operators; new redemptions are blocked.
update public.rewards
set active = false
where configuration->>'benefit_type' = 'cashback';

-- The previously deployed function used an enum value that does not exist.
-- Replace it with the existing "reverse" event and a debt-aware balance refresh.
create or replace function public.manage_reward_redemption(
  p_redemption_id uuid,
  p_status text,
  p_actor_id uuid,
  p_external_reference text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_redemption reward_redemptions%rowtype;
  v_reward rewards%rowtype;
  v_account loyalty_accounts%rowtype;
begin
  if p_status not in ('fulfilled', 'cancelled') then
    raise exception 'Unsupported redemption status';
  end if;
  if not exists (select 1 from admin_roles where user_id = p_actor_id and role in ('operator', 'admin')) then
    raise exception 'Administrator role required';
  end if;

  select * into v_redemption from reward_redemptions where id = p_redemption_id for update;
  if not found then raise exception 'Redemption not found'; end if;
  if v_redemption.status = p_status then
    return jsonb_build_object('id', v_redemption.id, 'status', v_redemption.status, 'idempotent', true);
  end if;
  if v_redemption.status <> 'pending' then
    raise exception 'Only pending redemptions can be changed';
  end if;

  if p_status = 'fulfilled' then
    update reward_redemptions
    set status = 'fulfilled', fulfilled_at = now(),
        external_reference = coalesce(p_external_reference, external_reference)
    where id = v_redemption.id;
  else
    select * into v_reward from rewards where id = v_redemption.reward_id for update;
    select * into v_account from loyalty_accounts where customer_id = v_redemption.customer_id for update;
    if v_reward.points_cost > 0 then
      insert into points_ledger (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
      values (v_account.id, 'reverse', v_reward.points_cost, 'reward_redemption', v_redemption.id::text,
        'redemption-cancel:' || v_redemption.id::text, now(), jsonb_build_object('reason', 'Admin cancellation'))
      on conflict (idempotency_key) do nothing;
      perform refresh_loyalty_balance(v_account.id);
    end if;
    if v_reward.stock is not null then
      update rewards set stock = stock + 1 where id = v_reward.id;
    end if;
    update reward_redemptions
    set status = 'cancelled', external_reference = coalesce(p_external_reference, external_reference)
    where id = v_redemption.id;
  end if;

  insert into audit_logs (actor_id, action, entity_type, entity_id, after_data, reason)
  values (p_actor_id, 'reward_redemption_' || p_status, 'reward_redemption', v_redemption.id::text,
    jsonb_build_object('status', p_status, 'external_reference', p_external_reference), 'Operator action');
  return jsonb_build_object('id', v_redemption.id, 'status', p_status, 'idempotent', false);
end;
$$;

revoke all on function public.manage_reward_redemption(uuid, text, uuid, text) from public;
grant execute on function public.manage_reward_redemption(uuid, text, uuid, text) to service_role;

-- Lock the reward/account before checking the idempotency key again. Two
-- simultaneous clicks with the same key then return the same redemption.
create or replace function public.redeem_reward(p_reward_id uuid, p_customer_id uuid, p_idempotency_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reward rewards%rowtype;
  v_account loyalty_accounts%rowtype;
  v_redemption reward_redemptions%rowtype;
begin
  select * into v_reward from rewards where id = p_reward_id and active = true for update;
  if not found then raise exception 'Reward is not available'; end if;
  select * into v_account from loyalty_accounts where customer_id = p_customer_id for update;
  if not found then raise exception 'Loyalty account not found'; end if;

  select * into v_redemption from reward_redemptions where idempotency_key = p_idempotency_key;
  if found then
    if v_redemption.customer_id <> p_customer_id or v_redemption.reward_id <> p_reward_id then
      raise exception 'Idempotency key belongs to another redemption';
    end if;
    return jsonb_build_object('id', v_redemption.id, 'status', v_redemption.status, 'idempotent', true);
  end if;
  if not coalesce((select enabled from club_runtime_settings where key = 'redemptions_enabled'), false) then
    raise exception 'Redemptions are paused until balances are reconciled';
  end if;
  if v_account.points_balance < v_reward.points_cost then raise exception 'Insufficient points'; end if;
  if v_reward.stock is not null and v_reward.stock = 0 then raise exception 'Reward out of stock'; end if;

  insert into reward_redemptions (reward_id, customer_id, status, idempotency_key)
  values (p_reward_id, p_customer_id, 'pending', p_idempotency_key)
  returning * into v_redemption;
  if v_reward.points_cost > 0 then
    insert into points_ledger (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
    values (v_account.id, 'redeem', -v_reward.points_cost, 'reward_redemption', v_redemption.id::text,
      'redeem:' || v_redemption.id::text, now(), jsonb_build_object('reward_code', v_reward.code));
    perform refresh_loyalty_balance(v_account.id);
  end if;
  if v_reward.stock is not null then
    update rewards set stock = stock - 1 where id = p_reward_id;
  end if;
  insert into audit_logs (actor_id, action, entity_type, entity_id, after_data, reason)
  values (p_customer_id, 'reward_redeemed', 'reward_redemption', v_redemption.id::text,
    to_jsonb(v_redemption), 'Customer self-service redemption');
  insert into outbox_events (destination, event_name, aggregate_type, aggregate_id, idempotency_key, payload)
  values ('omnisend', 'reward_redeemed', 'customer', p_customer_id::text,
    'omnisend:redemption:' || v_redemption.id::text,
    jsonb_build_object('email', (select email from customer_profiles where id = p_customer_id),
      'eventName', 'reward_redeemed', 'properties', jsonb_build_object('reward_code', v_reward.code)))
  on conflict (idempotency_key) do nothing;
  return jsonb_build_object('id', v_redemption.id, 'status', v_redemption.status, 'idempotent', false);
end;
$$;

revoke all on function public.redeem_reward(uuid, uuid, text) from public;
grant execute on function public.redeem_reward(uuid, uuid, text) to service_role;
grant execute on function public.is_admin(uuid) to service_role;

-- A prior paid-order handler may have credited 100x too many points. Do not
-- mutate historical ledger rows automatically: see the reconciliation runbook.
