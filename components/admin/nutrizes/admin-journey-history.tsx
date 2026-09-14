import { Clock3 } from 'lucide-react'

import { AdminJourneyStatusBadge } from '@/components/admin/nutrizes/admin-journey-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminNutrizJourneyDetail } from '@/lib/db/queries/admin-nutriz-journey'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatShortDate, formatTime } from '@/lib/utils/format-date'

export function AdminJourneyHistory({
  nutriz,
}: {
  nutriz: AdminNutrizJourneyDetail
}) {
  const copy = ADMIN.nutrizJourney

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.history.title}</CardTitle>
        <p className="text-muted-foreground text-sm leading-6">
          {copy.history.description}
        </p>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-2 space-y-7 border-l pl-6">
          {nutriz.journeyHistory.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                className="bg-primary ring-background absolute top-1.5 -left-[1.72rem] size-3 rounded-full ring-4"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-2">
                <AdminJourneyStatusBadge status={entry.toStatus} />
                <time
                  dateTime={entry.changedAt.toISOString()}
                  className="text-muted-foreground flex items-center gap-1 text-xs"
                >
                  <Clock3 className="size-3.5" aria-hidden="true" />
                  {formatShortDate(entry.changedAt)} ·{' '}
                  {formatTime(entry.changedAt)}
                </time>
              </div>
              <p className="mt-2 text-sm font-medium">
                {copy.history.transition
                  .replace(
                    '{from}',
                    ADMIN.nutrizJourney.status[entry.fromStatus],
                  )
                  .replace('{to}', ADMIN.nutrizJourney.status[entry.toStatus])}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {copy.history.changedBy.replace(
                  '{name}',
                  entry.changedByUser.fullName,
                )}
              </p>
              <p className="bg-muted/40 mt-3 rounded-lg border px-3 py-2 text-sm leading-6">
                {entry.administrativeNote ?? copy.history.noNote}
              </p>
            </li>
          ))}

          <li className="relative">
            <span
              className="bg-muted-foreground ring-background absolute top-1.5 -left-[1.72rem] size-3 rounded-full ring-4"
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center gap-2">
              <AdminJourneyStatusBadge status="REGISTERED" />
              <time
                dateTime={nutriz.createdAt.toISOString()}
                className="text-muted-foreground flex items-center gap-1 text-xs"
              >
                <Clock3 className="size-3.5" aria-hidden="true" />
                {formatShortDate(nutriz.createdAt)} ·{' '}
                {formatTime(nutriz.createdAt)}
              </time>
            </div>
            <p className="mt-2 text-sm font-medium">
              {copy.history.initialTitle}
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {copy.history.initialDescription}
            </p>
          </li>
        </ol>
      </CardContent>
    </Card>
  )
}
