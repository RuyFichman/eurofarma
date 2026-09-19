import { describe, expect, it } from 'vitest'

import { adminCampaignFormSchema } from '../../lib/admin/campaigns/campaign-form-schema'

describe('formulário administrativo de campanha', () => {
  it('normaliza nome e parâmetros UTM válidos', () => {
    expect(
      adminCampaignFormSchema.parse({
        name: '  Feira da Saúde  ',
        utmSource: '  Instagram  ',
        utmMedium: '  SOCIAL  ',
        utmCampaign: '  Feira_Setembro  ',
        landingUrl: '  /cadastro?origem=evento  ',
        status: 'ACTIVE',
      }),
    ).toEqual({
      name: 'Feira da Saúde',
      utmSource: 'instagram',
      utmMedium: 'social',
      utmCampaign: 'feira_setembro',
      landingUrl: '/cadastro?origem=evento',
      status: 'ACTIVE',
    })
  })

  it('rejeita destinos externos e rotas internas restritas', () => {
    for (const landingUrl of [
      'https://exemplo.com/cadastro',
      '//exemplo.com',
      '/admin',
      '/api/coverage',
      '/auth/login',
    ]) {
      const result = adminCampaignFormSchema.safeParse({
        name: 'Campanha válida',
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'campanha_teste',
        landingUrl,
        status: 'ACTIVE',
      })
      expect(result.success).toBe(false)
    }
  })

  it('rejeita parâmetros UTM com espaços ou caracteres não permitidos', () => {
    const result = adminCampaignFormSchema.safeParse({
      name: 'Campanha válida',
      utmSource: 'rede social',
      utmMedium: 'social/pago',
      utmCampaign: 'campanha#teste',
      landingUrl: '/cadastro',
      status: 'ACTIVE',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.utmSource).toBeDefined()
      expect(result.error.flatten().fieldErrors.utmMedium).toBeDefined()
      expect(result.error.flatten().fieldErrors.utmCampaign).toBeDefined()
    }
  })
})
