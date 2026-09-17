import {
  Prisma,
  type ContactChannel,
  type JourneyStatus,
  type ServiceRegion,
} from '@prisma/client'

import {
  DASHBOARD_STAGE_VALUES,
  type DashboardStage,
} from '../../admin/dashboard/filters'
import {
  buildJourneyFunnel,
  type JourneyFunnel,
  type JourneyStatusCounts,
} from '../../admin/dashboard/journey-funnel'
import {
  SERVICE_REGION_VALUES,
  type ServiceRegionValue,
} from '../../constants/service-municipalities'
import { JOURNEY_STATUS_VALUES } from '../../journey/status'
import { prisma } from '../prisma'
import {
  dashboardNutrizSqlWhere,
  type DashboardNutrizScope,
  toDashboardNutrizWhere,
} from './dashboard-segmentation'
import { percentOf } from '../../utils/format-number'

export const DASHBOARD_PERIOD_DAYS = 30
export const DASHBOARD_RETENTION_DAYS = 30
export const MUNICIPALITY_STATUS_KEYS = ['ACTIVE', 'INACTIVE'] as const
export const CONTACT_CHANNEL_KEYS = ['WHATSAPP', 'PHONE'] as const
export const NUTRIZ_REGION_KEYS = [
  ...SERVICE_REGION_VALUES,
  'OUTSIDE_OR_UNMAPPED',
] as const

export type MunicipalityStatusKey = (typeof MUNICIPALITY_STATUS_KEYS)[number]
export type ContactChannelKey = (typeof CONTACT_CHANNEL_KEYS)[number]
export type NutrizRegionKey = (typeof NUTRIZ_REGION_KEYS)[number]

export type DashboardBreakdown<K extends string> = {
  key: K
  count: number
}

export type AdminDashboardMetrics = {
  periodDays: number
  municipalities: {
    total: number
    active: number
    regionsCovered: number
    byStatus: DashboardBreakdown<MunicipalityStatusKey>[]
    byRegion: DashboardBreakdown<ServiceRegionValue>[]
  }
  nutriz: {
    total: number
    createdInPeriod: number
    byRegion: DashboardBreakdown<NutrizRegionKey>[]
    byStage: DashboardBreakdown<DashboardStage>[]
  }
  reach: {
    signalsInPeriod: number
    registrationsInPeriod: number
    contactClicksInPeriod: number
  }
  contactClicks: {
    total: number
    createdInPeriod: number
    byChannel: DashboardBreakdown<ContactChannelKey>[]
  }
  journey: JourneyFunnel
  retention: {
    cohortProfiles: number
    retainedProfiles: number
    rate: number
  }
  reminders: {
    eligibleProfiles: number
    enabledProfiles: number
    adoptionRate: number
    activatedInPeriod: number
    withdrawnInPeriod: number
  }
  referrals: {
    attributedProfiles: number
    attributedInPeriod: number
  }
}

function subtractDays(from: Date, days: number): Date {
  const result = new Date(from)
  result.setDate(result.getDate() - days)
  return result
}

type DashboardProfileSummaryRow = {
  total: bigint
  created_in_period: bigint
  referred: bigint
  referred_in_period: bigint
  retention_cohort: bigint
}

type DashboardActivityRow = {
  reminders_enabled: bigint
  reminders_activated: bigint
  reminders_withdrawn: bigint
  retained_profiles: bigint
}

function toCount(value: bigint | number | undefined): number {
  return Number(value ?? 0)
}

