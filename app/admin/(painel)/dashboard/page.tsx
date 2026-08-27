import type { Metadata } from 'next'

import { DashboardOverview } from '@/components/admin/dashboard/dashboard-overview'
import { getAdminDashboardMetrics } from '@/lib/db/queries/dashboard-metrics'
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
export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics()

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

      <DashboardOverview metrics={metrics} />
    </div>
  )
}
