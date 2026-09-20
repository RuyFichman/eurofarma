import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, ChevronLeft } from 'lucide-react'

import { activateFutureDonationReminderAction } from '@/app/(nutriz)/meu-agendamento/lembretes/actions'
import { ReminderConfigForm } from '@/components/nutriz/reminder-config-form'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getNutrizReminderOverview } from '@/lib/db/queries/nutriz-reminders'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatLocalDate } from '@/lib/utils/local-date-time'

const COPY = NUTRIZ_AUTH.area.reminders

export const metadata: Metadata = {
  title: `${COPY.futureDonation.configTitle} | NutriLink`,
  robots: { index: false, follow: false },
}

const OPTIONS = [
  'DONATION_7_DAYS_BEFORE',
  'DONATION_ON_DAY',
  'DONATION_7_DAYS_BEFORE_AND_ON_DAY',
] as const

export default async function FutureDonationReminderPage() {
  const nutriz = await requireNutrizUser()
  const overview = await getNutrizReminderOverview(nutriz.id)
  const current = overview?.preferences.find(
    (p) => p.type === 'FUTURE_DONATION',
  )

  const previewText = COPY.futureDonation.previewTemplate.replace(
    '{firstName}',
    nutriz.firstName,
  )
  const options = OPTIONS.map((value) => ({
    value,
    label: COPY.futureDonation.options[value].label,
    helper: COPY.futureDonation.options[value].helper,
  }))
  const previewByOption = Object.fromEntries(
    OPTIONS.map((value) => [value, previewText]),
  )

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

        <ReminderConfigForm
          icon={Bell}
          title={COPY.futureDonation.configTitle}
          description={COPY.futureDonation.configDescription}
          dateField={{
            label: COPY.futureDonation.dateLabel,
            help: COPY.futureDonation.dateHelp,
            defaultValue: current?.targetDate
              ? formatLocalDate(current.targetDate)
              : '',
          }}
          questionLabel={COPY.futureDonation.questionLabel}
          options={options}
          defaultOption={
            current?.timingOption ?? 'DONATION_7_DAYS_BEFORE_AND_ON_DAY'
          }
          previewByOption={previewByOption}
          disclaimer={COPY.futureDonation.disclaimer}
          backHref="/meu-agendamento"
          onActivate={async (values) =>
            activateFutureDonationReminderAction({
              timingOption: values.timingOption,
              targetDate: values.targetDate,
            })
          }
        />
      </div>
    </section>
  )
}
