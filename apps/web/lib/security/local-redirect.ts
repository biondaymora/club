export function localRedirect(requested: string | null, origin: string, fallback = "/club"): URL {
  const safeFallback = new URL(fallback, origin);
  if (!requested?.startsWith("/")) return safeFallback;
  try {
    const target = new URL(requested, origin);
    return target.origin === origin ? target : safeFallback;
  } catch {
    return safeFallback;
  }
}
