-- Beta onboarding: every authenticated member owns one profile and loyalty account.
create policy "customers insert own profile" on public.customer_profiles for insert with check (id = auth.uid());
create policy "customers update own profile" on public.customer_profiles for update using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.create_loyalty_account_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.loyalty_accounts (customer_id) values (new.id) on conflict (customer_id) do nothing;
  insert into public.cashback_wallets (customer_id) values (new.id) on conflict (customer_id) do nothing;
  return new;
end;
$$;

drop trigger if exists customer_profile_creates_loyalty_account on public.customer_profiles;
create trigger customer_profile_creates_loyalty_account
after insert on public.customer_profiles
for each row execute function public.create_loyalty_account_for_profile();

-- Admin role helper. Only service-role routes should invoke this function.
create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.admin_roles where user_id = p_user_id and role in ('operator', 'admin')) $$;

revoke all on function public.is_admin(uuid) from public;
