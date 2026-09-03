import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { getNutrizAccess } from '@/lib/auth/get-nutriz-user'
import { NUTRIZ_AUTH, SITE } from '@/lib/i18n/pt-br'
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
    <section className="bg-background py-12 md:py-20">
      <div className="mx-auto w-full max-w-md px-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {COPY.backToHome}
        </Link>

        <div className="bg-card rounded-3xl border p-5 shadow-sm sm:p-7">
          <LoginForm />
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          {SITE.name}
        </p>
      </div>
    </section>
  )
}
