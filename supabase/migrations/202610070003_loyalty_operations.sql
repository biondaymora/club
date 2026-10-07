-- Server-side, transactional operations. Call only from trusted server routes.
create or replace function public.process_shopify_order(p_order jsonb, p_webhook_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_account_id uuid;
  v_points bigint;
  v_order_id text := p_order->>'id';
  v_total bigint := round(coalesce((p_order->>'total_price')::numeric, 0) * 100);
begin
  update webhook_events set status = 'processing', attempts = attempts + 1 where provider = 'shopify' and provider_event_id = p_webhook_id;

  select id into v_customer_id from customer_profiles where shopify_customer_id = coalesce(p_order->'customer'->>'id', '');
  insert into shopify_orders (shopify_order_id, customer_id, financial_status, currency, total_amount, paid_at, payload)
  values (v_order_id, v_customer_id, coalesce(p_order->>'financial_status', 'paid'), coalesce(p_order->>'currency', 'COP'), v_total, nullif(p_order->>'processed_at', '')::timestamptz, p_order)
  on conflict (shopify_order_id) do update set financial_status = excluded.financial_status, payload = excluded.payload, synced_at = now();

  if v_customer_id is null then
    update webhook_events set status = 'processed', processed_at = now() where provider = 'shopify' and provider_event_id = p_webhook_id;
    return jsonb_build_object('status', 'order_saved_customer_not_enrolled');
  end if;

  select id into v_account_id from loyalty_accounts where customer_id = v_customer_id;
  v_points := floor(v_total / 1000); -- 1 point for every COP $1,000 paid; make configurable before production.
  insert into points_ledger (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
  values (v_account_id, 'earn', v_points, 'shopify_order', v_order_id, 'shopify:' || v_order_id || ':earn', now(), jsonb_build_object('order_number', p_order->>'order_number'))
  on conflict (idempotency_key) do nothing;
  update loyalty_accounts set points_balance = (select coalesce(sum(amount), 0) from points_ledger where account_id = v_account_id), updated_at = now() where id = v_account_id;
  insert into outbox_events (destination, event_name, aggregate_type, aggregate_id, idempotency_key, payload)
  values ('omnisend', 'points_earned', 'customer', v_customer_id::text, 'omnisend:' || v_order_id || ':points_earned', jsonb_build_object('email', p_order->>'email', 'eventName', 'points_earned', 'properties', jsonb_build_object('points', v_points, 'order_id', v_order_id)))
  on conflict (idempotency_key) do nothing;
  update webhook_events set status = 'processed', processed_at = now() where provider = 'shopify' and provider_event_id = p_webhook_id;
  return jsonb_build_object('status', 'processed', 'points', v_points);
exception when others then
  update webhook_events set status = 'failed', last_error = sqlerrm where provider = 'shopify' and provider_event_id = p_webhook_id;
  raise;
end;
$$;

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
  select * into v_redemption from reward_redemptions where idempotency_key = p_idempotency_key;
  if found then return jsonb_build_object('id', v_redemption.id, 'status', v_redemption.status, 'idempotent', true); end if;
  select * into v_reward from rewards where id = p_reward_id and active = true for update;
  if not found then raise exception 'Reward is not available'; end if;
  select * into v_account from loyalty_accounts where customer_id = p_customer_id for update;
  if not found then raise exception 'Loyalty account not found'; end if;
  if v_account.points_balance < v_reward.points_cost then raise exception 'Insufficient points'; end if;
  if v_reward.stock is not null and v_reward.stock = 0 then raise exception 'Reward out of stock'; end if;
  insert into reward_redemptions (reward_id, customer_id, status, idempotency_key) values (p_reward_id, p_customer_id, 'pending', p_idempotency_key) returning * into v_redemption;
  insert into points_ledger (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
  values (v_account.id, 'redeem', -v_reward.points_cost, 'reward_redemption', v_redemption.id::text, 'redeem:' || v_redemption.id::text, now(), jsonb_build_object('reward_code', v_reward.code));
  update loyalty_accounts set points_balance = points_balance - v_reward.points_cost, updated_at = now() where id = v_account.id;
  if v_reward.stock is not null then update rewards set stock = stock - 1 where id = p_reward_id; end if;
  insert into audit_logs (actor_id, action, entity_type, entity_id, after_data, reason) values (p_customer_id, 'reward_redeemed', 'reward_redemption', v_redemption.id::text, to_jsonb(v_redemption), 'Customer self-service redemption');
  return jsonb_build_object('id', v_redemption.id, 'status', v_redemption.status, 'idempotent', false);
end;
$$;

revoke all on function public.process_shopify_order(jsonb, text) from public;
revoke all on function public.redeem_reward(uuid, uuid, text) from public;
