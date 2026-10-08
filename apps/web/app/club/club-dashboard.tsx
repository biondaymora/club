"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabase/browser";
import { actionCategories, demoExtraMissions, journeyStages, missionGuide, nextReward, recommendedMission, rewardGap, type ActionCategory, type Mission, type Reward, type StageId } from "./club-journey";
import styles from "./club-dashboard.module.css";
import experience from "./club-experience.module.css";

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
  const [categoryFilter, setCategoryFilter] = useState<ActionCategory | "todas">("todas");
  const [stageFilter, setStageFilter] = useState<StageId | null>(null);
  const [openMission, setOpenMission] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [demoCompletions, setDemoCompletions] = useState<Record<string, number>>({});
  const [demoRedemptions, setDemoRedemptions] = useState<string[]>([]);
  const [submittedMissions, setSubmittedMissions] = useState<string[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [missionMessage, setMissionMessage] = useState("");
  const [wantsEmail, setWantsEmail] = useState(emailConsent);
  const [consentMessage, setConsentMessage] = useState("");
  const [savingConsent, setSavingConsent] = useState(false);

  const allMissions = demo ? [...missions, ...demoExtraMissions] : missions;
  const isCompleted = (mission: Mission) => Boolean(mission.completed || demoCompletions[mission.id]);
  const suggestedMission = recommendedMission(allMissions.map(mission => ({ ...mission, completed: isCompleted(mission) })));
  const upcomingReward = nextReward(rewards, balance);
  const availableRewards = (demo || redemptionsEnabled) ? rewards.filter(reward => reward.stock !== 0 && reward.points_cost <= balance).length : 0;
  const categoryMissions = allMissions.filter(mission => stageFilter ? missionGuide(mission.code).stage === stageFilter : categoryFilter === "todas" || missionGuide(mission.code).category === categoryFilter);
  const completedSingleCount = categoryMissions.filter(mission => isCompleted(mission) && !missionGuide(mission.code).repeatable).length;
  const visibleMissions = categoryMissions.filter(mission => showCompleted || !isCompleted(mission) || missionGuide(mission.code).repeatable)
    .sort((a, b) => Number(isCompleted(a)) - Number(isCompleted(b)));
  const completedCount = allMissions.filter(isCompleted).length;
  const tierName = account?.tier_code === "member" ? "Esencia" : account?.tier_code ?? "Esencia";
  const activeStageIndex = suggestedMission ? journeyStages.findIndex(stage => stage.id === missionGuide(suggestedMission.code).stage) : -1;

  useEffect(() => {
    if (openMission) document.getElementById(`action-${openMission}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openMission, categoryFilter, stageFilter]);

  function selectCategory(category: ActionCategory | "todas") {
    setCategoryFilter(category);
    setStageFilter(null);
    setOpenMission(null);
    document.getElementById("acciones")?.scrollIntoView({ behavior: "smooth" });
  }

  function viewStage(stage: StageId) {
    setStageFilter(stage);
    setCategoryFilter("todas");
    setOpenMission(null);
    document.getElementById("acciones")?.scrollIntoView({ behavior: "smooth" });
  }

  function showMission(mission: Mission) {
    setCategoryFilter(missionGuide(mission.code).category);
    setStageFilter(null);
    setOpenMission(mission.id);
    setMissionMessage("");
  }

  function simulateAction(mission: Mission) {
    const guide = missionGuide(mission.code);
    const completedTimes = demoCompletions[mission.id] ?? 0;
    if (!demo || guide.requiresEvent || (isCompleted(mission) && !guide.repeatable) || completedTimes >= (guide.demoLimit ?? 1)) return;
    setDemoCompletions(current => ({ ...current, [mission.id]: (current[mission.id] ?? 0) + 1 }));
    setBalance(current => current + mission.points_reward);
    setLedgerEntries(current => [{ id: `demo-action-${mission.id}-${completedTimes + 1}`, event_type: "earn", amount: mission.points_reward, occurred_at: new Date().toISOString(), metadata: { mission_code: mission.code } }, ...current]);
    setMissionMessage(`Simulación registrada: +${points(mission.points_reward)} puntos de ejemplo. Ninguna participación ni evidencia se envió al equipo.`);
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
      <nav aria-label="Secciones del Club"><a href="#acciones">Qué puedo hacer</a><a href="#recompensas">Recompensas</a><a href="#camino">Ruta sugerida</a></nav>
      <div className={styles.member}><span>{user.name?.split(" ")[0] ?? user.email}</span><button type="button" onClick={signOut}>{demo ? "Editar datos" : "Cerrar sesión"}</button></div>
    </header>

    <section className={experience.welcome}>
      <div className={experience.welcomeCopy}><p className={styles.eyebrow}>CLUB BIONDA Y MORA {demo ? "· DEMO" : ""}</p><h1>Hola, {user.name?.split(" ")[0] ?? "bienvenida"}.<br /><em>Este espacio es tuyo.</em></h1><p>Elige lo que te nace hacer hoy. La ruta te orienta, pero todas las acciones están a tu alcance sin seguir un orden.</p><a href="#acciones" className={experience.welcomeLink}>Explorar todas las acciones ↗</a></div>
      <div className={experience.wallet}><span>{demo ? "SALDO DE EJEMPLO" : "MIS PUNTOS"}</span><strong>{points(balance)}</strong><small>Nivel {tierName}{demo ? " · simulación" : ""}</small><a href="#recompensas">{!demo && !redemptionsEnabled ? "Beneficios en preparación" : availableRewards > 0 ? `${availableRewards} ${availableRewards === 1 ? "recompensa a tu alcance" : "recompensas a tu alcance"}` : "Ver recompensas"} ↗</a></div>
    </section>

    {demo && <p className={styles.previewNotice}>Estás explorando una demo: no se crean puntos, compras ni canjes reales. <a href="/admin/demo">Ver vista del equipo ↗</a></p>}
    {!demo && <section className={styles.consentNotice} aria-label="Preferencias de correo"><div><strong>Correos del Club</strong><p>Elige si quieres recibir por correo avisos sobre tus puntos, acciones y recompensas. Puedes cambiarlo aquí cuando quieras; no autoriza campañas generales ni la reutilización de tu contenido.</p>{consentMessage && <small role="status">{consentMessage}</small>}</div><button type="button" disabled={savingConsent} onClick={changeEmailConsent}>{savingConsent ? "Guardando…" : wantsEmail ? "Desactivar correos" : "Activar correos del Club"}</button></section>}

    <section className={experience.choiceSection} aria-labelledby="choice-title">
      <div className={experience.choiceHeading}><div><p className={styles.eyebrow}>TU CLUB, A TU MANERA</p><h2 id="choice-title">¿Qué te gustaría hacer?</h2><p>Puedes volver a estas opciones cuando quieras. Las que se repiten muestran sus condiciones antes de participar.</p></div><a href="#camino">Prefiero una ruta sugerida ↗</a></div>
      <div className={experience.choiceGrid}>{actionCategories.map(category => <button type="button" key={category.id} onClick={() => selectCategory(category.id)}><span>{category.title}</span><small>{category.description}</small><b aria-hidden="true">↗</b></button>)}</div>
    </section>

    <section className={`${styles.overview} ${experience.overview}`} aria-label="Una sugerencia y tu próxima recompensa">
      <article className={styles.nextAction}>
        <div className={styles.nextActionCopy}><p className={styles.eyebrow}>SI QUIERES UNA SUGERENCIA</p><h2>{suggestedMission?.title ?? "Elige tu próximo gesto"}</h2><p>{suggestedMission?.description ?? "Explora las formas de participar en el Club a tu ritmo."}</p><div className={styles.actionBottom}><span>{suggestedMission ? `+${points(suggestedMission.points_reward)} puntos al validarse` : "Tú eliges cómo participar"}</span><button type="button" onClick={() => suggestedMission ? showMission(suggestedMission) : document.getElementById("acciones")?.scrollIntoView({ behavior: "smooth" })}>{suggestedMission ? "Explorar esta acción" : "Ver acciones"} ↗</button></div></div>
        <div className={styles.nextActionImage}><Image src="/brand/look.jpg" alt="Estilo Bionda y Mora" fill sizes="(max-width: 760px) 100vw, 280px" /></div>
      </article>
      <article className={styles.nextReward}>
        <p className={styles.eyebrow}>BENEFICIO EN CAMINO</p>
        {upcomingReward ? <><h2>{upcomingReward.title}</h2><p>Te faltan <strong>{points(rewardGap(balance, upcomingReward.points_cost))} puntos</strong> para poder elegirlo.</p><div className={styles.progressMeta}><span>{points(balance)} puntos</span><span>{points(upcomingReward.points_cost)} puntos</span></div><progress value={Math.min(balance, upcomingReward.points_cost)} max={upcomingReward.points_cost} aria-label={`Progreso hacia ${upcomingReward.title}`} /><small>{suggestedMission && suggestedMission.points_reward >= rewardGap(balance, upcomingReward.points_cost) ? `Una acción como “${suggestedMission.title}” puede acercarte a este beneficio cuando sea validada.` : "Con cada acción validada, te acercas a tu siguiente beneficio."}</small></> : <><h2>{rewards.length && (demo || redemptionsEnabled) ? "Ya puedes elegir" : "Pronto habrá beneficios"}</h2><p>{rewards.length && (demo || redemptionsEnabled) ? "Tu saldo alcanza los beneficios disponibles en este momento." : "El equipo está preparando el banco de recompensas."}</p></>}
        <a href="#recompensas">Ver banco de recompensas ↗</a>
      </article>
    </section>

    <section id="acciones" className={`${styles.section} ${experience.actionsSection}`}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>BANCO DE ACCIONES</p><h2>Todo lo que puedes hacer.</h2><p>Elige libremente; una acción repetible solo vuelve a sumar cuando aporta una compra, historia, amiga o visita nueva y validada.</p></div><span>{allMissions.length} posibilidades para explorar</span></div>
      <div className={experience.howItWorks}><span><b>1.</b> Elige lo que te gusta</span><span><b>2.</b> Conoce la regla</span><span><b>3.</b> Recibe puntos tras validación</span></div>
      <div className={styles.filters} aria-label="Filtrar acciones"><button type="button" aria-pressed={!stageFilter && categoryFilter === "todas"} onClick={() => selectCategory("todas")}>Todas</button>{actionCategories.map(category => <button key={category.id} type="button" aria-pressed={!stageFilter && categoryFilter === category.id} onClick={() => selectCategory(category.id)}>{category.title}</button>)}</div>
      {stageFilter && <p className={experience.stageFilter}>Viendo la etapa «{journeyStages.find(stage => stage.id === stageFilter)?.title}». <button type="button" onClick={() => selectCategory("todas")}>Ver todas las acciones</button></p>}
      {completedSingleCount > 0 && <button className={experience.completedToggle} type="button" aria-pressed={showCompleted} onClick={() => setShowCompleted(value => !value)}>{showCompleted ? "Ocultar acciones ya hechas" : `Ver ${completedSingleCount} ${completedSingleCount === 1 ? "acción ya hecha" : "acciones ya hechas"}`} ↗</button>}
      {visibleMissions.length ? <div className={experience.actionGrid}>{visibleMissions.map(mission => {
        const guide = missionGuide(mission.code);
        const isOpen = openMission === mission.id;
        const pending = mission.pending || submittedMissions.includes(mission.id);
        const done = isCompleted(mission);
        const demoCount = demoCompletions[mission.id] ?? 0;
        const demoLimitReached = demoCount >= (guide.demoLimit ?? 1);
        const canSimulate = demo && !guide.requiresEvent && !pending && (!done || guide.repeatable) && !demoLimitReached;
        const canSubmit = !demo && !done && !pending && ["HONEST_REVIEW", "REAL_WALK"].includes(mission.code.toUpperCase());
        const status = guide.requiresEvent ? "Cuando haya feria" : pending ? "En revisión" : demo && demoLimitReached ? "Muestra completada" : done && !guide.repeatable ? "Ya realizada" : done && guide.repeatable ? demo ? "Puedes repetir con novedad" : "Nueva participación por habilitar" : "Disponible para explorar";
        return <article id={`action-${mission.id}`} className={experience.actionCard} key={mission.id}>
          <div className={experience.actionCardHead}><span>{actionCategories.find(item => item.id === guide.category)?.title} · {guide.time}</span><span className={experience.actionStatus}>{status}</span></div>
          <h3>{mission.title}</h3><p>{mission.description}</p>
          <div className={experience.actionFacts}><span>+{points(mission.points_reward)} {demo ? "puntos de ejemplo" : "puntos"}</span><span>{guide.frequency}</span></div>
          {demoCount > 0 && <small className={experience.demoCount}>Simulada {demoCount} de {guide.demoLimit ?? 1} {guide.demoLimit === 1 ? "vez" : "veces"} en esta visita de prueba.</small>}
          <button className={experience.detailsButton} type="button" aria-expanded={isOpen} aria-controls={`mission-${mission.id}`} onClick={() => { setOpenMission(isOpen ? null : mission.id); setMissionMessage(""); }}>{isOpen ? "Cerrar detalles" : "Ver cómo participar"} <span aria-hidden="true">{isOpen ? "−" : "↗"}</span></button>
          {isOpen && <div id={`mission-${mission.id}`} className={experience.actionDetails}><h4>Cómo participar</h4><ol>{guide.steps.map(step => <li key={step}>{step}</li>)}</ol><h4>Cuándo cuenta</h4><p>{guide.validation}</p><strong>Frecuencia: {guide.frequency}.</strong>
            {demo && <div className={experience.demoAction}><small>Solo demostración: no enviamos datos ni otorgamos puntos reales. Las reglas y cantidades requieren aprobación antes de la beta.</small><button type="button" disabled={!canSimulate} onClick={() => simulateAction(mission)}>{guide.requiresEvent ? "Esperando fecha de feria" : demoLimitReached || (done && !guide.repeatable) ? "Muestra completada" : "Simular esta acción ↗"}</button></div>}
            {canSubmit && <form className={styles.missionForm} onSubmit={event => submitMission(event, mission)}><label htmlFor={`evidence-${mission.id}`}>Enlace público de tu reseña o historia</label><input id={`evidence-${mission.id}`} type="url" placeholder="https://…" value={evidenceUrl} onChange={event => setEvidenceUrl(event.target.value)} required /><small>Requiere una compra vinculada al Club. Enviar el enlace no autoriza a reutilizar tu contenido.</small><button type="submit" disabled={loading !== null}>{loading === mission.id ? "Enviando…" : "Enviar para revisión ↗"}</button></form>}
            {!demo && guide.repeatable && done && <small>Para acreditar una nueva participación necesitaremos habilitar la validación por compra, pieza, amiga o evento distinto.</small>}
            {missionMessage && <p role="status">{missionMessage}</p>}
          </div>}
        </article>;
      })}</div> : <p className={styles.empty}>No quedan acciones pendientes en esta categoría. Puedes ver las ya hechas o explorar otra opción.</p>}
    </section>

    <section id="camino" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>RUTA SUGERIDA</p><h2>Si quieres una guía, empieza aquí.</h2><p>Estas etapas no bloquean nada: puedes compartir, invitar o volver a elegir en cualquier momento.</p></div></div>
      {allMissions.length > 0 && <div className={experience.routeLead}><strong>{completedCount > 0 ? `Ya exploraste ${completedCount} ${completedCount === 1 ? "gesto" : "gestos"}.` : "Tu camino empieza cuando tú quieras."}</strong><span>{suggestedMission ? `Nuestra sugerencia ahora: “${suggestedMission.title}”.` : "Puedes seguir descubriendo el Club a tu manera."}</span></div>}
      {allMissions.length > 0 ? <ol className={styles.path}>{journeyStages.map((stage, stageIndex) => {
        const stageMissions = allMissions.filter(mission => missionGuide(mission.code).stage === stage.id);
        const done = stageMissions.filter(isCompleted).length;
        const status = stageIndex === activeStageIndex ? "Sugerencia actual" : done > 0 ? "Ya exploraste" : "Siempre disponible";
        return <li key={stage.id}><button className={stageIndex === activeStageIndex ? experience.currentStage : undefined} type="button" onClick={() => viewStage(stage.id)} aria-label={`Ver acciones de ${stage.title}: ${status}`}><span className={styles.pathNumber}>{stage.number}</span><span className={styles.pathCopy}><span className={experience.stageStatus}>{status}</span><strong>{stage.title}</strong><small>{stage.description}</small><span className={experience.stageBenefit}>{stage.benefit}</span><em>{done > 0 ? `${done} ${done === 1 ? "acción explorada" : "acciones exploradas"}` : "Ver acciones de esta etapa"}</em></span><span className={styles.pathArrow} aria-hidden="true">↗</span></button></li>;
      })}</ol> : <p className={styles.empty}>Estamos preparando las próximas acciones del Club.</p>}
    </section>

    <section id="recompensas" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>BANCO DE RECOMPENSAS</p><h2>Beneficios por desbloquear.</h2><p>{!demo && !redemptionsEnabled ? "Los canjes reales se habilitarán después de validar los saldos y la entrega de beneficios." : "Ve lo que puedes redimir hoy y exactamente cuánto te falta para lo demás."}</p></div><span>{points(balance)} puntos disponibles</span></div>
      <div className={styles.rewardGrid}>{rewards.map(reward => {
        const gap = rewardGap(balance, reward.points_cost);
        const soldOut = reward.stock === 0;
        const redeemed = demoRedemptions.includes(reward.id);
        return <article className={styles.reward} key={reward.id}><span className={`${styles.rewardStatus} ${gap === 0 && !soldOut && !redeemed && (demo || redemptionsEnabled) ? styles.rewardReady : ""}`}>{soldOut ? "Agotado" : redeemed ? "Canje de muestra" : !demo && !redemptionsEnabled ? "Canje en preparación" : gap === 0 ? demo ? "Disponible en esta demo" : "Puedes redimirlo" : `Te faltan ${points(gap)} puntos`}</span><h3>{reward.title}</h3><p>{reward.description}</p><div className={styles.rewardProgress}><progress value={Math.min(balance, reward.points_cost)} max={reward.points_cost} aria-label={`Puntos para ${reward.title}`} /><span>{points(Math.min(balance, reward.points_cost))} / {points(reward.points_cost)} puntos</span></div><div className={styles.rewardBottom}><strong>{points(reward.points_cost)} puntos</strong><button type="button" disabled={(!demo && !redemptionsEnabled) || soldOut || gap > 0 || redeemed || loading !== null} onClick={() => redeem(reward)}>{loading === reward.id ? "Procesando…" : redeemed ? "Canje visto" : !demo && !redemptionsEnabled ? "Próximamente" : soldOut ? "Agotado" : gap > 0 ? "Aún no" : demo ? "Simular canje ↗" : "Redimir ↗"}</button></div></article>;
      })}</div>
      {rewards.length === 0 && <p className={styles.empty}>El banco de recompensas se está preparando.</p>}
      {message && <p className={styles.message} role="status">{message}</p>}
    </section>

    <section className={styles.community}><div><p className={styles.eyebrow}>EL CÍRCULO</p><h2>Caminar juntas también cuenta.</h2><p>Una amiga, una historia compartida o un encuentro en una feria pueden convertirse en parte de tu recorrido.</p></div><div><strong>Invita con intención</strong><p>El beneficio para ambas se confirma sólo después de una primera compra válida de tu amiga.</p><strong>Encuentros Bionda y Mora</strong><p>La agenda de ferias aparecerá aquí cuando haya fechas confirmadas.</p></div></section>

    <section id="historial" className={`${styles.section} ${styles.history}`}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>TU HISTORIAL</p><h2>Todo lo que has recorrido.</h2></div></div>{ledgerEntries.length ? <ul>{ledgerEntries.map(item => <li key={item.id}><span aria-hidden="true">{item.amount < 0 ? "↗" : "✦"}</span><div><b>{item.amount < 0 ? "Canje de recompensa" : "Puntos obtenidos"}</b><small>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(item.occurred_at))}</small></div><strong className={item.amount < 0 ? styles.negative : styles.positive}>{item.amount > 0 ? "+" : ""}{points(item.amount)} puntos</strong></li>)}</ul> : <p className={styles.empty}>Tu historial aparecerá cuando recibamos tu primera compra o acción validada.</p>}</section>
  </main>;
}
