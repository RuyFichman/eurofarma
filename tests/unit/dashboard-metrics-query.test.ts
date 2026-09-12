import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  municipalityCount: vi.fn(),
  municipalityGroupBy: vi.fn(),
  nutrizCount: vi.fn(),
  nutrizGroupBy: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    serviceMunicipality: {
      count: mocks.municipalityCount,
      groupBy: mocks.municipalityGroupBy,
    },
    nutrizProfile: {
      count: mocks.nutrizCount,
      groupBy: mocks.nutrizGroupBy,
    },
    $transaction: mocks.transaction,
  },
}))

import {
  getAdminDashboardMetrics,
  MUNICIPALITY_STATUS_KEYS,
} from '../../lib/db/queries/dashboard-metrics'

describe('métricas administrativas por município', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.municipalityCount.mockReturnValue(undefined)
    mocks.municipalityGroupBy.mockReturnValue(undefined)
    mocks.nutrizCount.mockReturnValue(undefined)
    mocks.nutrizGroupBy.mockReturnValue(undefined)
  })

  it('calcula ativos, inativos e preenche regiões sem registros com zero', async () => {
    mocks.transaction.mockResolvedValue([
      30,
      28,
      [
        { region: 'WEST', _count: { id: 9 } },
        { region: 'ABC', _count: { id: 7 } },
      ],
      3,
      [
        { state: 'SP', _count: { id: 12 } },
        { state: 'RJ', _count: { id: 2 } },
      ],
    ])

    const metrics = await getAdminDashboardMetrics()

    expect(metrics.municipalities.total).toBe(30)
    expect(metrics.municipalities.active).toBe(28)
    expect(metrics.municipalities.regionsCovered).toBe(2)
    expect(metrics.municipalities.byStatus.map((item) => item.key)).toEqual([
      ...MUNICIPALITY_STATUS_KEYS,
    ])
    expect(metrics.municipalities.byStatus).toEqual([
      { key: 'ACTIVE', count: 28 },
      { key: 'INACTIVE', count: 2 },
    ])
    expect(
      metrics.municipalities.byRegion.find((item) => item.key === 'CAPITAL')
        ?.count,
    ).toBe(0)
    expect(
      metrics.municipalities.byRegion.find((item) => item.key === 'WEST')
        ?.count,
    ).toBe(9)
    expect(metrics.nutriz).toEqual({
      total: 14,
      createdInPeriod: 3,
      byState: [
        { state: 'SP', count: 12 },
        { state: 'RJ', count: 2 },
      ],
    })
  })

  it('consulta somente municípios ativos para o recorte regional', async () => {
    mocks.transaction.mockResolvedValue([0, 0, [], 0, []])

    await getAdminDashboardMetrics()

    expect(mocks.municipalityGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    )
  })
})
