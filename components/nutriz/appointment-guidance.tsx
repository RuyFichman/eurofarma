import { Baby, Clock3, IdCard, Info, Milk } from 'lucide-react'

import { APPOINTMENT } from '@/lib/i18n/pt-br'

const COPY = APPOINTMENT.guidance

const ICONS = [Milk, IdCard, Clock3, Baby] as const

/**
 * Orientações do dia da visita.
 *
 * As quatro primeiras são **gerais** e vivem no i18n. As da própria unidade,
 * quando existem, vêm de `instructions` — coluna preenchida na transcrição da
 * rBLH com referências de localização e regras locais. A ressalva final repete
 * a da página pública da unidade de propósito: orientação geral não substitui o
 * que a equipe do banco de leite pede.
 */
export function AppointmentGuidance({
  unitInstructions,
}: {
  unitInstructions?: string | null
}) {
  return (
    <section className="bg-card rounded-3xl border p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold">{COPY.title}</h2>

      <ul className="mt-4 space-y-3">
        {COPY.items.map((item, index) => {
          const Icon = ICONS[index] ?? Info
          return (
            <li
              key={item.title}
              className="bg-muted/40 flex items-start gap-3.5 rounded-2xl border p-4"
            >
              <span className="bg-secondary/70 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {item.description}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {unitInstructions ? (
        <div className="border-primary/20 bg-secondary/30 mt-4 rounded-2xl border p-4">
          <p className="text-sm font-medium">{COPY.unitInstructionsTitle}</p>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {unitInstructions}
          </p>
        </div>
      ) : null}

      <p className="text-muted-foreground mt-4 flex items-start gap-2 text-xs leading-5">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {COPY.disclaimer}
      </p>
    </section>
  )
}
