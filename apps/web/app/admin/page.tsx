import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import RedemptionActions from "./redemption-actions";
import styles from "./admin.module.css";

type Redemption = { id: string; created_at: string; customer_profiles: { email: string } | null; rewards: { title: string } | null };

export default async function AdminPage() {
  const sessionClient = await createServerSupabaseClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) redirect("/login?next=/admin" as never);
  const admin = createAdminClient();
  const { data: allowed } = await admin.rpc("is_admin", { p_user_id: user.id });
  if (!allowed) redirect("/club" as never);
  const [{ count: members }, { count: pending }, { data }] = await Promise.all([
    admin.from("loyalty_accounts").select("id", { count: "exact", head: true }),
    admin.from("reward_redemptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("reward_redemptions").select("id,created_at,customer_profiles(email),rewards(title)").eq("status", "pending").order("created_at", { ascending: false }).limit(20)
  ]);
  const redemptions = (data ?? []) as unknown as Redemption[];
  return <main className={styles.page}>
    <aside><a href="/landing" className={styles.brand}>Bionda <i>y</i> Mora</a><span>ADMINISTRACIÓN DEL CLUB</span><nav><b>Resumen</b><a href="#canjes">Canjes</a><a href="#integraciones">Integraciones</a><a href="/club">Vista de clienta ↗</a></nav></aside>
    <section className={styles.content}>
      <header><div><p>OPERACIÓN · BETA</p><h1>Hola, equipo.</h1></div><a className={styles.back} href="/club">Ir al Club ↗</a></header>
      <div className={styles.metrics}><article><p>MIEMBROS ACTIVOS</p><strong>{(members ?? 0).toLocaleString("es-CO")}</strong><span>Cuentas del Club</span></article><article><p>CANJES PENDIENTES</p><strong>{(pending ?? 0).toLocaleString("es-CO")}</strong><span>Requieren gestión</span></article><article><p>ESTADO</p><strong>Beta</strong><span>Operación controlada</span></article></div>
      <section className={styles.panel} id="canjes"><div><p>RECOMPENSAS</p><h2>Canjes por gestionar</h2></div><div className={styles.tableWrap}><table><thead><tr><th>Miembro</th><th>Recompensa</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>{redemptions.length ? redemptions.map((redemption) => <tr key={redemption.id}><td>{redemption.customer_profiles?.email ?? "Miembro"}</td><td>{redemption.rewards?.title ?? "Recompensa"}</td><td>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(redemption.created_at))}</td><td><RedemptionActions redemptionId={redemption.id} /></td></tr>) : <tr><td colSpan={4}>No hay canjes pendientes.</td></tr>}</tbody></table></div></section>
      <section className={styles.panel} id="integraciones"><div><p>INTEGRACIONES</p><h2>Estado de conexión</h2></div><div className={styles.integrations}><article><b>Shopify</b><span>Webhook firmado e idempotente listo para activar.</span></article><article><b>Supabase</b><span>Auth, RLS, roles y ledger transaccional activos.</span></article><article><b>Omnisend</b><span>Outbox con reintentos; configurar clave antes de enviar.</span></article></div></section>
    </section>
  </main>;
}
