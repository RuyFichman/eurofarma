import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AppointmentSummary } from '@/components/nutriz/appointment-summary'
import { AppointmentGuidance } from '@/components/nutriz/appointment-guidance'
import { AppointmentLocation } from '@/components/nutriz/appointment-location'
import { AppointmentActions } from '@/components/nutriz/appointment-actions'
import { AppointmentNotScheduled } from '@/components/nutriz/appointment-not-scheduled'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getCurrentNutrizAppointment } from '@/lib/db/queries/appointments'
import { buildWhatsappUrl } from '@/lib/utils/whatsapp'
import { NUTRIZ_AUTH, UNIT_DETAIL } from '@/lib/i18n/pt-br'
import { logoutNutrizAction } from './actions'

const COPY = NUTRIZ_AUTH.area

export const metadata: Metadata = {
  title: COPY.meta.title,
  description: COPY.meta.description,
  robots: { index: false, follow: false },
}

/**
 * `/meu-agendamento` — a tela da nutriz (Sprint 6.4).
 *
 * Server Component: nada aqui depende de interação, exceto as ações, isoladas
 * em `AppointmentActions` (Client). Quem preenche esta página é a **conversa no
 * WhatsApp** (o webhook da 6.5), não um formulário do site — por isso o estado
 * vazio continua sendo o caminho principal até o chatbot existir, e não é uma
 * exceção a ser escondida.
 *
 * Três estados, e nenhum deles é "erro": visita informada, "não consegui
 * agendar" e nada ainda.
 *
 * Sem `<main>` próprio — o layout do grupo `(public)` já provê.
 */
export default async function MeuAgendamentoPage() {
  const nutriz = await requireNutrizUser()
  const appointment = await getCurrentNutrizAppointment(nutriz.id)

  const whatsappUrl = appointment?.unit
    ? buildWhatsappUrl({
        phone: appointment.unit.contact.whatsapp,
        message:
          appointment.unit.whatsappMessage ??
          UNIT_DETAIL.whatsapp.defaultMessage,
      })
    : null

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto w-full max-w-5xl px-4">
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

        <div className="mt-8">
          {!appointment ? (
            <EmptyState />
          ) : appointment.status === 'NOT_SCHEDULED' ? (
            <AppointmentNotScheduled
              failureReason={appointment.failureReason}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-6">
                <AppointmentSummary appointment={appointment} />
                <AppointmentGuidance
                  unitInstructions={appointment.unit?.instructions}
                />
              </div>

              <div className="space-y-4">
                <AppointmentLocation unit={appointment.unit} />
                <AppointmentActions
                  appointmentId={appointment.id}
                  canCancel={appointment.status === 'DECLARED'}
                  whatsappUrl={whatsappUrl}
                  unitSlug={
                    appointment.unit && appointment.unitIsActive
                      ? appointment.unit.slug
                      : null
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** Nenhum agendamento informado ainda — o caminho principal por enquanto. */
function EmptyState() {
  return (
    <div className="bg-card rounded-3xl border p-6 text-center shadow-sm sm:p-10">
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
  )
}
