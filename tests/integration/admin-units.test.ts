import { describe, it, expect } from 'vitest'

import { parseAdminUnitFilters } from '../../lib/admin/units/filters'
import { getAdminUnits } from '../../lib/db/queries/admin-units'
import { createTestUnit } from '../helpers/factories'

/**
 * As unidades de teste nascem em `TO` (UF que o seed não usa), então filtrar
 * por estado isola completamente estes casos das unidades reais do banco.
 */
const IN_TO = parseAdminUnitFilters({ state: 'TO' })

describe('getAdminUnits', () => {
  it('lista unidades de todas as situações, não só as ativas', async () => {
    await createTestUnit({ status: 'ACTIVE' })
    await createTestUnit({ status: 'PENDING' })
    await createTestUnit({ status: 'INACTIVE' })

    const { units, pagination } = await getAdminUnits(IN_TO)

    expect(pagination.total).toBe(3)
    expect(new Set(units.map((unit) => unit.status))).toEqual(
      new Set(['ACTIVE', 'PENDING', 'INACTIVE']),
    )
  })

  it('filtra por situação', async () => {
    await createTestUnit({ status: 'ACTIVE' })
    await createTestUnit({ status: 'PENDING' })

    const { units } = await getAdminUnits(
      parseAdminUnitFilters({ state: 'TO', status: 'PENDING' }),
    )

    expect(units).toHaveLength(1)
    expect(units[0]?.status).toBe('PENDING')
  })

  it('filtra por tipo', async () => {
    await createTestUnit({ type: 'MILK_BANK' })
    await createTestUnit({ type: 'COLLECTION_POINT' })

    const { units } = await getAdminUnits(
      parseAdminUnitFilters({ state: 'TO', type: 'COLLECTION_POINT' }),
    )

    expect(units).toHaveLength(1)
    expect(units[0]?.type).toBe('COLLECTION_POINT')
  })

  it('busca por nome sem diferenciar maiúsculas', async () => {
    const target = await createTestUnit({ name: '__test__ Banco Zetalfa' })
    await createTestUnit({ name: '__test__ Posto Omega' })

    const { units, pagination } = await getAdminUnits(
      parseAdminUnitFilters({ state: 'TO', q: 'zetalfa' }),
    )

    expect(pagination.total).toBe(1)
    expect(units[0]?.id).toBe(target.id)
  })

  it('filtra por cidade parcial e combina filtros com E', async () => {
    await createTestUnit({
      addressCity: 'Palmas',
      status: 'ACTIVE',
      name: '__test__ Alfa Palmas',
    })
    await createTestUnit({ addressCity: 'Palmas', status: 'INACTIVE' })
    await createTestUnit({ addressCity: 'Gurupi', status: 'ACTIVE' })

    const { units } = await getAdminUnits(
      parseAdminUnitFilters({ state: 'TO', city: 'palm', status: 'ACTIVE' }),
    )

    expect(units).toHaveLength(1)
    expect(units[0]?.name).toBe('__test__ Alfa Palmas')
  })

  it('expõe contato como indicador, sem o número, e trata vazio como ausente', async () => {
    await createTestUnit({ phone: '6332181000', whatsapp: '' })

    const { units } = await getAdminUnits(IN_TO)

    expect(units[0]?.hasPhone).toBe(true)
    expect(units[0]?.hasWhatsapp).toBe(false)
    expect(units[0]).not.toHaveProperty('phone')
    expect(units[0]).not.toHaveProperty('whatsapp')
  })

  it('ordena por situação e depois por nome', async () => {
    await createTestUnit({ status: 'ACTIVE', name: '__test__ AAA Ativa' })
    await createTestUnit({ status: 'PENDING', name: '__test__ ZZZ Pendente' })

    const { units } = await getAdminUnits(IN_TO)

    // A ordem do enum no schema (PENDING, ACTIVE, INACTIVE) coloca o que
    // aguarda revisão no topo, mesmo com nome maior.
    expect(units.map((unit) => unit.status)).toEqual(['PENDING', 'ACTIVE'])
  })

  it('página além da última devolve lista vazia com o total correto', async () => {
    await createTestUnit()

    const { units, pagination } = await getAdminUnits(
      parseAdminUnitFilters({ state: 'TO', page: '999' }),
    )

    expect(units).toHaveLength(0)
    expect(pagination.total).toBe(1)
    expect(pagination.totalPages).toBe(1)
    expect(pagination.hasPreviousPage).toBe(true)
    expect(pagination.hasNextPage).toBe(false)
  })

  it('UF sem unidade devolve lista vazia, nunca erro', async () => {
    const { units, pagination } = await getAdminUnits(
      parseAdminUnitFilters({ state: 'AC' }),
    )

    expect(units).toEqual([])
    expect(pagination.total).toBe(0)
    expect(pagination.totalPages).toBe(0)
  })
})
