import { describe, it, expect } from 'vitest'

import {
  ADMIN_NUTRIZES_PATH,
  buildAdminNutrizesHref,
  hasActiveAdminNutrizFilters,
  parseAdminNutrizFilters,
} from '../../lib/admin/nutrizes/filters'
import { formatBrazilianPhone, maskBrazilianPhone } from '../../lib/utils/phone'

describe('parseAdminNutrizFilters', () => {
  it('devolve página 1 sem parâmetros', () => {
    expect(parseAdminNutrizFilters({})).toEqual({
      query: undefined,
      status: undefined,
      state: undefined,
      page: 1,
    })
  })

  it('aceita situação em minúsculas', () => {
    expect(parseAdminNutrizFilters({ status: 'contacted' }).status).toBe(
      'CONTACTED',
    )
  })

  it('ignora situação inválida em vez de lançar', () => {
    expect(parseAdminNutrizFilters({ status: 'SUMIU' }).status).toBeUndefined()
  })

  it('valida UF contra a lista oficial', () => {
    expect(parseAdminNutrizFilters({ state: 'sp' }).state).toBe('SP')
    expect(parseAdminNutrizFilters({ state: 'XX' }).state).toBeUndefined()
  })

  it('limita o tamanho da busca', () => {
    const filters = parseAdminNutrizFilters({ q: 'a'.repeat(200) })
    expect(filters.query).toHaveLength(100)
  })

  it('trata página inválida como 1', () => {
    expect(parseAdminNutrizFilters({ page: '0' }).page).toBe(1)
    expect(parseAdminNutrizFilters({ page: '12abc' }).page).toBe(1)
    expect(parseAdminNutrizFilters({ page: '-3' }).page).toBe(1)
  })

  it('limita a página ao teto', () => {
    expect(parseAdminNutrizFilters({ page: '99999999' }).page).toBe(10_000)
  })
})

describe('hasActiveAdminNutrizFilters', () => {
  it('paginar não conta como filtrar', () => {
    expect(
      hasActiveAdminNutrizFilters(parseAdminNutrizFilters({ page: '3' })),
    ).toBe(false)
  })

  it('detecta filtro aplicado', () => {
    expect(
      hasActiveAdminNutrizFilters(parseAdminNutrizFilters({ state: 'SP' })),
    ).toBe(true)
  })
})

describe('buildAdminNutrizesHref', () => {
  it('omite page=1', () => {
    const filters = parseAdminNutrizFilters({ state: 'SP' })
    expect(buildAdminNutrizesHref(filters, 1)).toBe(
      `${ADMIN_NUTRIZES_PATH}?state=SP`,
    )
  })

  it('preserva os filtros ao trocar de página', () => {
    const filters = parseAdminNutrizFilters({ q: 'ana', status: 'DONATED' })
    expect(buildAdminNutrizesHref(filters, 2)).toBe(
      `${ADMIN_NUTRIZES_PATH}?q=ana&status=DONATED&page=2`,
    )
  })

  it('sem filtro nenhum devolve a rota limpa', () => {
    expect(buildAdminNutrizesHref(parseAdminNutrizFilters({}))).toBe(
      ADMIN_NUTRIZES_PATH,
    )
  })
})

describe('exibição de telefone', () => {
  it.each([
    ['5511999998888', '(11) 99999-8888'],
    ['551139861011', '(11) 3986-1011'],
    ['11999998888', '(11) 99999-8888'],
  ])('formata %s como %s', (input, expected) => {
    expect(formatBrazilianPhone(input)).toBe(expected)
  })

  it('mascara preservando DDD e os dois últimos dígitos', () => {
    expect(maskBrazilianPhone('5511999998888')).toBe('(11) •••••-••88')
  })

  it('mascara número fixo', () => {
    expect(maskBrazilianPhone('551139861011')).toBe('(11) ••••-••11')
  })

  it('a máscara não deixa vazar dígito do meio', () => {
    const masked = maskBrazilianPhone('5511987654321')
    expect(masked).not.toContain('9876')
    expect(masked).not.toContain('543')
  })

  it.each([null, undefined, '', '123'])(
    'devolve null para entrada inválida (%s)',
    (input) => {
      expect(formatBrazilianPhone(input)).toBeNull()
      expect(maskBrazilianPhone(input)).toBeNull()
    },
  )
})
