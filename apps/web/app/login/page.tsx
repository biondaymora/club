"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "../../lib/supabase/browser";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "enlace") {
      setMessage("El enlace ya no es válido. Solicita uno nuevo para continuar.");
    }
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "/club";
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", next);
    if (params.get("origen") === "web") callback.searchParams.set("origen", "web");
    const { error } = await createBrowserSupabaseClient().auth.signInWithOtp({ email, options: { emailRedirectTo: callback.toString() } });
    setMessage(error ? error.message : "Revisa tu correo: te enviamos un enlace seguro para entrar al Club."); setLoading(false);
  }
  return <main className={styles.page}><Link className={styles.brand} href="/landing">Bionda <i>y</i> Mora</Link><section><p className={styles.kicker}>CLUB BIONDA Y MORA</p><h1>Tu lugar para<br /><em>seguir caminando.</em></h1><p>Verifica tu correo para activar una cuenta real. No necesitas contraseña.</p><form onSubmit={submit}><label htmlFor="email">Tu correo electrónico</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required /><button disabled={loading}>{loading ? "Enviando…" : "Enviar enlace de acceso ↗"}</button></form>{message && <p className={styles.message} role="status">{message}</p>}<small>Usa el mismo correo de tus compras en Bionda y Mora para que el Club pueda vincularlas. Si tu enlace venció, solicita uno nuevo.</small></section></main>;
}
