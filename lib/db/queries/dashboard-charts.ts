import { prisma } from '@/lib/db/prisma'
import {
  getChartMonths,
  getRegistrationOrigin,
  ORIGIN_KEYS,
  type DashboardChartsData,
} from '@/lib/admin/dashboard/charts'

/** Só agregações; não carrega nomes, contatos ou registros individuais. */
export async function getDashboardCharts(
  now = new Date(),
): Promise<DashboardChartsData> {
  const months = getChartMonths(now)
  const counts = await prisma.$transaction(
    months.flatMap(({ start, end }) => [
      prisma.nutrizProfile.count({
        where: { deletedAt: null, createdAt: { gte: start, lt: end } },
      }),
      prisma.appointment.count({
        where: {
          nutrizProfile: { deletedAt: null },
          status: { in: ['DECLARED', 'COMPLETED', 'CANCELLED'] },
          scheduledAt: { not: null },
          declaredAt: { gte: start, lt: end },
        },
      }),
    ]),
  )
  const sources = await prisma.nutrizProfile.groupBy({
    by: ['sourceUtm'],
    where: { deletedAt: null, createdAt: { lt: now } },
    _count: { id: true },
  })
  return {
    months: months.map((month, index) => ({
      key: month.key,
      label: month.label,
      registrations: counts[index * 2] ?? 0,
      appointments: counts[index * 2 + 1] ?? 0,
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
