import { describe, expect, it } from 'vitest'

import { buildSendPayload } from '../../lib/whatsapp/client'
import {
  advanceConversation,
  buildRegistrationFailureOutcome,
  REPLY_IDS,
  resolveTextReplyId,
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

const VALID_CPF = '11144477735'

describe('resolveTextReplyId', () => {
  it('aceita por texto as opções exibidas no Sandbox', () => {
    expect(resolveTextReplyId('Quero saber mais')).toBe(REPLY_IDS.menuKnowMore)
    expect(resolveTextReplyId('SIM, CONCORDO!')).toBe(
      REPLY_IDS.registrationAccept,
    )
    expect(resolveTextReplyId('Quem pode doar?')).toBe(
      REPLY_IDS.faqWhoCanDonate,
    )
  })
})

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
    now?: Date
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
    now: input.now,
  })
}

describe('advanceConversation — primeiro contato e retomada', () => {
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
    expect(enabled.effect).toEqual({ kind: 'none' })
    expect(enabled.nextStep).toBe('AWAITING_REMINDER_REFERENCE')
    expect(enabled.reply.body).toContain('data')

    const enabledWithReference = step('AWAITING_REMINDER_REFERENCE', {
      text: '15/09/2026',
      profile: PROFILE,
      now: new Date('2026-09-16T15:00:00.000Z'),
    })
    expect(enabledWithReference.effect).toEqual({
      kind: 'set_reminder_consent',
      enabled: true,
      referenceDate: '2026-09-15',
    })
    expect(enabledWithReference.reply.body).toContain('não agenda')

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
})

describe('advanceConversation — atendimento humano (Seção 4)', () => {
  it('pausa o bot e registra o pedido explícito de atendimento humano', () => {
    const open = step('MENU', {
      replyId: REPLY_IDS.menuHuman,
      now: new Date('2026-09-16T13:00:00.000Z'),
    })
    expect(open.nextStep).toBe('HUMAN_HANDOFF')
    expect(open.reply.body).toContain('mesmo chat')
    expect(open.reply.body).toContain('bot ficará pausado')

    const outsideHours = step('MENU', {
      text: 'quero falar com a equipe',
      now: new Date('2026-09-16T21:00:00.000Z'),
    })
    expect(outsideHours.nextStep).toBe('HUMAN_HANDOFF')
    expect(outsideHours.reply.body).toContain('próxima janela')
  })

  it('encaminha após a segunda tentativa incompreendida no menu', () => {
    const first = step('MENU', { text: '???' })
    expect(first.nextStep).toBe('MENU')
    expect(first.misunderstoodCount).toBe(1)
    expect(first.reply.body).toContain('Não consegui entender')

    const second = step('MENU', { text: '???', misunderstoodCount: 1 })
    expect(second.nextStep).toBe('HUMAN_HANDOFF')
  })

  it('encaminha pergunta de saúde específica direto para o handoff', () => {
    const result = step('FAQ_MENU', {
      text: 'Tomo um medicamento, posso doar?',
    })
    expect(result.nextStep).toBe('HUMAN_HANDOFF')
  })

  it('não trata endereço com "saúde" no nome da rua como pergunta de saúde', () => {
    const result = step('AWAITING_ADDRESS', {
      text: 'Rua da Saúde, 45, Bairro Central',
      context: {
        location: { city: 'Osasco', state: 'SP' },
        registration: {
          fullName: 'Maria da Silva',
          cpf: VALID_CPF,
          email: 'maria@example.com',
        },
      },
    })
    expect(result.nextStep).toBe('AWAITING_CONSENT')
  })

  it('retoma o autoatendimento quando a nutriz escreve "menu" durante a pausa', () => {
    const result = step('HUMAN_HANDOFF', { text: 'menu', profile: PROFILE })
    expect(result.nextStep).toBe('MENU')
    expect(result.reply.type).not.toBe('text')
  })

  it('permanece pausado para qualquer outro texto durante o handoff', () => {
    const result = step('HUMAN_HANDOFF', { text: 'ainda estou esperando' })
    expect(result.nextStep).toBe('HUMAN_HANDOFF')
  })
})

