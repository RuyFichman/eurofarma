import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UserRound } from 'lucide-react'

import { NutrizJourneyTimeline } from '@/components/nutriz/nutriz-journey-status'
import { NutrizJourneyProgress } from '@/components/nutriz/nutriz-journey-progress'
import { PersonalExtractionCard } from '@/components/nutriz/personal-extraction-card'
import { DonationHistoryCard } from '@/components/nutriz/donation-history-card'
import { JourneySummaryCard } from '@/components/nutriz/journey-summary-card'
import { PersonalHighlights } from '@/components/nutriz/personal-highlights'
import { NutrizAccountCard } from '@/components/nutriz/nutriz-account-card'
import { ReminderConsentCard } from '@/components/nutriz/reminder-consent-card'
import { NutrizReferralCard } from '@/components/nutriz/nutriz-referral-card'
import { WellbeingCard } from '@/components/nutriz/wellbeing-card'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getNutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import { getReminderConsentPreference } from '@/lib/db/queries/communication-consents'
import { getNutrizAccountData } from '@/lib/db/queries/nutriz-account'
import { getNutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import {
  getOrCreateNutrizReferralLink,
  hasNutrizReferredSignup,
} from '@/lib/db/queries/referral-links'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatDateTimeLocal } from '@/lib/utils/local-date-time'

export const metadata: Metadata = {
  title: NUTRIZ_AUTH.area.meta.title,
  description: NUTRIZ_AUTH.area.meta.description,
  robots: { index: false, follow: false },
}

export default async function NutrizAreaPage() {
  const nutriz = await requireNutrizUser()
  const [journey, reminders, personal, referralLink, account, referredSignup] =
    await Promise.all([
      getNutrizJourneySnapshot(nutriz.id),
      getReminderConsentPreference(nutriz.id),
      getNutrizPersonalAreaData(nutriz.id),
      getOrCreateNutrizReferralLink(nutriz.id),
      getNutrizAccountData(nutriz.id),
      hasNutrizReferredSignup(nutriz.id),
    ])
  if (!journey || !reminders || !personal || !referralLink || !account) {
    notFound()
  }

  const copy = NUTRIZ_AUTH.area
  // Cada doação é uma transição registrada pelo Lactare; aptidão para
  // recorrência não é doação e não entra na contagem dos selos.
  const donationDates = journey.journeyHistory
    .filter((entry) => entry.toStatus === 'DONATION_CONFIRMED')
    .map((entry) => entry.changedAt)
  const isPostDonation =
    journey.journeyStatus === 'DONATION_CONFIRMED' ||
    journey.journeyStatus === 'RECURRING_DONATION_ELIGIBLE'

  return (
    <section className="bg-muted/35 min-h-[calc(100dvh-3.5rem)] px-4 py-8 sm:px-6 md:min-h-[calc(100dvh-4rem)] md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-secondary text-primary flex size-11 items-center justify-center rounded-2xl">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-primary text-sm font-semibold">{copy.badge}</p>
              <h1 className="text-2xl font-semibold md:text-3xl">
                {copy.greetingTemplate.replace('{firstName}', nutriz.firstName)}
              </h1>
            </div>
          </div>
          <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1.5 text-xs font-semibold">
            {NUTRIZ_AUTH.area.journey.status[journey.journeyStatus].label}
          </span>
        </div>
        <p className="text-muted-foreground mt-3">{copy.subtitle}</p>

        <div className="mt-8">
          <NutrizJourneyProgress snapshot={journey} />
        </div>

        <div className="mt-6">
          <PersonalExtractionCard
            data={personal}
            defaultRecordedAt={formatDateTimeLocal(new Date())}
          />
        </div>

        <div className="mt-6">
          <ReminderConsentCard
            enabled={reminders.enabled}
            referenceDate={reminders.referenceDate}
          />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <DonationHistoryCard
            snapshot={journey}
            wellbeingEntries={personal.wellbeingEntries}
          />
          <JourneySummaryCard />
        </div>

        <div className="mt-6">
          <PersonalHighlights
            registeredAt={journey.createdAt}
            donationDates={donationDates}
            hasReferredSignup={referredSignup}
          />
        </div>

        <div className="mt-6">
          <NutrizAccountCard account={account} />
        </div>

        <NutrizReferralCard code={referralLink.code} />

        {isPostDonation ? (
          <div className="mt-6">
            <WellbeingCard entries={personal.wellbeingEntries} />
          </div>
        ) : null}

        <div className="mt-6">
          <NutrizJourneyTimeline snapshot={journey} />
        </div>
      </div>
    </section>
  )
}
