import { describe, it, expect } from 'vitest'

import { extractInboundMessage } from '../../lib/whatsapp/payload'
import { buildBrazilianWhatsappCandidates } from '../../lib/whatsapp/phone-candidates'

function envelope(value: Record<string, unknown>): unknown {
  return {
    object: 'whatsapp_business_account',
    entry: [{ id: '1', changes: [{ field: 'messages', value }] }],
  }
}

describe('extractInboundMessage', () => {
  it('extrai mensagem de texto', () => {
    const message = extractInboundMessage(
      envelope({
        messages: [
          {
            from: '5511999998888',
            id: 'wamid.1',
            type: 'text',
            text: { body: '05/06 09:30' },
          },
        ],
      }),
    )
    expect(message).toEqual({
      from: '5511999998888',
      messageId: 'wamid.1',
      text: '05/06 09:30',
      replyId: null,
    })
  })

  it('extrai resposta de botao', () => {
    const message = extractInboundMessage(
      envelope({
        messages: [
          {
            from: '5511999998888',
            id: 'wamid.2',
            type: 'interactive',
            interactive: {
              type: 'button_reply',
              button_reply: { id: 'agendou_sim', title: 'Sim, consegui' },
            },
          },
        ],
      }),
    )
    expect(message?.replyId).toBe('agendou_sim')
    expect(message?.text).toBeNull()
  })

  it('extrai resposta de lista', () => {
    const message = extractInboundMessage(
      envelope({
        messages: [
          {
            from: '5511999998888',
            id: 'wamid.3',
            type: 'interactive',
            interactive: {
              type: 'list_reply',
              list_reply: { id: 'motivo_sem_vaga', title: 'Sem vaga' },
            },
          },
        ],
      }),
    )
    expect(message?.replyId).toBe('motivo_sem_vaga')
  })

  /**
   * O mesmo webhook entrega recibo de entrega e leitura. Tratar recibo como
   * mensagem faria o bot responder ao proprio envio, em laco.
   */
  it('ignora recibos de entrega (sem messages)', () => {
    expect(
      extractInboundMessage(
        envelope({ statuses: [{ id: 'wamid.1', status: 'delivered' }] }),
      ),
    ).toBeNull()
  })

  it('ignora payload malformado sem lancar', () => {
    for (const input of [null, undefined, 'texto', 42, {}, { entry: 'x' }]) {
      expect(extractInboundMessage(input)).toBeNull()
    }
  })

  it('ignora mensagem sem remetente ou sem id', () => {
    expect(
      extractInboundMessage(envelope({ messages: [{ id: 'wamid.4' }] })),
    ).toBeNull()
    expect(
      extractInboundMessage(
        envelope({ messages: [{ from: '5511999998888' }] }),
      ),
    ).toBeNull()
  })
})

/**
 * A Meta entrega celular brasileiro ora com o nono digito, ora sem. Sem cobrir
 * as duas formas, a nutriz nao e reconhecida e o agendamento dela nunca aparece.
 */
describe('buildBrazilianWhatsappCandidates', () => {
  it('gera a forma sem o nono digito', () => {
    const candidates = buildBrazilianWhatsappCandidates('5511987654321')
    expect(candidates).toContain('5511987654321')
    expect(candidates).toContain('551187654321')
  })

  it('gera a forma com o nono digito', () => {
    const candidates = buildBrazilianWhatsappCandidates('551187654321')
    expect(candidates).toContain('551187654321')
    expect(candidates).toContain('5511987654321')
  })

  it('nao inventa variacao para telefone fixo', () => {
    // 11 3986-1011 nao comeca em 9: nao ha regra de nono digito.
    expect(buildBrazilianWhatsappCandidates('551139861011')).toEqual([
      '551139861011',
    ])
  })

  it('nao inventa variacao para numero de outro pais', () => {
    expect(buildBrazilianWhatsappCandidates('12025550123')).toEqual([
      '12025550123',
    ])
  })

  it('ignora formatacao e entrada vazia', () => {
    expect(buildBrazilianWhatsappCandidates('+55 (11) 98765-4321')).toContain(
      '5511987654321',
    )
    expect(buildBrazilianWhatsappCandidates('')).toEqual([])
  })
})
