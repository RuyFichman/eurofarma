import {
  getChartMonths,
  getRegistrationOrigin,
  ORIGIN_KEYS,
  type DashboardChartsData,
} from '../../admin/dashboard/charts'
import { prisma } from '../prisma'
import type { DashboardNutrizScope } from './dashboard-segmentation'

/** Só agregações; não carrega nomes, contatos ou registros individuais. */
export async function getDashboardCharts(
  now = new Date(),
  nutrizScope: DashboardNutrizScope = { deletedAt: null },
): Promise<DashboardChartsData> {
  const months = getChartMonths(now)
  const counts = await prisma.$transaction(
    months.map(({ start, end }) =>
      prisma.nutrizProfile.count({
        where: {
          AND: [nutrizScope, { createdAt: { gte: start, lt: end } }],
        },
      }),
    ),
  )
  const sources = await prisma.nutrizProfile.groupBy({
    by: ['sourceUtm'],
    where: { AND: [nutrizScope, { createdAt: { lt: now } }] },
    _count: { id: true },
  })
  return {
    months: months.map((month, index) => ({
      key: month.key,
      label: month.label,
      registrations: counts[index] ?? 0,
    })),
    origins: ORIGIN_KEYS.map((key) => ({
      key,
      count: sources.reduce(
        (sum, row) =>
          sum +
          (getRegistrationOrigin(row.sourceUtm) === key ? row._count.id : 0),
        0,
      ),
    })),
  }
}
