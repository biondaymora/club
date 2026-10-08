import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import RedemptionActions from "./redemption-actions";
import MissionReviewActions from "./mission-review-actions";
import { env } from "../../lib/env";
import styles from "./admin.module.css";
import layout from "./admin-layout.module.css";
import { clubLiveEnabled } from "../../lib/club-mode";

type Redemption = { id: string; created_at: string; customer_profiles: { email: string } | null; rewards: { title: string } | null };
type Submission = { id: string; completed_at: string; progress: { evidence_url?: string }; customer_profiles: { email: string } | null; missions: { title: string } | null };

export default async function AdminPage() {
  if (!clubLiveEnabled) redirect("/admin/demo");
  const sessionClient = await createServerSupabaseClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) redirect("/login?next=/admin" as never);
  const admin = createAdminClient();
  const { data: allowed } = await admin.rpc("is_admin", { p_user_id: user.id });
  if (!allowed) redirect("/club" as never);
  const [{ count: members }, { count: pending }, { data }, { data: submissionsData }, { count: failedWebhooks }, { count: failedEmails }] = await Promise.all([
    admin.from("loyalty_accounts").select("id", { count: "exact", head: true }),
    admin.from("reward_redemptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("reward_redemptions").select("id,created_at,customer_profiles(email),rewards(title)").eq("status", "pending").order("created_at", { ascending: false }).limit(20),
    admin.from("mission_progress").select("id,completed_at,progress,customer_profiles(email),missions(title)").eq("progress->>status", "submitted").order("completed_at", { ascending: true }).limit(20),
    admin.from("webhook_events").select("id", { count: "exact", head: true }).eq("status", "failed"),
    admin.from("outbox_events").select("id", { count: "exact", head: true }).eq("status", "failed")
  ]);
  const redemptions = (data ?? []) as unknown as Redemption[];
  const submissions = (submissionsData ?? []) as unknown as Submission[];
  return <main className={`${styles.page} ${layout.page}`}>
    <aside><a href="/landing" className={styles.brand}>Bionda <i>y</i> Mora</a><span>ADMINISTRACIÓN DEL CLUB</span><nav><b>Resumen</b><a href="#canjes">Canjes</a><a href="#misiones">Participaciones</a><a href="#integraciones">Integraciones</a><a href="/club">Vista de clienta ↗</a></nav></aside>
    <section className={styles.content}>
      <header><div><p>OPERACIÓN · BETA</p><h1>Hola, equipo.</h1></div><a className={styles.back} href="/club">Ir al Club ↗</a></header>
      <div className={styles.metrics}><article><p>MIEMBROS ACTIVOS</p><strong>{(members ?? 0).toLocaleString("es-CO")}</strong><span>Cuentas del Club</span></article><article><p>CANJES PENDIENTES</p><strong>{(pending ?? 0).toLocaleString("es-CO")}</strong><span>Requieren gestión</span></article><article><p>ESTADO</p><strong>Beta</strong><span>Operación controlada</span></article></div>
      <section className={styles.panel} id="canjes"><div><p>RECOMPENSAS</p><h2>Canjes por gestionar</h2></div><div className={styles.tableWrap}><table><thead><tr><th>Miembro</th><th>Recompensa</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>{redemptions.length ? redemptions.map((redemption) => <tr key={redemption.id}><td>{redemption.customer_profiles?.email ?? "Miembro"}</td><td>{redemption.rewards?.title ?? "Recompensa"}</td><td>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(redemption.created_at))}</td><td><RedemptionActions redemptionId={redemption.id} /></td></tr>) : <tr><td colSpan={4}>No hay canjes pendientes.</td></tr>}</tbody></table></div></section>
      <section className={styles.panel} id="misiones"><div><p>COMUNIDAD</p><h2>Participaciones por revisar</h2></div><div className={styles.tableWrap}><table><thead><tr><th>Miembro</th><th>Acción</th><th>Enlace</th><th>Decisión</th></tr></thead><tbody>{submissions.length ? submissions.map(item => <tr key={item.id}><td>{item.customer_profiles?.email ?? "Miembro"}</td><td>{item.missions?.title ?? "Acción"}</td><td>{item.progress.evidence_url?.startsWith("https://") ? <a href={item.progress.evidence_url} target="_blank" rel="noopener noreferrer">Abrir evidencia ↗</a> : "Sin enlace"}</td><td><MissionReviewActions progressId={item.id} /></td></tr>) : <tr><td colSpan={4}>No hay participaciones pendientes.</td></tr>}</tbody></table></div></section>
      <section className={styles.panel} id="integraciones"><div><p>INTEGRACIONES</p><h2>Estado operativo</h2></div><div className={styles.integrations}><article><b>Shopify</b><span>{env.SHOPIFY_WEBHOOK_SECRET ? "Clave configurada; verificar entregas reales." : "Falta configurar la clave del webhook."} {failedWebhooks ?? 0} eventos requieren revisión.</span></article><article><b>Supabase</b><span>Panel autenticado; comprobar migraciones y cuentas de prueba.</span></article><article><b>Omnisend</b><span>{env.OMNISEND_API_KEY ? "Clave configurada; verificar automatizaciones." : "Falta configurar la clave API."} {failedEmails ?? 0} envíos fallidos o pendientes de reintento.</span></article></div></section>
    </section>
  </main>;
}
