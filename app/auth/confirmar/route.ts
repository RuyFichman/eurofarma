import { NextResponse, type NextRequest } from 'next/server'

import { createSupabaseServerClient } from '@/lib/auth/supabase-server'
import { sanitizeRelativeAppPath } from '@/lib/auth/safe-next-path'

export const runtime = 'nodejs'

/**
 * `GET /auth/confirmar` — ponto de chegada dos links que o Supabase manda por
 * e-mail (hoje só o de recuperação de senha, Sprint 6.3).
 *
 * Existe porque **um Server Component não grava cookie**: a troca do `code` por
 * sessão precisa acontecer onde a resposta é nossa, e um route handler é esse
 * lugar. Depois de trocar, redireciona para a tela que vai usar a sessão.
 *
 * Link inválido ou expirado **não** vira erro aqui: segue para o destino sem
 * sessão, e é a página que explica o que aconteceu — quem clicou num link velho
 * precisa de instrução, não de uma tela de erro crua.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = sanitizeRelativeAppPath(searchParams.get('next'))

  if (code) {
    try {
      const supabase = await createSupabaseServerClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch {
      // Segue para o destino sem sessão; a página trata o link inválido.
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
