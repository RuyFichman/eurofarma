import { Check, Circle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import type { JourneyStatusValue } from '@/lib/journey/status'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

const PROGRESS_STEPS = [
  { label: 'Cadastro', statuses: ['REGISTERED'] },
  { label: 'Ficha enviada', statuses: ['DOCUMENT_SENT', 'FORM_RECEIVED'] },
  {
    label: 'Etapa registrada',
    statuses: [
      'EXAM_SCHEDULED',
      'EXAMS_COMPLETED',
      'AWAITING_RESULT',
      'ELIGIBLE',
    ],
  },
  {
    label: 'Kit entregue',
    statuses: [
      'KIT_SENT',
      'KIT_DELIVERED',
      'DONATION_CONFIRMED',
      'RECURRING_DONATION_ELIGIBLE',
    ],
  },
] as const satisfies ReadonlyArray<{
  label: string
  statuses: readonly JourneyStatusValue[]
}>

function getCurrentStep(status: JourneyStatusValue) {
  if (status === 'NOT_ELIGIBLE') return 1

  const index = PROGRESS_STEPS.findIndex((step) =>
    (step.statuses as readonly JourneyStatusValue[]).includes(status),
  )
  return Math.max(index, 0)
}

export function NutrizJourneyProgress({
  snapshot,
}: {
  snapshot: NutrizJourneySnapshot
}) {
  const currentStep = getCurrentStep(snapshot.journeyStatus)
  const status = NUTRIZ_AUTH.area.journey.status[snapshot.journeyStatus]

  return (
    <Card className="border-primary/20 overflow-hidden py-0">
      <CardHeader className="bg-secondary/35 gap-3 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-primary text-sm font-semibold">Sua jornada</p>
            <CardTitle className="mt-1 text-xl">{status.title}</CardTitle>
          </div>
          <Badge variant="secondary">{status.label}</Badge>
        </div>
        <p className="text-muted-foreground text-sm leading-6">
          {status.description}
        </p>
      </CardHeader>
      <CardContent className="px-5 py-5 sm:px-6">
        <ol className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-0">
          {PROGRESS_STEPS.map((step, index) => {
            const complete =
              index <= currentStep && snapshot.journeyStatus !== 'NOT_ELIGIBLE'
            const current = index === currentStep

            return (
              <li
                key={step.label}
                className="relative flex items-center gap-3 sm:block"
              >
                {index > 0 ? (
                  <span
                    className={
                      index <= currentStep
                        ? 'bg-primary/70 absolute top-5 right-1/2 left-[-50%] hidden h-0.5 sm:block'
                        : 'bg-border absolute top-5 right-1/2 left-[-50%] hidden h-0.5 sm:block'
                    }
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={
                    complete
                      ? 'bg-primary text-primary-foreground relative z-10 flex size-10 items-center justify-center rounded-full'
                      : current
                        ? 'border-primary bg-secondary text-primary relative z-10 flex size-10 items-center justify-center rounded-full border-2'
                        : 'border-border bg-muted text-muted-foreground relative z-10 flex size-10 items-center justify-center rounded-full border'
                  }
                  aria-hidden="true"
                >
                  {complete ? (
                    <Check className="size-4" />
                  ) : (
                    <Circle className="size-3" />
                  )}
                </span>
                <span className="text-sm font-medium sm:mt-3 sm:block sm:text-center">
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="text-muted-foreground mt-5 text-xs leading-5">
          As etapas são atualizadas pela equipe do Lactare. Esta visualização
          não substitui orientações recebidas diretamente pela equipe.
        </p>
      </CardContent>
    </Card>
  )
}