describe('advanceConversation — dúvidas frequentes (Seção 2)', () => {
  it('abre o menu de dúvidas com quatro perguntas', () => {
    const result = step('MENU', { replyId: REPLY_IDS.menuKnowMore })
    expect(result.nextStep).toBe('FAQ_MENU')
    expect(result.reply.type).toBe('list')
    if (result.reply.type === 'list') expect(result.reply.rows).toHaveLength(4)
  })

  it('abre o submenu de etapas com as quatro etapas e "voltar"', () => {
    const result = step('FAQ_MENU', { replyId: REPLY_IDS.faqSteps })
    expect(result.nextStep).toBe('FAQ_STEPS_MENU')
    if (result.reply.type === 'list') expect(result.reply.rows).toHaveLength(5)
  })

  it('detalha uma etapa e guarda qual foi lida para excluir depois', () => {
    const result = step('FAQ_STEPS_MENU', {
      replyId: REPLY_IDS.faqStepKit,
    })
    expect(result.nextStep).toBe('FAQ_STEPS_CLOSING')
    expect(result.reply.body).toContain('potinhos esterilizados')
    expect(result.context).toEqual({ faqStep: 'KIT' })
  })

  it('exclui dinamicamente a etapa já lida em "ver outra etapa"', () => {
    const result = step('FAQ_STEPS_CLOSING', {
      replyId: REPLY_IDS.faqStepsSeeAnother,
      context: { faqStep: 'KIT' },
    })
    expect(result.nextStep).toBe('FAQ_STEPS_MENU')
    if (result.reply.type === 'list') {
      const ids = result.reply.rows.map((row) => row.id)
      expect(ids).not.toContain(REPLY_IDS.faqStepKit)
      expect(ids).toContain(REPLY_IDS.faqStepHealthForm)
      expect(ids).toContain(REPLY_IDS.faqStepExtraction)
      expect(ids).toContain(REPLY_IDS.faqStepCollection)
      expect(ids).toContain(REPLY_IDS.faqStepsBack)
      expect(result.reply.rows).toHaveLength(4)
    }
  })

  it('volta ao menu de dúvidas a partir do submenu de etapas', () => {
    const result = step('FAQ_STEPS_MENU', { replyId: REPLY_IDS.faqStepsBack })
    expect(result.nextStep).toBe('FAQ_MENU')
  })

  it('leva ao início da doação a partir do fechamento das etapas', () => {
    const result = step('FAQ_STEPS_CLOSING', { replyId: REPLY_IDS.menuDonate })
    expect(result.nextStep).toBe('AWAITING_COVERAGE')
  })

  it('responde "quem pode doar" e oferece dúvida de saúde própria', () => {
    const result = step('FAQ_MENU', { replyId: REPLY_IDS.faqWhoCanDonate })
    expect(result.nextStep).toBe('FAQ_WHO_CLOSING')
    expect(result.reply.body).toContain('sistema imunológico')
    if (result.reply.type === 'buttons') {
      expect(result.reply.buttons.map(({ id }) => id)).toContain(
        REPLY_IDS.faqWhoOwnHealth,
      )
    }

    const toHuman = step('FAQ_WHO_CLOSING', {
      replyId: REPLY_IDS.faqWhoOwnHealth,
    })
    expect(toHuman.nextStep).toBe('HUMAN_HANDOFF')
  })

  it('responde "dói ou atrapalha" e oferece dicas de extração no site', () => {
    const result = step('FAQ_MENU', { replyId: REPLY_IDS.faqPain })
    expect(result.nextStep).toBe('FAQ_PAIN_CLOSING')
    expect(result.reply.body).toContain('só doa o excedente')

    const site = step('FAQ_PAIN_CLOSING', {
      replyId: REPLY_IDS.faqPainExtractionTips,
    })
    expect(site.nextStep).toBe('MENU')
    expect(site.reply.body).toContain('{howItWorksUrl}')
  })

  it('responde "posso doar mais de uma vez" com apenas duas opções', () => {
    const result = step('FAQ_MENU', { replyId: REPLY_IDS.faqFrequency })
    expect(result.nextStep).toBe('FAQ_FREQUENCY_CLOSING')
    if (result.reply.type === 'buttons') {
      expect(result.reply.buttons).toHaveLength(2)
    }
  })

  it('"ver outra dúvida" volta ao menu de dúvidas nos três fechamentos', () => {
    for (const closing of [
      'FAQ_WHO_CLOSING',
      'FAQ_PAIN_CLOSING',
      'FAQ_FREQUENCY_CLOSING',
    ] as const) {
      const result = step(closing, { replyId: REPLY_IDS.faqMore })
      expect(result.nextStep).toBe('FAQ_MENU')
    }
  })
})

