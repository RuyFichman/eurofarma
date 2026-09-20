import type { DashboardChartsData } from '@/lib/admin/dashboard/charts'
import { ActivityChart } from '@/components/admin/dashboard/activity-chart'
import { OriginChart } from '@/components/admin/dashboard/origin-chart'

export function DashboardCharts({ data }: { data: DashboardChartsData }) {
  return (
    <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(19rem,1fr)]">
      <ActivityChart months={data.months} />
      <OriginChart origins={data.origins} />
    </div>
  )
}
