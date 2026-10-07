"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabase/browser";
import styles from "./club-dashboard.module.css";

type Reward = { id: string; code: string; title: string; description: string; points_cost: number; stock: number | null };
type Mission = { id: string; code: string; title: string; description: string; points_reward: number };
type Ledger = { id: string; event_type: string; amount: number; occurred_at: string; metadata: Record<string, unknown> };
type Member = { id: string; email: string; name?: string };

export default function ClubDashboard({ user, account, rewards, missions = [], ledger, demo = false }: { user: Member; account: { id: string; points_balance: number; tier_code: string } | null; rewards: Reward[]; missions?: Mission[]; ledger: Ledger[]; demo?: boolean }) {
  const [balance, setBalance] = useState(account?.points_balance ?? 0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  async function redeem(reward: Reward) {
    if (demo) { setBalance(value => value - reward.points_cost); setMessage(`¡Listo, ${user.name ?? ""}! Tu canje de “${reward.title}” quedó registrado como demostración.`); return; }
    setLoading(reward.id); setMessage("");
    const response = await fetch("/api/rewards/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rewardId: reward.id, customerId: user.id, idempotencyKey: crypto.randomUUID() }) });
    const body = await response.json();
    if (!response.ok) setMessage(body.error ?? "No pudimos procesar el canje."); else { setBalance(value => value - reward.points_cost); setMessage(`¡Listo! Tu canje de “${reward.title}” está pendiente de gestión.`); }
    setLoading(null);
  }
  async function signOut() {
    if (demo) { window.location.href = "/registro"; return; }
    await createBrowserSupabaseClient().auth.signOut(); window.location.href = "/";
  }
  return <main className={styles.page}>
    <header><a href="/" className={styles.brand}>Bionda <i>y</i> Mora</a><div><span>{user.name ? `${user.name} · ${user.email}` : user.email}</span><button onClick={signOut}>{demo ? "Editar datos" : "Cerrar sesión"}</button></div></header>
    <section className={styles.hero}><div><p className={styles.eyebrow}>TU CLUB {demo ? "· VISTA PREVIA" : ""}</p><h1>Hola, {user.name?.split(" ")[0] ?? ""}.<br /><em>Tu camino sigue sumando.</em></h1></div><article className={styles.balance}><p>PUNTOS DISPONIBLES</p><strong>{balance.toLocaleString("es-CO")}</strong><span>puntos</span><small>Nivel actual: <b>{account?.tier_code ?? "Esencia"}</b></small></article></section>
    {missions.length > 0 && <section className={styles.section}><div><p className={styles.eyebrow}>ACCIONES PARA TI</p><h2>Pequeños gestos que abren camino.</h2></div><p className={styles.intro}>Comparte, cuida e inspira a tu manera. No necesitas vender: el Club celebra los momentos que hacen parte de tu historia.</p><div className={styles.rewards}>{missions.map(mission => <article key={mission.id}><p>{mission.code.replaceAll("_", " ")}</p><h3>{mission.title}</h3><span>{mission.description}</span><footer><b>+{mission.points_reward.toLocaleString("es-CO")} puntos</b><small className={styles.status}>Disponible</small></footer></article>)}</div></section>}
    <section className={styles.section}><div><p className={styles.eyebrow}>BANCO DE RECOMPENSAS</p><h2>Elige lo que te acompaña ahora.</h2></div><div className={styles.rewards}>{rewards.map(reward => <article key={reward.id}><p>{reward.code.replaceAll("_", " ")}</p><h3>{reward.title}</h3><span>{reward.description}</span><footer><b>{reward.points_cost.toLocaleString("es-CO")} puntos</b><button disabled={loading === reward.id || balance < reward.points_cost || reward.stock === 0} onClick={() => redeem(reward)}>{loading === reward.id ? "Procesando…" : balance < reward.points_cost ? "Aún no disponible" : "Redimir ↗"}</button></footer></article>)}</div>{message && <p className={styles.message} role="status">{message}</p>}</section>
    <section className={`${styles.section} ${styles.history}`}><div><p className={styles.eyebrow}>TU HISTORIAL</p><h2>Todo lo que has recorrido.</h2></div>{ledger.length ? <ul>{ledger.map(item => <li key={item.id}><span>{item.event_type === "redeem" ? "↗" : "✦"}</span><div><b>{item.event_type === "redeem" ? "Canje de recompensa" : "Puntos obtenidos"}</b><small>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(item.occurred_at))}</small></div><strong className={item.amount < 0 ? styles.negative : styles.positive}>{item.amount > 0 ? "+" : ""}{item.amount.toLocaleString("es-CO")} puntos</strong></li>)}</ul> : <p className={styles.empty}>Tu historial aparecerá cuando recibamos tu primera compra o misión.</p>}</section>
  </main>;
}
