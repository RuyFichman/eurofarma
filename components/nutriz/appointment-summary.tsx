import { CalendarDays, CircleCheck, CircleSlash, Clock } from 'lucide-react'

import { APPOINTMENT } from '@/lib/i18n/pt-br'
import {
  getAppointmentStatusKey,
  type AppointmentStatusKey,
} from '@/lib/utils/appointment-display'
import {
  formatLongDate,
  formatShortDate,
  formatTime,
} from '@/lib/utils/format-date'
import type { NutrizAppointment } from '@/lib/db/queries/appointments'

const COPY = APPOINTMENT

/**
 * Cores por estado. `upcoming` usa o verde de marca já existente (`--whatsapp`)
 * porque é o estado positivo da tela; os demais ficam em tons neutros — nada
 * aqui é erro, é só uma data que passou ou um plano desfeito.
 */
const TONE: Record<AppointmentStatusKey, { ring: string; icon: string }> = {
  upcoming: { ring: 'border-whatsapp/30 bg-whatsapp/5', icon: 'text-whatsapp' },
  past: { ring: 'bg-muted/40', icon: 'text-muted-foreground' },
  cancelled: { ring: 'bg-muted/40', icon: 'text-muted-foreground' },
  completed: {
    ring: 'border-whatsapp/30 bg-whatsapp/5',
    icon: 'text-whatsapp',
  },
}

export function AppointmentSummary({
  appointment,
}: {
  appointment: NutrizAppointment
}) {
  const key = getAppointmentStatusKey(appointment)
  const status = COPY.status[key]
  const tone = TONE[key]
  const Icon = key === 'cancelled' ? CircleSlash : CircleCheck

  return (
    <div className="space-y-6">
      <div className={`rounded-3xl border p-5 sm:p-6 ${tone.ring}`}>
        <div className="flex items-start gap-4">
          <Icon
            className={`mt-0.5 size-6 shrink-0 ${tone.icon}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">
              {COPY.status.referenceLabel} {appointment.reference}
            </p>
            <p className="mt-0.5 text-lg font-semibold">{status.label}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {status.note}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <CalendarDays className="text-primary size-5" aria-hidden="true" />
          {COPY.details.title}
        </h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="bg-muted/40 rounded-2xl border p-4">
            <dt className="text-muted-foreground text-xs">
              {COPY.details.date}
            </dt>
            <dd className="mt-1 font-medium">
              {appointment.scheduledAt
                ? formatLongDate(appointment.scheduledAt)
                : COPY.details.timeUnknown}
            </dd>
          </div>

          <div className="bg-muted/40 rounded-2xl border p-4">
            <dt className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Clock className="size-3.5" aria-hidden="true" />
              {COPY.details.time}
            </dt>
            <dd className="text-primary mt-1 text-xl font-semibold">
              {appointment.scheduledAt
                ? formatTime(appointment.scheduledAt)
                : COPY.details.timeUnknown}
            </dd>
          </div>
        </dl>

        <p className="text-muted-foreground mt-4 text-xs">
          {COPY.details.declaredAt} {formatShortDate(appointment.declaredAt)}
        </p>
      </div>
    </div>
  )
}
