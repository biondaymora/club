"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "../../lib/supabase/browser";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const next = new URLSearchParams(window.location.search).get("next") ?? "/club";
    const { error } = await createBrowserSupabaseClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    setMessage(error ? error.message : "Revisa tu correo: te enviamos un enlace seguro para entrar al Club."); setLoading(false);
  }
  return <main className={styles.page}><Link className={styles.brand} href="/landing">Bionda <i>y</i> Mora</Link><section><p className={styles.kicker}>CLUB BIONDA Y MORA</p><h1>Tu lugar para<br /><em>seguir caminando.</em></h1><p>Ingresa con tu correo. Sin contraseñas, sin fricción.</p><form onSubmit={submit}><label htmlFor="email">Tu correo electrónico</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required /><button disabled={loading}>{loading ? "Enviando…" : "Enviar enlace de acceso ↗"}</button></form>{message && <p className={styles.message} role="status">{message}</p>}<small>Al continuar aceptas la política de privacidad de Bionda y Mora.</small></section></main>;
}
