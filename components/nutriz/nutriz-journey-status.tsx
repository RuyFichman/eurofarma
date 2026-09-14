import { BadgeCheck, CircleAlert, Info, ListChecks } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { NutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import type { JourneyStatusValue } from '@/lib/journey/status'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'

type JourneyStatusCopy =
  (typeof NUTRIZ_AUTH.area.journey.status)[JourneyStatusValue]

function getStatusCopy(status: JourneyStatusValue): JourneyStatusCopy {
  return NUTRIZ_AUTH.area.journey.status[status]
}

function NutrizJourneyStatusBadge({ status }: { status: JourneyStatusValue }) {
  return <Badge variant="secondary">{getStatusCopy(status).label}</Badge>
}

export function NutrizJourneyCurrentStatus({
  snapshot,
}: {
  snapshot: NutrizJourneySnapshot
}) {
  const copy = NUTRIZ_AUTH.area.journey
  const statusCopy = getStatusCopy(snapshot.journeyStatus)
  const lastChangedAt =
    snapshot.journeyHistory.at(-1)?.changedAt ?? snapshot.createdAt

  return (
    <Card className="border-primary/20 bg-secondary/20">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="text-primary size-5" aria-hidden="true" />
            <p className="text-primary text-sm font-semibold">
              {copy.current.eyebrow}
            </p>
          </div>
          <NutrizJourneyStatusBadge status={snapshot.journeyStatus} />
        </div>
        <CardTitle className="text-xl">{statusCopy.title}</CardTitle>
        <CardDescription className="leading-6">
          {statusCopy.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-xs">
          {copy.current.updatedAt.replace(
            '{date}',
            formatShortDate(lastChangedAt),
          )}
        </p>
        <div className="bg-background/80 flex gap-3 rounded-xl border p-4">
          <Info
            className="text-primary mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p className="text-muted-foreground text-sm leading-6">
            {copy.current.sourceNotice}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function NutrizJourneyGuidance({
  status,
}: {
  status: JourneyStatusValue
}) {
  const copy = NUTRIZ_AUTH.area.journey
  const statusCopy = getStatusCopy(status)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="text-primary size-5" aria-hidden="true" />
          <CardTitle>{copy.guidance.title}</CardTitle>
        </div>
        <CardDescription className="leading-6">
          {copy.guidance.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-3">
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
        <div className="bg-muted/50 flex gap-3 rounded-xl border p-4">
          <CircleAlert
            className="text-primary mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p className="text-muted-foreground text-xs leading-5">
            {copy.guidance.safetyNotice}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function NutrizJourneyTimeline({
  snapshot,
}: {
  snapshot: NutrizJourneySnapshot
}) {
  const copy = NUTRIZ_AUTH.area.journey
  const entries: Array<{
    id: string
    status: JourneyStatusValue
    changedAt: Date
  }> = [
    {
      id: 'journey-created',
      status: 'REGISTERED',
      changedAt: snapshot.createdAt,
    },
    ...snapshot.journeyHistory.map((entry) => ({
      id: entry.id,
      status: entry.toStatus,
      changedAt: entry.changedAt,
    })),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.timeline.title}</CardTitle>
        <CardDescription className="leading-6">
          {copy.timeline.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-2 space-y-7 border-l pl-6">
          {entries.map((entry, index) => {
            const isCurrent =
              index === entries.length - 1 &&
              entry.status === snapshot.journeyStatus
            const statusCopy = getStatusCopy(entry.status)

            return (
              <li key={entry.id} className="relative">
                <span
                  className={
                    isCurrent
                      ? 'bg-primary ring-background absolute top-1.5 -left-[1.72rem] size-3 rounded-full ring-4'
                      : 'bg-muted-foreground/50 ring-background absolute top-1.5 -left-[1.72rem] size-3 rounded-full ring-4'
                  }
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{statusCopy.label}</p>
                  {isCurrent ? (
                    <Badge variant="outline">{copy.timeline.current}</Badge>
                  ) : null}
                </div>
                <time
                  dateTime={entry.changedAt.toISOString()}
                  className="text-muted-foreground mt-1 block text-xs"
                >
                  {copy.timeline.recordedAt.replace(
                    '{date}',
                    formatShortDate(entry.changedAt),
                  )}
                </time>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {statusCopy.timelineDescription}
                </p>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
