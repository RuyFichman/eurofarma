import { describe, it, expect } from 'vitest'

import {
  parseAdminNutrizFilters,
  type AdminNutrizesSearchParams,
} from '../../lib/admin/nutrizes/filters'
import { getAdminNutrizes } from '../../lib/db/queries/admin-nutrizes'
import { createTestNutrizProfile } from '../helpers/factories'

/**
 * Isolamento pelo prefixo `__test__` do nome, que só as fixtures usam — a
 * consulta filtra por `fullName`, então `q` basta para separar dos cadastros
 * reais. Mesma estratégia de `admin-units.test.ts`.
 */
const TEST_MARKER = '__test__'

function filters(overrides: AdminNutrizesSearchParams = {}) {
  return parseAdminNutrizFilters({ q: TEST_MARKER, ...overrides })
}

describe('getAdminNutrizes', () => {
  it('lista os cadastros de todas as situações', async () => {
    await createTestNutrizProfile({ interestStatus: 'INTERESTED' })
    await createTestNutrizProfile({ interestStatus: 'CONTACTED' })
    await createTestNutrizProfile({ interestStatus: 'DONATED' })

    const { nutrizes, pagination } = await getAdminNutrizes(filters())

    expect(pagination.total).toBe(3)
    expect(new Set(nutrizes.map((n) => n.interestStatus))).toEqual(
      new Set(['INTERESTED', 'CONTACTED', 'DONATED']),
    )
  })

  it('filtra por situação', async () => {
    await createTestNutrizProfile({ interestStatus: 'INTERESTED' })
    await createTestNutrizProfile({ interestStatus: 'DONATED' })

    const { nutrizes } = await getAdminNutrizes(filters({ status: 'DONATED' }))

    expect(nutrizes).toHaveLength(1)
    expect(nutrizes[0]?.interestStatus).toBe('DONATED')
  })

  it('filtra por UF', async () => {
    await createTestNutrizProfile({ state: 'TO' })
    await createTestNutrizProfile({ state: 'SP' })

    const { nutrizes } = await getAdminNutrizes(filters({ state: 'SP' }))

    expect(nutrizes).toHaveLength(1)
    expect(nutrizes[0]?.state).toBe('SP')
  })

  it('busca por nome sem diferenciar maiúsculas', async () => {
    await createTestNutrizProfile({ fullName: '__test__ Mariana Zetalfa' })
    await createTestNutrizProfile({ fullName: '__test__ Outra Pessoa' })

    const { nutrizes } = await getAdminNutrizes(
      parseAdminNutrizFilters({ q: 'zetalfa' }),
    )

    expect(nutrizes).toHaveLength(1)
    expect(nutrizes[0]?.fullName).toContain('Zetalfa')
  })

  /**
   * O comportamento mais importante desta tela: quem pediu exclusão não pode
   * reaparecer no painel. Não é filtro opcional — é parte da consulta.
   */
  it('nunca lista cadastro com exclusão pedida (soft delete)', async () => {
    await createTestNutrizProfile({ fullName: '__test__ Ativa' })
    await createTestNutrizProfile({
      fullName: '__test__ Excluida',
      deletedAt: new Date(),
    })

    const { nutrizes, pagination } = await getAdminNutrizes(filters())

    expect(pagination.total).toBe(1)
    expect(nutrizes[0]?.fullName).toBe('__test__ Ativa')
  })

  it('ordena do cadastro mais recente para o mais antigo', async () => {
    await createTestNutrizProfile({
      fullName: '__test__ Antiga',
      createdAt: new Date('2026-01-01T10:00:00Z'),
    })
    await createTestNutrizProfile({
      fullName: '__test__ Recente',
      createdAt: new Date('2026-08-01T10:00:00Z'),
    })

    const { nutrizes } = await getAdminNutrizes(filters())

    expect(nutrizes[0]?.fullName).toBe('__test__ Recente')
    expect(nutrizes[1]?.fullName).toBe('__test__ Antiga')
  })

  it('não expõe sourceUtm no DTO da listagem', async () => {
    await createTestNutrizProfile({
      sourceUtm: { utm_source: 'instagram', utm_campaign: 'agosto' },
    })

    const { nutrizes } = await getAdminNutrizes(filters())

    expect(nutrizes[0]).toBeDefined()
    expect(nutrizes[0]).not.toHaveProperty('sourceUtm')
  })

  it('devolve lista vazia com total correto em página fora do intervalo', async () => {
    await createTestNutrizProfile()

    const { nutrizes, pagination } = await getAdminNutrizes(
      filters({ page: '99' }),
    )

    expect(nutrizes).toHaveLength(0)
    expect(pagination.total).toBe(1)
    expect(pagination.hasPreviousPage).toBe(true)
    expect(pagination.hasNextPage).toBe(false)
  })
})
