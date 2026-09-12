import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  municipalityFindMany: vi.fn(),
  nutrizFindMany: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    serviceMunicipality: { findMany: mocks.municipalityFindMany },
    nutrizProfile: { findMany: mocks.nutrizFindMany },
  },
}))

import { buildDashboardNutrizScope } from '../../lib/db/queries/dashboard-segmentation'

describe('recorte de nutrizes do dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('combina sub-região e estágio usando as cidades configuradas', async () => {
    mocks.municipalityFindMany.mockResolvedValue([
      { name: 'Santo André', state: 'SP' },
      { name: 'Diadema', state: 'SP' },
    ])
    mocks.nutrizFindMany.mockResolvedValue([
      {
        id: 'match',
        state: 'sp',
        city: '  Santo Andre ',
        sourceUtm: null,
      },
      { id: 'other', state: 'SP', city: 'Itapevi', sourceUtm: null },
    ])

    const scope = await buildDashboardNutrizScope({
      region: 'ABC',
      stage: 'CONTACTED',
      origin: '',
    })

    expect(mocks.municipalityFindMany).toHaveBeenCalledWith({
      where: { region: 'ABC' },
      select: { name: true, state: true },
    })
    expect(mocks.nutrizFindMany).toHaveBeenCalledWith({
      where: { deletedAt: null, interestStatus: 'CONTACTED' },
      select: { id: true, state: true, city: true, sourceUtm: true },
    })
    expect(scope).toEqual({
      AND: [
        { deletedAt: null, interestStatus: 'CONTACTED' },
        { id: { in: ['match'] } },
      ],
    })
  })

  it('combina origem com o recorte anterior sem inferir UTM ausente', async () => {
    mocks.municipalityFindMany.mockResolvedValue([
      { name: 'Itapevi', state: 'SP' },
    ])
    mocks.nutrizFindMany.mockResolvedValue([
      {
        id: 'wa',
        state: 'SP',
        city: 'Itapevi',
        sourceUtm: { utm_source: 'whatsapp' },
      },
      { id: 'empty', state: 'SP', city: 'Itapevi', sourceUtm: null },
      {
        id: 'site',
        state: 'SP',
        city: 'Itapevi',
        sourceUtm: { utm_source: 'site' },
      },
      {
        id: 'wrong-region',
        state: 'SP',
        city: 'Diadema',
        sourceUtm: { utm_source: 'whatsapp' },
      },
    ])

    const scope = await buildDashboardNutrizScope({
      region: 'WEST',
      stage: 'INTERESTED',
      origin: 'whatsapp',
    })

    expect(mocks.nutrizFindMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ interestStatus: 'INTERESTED' }),
      select: { id: true, state: true, city: true, sourceUtm: true },
    })
    expect(scope).toEqual({
      AND: [
        expect.objectContaining({
          deletedAt: null,
          interestStatus: 'INTERESTED',
        }),
        { id: { in: ['wa'] } },
      ],
    })
  })

  it('produz um recorte vazio quando a região não possui municípios', async () => {
    mocks.municipalityFindMany.mockResolvedValue([])

    await expect(
      buildDashboardNutrizScope({ region: 'NORTH', stage: '', origin: '' }),
    ).resolves.toEqual({ deletedAt: null, id: { in: [] } })
  })
})
