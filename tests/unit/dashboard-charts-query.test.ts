import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  groupBy: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: {
      count: mocks.count,
      groupBy: mocks.groupBy,
    },
    $transaction: mocks.transaction,
  },
}))

import { getDashboardCharts } from '../../lib/db/queries/dashboard-charts'

describe('consultas dos gráficos segmentados', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.count.mockReturnValue(undefined)
    mocks.transaction.mockResolvedValue([0, 1, 2, 3, 4, 5])
    mocks.groupBy.mockResolvedValue([
      { sourceUtm: { utm_source: 'whatsapp' }, _count: { id: 2 } },
      { sourceUtm: null, _count: { id: 1 } },
    ])
  })

  it('aplica o mesmo recorte a todos os meses e à origem', async () => {
    const now = new Date('2026-09-12T12:00:00Z')
    const scope = { interestStatus: 'DONATED', deletedAt: null } as const

    const charts = await getDashboardCharts(now, scope)

    expect(mocks.count).toHaveBeenCalledTimes(6)
    expect(mocks.count).toHaveBeenCalledWith({
      where: {
        AND: [
          scope,
          { createdAt: expect.objectContaining({ gte: expect.any(Date) }) },
        ],
      },
    })
    expect(mocks.groupBy).toHaveBeenCalledWith({
      by: ['sourceUtm'],
      where: { AND: [scope, { createdAt: { lt: now } }] },
      _count: { id: true },
    })
    expect(charts.months.map((month) => month.registrations)).toEqual([
      0, 1, 2, 3, 4, 5,
    ])
    expect(charts.origins).toEqual([
      { key: 'whatsapp', count: 2 },
      { key: 'web', count: 0 },
      { key: 'other', count: 0 },
      { key: 'unknown', count: 1 },
    ])
  })
})
