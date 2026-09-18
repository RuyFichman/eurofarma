import { describe, expect, it, vi } from 'vitest'

import { createTwilioNotificationTransport } from '../../lib/notifications/twilio-notification-transport'
import type { WhatsAppProvider } from '../../lib/whatsapp/provider'

function provider(): {
  value: WhatsAppProvider
  sendSessionMessage: ReturnType<typeof vi.fn>
  sendTemplate: ReturnType<typeof vi.fn>
} {
  const sendSessionMessage = vi.fn()
  const sendTemplate = vi.fn()
  return {
    value: { sendSessionMessage, sendTemplate },
    sendSessionMessage,
    sendTemplate,
  }
}

const baseInput = {
  outboxId: 'outbox-1',
  idempotencyKey: 'journey-status:history-1',
  to: '5511999998888',
  body: 'Sua etapa foi atualizada.',
} as const

describe('transporte Twilio da outbox', () => {
  it('envia texto livre dentro da janela de atendimento e retorna o MessageSid', async () => {
    const fake = provider()
    fake.sendSessionMessage.mockResolvedValue({
      outcome: 'SENT',
      providerMessageId: 'SM-freeform-1',
    })

    await expect(
      createTwilioNotificationTransport(fake.value, null).send({
        ...baseInput,
        delivery: 'FREEFORM',
        template: null,
        templateVariables: null,
      }),
    ).resolves.toEqual({ outcome: 'SENT', providerMessageId: 'SM-freeform-1' })

    expect(fake.sendSessionMessage).toHaveBeenCalledWith({
      to: baseInput.to,
      reply: { type: 'text', body: baseInput.body },
    })
    expect(fake.sendTemplate).not.toHaveBeenCalled()
  })

  it('envia template aprovado fora da janela de atendimento', async () => {
    const fake = provider()
    fake.sendTemplate.mockResolvedValue({
      outcome: 'SENT',
      providerMessageId: 'SM-template-1',
    })

    await expect(
      createTwilioNotificationTransport(fake.value, null).send({
        ...baseInput,
        delivery: 'TEMPLATE',
        template: 'journey-status-changed',
        templateVariables: {
          status: 'Ficha recebida',
          areaUrl: 'https://nutrilink.test/meu-agendamento',
        },
      }),
    ).resolves.toEqual({ outcome: 'SENT', providerMessageId: 'SM-template-1' })

    expect(fake.sendTemplate).toHaveBeenCalledWith({
      to: baseInput.to,
      template: 'journey-status-changed',
      variables: {
        status: 'Ficha recebida',
        areaUrl: 'https://nutrilink.test/meu-agendamento',
      },
    })
    expect(fake.sendSessionMessage).not.toHaveBeenCalled()
  })

  it('mantém a falha de configuração como retentável para a outbox', async () => {
    await expect(
      createTwilioNotificationTransport(null, null).send({
        ...baseInput,
        delivery: 'TEMPLATE',
        template: 'kit-delivery-follow-up',
        templateVariables: {
          areaUrl: 'https://nutrilink.test/meu-agendamento',
        },
      }),
    ).resolves.toEqual({
      outcome: 'RETRYABLE_FAILURE',
      errorCode: 'TWILIO_NOT_CONFIGURED',
    })
  })
})
