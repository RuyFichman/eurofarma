import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { SignupHero } from '@/components/shared/signup-hero'
import { getNutrizAccess } from '@/lib/auth/get-nutriz-user'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { LoginForm } from './login-form'

const COPY = NUTRIZ_AUTH.login

export const metadata: Metadata = {
  title: COPY.meta.title,
  description: COPY.meta.description,
  // Tela de sessão não tem por que ser indexada.
  robots: { index: false, follow: true },
}

/**
 * `/entrar` — acesso da nutriz (Sprint 6.3).
 *
 * Quem já tem sessão de nutriz não fica aqui. A checagem é a mesma
 * `getNutrizAccess()` do gate da área protegida, e não só "tem cookie": uma
 * sessão de admin não é sessão de nutriz e deve continuar vendo o formulário.
 *
 * Sem `<main>` próprio — o layout do grupo `(public)` já provê.
 */
export default async function LoginPage() {
  const access = await getNutrizAccess()
  if (access.status === 'authenticated') redirect('/meu-agendamento')

  return (
    <section className="grid min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <SignupHero />

      <div className="bg-muted/30 relative isolate flex min-w-0 flex-col justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div
          className="bg-secondary/60 pointer-events-none absolute -top-32 -right-28 -z-10 size-80 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div className="mx-auto w-full max-w-lg">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {COPY.backToHome}
          </Link>

          <div className="bg-card rounded-3xl border p-5 shadow-sm sm:p-7">
            <div className="bg-muted/70 mb-7 grid grid-cols-2 gap-1 rounded-xl border p-1">
              <span
                aria-current="page"
                className="bg-card text-primary rounded-lg border px-4 py-2.5 text-center text-sm font-semibold shadow-sm"
              >
                {COPY.tabs.login}
              </span>
              <Link
                href="/cadastro"
                className="text-muted-foreground hover:bg-card hover:text-primary rounded-lg px-4 py-2.5 text-center text-sm font-medium"
              >
                {COPY.tabs.signup}
              </Link>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  )
}
