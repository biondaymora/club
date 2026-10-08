-- Claim a bounded batch without two concurrent cron invocations sending it.
-- Failed rows are retried with backoff until the configured attempt limit.
alter table public.outbox_events
  add column if not exists locked_at timestamptz,
  add column if not exists lease_token uuid;

create index if not exists customer_consents_latest_idx
  on public.customer_consents(customer_id, purpose, captured_at desc);

create or replace function public.claim_outbox_events(p_destination text, p_limit integer default 25)
returns setof public.outbox_events
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select id from outbox_events
    where destination = p_destination
      and status in ('pending', 'failed')
      and attempts < 5
      and available_at <= now()
      and (locked_at is null or locked_at < now() - interval '5 minutes')
      and (
        aggregate_type <> 'customer' or
        (select consent.granted from customer_consents consent
         where consent.customer_id::text = outbox_events.aggregate_id
           and consent.purpose = 'loyalty_email'
         order by consent.captured_at desc, consent.id desc limit 1) = true
      )
    order by available_at, created_at
    limit greatest(least(p_limit, 100), 0)
    for update skip locked
  )
  update outbox_events event
  set locked_at = now(), lease_token = gen_random_uuid(), attempts = attempts + 1
  from candidates
  where event.id = candidates.id
  returning event.*;
end;
$$;

revoke all on function public.claim_outbox_events(text, integer) from public;
grant execute on function public.claim_outbox_events(text, integer) to service_role;
