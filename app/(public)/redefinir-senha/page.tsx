import type { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { NewPasswordForm } from './new-password-form'

const COPY = NUTRIZ_AUTH.newPassword

export const metadata: Metadata = {
  title: COPY.meta.title,
  description: COPY.meta.description,
  robots: { index: false, follow: false },
}

/**
 * `/redefinir-senha` — destino do link de recuperação (Sprint 6.3).
 *
 * A autorização desta tela é a **sessão** que `/auth/confirmar` criou a partir
 * do código do e-mail. Por isso o único gate aqui é "existe sessão?": sem ela,
 * o link expirou, já foi usado ou alguém abriu a URL direto — e a tela explica
 * isso em vez de mostrar um formulário que não teria como salvar nada.
 *
 * Sem `<main>` próprio — o layout do grupo `(public)` já provê.
 */
export default async function ResetPasswordPage() {
  const user = await getCurrentUser()

  return (
    <section className="bg-background py-12 md:py-20">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="bg-card rounded-3xl border p-5 shadow-sm sm:p-7">
          <div className="border-b pb-6">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {COPY.heading}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {user ? COPY.subtitle : COPY.feedback.invalidLink}
            </p>
          </div>

          {user ? (
            <NewPasswordForm />
          ) : (
            <Link
              href="/entrar"
              className="text-primary mt-6 inline-block text-sm underline underline-offset-4"
            >
              {COPY.actions.backToLogin}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
