import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { logoutNutrizAction } from './actions'

const COPY = NUTRIZ_AUTH.area

export const metadata: Metadata = {
  title: COPY.meta.title,
  description: COPY.meta.description,
  robots: { index: false, follow: false },
}

/**
 * `/meu-agendamento` — área da nutriz.
 *
 * **Placeholder de propósito nesta sprint**, como o `/admin/dashboard` foi na
 * 5.3: a 6.3 entrega a sessão (entrar, recuperar senha, gate), e a tela real do
 * agendamento é a 6.4. Por isso aqui só existe o estado vazio — que, aliás,
 * continuará sendo o caminho principal até o webhook do chatbot (6.5) começar a
 * gravar agendamento, porque quem preenche esta página é a conversa no
 * WhatsApp, não um formulário do site.
 *
 * Sem `<main>` próprio — o layout do grupo `(public)` já provê.
 */
export default async function MeuAgendamentoPage() {
  const nutriz = await requireNutrizUser()

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-muted-foreground text-xs tracking-wide uppercase">
              {COPY.badge}
            </span>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {COPY.greetingTemplate.replace('{firstName}', nutriz.firstName)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {COPY.subtitle}
            </p>
          </div>

          <form action={logoutNutrizAction}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut aria-hidden="true" />
              {COPY.logout}
            </Button>
          </form>
        </div>

        <div className="bg-card mt-8 rounded-3xl border p-6 text-center shadow-sm sm:p-10">
          <div className="bg-secondary/60 text-primary mx-auto flex size-12 items-center justify-center rounded-2xl">
            <CalendarClock className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{COPY.empty.title}</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
            {COPY.empty.body}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/buscar">{COPY.empty.searchCta}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/como-funciona">{COPY.empty.howCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
