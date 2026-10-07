import { createBrowserClient } from "@supabase/ssr";
import { requireServerEnv } from "../env";

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    requireServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
