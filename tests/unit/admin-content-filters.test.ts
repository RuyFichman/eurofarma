import { describe, expect, it } from 'vitest'

import {
  buildAdminContentsHref,
  hasActiveAdminContentFilters,
  parseAdminContentFilters,
} from '../../lib/admin/contents/filters'

describe('filtros administrativos de conteúdos', () => {
  it('normaliza busca, situação, categoria e página', () => {
    expect(
      parseAdminContentFilters({
        q: '  armazenamento  ',
        status: 'published',
        category: '  Extração  ',
        page: '3',
      }),
    ).toEqual({
      query: 'armazenamento',
      status: 'PUBLISHED',
      category: 'Extração',
      page: 3,
    })
  })

  it('descarta situação inválida e limita páginas fora do intervalo', () => {
    expect(
      parseAdminContentFilters({ status: 'archived', page: '-12' }),
    ).toMatchObject({ status: '', page: 1 })
    expect(parseAdminContentFilters({ page: '999999' }).page).toBe(10_000)
  })

  it('mantém os filtros na paginação sem parâmetros vazios', () => {
    const filters = parseAdminContentFilters({
      q: 'leite seguro',
      status: 'DRAFT',
      category: 'Armazenamento',
    })

    expect(hasActiveAdminContentFilters(filters)).toBe(true)
    expect(buildAdminContentsHref(filters, 2)).toBe(
      '/admin/conteudos?q=leite+seguro&status=DRAFT&category=Armazenamento&page=2',
    )
    expect(buildAdminContentsHref(parseAdminContentFilters({}))).toBe(
      '/admin/conteudos',
    )
  })
})
