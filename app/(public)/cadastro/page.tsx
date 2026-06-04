import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { SignupForm } from '@/components/shared/signup-form'
import { SignupHero } from '@/components/shared/signup-hero'
import { SIGNUP, SITE } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: `${SIGNUP.meta.title} — ${SITE.name}`,
  description: SIGNUP.meta.description,
}

export default function CadastroPage() {
  return (
    <section className="grid min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <SignupHero />

      <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            aria-label={SIGNUP.ariaLabels.backToHome}
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {SIGNUP.backToHome}
          </Link>

          {/* Abas Entrar/Criar conta. "Entrar" (login) é Sprint 5 — fica visível,
              porém inativa, em vez de simular uma autenticação inexistente. */}
          <div className="bg-secondary/60 mb-8 grid grid-cols-2 gap-1 rounded-xl p-1">
            <span
              aria-disabled="true"
              title={SIGNUP.tabs.loginUnavailable}
              className="text-muted-foreground cursor-not-allowed rounded-lg px-4 py-2 text-center text-sm font-medium"
            >
              {SIGNUP.tabs.login}
            </span>
            <span
              aria-current="page"
              className="bg-card text-primary rounded-lg px-4 py-2 text-center text-sm font-medium shadow-sm"
            >
              {SIGNUP.tabs.signup}
            </span>
          </div>

          <SignupForm />
        </div>
      </div>
    </section>
  )
}
