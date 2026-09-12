import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  municipalityCount: vi.fn(),
  municipalityGroupBy: vi.fn(),
  municipalityFindMany: vi.fn(),
  nutrizCount: vi.fn(),
  nutrizGroupBy: vi.fn(),
  nutrizFindMany: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    serviceMunicipality: {
      count: mocks.municipalityCount,
      groupBy: mocks.municipalityGroupBy,
      findMany: mocks.municipalityFindMany,
    },
    nutrizProfile: {
      count: mocks.nutrizCount,
      groupBy: mocks.nutrizGroupBy,
      findMany: mocks.nutrizFindMany,
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
    mocks.municipalityFindMany.mockReturnValue(undefined)
    mocks.nutrizCount.mockReturnValue(undefined)
    mocks.nutrizGroupBy.mockReturnValue(undefined)
    mocks.nutrizFindMany.mockReturnValue(undefined)
  })

  it('calcula ativos, inativos e preenche regiões sem registros com zero', async () => {
    mocks.transaction.mockResolvedValue([
      30,
      28,
      [
        { region: 'WEST', _count: { id: 9 } },
        { region: 'ABC', _count: { id: 7 } },
      ],
      14,
      3,
      [
        { interestStatus: 'INTERESTED', _count: { id: 8 } },
        { interestStatus: 'CONTACTED', _count: { id: 3 } },
        { interestStatus: 'DONATED', _count: { id: 2 } },
        { interestStatus: 'UNKNOWN', _count: { id: 1 } },
      ],
      [
        { state: 'SP', city: 'Itapevi' },
        { state: 'SP', city: 'Santo André' },
        { state: 'RJ', city: 'Niterói' },
      ],
      [
        { state: 'SP', name: 'Itapevi', region: 'WEST' },
        { state: 'SP', name: 'Santo Andre', region: 'ABC' },
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
      byRegion: [
        { key: 'CAPITAL', count: 0 },
        { key: 'WEST', count: 1 },
        { key: 'SOUTHWEST', count: 0 },
        { key: 'ABC', count: 1 },
        { key: 'NORTH', count: 0 },
        { key: 'EAST_ALTO_TIETE', count: 0 },
        { key: 'OUTSIDE_OR_UNMAPPED', count: 1 },
      ],
      byStage: [
        { key: 'INTERESTED', count: 8 },
        { key: 'CONTACTED', count: 3 },
        { key: 'DONATED', count: 2 },
        { key: 'UNKNOWN', count: 1 },
      ],
    })
  })

  it('consulta somente municípios ativos para o recorte regional', async () => {
    mocks.transaction.mockResolvedValue([0, 0, [], 0, 0, [], [], []])

    await getAdminDashboardMetrics()

    expect(mocks.municipalityGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    )
  })

  it('aplica o mesmo recorte aos indicadores e distribuições de nutrizes', async () => {
    const scope = { interestStatus: 'DONATED', deletedAt: null } as const
    mocks.transaction.mockResolvedValue([0, 0, [], 2, 1, [], [], []])

    await getAdminDashboardMetrics(scope)

    expect(mocks.nutrizCount).toHaveBeenCalledWith({ where: scope })
    expect(mocks.nutrizGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: scope }),
    )
    expect(mocks.nutrizFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: scope }),
    )
  })
})
