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
