import { describe, expect, it, vi } from 'vitest'

import { extractTwilioInboundMessage } from '../../lib/whatsapp/twilio-payload'
import {
  isValidTwilioSignature,
  signTwilioRequest,
} from '../../lib/whatsapp/twilio-signature'
import {
  buildTwilioBody,
  TwilioWhatsAppProvider,
} from '../../lib/whatsapp/twilio-provider'

describe('integração com o Twilio WhatsApp Sandbox', () => {
  it('extrai mensagem sem persistir o prefixo whatsapp', () => {
    const form = new URLSearchParams({
      From: 'whatsapp:+5511999998888',
      WaId: '5511999998888',
      MessageSid: 'SM123',
      Body: 'Oi',
    })

    expect(extractTwilioInboundMessage(form)).toEqual({
      from: '5511999998888',
      messageId: 'SM123',
      text: 'Oi',
      replyId: null,
    })
  })

  it('valida a assinatura usando URL e formulário exatos', () => {
    const url = 'https://demo.example/api/whatsapp/twilio'
    const form = new URLSearchParams({
      From: 'whatsapp:+5511999998888',
      MessageSid: 'SM123',
      Body: 'Oi',
    })
    const signatureHeader = signTwilioRequest({
      url,
      form,
      authToken: 'test-token',
    })

    expect(
      isValidTwilioSignature({
        url,
        form,
        signatureHeader,
        authToken: 'test-token',
      }),
    ).toBe(true)
    expect(
      isValidTwilioSignature({
        url,
        form,
        signatureHeader,
        authToken: 'wrong-token',
      }),
    ).toBe(false)
  })

  it('transforma botões em opções de texto para o Sandbox', () => {
    expect(
      buildTwilioBody({
        type: 'buttons',
        body: 'Como posso ajudar?',
        buttons: [
          { id: 'a', title: 'Quero saber mais' },
          { id: 'b', title: 'Quero doar leite' },
        ],
      }),
    ).toContain('• Quero saber mais\n• Quero doar leite')
  })

  it('envia mensagem de sessão sem expor a configuração ao domínio', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ sid: 'SM-session-1' }), { status: 201 }),
      )
    const provider = new TwilioWhatsAppProvider(
      {
        accountSid: 'AC-test',
        authToken: 'secret',
        from: 'whatsapp:+14155238886',
      },
      fetchMock,
    )

    await expect(
      provider.sendSessionMessage({
        to: '5511999998888',
        reply: { type: 'text', body: 'Olá' },
      }),
    ).resolves.toEqual({
      outcome: 'SENT',
      providerMessageId: 'SM-session-1',
    })

    const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams
    expect(body.get('To')).toBe('whatsapp:+5511999998888')
    expect(body.get('Body')).toBe('Olá')
  })

  it('mapeia template lógico e variáveis semânticas para o formato Twilio', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ sid: 'SM-template-1' }), { status: 201 }),
      )
    const provider = new TwilioWhatsAppProvider(
      {
        accountSid: 'AC-test',
        authToken: 'secret',
        from: '+14155238886',
        messagingServiceSid: 'MG-test',
        templates: {
          'journey-status-changed': {
            contentSid: 'HX-test',
            variableNames: ['status', 'areaUrl'],
          },
        },
      },
      fetchMock,
    )

    await expect(
      provider.sendTemplate({
        to: '5511999998888',
        template: 'journey-status-changed',
        variables: {
          status: 'Ficha recebida',
          areaUrl: 'https://nutrilink.test/meu-agendamento',
        },
      }),
    ).resolves.toEqual({
      outcome: 'SENT',
      providerMessageId: 'SM-template-1',
    })

    const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams
    expect(body.get('ContentSid')).toBe('HX-test')
    expect(body.get('ContentVariables')).toBe(
      JSON.stringify({
        '1': 'Ficha recebida',
        '2': 'https://nutrilink.test/meu-agendamento',
      }),
    )
  })
})
