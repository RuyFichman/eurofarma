import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  signatureValid: vi.fn(),
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

vi.mock('../../lib/whatsapp/twilio-signature', () => ({
  isValidTwilioSignature: mocks.signatureValid,
}))
vi.mock('../../lib/whatsapp/twilio-provider', () => ({
  getTwilioWhatsAppProvider: mocks.getProvider,
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

import { POST } from '../../app/api/whatsapp/twilio/route'

function form(fields: Record<string, string>): string {
  return new URLSearchParams(fields).toString()
}

function request(fields: Record<string, string>): NextRequest {
  return new NextRequest('https://nutrilink.test/api/whatsapp/twilio', {
    method: 'POST',
    headers: {
      'x-twilio-signature': 'test-signature',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: form(fields),
  })
}

describe('POST /api/whatsapp/twilio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'test-token')
    mocks.signatureValid.mockReturnValue(true)
    mocks.getProvider.mockReturnValue(null)
    mocks.rateLimit.mockReturnValue({ success: true })
    mocks.findNutriz.mockResolvedValue(null)
    mocks.saveState.mockResolvedValue(undefined)
    mocks.sendReply.mockResolvedValue(true)
    mocks.setReminderConsent.mockResolvedValue({
      status: 'UPDATED',
      enabled: true,
    })
    mocks.claimInboundMessage.mockResolvedValue({
      id: 'inbound-1',
      claimed: true,
    })
    mocks.finishInboundMessage.mockResolvedValue(undefined)
  })

  afterEach(() => vi.unstubAllEnvs())

  it('recusa assinatura inválida sem consultar a conversa', async () => {
    mocks.signatureValid.mockReturnValue(false)

    const response = await POST(
      request({
        From: 'whatsapp:+5511999998888',
        WaId: '5511999998888',
        MessageSid: 'SM1',
        Body: 'Oi',
      }),
    )

    expect(response.status).toBe(401)
    expect(mocks.getState).not.toHaveBeenCalled()
  })

  it('recusa quando não há token configurado, mesmo com assinatura aparentemente válida', async () => {
    vi.stubEnv('TWILIO_AUTH_TOKEN', '')

    const response = await POST(
      request({
        From: 'whatsapp:+5511999998888',
        WaId: '5511999998888',
        MessageSid: 'SM1',
        Body: 'Oi',
      }),
    )

    expect(response.status).toBe(401)
    expect(mocks.getState).not.toHaveBeenCalled()
  })

  it('processa a mensagem reaproveitando a mesma máquina de estados do fluxo ativo', async () => {
    mocks.getState.mockResolvedValue({
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: true,
    })

    const response = await POST(
      request({
        From: 'whatsapp:+5511999998888',
        WaId: '5511999998888',
        MessageSid: 'SM2',
        Body: 'Olá',
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/xml')
    expect(mocks.claimInboundMessage).toHaveBeenCalledWith({
      provider: 'TWILIO',
      providerMessageId: 'SM2',
    })
    expect(mocks.saveState).toHaveBeenCalledWith({
      phoneWhatsapp: '5511999998888',
      nutrizProfileId: null,
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
    })
    expect(mocks.sendReply.mock.calls[0]?.[0].reply.type).toBe('buttons')
  })

  it('encerra uma reentrega do Twilio antes de consultar ou alterar a conversa', async () => {
    mocks.claimInboundMessage.mockResolvedValue({
      id: 'inbound-duplicate',
      claimed: false,
    })

    const response = await POST(
      request({
        From: 'whatsapp:+5511999998888',
        WaId: '5511999998888',
        MessageSid: 'SM-duplicate',
        Body: 'Olá',
      }),
    )

    expect(response.status).toBe(200)
    expect(mocks.getState).not.toHaveBeenCalled()
    expect(mocks.saveState).not.toHaveBeenCalled()
    expect(mocks.sendReply).not.toHaveBeenCalled()
  })

  it('registra o pedido explícito e pausa a conversa no mesmo número', async () => {
    mocks.getState.mockResolvedValue({
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: false,
    })

    await POST(
      request({
        From: 'whatsapp:+5511999998888',
        WaId: '5511999998888',
        MessageSid: 'SM-handoff-1',
        ButtonPayload: 'menu_falar_pessoa',
      }),
    )

    expect(mocks.saveState).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'HUMAN_HANDOFF' }),
    )
    expect(mocks.sendReply.mock.calls[0]?.[0].reply.body).toContain(
      'mesmo chat',
    )
  })

  it('mantém o bot pausado e não responde automaticamente durante o handoff', async () => {
    mocks.getState.mockResolvedValue({
      step: 'HUMAN_HANDOFF',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: false,
    })

    const response = await POST(
      request({
        From: 'whatsapp:+5511999998888',
        WaId: '5511999998888',
        MessageSid: 'SM-handoff-2',
        Body: 'oi, preciso de ajuda',
      }),
    )

    expect(response.status).toBe(200)
    expect(mocks.sendReply).not.toHaveBeenCalled()
    expect(mocks.saveState).not.toHaveBeenCalled()
    expect(mocks.claimInboundMessage).toHaveBeenCalledWith({
      provider: 'TWILIO',
      providerMessageId: 'SM-handoff-2',
    })
  })

  it('retoma o autoatendimento quando a nutriz escreve "menu" durante a pausa', async () => {
    mocks.getState.mockResolvedValue({
      step: 'HUMAN_HANDOFF',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: false,
    })

    await POST(
      request({
        From: 'whatsapp:+5511999998888',
        WaId: '5511999998888',
        MessageSid: 'SM-handoff-3',
        Body: 'menu',
      }),
    )

    expect(mocks.saveState).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'MENU' }),
    )
    expect(mocks.sendReply).toHaveBeenCalled()
  })
})
