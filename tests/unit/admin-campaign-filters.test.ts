import { describe, expect, it } from 'vitest'

import {
  buildAdminCampaignsHref,
  hasActiveAdminCampaignFilters,
  parseAdminCampaignFilters,
} from '../../lib/admin/campaigns/filters'

describe('filtros administrativos de campanhas', () => {
  it('normaliza busca, situação, origem e página', () => {
    expect(
      parseAdminCampaignFilters({
        q: '  feira  ',
        status: 'active',
        source: '  instagram  ',
        page: '3',
      }),
    ).toEqual({
      query: 'feira',
      status: 'ACTIVE',
      source: 'instagram',
      page: 3,
    })
  })

  it('descarta situação inválida e limita páginas fora do intervalo', () => {
    expect(
      parseAdminCampaignFilters({ status: 'archived', page: '-4' }),
    ).toMatchObject({ status: '', page: 1 })
    expect(parseAdminCampaignFilters({ page: '999999' }).page).toBe(10_000)
  })

  it('mantém filtros na paginação sem parâmetros vazios', () => {
    const filters = parseAdminCampaignFilters({
      q: 'feira saúde',
      status: 'INACTIVE',
      source: 'instagram',
    })

    expect(hasActiveAdminCampaignFilters(filters)).toBe(true)
    expect(buildAdminCampaignsHref(filters, 2)).toBe(
      '/admin/campanhas?q=feira+sa%C3%BAde&status=INACTIVE&source=instagram&page=2',
    )
    expect(buildAdminCampaignsHref(parseAdminCampaignFilters({}))).toBe(
      '/admin/campanhas',
    )
  })
})
