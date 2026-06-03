import { describe, it, expect, beforeAll } from 'vitest'

import { prisma } from '../../lib/db/prisma'
import {
  searchPublicUnits,
  type PublicUnitSearchResult,
} from '../../lib/db/queries/units'
import type { UnitSearchParams } from '../../lib/validators/unit-search'
import { createTestUnit, createTestUnits } from '../helpers/factories'

// Isolamento: UFs que o seed real NÃO usa (seed = SP/RJ), contagens exatas.
function params(overrides: Partial<UnitSearchParams> = {}): UnitSearchParams {
  return {
    state: 'TO',
    city: null,
    neighborhood: null,
    type: null,
    hasWhatsapp: null,
    page: 1,
    limit: 10,
    ...overrides,
  }
}

describe('searchPublicUnits', () => {
  beforeAll(async () => {
    await prisma.unit.deleteMany({
      where: { slug: { startsWith: '__test__' } },
    })
  })

  it('retorna unidades públicas com meta correto', async () => {
    await createTestUnits(3, () => ({ addressState: 'TO' }))

    const result = await searchPublicUnits(params())

    expect(result.units).toHaveLength(3)
    expect(result.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 3,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })

  it('mapeia para o formato público (snake_case, sem campos admin)', async () => {
    await createTestUnit({
      addressState: 'TO',
      type: 'COLLECTION_POINT',
      adminNotes: 'segredo interno',
      email: 'interno@exemplo.com',
      lat: -10,
      lng: -48,
    })

    const result = await searchPublicUnits(params())
    const unit = result.units[0]

    expect(unit).toBeDefined()
    expect(unit?.type).toBe('collection_point')
    expect(unit?.address).toEqual({
      neighborhood: 'Bairro Teste',
      city: 'Cidade Teste',
      state: 'TO',
    })
    // Garante que nenhum campo admin/PII vazou no objeto público.
    const keys = Object.keys(unit ?? {})
    expect(keys).not.toContain('adminNotes')
    expect(keys).not.toContain('email')
    expect(keys).not.toContain('lat')
    expect(keys).not.toContain('lng')
  })

  it('pagina e calcula totalPages / hasNextPage', async () => {
    await createTestUnits(25, () => ({ addressState: 'TO' }))

    const page1 = await searchPublicUnits(params({ page: 1, limit: 10 }))
    expect(page1.units).toHaveLength(10)
    expect(page1.meta.totalPages).toBe(3)
    expect(page1.meta.hasNextPage).toBe(true)
    expect(page1.meta.hasPreviousPage).toBe(false)

    const page3 = await searchPublicUnits(params({ page: 3, limit: 10 }))
    expect(page3.units).toHaveLength(5)
    expect(page3.meta.hasNextPage).toBe(false)
    expect(page3.meta.hasPreviousPage).toBe(true)
  })

  it('filtra por tipo público', async () => {
    await createTestUnit({ addressState: 'TO', type: 'MILK_BANK' })
    await createTestUnit({ addressState: 'TO', type: 'COLLECTION_POINT' })

    const result = await searchPublicUnits(params({ type: 'milk_bank' }))

    expect(result.meta.total).toBe(1)
    expect(result.units[0]?.type).toBe('milk_bank')
  })

  it('filtra por hasWhatsapp e expõe hasWhatsapp no contato', async () => {
    await createTestUnits(2, () => ({
      addressState: 'TO',
      whatsapp: '5511999998888',
    }))
    await createTestUnit({ addressState: 'TO', whatsapp: null })

    const result = await searchPublicUnits(params({ hasWhatsapp: true }))

    expect(result.meta.total).toBe(2)
    expect(result.units.every((u) => u.contact.hasWhatsapp)).toBe(true)
  })

  it('UF válida sem unidades retorna lista vazia (nunca erro)', async () => {
    const result: PublicUnitSearchResult = await searchPublicUnits(
      params({ state: 'AC' }),
    )

    expect(result.units).toEqual([])
    expect(result.meta.total).toBe(0)
    expect(result.meta.totalPages).toBe(0)
  })
})
