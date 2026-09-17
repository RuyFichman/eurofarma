import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  groupBy: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { groupBy: mocks.groupBy },
    $queryRaw: mocks.queryRaw,
    $transaction: mocks.transaction,
  },
}))

import { getDashboardCharts } from '../../lib/db/queries/dashboard-charts'

describe('consultas dos gráficos segmentados', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.queryRaw.mockReturnValue(undefined)
    mocks.groupBy.mockReturnValue(undefined)
    mocks.transaction.mockResolvedValue([
      [
        { key: '2026-04', registrations: 0n },
        { key: '2026-05', registrations: 1n },
        { key: '2026-06', registrations: 2n },
        { key: '2026-07', registrations: 3n },
        { key: '2026-08', registrations: 4n },
        { key: '2026-09', registrations: 5n },
      ],
      [
        { registrationOrigin: 'WHATSAPP', _count: { id: 2 } },
        { registrationOrigin: 'UNKNOWN', _count: { id: 1 } },
      ],
    ])
  })

  it('agrega seis meses em uma consulta e agrupa pela origem materializada', async () => {
    const now = new Date('2026-09-12T12:00:00Z')
    const scope = {
      stage: 'DONATION_CONFIRMED',
      region: 'WEST',
      origin: 'WHATSAPP',
    } as const

    const charts = await getDashboardCharts(now, scope)

    expect(mocks.queryRaw).toHaveBeenCalledOnce()
    expect(mocks.groupBy).toHaveBeenCalledWith({
      by: ['registrationOrigin'],
      where: {
        AND: [
          {
            deletedAt: null,
            journeyStatus: 'DONATION_CONFIRMED',
            dashboardRegion: 'WEST',
            registrationOrigin: 'WHATSAPP',
          },
          { createdAt: { lt: now } },
        ],
      },
      _count: { id: true },
    })
    expect(mocks.transaction).toHaveBeenCalledOnce()
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