describe('advanceConversation — quero doar meu leite (Seção 3)', () => {
  it('pede CEP ou localização sem prometer atendimento', () => {
    const result = step('MENU', { replyId: REPLY_IDS.menuDonate })
    expect(result.nextStep).toBe('AWAITING_COVERAGE')
  })

  it('guarda somente cidade e UF e já pede o nome quando a cobertura é positiva', () => {
    const result = step('AWAITING_COVERAGE', {
      text: '06000-000',
      coverage: { kind: 'eligible', city: 'Osasco', state: 'SP' },
    })
    expect(result.nextStep).toBe('AWAITING_FULL_NAME')
    expect(result.context).toEqual({
      location: { city: 'Osasco', state: 'SP' },
    })
    expect(JSON.stringify(result.context)).not.toContain('06000')
    expect(result.reply.body).toContain('dentro da nossa área')
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

  it('encaminha localização fora da área ao diretório oficial, sem seguir pro cadastro', () => {
    const result = step('AWAITING_COVERAGE', {
      text: 'Campinas',
      coverage: { kind: 'outside', city: 'Campinas', state: 'SP' },
    })
    expect(result.nextStep).toBe('MENU')
    expect(result.reply.body).toContain('{directoryUrl}')
    expect(result.reply.body).toContain('{coverageUrl}')
    expect(result.effect.kind).toBe('none')
  })

  it('coleta nome, CPF, e-mail e endereço em sequência antes do consentimento', () => {
    const location = { city: 'Osasco', state: 'SP' }

    const afterName = step('AWAITING_FULL_NAME', {
      text: 'Maria da Silva',
      context: { location },
    })
    expect(afterName.nextStep).toBe('AWAITING_CPF')
    expect(afterName.effect.kind).toBe('none')
    expect(afterName.context).toEqual({
      location,
      registration: { fullName: 'Maria da Silva' },
    })

    const afterCpf = step('AWAITING_CPF', {
      text: '111.444.777-35',
      context: afterName.context,
    })
    expect(afterCpf.nextStep).toBe('AWAITING_EMAIL')
    expect(afterCpf.context).toEqual({
      location,
      registration: { fullName: 'Maria da Silva', cpf: VALID_CPF },
    })

    const afterEmail = step('AWAITING_EMAIL', {
      text: 'maria@example.com',
      context: afterCpf.context,
    })
    expect(afterEmail.nextStep).toBe('AWAITING_ADDRESS')
    expect(afterEmail.context).toEqual({
      location,
      registration: {
        fullName: 'Maria da Silva',
        cpf: VALID_CPF,
        email: 'maria@example.com',
      },
    })

    const afterAddress = step('AWAITING_ADDRESS', {
      text: 'Rua das Flores, 123, apto 4, Centro',
      context: afterEmail.context,
    })
    expect(afterAddress.nextStep).toBe('AWAITING_CONSENT')
    expect(afterAddress.effect.kind).toBe('none')
    expect(afterAddress.reply.body).toContain('Maria')
    expect(afterAddress.context).toEqual({
      location,
      registration: {
        fullName: 'Maria da Silva',
        cpf: VALID_CPF,
        email: 'maria@example.com',
        address: 'Rua das Flores, 123, apto 4, Centro',
      },
    })
  })

  it('rejeita CPF, e-mail e endereço inválidos sem avançar de etapa', () => {
    const location = { city: 'Osasco', state: 'SP' }

    const invalidCpf = step('AWAITING_CPF', {
      text: '111.111.111-11',
      context: { location, registration: { fullName: 'Maria da Silva' } },
    })
    expect(invalidCpf.nextStep).toBe('AWAITING_CPF')

    const invalidEmail = step('AWAITING_EMAIL', {
      text: 'não é um email',
      context: {
        location,
        registration: { fullName: 'Maria da Silva', cpf: VALID_CPF },
      },
    })
    expect(invalidEmail.nextStep).toBe('AWAITING_EMAIL')

    const invalidAddress = step('AWAITING_ADDRESS', {
      text: 'perto do mercado',
      context: {
        location,
        registration: {
          fullName: 'Maria da Silva',
          cpf: VALID_CPF,
          email: 'maria@example.com',
        },
      },
    })
    expect(invalidAddress.nextStep).toBe('AWAITING_ADDRESS')
  })

  it('cria o lead com todos os campos só depois do "sim, concordo"', () => {
    const context = {
      location: { city: 'Osasco', state: 'SP' },
      registration: {
        fullName: 'Maria da Silva',
        cpf: VALID_CPF,
        email: 'maria@example.com',
        address: 'Rua das Flores, 123',
      },
    }

    const result = step('AWAITING_CONSENT', {
      replyId: REPLY_IDS.registrationAccept,
      context,
    })
    expect(result.effect).toEqual({
      kind: 'create_lead',
      fullName: 'Maria da Silva',
      cpf: VALID_CPF,
      email: 'maria@example.com',
      address: 'Rua das Flores, 123',
      city: 'Osasco',
      state: 'SP',
    })
    expect(result.nextStep).toBe('POST_REGISTRATION_MENU')
    if (result.reply.type === 'list') {
      expect(result.reply.rows.map(({ id }) => id)).toEqual([
        REPLY_IDS.postRegAccessArea,
        REPLY_IDS.menuHuman,
        REPLY_IDS.postRegSeeFaq,
      ])
    }
  })

  it('recusa cadastro sem criar efeito nem manter rascunho', () => {
    const result = step('AWAITING_CONSENT', {
      replyId: REPLY_IDS.registrationDecline,
      context: {
        location: { city: 'Osasco', state: 'SP' },
        registration: {
          fullName: 'Maria da Silva',
          cpf: VALID_CPF,
          email: 'maria@example.com',
          address: 'Rua das Flores, 123',
        },
      },
    })
    expect(result.nextStep).toBe('MENU')
    expect(result.context).toEqual({})
    expect(result.effect.kind).toBe('none')
  })

  it('menu pós-cadastro leva à área pessoal, ao humano ou às dúvidas', () => {
    const area = step('POST_REGISTRATION_MENU', {
      replyId: REPLY_IDS.postRegAccessArea,
    })
    expect(area.nextStep).toBe('MENU')
    expect(area.reply.body).toContain('{areaUrl}')

    const human = step('POST_REGISTRATION_MENU', {
      replyId: REPLY_IDS.menuHuman,
    })
    expect(human.nextStep).toBe('HUMAN_HANDOFF')

    const faq = step('POST_REGISTRATION_MENU', {
      replyId: REPLY_IDS.postRegSeeFaq,
    })
    expect(faq.nextStep).toBe('FAQ_MENU')
  })

  it('preserva somente a localização consentida após falha de gravação', () => {
    const context = { location: { city: 'Osasco', state: 'SP' } }
    const result = buildRegistrationFailureOutcome(context)
    expect(result.nextStep).toBe('AWAITING_FULL_NAME')
    expect(result.context).toEqual(context)
  })
})

describe('advanceConversation — estados legados', () => {
  it('reinicia o FAQ de uma camada só e o fluxo de agendamento no menu', () => {
    const faq = step('FAQ', { text: 'Como guardar o leite?' })
    expect(faq.nextStep).toBe('MENU')
    expect(faq.effect.kind).toBe('none')

    const scheduling = step('AWAITING_DATE_CONFIRMATION', {
      text: '05/06 09:30',
    })
    expect(scheduling.nextStep).toBe('MENU')
    expect(scheduling.effect.kind).toBe('none')
  })
})

describe('hydrateWhatsappReply', () => {
  it('resolve links e canais oficiais antes do envio', () => {
    const reply = hydrateWhatsappReply(
      {
        type: 'text',
        body: '{howItWorksUrl} {directoryUrl} {whatsapp} {phone} {verifiedAt} {areaUrl}',
      },
      'https://nutrilink.test',
    )
    expect(reply.body).toContain('https://nutrilink.test/como-funciona')
    expect(reply.body).toContain('https://rblh.fiocruz.br/')
    expect(reply.body).toContain('+55 (11) 96629-0681')
    expect(reply.body).toContain('https://nutrilink.test/meu-agendamento')
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
