import Link from 'next/link'
import { CircleHelp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { APPOINTMENT } from '@/lib/i18n/pt-br'
import type { NutrizAppointmentFailureReason } from '@/lib/db/queries/appointments'

const COPY = APPOINTMENT.notScheduled

/**
 * Estado de "não consegui agendar" — o registro que o chatbot grava quando a
 * nutriz responde que não deu certo.
 *
 * Ele existe como tela própria, e não como uma variação apagada do agendamento,
 * porque é o momento em que ela mais precisa de caminho: quis doar e travou. Por
 * isso a tela é acolhedora e termina em duas saídas concretas, sem culpar
 * ninguém pela tentativa que não deu certo.
 */
export function AppointmentNotScheduled({
  failureReason,
}: {
  failureReason: NutrizAppointmentFailureReason | null
}) {
  return (
    <section className="bg-card rounded-3xl border p-6 shadow-sm sm:p-8">
      <span className="bg-secondary/60 text-primary flex size-12 items-center justify-center rounded-2xl">
        <CircleHelp className="size-6" aria-hidden="true" />
      </span>

      <h2 className="mt-4 text-lg font-semibold">{COPY.title}</h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
        {COPY.body}
      </p>

      {failureReason ? (
        <div className="bg-muted/40 mt-5 rounded-2xl border p-4">
          <p className="text-muted-foreground text-xs">{COPY.reasonLabel}</p>
          <p className="mt-1 text-sm font-medium">
            {COPY.reasons[failureReason]}
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/buscar">{COPY.searchCta}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <Link href="/como-funciona">{COPY.howCta}</Link>
        </Button>
      </div>
    </section>
  )
}
