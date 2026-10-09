import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import ClubDashboard from "./club-dashboard";
import { clubLiveEnabled } from "../../lib/club-mode";
import { cookies } from "next/headers";

export default async function ClubPage() {
  if (!clubLiveEnabled) redirect((await cookies()).has("bm_beta_profile") ? "/club/demo" : "/registro");
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/club" as never);
  const { data: profile } = await supabase.from("customer_profiles").select("id,email,entry_source,shopify_customer_id").eq("id", user.id).maybeSingle();
  if (!profile) await supabase.from("customer_profiles").insert({ id: user.id, email: user.email ?? null });
  const { data: account } = await supabase.from("loyalty_accounts").select("id,points_balance,tier_code").eq("customer_id", user.id).maybeSingle();
  const [{ data: rewards }, { data: missions }, { data: missionProgress }, { data: consent }, { data: redemptionControl }] = await Promise.all([
    supabase.from("rewards").select("id,code,title,description,points_cost,stock").eq("active", true).order("points_cost"),
    supabase.from("missions").select("id,code,title,description,points_reward").eq("active", true).order("points_reward", { ascending: false }).limit(12),
    supabase.from("mission_progress").select("mission_id,completed_at,rewarded_at,progress").eq("customer_id", user.id),
    supabase.from("customer_consents").select("granted").eq("customer_id", user.id).eq("purpose", "loyalty_email").order("captured_at", { ascending: false }).limit(1).maybeSingle(),
    createAdminClient().from("club_runtime_settings").select("enabled").eq("key", "redemptions_enabled").maybeSingle()
  ]);
  const progressByMission = new Map((missionProgress ?? []).map(item => [item.mission_id, item]));
  const missionsWithStatus = (missions ?? []).map(mission => {
    const state = progressByMission.get(mission.id);
    const progress = state?.progress as Record<string, unknown> | undefined;
    return { ...mission, completed: Boolean(state?.rewarded_at), pending: Boolean(state?.completed_at && !state?.rewarded_at) || progress?.status === "pending" || progress?.status === "submitted" };
  });
  const { data: ledger } = await supabase.from("points_ledger").select("id,event_type,amount,occurred_at,metadata").eq("account_id", account?.id ?? "00000000-0000-0000-0000-000000000000").order("occurred_at", { ascending: false }).limit(8);
  return <ClubDashboard user={{ id: user.id, email: user.email ?? "" }} account={account} rewards={rewards ?? []} missions={missionsWithStatus} ledger={ledger ?? []} entrySource={profile?.entry_source ?? "direct"} hasPurchase={Boolean(profile?.shopify_customer_id)} emailConsent={consent?.granted ?? false} redemptionsEnabled={redemptionControl?.enabled ?? false} />;
}
