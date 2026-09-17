import { describe, expect, it } from 'vitest'

import {
  buildReferralMessage,
  buildWhatsappShareUrl,
} from '../../lib/referrals/message'

describe('mensagem de indicação', () => {
  it('inclui somente o link opaco na mensagem pronta', () => {
    const message = buildReferralMessage(
      'Conheça o NutriLink: {link}',
      'https://nutrilink.example/cadastro?indicacao=nlr_abc',
    )

    expect(message).toBe(
      'Conheça o NutriLink: https://nutrilink.example/cadastro?indicacao=nlr_abc',
    )
  })

  it('gera uma URL de compartilhamento do WhatsApp com a mensagem codificada', () => {
    const url = buildWhatsappShareUrl(
      'Conheça o NutriLink: https://example.test',
    )

    expect(url).toBe(
      'https://wa.me/?text=Conhe%C3%A7a%20o%20NutriLink%3A%20https%3A%2F%2Fexample.test',
    )
  })
})
