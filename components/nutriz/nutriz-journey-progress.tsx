import Link from 'next/link'
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  ListChecks,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import { getEducationalSuggestionIds } from '@/lib/journey/educational-suggestions'
import type { JourneyStatusValue } from '@/lib/journey/status'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

const PROGRESS = NUTRIZ_AUTH.area.journey.progress
const GUIDANCE = NUTRIZ_AUTH.area.journey.guidance
const EDUCATION = NUTRIZ_AUTH.area.personal.education

const PROGRESS_STEPS = [
  { label: PROGRESS.steps.REGISTRATION, statuses: ['REGISTERED'] },
  {
    label: PROGRESS.steps.HEALTH_FORM,
    statuses: ['DOCUMENT_SENT', 'FORM_RECEIVED'],
  },
  {
    label: PROGRESS.steps.BLOOD_TEST,
    statuses: [
      'EXAM_SCHEDULED',
      'EXAMS_COMPLETED',
      'AWAITING_RESULT',
      'ELIGIBLE',
    ],
  },
  {
    label: PROGRESS.steps.KIT_DELIVERY,
    statuses: ['KIT_SENT', 'KIT_DELIVERED'],
  },
  {
    label: PROGRESS.steps.DONATION,
    statuses: ['DONATION_CONFIRMED', 'RECURRING_DONATION_ELIGIBLE'],
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

/**
 * Detalhe da etapa atual. As orientações e os conteúdos vêm do status
 * categórico já registrado pelo Lactare; nada aqui infere aptidão, exame ou
 * logística de coleta.
 */
function CurrentStepDetails({ status }: { status: JourneyStatusValue }) {
  const statusCopy = NUTRIZ_AUTH.area.journey.status[status]
  const suggestions = getEducationalSuggestionIds(status).map((id) => ({
    id,
    ...EDUCATION.suggestions[id],
  }))

  return (
    <div className="bg-muted/40 mt-3 rounded-xl border p-4">
      <p className="text-sm leading-6">{statusCopy.description}</p>

      <div className="mt-4">
        <p className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <ListChecks className="size-4" aria-hidden="true" />
          {GUIDANCE.title}
        </p>
        <ul className="mt-3 space-y-2">
          {statusCopy.guidance.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6">
              <span
                className="bg-primary mt-2 size-1.5 shrink-0 rounded-full"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <BookOpen className="size-4" aria-hidden="true" />
          {EDUCATION.title}
        </p>
        <div className="mt-3 space-y-2">
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion.id}
              href={suggestion.href}
              className="bg-background hover:border-primary/40 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
            >
              <span>
                <span className="block text-sm font-medium">
                  {suggestion.title}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                  {suggestion.description}
                </span>
              </span>
              <ChevronRight
                className="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-xs leading-5">
        {GUIDANCE.safetyNotice}
      </p>
    </div>
  )
}

export function NutrizJourneyProgress({
  snapshot,
}: {
  snapshot: NutrizJourneySnapshot
}) {
  const currentStep = getCurrentStep(snapshot.journeyStatus)
  const status = NUTRIZ_AUTH.area.journey.status[snapshot.journeyStatus]
  const isNotEligible = snapshot.journeyStatus === 'NOT_ELIGIBLE'

  return (
    <Card className="border-primary/20 overflow-hidden py-0">
      <CardHeader className="bg-secondary/35 gap-3 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-primary text-sm font-semibold">
              {PROGRESS.eyebrow}
            </p>
            <CardTitle className="mt-1 text-xl">{status.title}</CardTitle>
          </div>
          <Badge variant="secondary">{status.label}</Badge>
        </div>
        <p className="text-muted-foreground text-sm leading-6">
          {status.description}
        </p>
      </CardHeader>
      <CardContent className="group/journey px-5 py-5 sm:px-6">
        {/* O resumo horizontal some quando o detalhe vertical abre. */}
        <ol className="grid grid-cols-2 gap-x-3 gap-y-5 group-has-[details[open]]/journey:hidden sm:grid-cols-5 sm:gap-0">
          {PROGRESS_STEPS.map((step, index) => {
            const complete = index <= currentStep && !isNotEligible
            const current = index === currentStep

            return (
              <li
                key={step.label}
                className="relative flex items-center gap-3 sm:flex-col sm:gap-0 sm:text-center"
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
                <span className="text-sm font-medium sm:mt-3 sm:text-center">
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>

        <details className="group/details mt-5 open:mt-0">
          <summary className="text-primary inline-flex cursor-pointer items-center gap-2 text-sm font-medium underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
            <ChevronDown
              className="size-4 transition-transform group-open/details:rotate-180"
              aria-hidden="true"
            />
            <span className="group-open/details:hidden">
              {PROGRESS.expandAction}
            </span>
            <span className="hidden group-open/details:inline">
              {PROGRESS.collapseAction}
            </span>
          </summary>

          <ol className="mt-5 space-y-6">
            {PROGRESS_STEPS.map((step, index) => {
              const complete = index <= currentStep && !isNotEligible
              const current = index === currentStep
              const isLast = index === PROGRESS_STEPS.length - 1

              return (
                <li key={step.label} className="relative pl-11">
                  {!isLast ? (
                    <span
                      className={
                        index < currentStep && !isNotEligible
                          ? 'bg-primary/70 absolute top-9 bottom-[-1.75rem] left-[0.9rem] w-0.5'
                          : 'bg-border absolute top-9 bottom-[-1.75rem] left-[0.9rem] w-0.5'
                      }
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={
                      complete
                        ? 'bg-primary text-primary-foreground absolute top-0 left-0 z-10 flex size-8 items-center justify-center rounded-full'
                        : current
                          ? 'border-primary bg-secondary text-primary absolute top-0 left-0 z-10 flex size-8 items-center justify-center rounded-full border-2'
                          : 'border-border bg-muted text-muted-foreground absolute top-0 left-0 z-10 flex size-8 items-center justify-center rounded-full border'
                    }
                    aria-hidden="true"
                  >
                    {complete ? (
                      <Check className="size-4" />
                    ) : (
                      <Circle className="size-3" />
                    )}
                  </span>
                  <div className="flex min-h-8 flex-wrap items-center gap-2">
                    <p
                      className={
                        complete || current
                          ? 'font-medium'
                          : 'text-muted-foreground font-medium'
                      }
                    >
                      {step.label}
                    </p>
                    {current ? (
                      <Badge variant="outline">{PROGRESS.currentBadge}</Badge>
                    ) : null}
                  </div>
                  {current ? (
                    <CurrentStepDetails status={snapshot.journeyStatus} />
                  ) : null}
                </li>
              )
            })}
          </ol>

          <p className="text-muted-foreground mt-6 border-t pt-4 text-xs leading-5">
            {PROGRESS.sourceNotice}
          </p>
        </details>
      </CardContent>
    </Card>
  )
}
