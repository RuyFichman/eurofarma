import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  signatureValid: vi.fn(),
  processInbound: vi.fn(),
  provider: { sendSessionMessage: vi.fn(), sendTemplate: vi.fn() },
  getProvider: vi.fn(),
}))

vi.mock('../../lib/whatsapp/twilio-signature', () => ({
  isValidTwilioSignature: mocks.signatureValid,
}))
vi.mock('../../lib/whatsapp/process-inbound', () => ({
  processInboundWhatsappMessage: mocks.processInbound,
}))
vi.mock('../../lib/whatsapp/twilio-provider', () => ({
  getTwilioWhatsAppProvider: mocks.getProvider,
}))

import { POST } from '../../app/api/whatsapp/twilio/route'

function request(values: Record<string, string>): NextRequest {
  return new NextRequest('https://nutrilink.test/api/whatsapp/twilio', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-twilio-signature': 'test-signature',
    },
    body: new URLSearchParams(values).toString(),
  })
}

describe('POST /api/whatsapp/twilio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'test-token')
    mocks.signatureValid.mockReturnValue(true)
    mocks.getProvider.mockReturnValue(mocks.provider)
    mocks.processInbound.mockResolvedValue(undefined)
  })

  afterEach(() => vi.unstubAllEnvs())

  it('normaliza o payload Twilio e o entrega à máquina compartilhada', async () => {
    const response = await POST(
      request({
        From: 'whatsapp:+5511999998888',
        WaId: '5511999998888',
        MessageSid: 'SM-inbound-1',
        Body: 'Menu',
      }),
    )

    expect(response.status).toBe(200)
    expect(mocks.processInbound).toHaveBeenCalledWith({
      message: {
        from: '5511999998888',
        messageId: 'SM-inbound-1',
        text: 'Menu',
        replyId: null,
      },
      provider: mocks.provider,
      inboundProvider: 'TWILIO',
      siteUrl: 'https://nutrilink.test',
    })
  })

  it('não processa quando a assinatura não é válida', async () => {
    mocks.signatureValid.mockReturnValue(false)

    const response = await POST(
      request({
        From: 'whatsapp:+5511999998888',
        MessageSid: 'SM-invalid',
        Body: 'Menu',
      }),
    )

    expect(response.status).toBe(401)
    expect(mocks.processInbound).not.toHaveBeenCalled()
  })
})
