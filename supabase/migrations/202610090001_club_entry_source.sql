-- Source is descriptive only. It never awards points or proves a purchase/visit.
alter table public.customer_profiles
  add column entry_source text not null default 'direct'
  check (entry_source in ('direct', 'web_subscription', 'fair', 'purchase'));

comment on column public.customer_profiles.entry_source is
  'How a verified member reached the Club; not evidence for points or rewards.';
