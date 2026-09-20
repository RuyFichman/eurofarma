import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Clock } from 'lucide-react'

import { activateKitDeliveryReminderAction } from '@/app/(nutriz)/meu-agendamento/lembretes/actions'
import { ReminderConfigForm } from '@/components/nutriz/reminder-config-form'
import { Card, CardContent } from '@/components/ui/card'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getNutrizReminderOverview } from '@/lib/db/queries/nutriz-reminders'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { addLocalDays } from '@/lib/reminders/schedule'
import {
  formatShortDate,
  formatShortDayMonth,
  formatTime,
} from '@/lib/utils/format-date'

const COPY = NUTRIZ_AUTH.area.reminders

export const metadata: Metadata = {
  title: `${COPY.kitDelivery.configTitle} | NutriLink`,
  robots: { index: false, follow: false },
}

const OPTIONS = [
  'KIT_MORNING_OF',
  'KIT_1_DAY_BEFORE',
  'KIT_1_DAY_BEFORE_AND_ON_DAY',
] as const

export default async function KitDeliveryReminderPage() {
  const nutriz = await requireNutrizUser()
  const overview = await getNutrizReminderOverview(nutriz.id)
  const scheduledAt = overview?.kitDeliveryScheduledAt ?? null

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

        {scheduledAt ? (
          (() => {
            const current = overview?.preferences.find(
              (p) => p.type === 'KIT_DELIVERY',
            )
            const dayBefore = addLocalDays(scheduledAt, -1)
            const sameDayPreview = COPY.kitDelivery.previewTemplateSameDay
              .replace('{firstName}', nutriz.firstName)
              .replace('{time}', formatTime(scheduledAt))
            const dayBeforePreview = COPY.kitDelivery.previewTemplateDayBefore
              .replace('{firstName}', nutriz.firstName)
              .replace('{date}', formatShortDayMonth(scheduledAt))
              .replace('{time}', formatTime(scheduledAt))

            const optionDateByValue: Record<(typeof OPTIONS)[number], Date> = {
              KIT_MORNING_OF: scheduledAt,
              KIT_1_DAY_BEFORE: dayBefore,
              KIT_1_DAY_BEFORE_AND_ON_DAY: scheduledAt,
            }
            const options = OPTIONS.map((value) => ({
              value,
              label: COPY.kitDelivery.options[value].label,
              helper: COPY.kitDelivery.options[value].helper.replace(
                '{date}',
                formatShortDayMonth(optionDateByValue[value]),
              ),
            }))
            const previewByOption: Record<(typeof OPTIONS)[number], string> = {
              KIT_MORNING_OF: sameDayPreview,
              KIT_1_DAY_BEFORE: dayBeforePreview,
              KIT_1_DAY_BEFORE_AND_ON_DAY: dayBeforePreview,
            }

            return (
              <ReminderConfigForm
                icon={Clock}
                title={COPY.kitDelivery.configTitle}
                description={COPY.kitDelivery.configDescription}
                infoBox={
                  <div className="space-y-3">
                    <div className="bg-muted/40 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        {COPY.kitDelivery.sourceLabel}
                      </p>
                      <p className="mt-1 text-sm">
                        {COPY.kitDelivery.sourceValue
                          .replace('{date}', formatShortDate(scheduledAt))
                          .replace('{time}', formatTime(scheduledAt))}
                      </p>
                    </div>
                    <div className="border-primary/30 bg-secondary/40 flex items-start gap-2 rounded-xl border p-3">
                      <p className="text-sm leading-6">
                        {COPY.kitDelivery.presenceNotice}
                      </p>
                    </div>
                  </div>
                }
                questionLabel={COPY.kitDelivery.questionLabel}
                options={options}
                defaultOption={current?.timingOption ?? 'KIT_1_DAY_BEFORE'}
                checklistHint={COPY.kitDelivery.checklistHint}
                previewByOption={previewByOption}
                disclaimer={COPY.kitDelivery.disclaimer}
                backHref="/meu-agendamento"
                onActivate={async (values) =>
                  activateKitDeliveryReminderAction({
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
                {COPY.kitDelivery.emptyState}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
