import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  signatureValid: vi.fn(),
  record: vi.fn(),
}))

vi.mock('../../lib/whatsapp/twilio-signature', () => ({
  isValidTwilioSignature: mocks.signatureValid,
}))
vi.mock('../../lib/db/queries/notification-delivery-status-events', () => ({
  recordTwilioDeliveryStatusEvent: mocks.record,
}))

import { POST } from '../../app/api/whatsapp/twilio/status/route'
import { extractTwilioDeliveryStatusEvent } from '../../lib/whatsapp/twilio-status-payload'

function request(values: Record<string, string>): NextRequest {
  return new NextRequest('https://nutrilink.test/api/whatsapp/twilio/status', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-twilio-signature': 'test-signature',
    },
    body: new URLSearchParams(values).toString(),
  })
}

describe('callback de status do Twilio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'test-token')
    mocks.signatureValid.mockReturnValue(true)
    mocks.record.mockResolvedValue(undefined)
  })

  afterEach(() => vi.unstubAllEnvs())

  it('normaliza estados e não preserva campos de origem ou destino', () => {
    expect(
      extractTwilioDeliveryStatusEvent(
        new URLSearchParams({
          MessageSid: 'SM-delivered-1',
          MessageStatus: 'delivered',
          From: 'whatsapp:+5511999998888',
          To: 'whatsapp:+5511966290681',
        }),
      ),
    ).toEqual({
      providerMessageId: 'SM-delivered-1',
      status: 'DELIVERED',
      errorCode: null,
    })
  })

  it('registra um evento append-only para callback válido', async () => {
    const response = await POST(
      request({
        MessageSid: 'SM-read-1',
        MessageStatus: 'read',
        ErrorCode: '',
      }),
    )

    expect(response.status).toBe(200)
    expect(mocks.record).toHaveBeenCalledWith({
      providerMessageId: 'SM-read-1',
      status: 'READ',
      errorCode: null,
    })
  })

  it('recusa callback com assinatura inválida', async () => {
    mocks.signatureValid.mockReturnValue(false)

    const response = await POST(
      request({ MessageSid: 'SM-invalid', MessageStatus: 'failed' }),
    )

    expect(response.status).toBe(401)
    expect(mocks.record).not.toHaveBeenCalled()
  })
})
