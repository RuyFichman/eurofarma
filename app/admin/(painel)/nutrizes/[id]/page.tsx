import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, MapPin, ShieldAlert } from 'lucide-react'

import { AdminJourneyHistory } from '@/components/admin/nutrizes/admin-journey-history'
import { AdminJourneyStatusBadge } from '@/components/admin/nutrizes/admin-journey-status-badge'
import { AdminJourneyStatusForm } from '@/components/admin/nutrizes/admin-journey-status-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ADMIN_NUTRIZES_PATH } from '@/lib/admin/nutrizes/filters'
import { getAdminNutrizJourneyDetail } from '@/lib/db/queries/admin-nutriz-journey'
import { getAllowedJourneyTransitions } from '@/lib/journey/status'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'

const COPY = ADMIN.nutrizJourney

export const metadata: Metadata = {
  title: COPY.seo.title,
  description: COPY.seo.description,
  robots: { index: false, follow: false },
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminNutrizJourneyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const nutriz = await getAdminNutrizJourneyDetail(id)
  if (!nutriz) notFound()

  const updated = firstValue((await searchParams).updated) === '1'
  const allowedStatuses = getAllowedJourneyTransitions(nutriz.journeyStatus)

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href={ADMIN_NUTRIZES_PATH}>
          <ArrowLeft aria-hidden="true" />
          {COPY.back}
        </Link>
      </Button>

      <div className="space-y-2">
        <p className="text-primary text-sm font-semibold">{COPY.eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {nutriz.fullName}
        </h1>
        <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden="true" />
            {COPY.location
              .replace('{city}', nutriz.city)
              .replace('{state}', nutriz.state)}
          </span>
          <span>
            {COPY.registeredAt.replace(
              '{date}',
              formatShortDate(nutriz.createdAt),
            )}
          </span>
        </div>
      </div>

      {updated ? (
        <Alert>
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>{COPY.mutations.successTitle}</AlertTitle>
          <AlertDescription>{COPY.mutations.success}</AlertDescription>
        </Alert>
      ) : null}

      <Alert>
        <ShieldAlert aria-hidden="true" />
        <AlertDescription>{COPY.privacyNotice}</AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{COPY.current.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminJourneyStatusBadge status={nutriz.journeyStatus} />
            <p className="text-muted-foreground text-sm leading-6">
              {COPY.current.description}
            </p>
          </CardContent>
        </Card>

        {allowedStatuses.length > 0 ? (
          <AdminJourneyStatusForm
            nutrizProfileId={nutriz.id}
            currentStatus={nutriz.journeyStatus}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{COPY.terminal.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-6">
                {COPY.terminal.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AdminJourneyHistory nutriz={nutriz} />
    </div>
  )
}
