import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  profileFindFirst: vi.fn(),
  extractionFindMany: vi.fn(),
  extractionAggregate: vi.fn(),
  extractionCreate: vi.fn(),
  wellbeingFindMany: vi.fn(),
  wellbeingCreate: vi.fn(),
  wellbeingDeleteMany: vi.fn(),
  recognitionFindMany: vi.fn(),
  extractionDeleteMany: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { findFirst: mocks.profileFindFirst },
    extractionLog: {
      findMany: mocks.extractionFindMany,
      aggregate: mocks.extractionAggregate,
      create: mocks.extractionCreate,
      deleteMany: mocks.extractionDeleteMany,
    },
    wellbeingEntry: {
      findMany: mocks.wellbeingFindMany,
      create: mocks.wellbeingCreate,
      deleteMany: mocks.wellbeingDeleteMany,
    },
    nutrizRecognition: { findMany: mocks.recognitionFindMany },
  },
}))

import {
  createNutrizExtractionLog,
  createNutrizWellbeingEntry,
  deleteNutrizExtractionLog,
  deleteNutrizWellbeingEntry,
  getNutrizPersonalAreaData,
} from '../../lib/db/queries/nutriz-personal-area'

const profileId = '11111111-1111-4111-8111-111111111111'
const recordId = '22222222-2222-4222-8222-222222222222'

describe('consulta dos registros pessoais', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.profileFindFirst.mockResolvedValue({ id: profileId })
    mocks.extractionFindMany.mockResolvedValue([])
    mocks.extractionAggregate.mockResolvedValue({
      _sum: { volumeMl: null },
      _count: { _all: 0 },
    })
    mocks.wellbeingFindMany.mockResolvedValue([])
    mocks.recognitionFindMany.mockResolvedValue([])
  })

  it('não consulta nem expõe registros com perfil inválido', async () => {
    await expect(getNutrizPersonalAreaData('não-é-uuid')).resolves.toBeNull()
    expect(mocks.profileFindFirst).not.toHaveBeenCalled()
  })

  it('filtra exclusão pelo id do registro e pelo perfil dono', async () => {
    mocks.extractionDeleteMany.mockResolvedValue({ count: 1 })

    await expect(
      deleteNutrizExtractionLog({
        nutrizProfileId: profileId,
        extractionLogId: recordId,
      }),
    ).resolves.toBe(true)

    expect(mocks.extractionDeleteMany).toHaveBeenCalledWith({
      where: {
        id: recordId,
        nutrizProfileId: profileId,
        nutrizProfile: { deletedAt: null },
      },
    })
  })

  it('registra uma sessao somente no perfil ativo informado', async () => {
    const recordedAt = new Date('2026-09-16T13:30:00.000Z')
    mocks.extractionCreate.mockResolvedValue({ id: recordId })

    await expect(
      createNutrizExtractionLog({
        nutrizProfileId: profileId,
        recordedAt,
        volumeMl: 60,
      }),
    ).resolves.toBe(true)

    expect(mocks.profileFindFirst).toHaveBeenCalledWith({
      where: { id: profileId, deletedAt: null },
      select: { id: true },
    })
    expect(mocks.extractionCreate).toHaveBeenCalledWith({
      data: {
        nutrizProfileId: profileId,
        recordedAt,
        volumeMl: 60,
      },
      select: { id: true },
    })
  })

  it('não registra bem-estar antes de uma doação confirmada', async () => {
    mocks.profileFindFirst.mockResolvedValue({
      id: profileId,
      journeyStatus: 'KIT_DELIVERED',
    })

    await expect(
      createNutrizWellbeingEntry({
        nutrizProfileId: profileId,
        feeling: 'GOOD',
        recordedAt: new Date('2026-09-16T13:30:00.000Z'),
      }),
    ).resolves.toBe(false)

    expect(mocks.wellbeingCreate).not.toHaveBeenCalled()
  })

  it('registra somente uma opção simples após doação confirmada', async () => {
    const recordedAt = new Date('2026-09-16T13:30:00.000Z')
    mocks.profileFindFirst.mockResolvedValue({
      id: profileId,
      journeyStatus: 'DONATION_CONFIRMED',
    })
    mocks.wellbeingCreate.mockResolvedValue({ id: recordId })

    await expect(
      createNutrizWellbeingEntry({
        nutrizProfileId: profileId,
        feeling: 'TIRED',
        recordedAt,
      }),
    ).resolves.toBe(true)

    expect(mocks.wellbeingCreate).toHaveBeenCalledWith({
      data: {
        nutrizProfileId: profileId,
        feeling: 'TIRED',
        recordedAt,
      },
      select: { id: true },
    })
  })

  it('filtra exclusão pelo id do registro de bem-estar e pelo perfil dono', async () => {
    mocks.wellbeingDeleteMany.mockResolvedValue({ count: 1 })

    await expect(
      deleteNutrizWellbeingEntry({
        nutrizProfileId: profileId,
        wellbeingEntryId: recordId,
      }),
    ).resolves.toBe(true)

    expect(mocks.wellbeingDeleteMany).toHaveBeenCalledWith({
      where: {
        id: recordId,
        nutrizProfileId: profileId,
        nutrizProfile: { deletedAt: null },
      },
    })
  })
})
