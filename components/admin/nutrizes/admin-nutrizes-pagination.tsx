import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  buildAdminNutrizesHref,
  type AdminNutrizFilters,
} from '@/lib/admin/nutrizes/filters'
import type { AdminNutrizesPagination as AdminNutrizesPaginationMeta } from '@/lib/db/queries/admin-nutrizes'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.nutrizes.pagination

/**
 * Paginação por links — Server Component, sem estado no cliente.
 *
 * Extremos viram `<Button disabled>` em vez de link: um `<a>` "desabilitado"
 * continua focável, o botão desabilitado sai da ordem de foco de verdade.
 */
export function AdminNutrizesPagination({
  filters,
  pagination,
}: {
  filters: AdminNutrizFilters
  pagination: AdminNutrizesPaginationMeta
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
          <Link href={buildAdminNutrizesHref(filters, page - 1)} rel="prev">
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
          <Link href={buildAdminNutrizesHref(filters, page + 1)} rel="next">
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
