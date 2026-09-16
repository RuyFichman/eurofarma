import { describe, expect, it } from 'vitest'

import { buildSendPayload } from '../../lib/whatsapp/client'
import {
  advanceConversation,
  buildRegistrationFailureOutcome,
  REPLY_IDS,
  type ConversationContext,
  type ConversationProfile,
  type ConversationStep,
} from '../../lib/whatsapp/conversation'
import type { WhatsappCoverageResult } from '../../lib/whatsapp/coverage'
import { hydrateWhatsappReply } from '../../lib/whatsapp/reply'

const PROFILE: ConversationProfile = {
  fullName: 'Maria da Silva',
  journeyStatus: 'FORM_RECEIVED',
  reminderConsentEnabled: false,
}

function step(
  conversationStep: ConversationStep,
  input: {
    text?: string
    replyId?: string
    context?: ConversationContext
    misunderstoodCount?: number
    coverage?: WhatsappCoverageResult
    profile?: ConversationProfile | null
    isNewConversation?: boolean
  } = {},
) {
  return advanceConversation({
    step: conversationStep,
    context: input.context ?? {},
    misunderstoodCount: input.misunderstoodCount ?? 0,
    text: input.text ?? null,
    replyId: input.replyId ?? null,
    coverage: input.coverage,
    profile: input.profile ?? null,
    isNewConversation: input.isNewConversation,
  })
}

describe('advanceConversation', () => {
  it('apresenta o menu no primeiro contato sem exigir cadastro', () => {
    const result = step('MENU', {
      text: 'qualquer mensagem',
      isNewConversation: true,
    })
    expect(result.reply.type).toBe('buttons')
    expect(result.nextStep).toBe('MENU')
    expect(result.effect.kind).toBe('none')
  })

  it('retoma uma nutriz cadastrada mostrando o status categórico', () => {
    const result = step('MENU', {
      text: 'oi',
      profile: PROFILE,
    })
    expect(result.reply.body).toContain('Maria')
    expect(result.reply.body).toContain('Ficha recebida')
    expect(result.reply.body).toContain('não realiza avaliação clínica')
    expect(result.reply.body).toContain('orientações recebidas diretamente')
    expect(result.reply.type).toBe('list')
  })

  it('oferece opt-in de lembretes somente para perfil cadastrado', () => {
    const registered = step('MENU', {
      replyId: REPLY_IDS.menuReminders,
      profile: PROFILE,
    })
    expect(registered.reply.body).toContain('desativados')
    expect(registered.effect.kind).toBe('none')
    if (registered.reply.type === 'buttons') {
      expect(registered.reply.buttons[0]?.id).toBe(REPLY_IDS.remindersEnable)
    }

    const anonymous = step('MENU', {
      replyId: REPLY_IDS.menuReminders,
    })
    expect(anonymous.reply.body).toContain('cadastro opcional')
    expect(anonymous.effect.kind).toBe('none')
  })

  it('produz efeitos separados para ativar e cancelar lembretes', () => {
    const enabled = step('MENU', {
      replyId: REPLY_IDS.remindersEnable,
      profile: PROFILE,
    })
    expect(enabled.effect).toEqual({
      kind: 'set_reminder_consent',
      enabled: true,
    })
    expect(enabled.reply.body).toContain('não agenda')

    const disabled = step('MENU', {
      replyId: REPLY_IDS.remindersDisable,
      profile: { ...PROFILE, reminderConsentEnabled: true },
    })
    expect(disabled.effect).toEqual({
      kind: 'set_reminder_consent',
      enabled: false,
    })
    expect(disabled.reply.body).toContain('cancelamento foi registrado')

    const disabledByText = step('MENU', {
      text: 'não quero mais lembretes',
      profile: { ...PROFILE, reminderConsentEnabled: true },
    })
    expect(disabledByText.effect).toEqual({
      kind: 'set_reminder_consent',
      enabled: false,
    })
  })

  it('abre FAQ em lista com cinco perguntas', () => {
    const result = step('MENU', { replyId: REPLY_IDS.menuKnowMore })
    expect(result.nextStep).toBe('FAQ')
    expect(result.reply.type).toBe('list')
    if (result.reply.type === 'list') expect(result.reply.rows).toHaveLength(5)
  })

  it('responde FAQ e oferece próxima ação', () => {
    const result = step('FAQ', { replyId: REPLY_IDS.faqStorage })
    expect(result.nextStep).toBe('FAQ')
    expect(result.reply.type).toBe('buttons')
    expect(result.reply.body).toContain('O Lactare orienta')
    if (result.reply.type === 'buttons') {
      expect(result.reply.buttons.map(({ id }) => id)).toEqual([
        REPLY_IDS.faqMore,
        REPLY_IDS.faqDonate,
        REPLY_IDS.faqSite,
      ])
    }
  })

  it('encaminha pergunta de saúde específica para contato humano', () => {
    const result = step('FAQ', { text: 'Tomo um medicamento, posso doar?' })
    expect(result.nextStep).toBe('MENU')
    expect(result.reply.body).toContain('equipe do Lactare')
    expect(result.reply.body).toContain('não transfere')
  })

  it('pede CEP ou município sem prometer atendimento', () => {
    const result = step('MENU', { replyId: REPLY_IDS.menuDonate })
    expect(result.nextStep).toBe('AWAITING_COVERAGE')
    expect(result.reply.body).toContain('não será salvo')
  })

  it('guarda somente cidade e UF quando a cobertura é positiva', () => {
    const result = step('AWAITING_COVERAGE', {
      text: '06000-000',
      coverage: { kind: 'eligible', city: 'Osasco', state: 'SP' },
    })
    expect(result.nextStep).toBe('AWAITING_CONSENT')
    expect(result.context).toEqual({
      location: { city: 'Osasco', state: 'SP' },
    })
    expect(JSON.stringify(result.context)).not.toContain('06000')
    expect(result.reply.body).toContain('não confirma')
    expect(result.reply.body).toContain('Antes de pedir seu nome')
  })

  it('não tenta cadastrar novamente um perfil reconhecido', () => {
    const result = step('AWAITING_COVERAGE', {
      text: 'Osasco',
      coverage: { kind: 'eligible', city: 'Osasco', state: 'SP' },
      profile: PROFILE,
    })
    expect(result.nextStep).toBe('MENU')
    expect(result.effect.kind).toBe('none')
    expect(result.reply.body).toContain('{whatsapp}')
  })

  it('encaminha localização externa ao diretório oficial', () => {
    const result = step('AWAITING_COVERAGE', {
      text: 'Campinas',
      coverage: { kind: 'outside', city: 'Campinas', state: 'SP' },
    })
    expect(result.nextStep).toBe('MENU')
    expect(result.reply.body).toContain('{directoryUrl}')
    expect(result.effect.kind).toBe('none')
  })

  it('obtém consentimento antes de pedir ou persistir o nome', () => {
    const result = step('AWAITING_CONSENT', {
      replyId: REPLY_IDS.registrationAccept,
      context: { location: { city: 'Osasco', state: 'SP' } },
    })
    expect(result.nextStep).toBe('AWAITING_FULL_NAME')
    expect(result.context).toEqual({
      location: { city: 'Osasco', state: 'SP' },
    })
    expect(result.reply.body).toContain('nome completo')
    expect(result.effect.kind).toBe('none')
  })

  it('não avança com nome inválido', () => {
    const context = { location: { city: 'Osasco', state: 'SP' } }
    const result = step('AWAITING_FULL_NAME', { text: '12', context })
    expect(result.nextStep).toBe('AWAITING_FULL_NAME')
    expect(result.context).toEqual(context)
  })

  it('cria efeito de lead ao receber o nome depois do aceite', () => {
    const result = step('AWAITING_FULL_NAME', {
      text: 'Maria da Silva',
      context: { location: { city: 'Osasco', state: 'SP' } },
    })
    expect(result.effect).toEqual({
      kind: 'create_lead',
      fullName: 'Maria da Silva',
      city: 'Osasco',
      state: 'SP',
    })
  })

  it('recusa cadastro sem criar efeito nem manter rascunho', () => {
    const result = step('AWAITING_CONSENT', {
      replyId: REPLY_IDS.registrationDecline,
      context: {
        location: { city: 'Osasco', state: 'SP' },
      },
    })
    expect(result.nextStep).toBe('MENU')
    expect(result.context).toEqual({})
    expect(result.effect.kind).toBe('none')
  })

  it('oferece contato depois de duas tentativas incompreendidas', () => {
    const result = step('MENU', {
      text: '???',
      misunderstoodCount: 1,
    })
    expect(result.reply.body).toContain('canais oficiais')
    expect(result.nextStep).toBe('MENU')
  })

  it('reinicia estados legados no menu sem interpretar dados antigos', () => {
    const result = step('AWAITING_DATE_CONFIRMATION', { text: '05/06 09:30' })
    expect(result.nextStep).toBe('MENU')
    expect(result.effect.kind).toBe('none')
  })

  it('preserva somente a localização consentida após falha de gravação', () => {
    const context = { location: { city: 'Osasco', state: 'SP' } }
    const result = buildRegistrationFailureOutcome(context)
    expect(result.nextStep).toBe('AWAITING_FULL_NAME')
    expect(result.context).toEqual(context)
  })
})

