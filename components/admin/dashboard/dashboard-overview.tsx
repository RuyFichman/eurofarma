import type { ReactNode } from 'react'
import { HeartHandshake, Map, MapPin, UserPlus } from 'lucide-react'

import { AdminBreakdownList } from '@/components/admin/dashboard/admin-breakdown-list'
import type { BreakdownItem } from '@/components/admin/dashboard/admin-breakdown-list'
import { AdminStatCard } from '@/components/admin/dashboard/admin-stat-card'
import type {
  AdminDashboardMetrics,
  DashboardStateCount,
} from '@/lib/db/queries/dashboard-metrics'
import { ADMIN, COVERAGE } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.dashboard

function toStateItems(counts: DashboardStateCount[]): BreakdownItem[] {
  return counts.map((row) => ({
    id: row.state,
    label: row.state,
    count: row.count,
  }))
}

export function DashboardOverview({
  metrics,
  children,
}: {
  metrics: AdminDashboardMetrics
  children?: ReactNode
}) {
  const { municipalities, nutriz, periodDays } = metrics

  return (
    <div className="space-y-6">
      <section aria-labelledby="dashboard-metrics-title">
        <h2 id="dashboard-metrics-title" className="sr-only">
          {COPY.metrics.title}
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            icon={MapPin}
            label={COPY.metrics.activeMunicipalities.label}
            value={municipalities.active}
            description={
              municipalities.active > 0
                ? COPY.metrics.activeMunicipalities.description
                : COPY.metrics.activeMunicipalities.empty
            }
          />
          <AdminStatCard
            icon={Map}
            label={COPY.metrics.regionsCovered.label}
            value={municipalities.regionsCovered}
            description={
              municipalities.regionsCovered > 0
                ? COPY.metrics.regionsCovered.description
                : COPY.metrics.regionsCovered.empty
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
          <AdminStatCard
            icon={UserPlus}
            label={COPY.metrics.newNutriz.label}
            value={nutriz.createdInPeriod}
            description={
              nutriz.createdInPeriod > 0
                ? COPY.metrics.newNutriz.description.replace(
                    '{days}',
                    String(periodDays),
                  )
                : COPY.metrics.newNutriz.empty
            }
          />
        </dl>
      </section>

      {children}

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminBreakdownList
          title={COPY.municipalitiesByStatus.title}
          description={COPY.municipalitiesByStatus.description.replace(
            '{total}',
            formatCount(municipalities.total),
          )}
          emptyMessage={COPY.municipalitiesByStatus.empty}
          items={municipalities.byStatus.map((row) => ({
            id: row.key,
            label: COPY.municipalitiesByStatus.labels[row.key],
            count: row.count,
          }))}
        />
        <AdminBreakdownList
          title={COPY.municipalitiesByRegion.title}
          description={COPY.municipalitiesByRegion.description}
          emptyMessage={COPY.municipalitiesByRegion.empty}
          items={municipalities.byRegion.map((row) => ({
            id: row.key,
            label: COVERAGE.regions[row.key],
            count: row.count,
          }))}
        />
        <AdminBreakdownList
          title={COPY.nutrizByState.title}
          description={COPY.nutrizByState.description}
          emptyMessage={COPY.nutrizByState.empty}
          items={toStateItems(nutriz.byState)}
        />
      </div>
    </div>
  )
}
