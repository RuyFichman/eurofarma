import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Hourglass } from 'lucide-react'

import { activateMilkValidityReminderAction } from '@/app/(nutriz)/meu-agendamento/lembretes/actions'
import { ReminderConfigForm } from '@/components/nutriz/reminder-config-form'
import { Card, CardContent } from '@/components/ui/card'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getNutrizReminderOverview } from '@/lib/db/queries/nutriz-reminders'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import {
  computeMilkValidityAlertDate,
  computeMilkValidityDeadline,
} from '@/lib/reminders/schedule'
import {
  formatShortDate,
  formatShortDayMonth,
  formatTime,
} from '@/lib/utils/format-date'

const COPY = NUTRIZ_AUTH.area.reminders

export const metadata: Metadata = {
  title: `${COPY.milkValidity.configTitle} | NutriLink`,
  robots: { index: false, follow: false },
}

const OPTIONS = [
  'MILK_1_DAY_BEFORE',
  'MILK_2_DAYS_BEFORE',
  'MILK_3_DAYS_BEFORE',
] as const

export default async function MilkValidityReminderPage() {
  const nutriz = await requireNutrizUser()
  const overview = await getNutrizReminderOverview(nutriz.id)
  const log = overview?.latestExtractionLog

  return (
    <section className="bg-muted/35 min-h-[calc(100dvh-3.5rem)] px-4 py-8 sm:px-6 md:min-h-[calc(100dvh-4rem)] md:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/meu-agendamento"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {COPY.backToList}
        </Link>

        {log ? (
          (() => {
            const deadline = computeMilkValidityDeadline(log.recordedAt)
            const current = overview?.preferences.find(
              (p) => p.type === 'MILK_VALIDITY',
            )
            const previewText = COPY.milkValidity.previewTemplate
              .replace('{firstName}', nutriz.firstName)
              .replace('{recordedDate}', formatShortDayMonth(log.recordedAt))
            const options = OPTIONS.map((value) => ({
              value,
              label: COPY.milkValidity.options[value].label,
              helper: COPY.milkValidity.options[value].helper.replace(
                '{date}',
                formatShortDate(
                  computeMilkValidityAlertDate(log.recordedAt, value),
                ),
              ),
            }))
            const previewByOption = Object.fromEntries(
              OPTIONS.map((value) => [value, previewText]),
            )

            return (
              <ReminderConfigForm
                icon={Hourglass}
                title={COPY.milkValidity.configTitle}
                description={COPY.milkValidity.configDescription}
                infoBox={
                  <div className="space-y-3">
                    <div className="bg-muted/40 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        {COPY.milkValidity.sourceLabel}
                      </p>
                      <p className="mt-1 text-sm">
                        {COPY.milkValidity.sourceValue
                          .replace('{volume}', String(log.volumeMl))
                          .replace(
                            '{date}',
                            `${formatShortDate(log.recordedAt)}, ${formatTime(log.recordedAt)}`,
                          )}
                      </p>
                    </div>
                    <div className="border-achievement/45 bg-achievement-soft flex items-center justify-between gap-3 rounded-xl border p-3">
                      <p className="text-sm font-medium">
                        {COPY.milkValidity.deadlineLabel}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatShortDate(deadline)}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs leading-5">
                      {COPY.milkValidity.reactivateHint}
                    </p>
                  </div>
                }
                questionLabel={COPY.milkValidity.questionLabel}
                options={options}
                defaultOption={current?.timingOption ?? 'MILK_2_DAYS_BEFORE'}
                previewByOption={previewByOption}
                disclaimer={COPY.milkValidity.disclaimer}
                backHref="/meu-agendamento"
                onActivate={async (values) =>
                  activateMilkValidityReminderAction({
                    timingOption: values.timingOption,
                  })
                }
              />
            )
          })()
        ) : (
          <Card>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-6">
                {COPY.milkValidity.emptyState}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
