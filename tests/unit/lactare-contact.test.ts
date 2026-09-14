import { describe, expect, it } from 'vitest'

import { LACTARE_CONTACT } from '../../lib/constants/lactare-contact'

describe('canais oficiais do Lactare', () => {
  it('usa o WhatsApp institucional em formato internacional', () => {
    expect(LACTARE_CONTACT.whatsappHref).toBe('https://wa.me/5511966290681')
    expect(LACTARE_CONTACT.whatsappDisplay).toBe('+55 (11) 96629-0681')
  })

  it('oferece o telefone institucional em link discável', () => {
    expect(LACTARE_CONTACT.phoneHref).toBe('tel:+551141449604')
    expect(LACTARE_CONTACT.phoneDisplay).toBe('(11) 4144-9604')
  })

  it('mantém fonte oficial e data de conferência junto dos canais', () => {
    expect(new URL(LACTARE_CONTACT.officialSourceHref).hostname).toBe(
      'www.lactare.com.br',
    )
    expect(LACTARE_CONTACT.verifiedAtDisplay).toBe('14/09/2026')
  })
})
