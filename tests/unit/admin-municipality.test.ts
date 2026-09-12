import { describe, expect, it } from 'vitest'

import {
  buildAdminMunicipalitiesHref,
  hasActiveAdminMunicipalityFilters,
  parseAdminMunicipalityFilters,
} from '../../lib/admin/municipalities/filters'
import { adminMunicipalityFormSchema } from '../../lib/admin/municipalities/municipality-form-schema'

describe('filtros administrativos de municípios', () => {
  it('normaliza parâmetros e ignora opções desconhecidas', () => {
    expect(
      parseAdminMunicipalityFilters({
        q: '  osasco  ',
        status: 'active',
        region: 'west',
        page: '2',
      }),
    ).toEqual({ query: 'osasco', status: 'ACTIVE', region: 'WEST', page: 2 })

    expect(
      parseAdminMunicipalityFilters({ status: 'pending', region: 'sul' }),
    ).toEqual({ query: '', status: '', region: '', page: 1 })
  })

  it('mantém os filtros na paginação', () => {
    const filters = parseAdminMunicipalityFilters({
      q: 'São',
      status: 'ACTIVE',
      region: 'ABC',
    })
    expect(hasActiveAdminMunicipalityFilters(filters)).toBe(true)
    expect(buildAdminMunicipalitiesHref(filters, 3)).toBe(
      '/admin/municipios?q=S%C3%A3o&status=ACTIVE&region=ABC&page=3',
    )
  })
})

describe('formulário administrativo de município', () => {
  it('aceita nome, sub-região e situação válidos', () => {
    expect(
      adminMunicipalityFormSchema.safeParse({
        name: '  Osasco ',
        region: 'WEST',
        status: 'ACTIVE',
      }),
    ).toMatchObject({
      success: true,
      data: { name: 'Osasco', region: 'WEST', status: 'ACTIVE' },
    })
  })

  it('rejeita sub-região e situação fora da lista', () => {
    expect(
      adminMunicipalityFormSchema.safeParse({
        name: 'Osasco',
        region: 'OTHER',
        status: 'PENDING',
      }).success,
    ).toBe(false)
  })
})
