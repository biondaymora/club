"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabase/browser";
import { journeyStages, missionGuide, nextReward, recommendedMission, rewardGap, type Mission, type Reward, type StageId } from "./club-journey";
import styles from "./club-dashboard.module.css";

type Ledger = { id: string; event_type: string; amount: number; occurred_at: string; metadata: Record<string, unknown> };
type Member = { id: string; email: string; name?: string };
type Account = { id: string; points_balance: number; tier_code: string } | null;
const points = (value: number) => value.toLocaleString("es-CO");

export default function ClubDashboard({ user, account, rewards, missions = [], ledger, demo = false, emailConsent = false, redemptionsEnabled = false }: {
  user: Member; account: Account; rewards: Reward[]; missions?: Mission[]; ledger: Ledger[]; demo?: boolean; emailConsent?: boolean; redemptionsEnabled?: boolean;
}) {
  const [balance, setBalance] = useState(account?.points_balance ?? 0);
  const [ledgerEntries, setLedgerEntries] = useState(ledger);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<StageId | "todas">("todas");
  const [openMission, setOpenMission] = useState<string | null>(null);
  const [demoRedemptions, setDemoRedemptions] = useState<string[]>([]);
  const [submittedMissions, setSubmittedMissions] = useState<string[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [missionMessage, setMissionMessage] = useState("");
  const [wantsEmail, setWantsEmail] = useState(emailConsent);
  const [consentMessage, setConsentMessage] = useState("");
  const [savingConsent, setSavingConsent] = useState(false);

  const suggestedMission = recommendedMission(missions);
  const upcomingReward = nextReward(rewards, balance);
  const availableRewards = (demo || redemptionsEnabled) ? rewards.filter(reward => reward.stock !== 0 && reward.points_cost <= balance).length : 0;
  const visibleMissions = missions.filter(mission => stageFilter === "todas" || missionGuide(mission.code).stage === stageFilter);
  const completedCount = missions.filter(mission => mission.completed).length;
  const tierName = account?.tier_code === "member" ? "Esencia" : account?.tier_code ?? "Esencia";

  function viewStage(stage: StageId) {
    setStageFilter(stage);
    document.getElementById("acciones")?.scrollIntoView({ behavior: "smooth" });
  }

  function showMission(mission: Mission) {
    setStageFilter(missionGuide(mission.code).stage);
    setOpenMission(mission.id);
    setMissionMessage("");
    document.getElementById("acciones")?.scrollIntoView({ behavior: "smooth" });
  }

  async function submitMission(event: FormEvent<HTMLFormElement>, mission: Mission) {
    event.preventDefault();
    if (demo || loading) return;
    setLoading(mission.id);
    setMissionMessage("");
    try {
      const response = await fetch("/api/missions/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: mission.id, evidenceUrl })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No pudimos recibir tu participación.");
      setSubmittedMissions(current => [...current, mission.id]);
      setEvidenceUrl("");
      setMissionMessage("Recibimos tu enlace. El equipo lo revisará antes de acreditar los puntos.");
    } catch (error) {
      setMissionMessage(error instanceof Error ? error.message : "No pudimos recibir tu participación.");
    } finally {
      setLoading(null);
    }
  }

  async function redeem(reward: Reward) {
    if ((!demo && !redemptionsEnabled) || reward.stock === 0 || balance < reward.points_cost || loading || demoRedemptions.includes(reward.id)) return;
    if (demo) {
      setBalance(current => current - reward.points_cost);
      setDemoRedemptions(current => [...current, reward.id]);
      setLedgerEntries(current => [{ id: `demo-${reward.id}`, event_type: "redeem", amount: -reward.points_cost, occurred_at: new Date().toISOString(), metadata: { reward_code: reward.code } }, ...current]);
      setMessage(`Canje de muestra: “${reward.title}”. Esta vista no genera un beneficio real.`);
      return;
    }
    setLoading(reward.id);
    setMessage("");
    try {
      const response = await fetch("/api/rewards/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rewardId: reward.id, customerId: user.id, idempotencyKey: crypto.randomUUID() }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No pudimos procesar el canje.");
      setBalance(current => current - reward.points_cost);
      setLedgerEntries(current => [{ id: `local-${reward.id}-${Date.now()}`, event_type: "redeem", amount: -reward.points_cost, occurred_at: new Date().toISOString(), metadata: { reward_code: reward.code } }, ...current]);
      setMessage(`Canje solicitado: “${reward.title}”. Verás la confirmación cuando el equipo lo gestione.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos procesar el canje.");
    } finally {
      setLoading(null);
    }
  }

  async function signOut() {
    if (demo) { window.location.href = "/registro"; return; }
    await createBrowserSupabaseClient().auth.signOut();
    window.location.href = "/";
  }

  async function changeEmailConsent() {
    setSavingConsent(true);
    setConsentMessage("");
    try {
      const response = await fetch("/api/consent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loyaltyEmail: !wantsEmail })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No pudimos guardar tu preferencia.");
      setWantsEmail(body.loyaltyEmail);
      setConsentMessage(body.loyaltyEmail ? "Activaste los correos del Club." : "Desactivaste los correos del Club.");
    } catch (error) {
      setConsentMessage(error instanceof Error ? error.message : "No pudimos guardar tu preferencia.");
    } finally {
      setSavingConsent(false);
    }
  }

  return <main className={styles.page}>
    <header className={styles.topbar}>
      <a href="/" className={styles.brand}>Bionda <i>y</i> Mora</a>
      <nav aria-label="Secciones del Club"><a href="#camino">Mi camino</a><a href="#acciones">Acciones</a><a href="#recompensas">Beneficios</a></nav>
      <div className={styles.member}><span>{user.name?.split(" ")[0] ?? user.email}</span><button type="button" onClick={signOut}>{demo ? "Editar datos" : "Cerrar sesión"}</button></div>
    </header>

    <section className={styles.hero}>
      <div><p className={styles.eyebrow}>CLUB BIONDA Y MORA {demo ? "· VISTA PREVIA" : ""}</p><h1>Hola, {user.name?.split(" ")[0] ?? "bienvenida"}.<br /><em>Cada paso cuenta.</em></h1><p>Descubre qué puedes hacer hoy y los beneficios que ya están a tu alcance.</p></div>
      <div className={styles.balance}><span>PUNTOS DISPONIBLES</span><strong>{points(balance)}</strong><small>Tu nivel: {tierName}</small><a href="#recompensas">{!demo && !redemptionsEnabled ? "Beneficios en preparación" : availableRewards > 0 ? `${availableRewards} ${availableRewards === 1 ? "beneficio disponible" : "beneficios disponibles"}` : "Explorar beneficios"} ↗</a></div>
    </section>

    {demo && <p className={styles.previewNotice}>Vista de prueba: el saldo, los avances y los canjes son ilustrativos. <a href="/login?next=/club">Activar mi cuenta con un enlace seguro ↗</a></p>}
    {!demo && <section className={styles.consentNotice} aria-label="Preferencias de correo"><div><strong>Correos del Club</strong><p>Elige si quieres recibir por correo avisos sobre tus puntos, acciones y recompensas. Puedes cambiarlo aquí cuando quieras; no autoriza campañas generales ni la reutilización de tu contenido.</p>{consentMessage && <small role="status">{consentMessage}</small>}</div><button type="button" disabled={savingConsent} onClick={changeEmailConsent}>{savingConsent ? "Guardando…" : wantsEmail ? "Desactivar correos" : "Activar correos del Club"}</button></section>}

    <section className={styles.overview} aria-label="Tu siguiente paso y próxima recompensa">
      <article className={styles.nextAction}>
        <div className={styles.nextActionCopy}><p className={styles.eyebrow}>TU SIGUIENTE PASO</p><h2>{suggestedMission?.title ?? "Elige tu próximo gesto"}</h2><p>{suggestedMission?.description ?? "Explora las formas de participar en el Club a tu ritmo."}</p><div className={styles.actionBottom}><span>{suggestedMission ? `+${points(suggestedMission.points_reward)} puntos al validarse` : "Tú eliges cómo participar"}</span><button type="button" onClick={() => suggestedMission ? showMission(suggestedMission) : document.getElementById("acciones")?.scrollIntoView({ behavior: "smooth" })}>{suggestedMission ? "Ver cómo hacerlo" : "Ver acciones"} ↗</button></div></div>
        <div className={styles.nextActionImage}><Image src="/brand/look.jpg" alt="Estilo Bionda y Mora" fill sizes="(max-width: 760px) 100vw, 280px" /></div>
      </article>
      <article className={styles.nextReward}>
        <p className={styles.eyebrow}>BENEFICIO EN CAMINO</p>
        {upcomingReward ? <><h2>{upcomingReward.title}</h2><p>Te faltan <strong>{points(rewardGap(balance, upcomingReward.points_cost))} puntos</strong> para poder elegirlo.</p><div className={styles.progressMeta}><span>{points(balance)} puntos</span><span>{points(upcomingReward.points_cost)} puntos</span></div><progress value={Math.min(balance, upcomingReward.points_cost)} max={upcomingReward.points_cost} aria-label={`Progreso hacia ${upcomingReward.title}`} /><small>{suggestedMission && suggestedMission.points_reward >= rewardGap(balance, upcomingReward.points_cost) ? `Una acción como “${suggestedMission.title}” puede acercarte a este beneficio cuando sea validada.` : "Con cada acción validada, te acercas a tu siguiente beneficio."}</small></> : <><h2>{rewards.length && (demo || redemptionsEnabled) ? "Ya puedes elegir" : "Pronto habrá beneficios"}</h2><p>{rewards.length && (demo || redemptionsEnabled) ? "Tu saldo alcanza los beneficios disponibles en este momento." : "El equipo está preparando el banco de recompensas."}</p></>}
        <a href="#recompensas">Ver banco de recompensas ↗</a>
      </article>
    </section>

    <section id="camino" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>TU CAMINO</p><h2>Así puedes vivir el Club.</h2><p>Una ruta para orientarte, sin plazos ni tareas obligatorias.</p></div>{missions.length > 0 && <span>{completedCount} de {missions.length} acciones completadas</span>}</div>
      {missions.length > 0 ? <ol className={styles.path}>{journeyStages.map(stage => {
        const stageMissions = missions.filter(mission => missionGuide(mission.code).stage === stage.id);
        const done = stageMissions.filter(mission => mission.completed).length;
        return <li key={stage.id}><button type="button" onClick={() => viewStage(stage.id)} aria-label={`Ver acciones de ${stage.title}`}><span className={styles.pathNumber}>{stage.number}</span><span className={styles.pathCopy}><strong>{stage.title}</strong><small>{stage.description}</small><em>{stageMissions.length ? `${done} de ${stageMissions.length} ${stageMissions.length === 1 ? "acción completada" : "acciones completadas"}` : "Explora esta etapa"}</em></span><span className={styles.pathArrow} aria-hidden="true">↗</span></button></li>;
      })}</ol> : <p className={styles.empty}>Estamos preparando las próximas acciones del Club.</p>}
    </section>

    <section id="acciones" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>FORMAS DE SUMAR</p><h2>Acciones claras, a tu ritmo.</h2><p>Abre una acción para conocer qué hacer y cuándo se acreditan los puntos.</p></div></div>
      <div className={styles.filters} aria-label="Filtrar acciones"><button type="button" aria-pressed={stageFilter === "todas"} onClick={() => setStageFilter("todas")}>Todas</button>{journeyStages.map(stage => <button key={stage.id} type="button" aria-pressed={stageFilter === stage.id} onClick={() => setStageFilter(stage.id)}>{stage.title}</button>)}</div>
      {visibleMissions.length ? <div className={styles.missionList}>{visibleMissions.map(mission => {
        const guide = missionGuide(mission.code);
        const isOpen = openMission === mission.id;
        const stage = journeyStages.find(item => item.id === guide.stage);
        const pending = mission.pending || submittedMissions.includes(mission.id);
        const canSubmit = !demo && !mission.completed && !pending && ["HONEST_REVIEW", "REAL_WALK"].includes(mission.code.toUpperCase());
        return <article className={styles.mission} key={mission.id}>
          <div className={styles.missionMain}><div className={styles.missionIdentity}><span className={styles.missionStage}>{stage?.title} · {guide.time}</span><h3>{mission.title}</h3><p>{mission.description}</p></div><div className={styles.missionSide}><strong>+{points(mission.points_reward)} puntos</strong><span className={mission.completed ? styles.done : pending ? styles.pending : styles.explore}>{mission.completed ? "Completada" : pending ? "En revisión" : "Por explorar"}</span><button type="button" aria-expanded={isOpen} aria-controls={`mission-${mission.id}`} onClick={() => setOpenMission(isOpen ? null : mission.id)}>{isOpen ? "Cerrar detalles" : "Cómo sumar"} <span aria-hidden="true">{isOpen ? "−" : "+"}</span></button></div></div>
          {isOpen && <div id={`mission-${mission.id}`} className={styles.missionDetails}><div><h4>Cómo participar</h4><ol>{guide.steps.map(step => <li key={step}>{step}</li>)}</ol></div><div><h4>Cuándo recibes los puntos</h4><p>{guide.validation}</p><small>{demo ? "Vista de prueba: explorar esta acción no acredita puntos reales." : pending ? "Tu enlace está en revisión; recarga la página para ver el resultado." : "El saldo cambia después de la validación."}</small>{canSubmit && <form className={styles.missionForm} onSubmit={event => submitMission(event, mission)}><label htmlFor={`evidence-${mission.id}`}>Enlace público de tu reseña o historia</label><input id={`evidence-${mission.id}`} type="url" placeholder="https://…" value={evidenceUrl} onChange={event => setEvidenceUrl(event.target.value)} required /><small>Requiere una compra vinculada al Club. Enviar el enlace no autoriza a la marca a reutilizar tu contenido.</small><button type="submit" disabled={loading !== null}>{loading === mission.id ? "Enviando…" : "Enviar para revisión ↗"}</button></form>}{missionMessage && <p role="status">{missionMessage}</p>}</div></div>}
        </article>;
      })}</div> : <p className={styles.empty}>Aún no hay acciones en esta etapa. Puedes explorar las otras.</p>}
    </section>

    <section id="recompensas" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>BANCO DE RECOMPENSAS</p><h2>Beneficios por desbloquear.</h2><p>{!demo && !redemptionsEnabled ? "Los canjes reales se habilitarán después de validar los saldos y la entrega de beneficios." : "Ve lo que puedes redimir hoy y exactamente cuánto te falta para lo demás."}</p></div><span>{points(balance)} puntos disponibles</span></div>
      <div className={styles.rewardGrid}>{rewards.map(reward => {
        const gap = rewardGap(balance, reward.points_cost);
        const soldOut = reward.stock === 0;
        const redeemed = demoRedemptions.includes(reward.id);
        return <article className={styles.reward} key={reward.id}><span className={`${styles.rewardStatus} ${gap === 0 && !soldOut && !redeemed && (demo || redemptionsEnabled) ? styles.rewardReady : ""}`}>{soldOut ? "Agotado" : redeemed ? "Canje de muestra" : !demo && !redemptionsEnabled ? "Canje en preparación" : gap === 0 ? "Puedes redimirlo" : `Te faltan ${points(gap)} puntos`}</span><h3>{reward.title}</h3><p>{reward.description}</p><div className={styles.rewardProgress}><progress value={Math.min(balance, reward.points_cost)} max={reward.points_cost} aria-label={`Puntos para ${reward.title}`} /><span>{points(Math.min(balance, reward.points_cost))} / {points(reward.points_cost)} puntos</span></div><div className={styles.rewardBottom}><strong>{points(reward.points_cost)} puntos</strong><button type="button" disabled={(!demo && !redemptionsEnabled) || soldOut || gap > 0 || redeemed || loading !== null} onClick={() => redeem(reward)}>{loading === reward.id ? "Procesando…" : redeemed ? "Canje visto" : !demo && !redemptionsEnabled ? "Próximamente" : soldOut ? "Agotado" : gap > 0 ? "Aún no" : "Redimir ↗"}</button></div></article>;
      })}</div>
      {rewards.length === 0 && <p className={styles.empty}>El banco de recompensas se está preparando.</p>}
      {message && <p className={styles.message} role="status">{message}</p>}
    </section>

    <section className={styles.community}><div><p className={styles.eyebrow}>EL CÍRCULO</p><h2>Caminar juntas también cuenta.</h2><p>Una amiga, una historia compartida o un encuentro en una feria pueden convertirse en parte de tu recorrido.</p></div><div><strong>Invita con intención</strong><p>El beneficio para ambas se confirma sólo después de una primera compra válida de tu amiga.</p><strong>Encuentros Bionda y Mora</strong><p>La agenda de ferias aparecerá aquí cuando haya fechas confirmadas.</p></div></section>

    <section id="historial" className={`${styles.section} ${styles.history}`}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>TU HISTORIAL</p><h2>Todo lo que has recorrido.</h2></div></div>{ledgerEntries.length ? <ul>{ledgerEntries.map(item => <li key={item.id}><span aria-hidden="true">{item.amount < 0 ? "↗" : "✦"}</span><div><b>{item.amount < 0 ? "Canje de recompensa" : "Puntos obtenidos"}</b><small>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(item.occurred_at))}</small></div><strong className={item.amount < 0 ? styles.negative : styles.positive}>{item.amount > 0 ? "+" : ""}{points(item.amount)} puntos</strong></li>)}</ul> : <p className={styles.empty}>Tu historial aparecerá cuando recibamos tu primera compra o acción validada.</p>}</section>
  </main>;
}
