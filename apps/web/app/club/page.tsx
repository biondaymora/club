import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import ClubDashboard from "./club-dashboard";

export default async function ClubPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/club" as never);
  const { data: profile } = await supabase.from("customer_profiles").select("id,email").eq("id", user.id).maybeSingle();
  if (!profile) await supabase.from("customer_profiles").insert({ id: user.id, email: user.email ?? null });
  const { data: account } = await supabase.from("loyalty_accounts").select("id,points_balance,tier_code").eq("customer_id", user.id).maybeSingle();
  const [{ data: rewards }, { data: missions }] = await Promise.all([
    supabase.from("rewards").select("id,code,title,description,points_cost,stock").eq("active", true).order("points_cost"),
    supabase.from("missions").select("id,code,title,description,points_reward").eq("active", true).order("points_reward", { ascending: false }).limit(6)
  ]);
  const { data: ledger } = await supabase.from("points_ledger").select("id,event_type,amount,occurred_at,metadata").eq("account_id", account?.id ?? "00000000-0000-0000-0000-000000000000").order("occurred_at", { ascending: false }).limit(8);
  return <ClubDashboard user={{ id: user.id, email: user.email ?? "" }} account={account} rewards={rewards ?? []} missions={missions ?? []} ledger={ledger ?? []} />;
}
