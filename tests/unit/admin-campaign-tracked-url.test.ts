import { describe, expect, it } from 'vitest'

import { buildTrackedCampaignHref } from '../../lib/admin/campaigns/tracked-url'

describe('link rastreável de campanha', () => {
  it('adiciona UTMs a um destino interno', () => {
    expect(
      buildTrackedCampaignHref({
        landingUrl: '/cadastro',
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'feira_setembro',
      }),
    ).toBe(
      '/cadastro?utm_source=instagram&utm_medium=social&utm_campaign=feira_setembro',
    )
  })

  it('preserva parâmetros e fragmento existentes', () => {
    expect(
      buildTrackedCampaignHref({
        landingUrl: '/cadastro?ref=abc#formulario',
        utmSource: 'email',
        utmMedium: 'newsletter',
        utmCampaign: 'boas_vindas',
      }),
    ).toBe(
      '/cadastro?ref=abc&utm_source=email&utm_medium=newsletter&utm_campaign=boas_vindas#formulario',
    )
  })

  it('substitui UTMs antigas sem duplicá-las', () => {
    expect(
      buildTrackedCampaignHref({
        landingUrl: '/cadastro?utm_source=antiga&utm_medium=antiga',
        utmSource: 'evento',
        utmMedium: 'qr_code',
        utmCampaign: 'feira_2026',
      }),
    ).toBe(
      '/cadastro?utm_source=evento&utm_medium=qr_code&utm_campaign=feira_2026',
    )
  })
})
