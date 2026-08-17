import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { getSupabaseEnv } from './supabase-env'

type MiddlewareSupabase = {
  supabase: ReturnType<typeof createServerClient>
  /**
   * Resposta corrente. Precisa ser lida DEPOIS do `auth.getUser()`, porque o
   * `setAll` a recria quando o Supabase renova o token de sessão.
   */
  getResponse: () => NextResponse
}

/**
 * Cliente Supabase para o middleware (Edge). Além de ler a sessão, é ele que
 * **renova o token** e reescreve os cookies na resposta — por isso o middleware
 * precisa devolver sempre a resposta obtida via `getResponse()` (ou copiar seus
 * cookies, ver `withSessionCookies`).
 *
 * Não use Prisma aqui: o middleware roda no Edge. A checagem de role acontece no
 * layout do painel, que roda em Node (ver `lib/auth/get-admin-user.ts`).
 */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
): MiddlewareSupabase {
  const { url, key } = getSupabaseEnv()
  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  return { supabase, getResponse: () => response }
}

/**
 * Copia para `target` os cookies de sessão que o Supabase gravou em `source`.
 * Sem isso, um redirect descartaria o token recém-renovado e derrubaria a
 * sessão na navegação seguinte.
 */
export function withSessionCookies(
  target: NextResponse,
  source: NextResponse,
): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie)
  }
  return target
}
