import Link from "next/link";
import { clubLiveEnabled } from "../../lib/club-mode";
import styles from "./registro.module.css";
import previewStyles from "./registro-preview.module.css";

export default function RegistroPage() {
  return <main className={styles.page}>
    <Link className={styles.brand} href="/">Bionda <i>y</i> Mora</Link>
    <section>
      <p className={styles.kicker}>CLUB BIONDA Y MORA · VISTA PREVIA</p>
      <h1>Tu lugar para<br /><em>seguir caminando.</em></h1>
      <p>Cuéntanos un poco de ti y entra a explorar cómo será tu Club.</p>
      <form action="/api/beta-profile" method="post">
        <label htmlFor="name">Tu nombre</label><input id="name" name="name" autoComplete="name" placeholder="Cómo te llamamos" required />
        <label htmlFor="email">Tu correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
        <label htmlFor="phone">Tu celular</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="300 000 0000" required />
        <button>Explorar mi Club →</button>
      </form>
      <small>Es una simulación: tus datos se guardan temporalmente en este navegador; no se crea una cuenta ni se otorgan puntos o beneficios reales. {clubLiveEnabled && <Link href="/login?next=/club">Activar cuenta real con un enlace seguro.</Link>}</small>
      <p className={previewStyles.teamLink}><Link href="/admin/demo">Ver vista del equipo ↗</Link></p>
    </section>
  </main>;
}
