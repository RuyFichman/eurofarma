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
const NUTRIZ_LOGIN_PATH = '/entrar'
const NUTRIZ_AREA_PATH = '/meu-agendamento'

/** A rota é da área logada da nutriz? */
function isNutrizArea(pathname: string): boolean {
  return (
    pathname === NUTRIZ_AREA_PATH || pathname.startsWith(`${NUTRIZ_AREA_PATH}/`)
  )
}

/**
 * Gate de **autenticação** das duas áreas logadas — `/admin/*` e a área da
 * nutriz — e é aqui que a sessão do Supabase é renovada a cada navegação.
 *
 * A checagem de **quem** é a pessoa NÃO acontece aqui: o middleware roda no Edge
 * e tanto o role do admin quanto o perfil da nutriz vivem no Postgres, acessados
 * via Prisma (Node). Esse segundo gate é feito nos layouts —
 * `app/admin/(painel)/layout.tsx` com `requireAdminUser()` e
 * `app/(public)/meu-agendamento/layout.tsx` com `requireNutrizUser()`.
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

  // Área da nutriz. Sem `?next=`: hoje só existe uma rota protegida no público,
  // então guardar o destino não acrescentaria nada e abriria superfície de open
  // redirect à toa. Se a área crescer, herdar o padrão do `sanitizeAdminNextPath`.
  if (isNutrizArea(pathname)) {
    if (user) return response
    return withSessionCookies(
      NextResponse.redirect(new URL(NUTRIZ_LOGIN_PATH, request.url)),
      response,
    )
  }

  // Login é a única rota pública do namespace admin; quem já tem sessão não fica nela.
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
  matcher: [
    '/admin',
    '/admin/:path*',
    '/meu-agendamento',
    '/meu-agendamento/:path*',
  ],
}
