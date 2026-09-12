import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    serviceMunicipality: {
      findFirst: mocks.findFirst,
    },
  },
}))

import { getActiveServiceMunicipalityByLocation } from '../../lib/db/queries/service-municipalities'

describe('getActiveServiceMunicipalityByLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não consulta a base para UF diferente de SP', async () => {
    await expect(
      getActiveServiceMunicipalityByLocation('Rio de Janeiro', 'RJ'),
    ).resolves.toBeNull()
    expect(mocks.findFirst).not.toHaveBeenCalled()
  })

  it('consulta nome sem diferenciar maiúsculas e somente registros ativos', async () => {
    mocks.findFirst.mockResolvedValue({ id: 'municipality-1' })

    await getActiveServiceMunicipalityByLocation('  São Paulo ', ' sp ')

    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          state: 'SP',
          name: { equals: 'São Paulo', mode: 'insensitive' },
        },
      }),
    )
  })
})
