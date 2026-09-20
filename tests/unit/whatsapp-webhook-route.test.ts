import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  signatureValid: vi.fn(),
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

vi.mock('../../lib/whatsapp/signature', () => ({
  isValidWhatsappSignature: mocks.signatureValid,
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

import { POST } from '../../app/api/whatsapp/webhook/route'

function payload(message: Record<string, unknown>) {
  return {
    entry: [{ changes: [{ value: { messages: [message] } }] }],
  }
}

function request(body: unknown): NextRequest {
  return new NextRequest('https://nutrilink.test/api/whatsapp/webhook', {
    method: 'POST',
    headers: { 'x-hub-signature-256': 'sha256=test' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/whatsapp/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('WHATSAPP_APP_SECRET', 'test-secret')
    mocks.signatureValid.mockReturnValue(true)
    mocks.rateLimit.mockReturnValue({ success: true })
    mocks.findNutriz.mockResolvedValue(null)
    mocks.saveState.mockResolvedValue(undefined)
    mocks.sendReply.mockResolvedValue({
      outcome: 'SENT',
      providerMessageId: 'meta-outbound-1',
    })
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

  it('recusa assinatura inválida', async () => {
    mocks.signatureValid.mockReturnValue(false)
    const response = await POST(
      request(payload({ from: '5511999998888', id: 'm1' })),
    )
    expect(response.status).toBe(401)
    expect(mocks.getState).not.toHaveBeenCalled()
  })

  it('abre e persiste o menu para um número ainda não cadastrado', async () => {
    mocks.getState.mockResolvedValue({
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: true,
    })

    const response = await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'm1',
          text: { body: 'Olá' },
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(mocks.saveState).toHaveBeenCalledWith({
      phoneWhatsapp: '5511999998888',
      nutrizProfileId: null,
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
    })
    expect(mocks.sendReply.mock.calls[0]?.[0].reply.type).toBe('buttons')
  })

  it('encerra uma reentrega antes de consultar ou alterar a conversa', async () => {
    mocks.claimInboundMessage.mockResolvedValue({
      id: 'inbound-duplicate',
      claimed: false,
    })

    const response = await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'wamid.duplicate-1',
          text: { body: 'Olá' },
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(mocks.claimInboundMessage).toHaveBeenCalledWith({
      provider: 'META_CLOUD_API',
      providerMessageId: 'wamid.duplicate-1',
    })
    expect(mocks.findNutriz).not.toHaveBeenCalled()
    expect(mocks.getState).not.toHaveBeenCalled()
    expect(mocks.saveState).not.toHaveBeenCalled()
    expect(mocks.createLead).not.toHaveBeenCalled()
    expect(mocks.setReminderConsent).not.toHaveBeenCalled()
    expect(mocks.sendReply).not.toHaveBeenCalled()
  })

  it('resolve cobertura e já pede o nome, sem passar pelo consentimento ainda', async () => {
    mocks.getState.mockResolvedValue({
      step: 'AWAITING_COVERAGE',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: false,
    })
    mocks.resolveCoverage.mockResolvedValue({
      kind: 'eligible',
      city: 'Osasco',
      state: 'SP',
    })

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'm2',
          text: { body: '06000-000' },
        }),
      ),
    )

    expect(mocks.resolveCoverage).toHaveBeenCalledWith('06000-000')
    expect(mocks.saveState).toHaveBeenCalledWith(
      expect.objectContaining({
        step: 'AWAITING_FULL_NAME',
        context: { location: { city: 'Osasco', state: 'SP' } },
      }),
    )
    expect(JSON.stringify(mocks.saveState.mock.calls[0]?.[0])).not.toContain(
      '06000-000',
    )
  })

  it('coleta nome, CPF, e-mail e endereço e só cria o lead depois do aceite', async () => {
    const location = { city: 'Osasco', state: 'SP' }
    mocks.getState
      .mockResolvedValueOnce({
        step: 'AWAITING_FULL_NAME',
        context: { location },
        misunderstoodCount: 0,
        isNewConversation: false,
      })
      .mockResolvedValueOnce({
        step: 'AWAITING_CPF',
        context: { location, registration: { fullName: 'Maria da Silva' } },
        misunderstoodCount: 0,
        isNewConversation: false,
      })
      .mockResolvedValueOnce({
        step: 'AWAITING_EMAIL',
        context: {
          location,
          registration: { fullName: 'Maria da Silva', cpf: '11144477735' },
        },
        misunderstoodCount: 0,
        isNewConversation: false,
      })
      .mockResolvedValueOnce({
        step: 'AWAITING_ADDRESS',
        context: {
          location,
          registration: {
            fullName: 'Maria da Silva',
            cpf: '11144477735',
            email: 'maria@example.com',
          },
        },
        misunderstoodCount: 0,
        isNewConversation: false,
      })
      .mockResolvedValueOnce({
        step: 'AWAITING_CONSENT',
        context: {
          location,
          registration: {
            fullName: 'Maria da Silva',
            cpf: '11144477735',
            email: 'maria@example.com',
            address: 'Rua das Flores, 123',
          },
        },
        misunderstoodCount: 0,
        isNewConversation: false,
      })
    mocks.createLead.mockResolvedValue({
      id: 'profile-1',
      fullName: 'Maria da Silva',
      journeyStatus: 'REGISTERED',
      reminderConsentEnabled: false,
    })

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'm3',
          text: { body: 'Maria da Silva' },
        }),
      ),
    )
    expect(mocks.createLead).not.toHaveBeenCalled()
    expect(mocks.saveState).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ step: 'AWAITING_CPF' }),
    )

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'm4',
          text: { body: '111.444.777-35' },
        }),
      ),
    )
    expect(mocks.createLead).not.toHaveBeenCalled()
    expect(mocks.saveState).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ step: 'AWAITING_EMAIL' }),
    )

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'm5',
          text: { body: 'maria@example.com' },
        }),
      ),
    )
    expect(mocks.createLead).not.toHaveBeenCalled()
    expect(mocks.saveState).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ step: 'AWAITING_ADDRESS' }),
    )

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'm6',
          text: { body: 'Rua das Flores, 123' },
        }),
      ),
    )
    expect(mocks.createLead).not.toHaveBeenCalled()
    expect(mocks.saveState).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ step: 'AWAITING_CONSENT' }),
    )

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'm7',
          interactive: {
            type: 'button_reply',
            button_reply: { id: 'cadastro_aceito', title: 'Sim, concordo' },
          },
        }),
      ),
    )

    expect(mocks.createLead).toHaveBeenCalledWith({
      phoneWhatsapp: '5511999998888',
      fullName: 'Maria da Silva',
      cpf: '11144477735',
      email: 'maria@example.com',
      address: 'Rua das Flores, 123',
      city: 'Osasco',
      state: 'SP',
    })
    expect(mocks.saveState).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        nutrizProfileId: 'profile-1',
        step: 'POST_REGISTRATION_MENU',
      }),
    )
  })

  it('registra opt-in de lembretes com o id da mensagem como idempotência', async () => {
    mocks.findNutriz.mockResolvedValue({
      id: 'profile-1',
      fullName: 'Maria da Silva',
      journeyStatus: 'FORM_RECEIVED',
      reminderConsentEnabled: false,
    })
    mocks.getState.mockResolvedValue({
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: false,
    })

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'wamid.reminder-1',
          interactive: {
            type: 'button_reply',
            button_reply: {
              id: 'lembretes_ativar',
              title: 'Ativar lembretes',
            },
          },
        }),
      ),
    )

    mocks.getState.mockResolvedValueOnce({
      step: 'AWAITING_REMINDER_REFERENCE',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: false,
    })
    mocks.setReminderConsent.mockResolvedValue({
      status: 'UPDATED',
      enabled: true,
    })
    mocks.claimInboundMessage.mockResolvedValue({
      id: 'inbound-1',
      claimed: true,
    })
    mocks.finishInboundMessage.mockResolvedValue(undefined)

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'wamid.reminder-2',
          text: { body: '15/09/2026' },
        }),
      ),
    )

    expect(mocks.setReminderConsent).toHaveBeenCalledWith({
      nutrizProfileId: 'profile-1',
      enabled: true,
      source: 'WHATSAPP',
      sourceEventId: 'whatsapp:wamid.reminder-2',
      referenceDate: new Date('2026-09-15T12:00:00.000Z'),
    })
    expect(mocks.sendReply.mock.calls[1]?.[0].reply.body).toContain(
      'Lembretes ativados',
    )
  })

  it('mantém só a localização e reabre o nome quando o cadastro falha', async () => {
    mocks.getState.mockResolvedValue({
      step: 'AWAITING_CONSENT',
      context: {
        location: { city: 'Osasco', state: 'SP' },
        registration: {
          fullName: 'Maria da Silva',
          cpf: '11144477735',
          email: 'maria@example.com',
          address: 'Rua das Flores, 123',
        },
      },
      misunderstoodCount: 0,
      isNewConversation: false,
    })
    mocks.createLead.mockRejectedValue(new Error('database unavailable'))

    const response = await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'm5',
          interactive: {
            type: 'button_reply',
            button_reply: { id: 'cadastro_aceito', title: 'Sim, concordo' },
          },
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(mocks.saveState).toHaveBeenCalledWith(
      expect.objectContaining({
        step: 'AWAITING_FULL_NAME',
        context: { location: { city: 'Osasco', state: 'SP' } },
      }),
    )
    expect(mocks.sendReply.mock.calls[0]?.[0].reply.body).toContain(
      'Não foi possível salvar',
    )
  })

  it('registra o pedido explícito e pausa a conversa no mesmo chat', async () => {
    mocks.getState.mockResolvedValue({
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: false,
    })

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'handoff-request-1',
          interactive: {
            type: 'button_reply',
            button_reply: {
              id: 'menu_falar_pessoa',
              title: 'Falar com a equipe',
            },
          },
        }),
      ),
    )

    expect(mocks.saveState).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'HUMAN_HANDOFF' }),
    )
    expect(mocks.sendReply.mock.calls[0]?.[0].reply.body).toContain(
      'mesmo chat',
    )
  })

  it('pausa o bot depois de solicitar atendimento humano', async () => {
    mocks.getState.mockResolvedValue({
      step: 'HUMAN_HANDOFF',
      context: {},
      misunderstoodCount: 0,
      isNewConversation: false,
    })

    await POST(
      request(
        payload({
          from: '5511999998888',
          id: 'handoff-1',
          text: { body: 'oi, preciso de ajuda' },
        }),
      ),
    )

    expect(mocks.sendReply).not.toHaveBeenCalled()
    expect(mocks.saveState).not.toHaveBeenCalled()
  })

  it('ignora recibos e excesso de mensagens sem produzir efeitos', async () => {
    await POST(
      request({ entry: [{ changes: [{ value: { statuses: [{}] } }] }] }),
    )
    expect(mocks.getState).not.toHaveBeenCalled()

    mocks.rateLimit.mockReturnValue({ success: false })
    await POST(
      request(
        payload({ from: '5511999998888', id: 'm6', text: { body: 'oi' } }),
      ),
    )
    expect(mocks.getState).not.toHaveBeenCalled()
  })
})
