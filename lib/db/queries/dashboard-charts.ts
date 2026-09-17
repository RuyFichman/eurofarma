import { Prisma } from '@prisma/client'

import {
  getChartMonths,
  ORIGIN_KEYS,
  type RegistrationOrigin,
  type DashboardChartsData,
} from '../../admin/dashboard/charts'
import { prisma } from '../prisma'
import {
  dashboardNutrizSqlWhere,
  type DashboardNutrizScope,
  toDashboardNutrizWhere,
} from './dashboard-segmentation'

type MonthlyRegistrationRow = {
  key: string
  registrations: bigint
}

/** Só agregações; não carrega nomes, contatos ou registros individuais. */
export async function getDashboardCharts(
  now = new Date(),
  nutrizScope: DashboardNutrizScope = {},
): Promise<DashboardChartsData> {
  const months = getChartMonths(now)
  const sqlWhere = dashboardNutrizSqlWhere(nutrizScope)
  const periodRows = Prisma.join(
    months.map(
      (month) =>
        Prisma.sql`(${month.key}::text, ${month.start}::timestamp, ${month.end}::timestamp)`,
    ),
  )
  const [monthlyRows, sources] = await prisma.$transaction([
    prisma.$queryRaw<MonthlyRegistrationRow[]>(Prisma.sql`
      WITH periods("key", "start_at", "end_at") AS (
        VALUES ${periodRows}
      )
      SELECT
        periods."key",
        COUNT(np."id")::bigint AS "registrations"
      FROM periods
      LEFT JOIN "nutriz_profiles" np
        ON np."created_at" >= periods."start_at"
        AND np."created_at" < periods."end_at"
        AND ${sqlWhere}
      GROUP BY periods."key", periods."start_at"
      ORDER BY periods."start_at"
    `),
    prisma.nutrizProfile.groupBy({
      by: ['registrationOrigin'],
      where: {
        AND: [toDashboardNutrizWhere(nutrizScope), { createdAt: { lt: now } }],
      },
      _count: { id: true },
    }),
  ])
  const monthlyCounts = new Map(
    monthlyRows.map((row) => [row.key, Number(row.registrations)]),
  )
  const originCounts = new Map<RegistrationOrigin, number>(
    sources.map((row) => [
      row.registrationOrigin.toLowerCase() as RegistrationOrigin,
      row._count.id,
    ]),
  )

  return {
    months: months.map((month) => ({
      key: month.key,
      label: month.label,
      registrations: monthlyCounts.get(month.key) ?? 0,
    })),
    origins: ORIGIN_KEYS.map((key) => ({
      key,
      count: originCounts.get(key) ?? 0,
    })),
  }
}
