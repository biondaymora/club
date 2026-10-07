-- Operator workflow: fulfilment is auditable and cancelling a pending redemption
-- restores both stock and the immutable points ledger.
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
      set status = 'fulfilled', fulfilled_at = now(), external_reference = coalesce(p_external_reference, external_reference)
      where id = v_redemption.id;
  else
    select * into v_reward from rewards where id = v_redemption.reward_id for update;
    select * into v_account from loyalty_accounts where customer_id = v_redemption.customer_id for update;
    insert into points_ledger (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
      values (v_account.id, 'redeem_reversal', v_reward.points_cost, 'reward_redemption', v_redemption.id::text,
        'redemption-cancel:' || v_redemption.id::text, now(), jsonb_build_object('reason', 'Admin cancellation'))
      on conflict (idempotency_key) do nothing;
    update loyalty_accounts
      set points_balance = (select coalesce(sum(amount), 0) from points_ledger where account_id = v_account.id), updated_at = now()
      where id = v_account.id;
    if v_reward.stock is not null then update rewards set stock = stock + 1 where id = v_reward.id; end if;
    update reward_redemptions set status = 'cancelled', external_reference = coalesce(p_external_reference, external_reference) where id = v_redemption.id;
  end if;

  insert into audit_logs (actor_id, action, entity_type, entity_id, after_data, reason)
    values (p_actor_id, 'reward_redemption_' || p_status, 'reward_redemption', v_redemption.id::text,
      jsonb_build_object('status', p_status, 'external_reference', p_external_reference), 'Operator action');
  return jsonb_build_object('id', v_redemption.id, 'status', p_status, 'idempotent', false);
end;
$$;

revoke all on function public.manage_reward_redemption(uuid, text, uuid, text) from public;
