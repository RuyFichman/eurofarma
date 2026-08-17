import { createBrowserClient } from '@supabase/ssr'

import { getSupabaseEnv } from './supabase-env'

/**
 * Cliente Supabase para o navegador (Client Components). Foundation da Sprint
 * 5.1 — usado pelas telas admin que precisam de sessão no client (ex.: logout,
 * Sprint 5.3+). O login (5.2) usa Server Action, não este client.
 */
export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseEnv()
  return createBrowserClient(url, key)
}
