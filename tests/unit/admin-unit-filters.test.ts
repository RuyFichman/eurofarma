import { describe, it, expect } from 'vitest'

import {
  buildAdminUnitsHref,
  hasActiveAdminUnitFilters,
  parseAdminUnitFilters,
} from '../../lib/admin/units/filters'

/**
 * O painel precisa sobreviver a URL editada à mão: nenhum caso aqui pode
 * lançar, o pior cenário aceitável é o filtro ser ignorado.
 */
describe('parseAdminUnitFilters', () => {
  it('sem parâmetros, cai na página 1 e sem filtros', () => {
    const filters = parseAdminUnitFilters({})

    expect(filters).toEqual({
      query: undefined,
      status: undefined,
      type: undefined,
      state: undefined,
      city: undefined,
      page: 1,
    })
    expect(hasActiveAdminUnitFilters(filters)).toBe(false)
  })

  it('apara texto e descarta string vazia', () => {
    const filters = parseAdminUnitFilters({ q: '  leite  ', city: '   ' })

    expect(filters.query).toBe('leite')
    expect(filters.city).toBeUndefined()
  })

  it('limita a busca a 100 caracteres', () => {
    const filters = parseAdminUnitFilters({ q: 'a'.repeat(250) })

    expect(filters.query).toHaveLength(100)
  })

  it('normaliza enums e UF em minúsculas', () => {
    const filters = parseAdminUnitFilters({
      status: 'active',
      type: 'milk_bank',
      state: 'sp',
    })

    expect(filters.status).toBe('ACTIVE')
    expect(filters.type).toBe('MILK_BANK')
    expect(filters.state).toBe('SP')
  })

  it('ignora enum e UF inexistentes em vez de quebrar', () => {
    const filters = parseAdminUnitFilters({
      status: 'INVALID',
      type: 'INVALID',
      state: 'XX',
    })

    expect(filters.status).toBeUndefined()
    expect(filters.type).toBeUndefined()
    expect(filters.state).toBeUndefined()
    expect(hasActiveAdminUnitFilters(filters)).toBe(false)
  })

  it('página inválida volta para 1', () => {
    for (const page of ['abc', '-1', '0', '2.5', '12abc', '', ' ']) {
      expect(parseAdminUnitFilters({ page }).page).toBe(1)
    }
  })

  it('página válida é preservada e limitada no teto', () => {
    expect(parseAdminUnitFilters({ page: '3' }).page).toBe(3)
    // Teto protege o `skip` Int32 do Prisma de um número absurdo na URL.
    expect(parseAdminUnitFilters({ page: '99999999999' }).page).toBe(10_000)
  })

  it('usa o primeiro valor quando a chave se repete', () => {
    const filters = parseAdminUnitFilters({ state: ['SP', 'RJ'] })

    expect(filters.state).toBe('SP')
  })

  it('paginar não conta como filtrar', () => {
    expect(
      hasActiveAdminUnitFilters(parseAdminUnitFilters({ page: '4' })),
    ).toBe(false)
    expect(
      hasActiveAdminUnitFilters(parseAdminUnitFilters({ q: 'leite' })),
    ).toBe(true)
  })
})

describe('buildAdminUnitsHref', () => {
  it('sem filtros nem página, devolve a rota limpa', () => {
    const filters = parseAdminUnitFilters({})

    expect(buildAdminUnitsHref(filters)).toBe('/admin/unidades')
  })

  it('preserva os filtros ativos e troca só a página', () => {
    const filters = parseAdminUnitFilters({
      q: 'leite',
      status: 'ACTIVE',
      type: 'MILK_BANK',
      state: 'SP',
      city: 'São Paulo',
      page: '2',
    })

    const href = buildAdminUnitsHref(filters, 3)

    expect(href).toContain('q=leite')
    expect(href).toContain('status=ACTIVE')
    expect(href).toContain('type=MILK_BANK')
    expect(href).toContain('state=SP')
    expect(href).toContain('city=S%C3%A3o+Paulo')
    expect(href).toContain('page=3')
  })

  it('omite page=1 para não sujar a URL', () => {
    const filters = parseAdminUnitFilters({ q: 'leite', page: '2' })

    expect(buildAdminUnitsHref(filters, 1)).toBe('/admin/unidades?q=leite')
  })

  it('não arrasta parâmetros desconhecidos da URL', () => {
    const filters = parseAdminUnitFilters({ q: 'leite', limit: '999' })

    expect(buildAdminUnitsHref(filters)).toBe('/admin/unidades?q=leite')
  })
})
