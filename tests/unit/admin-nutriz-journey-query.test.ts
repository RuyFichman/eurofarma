import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { findFirst: prismaMocks.findFirst },
    $transaction: prismaMocks.transaction,
  },
}))

import {
  applyAdminNutrizJourneyStatusTransition,
  getAdminNutrizJourneyDetail,
} from '../../lib/db/queries/admin-nutriz-journey'

function makeClient() {
  const updateMany = vi.fn()
  const findFirst = vi.fn()
  const create = vi.fn()
  const client = {
    nutrizProfile: { updateMany, findFirst },
    journeyStatusHistory: { create },
  } as unknown as Parameters<typeof applyAdminNutrizJourneyStatusTransition>[0]

  return { client, updateMany, findFirst, create }
}

const input = {
  nutrizProfileId: '11111111-1111-4111-8111-111111111111',
  fromStatus: 'REGISTERED' as const,
  toStatus: 'FORM_RECEIVED' as const,
  administrativeNote: 'Atualização recebida da equipe.',
  changedByUserId: '22222222-2222-4222-8222-222222222222',
}

describe('consulta administrativa da jornada', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each(['   ', 'identificador-inválido'])(
    'não consulta quando o identificador é inválido: %j',
    async (id) => {
      await expect(getAdminNutrizJourneyDetail(id)).resolves.toBeNull()
      expect(prismaMocks.findFirst).not.toHaveBeenCalled()
    },
  )

  it('exclui perfis removidos e ordena o histórico mais recente primeiro', async () => {
    prismaMocks.findFirst.mockResolvedValue(null)

    await getAdminNutrizJourneyDetail(input.nutrizProfileId)

    expect(prismaMocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: input.nutrizProfileId, deletedAt: null },
        select: expect.objectContaining({
          journeyStatus: true,
          journeyHistory: expect.objectContaining({
            orderBy: [{ changedAt: 'desc' }, { id: 'desc' }],
          }),
        }),
      }),
    )
  })
})

describe('mutação administrativa da jornada', () => {
  it('atualiza pelo estado esperado e acrescenta o histórico', async () => {
    const { client, updateMany, findFirst, create } = makeClient()
    updateMany.mockResolvedValue({ count: 1 })
    create.mockResolvedValue({ id: 'history-1' })

    await expect(
      applyAdminNutrizJourneyStatusTransition(client, input),
    ).resolves.toEqual({ status: 'UPDATED' })

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: input.nutrizProfileId,
        deletedAt: null,
        journeyStatus: input.fromStatus,
      },
      data: { journeyStatus: input.toStatus },
    })
    expect(create).toHaveBeenCalledWith({
      data: {
        nutrizProfileId: input.nutrizProfileId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        changedByUserId: input.changedByUserId,
        administrativeNote: input.administrativeNote,
      },
    })
    expect(findFirst).not.toHaveBeenCalled()
  })

  it('detecta concorrência e não acrescenta histórico divergente', async () => {
    const { client, updateMany, findFirst, create } = makeClient()
    updateMany.mockResolvedValue({ count: 0 })
    findFirst.mockResolvedValue({ id: input.nutrizProfileId })

    await expect(
      applyAdminNutrizJourneyStatusTransition(client, input),
    ).resolves.toEqual({ status: 'CONFLICT' })
    expect(create).not.toHaveBeenCalled()
  })

  it('diferencia perfil removido ou inexistente de conflito', async () => {
    const { client, updateMany, findFirst, create } = makeClient()
    updateMany.mockResolvedValue({ count: 0 })
    findFirst.mockResolvedValue(null)

    await expect(
      applyAdminNutrizJourneyStatusTransition(client, input),
    ).resolves.toEqual({ status: 'NOT_FOUND' })
    expect(create).not.toHaveBeenCalled()
  })
})
