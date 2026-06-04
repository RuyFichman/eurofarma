import { createBrowserClient } from '@supabase/ssr'

function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase env ausente: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }
  return { url, key }
}

/**
 * Cliente Supabase para o navegador (Client Components). Foundation da Sprint
 * 5.1 — usado pelas telas admin que precisam de sessão no client (ex.: logout,
 * Sprint 5.3+). O login (5.2) usa Server Action, não este client.
 */
export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseEnv()
  return createBrowserClient(url, key)
}
