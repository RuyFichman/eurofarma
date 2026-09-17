import type {
  ContactChannel,
  JourneyStatus,
  ServiceRegion,
} from '@prisma/client'

import {
  buildDashboardLocationKey,
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
import type { DashboardNutrizScope } from './dashboard-segmentation'
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

export async function getAdminDashboardMetrics(
  nutrizScope: DashboardNutrizScope = { deletedAt: null },
  now = new Date(),
): Promise<AdminDashboardMetrics> {
  const since = subtractDays(now, DASHBOARD_PERIOD_DAYS)
  const retentionSince = subtractDays(now, DASHBOARD_RETENTION_DAYS)

  const [
    municipalitiesTotal,
    activeMunicipalities,
    activeMunicipalitiesByRegion,
    nutrizTotal,
    nutrizCreatedInPeriod,
    referredProfiles,
    referredProfilesInPeriod,
    nutrizByStage,
    nutrizLocations,
    municipalitiesForRegion,
    allNutrizCreatedInPeriod,
    contactClicksTotal,
    contactClicksCreatedInPeriod,
    contactClicksByChannel,
    retentionCohortProfiles,
  ] = await prisma.$transaction([
    prisma.serviceMunicipality.count(),
    prisma.serviceMunicipality.count({ where: { isActive: true } }),
    prisma.serviceMunicipality.groupBy({
      by: ['region'],
      where: { isActive: true },
      _count: { id: true },
    }),
    prisma.nutrizProfile.count({ where: nutrizScope }),
    prisma.nutrizProfile.count({
      where: { AND: [nutrizScope, { createdAt: { gte: since, lte: now } }] },
    }),
    prisma.nutrizProfile.count({
      where: {
        AND: [nutrizScope, { referredByReferralLinkId: { not: null } }],
      },
    }),
    prisma.nutrizProfile.count({
      where: {
        AND: [
          nutrizScope,
          { referredByReferralLinkId: { not: null } },
          { createdAt: { gte: since, lte: now } },
        ],
      },
    }),
    prisma.nutrizProfile.groupBy({
      by: ['journeyStatus'],
      where: nutrizScope,
      _count: { id: true },
    }),
    prisma.nutrizProfile.findMany({
      where: nutrizScope,
      select: { state: true, city: true },
    }),
    prisma.serviceMunicipality.findMany({
      select: { state: true, name: true, region: true },
    }),
    prisma.nutrizProfile.count({
      where: { deletedAt: null, createdAt: { gte: since, lte: now } },
    }),
    prisma.contactChannelClick.count(),
    prisma.contactChannelClick.count({
      where: { createdAt: { gte: since, lte: now } },
    }),
    prisma.contactChannelClick.groupBy({
      by: ['channel'],
      _count: { id: true },
    }),
    prisma.nutrizProfile.count({
      where: {
        AND: [nutrizScope, { createdAt: { lte: retentionSince } }],
      },
    }),
  ])

  const [reminderConsentEvents, journeyHistoryEvents] = await Promise.all([
    prisma.communicationConsentEvent.findMany({
      where: {
        purpose: 'REMINDERS_WHATSAPP',
        nutrizProfile: nutrizScope,
      },
      select: {
        nutrizProfileId: true,
        decision: true,
        sequence: true,
        recordedAt: true,
        nutrizProfile: { select: { createdAt: true } },
      },
      orderBy: { sequence: 'desc' },
    }),
    prisma.journeyStatusHistory.findMany({
      where: { nutrizProfile: nutrizScope, changedAt: { lte: now } },
      select: {
        nutrizProfileId: true,
        changedAt: true,
        nutrizProfile: { select: { createdAt: true } },
      },
    }),
  ])

  const regionCounts = new Map<ServiceRegion, number>(
    activeMunicipalitiesByRegion.map((row) => [row.region, row._count.id]),
  )
  const stageCounts = new Map<JourneyStatus, number>(
    nutrizByStage.map((row) => [row.journeyStatus, row._count.id]),
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
  const regionByLocation = new Map<string, ServiceRegion>(
    municipalitiesForRegion.map((municipality) => [
      buildDashboardLocationKey(municipality.state, municipality.name),
      municipality.region,
    ]),
  )
  const nutrizRegionCounts = new Map<NutrizRegionKey, number>()

  for (const nutriz of nutrizLocations) {
    const region = regionByLocation.get(
      buildDashboardLocationKey(nutriz.state, nutriz.city),
    )
    const key: NutrizRegionKey = region ?? 'OUTSIDE_OR_UNMAPPED'
    nutrizRegionCounts.set(key, (nutrizRegionCounts.get(key) ?? 0) + 1)
  }

  const latestReminderDecision = new Map<
    string,
    (typeof reminderConsentEvents)[number]['decision']
  >()
  let activatedInPeriod = 0
  let withdrawnInPeriod = 0

  for (const event of reminderConsentEvents) {
    if (!latestReminderDecision.has(event.nutrizProfileId)) {
      latestReminderDecision.set(event.nutrizProfileId, event.decision)
    }
    if (event.recordedAt >= since && event.recordedAt <= now) {
      if (event.decision === 'GRANTED') activatedInPeriod += 1
      if (event.decision === 'WITHDRAWN') withdrawnInPeriod += 1
    }
  }

  const enabledProfiles = [...latestReminderDecision.values()].filter(
    (decision) => decision === 'GRANTED',
  ).length
  const retainedProfileIds = new Set<string>()

  for (const event of journeyHistoryEvents) {
    if (
      event.nutrizProfile.createdAt <= retentionSince &&
      event.changedAt > event.nutrizProfile.createdAt
    ) {
      retainedProfileIds.add(event.nutrizProfileId)
    }
  }

  for (const event of reminderConsentEvents) {
    if (
      event.nutrizProfile.createdAt <= retentionSince &&
      event.recordedAt > event.nutrizProfile.createdAt
    ) {
      retainedProfileIds.add(event.nutrizProfileId)
    }
  }

  return {
    periodDays: DASHBOARD_PERIOD_DAYS,
    municipalities: {
      total: municipalitiesTotal,
      active: activeMunicipalities,
      regionsCovered: activeMunicipalitiesByRegion.length,
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
      retainedProfiles: retainedProfileIds.size,
      rate: percentOf(retainedProfileIds.size, retentionCohortProfiles),
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
