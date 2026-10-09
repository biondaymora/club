import Link from "next/link";
import { clubLiveEnabled } from "../../lib/club-mode";
import styles from "./registro.module.css";
import previewStyles from "./registro-preview.module.css";

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ error?: string; origen?: string }> }) {
  const { error, origen } = await searchParams;
  const fromWeb = origen === "web";
  if (clubLiveEnabled) return <main className={styles.page}>
    <Link className={styles.brand} href="/">Bionda <i>y</i> Mora</Link>
    <section>
      <p className={styles.kicker}>CLUB BIONDA Y MORA</p>
      <h1>{fromWeb ? <>Tu correo abre<br /><em>un nuevo camino.</em></> : <>Tu lugar para<br /><em>seguir caminando.</em></>}</h1>
      <p>{fromWeb ? "Gracias por acercarte desde la web. Puedes empezar a conocer el Club aunque todavía no hayas comprado." : "Puedes entrar si ya compraste, nos conociste en vivo o descubriste la marca por correo."}</p>
      <p>Verifica tu correo para guardar tu cuenta. Suscribirte a novedades no acredita puntos ni es requisito para seguir en el Club.</p>
      {error === "perfil" && <p role="alert" className={previewStyles.formError}>No pudimos preparar tu perfil. Vuelve a intentarlo o entra con tu correo.</p>}
      <Link className={previewStyles.liveEntry} href={`/login?next=/club${fromWeb ? "&origen=web" : ""}`}>Continuar con mi correo ↗</Link>
      <small>Si usas el mismo correo de una compra, podremos vincularla tras su validación. Los canjes dependen de las reglas y saldos confirmados.</small>
    </section>
  </main>;
  return <main className={styles.page}>
    <Link className={styles.brand} href="/">Bionda <i>y</i> Mora</Link>
    <section>
      <p className={styles.kicker}>CLUB BIONDA Y MORA · VISTA PREVIA</p>
      <h1>Tu lugar para<br /><em>seguir caminando.</em></h1>
      <p>Elige cómo conociste la marca y explora sin crear cuenta ni compartir datos personales.</p>
      {error === "datos" && <p role="alert" className={previewStyles.formError}>Revisa el nombre de prueba: debe tener entre 2 y 80 caracteres.</p>}
      <div className={previewStyles.guestChoices} aria-label="Elegir experiencia de prueba">
        <form action="/api/beta-profile" method="post"><input type="hidden" name="guest" value="1" /><input type="hidden" name="scenario" value="new" /><button type="submit"><strong>Nos vimos en una feria</strong><span>Descubre el Club desde un encuentro en vivo, sin compra previa.</span><b aria-hidden="true">↗</b></button></form>
        <form action="/api/beta-profile" method="post"><input type="hidden" name="guest" value="1" /><input type="hidden" name="scenario" value="returning" /><button type="submit"><strong>Ya he comprado antes</strong><span>Explora una cuenta ficticia con progreso y recompensas.</span><b aria-hidden="true">↗</b></button></form>
        <form action="/api/beta-profile" method="post"><input type="hidden" name="guest" value="1" /><input type="hidden" name="scenario" value="subscriber" /><button type="submit" className={fromWeb ? previewStyles.highlighted : undefined}><strong>Me suscribí en la web</strong><span>Entra con 0 puntos de muestra y descubre tu camino hacia los beneficios.</span><b aria-hidden="true">↗</b></button></form>
      </div>
      <details className={previewStyles.personalize}><summary>Personalizar la tarjeta con un nombre de prueba</summary>
        <p>El nombre solo se conserva temporalmente en este navegador. No es un registro real.</p>
        <form action="/api/beta-profile" method="post">
          <label htmlFor="name">Nombre de prueba</label><input id="name" name="name" autoComplete="off" placeholder="Cómo te llamamos" required />
          <label htmlFor="scenario">Punto de partida</label><select id="scenario" name="scenario" defaultValue={fromWeb ? "subscriber" : "new"}><option value="new">Nos vimos en una feria · 0 puntos</option><option value="returning">Ya compré · 1.240 puntos</option><option value="subscriber">Me suscribí en la web · 0 puntos</option></select>
          <button>Explorar mi Club →</button>
        </form>
      </details>
      <small>Todo es una simulación: no se crea una cuenta ni se entregan puntos, compras o beneficios reales. Los avances de esta prueba solo se guardan durante la sesión de este navegador.</small>
      <p className={previewStyles.teamLink}><Link href="/admin/demo">Ver vista del equipo ↗</Link></p>
    </section>
  </main>;
}
