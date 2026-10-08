import Link from "next/link";
import styles from "./registro.module.css";

export default function RegistroPage() {
  return <main className={styles.page}><Link className={styles.brand} href="/">Bionda <i>y</i> Mora</Link><section><p className={styles.kicker}>CLUB BIONDA Y MORA</p><h1>Tu lugar para<br /><em>seguir caminando.</em></h1><p>Cuéntanos un poco de ti y entra a conocer una vista previa del Club.</p><form action="/api/beta-profile" method="post"><label htmlFor="name">Tu nombre</label><input id="name" name="name" autoComplete="name" placeholder="Cómo te llamamos" required /><label htmlFor="email">Tu correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required /><label htmlFor="phone">Tu celular</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="300 000 0000" required /><button>Conocer mi Club →</button></form><small>Esta vista usa datos y canjes ilustrativos; no crea una cuenta ni otorga beneficios. <Link href="/login?next=/club">¿Quieres activar una cuenta real? Entra con un enlace seguro.</Link></small></section></main>;
}
