import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { AdminUnitMobileCard } from '@/components/admin/units/admin-unit-mobile-card'
import { AdminUnitsEmptyState } from '@/components/admin/units/admin-units-empty-state'
import { AdminUnitsFilters } from '@/components/admin/units/admin-units-filters'
import { AdminUnitsPagination } from '@/components/admin/units/admin-units-pagination'
import { AdminUnitsTable } from '@/components/admin/units/admin-units-table'
import { Button } from '@/components/ui/button'
import {
  ADMIN_UNITS_PATH,
  hasActiveAdminUnitFilters,
  parseAdminUnitFilters,
  type AdminUnitsSearchParams,
} from '@/lib/admin/units/filters'
import { getAdminUnits } from '@/lib/db/queries/admin-units'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.units

export const metadata: Metadata = {
  title: COPY.seo.title,
  description: COPY.seo.description,
}

/**
 * Listagem administrativa de unidades (Sprint 5.6).
 *
 * Server Component: os filtros vivem na URL, são normalizados por
 * `parseAdminUnitFilters` e viram consulta Prisma em `getAdminUnits` — **sem
 * self-fetch** de `/api/units` (mesma decisão da 3.4) e sem carregar a base
 * inteira para filtrar em memória. O chrome (sidebar, header, `<main>`) e o
 * gate de role vêm do layout do grupo `(painel)`; esta página não os repete.
 *
 * Não precisa de `force-dynamic`: o `requireAdminUser()` do layout lê cookies,
 * o que já torna a rota dinâmica — a lista nunca congela em build.
 */
export default async function AdminUnidadesPage({
  searchParams,
}: {
  searchParams: Promise<AdminUnitsSearchParams>
}) {
  const params = await searchParams
  const filters = parseAdminUnitFilters(params)
  const { units, pagination } = await getAdminUnits(filters)

  const filtersActive = hasActiveAdminUnitFilters(filters)
  const countLabel =
    pagination.total === 1 ? COPY.results.countOne : COPY.results.countOther

  return (
    <div className="space-y-6">
      {/* `div`, não `header`: dentro de `<main>` um segundo `<header>` compete
          com o banner do shell na árvore de acessibilidade. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {COPY.title}
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            {COPY.description}
          </p>
        </div>

        <Button asChild className="sm:shrink-0">
          <Link href={`${ADMIN_UNITS_PATH}/nova`}>
            <Plus aria-hidden="true" />
            {COPY.createAction}
          </Link>
        </Button>
      </div>

      <AdminUnitsFilters filters={filters} />

      <section className="space-y-4" aria-live="polite">
        {units.length > 0 ? (
          <>
            <h2 className="text-muted-foreground text-sm font-medium">
              {formatCount(pagination.total)} {countLabel}
            </h2>

            {/* Mesma lista em duas apresentações: cartões até `md`, tabela
                daí para cima. Só uma delas está no DOM visível por vez. */}
            <ul className="space-y-3 md:hidden">
              {units.map((unit) => (
                <li key={unit.id}>
                  <AdminUnitMobileCard unit={unit} />
                </li>
              ))}
            </ul>

            <AdminUnitsTable units={units} />
          </>
        ) : (
          // Com total > 0 e nenhuma linha, o caso é página fora do intervalo
          // (`?page=999`): o convite certo é rever a busca, não cadastrar a
          // primeira unidade.
          <AdminUnitsEmptyState
            variant={
              filtersActive || pagination.total > 0 ? 'filtered' : 'database'
            }
          />
        )}

        {pagination.totalPages > 1 ? (
          <AdminUnitsPagination filters={filters} pagination={pagination} />
        ) : null}
      </section>
    </div>
  )
}
