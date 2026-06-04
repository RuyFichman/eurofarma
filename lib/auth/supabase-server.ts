import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
 * Cliente Supabase para o servidor (Server Components, Server Actions, Route
 * Handlers). Lê/grava os cookies de sessão via `next/headers`. Em Server
 * Components o `setAll` pode lançar (não é permitido gravar cookie ali) — o
 * try/catch ignora; a renovação de token virá do middleware (Sprint 5.3/5.4).
 *
 * Usa a publishable/anon key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), que é
 * pública por design. A service_role NUNCA entra aqui.
 */
export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Chamado de um Server Component, onde escrever cookie não é permitido.
        }
      },
    },
  })
}
