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

      <div className="bg-muted/30 relative isolate flex min-w-0 flex-col justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div
          className="bg-secondary/60 pointer-events-none absolute -top-32 -right-28 -z-10 size-80 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto w-full max-w-lg">
          <Link
            href="/"
            aria-label={SIGNUP.ariaLabels.backToHome}
            className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {SIGNUP.backToHome}
          </Link>

          {/* Navegação entre login e cadastro. */}
          <div className="bg-card rounded-3xl border p-5 shadow-sm sm:p-7">
            <div className="bg-muted/70 mb-7 grid grid-cols-2 gap-1 rounded-xl border p-1">
              <Link
                href="/entrar"
                className="text-muted-foreground hover:bg-card hover:text-primary rounded-lg px-4 py-2.5 text-center text-sm font-medium"
              >
                {SIGNUP.tabs.login}
              </Link>
              <span
                aria-current="page"
                className="bg-card text-primary rounded-lg border px-4 py-2.5 text-center text-sm font-semibold shadow-sm"
              >
                {SIGNUP.tabs.signup}
              </span>
            </div>

            <SignupForm />
          </div>
        </div>
      </div>
    </section>
  )
}
