import Link from 'next/link'
import { Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  ADMIN_DASHBOARD_PATH,
  DASHBOARD_STAGE_VALUES,
  hasActiveDashboardFilters,
  type DashboardFilters,
} from '@/lib/admin/dashboard/filters'
import { ORIGIN_KEYS } from '@/lib/admin/dashboard/charts'
import { SERVICE_REGION_VALUES } from '@/lib/constants/service-municipalities'
import { ADMIN, COVERAGE, DASHBOARD_CHARTS } from '@/lib/i18n/pt-br'

const COPY = ADMIN.dashboard.filters

export function DashboardFiltersForm({
  filters,
}: {
  filters: DashboardFilters
}) {
  const hasFilters = hasActiveDashboardFilters(filters)

  return (
    <section
      className="bg-card rounded-2xl border p-5 shadow-sm"
      aria-labelledby="dashboard-filters-title"
    >
      <div className="mb-4">
        <h2 id="dashboard-filters-title" className="font-semibold">
          {COPY.title}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm text-pretty">
          {COPY.description}
        </p>
      </div>

      <form
        method="get"
        aria-label={COPY.label}
        className="grid gap-4 lg:grid-cols-[repeat(3,minmax(10rem,1fr))_auto] lg:items-end"
      >
        <div className="space-y-2">
          <Label htmlFor="dashboard-region">{COPY.region.label}</Label>
          <select
            id="dashboard-region"
            name="region"
            defaultValue={filters.region}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">{COPY.region.all}</option>
            {SERVICE_REGION_VALUES.map((region) => (
              <option key={region} value={region}>
                {COVERAGE.regions[region]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dashboard-stage">{COPY.stage.label}</Label>
          <select
            id="dashboard-stage"
            name="stage"
            defaultValue={filters.stage}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">{COPY.stage.all}</option>
            {DASHBOARD_STAGE_VALUES.map((stage) => (
              <option key={stage} value={stage}>
                {COPY.stage.options[stage]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dashboard-origin">{COPY.origin.label}</Label>
          <select
            id="dashboard-origin"
            name="origin"
            defaultValue={filters.origin}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">{COPY.origin.all}</option>
            {ORIGIN_KEYS.map((origin) => (
              <option key={origin} value={origin}>
                {DASHBOARD_CHARTS.originLabels[origin]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {hasFilters ? (
            <Button asChild type="button" variant="outline">
              <Link href={ADMIN_DASHBOARD_PATH}>{COPY.actions.clear}</Link>
            </Button>
          ) : null}
          <Button type="submit">
            <Filter aria-hidden="true" />
            {COPY.actions.apply}
          </Button>
        </div>
      </form>

      <p className="text-muted-foreground mt-4 border-t pt-4 text-xs text-pretty">
        {COPY.limitations}
      </p>
    </section>
  )
}
