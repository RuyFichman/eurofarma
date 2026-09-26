import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

import { ActionCenterItemList } from '@/components/admin/action-center/action-center-item-list'
import { ActionCenterPagination } from '@/components/admin/action-center/action-center-pagination'
import {
  formatWaitDuration,
  pluralizeCount,
} from '@/components/admin/action-center/format'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ACTION_CENTER_QUEUES,
  parseActionCenterQueueSlug,
} from '@/lib/admin/action-center/queues'
import { ACTION_CENTER_THRESHOLDS } from '@/lib/admin/action-center/thresholds'
import { ADMIN } from '@/lib/i18n/pt-br'

import {
  loadActionCenterQueueRoute,
  type ActionCenterQueueRouteProps,
} from './load'

const COPY = ADMIN.actionCenter
const DETAIL = COPY.detail

type PageProps = ActionCenterQueueRouteProps

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const key = parseActionCenterQueueSlug((await params).fila)
  if (!key) return {}
  return {
    title: DETAIL.seo.title.replace('{queue}', COPY.queues[key].title),
    description: DETAIL.seo.description,
  }
}

function thresholdRules(key: keyof typeof ACTION_CENTER_THRESHOLDS): string[] {
  const thresholds = ACTION_CENTER_THRESHOLDS[key]
  const suffix =
    thresholds.clock === 'business' ? ` ${COPY.wait.businessSuffix}` : ''
  const format = (minutes: number) => `${formatWaitDuration(minutes)}${suffix}`

  const entry =
    thresholds.entryMinutes > 0
      ? DETAIL.entryRule.replace('{entry}', format(thresholds.entryMinutes))
      : DETAIL.entryImmediate
  const severity =
    thresholds.highMinutes === null
      ? DETAIL.severityRuleNoHigh.replace(
          '{medium}',
          format(thresholds.mediumMinutes),
        )
      : DETAIL.severityRule
          .replace('{medium}', format(thresholds.mediumMinutes))
          .replace('{high}', format(thresholds.highMinutes))

  return [entry, severity, DETAIL.provisional]
}

/**
 * Detalhamento de uma fila da Central de Ação — `/admin/atencao/[fila]`.
 * Gate de admin, validação do slug e consulta ficam em `load.ts`.
 */
export default async function ActionCenterQueuePage(props: PageProps) {
  const { key, items, pagination } = await loadActionCenterQueueRoute(props)
  const queueCopy = COPY.queues[key]
  const owner = COPY.owners[ACTION_CENTER_QUEUES[key].owner]

  return (
    <div className="space-y-6">
      <Link
        href="/admin/dashboard"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {DETAIL.back}
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {queueCopy.title}
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          {queueCopy.description}
        </p>
      </div>

      <dl className="bg-card grid gap-4 rounded-lg border p-4 text-sm md:grid-cols-3">
        <div>
          <dt className="text-muted-foreground text-xs">{COPY.fields.owner}</dt>
          <dd>{owner}</dd>
          <dd className="text-muted-foreground mt-1 text-xs text-pretty">
            {COPY.ownerNote}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">
            {COPY.fields.action}
          </dt>
          <dd className="text-pretty">{queueCopy.action}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">
            {COPY.severity.label}
          </dt>
          {thresholdRules(key).map((rule) => (
            <dd key={rule} className="text-pretty">
              {rule}
            </dd>
          ))}
        </div>
      </dl>

      <Alert>
        <ShieldAlert aria-hidden="true" />
        <AlertDescription>
          {key === 'deliveryFailures'
            ? DETAIL.failuresPrivacyNotice
            : DETAIL.privacyNotice}
        </AlertDescription>
      </Alert>

      <section className="space-y-4" aria-labelledby="action-center-items">
        <h2
          id="action-center-items"
          className="text-muted-foreground text-sm font-medium"
        >
          {pluralizeCount(DETAIL.count, pagination.total)}
        </h2>

        {items.length > 0 ? (
          <ActionCenterItemList queueKey={key} items={items} />
        ) : (
          <p className="text-muted-foreground bg-card rounded-lg border p-6 text-center text-sm">
            {DETAIL.empty}
          </p>
        )}

        {pagination.totalPages > 1 ? (
          <ActionCenterPagination queueKey={key} pagination={pagination} />
        ) : null}
      </section>
    </div>
  )
}