export async function getAdminDashboardMetrics(
  nutrizScope: DashboardNutrizScope = {},
  now = new Date(),
): Promise<AdminDashboardMetrics> {
  const since = subtractDays(now, DASHBOARD_PERIOD_DAYS)
  const retentionSince = subtractDays(now, DASHBOARD_RETENTION_DAYS)
  const nutrizWhere = toDashboardNutrizWhere(nutrizScope)
  const sqlWhere = dashboardNutrizSqlWhere(nutrizScope)

  const [
    municipalitiesByStatusRegion,
    nutrizDimensions,
    profileSummaryRows,
    allNutrizCreatedInPeriod,
    contactClicksByChannel,
    recentContactClicksByChannel,
    activityRows,
  ] = await prisma.$transaction([
    prisma.serviceMunicipality.groupBy({
      by: ['isActive', 'region'],
      _count: { id: true },
    }),
    prisma.nutrizProfile.groupBy({
      by: ['journeyStatus', 'dashboardRegion'],
      where: nutrizWhere,
      _count: { id: true },
    }),
    prisma.$queryRaw<DashboardProfileSummaryRow[]>(Prisma.sql`
      SELECT
        COUNT(*)::bigint AS "total",
        COUNT(*) FILTER (
          WHERE np."created_at" >= ${since} AND np."created_at" <= ${now}
        )::bigint AS "created_in_period",
        COUNT(*) FILTER (
          WHERE np."referred_by_referral_link_id" IS NOT NULL
        )::bigint AS "referred",
        COUNT(*) FILTER (
          WHERE np."referred_by_referral_link_id" IS NOT NULL
            AND np."created_at" >= ${since}
            AND np."created_at" <= ${now}
        )::bigint AS "referred_in_period",
        COUNT(*) FILTER (
          WHERE np."created_at" <= ${retentionSince}
        )::bigint AS "retention_cohort"
      FROM "nutriz_profiles" np
      WHERE ${sqlWhere}
    `),
    prisma.nutrizProfile.count({
      where: { deletedAt: null, createdAt: { gte: since, lte: now } },
    }),
    prisma.contactChannelClick.groupBy({
      by: ['channel'],
      _count: { id: true },
    }),
    prisma.contactChannelClick.groupBy({
      by: ['channel'],
      where: { createdAt: { gte: since, lte: now } },
      _count: { id: true },
    }),
    prisma.$queryRaw<DashboardActivityRow[]>(Prisma.sql`
      WITH scoped_profiles AS MATERIALIZED (
        SELECT np."id", np."created_at"
        FROM "nutriz_profiles" np
        WHERE ${sqlWhere}
      ),
      latest_reminders AS (
        SELECT DISTINCT ON (e."nutriz_profile_id")
          e."nutriz_profile_id", e."decision"
        FROM "communication_consent_events" e
        INNER JOIN scoped_profiles sp ON sp."id" = e."nutriz_profile_id"
        WHERE e."purpose" = 'REMINDERS_WHATSAPP'
          AND e."recorded_at" <= ${now}
        ORDER BY e."nutriz_profile_id", e."sequence" DESC
      ),
      reminder_activity AS (
        SELECT
          COUNT(*) FILTER (WHERE e."decision" = 'GRANTED')::bigint AS "activated",
          COUNT(*) FILTER (WHERE e."decision" = 'WITHDRAWN')::bigint AS "withdrawn"
        FROM "communication_consent_events" e
        INNER JOIN scoped_profiles sp ON sp."id" = e."nutriz_profile_id"
        WHERE e."purpose" = 'REMINDERS_WHATSAPP'
          AND e."recorded_at" >= ${since}
          AND e."recorded_at" <= ${now}
      )
      SELECT
        (
          SELECT COUNT(*) FROM latest_reminders
          WHERE "decision" = 'GRANTED'
        )::bigint AS "reminders_enabled",
        reminder_activity."activated" AS "reminders_activated",
        reminder_activity."withdrawn" AS "reminders_withdrawn",
        (
          SELECT COUNT(*)
          FROM scoped_profiles sp
          WHERE sp."created_at" <= ${retentionSince}
            AND (
              EXISTS (
                SELECT 1 FROM "journey_status_history" h
                WHERE h."nutriz_profile_id" = sp."id"
                  AND h."changed_at" > sp."created_at"
                  AND h."changed_at" <= ${now}
              )
              OR EXISTS (
                SELECT 1 FROM "communication_consent_events" e
                WHERE e."nutriz_profile_id" = sp."id"
                  AND e."purpose" = 'REMINDERS_WHATSAPP'
                  AND e."recorded_at" > sp."created_at"
                  AND e."recorded_at" <= ${now}
              )
            )
        )::bigint AS "retained_profiles"
      FROM reminder_activity
    `),
  ])

  const profileSummary = profileSummaryRows[0]
  const activity = activityRows[0]
  const municipalitiesTotal = municipalitiesByStatusRegion.reduce(
    (total, row) => total + row._count.id,
    0,
  )
  const activeMunicipalities = municipalitiesByStatusRegion.reduce(
    (total, row) => total + (row.isActive ? row._count.id : 0),
    0,
  )
  const regionCounts = new Map<ServiceRegion, number>(
    SERVICE_REGION_VALUES.map((region) => [region as ServiceRegion, 0]),
  )
  for (const row of municipalitiesByStatusRegion) {
    if (row.isActive) {
      regionCounts.set(
        row.region,
        (regionCounts.get(row.region) ?? 0) + row._count.id,
      )
    }
  }

  const stageCounts = new Map<JourneyStatus, number>()
  const nutrizRegionCounts = new Map<NutrizRegionKey, number>()
  for (const row of nutrizDimensions) {
    stageCounts.set(
      row.journeyStatus,
      (stageCounts.get(row.journeyStatus) ?? 0) + row._count.id,
    )
    const region: NutrizRegionKey = row.dashboardRegion ?? 'OUTSIDE_OR_UNMAPPED'
    nutrizRegionCounts.set(
      region,
      (nutrizRegionCounts.get(region) ?? 0) + row._count.id,
    )
  }

  const nutrizTotal = toCount(profileSummary?.total)
  const nutrizCreatedInPeriod = toCount(profileSummary?.created_in_period)
  const referredProfiles = toCount(profileSummary?.referred)
  const referredProfilesInPeriod = toCount(profileSummary?.referred_in_period)
  const retentionCohortProfiles = toCount(profileSummary?.retention_cohort)
  const enabledProfiles = toCount(activity?.reminders_enabled)
  const activatedInPeriod = toCount(activity?.reminders_activated)
  const withdrawnInPeriod = toCount(activity?.reminders_withdrawn)
  const retainedProfiles = toCount(activity?.retained_profiles)
  const contactClicksTotal = contactClicksByChannel.reduce(
    (total, row) => total + row._count.id,
    0,
  )
  const contactClicksCreatedInPeriod = recentContactClicksByChannel.reduce(
    (total, row) => total + row._count.id,
    0,
  )
  const journeyStatusCounts = Object.fromEntries(
    JOURNEY_STATUS_VALUES.map((status) => [
      status,
      stageCounts.get(status as JourneyStatus) ?? 0,
    ]),
  ) as JourneyStatusCounts
  const contactChannelCounts = new Map<ContactChannel, number>(
    contactClicksByChannel.map((row) => [row.channel, row._count.id]),
  )

  return {
    periodDays: DASHBOARD_PERIOD_DAYS,
    municipalities: {
      total: municipalitiesTotal,
      active: activeMunicipalities,
      regionsCovered: [...regionCounts.values()].filter((count) => count > 0)
        .length,
      byStatus: [
        { key: 'ACTIVE', count: activeMunicipalities },
        {
          key: 'INACTIVE',
          count: Math.max(0, municipalitiesTotal - activeMunicipalities),
        },
      ],
      byRegion: SERVICE_REGION_VALUES.map((region) => ({
        key: region,
        count: regionCounts.get(region as ServiceRegion) ?? 0,
      })),
    },
    nutriz: {
      total: nutrizTotal,
      createdInPeriod: nutrizCreatedInPeriod,
      byRegion: NUTRIZ_REGION_KEYS.map((region) => ({
        key: region,
        count: nutrizRegionCounts.get(region) ?? 0,
      })),
      byStage: DASHBOARD_STAGE_VALUES.map((stage) => ({
        key: stage,
        count: stageCounts.get(stage as JourneyStatus) ?? 0,
      })),
    },
    reach: {
      signalsInPeriod: allNutrizCreatedInPeriod + contactClicksCreatedInPeriod,
      registrationsInPeriod: allNutrizCreatedInPeriod,
      contactClicksInPeriod: contactClicksCreatedInPeriod,
    },
    contactClicks: {
      total: contactClicksTotal,
      createdInPeriod: contactClicksCreatedInPeriod,
      byChannel: CONTACT_CHANNEL_KEYS.map((channel) => ({
        key: channel,
        count: contactChannelCounts.get(channel as ContactChannel) ?? 0,
      })),
    },
    journey: buildJourneyFunnel(journeyStatusCounts),
    retention: {
      cohortProfiles: retentionCohortProfiles,
      retainedProfiles,
      rate: percentOf(retainedProfiles, retentionCohortProfiles),
    },
    reminders: {
      eligibleProfiles: nutrizTotal,
      enabledProfiles,
      adoptionRate: percentOf(enabledProfiles, nutrizTotal),
      activatedInPeriod,
      withdrawnInPeriod,
    },
    referrals: {
      attributedProfiles: referredProfiles,
      attributedInPeriod: referredProfilesInPeriod,
    },
  }
}
