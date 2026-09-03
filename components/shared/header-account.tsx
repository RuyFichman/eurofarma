'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck, LogIn } from 'lucide-react'

import { createSupabaseBrowserClient } from '@/lib/auth/supabase-client'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

const COPY = NUTRIZ_AUTH.header

/**
 * Atalho de conta no cabeçalho: "Entrar" para quem não tem sessão, "Meu
 * agendamento" para quem tem.
 *
 * É **Client Component de propósito**. A alternativa seria o layout `(public)`
 * ler a sessão no servidor, mas isso torna dinâmica toda página do site — home,
 * sobre, como-funciona e cadastro hoje são estáticas no build, e trocá-las por
 * render sob demanda em nome de um link do cabeçalho seria caro demais.
 *
 * Isto é **dica de interface, não controle de acesso**: ele só sabe que existe
 * sessão, não de quem. Quem entra pela `/entrar` é sempre nutriz (a action
 * recusa e encerra sessão de quem não for), então o único caso em que o link
 * aparece para quem não tem área é o de um admin logado navegando no site
 * público — e aí o gate de `/meu-agendamento` o devolve para a home.
 *
 * Enquanto a sessão não é conhecida nada é renderizado, para o cabeçalho não
 * piscar entre os dois estados.
 */
export function HeaderAccount() {
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session))
    })
    return () => subscription.unsubscribe()
  }, [])

  if (hasSession === null) return null

  return hasSession ? (
    <Link
      href="/meu-agendamento"
      className="text-foreground/80 hover:text-primary hidden items-center gap-1.5 text-sm transition-colors sm:inline-flex"
    >
      <CalendarCheck className="size-4" aria-hidden="true" />
      {COPY.account}
    </Link>
  ) : (
    <Link
      href="/entrar"
      className="text-foreground/80 hover:text-primary hidden items-center gap-1.5 text-sm transition-colors sm:inline-flex"
    >
      <LogIn className="size-4" aria-hidden="true" />
      {COPY.login}
    </Link>
  )
}
