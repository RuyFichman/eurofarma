import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  profileFindFirst: vi.fn(),
  extractionFindMany: vi.fn(),
  extractionAggregate: vi.fn(),
  wellbeingFindMany: vi.fn(),
  contentFindMany: vi.fn(),
  extractionDeleteMany: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { findFirst: mocks.profileFindFirst },
    extractionLog: {
      findMany: mocks.extractionFindMany,
      aggregate: mocks.extractionAggregate,
      deleteMany: mocks.extractionDeleteMany,
    },
    wellbeingEntry: { findMany: mocks.wellbeingFindMany },
    educationalContent: { findMany: mocks.contentFindMany },
  },
}))

import {
  deleteNutrizExtractionLog,
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
    mocks.contentFindMany.mockResolvedValue([])
  })

  it('não consulta nem expõe registros com perfil inválido', async () => {
    await expect(
      getNutrizPersonalAreaData('não-é-uuid', 'REGISTERED'),
    ).resolves.toBeNull()
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
})
