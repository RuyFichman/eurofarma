import { Building2, HeartHandshake, MapPin, MessageCircle } from 'lucide-react'

import { AdminBreakdownList } from '@/components/admin/dashboard/admin-breakdown-list'
import type { BreakdownItem } from '@/components/admin/dashboard/admin-breakdown-list'
import { AdminStatCard } from '@/components/admin/dashboard/admin-stat-card'
import { AdminTopUnits } from '@/components/admin/dashboard/admin-top-units'
import type {
  AdminDashboardMetrics,
  DashboardBreakdown,
  DashboardStateCount,
} from '@/lib/db/queries/dashboard-metrics'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.dashboard

type DashboardOverviewProps = {
  metrics: AdminDashboardMetrics
}

/** Contagem de uma chave específica do breakdown (0 se ausente). */
function countOf<K extends string>(
  items: DashboardBreakdown<K>[],
  key: K,
): number {
  return items.find((item) => item.key === key)?.count ?? 0
}

/** UF vira rótulo direto — a sigla já é o nome da categoria. */
function toStateItems(counts: DashboardStateCount[]): BreakdownItem[] {
  return counts.map((row) => ({
    id: row.state,
    label: row.state,
    count: row.count,
  }))
}

/**
 * Composição do painel (Server Component).
 *
 * Regra que atravessa a tela toda: **indicador zerado nunca aparece como "0"
 * pelado**. Cada bloco troca a linha de contexto por uma explicação do porquê
 * do zero — com a base ainda pequena, o estado vazio é o caminho principal, não
 * a exceção (spec 5.5, §3).
 */
export function DashboardOverview({ metrics }: DashboardOverviewProps) {
  const { units, nutriz, whatsappClicks, periodDays } = metrics

  const activeUnits = countOf(units.byStatus, 'ACTIVE')
  const statesCovered = units.byState.length

  return (
    <div className="space-y-6">
      <section aria-labelledby="dashboard-metrics-title">
        <h2 id="dashboard-metrics-title" className="sr-only">
          {COPY.metrics.title}
        </h2>

        {/* Lista de definição: o par `<dt>`/`<dd>` de cada cartão faz o leitor
            de tela anunciar rótulo e número juntos. */}
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            icon={Building2}
            label={COPY.metrics.activeUnits.label}
            value={activeUnits}
            description={
              activeUnits > 0
                ? COPY.metrics.activeUnits.description
                : COPY.metrics.activeUnits.empty
            }
          />

          <AdminStatCard
            icon={MapPin}
            label={COPY.metrics.statesCovered.label}
            value={statesCovered}
            description={
              statesCovered > 0
                ? COPY.metrics.statesCovered.description
                : COPY.metrics.statesCovered.empty
            }
          />

          <AdminStatCard
            icon={HeartHandshake}
            label={COPY.metrics.nutriz.label}
            value={nutriz.total}
            description={
              nutriz.total > 0
                ? COPY.metrics.nutriz.description
                    .replace('{count}', formatCount(nutriz.createdInPeriod))
                    .replace('{days}', String(periodDays))
                : COPY.metrics.nutriz.empty
            }
          />

          {/* Número em destaque é a janela de 30 dias; o acumulado vai na linha
              de contexto. Sem nenhum clique registrado desde sempre, explica. */}
          <AdminStatCard
            icon={MessageCircle}
            label={COPY.metrics.whatsappClicks.label}
            value={whatsappClicks.inPeriod}
            description={
              whatsappClicks.total > 0
                ? COPY.metrics.whatsappClicks.description.replace(
                    '{total}',
                    formatCount(whatsappClicks.total),
                  )
                : COPY.metrics.whatsappClicks.empty
            }
          />
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminBreakdownList
          title={COPY.unitsByStatus.title}
          description={COPY.unitsByStatus.description.replace(
            '{total}',
            formatCount(units.total),
          )}
          emptyMessage={COPY.unitsByStatus.empty}
          items={units.byStatus.map((row) => ({
            id: row.key,
            label: COPY.unitsByStatus.labels[row.key],
            count: row.count,
          }))}
        />

        <AdminBreakdownList
          title={COPY.unitsByType.title}
          description={COPY.unitsByType.description}
          emptyMessage={COPY.unitsByStatus.empty}
          items={units.byType.map((row) => ({
            id: row.key,
            label: COPY.unitsByType.labels[row.key],
            count: row.count,
          }))}
        />

        <AdminBreakdownList
          title={COPY.unitsByState.title}
          description={COPY.unitsByState.description}
          emptyMessage={COPY.unitsByState.empty}
          items={toStateItems(units.byState)}
        />

        {/* Agregado por UF, nunca por cidade: com poucos cadastros, um recorte
            municipal reidentificaria a nutriz (spec 5.5, §5). */}
        <AdminBreakdownList
          title={COPY.nutrizByState.title}
          description={COPY.nutrizByState.description}
          emptyMessage={COPY.nutrizByState.empty}
          items={toStateItems(nutriz.byState)}
        />
      </div>

      <AdminTopUnits units={whatsappClicks.topUnits} periodDays={periodDays} />
    </div>
  )
}
