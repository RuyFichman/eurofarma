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

export const DASHBOARD_PERIOD_DAYS = 30
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

  const [
    municipalitiesTotal,
    activeMunicipalities,
    activeMunicipalitiesByRegion,
    nutrizTotal,
    nutrizCreatedInPeriod,
    nutrizByStage,
    nutrizLocations,
    municipalitiesForRegion,
    allNutrizCreatedInPeriod,
    contactClicksTotal,
    contactClicksCreatedInPeriod,
    contactClicksByChannel,
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
  }
}
