import Link from "next/link";
import { redirect } from "next/navigation";
import { clubLiveEnabled } from "../../../lib/club-mode";
import styles from "../admin.module.css";
import layout from "../admin-layout.module.css";

export default function AdminDemoPage() {
  if (clubLiveEnabled) redirect("/admin");
  return <main className={`${styles.page} ${layout.page}`}>
    <aside>
      <Link href="/" className={styles.brand}>Bionda <i>y</i> Mora</Link>
      <span>ADMINISTRACIÓN · VISTA PREVIA</span>
      <nav><b>Resumen</b><a href="#camino">Camino de clienta</a><a href="#operacion">Operación</a><a href="#integraciones">Integraciones</a><Link href="/registro">Vista de clienta ↗</Link></nav>
    </aside>
    <section className={styles.content}>
      <header><div><p>CLUB · DEMOSTRACIÓN SIN DATOS REALES</p><h1>Hola, equipo.</h1></div><Link className={styles.back} href="/registro">Explorar como clienta ↗</Link></header>
      <div className={styles.metrics}>
        <article><p>MIEMBROS</p><strong>—</strong><span>Aparecerán al activar Supabase</span></article>
        <article><p>CANJES PENDIENTES</p><strong>—</strong><span>No se aceptan canjes reales</span></article>
        <article><p>ESTADO</p><strong>Demo</strong><span>Integraciones pausadas</span></article>
      </div>
      <section className={styles.panel} id="camino"><div><p>EXPERIENCIA</p><h2>Lo que verá cada clienta</h2></div><p>Un siguiente paso claro, progreso por etapas, acciones con reglas de validación, recompensas con la distancia en puntos y un historial transparente. Las acciones son voluntarias; reseñas y contenido no requieren opiniones positivas.</p></section>
      <section className={styles.panel} id="operacion"><div><p>OPERACIÓN</p><h2>Colas para gestionar cuando activemos el Club</h2></div><div className={styles.tableWrap}><table><thead><tr><th>Área</th><th>Qué revisará el equipo</th><th>Estado actual</th></tr></thead><tbody><tr><td>Participaciones</td><td>Compra vinculada, enlace y evidencia antes de acreditar puntos</td><td>Sin datos reales</td></tr><tr><td>Canjes</td><td>Disponibilidad, aprobación y entrega del beneficio</td><td>Deshabilitados</td></tr><tr><td>Incidencias</td><td>Webhooks y correos fallidos, conciliación del ledger</td><td>Integraciones pausadas</td></tr></tbody></table></div></section>
      <section className={styles.panel} id="integraciones"><div><p>PRÓXIMA ETAPA</p><h2>Activación controlada</h2></div><div className={styles.integrations}><article><b>Supabase</b><span>Aplicar migraciones, validar RLS, cuentas de prueba y saldos.</span></article><article><b>Shopify</b><span>Verificar webhooks, compras, devoluciones e idempotencia.</span></article><article><b>Omnisend</b><span>Configurar consentimiento, eventos y automatizaciones de correo.</span></article></div></section>
    </section>
  </main>;
}
