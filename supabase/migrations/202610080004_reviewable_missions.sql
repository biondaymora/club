-- Only publish actions that members can actually submit and operators can
-- validate. The other concepts remain available in the visual demo.
update public.missions
set active = false
where code in ('WELCOME_PROFILE', 'CARE_CARD', 'SECOND_STEP', 'COMPLETE_THE_LOOK', 'WALK_TOGETHER');

insert into public.missions
  (code, title, description, starts_at, points_reward, cashback_reward, active)
values
  ('HONEST_REVIEW', 'Cuenta cómo te fue', 'Comparte el enlace a una reseña honesta sobre una pieza que compraste.', now(), 150, 0, true)
on conflict (code) do update
set title = excluded.title, description = excluded.description,
    points_reward = excluded.points_reward, active = true;

create or replace function public.submit_mission_progress(
  p_mission_id uuid,
  p_customer_id uuid,
  p_evidence_url text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mission missions%rowtype;
  v_progress mission_progress%rowtype;
begin
  select * into v_mission from missions
  where id = p_mission_id and active = true and code in ('HONEST_REVIEW', 'REAL_WALK');
  if not found then raise exception 'Mission is not available for submission'; end if;
  if not exists (
    select 1 from shopify_orders purchase
    where purchase.customer_id = p_customer_id
      and purchase.financial_status = 'paid' and purchase.cancelled_at is null
      and purchase.total_amount > coalesce((
        select sum(refund.total_amount) from shopify_refunds refund
        where refund.shopify_order_id = purchase.shopify_order_id
      ), 0)
  ) then
    raise exception 'A valid purchase linked to your Club account is required';
  end if;

  select * into v_progress from mission_progress
  where mission_id = p_mission_id and customer_id = p_customer_id for update;
  if v_progress.rewarded_at is not null then raise exception 'Mission already rewarded'; end if;
  if v_progress.progress->>'status' = 'submitted' then
    return jsonb_build_object('id', v_progress.id, 'status', 'submitted', 'idempotent', true);
  end if;

  if v_progress.id is null then
    insert into mission_progress (mission_id, customer_id, progress, completed_at)
    values (p_mission_id, p_customer_id,
      jsonb_build_object('status', 'submitted', 'evidence_url', p_evidence_url, 'note', p_note), now())
    returning * into v_progress;
  else
    update mission_progress
    set progress = jsonb_build_object('status', 'submitted', 'evidence_url', p_evidence_url, 'note', p_note),
        completed_at = now()
    where id = v_progress.id;
  end if;
  insert into audit_logs (actor_id, action, entity_type, entity_id, reason)
  values (p_customer_id, 'mission_submitted', 'mission_progress', v_progress.id::text, 'Customer submitted a link for review');
  return jsonb_build_object('id', v_progress.id, 'status', 'submitted', 'idempotent', false);
end;
$$;

revoke all on function public.submit_mission_progress(uuid, uuid, text, text) from public;
grant execute on function public.submit_mission_progress(uuid, uuid, text, text) to service_role;

create or replace function public.review_mission_progress(
  p_progress_id uuid,
  p_decision text,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_progress mission_progress%rowtype;
  v_mission missions%rowtype;
  v_account loyalty_accounts%rowtype;
begin
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Unsupported review decision';
  end if;
  if not exists (select 1 from admin_roles where user_id = p_actor_id and role in ('operator', 'admin')) then
    raise exception 'Administrator role required';
  end if;
  select * into v_progress from mission_progress where id = p_progress_id for update;
  if not found then raise exception 'Mission submission not found'; end if;
  if v_progress.progress->>'status' = p_decision then
    return jsonb_build_object('status', p_decision, 'idempotent', true);
  end if;
  if v_progress.progress->>'status' <> 'submitted' then
    raise exception 'Only submitted missions can be reviewed';
  end if;
  select * into v_mission from missions where id = v_progress.mission_id and active = true;
  if not found or v_mission.code not in ('HONEST_REVIEW', 'REAL_WALK') then
    raise exception 'Mission is not reviewable';
  end if;

  if p_decision = 'approved' then
    if not exists (
      select 1 from shopify_orders purchase
      where purchase.customer_id = v_progress.customer_id
        and purchase.financial_status = 'paid' and purchase.cancelled_at is null
        and purchase.total_amount > coalesce((
          select sum(refund.total_amount) from shopify_refunds refund
          where refund.shopify_order_id = purchase.shopify_order_id
        ), 0)
    ) then
      raise exception 'No eligible purchase remains for this mission';
    end if;
    select * into v_account from loyalty_accounts where customer_id = v_progress.customer_id for update;
    if not found then raise exception 'Loyalty account not found'; end if;
    if v_mission.points_reward > 0 then
      insert into points_ledger
        (account_id, event_type, amount, source_type, source_id, idempotency_key, occurred_at, metadata)
      values
        (v_account.id, 'earn', v_mission.points_reward, 'mission', v_progress.id::text,
         'mission:' || v_progress.id::text, now(), jsonb_build_object('mission_code', v_mission.code))
      on conflict (idempotency_key) do nothing;
      perform refresh_loyalty_balance(v_account.id);
    end if;
    update mission_progress
    set progress = jsonb_set(v_progress.progress, '{status}', '"approved"'),
        completed_at = coalesce(v_progress.completed_at, now()), rewarded_at = now()
    where id = v_progress.id;
  else
    update mission_progress
    set progress = jsonb_set(v_progress.progress, '{status}', '"rejected"'),
        completed_at = null
    where id = v_progress.id;
  end if;

  insert into audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data, reason)
  values (p_actor_id, 'mission_' || p_decision, 'mission_progress', v_progress.id::text,
    v_progress.progress, jsonb_build_object('status', p_decision), 'Operator review');
  return jsonb_build_object('status', p_decision, 'idempotent', false);
end;
$$;

revoke all on function public.review_mission_progress(uuid, text, uuid) from public;
grant execute on function public.review_mission_progress(uuid, text, uuid) to service_role;
