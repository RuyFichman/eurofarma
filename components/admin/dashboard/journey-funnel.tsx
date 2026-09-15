import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getJourneyStatusLabel } from '@/lib/admin/nutrizes/journey-labels'
import type { JourneyFunnel as JourneyFunnelData } from '@/lib/admin/dashboard/journey-funnel'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.dashboard.journeyFunnel

export function JourneyFunnel({ funnel }: { funnel: JourneyFunnelData }) {
  const isEmpty = (funnel.steps[0]?.reached ?? 0) === 0

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{COPY.title}</h2>
          </CardTitle>
          <CardDescription>{COPY.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isEmpty ? (
            <p className="text-muted-foreground text-sm">{COPY.empty}</p>
          ) : (
            <ol className="space-y-4">
              {funnel.steps.map((step, index) => (
                <li key={step.key} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {getJourneyStatusLabel(step.key)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {index === 0 || step.conversionFromPrevious === null
                          ? COPY.start
                          : COPY.conversionFromPrevious.replace(
                              '{percent}',
                              String(step.conversionFromPrevious),
                            )}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatCount(step.reached)}
                      </p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {COPY.conversionFromStart.replace(
                          '{percent}',
                          String(step.conversionFromStart),
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className="bg-muted h-2 overflow-hidden rounded-full"
                    aria-hidden
                  >
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${step.conversionFromStart}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="text-muted-foreground mt-5 border-t pt-4 text-xs text-pretty">
            {COPY.progressiveNote}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{COPY.dropOff.title}</h2>
          </CardTitle>
          <CardDescription>{COPY.dropOff.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEmpty ? (
            <p className="text-muted-foreground text-sm">
              {COPY.dropOff.empty}
            </p>
          ) : (
            <dl className="space-y-3">
              {funnel.dropOffs.map((dropOff) => (
                <div
                  key={`${dropOff.from}-${dropOff.to}`}
                  className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
                >
                  <dt>
                    <p className="text-sm">
                      {COPY.dropOff.transition
                        .replace('{from}', getJourneyStatusLabel(dropOff.from))
                        .replace('{to}', getJourneyStatusLabel(dropOff.to))}
                    </p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {COPY.dropOff.rate.replace(
                        '{percent}',
                        String(dropOff.rate),
                      )}
                    </p>
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums">
                    {formatCount(dropOff.count)}
                  </dd>
                </div>
              ))}
              <div className="bg-muted/50 flex items-start justify-between gap-4 rounded-lg p-3">
                <dt>
                  <p className="text-sm font-medium">
                    {COPY.dropOff.notEligibleLabel}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {COPY.dropOff.notEligibleDescription}
                  </p>
                </dt>
                <dd className="text-sm font-semibold tabular-nums">
                  {formatCount(funnel.notEligible)}
                </dd>
              </div>
            </dl>
          )}
          <p className="text-muted-foreground border-t pt-4 text-xs text-pretty">
            {COPY.dropOff.note}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
