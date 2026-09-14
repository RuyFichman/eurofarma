import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { findFirst: prismaMocks.findFirst },
  },
}))

import { getNutrizJourneySnapshot } from '../../lib/db/queries/nutriz-journey'

const nutrizProfileId = '11111111-1111-4111-8111-111111111111'

describe('consulta da jornada para a área da nutriz', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each(['   ', 'identificador-inválido'])(
    'não consulta o banco com identificador inválido: %j',
    async (id) => {
      await expect(getNutrizJourneySnapshot(id)).resolves.toBeNull()
      expect(prismaMocks.findFirst).not.toHaveBeenCalled()
    },
  )

  it('seleciona somente status e datas, sem dados administrativos ou clínicos', async () => {
    const snapshot = {
      journeyStatus: 'FORM_RECEIVED',
      createdAt: new Date('2026-09-01T12:00:00.000Z'),
      journeyHistory: [
        {
          id: 'history-1',
          toStatus: 'FORM_RECEIVED',
          changedAt: new Date('2026-09-02T12:00:00.000Z'),
        },
      ],
    }
    prismaMocks.findFirst.mockResolvedValue(snapshot)

    await expect(getNutrizJourneySnapshot(nutrizProfileId)).resolves.toEqual(
      snapshot,
    )

    expect(prismaMocks.findFirst).toHaveBeenCalledWith({
      where: { id: nutrizProfileId, deletedAt: null },
      select: {
        journeyStatus: true,
        createdAt: true,
        journeyHistory: {
          select: {
            id: true,
            toStatus: true,
            changedAt: true,
          },
          orderBy: [{ changedAt: 'asc' }, { id: 'asc' }],
        },
      },
    })

    const query = JSON.stringify(prismaMocks.findFirst.mock.calls[0]?.[0])
    expect(query).not.toContain('administrativeNote')
    expect(query).not.toContain('changedByUser')
    expect(query).not.toContain('fromStatus')
  })
})
