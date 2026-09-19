import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, MapPin, UserRound } from 'lucide-react'

import {
  NutrizJourneyCurrentStatus,
  NutrizJourneyGuidance,
  NutrizJourneyTimeline,
} from '@/components/nutriz/nutriz-journey-status'
import { NutrizJourneyProgress } from '@/components/nutriz/nutriz-journey-progress'
import { EducationalSuggestions } from '@/components/nutriz/educational-suggestions'
import { PersonalExtractionCard } from '@/components/nutriz/personal-extraction-card'
import { DonationHistoryCard } from '@/components/nutriz/donation-history-card'
import { PersonalHighlights } from '@/components/nutriz/personal-highlights'
import { NutrizAccountCard } from '@/components/nutriz/nutriz-account-card'
import { ReminderConsentCard } from '@/components/nutriz/reminder-consent-card'
import { NutrizRecognitionsCard } from '@/components/nutriz/nutriz-recognitions-card'
import { NutrizReferralCard } from '@/components/nutriz/nutriz-referral-card'
import { WellbeingCard } from '@/components/nutriz/wellbeing-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getNutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import { getReminderConsentPreference } from '@/lib/db/queries/communication-consents'
import { getNutrizAccountData } from '@/lib/db/queries/nutriz-account'
import { getNutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import { getOrCreateNutrizReferralLink } from '@/lib/db/queries/referral-links'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatDateTimeLocal } from '@/lib/utils/local-date-time'

export const metadata: Metadata = {
  title: NUTRIZ_AUTH.area.meta.title,
  description: NUTRIZ_AUTH.area.meta.description,
  robots: { index: false, follow: false },
}

export default async function NutrizAreaPage() {
  const nutriz = await requireNutrizUser()
  const [journey, reminders, personal, referralLink, account] =
    await Promise.all([
      getNutrizJourneySnapshot(nutriz.id),
      getReminderConsentPreference(nutriz.id),
      getNutrizPersonalAreaData(nutriz.id),
      getOrCreateNutrizReferralLink(nutriz.id),
      getNutrizAccountData(nutriz.id),
    ])
  if (!journey || !reminders || !personal || !referralLink || !account) {
    notFound()
  }

  const copy = NUTRIZ_AUTH.area
  const isPostDonation =
    journey.journeyStatus === 'DONATION_CONFIRMED' ||
    journey.journeyStatus === 'RECURRING_DONATION_ELIGIBLE'

  return (
    <section className="bg-muted/35 min-h-svh px-4 py-8 sm:px-6 md:py-12">
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

        <div className="mt-6">
          <DonationHistoryCard
            snapshot={journey}
            wellbeingEntries={personal.wellbeingEntries}
          />
        </div>

        <div className="mt-6">
          <PersonalHighlights recognitions={personal.recognitions} />
        </div>

        <div className="mt-6">
          <NutrizAccountCard account={account} />
        </div>

        <div
          id="seus-reconhecimentos"
          className="mt-6 grid scroll-mt-6 items-start gap-6 lg:grid-cols-2"
        >
          <NutrizRecognitionsCard recognitions={personal.recognitions} />
          <EducationalSuggestions status={journey.journeyStatus} />
        </div>

        <NutrizReferralCard code={referralLink.code} />

        {isPostDonation ? (
          <div className="mt-6">
            <WellbeingCard entries={personal.wellbeingEntries} />
          </div>
        ) : null}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <NutrizJourneyCurrentStatus snapshot={journey} />
          <NutrizJourneyGuidance status={journey.journeyStatus} />
        </div>

        <div className="mt-6">
          <NutrizJourneyTimeline snapshot={journey} />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{copy.coverage.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-7">
              {copy.coverage.description}
            </p>
            <div className="bg-muted/50 mt-6 rounded-xl border p-4">
              <p className="text-muted-foreground text-xs">
                {copy.registeredLocation}
              </p>
              <p className="mt-1 flex items-center gap-2 font-medium">
                <MapPin className="text-primary size-4" aria-hidden="true" />
                {nutriz.city}, {nutriz.state}
              </p>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                {copy.coverageNotice}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/verificar-cobertura">
                  <MapPin aria-hidden="true" />
                  {copy.coverage.searchCta}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/como-funciona">
                  {copy.coverage.howCta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
