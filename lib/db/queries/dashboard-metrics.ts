import type { ServiceRegion } from '@prisma/client'

import {
  SERVICE_REGION_VALUES,
  type ServiceRegionValue,
} from '../../constants/service-municipalities'
import { prisma } from '../prisma'

export const DASHBOARD_PERIOD_DAYS = 30
export const MUNICIPALITY_STATUS_KEYS = ['ACTIVE', 'INACTIVE'] as const

export type MunicipalityStatusKey = (typeof MUNICIPALITY_STATUS_KEYS)[number]

export type DashboardBreakdown<K extends string> = {
  key: K
  count: number
}

export type DashboardStateCount = {
  state: string
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
    byState: DashboardStateCount[]
  }
}

function subtractDays(from: Date, days: number): Date {
  const result = new Date(from)
  result.setDate(result.getDate() - days)
  return result
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const since = subtractDays(new Date(), DASHBOARD_PERIOD_DAYS)

  const [
    municipalitiesTotal,
    activeMunicipalities,
    activeMunicipalitiesByRegion,
    nutrizCreatedInPeriod,
    nutrizByState,
  ] = await prisma.$transaction([
    prisma.serviceMunicipality.count(),
    prisma.serviceMunicipality.count({ where: { isActive: true } }),
    prisma.serviceMunicipality.groupBy({
      by: ['region'],
      where: { isActive: true },
      _count: { id: true },
    }),
    prisma.nutrizProfile.count({
      where: { deletedAt: null, createdAt: { gte: since } },
    }),
    prisma.nutrizProfile.groupBy({
      by: ['state'],
      where: { deletedAt: null },
      _count: { id: true },
      orderBy: [{ _count: { id: 'desc' } }, { state: 'asc' }],
    }),
  ])

  const regionCounts = new Map<ServiceRegion, number>(
    activeMunicipalitiesByRegion.map((row) => [row.region, row._count.id]),
  )
  const nutrizTotal = nutrizByState.reduce((sum, row) => sum + row._count.id, 0)

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
      byState: nutrizByState.map((row) => ({
        state: row.state,
        count: row._count.id,
      })),
    },
  }
}
