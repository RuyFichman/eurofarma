import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  unstableCache: vi.fn((callback: () => Promise<unknown>) => {
    let cached: Promise<unknown> | undefined
    return () => {
      cached ??= callback()
      return cached
    }
  }),
}))

vi.mock('next/cache', () => ({
  unstable_cache: mocks.unstableCache,
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    serviceMunicipality: {
      findMany: mocks.findMany,
    },
  },
}))

const OSASCO = {
  id: 'municipality-1',
  slug: 'osasco',
  name: 'Osasco',
  state: 'SP',
  country: 'Brazil',
  region: 'WEST',
}

const SAO_PAULO = {
  id: 'municipality-2',
  slug: 'sao-paulo',
  name: 'São Paulo',
  state: 'SP',
  country: 'Brazil',
  region: 'CAPITAL',
}

async function loadQueries() {
  return import('../../lib/db/queries/service-municipalities')
}

describe('cache público de municípios atendidos', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mocks.findMany.mockResolvedValue([SAO_PAULO, OSASCO])
  })

  it('configura uma hora de cache e uma tag para invalidação administrativa', async () => {
    const queries = await loadQueries()

    expect(mocks.unstableCache).toHaveBeenCalledWith(
      expect.any(Function),
      ['active-service-municipalities-v1'],
      {
        revalidate: 3600,
        tags: [queries.SERVICE_MUNICIPALITIES_CACHE_TAG],
      },
    )
  })

  it('reutiliza uma única leitura para lista, elegibilidade e estatísticas', async () => {
    const {
      getActiveServiceMunicipalities,
      getActiveServiceMunicipalityByLocation,
      getPublicCoverageStats,
    } = await loadQueries()

    await expect(getActiveServiceMunicipalities()).resolves.toEqual([
      OSASCO,
      SAO_PAULO,
    ])
    await expect(
      getActiveServiceMunicipalityByLocation('  são paulo ', ' sp '),
    ).resolves.toEqual(SAO_PAULO)
    await expect(getPublicCoverageStats()).resolves.toEqual({
      activeMunicipalities: 2,
      regionsCovered: 2,
    })

    expect(mocks.findMany).toHaveBeenCalledTimes(1)
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    )
  })

  it('não consulta a lista para UF diferente de SP', async () => {
    const { getActiveServiceMunicipalityByLocation } = await loadQueries()

    await expect(
      getActiveServiceMunicipalityByLocation('Rio de Janeiro', 'RJ'),
    ).resolves.toBeNull()
    expect(mocks.findMany).not.toHaveBeenCalled()
  })
})
