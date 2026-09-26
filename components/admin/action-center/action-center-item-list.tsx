import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import {
  formatWaitDuration,
  pluralizeCount,
} from '@/components/admin/action-center/format'
import { SeverityBadge } from '@/components/admin/action-center/severity-badge'
import { AdminJourneyStatusBadge } from '@/components/admin/nutrizes/admin-journey-status-badge'
import { Button } from '@/components/ui/button'
import type { ActionCenterQueueKey } from '@/lib/admin/action-center/queues'
import { ACTION_CENTER_THRESHOLDS } from '@/lib/admin/action-center/thresholds'
import type {
  ActionCenterFailureItem,
  ActionCenterItem,
  ActionCenterNutrizRef,
} from '@/lib/db/queries/admin-action-center'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatShortDate, formatTime } from '@/lib/utils/format-date'

const COPY = ADMIN.actionCenter
const DETAIL = COPY.detail

function formatDateTime(value: Date): string {
  return `${formatShortDate(value)} ${formatTime(value)}`
}

function nutrizHref(id: string): string {
  return `/admin/nutrizes/${id}`
}

function NutrizSummary({ nutriz }: { nutriz: ActionCenterNutrizRef }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="truncate font-medium">{nutriz.fullName}</p>
      <p className="text-muted-foreground text-xs">
        <span className="sr-only">{DETAIL.columns.location}: </span>
        {nutriz.city}/{nutriz.state}
      </p>
      <AdminJourneyStatusBadge status={nutriz.journeyStatus} />
    </div>
  )
}

function OpenNutrizLink({
  id,
  label,
  accessibleLabel,
}: {
  id: string
  label: string
  accessibleLabel?: string
}) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={nutrizHref(id)} aria-label={accessibleLabel}>
        {label}
        <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  )
}

function FailureSummary({ item }: { item: ActionCenterFailureItem }) {
  const origin =
    item.origin in COPY.providers
      ? COPY.providers[item.origin as keyof typeof COPY.providers]
      : item.origin
  return (
    <dl className="min-w-0 space-y-1 text-sm">
      <div>
        <dt className="sr-only">{DETAIL.columns.category}</dt>
        <dd className="font-medium">{COPY.failureCategories[item.category]}</dd>
      </div>
      <div className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
        <div className="flex gap-1">
          <dt>{DETAIL.columns.provider}:</dt>
          <dd>{origin}</dd>
        </div>
        <div className="flex gap-1">
          <dt>{DETAIL.columns.code}:</dt>
          <dd className="font-mono">{item.code ?? DETAIL.noCode}</dd>
        </div>
      </div>
    </dl>
  )
}

/**
 * Lista do detalhamento, do item mais antigo para o mais recente. Cada linha
 * tem só o necessário para agir: quem (nome, cidade e status, ou categoria
 * técnica), desde quando, a espera, a criticidade e o link para o cadastro.
 */
export function ActionCenterItemList({
  queueKey,
  items,
}: {
  queueKey: ActionCenterQueueKey
  items: ActionCenterItem[]
}) {
  const business = ACTION_CENTER_THRESHOLDS[queueKey].clock === 'business'
  const sinceLabel = COPY.queues[queueKey].since

  return (
    <ol
      className="divide-border bg-card divide-y rounded-lg border"
      aria-label={DETAIL.listLabel}
    >
      {items.map((item) => (
        <li
          key={item.key}
          className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
        >
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {item.kind === 'failure' ? (
              <FailureSummary item={item} />
            ) : item.nutriz ? (
              <NutrizSummary nutriz={item.nutriz} />
            ) : (
              <div className="space-y-1">
                <p className="font-medium">{DETAIL.noProfile}</p>
                <p className="text-muted-foreground text-xs text-pretty">
                  {DETAIL.noProfileHint}
                </p>
              </div>
            )}

            <div className="space-y-1 text-sm">
              <dl className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  <dt className="text-muted-foreground">{sinceLabel}:</dt>
                  <dd>
                    <time dateTime={item.since.toISOString()}>
                      {formatDateTime(item.since)}
                    </time>
                  </dd>
                </div>
                <div className="flex flex-wrap gap-1">
                  <dt className="text-muted-foreground">
                    {DETAIL.columns.wait}:
                  </dt>
                  <dd className="font-medium">
                    {formatWaitDuration(item.waitMinutes)}
                    {business ? ` ${COPY.wait.businessSuffix}` : ''}
                  </dd>
                </div>
              </dl>
              {item.kind === 'profile' && item.kitDeliveryScheduledAt ? (
                <p className="text-muted-foreground text-xs">
                  {DETAIL.kitVisit.replace(
                    '{date}',
                    formatDateTime(item.kitDeliveryScheduledAt),
                  )}
                </p>
              ) : null}
              {item.kind === 'handoff' && item.ignoredMessages > 0 ? (
                <p className="text-muted-foreground text-xs">
                  {pluralizeCount(DETAIL.ignoredMessages, item.ignoredMessages)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <SeverityBadge severity={item.severity} />
            {item.kind === 'failure' ? (
              item.linkedNutrizId ? (
                <OpenNutrizLink
                  id={item.linkedNutrizId}
                  label={DETAIL.openLinkedNutriz}
                />
              ) : (
                <span className="text-muted-foreground text-xs">
                  {DETAIL.notLinked}
                </span>
              )
            ) : item.nutriz ? (
              <OpenNutrizLink
                id={item.nutriz.id}
                label={DETAIL.openNutriz}
                accessibleLabel={DETAIL.openNutrizLabel.replace(
                  '{name}',
                  item.nutriz.fullName,
                )}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
