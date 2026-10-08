import Image from "next/image";
import Link from "next/link";
import styles from "./landing.module.css";

const benefits = ["Puntos con cada compra", "Cashback para volver", "Misiones y acceso anticipado"];

export default function LandingPage() {
  return <main className={`${styles.scope} landing`}>
    <div className="landing-promise"><span>Envío gratis desde $350.000</span><span>Cuero 100% legítimo, hecho en Colombia</span><span>Cambios de talla sin costo por 30 días</span></div>
    <header className="landing-nav"><Link href="/landing" className="landing-brand">Bionda <i>y</i> Mora</Link><nav><a href="#como-funciona">Cómo funciona</a><a href="#beneficios">Beneficios</a><Link href="/registro">Entrar al Club</Link></nav></header>
    <section className="landing-hero"><Image src="/brand/hero.jpg" alt="Pieza Bionda y Mora en cuero" fill priority sizes="100vw" /><div className="landing-shade" /><div className="landing-hero-content"><p>HECHAS PARA TI · CLUB BIONDA Y MORA</p><h1>Comodidad en<br /><em>cada paso.</em></h1><span>Cada elección se vuelve parte de tu historia. En el Club, también se transforma en beneficios hechos para acompañarte.</span><Link href="/registro" className="landing-cta">Conoce el Club <b>→</b></Link></div><div className="landing-seal">HECHO EN<br />COLOMBIA<br />✦</div></section>
    <section className="landing-intro" id="como-funciona"><p className="landing-label">HECHO PARA ACOMPAÑARTE · VISTA PREVIA</p><h2>Una forma más bonita<br />de volver a elegirte.</h2><p className="landing-description">Explora cómo tus compras y gestos podrán convertirse en puntos, beneficios y detalles pensados para ti cuando activemos el Club.</p><div className="landing-steps">{["Conoce tu Club", "Descubre cómo sumar", "Explora recompensas"].map((step, index) => <article key={step}><span>0{index + 1}</span><h3>{step}</h3><p>{index === 0 ? "Entra a una vista de demostración." : index === 1 ? "Conoce compras, reseñas, historias e invitaciones." : "Mira los beneficios y simula un canje."}</p></article>)}</div></section>
    <section className="landing-story" id="beneficios"><div className="landing-story-image"><Image src="/brand/atelier.jpg" alt="Mujeres Bionda y Mora caminando con botas de cuero" fill sizes="(max-width: 800px) 100vw, 45vw" /></div><div className="landing-story-copy"><p className="landing-label">EL CLUB · EN PREPARACIÓN</p><h2>Más que puntos,<br /><em>un gesto para ti.</em></h2><p>Próximamente podrás acceder primero, descubrir nuevas piezas y transformar tus puntos en recompensas. Por ahora, conoce la experiencia sin crear beneficios reales.</p><ul>{benefits.map(benefit => <li key={benefit}>✦ <span>{benefit}</span></li>)}</ul><Link href="/registro" className="landing-text-link">Explorar beneficios ↗</Link></div></section>
    <section className="landing-gallery"><Image src="/brand/collection.jpg" alt="Colección Bionda y Mora" width={600} height={760} /><Image src="/brand/look.jpg" alt="Look Bionda y Mora" width={600} height={760} /><Image src="/brand/ribuzz/product-02.jpg" alt="Producto Bionda y Mora" width={600} height={760} /></section>
    <section className="landing-final"><p className="landing-label">CLUB BIONDA Y MORA</p><h2>Camina con nosotras.</h2><Link href="/registro" className="landing-cta dark">Entrar al Club <b>→</b></Link></section>
  </main>;
}
