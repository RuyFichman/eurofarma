import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  municipalityGroupBy: vi.fn(),
  nutrizCount: vi.fn(),
  nutrizGroupBy: vi.fn(),
  contactClickGroupBy: vi.fn(),
  queryRaw: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    serviceMunicipality: { groupBy: mocks.municipalityGroupBy },
    nutrizProfile: {
      count: mocks.nutrizCount,
      groupBy: mocks.nutrizGroupBy,
    },
    contactChannelClick: { groupBy: mocks.contactClickGroupBy },
    $queryRaw: mocks.queryRaw,
    $transaction: mocks.transaction,
  },
}))

import {
  getAdminDashboardMetrics,
  MUNICIPALITY_STATUS_KEYS,
} from '../../lib/db/queries/dashboard-metrics'

const EMPTY_TRANSACTION_RESULT = [
  [],
  [],
  [
    {
      total: 0n,
      created_in_period: 0n,
      referred: 0n,
      referred_in_period: 0n,
      retention_cohort: 0n,
    },
  ],
  0,
  [],
  [],
  [
    {
      reminders_enabled: 0n,
      reminders_activated: 0n,
      reminders_withdrawn: 0n,
      retained_profiles: 0n,
    },
  ],
] as const

describe('métricas administrativas otimizadas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.municipalityGroupBy.mockReturnValue(undefined)
    mocks.nutrizCount.mockReturnValue(undefined)
    mocks.nutrizGroupBy.mockReturnValue(undefined)
    mocks.contactClickGroupBy.mockReturnValue(undefined)
    mocks.queryRaw.mockReturnValue(undefined)
    mocks.transaction.mockResolvedValue(EMPTY_TRANSACTION_RESULT)
  })

  it('deriva totais e distribuições de agregações compactas', async () => {
    mocks.transaction.mockResolvedValue([
      [
        { isActive: true, region: 'WEST', _count: { id: 21 } },
        { isActive: true, region: 'ABC', _count: { id: 7 } },
        { isActive: false, region: 'CAPITAL', _count: { id: 2 } },
      ],
      [
        {
          journeyStatus: 'REGISTERED',
          dashboardRegion: 'WEST',
          _count: { id: 4 },
        },
        {
          journeyStatus: 'FORM_RECEIVED',
          dashboardRegion: 'ABC',
          _count: { id: 3 },
        },
        {
          journeyStatus: 'EXAM_SCHEDULED',
          dashboardRegion: null,
          _count: { id: 2 },
        },
        {
          journeyStatus: 'AWAITING_RESULT',
          dashboardRegion: 'WEST',
          _count: { id: 1 },
        },
        {
          journeyStatus: 'ELIGIBLE',
          dashboardRegion: 'WEST',
          _count: { id: 1 },
        },
        {
          journeyStatus: 'NOT_ELIGIBLE',
          dashboardRegion: null,
          _count: { id: 1 },
        },
        {
          journeyStatus: 'KIT_DELIVERED',
          dashboardRegion: 'ABC',
          _count: { id: 1 },
        },
        {
          journeyStatus: 'RECURRING_DONATION_ELIGIBLE',
          dashboardRegion: 'WEST',
          _count: { id: 1 },
        },
      ],
      [
        {
          total: 14n,
          created_in_period: 3n,
          referred: 4n,
          referred_in_period: 2n,
          retention_cohort: 0n,
        },
      ],
      5,
      [
        { channel: 'WHATSAPP', _count: { id: 15 } },
        { channel: 'PHONE', _count: { id: 6 } },
      ],
      [
        { channel: 'WHATSAPP', _count: { id: 4 } },
        { channel: 'PHONE', _count: { id: 3 } },
      ],
      [
        {
          reminders_enabled: 0n,
          reminders_activated: 0n,
          reminders_withdrawn: 0n,
          retained_profiles: 0n,
        },
      ],
    ])

    const metrics = await getAdminDashboardMetrics()

    expect(metrics.municipalities).toMatchObject({
      total: 30,
      active: 28,
      regionsCovered: 2,
      byStatus: [
        { key: 'ACTIVE', count: 28 },
        { key: 'INACTIVE', count: 2 },
      ],
    })
    expect(metrics.municipalities.byStatus.map((item) => item.key)).toEqual([
      ...MUNICIPALITY_STATUS_KEYS,
    ])
    expect(metrics.nutriz.total).toBe(14)
    expect(metrics.nutriz.createdInPeriod).toBe(3)
    expect(metrics.nutriz.byRegion).toEqual([
      { key: 'CAPITAL', count: 0 },
      { key: 'WEST', count: 7 },
      { key: 'SOUTHWEST', count: 0 },
      { key: 'ABC', count: 4 },
      { key: 'NORTH', count: 0 },
      { key: 'EAST_ALTO_TIETE', count: 0 },
      { key: 'OUTSIDE_OR_UNMAPPED', count: 3 },
    ])
    expect(metrics.reach).toEqual({
      signalsInPeriod: 12,
      registrationsInPeriod: 5,
      contactClicksInPeriod: 7,
    })
    expect(metrics.referrals).toEqual({
      attributedProfiles: 4,
      attributedInPeriod: 2,
    })
    expect(metrics.contactClicks).toEqual({
      total: 21,
      createdInPeriod: 7,
      byChannel: [
        { key: 'WHATSAPP', count: 15 },
        { key: 'PHONE', count: 6 },
      ],
    })
    expect(metrics.journey.overallConversion).toBe(7)
  })

  it('recebe retenção e adesão já agregadas pelo banco', async () => {
    mocks.transaction.mockResolvedValue([
      [],
      [],
      [
        {
          total: 3n,
          created_in_period: 0n,
          referred: 1n,
          referred_in_period: 1n,
          retention_cohort: 2n,
        },
      ],
      0,
      [],
      [],
      [
        {
          reminders_enabled: 2n,
          reminders_activated: 2n,
          reminders_withdrawn: 2n,
          retained_profiles: 2n,
        },
      ],
    ])

    const metrics = await getAdminDashboardMetrics(
      {},
      new Date('2026-09-16T12:00:00.000Z'),
    )

    expect(metrics.retention).toEqual({
      cohortProfiles: 2,
      retainedProfiles: 2,
      rate: 100,
    })
    expect(metrics.reminders).toEqual({
      eligibleProfiles: 3,
      enabledProfiles: 2,
      adoptionRate: 67,
      activatedInPeriod: 2,
      withdrawnInPeriod: 2,
    })
  })

  it('reduz o dashboard a sete operações agregadas na mesma transação', async () => {
    await getAdminDashboardMetrics()

    expect(mocks.transaction).toHaveBeenCalledOnce()
    expect(mocks.transaction.mock.calls[0]?.[0]).toHaveLength(7)
    expect(mocks.municipalityGroupBy).toHaveBeenCalledWith({
      by: ['isActive', 'region'],
      _count: { id: true },
    })
    expect(mocks.nutrizGroupBy).toHaveBeenCalledWith({
      by: ['journeyStatus', 'dashboardRegion'],
      where: { deletedAt: null },
      _count: { id: true },
    })
    expect(mocks.queryRaw).toHaveBeenCalledTimes(2)
  })

  it('aplica o mesmo recorte indexável aos grupos e agregações SQL', async () => {
    const scope = {
      stage: 'KIT_DELIVERED',
      region: 'ABC',
      origin: 'WEB',
    } as const

    await getAdminDashboardMetrics(scope)

    expect(mocks.nutrizGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          journeyStatus: 'KIT_DELIVERED',
          dashboardRegion: 'ABC',
          registrationOrigin: 'WEB',
        },
      }),
    )
    for (const [query] of mocks.queryRaw.mock.calls) {
      expect(query.values).toEqual(
        expect.arrayContaining(['KIT_DELIVERED', 'ABC', 'WEB']),
      )
    }
    expect(mocks.contactClickGroupBy).toHaveBeenCalledWith({
      by: ['channel'],
      _count: { id: true },
    })
  })
})
