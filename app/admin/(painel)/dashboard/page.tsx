import type { Metadata } from 'next'

import { DashboardCharts } from '@/components/admin/dashboard/dashboard-charts'
import { DashboardFiltersForm } from '@/components/admin/dashboard/dashboard-filters'
import { DashboardOverview } from '@/components/admin/dashboard/dashboard-overview'
import {
  hasActiveDashboardFilters,
  parseDashboardFilters,
  type DashboardSearchParams,
} from '@/lib/admin/dashboard/filters'
import { getDashboardCharts } from '@/lib/db/queries/dashboard-charts'
import { getAdminDashboardMetrics } from '@/lib/db/queries/dashboard-metrics'
import { buildDashboardNutrizScope } from '@/lib/db/queries/dashboard-segmentation'
import { ADMIN } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: ADMIN.dashboard.seo.title,
  description: ADMIN.dashboard.seo.description,
}

/**
 * Destino padrão do painel, com os indicadores reais da Sprint 5.5.
 *
 * Server Component: consulta o Prisma direto, **sem self-fetch** de rota
 * interna (mesma decisão da 3.4 — evita hop HTTP e URL absoluta em RSC). Não
 * repete o chrome do painel: sidebar, header e `<main>` vêm do layout do grupo
 * `(painel)`, que também aplica o gate de role.
 *
 * A rota já é dinâmica por construção — o layout chama `requireAdminUser()`,
 * que lê cookies de sessão —, então não precisa de `force-dynamic` para os
 * números não congelarem em build.
 */
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>
}) {
  const filters = parseDashboardFilters(await searchParams)
  const hasFilters = hasActiveDashboardFilters(filters)
  const now = new Date()
  const nutrizScope = await buildDashboardNutrizScope(filters)
  const [metrics, charts] = await Promise.all([
    getAdminDashboardMetrics(nutrizScope, now),
    getDashboardCharts(now, nutrizScope),
  ])

  return (
    <div className="space-y-6">
      {/* `div`, não `header`: dentro de `<main>` um segundo `<header>` compete
          com o banner do shell na árvore de acessibilidade. */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ADMIN.dashboard.title}
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          {ADMIN.dashboard.description}
        </p>
      </div>

      <DashboardFiltersForm filters={filters} />

      <DashboardOverview metrics={metrics} hasFilters={hasFilters}>
        <DashboardCharts data={charts} />
      </DashboardOverview>
    </div>
  )
}
