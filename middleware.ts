import { NextResponse, type NextRequest } from 'next/server'

import {
  ADMIN_DEFAULT_PATH,
  sanitizeAdminNextPath,
} from '@/lib/auth/safe-next-path'
import {
  createSupabaseMiddlewareClient,
  withSessionCookies,
} from '@/lib/auth/supabase-middleware'

const LOGIN_PATH = '/admin/login'

/**
 * Gate de **autenticação** de todo o namespace `/admin/*` — e é aqui que a
 * sessão do Supabase é renovada a cada navegação.
 *
 * A checagem de **role** (ADMIN) NÃO acontece aqui: o middleware roda no Edge e
 * o role vive no Postgres, acessado via Prisma (Node). Quem faz esse segundo
 * gate é `app/admin/(painel)/layout.tsx` via `requireAdminUser()`.
 */
export async function middleware(request: NextRequest) {
  const { supabase, getResponse } = createSupabaseMiddlewareClient(request)

  // `getUser()` revalida a sessão no servidor do Supabase — não confia só no
  // cookie, que é forjável. Precisa vir antes de `getResponse()`.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const response = getResponse()

  const { pathname, search } = request.nextUrl

  // Login é a única rota pública do namespace; quem já tem sessão não fica nela.
  if (pathname === LOGIN_PATH) {
    if (!user) return response
    const next = sanitizeAdminNextPath(request.nextUrl.searchParams.get('next'))
    return withSessionCookies(
      NextResponse.redirect(new URL(next, request.url)),
      response,
    )
  }

  if (!user) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    const attempted = `${pathname}${search}`
    // Só carrega o `?next=` quando ele acrescenta algo ao destino padrão.
    if (sanitizeAdminNextPath(attempted) !== ADMIN_DEFAULT_PATH) {
      loginUrl.searchParams.set('next', attempted)
    }
    return withSessionCookies(NextResponse.redirect(loginUrl), response)
  }

  if (pathname === '/admin') {
    return withSessionCookies(
      NextResponse.redirect(new URL(ADMIN_DEFAULT_PATH, request.url)),
      response,
    )
  }

  return response
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
