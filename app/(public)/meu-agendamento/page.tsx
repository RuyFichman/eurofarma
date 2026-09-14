import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, MapPin, UserRound } from 'lucide-react'

import {
  NutrizJourneyCurrentStatus,
  NutrizJourneyGuidance,
  NutrizJourneyTimeline,
} from '@/components/nutriz/nutriz-journey-status'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { getNutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: NUTRIZ_AUTH.area.meta.title,
  description: NUTRIZ_AUTH.area.meta.description,
  robots: { index: false, follow: false },
}

export default async function NutrizAreaPage() {
  const nutriz = await requireNutrizUser()
  const journey = await getNutrizJourneySnapshot(nutriz.id)
  if (!journey) notFound()

  const copy = NUTRIZ_AUTH.area

  return (
    <section className="bg-muted/30 min-h-[calc(100dvh-3.5rem)] px-6 py-12 md:min-h-[calc(100dvh-4rem)] md:py-16">
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
