import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  getProvider: vi.fn(),
  findNutriz: vi.fn(),
  getState: vi.fn(),
  saveState: vi.fn(),
  createLead: vi.fn(),
  resolveCoverage: vi.fn(),
  sendReply: vi.fn(),
  rateLimit: vi.fn(),
  setReminderConsent: vi.fn(),
  claimInboundMessage: vi.fn(),
  finishInboundMessage: vi.fn(),
}))

vi.mock('../../lib/whatsapp/zapi-provider', () => ({
  getZapiWhatsAppProvider: mocks.getProvider,
}))
vi.mock('../../lib/db/queries/whatsapp-conversations', () => ({
  findNutrizByWhatsapp: mocks.findNutriz,
  getConversationState: mocks.getState,
  saveConversationState: mocks.saveState,
  createWhatsappNutrizLead: mocks.createLead,
}))
vi.mock('../../lib/db/queries/whatsapp-inbound-messages', () => ({
  claimWhatsappInboundMessage: mocks.claimInboundMessage,
  finishWhatsappInboundMessage: mocks.finishInboundMessage,
}))
vi.mock('../../lib/whatsapp/coverage', () => ({
  resolveWhatsappCoverageInput: mocks.resolveCoverage,
}))
vi.mock('../../lib/whatsapp/provider', () => ({
  sendWhatsappReply: mocks.sendReply,
}))
vi.mock('../../lib/security/rate-limit', () => ({
  rateLimit: mocks.rateLimit,
}))
vi.mock('../../lib/db/queries/communication-consents', () => ({
  setReminderConsent: mocks.setReminderConsent,
}))

import { POST } from '../../app/api/whatsapp/zapi/[secret]/route'

const secret = 'local-test-secret'

function payload(overrides: Record<string, unknown> = {}) {
  return {
    type: 'ReceivedCallback',
    instanceId: 'zapi-instance',
    phone: '5511999998888',
    messageId: 'zapi-inbound-1',
    fromMe: false,
    isGroup: false,
    isNewsletter: false,
    isStatusReply: false,
    isEdit: false,
    text: { message: 'Olá' },
    ...overrides,
  }
}

function request(body: unknown): NextRequest {
  return new NextRequest(`https://nutrilink.test/api/whatsapp/zapi/${secret}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function post(body: unknown, routeSecret = secret) {
  return POST(request(body), {
    params: Promise.resolve({ secret: routeSecret }),
  })
}

describe('POST /api/whatsapp/zapi/[secret]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('ZAPI_WEBHOOK_SECRET', secret)
    vi.stubEnv('ZAPI_INSTANCE_ID', 'zapi-instance')
    vi.stubEnv('ZAPI_TEST_MODE', 'true')
    vi.stubEnv('ZAPI_TEST_ALLOWED_PHONES', '5511999998888')
    mocks.getProvider.mockReturnValue({})
    mocks.rateLimit.mockReturnValue({ success: true })
    mocks.findNutriz.mockResolvedValue(null)
    mocks.getState.mockResolvedValue({
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: true,
    })
    mocks.saveState.mockResolvedValue(undefined)
    mocks.sendReply.mockResolvedValue({
      outcome: 'SENT',
      providerMessageId: 'zapi-outbound-1',
    })
    mocks.claimInboundMessage.mockResolvedValue({
      id: 'inbound-1',
      claimed: true,
    })
    mocks.finishInboundMessage.mockResolvedValue(undefined)
  })

  afterEach(() => vi.unstubAllEnvs())

  it('recusa segredo ou instância ausentes antes de processar o payload', async () => {
    expect((await post(payload(), 'wrong-secret')).status).toBe(401)
    expect(mocks.getState).not.toHaveBeenCalled()

    vi.stubEnv('ZAPI_INSTANCE_ID', '')
    expect((await post(payload())).status).toBe(401)
    expect(mocks.getState).not.toHaveBeenCalled()
  })

  it('ignora mensagens próprias, grupos, mídias e números fora da allowlist', async () => {
    await post(payload({ fromMe: true }))
    await post(payload({ isGroup: true }))
    await post(
      payload({ text: null, image: { imageUrl: 'https://z-api.test/a' } }),
    )
    await post(payload({ phone: '5511888887777' }))

    expect(mocks.getState).not.toHaveBeenCalled()
    expect(mocks.claimInboundMessage).not.toHaveBeenCalled()
  })

  it('não muda a conversa se o provedor de saída não estiver configurado', async () => {
    mocks.getProvider.mockReturnValue(null)

    expect((await post(payload())).status).toBe(503)
    expect(mocks.getState).not.toHaveBeenCalled()
    expect(mocks.claimInboundMessage).not.toHaveBeenCalled()
  })

  it('passa texto privado autorizado para a máquina idempotente existente', async () => {
    const response = await post(payload())

    expect(response.status).toBe(200)
    expect(mocks.claimInboundMessage).toHaveBeenCalledWith({
      provider: 'ZAPI',
      providerMessageId: 'zapi-inbound-1',
    })
    expect(mocks.saveState).toHaveBeenCalledWith(
      expect.objectContaining({ phoneWhatsapp: '5511999998888', step: 'MENU' }),
    )
    expect(mocks.sendReply.mock.calls[0]?.[0].reply.type).toBe('buttons')
    expect(mocks.finishInboundMessage).toHaveBeenLastCalledWith({
      id: 'inbound-1',
      result: 'PROCESSED',
      phoneWhatsapp: '5511999998888',
      replyDelivery: {
        outcome: 'SENT',
        providerMessageId: 'zapi-outbound-1',
      },
    })
  })

  it('audita falha de envio e não marca a entrada como processada', async () => {
    mocks.sendReply.mockResolvedValue({
      outcome: 'RETRYABLE_FAILURE',
      errorCode: 'ZAPI_HTTP_503',
    })

    expect((await post(payload())).status).toBe(200)
    expect(mocks.finishInboundMessage).toHaveBeenLastCalledWith({
      id: 'inbound-1',
      result: 'FAILED',
      phoneWhatsapp: '5511999998888',
      replyDelivery: {
        outcome: 'RETRYABLE_FAILURE',
        errorCode: 'ZAPI_HTTP_503',
      },
    })
  })
})
