import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  buildAdminUnitsHref,
  type AdminUnitFilters,
} from '@/lib/admin/units/filters'
import type { AdminUnitsPagination as AdminUnitsPaginationMeta } from '@/lib/db/queries/admin-units'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.units.pagination

type AdminUnitsPaginationProps = {
  filters: AdminUnitFilters
  pagination: AdminUnitsPaginationMeta
}

/**
 * Paginação por links — Server Component, sem estado no cliente.
 *
 * Os hrefs saem de `buildAdminUnitsHref`, que preserva os filtros ativos e
 * troca apenas a página (e omite `page=1`). Extremos viram `<Button disabled>`
 * em vez de link: um `<a>` "desabilitado" continua focável e navegável por
 * teclado, o botão desabilitado sai da ordem de foco de verdade.
 */
export function AdminUnitsPagination({
  filters,
  pagination,
}: AdminUnitsPaginationProps) {
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
          <Link href={buildAdminUnitsHref(filters, page - 1)} rel="prev">
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
          <Link href={buildAdminUnitsHref(filters, page + 1)} rel="next">
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
