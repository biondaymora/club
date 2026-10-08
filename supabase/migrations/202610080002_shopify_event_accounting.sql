-- Process the webhook receipt and the financial movement in one transaction.
-- If an exception occurs, the receipt rolls back too, so Shopify can retry.
create or replace function public.process_shopify_event(
  p_topic text,
  p_payload jsonb,
  p_webhook_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event webhook_events%rowtype;
  v_order shopify_orders%rowtype;
  v_customer_id uuid;
  v_account_id uuid;
  v_order_id text;
  v_shopify_customer_id text;
  v_email text;
  v_total bigint;
  v_points bigint;
  v_refund_id text;
  v_refund_amount bigint;
  v_refunded bigint;
  v_earned bigint;
  v_reversed bigint;
  v_to_reverse bigint;
  v_new_earn boolean;
begin
  if p_topic not in ('orders/paid', 'orders/cancelled', 'refunds/create') then
    raise exception 'Unsupported Shopify topic';
  end if;
  if nullif(p_webhook_id, '') is null then raise exception 'Missing webhook ID'; end if;

  insert into webhook_events (provider, provider_event_id, topic, payload, status)
  values ('shopify', p_webhook_id, p_topic, p_payload, 'received')
  on conflict (provider, provider_event_id) do nothing;
  select * into v_event from webhook_events
  where provider = 'shopify' and provider_event_id = p_webhook_id for update;
  if v_event.topic <> p_topic then raise exception 'Webhook ID reused for another topic'; end if;
  if v_event.status in ('processed', 'ignored') then
    return jsonb_build_object('status', 'duplicate');
  end if;
  update webhook_events
  set status = 'processing', attempts = attempts + 1, last_error = null
  where id = v_event.id;

  if p_topic in ('orders/paid', 'orders/cancelled') then
    v_order_id := nullif(p_payload->>'id', '');
    if v_order_id is null then raise exception 'Shopify order ID is required'; end if;
    v_total := round(coalesce(nullif(p_payload->>'total_price', '')::numeric, 0) * 100);
    if v_total < 0 then raise exception 'Negative Shopify order total'; end if;

    if p_topic = 'orders/paid' then
      v_shopify_customer_id := nullif(p_payload->'customer'->>'id', '');
      v_email := coalesce(nullif(p_payload->'customer'->>'email', ''), nullif(p_payload->>'email', ''));
      if v_shopify_customer_id is not null then
        select id into v_customer_id from customer_profiles
        where shopify_customer_id = v_shopify_customer_id;
      end if;
      -- Auth email is verified by Magic Link. Never trust a client-editable
      -- profile email or a client-supplied Shopify customer ID for matching.
      if v_customer_id is null and v_email is not null then
        select profile.id into v_customer_id
        from customer_profiles profile
        join auth.users auth_user on auth_user.id = profile.id
        where lower(auth_user.email) = lower(v_email)
          and auth_user.email_confirmed_at is not null
          and profile.shopify_customer_id is null
        limit 1;
        if v_customer_id is not null and v_shopify_customer_id is not null then
          update customer_profiles
          set shopify_customer_id = v_shopify_customer_id, updated_at = now()
          where id = v_customer_id and shopify_customer_id is null;
        end if;
      end if;
    end if;

    insert into shopify_orders
      (shopify_order_id, customer_id, financial_status, currency, total_amount, paid_at, cancelled_at, payload)
    values
      (v_order_id, v_customer_id,
       coalesce(p_payload->>'financial_status', case when p_topic = 'orders/paid' then 'paid' else 'cancelled' end),
       coalesce(p_payload->>'currency', 'COP'), v_total,
       case when p_topic = 'orders/paid' then nullif(p_payload->>'processed_at', '')::timestamptz else null end,
       case when p_topic = 'orders/cancelled' then coalesce(nullif(p_payload->>'cancelled_at', '')::timestamptz, now()) else null end,
       p_payload)
    on conflict (shopify_order_id) do update
    set customer_id = coalesce(shopify_orders.customer_id, excluded.customer_id),
        financial_status = excluded.financial_status,
        cancelled_at = coalesce(shopify_orders.cancelled_at, excluded.cancelled_at),
        payload = excluded.payload, synced_at = now();
    select * into v_order from shopify_orders where shopify_order_id = v_order_id for update;
    v_customer_id := v_order.customer_id;

    if p_topic = 'orders/paid' then
      if v_order.cancelled_at is not null or v_order.currency <> 'COP' or v_customer_id is null then
        update webhook_events set status = 'processed', processed_at = now() where id = v_event.id;
        return jsonb_build_object('status', case when v_customer_id is null then 'order_saved_customer_not_enrolled' else 'order_not_eligible' end);
      end if;
      select id into v_account_id from loyalty_accounts where customer_id = v_customer_id for update;
      if v_account_id is null then raise exception 'Loyalty account missing'; end if;
      -- Amounts are centavos. COP 100,000 => 10,000,000 centavos => 100 points.
      v_points := floor(v_total::numeric / 100000);
      if v_points > 0 then
        insert into points_ledger
          (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
        values
          (v_account_id, 'earn', v_points, 'shopify_order', v_order_id,
           'shopify:' || v_order_id || ':earn', now(), jsonb_build_object('order_number', p_payload->>'order_number'))
        on conflict (idempotency_key) do nothing;
        v_new_earn := found;
        -- A refund may have been stored before the member was linked or a
        -- paid delivery may arrive out of order. Never leave full points in
        -- the account for an already refunded order.
        select coalesce(sum(total_amount), 0) into v_refunded from shopify_refunds
        where shopify_order_id = v_order_id;
        select coalesce(-sum(amount), 0) into v_reversed from points_ledger
        where event_type = 'reverse' and metadata->>'order_id' = v_order_id;
        v_to_reverse := greatest(least(v_points, floor(v_refunded::numeric / 100000)) - v_reversed, 0);
        if v_to_reverse > 0 then
          insert into points_ledger
            (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
          values
            (v_account_id, 'reverse', -v_to_reverse, 'shopify_order_refund_reconcile', v_order_id,
             'shopify:' || v_order_id || ':refund-reconcile', now(), jsonb_build_object('order_id', v_order_id))
          on conflict (idempotency_key) do nothing;
        end if;
        if v_new_earn or v_to_reverse > 0 then
          perform refresh_loyalty_balance(v_account_id);
        end if;
        if v_new_earn and v_points > v_to_reverse then
          insert into outbox_events
            (destination, event_name, aggregate_type, aggregate_id, idempotency_key, payload)
          values
            ('omnisend', 'points_earned', 'customer', v_customer_id::text,
             'omnisend:' || v_order_id || ':points_earned',
             jsonb_build_object('email', coalesce(v_email, (select email from customer_profiles where id = v_customer_id)),
               'eventName', 'points_earned', 'properties', jsonb_build_object('points', v_points - v_to_reverse, 'order_id', v_order_id)))
          on conflict (idempotency_key) do nothing;
        end if;
      end if;
      update webhook_events set status = 'processed', processed_at = now() where id = v_event.id;
      return jsonb_build_object('status', 'processed', 'points', coalesce(v_points, 0));
    end if;

    -- A cancellation reverses the remaining purchase points after any prior
    -- partial refunds. The immutable original earning is never edited.
    select coalesce(sum(amount), 0) into v_earned from points_ledger
    where source_type = 'shopify_order' and source_id = v_order_id and event_type = 'earn';
    select coalesce(-sum(amount), 0) into v_reversed from points_ledger
    where event_type = 'reverse' and metadata->>'order_id' = v_order_id;
    v_to_reverse := greatest(v_earned - v_reversed, 0);
    if v_to_reverse > 0 then
      select id into v_account_id from loyalty_accounts where customer_id = v_customer_id for update;
      insert into points_ledger
        (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
      values
        (v_account_id, 'reverse', -v_to_reverse, 'shopify_order_cancellation', v_order_id,
         'shopify:' || v_order_id || ':cancel', now(), jsonb_build_object('order_id', v_order_id))
      on conflict (idempotency_key) do nothing;
      perform refresh_loyalty_balance(v_account_id);
    end if;
    update webhook_events set status = 'processed', processed_at = now() where id = v_event.id;
    return jsonb_build_object('status', 'processed', 'points_reversed', v_to_reverse);
  end if;

  -- refunds/create: only successful COP refund transactions are counted.
  v_refund_id := nullif(p_payload->>'id', '');
  v_order_id := nullif(p_payload->>'order_id', '');
  if v_refund_id is null or v_order_id is null then raise exception 'Refund and order IDs are required'; end if;
  select * into v_order from shopify_orders where shopify_order_id = v_order_id for update;
  if not found then
    update webhook_events set status = 'failed', last_error = 'Order not ingested yet' where id = v_event.id;
    return jsonb_build_object('status', 'needs_retry');
  end if;
  if exists (
    select 1 from jsonb_array_elements(coalesce(p_payload->'transactions', '[]'::jsonb)) tx
    where lower(tx->>'kind') = 'refund' and lower(tx->>'status') = 'success'
      and coalesce(tx->>'currency', v_order.currency) <> 'COP'
  ) then
    update webhook_events set status = 'failed', last_error = 'Refund currency requires review' where id = v_event.id;
    return jsonb_build_object('status', 'needs_review');
  end if;
  select coalesce(sum(round((tx->>'amount')::numeric * 100)), 0)
  into v_refund_amount
  from jsonb_array_elements(coalesce(p_payload->'transactions', '[]'::jsonb)) tx
  where lower(tx->>'kind') = 'refund' and lower(tx->>'status') = 'success';
  if v_refund_amount <= 0 then
    update webhook_events set status = 'failed', last_error = 'No successful refund amount; manual review required' where id = v_event.id;
    return jsonb_build_object('status', 'needs_review');
  end if;
  insert into shopify_refunds (shopify_refund_id, shopify_order_id, total_amount, payload)
  values (v_refund_id, v_order_id, v_refund_amount, p_payload)
  on conflict (shopify_refund_id) do nothing;

  select coalesce(sum(amount), 0) into v_earned from points_ledger
  where source_type = 'shopify_order' and source_id = v_order_id and event_type = 'earn';
  select coalesce(-sum(amount), 0) into v_reversed from points_ledger
  where event_type = 'reverse' and metadata->>'order_id' = v_order_id;
  select coalesce(sum(total_amount), 0) into v_refunded from shopify_refunds
  where shopify_order_id = v_order_id;
  v_to_reverse := greatest(least(v_earned, floor(v_refunded::numeric / 100000)) - v_reversed, 0);
  if v_to_reverse > 0 then
    select id into v_account_id from loyalty_accounts where customer_id = v_order.customer_id for update;
    insert into points_ledger
      (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
    values
      (v_account_id, 'reverse', -v_to_reverse, 'shopify_refund', v_refund_id,
       'shopify:refund:' || v_refund_id, now(), jsonb_build_object('order_id', v_order_id))
    on conflict (idempotency_key) do nothing;
    perform refresh_loyalty_balance(v_account_id);
  end if;
  update webhook_events set status = 'processed', processed_at = now() where id = v_event.id;
  return jsonb_build_object('status', 'processed', 'points_reversed', v_to_reverse);
end;
$$;

revoke all on function public.process_shopify_event(text, jsonb, text) from public;
grant execute on function public.process_shopify_event(text, jsonb, text) to service_role;

-- Keep the older RPC entry point safe if an older deployment calls it.
create or replace function public.process_shopify_order(p_order jsonb, p_webhook_id text)
returns jsonb
language sql
security definer
set search_path = public
as $$ select public.process_shopify_event('orders/paid', p_order, p_webhook_id) $$;
revoke all on function public.process_shopify_order(jsonb, text) from public;
grant execute on function public.process_shopify_order(jsonb, text) to service_role;
