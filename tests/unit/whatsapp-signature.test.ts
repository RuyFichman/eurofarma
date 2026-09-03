import { describe, it, expect } from 'vitest'

import {
  isValidWhatsappSignature,
  signWhatsappBody,
} from '../../lib/whatsapp/signature'

const SECRET = 'segredo-de-teste'
const BODY = '{"object":"whatsapp_business_account","entry":[]}'

describe('isValidWhatsappSignature', () => {
  it('aceita assinatura correta', () => {
    expect(
      isValidWhatsappSignature({
        rawBody: BODY,
        signatureHeader: signWhatsappBody(BODY, SECRET),
        appSecret: SECRET,
      }),
    ).toBe(true)
  })

  it('recusa corpo adulterado', () => {
    const signature = signWhatsappBody(BODY, SECRET)
    expect(
      isValidWhatsappSignature({
        rawBody: `${BODY} `,
        signatureHeader: signature,
        appSecret: SECRET,
      }),
    ).toBe(false)
  })

  it('recusa segredo errado', () => {
    expect(
      isValidWhatsappSignature({
        rawBody: BODY,
        signatureHeader: signWhatsappBody(BODY, 'outro-segredo'),
        appSecret: SECRET,
      }),
    ).toBe(false)
  })

  it('recusa header ausente ou sem o prefixo sha256=', () => {
    expect(
      isValidWhatsappSignature({
        rawBody: BODY,
        signatureHeader: null,
        appSecret: SECRET,
      }),
    ).toBe(false)
    expect(
      isValidWhatsappSignature({
        rawBody: BODY,
        signatureHeader: signWhatsappBody(BODY, SECRET).replace('sha256=', ''),
        appSecret: SECRET,
      }),
    ).toBe(false)
  })

  it('recusa digest com tamanho errado sem lancar', () => {
    expect(
      isValidWhatsappSignature({
        rawBody: BODY,
        signatureHeader: 'sha256=abcd',
        appSecret: SECRET,
      }),
    ).toBe(false)
  })

  it('recusa digest nao hexadecimal', () => {
    expect(
      isValidWhatsappSignature({
        rawBody: BODY,
        signatureHeader: `sha256=${'z'.repeat(64)}`,
        appSecret: SECRET,
      }),
    ).toBe(false)
  })

  it('recusa quando o segredo nao esta configurado', () => {
    expect(
      isValidWhatsappSignature({
        rawBody: BODY,
        signatureHeader: signWhatsappBody(BODY, ''),
        appSecret: '',
      }),
    ).toBe(false)
  })
})
