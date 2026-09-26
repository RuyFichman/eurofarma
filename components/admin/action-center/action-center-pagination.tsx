import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  getActionCenterQueueHref,
  type ActionCenterQueueKey,
} from '@/lib/admin/action-center/queues'
import type { ActionCenterPagination as ActionCenterPaginationMeta } from '@/lib/db/queries/admin-action-center'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.actionCenter.detail.pagination

/** Paginação por links, no mesmo padrão de `AdminNutrizesPagination`. */
export function ActionCenterPagination({
  queueKey,
  pagination,
}: {
  queueKey: ActionCenterQueueKey
  pagination: ActionCenterPaginationMeta
}) {
  const { page, totalPages, hasPreviousPage, hasNextPage } = pagination
  const status = COPY.status
    .replace('{page}', String(page))
    .replace('{total}', String(totalPages))

  return (
    <nav
      className="flex items-center justify-center gap-4"
      aria-label={COPY.label}
    >
      {hasPreviousPage ? (
        <Button asChild variant="outline" size="sm">
          <Link href={getActionCenterQueueHref(queueKey, page - 1)} rel="prev">
            <ChevronLeft aria-hidden="true" />
            {COPY.previous}
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft aria-hidden="true" />
          {COPY.previous}
        </Button>
      )}

      <span className="text-muted-foreground text-sm">{status}</span>

      {hasNextPage ? (
        <Button asChild variant="outline" size="sm">
          <Link href={getActionCenterQueueHref(queueKey, page + 1)} rel="next">
            {COPY.next}
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          {COPY.next}
          <ChevronRight aria-hidden="true" />
        </Button>
      )}
    </nav>
  )
}
