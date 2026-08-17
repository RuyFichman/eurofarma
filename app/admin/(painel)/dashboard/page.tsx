import type { Metadata } from 'next'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ADMIN } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: ADMIN.dashboard.seo.title,
  description: ADMIN.dashboard.seo.description,
}

/**
 * Destino padrão do painel. Nesta sprint (5.3) a tela existe para fechar o fluxo
 * de acesso — protegida por middleware + role. Os indicadores reais entram na
 * Sprint 5.4.
 */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ADMIN.dashboard.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {ADMIN.dashboard.description}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{ADMIN.dashboard.placeholder.title}</CardTitle>
          <CardDescription>
            {ADMIN.dashboard.placeholder.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
