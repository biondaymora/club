"use client";

import { useState } from "react";

type View = "inicio" | "recompensas" | "misiones" | "historial";

const rewards = [
  { id: "envio", category: "Para tu próxima compra", points: 600, title: "Envío gratis", description: "Recibe tu próxima pieza sin costo de envío.", mark: "↗", tone: "sand" },
  { id: "cuidado", category: "Un detalle para ti", points: 850, title: "Kit de cuidado", description: "Lo esencial para acompañar el cuero que amas.", mark: "✦", tone: "clay" },
  { id: "acceso", category: "Solo para el Club", points: 1200, title: "Acceso anticipado", description: "Conoce la próxima colección antes que nadie.", mark: "01", tone: "moss" },
  { id: "cashback", category: "Para elegir a tu manera", points: 1500, title: "$50.000 de cashback", description: "Un impulso para tu próxima elección Bionda y Mora.", mark: "$", tone: "ink" }
];

const nav: { id: View; label: string; symbol: string }[] = [
  { id: "inicio", label: "Inicio", symbol: "⌂" },
  { id: "recompensas", label: "Banco de recompensas", symbol: "✦" },
  { id: "misiones", label: "Mis misiones", symbol: "◌" },
  { id: "historial", label: "Historial", symbol: "↘" }
];

