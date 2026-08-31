import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'

import { AdminNutrizMobileCard } from '@/components/admin/nutrizes/admin-nutriz-mobile-card'
import { AdminNutrizesEmptyState } from '@/components/admin/nutrizes/admin-nutrizes-empty-state'
import { AdminNutrizesFilters } from '@/components/admin/nutrizes/admin-nutrizes-filters'
import { AdminNutrizesPagination } from '@/components/admin/nutrizes/admin-nutrizes-pagination'
import { AdminNutrizesTable } from '@/components/admin/nutrizes/admin-nutrizes-table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  hasActiveAdminNutrizFilters,
  parseAdminNutrizFilters,
  type AdminNutrizesSearchParams,
} from '@/lib/admin/nutrizes/filters'
import { getAdminNutrizes } from '@/lib/db/queries/admin-nutrizes'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.nutrizes

export const metadata: Metadata = {
  title: COPY.seo.title,
  description: COPY.seo.description,
}

/**
 * Listagem administrativa de nutrizes — `/admin/nutrizes`.
 *
 * Mesma arquitetura da listagem de unidades (5.6): Server Component puro, com
 * os filtros vivendo na URL e uma consulta Prisma direta — sem self-fetch e sem
 * estado no cliente. O chrome e o gate de role vêm do layout de `(painel)`.
 *
 * O que muda em relação a unidades é a natureza do dado: aqui cada linha é uma
 * pessoa que confiou o contato dela à plataforma. Daí três decisões visíveis
 * nesta tela — aviso permanente de privacidade, WhatsApp mascarado por padrão e
 * ausência de exportação em massa.
 */
export default async function AdminNutrizesPage({
  searchParams,
}: {
  searchParams: Promise<AdminNutrizesSearchParams>
}) {
  const params = await searchParams
  const filters = parseAdminNutrizFilters(params)
  const { nutrizes, pagination } = await getAdminNutrizes(filters)

  const filtersActive = hasActiveAdminNutrizFilters(filters)
  const countLabel =
    pagination.total === 1 ? COPY.results.countOne : COPY.results.countOther

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{COPY.title}</h1>
        <p className="text-muted-foreground text-sm text-pretty">
          {COPY.description}
        </p>
      </div>

      {/* Aviso permanente, não dispensável: esta é a única tela do painel que
          lista dados pessoais, e quem abre precisa saber disso toda vez. */}
      <Alert>
        <ShieldAlert aria-hidden="true" />
        <AlertDescription>{COPY.privacyNotice}</AlertDescription>
      </Alert>

      <AdminNutrizesFilters filters={filters} />

      <section className="space-y-4" aria-live="polite">
        {nutrizes.length > 0 ? (
          <>
            <h2 className="text-muted-foreground text-sm font-medium">
              {formatCount(pagination.total)} {countLabel}
            </h2>

            <ul className="space-y-3 md:hidden">
              {nutrizes.map((nutriz) => (
                <li key={nutriz.id}>
                  <AdminNutrizMobileCard nutriz={nutriz} />
                </li>
              ))}
            </ul>

            <AdminNutrizesTable nutrizes={nutrizes} />
          </>
        ) : (
          // Total > 0 com zero linhas significa página fora do intervalo
          // (`?page=999`): o convite certo é rever a busca.
          <AdminNutrizesEmptyState
            variant={
              filtersActive || pagination.total > 0 ? 'filtered' : 'database'
            }
          />
        )}

        {pagination.totalPages > 1 ? (
          <AdminNutrizesPagination filters={filters} pagination={pagination} />
        ) : null}
      </section>
    </div>
  )
}
