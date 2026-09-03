import { describe, it, expect } from 'vitest'

import {
  advanceConversation,
  REPLY_IDS,
  type ConversationStep,
} from '../../lib/whatsapp/conversation'
import { buildSendPayload } from '../../lib/whatsapp/client'
import { formatShortDate } from '../../lib/utils/format-date'

const NOW = new Date('2026-03-10T12:00:00.000Z')

function step(
  step: ConversationStep,
  input: { text?: string; replyId?: string; draft?: Date | null } = {},
) {
  return advanceConversation({
    step,
    draftScheduledAt: input.draft ?? null,
    text: input.text ?? null,
    replyId: input.replyId ?? null,
    now: NOW,
  })
}

describe('advanceConversation', () => {
  it('pergunta com dois botoes no inicio', () => {
    const result = step('ASKED_SCHEDULED', { text: 'oi' })
    expect(result.reply.type).toBe('buttons')
    expect(result.nextStep).toBe('ASKED_SCHEDULED')
    expect(result.effect.kind).toBe('none')
  })

  it('"sim" leva ao pedido de data', () => {
    const result = step('ASKED_SCHEDULED', { replyId: REPLY_IDS.scheduledYes })
    expect(result.nextStep).toBe('AWAITING_DATE')
    expect(result.reply.type).toBe('text')
  })

  /** Cinco motivos nao cabem em botoes (a Meta aceita tres): vira lista. */
  it('"ainda nao" leva a lista de motivos com cinco itens', () => {
    const result = step('ASKED_SCHEDULED', { replyId: REPLY_IDS.scheduledNo })
    expect(result.nextStep).toBe('AWAITING_FAILURE_REASON')
    expect(result.reply.type).toBe('list')
    if (result.reply.type === 'list') {
      expect(result.reply.rows).toHaveLength(5)
    }
  })

  it('data valida vira rascunho e pedido de confirmacao', () => {
    const result = step('AWAITING_DATE', { text: '05/06 09:30' })
    expect(result.nextStep).toBe('AWAITING_DATE_CONFIRMATION')
    expect(result.draftScheduledAt).not.toBeNull()
    expect(formatShortDate(result.draftScheduledAt!)).toBe('05/06/2026')
    expect(result.reply.type).toBe('buttons')
    expect(result.effect.kind).toBe('none')
  })

  it('data invalida repete a instrucao sem avancar', () => {
    const result = step('AWAITING_DATE', { text: 'quinta que vem' })
    expect(result.nextStep).toBe('AWAITING_DATE')
    expect(result.draftScheduledAt).toBeNull()
    expect(result.effect.kind).toBe('none')
  })

  it('confirmar grava o agendamento e encerra', () => {
    const draft = new Date('2026-06-05T12:30:00.000Z')
    const result = step('AWAITING_DATE_CONFIRMATION', {
      replyId: REPLY_IDS.dateOk,
      draft,
    })
    expect(result.nextStep).toBe('FINISHED')
    expect(result.effect).toEqual({
      kind: 'save_scheduled',
      scheduledAt: draft,
    })
  })

  it('corrigir volta a pedir a data e descarta o rascunho', () => {
    const result = step('AWAITING_DATE_CONFIRMATION', {
      replyId: REPLY_IDS.dateFix,
      draft: new Date('2026-06-05T12:30:00.000Z'),
    })
    expect(result.nextStep).toBe('AWAITING_DATE')
    expect(result.draftScheduledAt).toBeNull()
    expect(result.effect.kind).toBe('none')
  })

  it('confirmar sem rascunho nao grava nada', () => {
    const result = step('AWAITING_DATE_CONFIRMATION', {
      replyId: REPLY_IDS.dateOk,
      draft: null,
    })
    expect(result.effect.kind).toBe('none')
    expect(result.nextStep).toBe('AWAITING_DATE')
  })

  it('resposta solta na confirmacao repete a pergunta mantendo o rascunho', () => {
    const draft = new Date('2026-06-05T12:30:00.000Z')
    const result = step('AWAITING_DATE_CONFIRMATION', { text: 'oi', draft })
    expect(result.nextStep).toBe('AWAITING_DATE_CONFIRMATION')
    expect(result.draftScheduledAt).toEqual(draft)
    expect(result.effect.kind).toBe('none')
  })

  it('motivo escolhido grava o "nao consegui" e encerra', () => {
    const result = step('AWAITING_FAILURE_REASON', {
      replyId: 'motivo_sem_vaga',
    })
    expect(result.nextStep).toBe('FINISHED')
    expect(result.effect).toEqual({
      kind: 'save_not_scheduled',
      reason: 'NO_SLOT',
    })
  })

  it('motivo desconhecido repete a lista', () => {
    const result = step('AWAITING_FAILURE_REASON', { replyId: 'motivo_xyz' })
    expect(result.nextStep).toBe('AWAITING_FAILURE_REASON')
    expect(result.effect.kind).toBe('none')
  })

  /**
   * O reenvio da Meta chega com a conversa ja em FINISHED. Como esse estado nao
   * grava nada, o evento repetido nao duplica agendamento.
   */
  it('mensagem depois de concluido recomeca sem gravar', () => {
    const result = step('FINISHED', { replyId: REPLY_IDS.dateOk })
    expect(result.nextStep).toBe('ASKED_SCHEDULED')
    expect(result.effect.kind).toBe('none')
  })
})

describe('buildSendPayload', () => {
  it('monta texto simples', () => {
    const payload = buildSendPayload('5511999998888', {
      type: 'text',
      body: 'oi',
    })
    expect(payload).toMatchObject({
      messaging_product: 'whatsapp',
      to: '5511999998888',
      type: 'text',
      text: { body: 'oi' },
    })
  })

  it('trunca titulo de botao no limite de 20 da Meta', () => {
    const payload = buildSendPayload('5511999998888', {
      type: 'buttons',
      body: 'pergunta',
      buttons: [{ id: 'x', title: 'a'.repeat(40) }],
    }) as {
      interactive: { action: { buttons: { reply: { title: string } }[] } }
    }
    expect(payload.interactive.action.buttons[0]?.reply.title).toHaveLength(20)
  })

  it('monta lista com uma secao', () => {
    const payload = buildSendPayload('5511999998888', {
      type: 'list',
      body: 'motivos',
      button: 'Escolher',
      rows: [{ id: 'motivo_outro', title: 'Outro' }],
    }) as { interactive: { type: string; action: { sections: unknown[] } } }
    expect(payload.interactive.type).toBe('list')
    expect(payload.interactive.action.sections).toHaveLength(1)
  })
})