describe('hydrateWhatsappReply', () => {
  it('resolve links e canais oficiais antes do envio', () => {
    const reply = hydrateWhatsappReply(
      {
        type: 'text',
        body: '{howItWorksUrl} {directoryUrl} {whatsapp} {phone} {verifiedAt}',
      },
      'https://nutrilink.test',
    )
    expect(reply.body).toContain('https://nutrilink.test/como-funciona')
    expect(reply.body).toContain('https://rblh.fiocruz.br/')
    expect(reply.body).toContain('+55 (11) 96629-0681')
    expect(reply.body).not.toContain('{')
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

  it('trunca título de botão no limite de 20 da Meta', () => {
    const payload = buildSendPayload('5511999998888', {
      type: 'buttons',
      body: 'pergunta',
      buttons: [{ id: 'x', title: 'a'.repeat(40) }],
    }) as {
      interactive: { action: { buttons: { reply: { title: string } }[] } }
    }
    expect(payload.interactive.action.buttons[0]?.reply.title).toHaveLength(20)
  })

  it('monta lista com uma seção', () => {
    const payload = buildSendPayload('5511999998888', {
      type: 'list',
      body: 'dúvidas',
      button: 'Escolher',
      rows: [{ id: REPLY_IDS.faqPain, title: 'Doar dói?' }],
    }) as { interactive: { type: string; action: { sections: unknown[] } } }
    expect(payload.interactive.type).toBe('list')
    expect(payload.interactive.action.sections).toHaveLength(1)
  })
})
