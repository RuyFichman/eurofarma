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
  const historyCreate = vi.fn()
  const consentFindFirst = vi.fn()
  const outboxCreate = vi.fn()
  const client = {
    nutrizProfile: { updateMany, findFirst },
    journeyStatusHistory: { create: historyCreate },
    communicationConsentEvent: { findFirst: consentFindFirst },
    notificationOutbox: { create: outboxCreate },
  } as unknown as Parameters<typeof applyAdminNutrizJourneyStatusTransition>[0]

  return {
    client,
    updateMany,
    findFirst,
    historyCreate,
    consentFindFirst,
    outboxCreate,
  }
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
    const {
      client,
      updateMany,
      findFirst,
      historyCreate,
      consentFindFirst,
      outboxCreate,
    } = makeClient()
    updateMany.mockResolvedValue({ count: 1 })
    historyCreate.mockResolvedValue({ id: 'history-1' })
    consentFindFirst.mockResolvedValue({
      id: 'consent-1',
      decision: 'GRANTED',
    })

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
    expect(historyCreate).toHaveBeenCalledWith({
      data: {
        nutrizProfileId: input.nutrizProfileId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        changedByUserId: input.changedByUserId,
        administrativeNote: input.administrativeNote,
      },
      select: { id: true },
    })
    expect(outboxCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        idempotencyKey: 'journey-status:history-1',
        kind: 'JOURNEY_STATUS_CHANGED',
        status: 'PENDING',
        consentEventId: 'consent-1',
      }),
    })
    expect(findFirst).not.toHaveBeenCalled()
  })

  it('audita como suprimido quando o opt-in específico foi retirado', async () => {
    const {
      client,
      updateMany,
      historyCreate,
      consentFindFirst,
      outboxCreate,
    } = makeClient()
    updateMany.mockResolvedValue({ count: 1 })
    historyCreate.mockResolvedValue({ id: 'history-2' })
    consentFindFirst.mockResolvedValue({
      id: 'consent-withdrawn-1',
      decision: 'WITHDRAWN',
    })

    await applyAdminNutrizJourneyStatusTransition(client, input)

    expect(outboxCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'SUPPRESSED',
        consentEventId: 'consent-withdrawn-1',
        lastErrorCode: 'CONSENT_NOT_GRANTED',
      }),
    })
  })

  it('detecta concorrência e não acrescenta histórico divergente', async () => {
    const { client, updateMany, findFirst, historyCreate, outboxCreate } =
      makeClient()
    updateMany.mockResolvedValue({ count: 0 })
    findFirst.mockResolvedValue({ id: input.nutrizProfileId })

    await expect(
      applyAdminNutrizJourneyStatusTransition(client, input),
    ).resolves.toEqual({ status: 'CONFLICT' })
    expect(historyCreate).not.toHaveBeenCalled()
    expect(outboxCreate).not.toHaveBeenCalled()
  })

  it('diferencia perfil removido ou inexistente de conflito', async () => {
    const { client, updateMany, findFirst, historyCreate, outboxCreate } =
      makeClient()
    updateMany.mockResolvedValue({ count: 0 })
    findFirst.mockResolvedValue(null)

    await expect(
      applyAdminNutrizJourneyStatusTransition(client, input),
    ).resolves.toEqual({ status: 'NOT_FOUND' })
    expect(historyCreate).not.toHaveBeenCalled()
    expect(outboxCreate).not.toHaveBeenCalled()
  })
})