export default function HomePage() {
  const [view, setView] = useState<View>("inicio");
  const [points, setPoints] = useState(1240);
  const [notice, setNotice] = useState("");
  const [redeemed, setRedeemed] = useState<string[]>([]);

  function go(next: View) { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function redeem(id: string, cost: number, title: string) {
    if (redeemed.includes(id)) return;
    if (points < cost) { setNotice(`Te faltan ${cost - points} puntos para redimir este beneficio.`); return; }
    setPoints(value => value - cost);
    setRedeemed(value => [...value, id]);
    setNotice(`¡Listo! Redimiste “${title}”. Este es un canje de demostración.`);
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => go("inicio")} aria-label="Inicio Club Bionda y Mora"><span>Bionda</span><i>y</i><span>Mora</span><small>CLUB</small></button>
      <div className="sidebar-rule" />
      <nav aria-label="Navegación del Club">
        {nav.map(item => <button key={item.id} className={view === item.id ? "nav-link active" : "nav-link"} onClick={() => go(item.id)}><b>{item.symbol}</b>{item.label}</button>)}
      </nav>
      <div className="member"><div className="avatar">MC</div><div><strong>María C.</strong><span>Miembro Esencia</span></div><b className="chevron">⌄</b></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><span className="kicker">BIONDA Y MORA · CLUB</span><span className="prototype-pill"><i /> MVP VISUAL · DATOS DE MUESTRA</span><button className="store-link" onClick={() => setNotice("En producción, este botón llevaría a la tienda Bionda y Mora.")}>Ir a la tienda ↗</button></header>
      {view === "inicio" && <Home points={points} go={go} />}
      {view === "recompensas" && <Rewards points={points} redeemed={redeemed} onRedeem={redeem} />}
      {view === "misiones" && <Missions onNotice={setNotice} />}
      {view === "historial" && <History points={points} />}
    </section>
    {notice && <div className="toast" role="status"><span>✦</span><p>{notice}</p><button aria-label="Cerrar" onClick={() => setNotice("")}>×</button></div>}
  </main>;
}

function Home({ points, go }: { points: number; go: (view: View) => void }) {
  const progress = Math.min((points / 1500) * 100, 100);
  return <div className="screen">
    <section className="hero"><div><p className="eyebrow">TU ESPACIO PERSONAL</p><h1>Hola, María.<br /><em>Qué bueno verte por aquí.</em></h1><p className="hero-copy">Tu forma de caminar también cuenta una historia. En el Club, cada elección te acerca a algo especial.</p></div><div className="hero-medallion"><span>BM</span><i>✦</i><small>DESDE<br />COLOMBIA</small></div></section>
    <section className="points-panel"><div className="points-orbit" aria-hidden="true"><span>✦</span></div><div className="points-copy"><p>DISPONIBLES PARA TI</p><strong>{points.toLocaleString("es-CO")} <small>puntos</small></strong><span>Cada compra, misión y momento compartido suma.</span></div><div className="points-progress"><div className="progress-label"><span>Camino a Raíz</span><strong>{points.toLocaleString("es-CO")} / 1.500</strong></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><p>Te faltan <b>{(1500 - points).toLocaleString("es-CO")} puntos</b> para subir de nivel.</p><button className="button button-cream" onClick={() => go("recompensas")}>Explorar recompensas <span>↗</span></button></div></section>
    <div className="dashboard-grid"><section className="level-card"><div className="card-head"><p className="eyebrow">TU NIVEL</p><button onClick={() => go("historial")}>Ver recorrido ↗</button></div><div className="level-detail"><div className="level-mark">E<span>✦</span></div><div><h2>Esencia</h2><p>Para quienes eligen caminar a su manera.</p></div></div><div className="fine-line" /><p className="next-level">Próximo nivel <b>Raíz</b><span>+{(1500 - points).toLocaleString("es-CO")} puntos</span></p></section><section className="cashback-card"><p className="eyebrow">TU CASHBACK</p><strong>$32.000 <small>COP</small></strong><p>Listo para acompañar tu próxima elección.</p><button onClick={() => go("recompensas")}>Cómo usarlo <span>↗</span></button><i className="cashback-flower">✦</i></section></div>
    <section className="feature-mission"><div className="section-head"><div><p className="eyebrow">HECHAS PARA TI</p><h2>Una misión para hoy</h2></div><button onClick={() => go("misiones")}>Ver todas ↗</button></div><article className="mission-banner"><div className="mission-art"><span>✦</span><i>✽</i><small>COMPARTIR<br />INSPIRA</small></div><div className="mission-copy"><p className="mission-label">MISIÓN ACTIVA · 3 DÍAS RESTANTES</p><h3>Comparte tu estilo</h3><p>Muéstranos cómo llevas tu pieza Bionda y Mora y recibe puntos para seguir caminando con nosotras.</p><div><strong>+150 puntos</strong><button className="button button-ink" onClick={() => go("misiones")}>Ver misión ↗</button></div></div></article></section>
    <section className="teaser"><div><p className="eyebrow">BANCO DE RECOMPENSAS</p><h2>Un gesto para cada paso.</h2><p>Tu recorrido se transforma en beneficios pensados para ti.</p></div><button className="button button-outline" onClick={() => go("recompensas")}>Ver mis recompensas <span>↗</span></button></section>
  </div>;
}

function Rewards({ points, redeemed, onRedeem }: { points: number; redeemed: string[]; onRedeem: (id: string, cost: number, title: string) => void }) {
  return <div className="screen rewards-screen"><section className="page-hero"><div><p className="eyebrow">BANCO DE RECOMPENSAS</p><h1>Lo que eliges,<br /><em>vuelve a ti.</em></h1><p>Redime tus puntos por beneficios creados para acompañar tu camino.</p></div><div className="points-chip"><span>TUS PUNTOS</span><strong>{points.toLocaleString("es-CO")}</strong><i>✦</i></div></section><div className="reward-intro"><p>DISPONIBLES AHORA</p><span>Elige un beneficio. En este MVP, los canjes son simulados.</span></div><section className="reward-grid">{rewards.map((reward, index) => { const isRedeemed = redeemed.includes(reward.id); const available = points >= reward.points; return <article className={`reward-card ${reward.tone}`} key={reward.id}><div className="reward-art"><span>{reward.mark}</span><small>0{index + 1}</small></div><div className="reward-body"><p>{reward.category}</p><h2>{reward.title}</h2><span>{reward.description}</span><div className="reward-footer"><strong>{reward.points.toLocaleString("es-CO")} <small>puntos</small></strong><button className={isRedeemed ? "redeem done" : "redeem"} disabled={isRedeemed} onClick={() => onRedeem(reward.id, reward.points, reward.title)}>{isRedeemed ? "Redimido ✓" : available ? "Redimir ↗" : "Ver detalle ↗"}</button></div></div></article>; })}</section><section className="how-it-works"><span>01</span><div><p className="eyebrow">CÓMO FUNCIONA</p><h2>Redimir es así de simple.</h2></div><p>Elige tu beneficio, confirma el canje y úsalo en tu próxima compra. La versión conectada mostrará condiciones, vigencia y entrega real.</p></section></div>;
}

function Missions({ onNotice }: { onNotice: (notice: string) => void }) {
  return <div className="screen"><section className="page-hero"><div><p className="eyebrow">MIS MISIONES</p><h1>Pequeños momentos,<br /><em>grandes recompensas.</em></h1><p>Tu manera de vivir Bionda y Mora también inspira a otras mujeres.</p></div></section><section className="mission-list"><article><div className="number">01</div><div><p className="mission-label">ACTIVA · 3 DÍAS RESTANTES</p><h2>Comparte tu estilo</h2><p>Inspira a la comunidad con una foto de tu pieza favorita.</p></div><strong>+150 puntos</strong><button className="button button-ink" onClick={() => onNotice("La carga de contenido se habilitará cuando conectemos el Club.")}>Comenzar ↗</button></article><article className="locked"><div className="number">02</div><div><p className="mission-label">PRÓXIMAMENTE</p><h2>Tu segunda caminata</h2><p>Una sorpresa para celebrar que elegiste volver.</p></div><strong>+300 puntos</strong><span className="lock">Disponible pronto</span></article></section></div>;
}

function History({ points }: { points: number }) {
  return <div className="screen"><section className="page-hero history-hero"><div><p className="eyebrow">TU RECORRIDO</p><h1>Cada paso<br /><em>cuenta.</em></h1><p>Un resumen demostrativo de los momentos que te han traído hasta aquí.</p></div><div className="history-total"><span>SALDO ACTUAL</span><strong>{points.toLocaleString("es-CO")}</strong><small>puntos</small></div></section><section className="history-list"><p className="eyebrow">JUNIO 2026</p><article><span className="history-icon">✦</span><div><h2>Compra Bota Convertible Vera</h2><p>18 de junio · Compra verificada</p></div><strong className="positive">+590 puntos</strong></article><article><span className="history-icon">✦</span><div><h2>Bienvenida al Club</h2><p>12 de junio · Misión completada</p></div><strong className="positive">+150 puntos</strong></article><article><span className="history-icon soft">↗</span><div><h2>Canje de beneficio</h2><p>09 de junio · Envío sin costo</p></div><strong className="negative">−100 puntos</strong></article></section></div>;
}
