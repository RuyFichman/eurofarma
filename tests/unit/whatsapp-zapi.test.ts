import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  extractZapiInboundMessage,
  isZapiTestPhoneAllowed,
} from '../../lib/whatsapp/zapi-payload'
import { ZapiWhatsAppProvider } from '../../lib/whatsapp/zapi-provider'

const instanceId = 'instance-test'

function inbound(overrides: Record<string, unknown> = {}) {
  return {
    type: 'ReceivedCallback',
    instanceId,
    phone: '5511999998888',
    messageId: 'zapi-message-1',
    fromMe: false,
    isGroup: false,
    isNewsletter: false,
    isStatusReply: false,
    isEdit: false,
    text: { message: 'Olá' },
    ...overrides,
  }
}

describe('integração Z-API', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('normaliza texto e descarta eventos que não podem acionar o bot', () => {
    expect(extractZapiInboundMessage(inbound(), instanceId)).toEqual({
      from: '5511999998888',
      messageId: 'zapi-message-1',
      text: 'Olá',
      replyId: null,
    })

    for (const payload of [
      inbound({ fromMe: true }),
      inbound({ isGroup: true }),
      inbound({ isNewsletter: true }),
      inbound({ isStatusReply: true }),
      inbound({ isEdit: true }),
      inbound({ type: 'MessageStatusCallback' }),
      inbound({ image: { imageUrl: 'https://z-api.test/image' }, text: null }),
      inbound({ instanceId: 'other-instance' }),
    ]) {
      expect(extractZapiInboundMessage(payload, instanceId)).toBeNull()
    }
  })

  it('descarta payloads malformados sem tentar inferir telefone ou conteúdo', () => {
    for (const payload of [
      null,
      [],
      'ReceivedCallback',
      {},
      inbound({ phone: 'telefone-inválido' }),
      inbound({ messageId: '   ' }),
      inbound({ text: { message: '   ' } }),
      inbound({ text: { message: 42 } }),
    ]) {
      expect(extractZapiInboundMessage(payload, instanceId)).toBeNull()
    }
  })

  it('extrai os ids das respostas de botão e de lista', () => {
    expect(
      extractZapiInboundMessage(
        inbound({
          text: null,
          buttonsResponseMessage: {
            buttonId: 'menu_quero_doar',
            message: 'Quero doar leite',
          },
        }),
        instanceId,
      ),
    ).toEqual({
      from: '5511999998888',
      messageId: 'zapi-message-1',
      text: 'Quero doar leite',
      replyId: 'menu_quero_doar',
    })

    expect(
      extractZapiInboundMessage(
        inbound({
          text: null,
          listResponseMessage: {
            title: 'Lembretes',
            singleSelectReply: { selectedRowId: 'menu_lembretes' },
          },
        }),
        instanceId,
      ),
    ).toEqual(
      expect.objectContaining({
        text: 'Lembretes',
        replyId: 'menu_lembretes',
      }),
    )
  })

  it('exige allowlist quando o modo de teste está ativo', () => {
    vi.stubEnv('ZAPI_TEST_MODE', 'true')
    vi.stubEnv('ZAPI_TEST_ALLOWED_PHONES', '5511999998888, 5511888887777')

    expect(isZapiTestPhoneAllowed('5511999998888')).toBe(true)
    expect(isZapiTestPhoneAllowed('5511777776666')).toBe(false)

    vi.stubEnv('ZAPI_TEST_MODE', 'false')
    expect(isZapiTestPhoneAllowed('5511777776666')).toBe(true)
  })

  it('envia texto, botões e listas com os contratos da Z-API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ messageId: 'zapi-outbound-1' }), {
        status: 200,
      }),
    )
    const provider = new ZapiWhatsAppProvider(
      {
        instanceId,
        instanceToken: 'token-test',
        clientToken: 'client-token-test',
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
      providerMessageId: 'zapi-outbound-1',
    })

    await provider.sendSessionMessage({
      to: '5511999998888',
      reply: {
        type: 'buttons',
        body: 'Escolha uma opção',
        buttons: [{ id: 'doar', title: 'Quero doar' }],
      },
    })
    await provider.sendSessionMessage({
      to: '5511999998888',
      reply: {
        type: 'list',
        body: 'Mais opções',
        button: 'Abrir opções',
        rows: [{ id: 'lembretes', title: 'Lembretes' }],
      },
    })

    const [textUrl, textRequest] = fetchMock.mock.calls[0] ?? []
    expect(textUrl).toContain('/send-text')
    expect(textRequest.headers['Client-Token']).toBe('client-token-test')
    expect(JSON.parse(textRequest.body)).toEqual({
      phone: '5511999998888',
      message: 'Olá',
    })

    const [buttonsUrl, buttonsRequest] = fetchMock.mock.calls[1] ?? []
    expect(buttonsUrl).toContain('/send-button-list')
    expect(JSON.parse(buttonsRequest.body)).toMatchObject({
      buttonList: { buttons: [{ id: 'doar', label: 'Quero doar' }] },
    })

    const [listUrl, listRequest] = fetchMock.mock.calls[2] ?? []
    expect(listUrl).toContain('/send-option-list')
    expect(JSON.parse(listRequest.body)).toMatchObject({
      optionList: {
        buttonLabel: 'Abrir opções',
        options: [{ id: 'lembretes', title: 'Lembretes' }],
      },
    })
  })
})
