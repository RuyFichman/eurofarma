import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { SeverityBadge } from '@/components/admin/action-center/severity-badge'
import { formatWaitDuration } from '@/components/admin/action-center/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ACTION_CENTER_QUEUES,
  getActionCenterQueueHref,
} from '@/lib/admin/action-center/queues'
import type { ActionCenterQueueSummary } from '@/lib/admin/action-center/summary'
import { ACTION_CENTER_THRESHOLDS } from '@/lib/admin/action-center/thresholds'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.actionCenter

function waitText(minutes: number | null, business: boolean): string | null {
  if (minutes === null) return null
  const duration = formatWaitDuration(minutes)
  return business ? `${duration} ${COPY.wait.businessSuffix}` : duration
}

/**
 * Cartão de uma fila no resumo. Só agregados: quantidade, esperas,
 * criticidade, papel responsável e ação recomendada. Nenhum dado pessoal.
 */
export function ActionCenterQueueCard({
  summary,
}: {
  summary: ActionCenterQueueSummary
}) {
  const queueCopy = COPY.queues[summary.key]
  const owner = COPY.owners[ACTION_CENTER_QUEUES[summary.key].owner]
  const business = ACTION_CENTER_THRESHOLDS[summary.key].clock === 'business'
  const headingId = `action-center-${summary.key}`
  const oldest = waitText(summary.oldestWaitMinutes, business)
  const median = waitText(summary.medianWaitMinutes, business)

  return (
    <Card className="h-full gap-0 py-0">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 id={headingId} className="text-sm leading-snug font-semibold">
            {queueCopy.title}
          </h3>
          {summary.severity ? (
            <SeverityBadge severity={summary.severity} />
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">
              {COPY.fields.count}
            </dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {formatCount(summary.count)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">
              {COPY.fields.oldestWait}
            </dt>
            <dd className="font-medium">{oldest}</dd>
          </div>
          {median ? (
            <div className="col-span-2">
              <dt className="text-muted-foreground text-xs">
                {COPY.fields.medianWait}
              </dt>
              <dd>{median}</dd>
            </div>
          ) : null}
          <div className="col-span-2">
            <dt className="text-muted-foreground text-xs">
              {COPY.fields.owner}
            </dt>
            <dd>{owner}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground text-xs">
              {COPY.fields.action}
            </dt>
            <dd className="text-pretty">{queueCopy.action}</dd>
          </div>
        </dl>

        <div className="mt-auto pt-1">
          <Button asChild variant="outline" size="sm">
            <Link
              href={getActionCenterQueueHref(summary.key)}
              aria-label={COPY.openQueueLabel.replace(
                '{queue}',
                queueCopy.title,
              )}
            >
              {COPY.openQueue}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
