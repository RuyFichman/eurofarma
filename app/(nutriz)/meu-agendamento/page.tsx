import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, MapPin, UserRound } from 'lucide-react'

import {
  NutrizJourneyCurrentStatus,
  NutrizJourneyGuidance,
  NutrizJourneyTimeline,
} from '@/components/nutriz/nutriz-journey-status'
import { EducationalSuggestions } from '@/components/nutriz/educational-suggestions'
import { PersonalExtractionCard } from '@/components/nutriz/personal-extraction-card'
import { PersonalHistoryCard } from '@/components/nutriz/personal-history-card'
import { ReminderConsentCard } from '@/components/nutriz/reminder-consent-card'
import { NutrizRecognitionsCard } from '@/components/nutriz/nutriz-recognitions-card'
import { NutrizReferralCard } from '@/components/nutriz/nutriz-referral-card'
import { WellbeingCard } from '@/components/nutriz/wellbeing-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getNutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import { getReminderConsentPreference } from '@/lib/db/queries/communication-consents'
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
  const [journey, reminders, personal, referralLink] = await Promise.all([
    getNutrizJourneySnapshot(nutriz.id),
    getReminderConsentPreference(nutriz.id),
    getNutrizPersonalAreaData(nutriz.id),
    getOrCreateNutrizReferralLink(nutriz.id),
  ])
  if (!journey || !reminders || !personal || !referralLink) notFound()

  const copy = NUTRIZ_AUTH.area

  return (
    <section className="bg-muted/30 min-h-svh px-6 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
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
        <p className="text-muted-foreground mt-3">{copy.subtitle}</p>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <NutrizJourneyCurrentStatus snapshot={journey} />
          <NutrizJourneyGuidance status={journey.journeyStatus} />
        </div>

        <div className="mt-6">
          <NutrizJourneyTimeline snapshot={journey} />
        </div>

        <ReminderConsentCard
          enabled={reminders.enabled}
          referenceDate={reminders.referenceDate}
        />

        <NutrizRecognitionsCard recognitions={personal.recognitions} />

        <NutrizReferralCard code={referralLink.code} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <PersonalExtractionCard
            data={personal}
            defaultRecordedAt={formatDateTimeLocal(new Date())}
          />
          <PersonalHistoryCard />
        </div>

        <div className="mt-6">
          <EducationalSuggestions status={journey.journeyStatus} />
        </div>

        {journey.journeyStatus === 'DONATION_CONFIRMED' ||
        journey.journeyStatus === 'RECURRING_DONATION_ELIGIBLE' ? (
          <div className="mt-6">
            <WellbeingCard entries={personal.wellbeingEntries} />
          </div>
        ) : null}

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
