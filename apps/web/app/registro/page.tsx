import Link from "next/link";
import { clubLiveEnabled } from "../../lib/club-mode";
import styles from "./registro.module.css";
import previewStyles from "./registro-preview.module.css";

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className={styles.page}>
    <Link className={styles.brand} href="/">Bionda <i>y</i> Mora</Link>
    <section>
      <p className={styles.kicker}>CLUB BIONDA Y MORA · VISTA PREVIA</p>
      <h1>Tu lugar para<br /><em>seguir caminando.</em></h1>
      <p>Elige una experiencia y entra sin crear cuenta ni compartir datos personales.</p>
      {error === "datos" && <p role="alert" className={previewStyles.formError}>Revisa el nombre de prueba: debe tener entre 2 y 80 caracteres.</p>}
      <div className={previewStyles.guestChoices} aria-label="Elegir experiencia de prueba">
        <form action="/api/beta-profile" method="post"><input type="hidden" name="guest" value="1" /><input type="hidden" name="scenario" value="new" /><button type="submit"><strong>Soy nueva en el Club</strong><span>Empieza con 0 puntos de muestra y descubre cómo participar.</span><b aria-hidden="true">↗</b></button></form>
        <form action="/api/beta-profile" method="post"><input type="hidden" name="guest" value="1" /><input type="hidden" name="scenario" value="returning" /><button type="submit"><strong>Ya he comprado antes</strong><span>Explora una cuenta ficticia con progreso y recompensas.</span><b aria-hidden="true">↗</b></button></form>
      </div>
      <details className={previewStyles.personalize}><summary>Personalizar la tarjeta con un nombre de prueba</summary>
        <p>El nombre solo se conserva temporalmente en este navegador. No es un registro real.</p>
        <form action="/api/beta-profile" method="post">
          <label htmlFor="name">Nombre de prueba</label><input id="name" name="name" autoComplete="off" placeholder="Cómo te llamamos" required />
          <label htmlFor="scenario">Punto de partida</label><select id="scenario" name="scenario" defaultValue="new"><option value="new">Clienta nueva · 0 puntos</option><option value="returning">Clienta que vuelve · 1.240 puntos</option></select>
          <button>Explorar mi Club →</button>
        </form>
      </details>
      <small>Todo es una simulación: no se crea una cuenta ni se entregan puntos, compras o beneficios reales. Los avances de esta prueba solo se guardan durante la sesión de este navegador. {clubLiveEnabled && <Link href="/login?next=/club">Activar cuenta real con un enlace seguro.</Link>}</small>
      <p className={previewStyles.teamLink}><Link href="/admin/demo">Ver vista del equipo ↗</Link></p>
    </section>
  </main>;
}
