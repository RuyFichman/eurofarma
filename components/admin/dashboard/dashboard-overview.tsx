import type { ReactNode } from 'react'
import {
  HeartHandshake,
  History,
  BellRing,
  Map,
  MapPin,
  MousePointerClick,
  Radio,
  Share2,
  TrendingUp,
  UserPlus,
} from 'lucide-react'

import { AdminBreakdownList } from '@/components/admin/dashboard/admin-breakdown-list'
import { AdminStatCard } from '@/components/admin/dashboard/admin-stat-card'
import { JourneyFunnel } from '@/components/admin/dashboard/journey-funnel'
import { getJourneyStatusLabel } from '@/lib/admin/nutrizes/journey-labels'
import type { AdminDashboardMetrics } from '@/lib/db/queries/dashboard-metrics'
import { ADMIN, COVERAGE } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.dashboard

export function DashboardOverview({
  metrics,
  hasFilters,
  children,
}: {
  metrics: AdminDashboardMetrics
  hasFilters: boolean
  children?: ReactNode
}) {
  const {
    municipalities,
    nutriz,
    periodDays,
    reach,
    contactClicks,
    journey,
    retention,
    reminders,
    referrals,
  } = metrics

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
            icon={Radio}
            label={COPY.metrics.reach.label}
            value={reach.signalsInPeriod}
            description={
              reach.signalsInPeriod > 0
                ? COPY.metrics.reach.description
                    .replace(
                      '{registrations}',
                      formatCount(reach.registrationsInPeriod),
                    )
                    .replace(
                      '{clicks}',
                      formatCount(reach.contactClicksInPeriod),
                    )
                    .replace('{days}', String(periodDays))
                : COPY.metrics.reach.empty.replace('{days}', String(periodDays))
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
            icon={MousePointerClick}
            label={COPY.metrics.contactClicks.label}
            value={contactClicks.total}
            description={
              contactClicks.total > 0
                ? COPY.metrics.contactClicks.description
                    .replace(
                      '{count}',
                      formatCount(contactClicks.createdInPeriod),
                    )
                    .replace('{days}', String(periodDays))
                : COPY.metrics.contactClicks.empty
            }
          />
          <AdminStatCard
            icon={HeartHandshake}
            label={COPY.metrics.nutriz.label}
            value={nutriz.total}
            description={
              nutriz.total > 0
                ? (hasFilters
                    ? COPY.metrics.nutriz.filteredDescription
                    : COPY.metrics.nutriz.description
                  )
                    .replace('{count}', formatCount(nutriz.createdInPeriod))
                    .replace('{days}', String(periodDays))
                : hasFilters
                  ? COPY.metrics.nutriz.filteredEmpty
                  : COPY.metrics.nutriz.empty
            }
          />
          <AdminStatCard
            icon={UserPlus}
            label={COPY.metrics.newNutriz.label}
            value={nutriz.createdInPeriod}
            description={
              nutriz.createdInPeriod > 0
                ? (hasFilters
                    ? COPY.metrics.newNutriz.filteredDescription
                    : COPY.metrics.newNutriz.description
                  ).replace('{days}', String(periodDays))
                : hasFilters
                  ? COPY.metrics.newNutriz.filteredEmpty
                  : COPY.metrics.newNutriz.empty
            }
          />
          <AdminStatCard
            icon={TrendingUp}
            label={COPY.metrics.journeyConversion.label}
            value={`${journey.overallConversion}%`}
            description={
              nutriz.total > 0
                ? COPY.metrics.journeyConversion.description
                : COPY.metrics.journeyConversion.empty
            }
          />
          <AdminStatCard
            icon={History}
            label={COPY.metrics.retention.label}
            value={`${retention.rate}%`}
            description={
              retention.cohortProfiles > 0
                ? COPY.metrics.retention.description
                    .replace(
                      '{retained}',
                      formatCount(retention.retainedProfiles),
                    )
                    .replace('{cohort}', formatCount(retention.cohortProfiles))
                : COPY.metrics.retention.empty
            }
          />
          <AdminStatCard
            icon={BellRing}
            label={COPY.metrics.reminders.label}
            value={`${reminders.adoptionRate}%`}
            description={
              reminders.eligibleProfiles > 0
                ? COPY.metrics.reminders.description
                    .replace(
                      '{enabled}',
                      formatCount(reminders.enabledProfiles),
                    )
                    .replace(
                      '{eligible}',
                      formatCount(reminders.eligibleProfiles),
                    )
                : COPY.metrics.reminders.empty
            }
          />
          <AdminStatCard
            icon={Share2}
            label={COPY.metrics.referrals.label}
            value={referrals.attributedProfiles}
            description={
              referrals.attributedProfiles > 0
                ? COPY.metrics.referrals.description
                    .replace(
                      '{count}',
                      formatCount(referrals.attributedInPeriod),
                    )
                    .replace('{days}', String(periodDays))
                : COPY.metrics.referrals.empty
            }
          />
        </dl>
        <p className="text-muted-foreground mt-3 text-sm">
          {COPY.metrics.retention.note} {COPY.metrics.reminders.note}{' '}
          {COPY.metrics.referrals.note}{' '}
          {COPY.metrics.reminders.activity
            .replace('{activated}', formatCount(reminders.activatedInPeriod))
            .replace('{withdrawn}', formatCount(reminders.withdrawnInPeriod))
            .replace('{days}', String(periodDays))}
        </p>
      </section>

      {children}

      <JourneyFunnel funnel={journey} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminBreakdownList
          title={COPY.nutrizByRegion.title}
          description={COPY.nutrizByRegion.description}
          emptyMessage={COPY.nutrizByRegion.empty}
          items={nutriz.byRegion.map((row) => ({
            id: row.key,
            label:
              row.key === 'OUTSIDE_OR_UNMAPPED'
                ? COPY.nutrizByRegion.outsideOrUnmapped
                : COVERAGE.regions[row.key],
            count: row.count,
          }))}
        />
        <AdminBreakdownList
          title={COPY.contactClicksByChannel.title}
          description={COPY.contactClicksByChannel.description}
          emptyMessage={COPY.contactClicksByChannel.empty}
          items={contactClicks.byChannel.map((row) => ({
            id: row.key,
            label: COPY.contactClicksByChannel.labels[row.key],
            count: row.count,
          }))}
        />
        <AdminBreakdownList
          title={COPY.nutrizByStage.title}
          description={COPY.nutrizByStage.description}
          emptyMessage={COPY.nutrizByStage.empty}
          items={nutriz.byStage.map((row) => ({
            id: row.key,
            label: getJourneyStatusLabel(row.key),
            count: row.count,
          }))}
        />
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
      </div>
    </div>
  )
}
