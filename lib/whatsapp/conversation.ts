import { WHATSAPP_BOT } from '../i18n/pt-br'
import { isLactareHandoffOpen } from '../constants/lactare-handoff'
import type { JourneyStatusValue } from '../journey/status'
import type { WhatsappCoverageResult } from './coverage'
import { formatLocalDate, isValidLocalDate } from '../utils/local-date-time'

/** Estados ativos do RF11. */
export type ActiveConversationStep =
  | 'MENU'
  | 'FAQ'
  | 'AWAITING_COVERAGE'
  | 'AWAITING_FULL_NAME'
  | 'AWAITING_CONSENT'
  | 'AWAITING_REMINDER_REFERENCE'
  | 'HUMAN_HANDOFF'

/** Estados preservados apenas para ler conversas criadas pelo fluxo antigo. */
export type LegacyConversationStep =
  | 'ASKED_SCHEDULED'
  | 'AWAITING_DATE'
  | 'AWAITING_DATE_CONFIRMATION'
  | 'AWAITING_FAILURE_REASON'
  | 'FINISHED'

export type ConversationStep = ActiveConversationStep | LegacyConversationStep

/** Mantido para as consultas do modelo `Appointment`, que agora é legado. */
export type FailureReason =
  | 'NO_ANSWER'
  | 'NO_SLOT'
  | 'TOO_FAR'
  | 'GAVE_UP'
  | 'OTHER'

export type ConversationContext = {
  location?: { city: string; state: string }
}

export type ConversationProfile = {
  fullName: string
  journeyStatus: JourneyStatusValue
  reminderConsentEnabled: boolean
}

/** IDs estáveis devolvidos pela Meta; não são textos de interface. */
export const REPLY_IDS = {
  menuKnowMore: 'menu_saber_mais',
  menuDonate: 'menu_quero_doar',
  menuHuman: 'menu_falar_pessoa',
  menuReminders: 'menu_lembretes',
  faqWhoCanDonate: 'faq_quem_pode',
  faqHowItWorks: 'faq_como_funciona',
  faqStorage: 'faq_armazenar',
  faqPain: 'faq_dor',
  faqFrequency: 'faq_frequencia',
  faqMore: 'faq_mais_duvidas',
  faqDonate: 'faq_quero_doar',
  faqSite: 'faq_ver_site',
  registrationAccept: 'cadastro_aceito',
  registrationDecline: 'cadastro_recuso',
  remindersEnable: 'lembretes_ativar',
  remindersDisable: 'lembretes_desativar',
  remindersBack: 'lembretes_voltar',
} as const

export type BotReply =
  | { type: 'text'; body: string }
  | {
      type: 'buttons'
      body: string
      buttons: ReadonlyArray<{ id: string; title: string }>
    }
  | {
      type: 'list'
      body: string
      button: string
      rows: ReadonlyArray<{ id: string; title: string }>
    }

export type ConversationEffect =
  | { kind: 'none' }
  | {
      kind: 'create_lead'
      fullName: string
      city: string
      state: string
    }
  | {
      kind: 'set_reminder_consent'
      enabled: boolean
      referenceDate?: string
    }

export type ConversationOutcome = {
  reply: BotReply
  nextStep: ActiveConversationStep
  context: ConversationContext
  misunderstoodCount: number
  effect: ConversationEffect
}

type AdvanceConversationParams = {
  step: ConversationStep
  context: ConversationContext
  misunderstoodCount: number
  text: string | null
  replyId: string | null
  coverage?: WhatsappCoverageResult
  profile: ConversationProfile | null
  isNewConversation?: boolean
  now?: Date
}

const FAQ_ANSWER_BY_ID = {
  [REPLY_IDS.faqWhoCanDonate]: WHATSAPP_BOT.faq.answers.WHO_CAN_DONATE,
  [REPLY_IDS.faqHowItWorks]: WHATSAPP_BOT.faq.answers.HOW_IT_WORKS,
  [REPLY_IDS.faqStorage]: WHATSAPP_BOT.faq.answers.STORAGE,
  [REPLY_IDS.faqPain]: WHATSAPP_BOT.faq.answers.PAIN,
  [REPLY_IDS.faqFrequency]: WHATSAPP_BOT.faq.answers.FREQUENCY,
} as const

const HEALTH_QUESTION_PATTERN =
  /\b(posso\s+doar|rem[eé]dio|medicamento|doen[cç]a|febre|infec|[aá]lcool|fumo|cigarro|sa[uú]de|diagn[oó]stico|exame)\b/iu

function emptyContext(): ConversationContext {
  return {}
}

function menuButtons() {
  return [
    { id: REPLY_IDS.menuKnowMore, title: WHATSAPP_BOT.menu.knowMore },
    { id: REPLY_IDS.menuDonate, title: WHATSAPP_BOT.menu.donate },
    { id: REPLY_IDS.menuHuman, title: WHATSAPP_BOT.menu.human },
  ] as const
}

function registeredMenuRows() {
  return [
    { id: REPLY_IDS.menuKnowMore, title: WHATSAPP_BOT.menu.knowMore },
    { id: REPLY_IDS.menuDonate, title: WHATSAPP_BOT.menu.donate },
    { id: REPLY_IDS.menuReminders, title: WHATSAPP_BOT.menu.reminders },
    { id: REPLY_IDS.menuHuman, title: WHATSAPP_BOT.menu.human },
  ] as const
}

function faqActionButtons() {
  return [
    { id: REPLY_IDS.faqMore, title: WHATSAPP_BOT.faq.more },
    { id: REPLY_IDS.faqDonate, title: WHATSAPP_BOT.faq.donate },
    { id: REPLY_IDS.faqSite, title: WHATSAPP_BOT.faq.site },
  ] as const
}

function consentButtons() {
  return [
    {
      id: REPLY_IDS.registrationAccept,
      title: WHATSAPP_BOT.registration.accept,
    },
    {
      id: REPLY_IDS.registrationDecline,
      title: WHATSAPP_BOT.registration.decline,
    },
  ] as const
}

function outcome(params: {
  reply: BotReply
  nextStep: ActiveConversationStep
  context?: ConversationContext
  misunderstoodCount?: number
  effect?: ConversationEffect
}): ConversationOutcome {
  return {
    reply: params.reply,
    nextStep: params.nextStep,
    context: params.context ?? emptyContext(),
    misunderstoodCount: params.misunderstoodCount ?? 0,
    effect: params.effect ?? { kind: 'none' },
  }
}

function mainMenuReply(body: string): ConversationOutcome {
  return outcome({
    reply: { type: 'buttons', body, buttons: menuButtons() },
    nextStep: 'MENU',
  })
}

function registeredMenuReply(body: string): ConversationOutcome {
  return outcome({
    reply: {
      type: 'list',
      body,
      button: WHATSAPP_BOT.menu.button,
      rows: registeredMenuRows(),
    },
    nextStep: 'MENU',
  })
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/u)[0] ?? fullName.trim()
}

export function buildInitialConversationReply(
  profile: ConversationProfile | null,
): ConversationOutcome {
  if (!profile) return mainMenuReply(WHATSAPP_BOT.menu.welcome)

  return registeredMenuReply(
    WHATSAPP_BOT.menu.registeredWelcome
      .replace('{name}', firstName(profile.fullName))
      .replace('{status}', WHATSAPP_BOT.journeyStatus[profile.journeyStatus])
      .replace(
        '{guidance}',
        WHATSAPP_BOT.journeyGuidance[profile.journeyStatus],
      ),
  )
}

function reminderPreferenceReply(
  profile: ConversationProfile | null,
  body?: string,
): ConversationOutcome {
  if (!profile) {
    return mainMenuReply(WHATSAPP_BOT.reminders.registrationRequired)
  }

  const enabled = profile.reminderConsentEnabled
  return outcome({
    reply: {
      type: 'buttons',
      body:
        body ??
        (enabled
          ? WHATSAPP_BOT.reminders.enabled
          : WHATSAPP_BOT.reminders.disabled),
      buttons: [
        {
          id: enabled ? REPLY_IDS.remindersDisable : REPLY_IDS.remindersEnable,
          title: enabled
            ? WHATSAPP_BOT.reminders.disable
            : WHATSAPP_BOT.reminders.enable,
        },
        {
          id: REPLY_IDS.remindersBack,
          title: WHATSAPP_BOT.reminders.back,
        },
      ],
    },
    nextStep: 'MENU',
  })
}

export function buildReminderConsentResultOutcome(
  enabled: boolean,
): ConversationOutcome {
  return registeredMenuReply(
    enabled
      ? WHATSAPP_BOT.reminders.enabledSuccess
      : WHATSAPP_BOT.reminders.disabledSuccess,
  )
}

export function buildReminderConsentFailureOutcome(
  profile: ConversationProfile,
): ConversationOutcome {
  return reminderPreferenceReply(profile, WHATSAPP_BOT.reminders.unavailable)
}

function reminderConsentDecisionOutcome(
  profile: ConversationProfile | null,
  enabled: boolean,
): ConversationOutcome {
  if (!profile) {
    return mainMenuReply(WHATSAPP_BOT.reminders.registrationRequired)
  }
  if (enabled === profile.reminderConsentEnabled) {
    return registeredMenuReply(
      enabled
        ? WHATSAPP_BOT.reminders.alreadyEnabled
        : WHATSAPP_BOT.reminders.alreadyDisabled,
    )
  }

  if (enabled) {
    return outcome({
      reply: { type: 'text', body: WHATSAPP_BOT.reminders.askReferenceDate },
      nextStep: 'AWAITING_REMINDER_REFERENCE',
    })
  }

  return {
    ...buildReminderConsentResultOutcome(enabled),
    effect: { kind: 'set_reminder_consent', enabled },
  }
}

function parseReminderReferenceDate(
  value: string | null,
  now: Date = new Date(),
): string | null {
  const text = value?.trim() ?? ''
  const normalized = /^(\d{2})\/(\d{2})\/(\d{4})$/u.exec(text)
    ? (() => {
        const match = /^(\d{2})\/(\d{2})\/(\d{4})$/u.exec(text)
        return match ? `${match[3]}-${match[2]}-${match[1]}` : ''
      })()
    : text
  if (!isValidLocalDate(normalized)) return null
  return normalized <= formatLocalDate(now) ? normalized : null
}

function faqList(body = WHATSAPP_BOT.faq.body): ConversationOutcome {
  return outcome({
    reply: {
      type: 'list',
      body,
      button: WHATSAPP_BOT.faq.button,
      rows: [
        {
          id: REPLY_IDS.faqWhoCanDonate,
          title: WHATSAPP_BOT.faq.questions.WHO_CAN_DONATE,
        },
        {
          id: REPLY_IDS.faqHowItWorks,
          title: WHATSAPP_BOT.faq.questions.HOW_IT_WORKS,
        },
        {
          id: REPLY_IDS.faqStorage,
          title: WHATSAPP_BOT.faq.questions.STORAGE,
        },
        {
          id: REPLY_IDS.faqPain,
          title: WHATSAPP_BOT.faq.questions.PAIN,
        },
        {
          id: REPLY_IDS.faqFrequency,
          title: WHATSAPP_BOT.faq.questions.FREQUENCY,
        },
      ],
    },
    nextStep: 'FAQ',
  })
}

function humanContactReply(body: string = WHATSAPP_BOT.human.body) {
  return mainMenuReply(body)
}

function humanHandoffReply(now: Date = new Date()): ConversationOutcome {
  return outcome({
    reply: {
      type: 'text',
      body: isLactareHandoffOpen(now)
        ? WHATSAPP_BOT.human.handoffOpen
        : WHATSAPP_BOT.human.handoffOutsideHours,
    },
    nextStep: 'HUMAN_HANDOFF',
  })
}

function isHumanHandoffRequest(text: string | null): boolean {
  return /(?:falar com (?:a )?(?:equipe|algu[eé]m|uma pessoa|atendente|humano)|atendimento humano|falar com o Lactare)/iu.test(
    text?.trim() ?? '',
  )
}

function askCoverage(): ConversationOutcome {
  return outcome({
    reply: { type: 'text', body: WHATSAPP_BOT.coverage.ask },
    nextStep: 'AWAITING_COVERAGE',
  })
}

function misunderstood(
  params: AdvanceConversationParams,
  repeat: () => ConversationOutcome,
): ConversationOutcome {
  const count = Math.min(2, params.misunderstoodCount + 1)
  if (count >= 2) return humanContactReply(WHATSAPP_BOT.fallback.second)

  const repeated = repeat()
  return {
    ...repeated,
    reply: {
      ...repeated.reply,
      body: `${WHATSAPP_BOT.fallback.first}\n\n${repeated.reply.body}`,
    },
    misunderstoodCount: count,
  }
}

function normalizeName(value: string | null): string | null {
  if (!value) return null
  const name = value.trim().replace(/\s+/gu, ' ')
  if (name.length < 3 || name.length > 120 || !/\p{L}/u.test(name)) {
    return null
  }
  return name
}

function consentReply(context: ConversationContext): ConversationOutcome {
  if (!context.location) return askCoverage()

  return outcome({
    reply: {
      type: 'buttons',
      body: WHATSAPP_BOT.registration.consent,
      buttons: consentButtons(),
    },
    nextStep: 'AWAITING_CONSENT',
    context,
  })
}

export function isConversationResetText(text: string | null): boolean {
  if (!text) return false
  return /^(oi|ol[aá]|menu|in[ií]cio|come[cç]ar)$/iu.test(text.trim())
}

/**
 * Máquina de estados pura do fluxo ativo. Rede e banco ficam no handler; os
 * únicos efeitos descritos aqui são aplicados depois da decisão conversacional.
 */
export function advanceConversation(
  params: AdvanceConversationParams,
): ConversationOutcome {
  if (params.isNewConversation) {
    return buildInitialConversationReply(params.profile)
  }

  if (isConversationResetText(params.text)) {
    return buildInitialConversationReply(params.profile)
  }

  if (
    params.replyId === REPLY_IDS.menuHuman ||
    isHumanHandoffRequest(params.text)
  ) {
    return humanHandoffReply(params.now)
  }

  if (params.replyId === REPLY_IDS.menuKnowMore) return faqList()
  if (
    params.replyId === REPLY_IDS.menuReminders ||
    /^lembretes$/iu.test(params.text?.trim() ?? '')
  ) {
    return reminderPreferenceReply(params.profile)
  }
  if (params.replyId === REPLY_IDS.remindersBack) {
    return buildInitialConversationReply(params.profile)
  }
  if (params.step === 'AWAITING_REMINDER_REFERENCE') {
    const referenceDate = parseReminderReferenceDate(params.text, params.now)
    if (!referenceDate) {
      return outcome({
        reply: {
          type: 'text',
          body: WHATSAPP_BOT.reminders.invalidReferenceDate,
        },
        nextStep: 'AWAITING_REMINDER_REFERENCE',
      })
    }

    return {
      ...buildReminderConsentResultOutcome(true),
      effect: {
        kind: 'set_reminder_consent',
        enabled: true,
        referenceDate,
      },
    }
  }
  const reminderText = params.text?.trim() ?? ''
  if (/^(ativar|quero|receber)\s+lembretes$/iu.test(reminderText)) {
    return reminderConsentDecisionOutcome(params.profile, true)
  }
  if (
    /^(?:(?:parar|cancelar|desativar)\s+(?:os\s+)?lembretes|n[aã]o\s+quero\s+(?:mais\s+)?lembretes)$/iu.test(
      reminderText,
    )
  ) {
    return reminderConsentDecisionOutcome(params.profile, false)
  }
  if (
    params.replyId === REPLY_IDS.remindersEnable ||
    params.replyId === REPLY_IDS.remindersDisable
  ) {
    const enabled = params.replyId === REPLY_IDS.remindersEnable
    return reminderConsentDecisionOutcome(params.profile, enabled)
  }
  if (
    params.replyId === REPLY_IDS.menuDonate ||
    params.replyId === REPLY_IDS.faqDonate
  ) {
    return askCoverage()
  }
  switch (params.step) {
    case 'MENU':
      return misunderstood(params, () =>
        buildInitialConversationReply(params.profile),
      )

    case 'FAQ': {
      if (params.replyId === REPLY_IDS.faqMore) return faqList()
      if (params.replyId === REPLY_IDS.faqSite) {
        return outcome({
          reply: {
            type: 'buttons',
            body: WHATSAPP_BOT.faq.siteBody,
            buttons: faqActionButtons(),
          },
          nextStep: 'FAQ',
        })
      }

      if (params.text && HEALTH_QUESTION_PATTERN.test(params.text)) {
        return humanContactReply()
      }

      const answer = params.replyId
        ? FAQ_ANSWER_BY_ID[params.replyId as keyof typeof FAQ_ANSWER_BY_ID]
        : undefined
      if (answer) {
        return outcome({
          reply: {
            type: 'buttons',
            body: `${answer}\n\n${WHATSAPP_BOT.faq.afterAnswer}`,
            buttons: faqActionButtons(),
          },
          nextStep: 'FAQ',
        })
      }

      return misunderstood(params, () => faqList())
    }

    case 'AWAITING_COVERAGE': {
      const coverage = params.coverage
      if (!coverage || coverage.kind === 'invalid') {
        return outcome({
          reply: { type: 'text', body: WHATSAPP_BOT.coverage.invalid },
          nextStep: 'AWAITING_COVERAGE',
        })
      }
      if (coverage.kind === 'unavailable') {
        return outcome({
          reply: { type: 'text', body: WHATSAPP_BOT.coverage.unavailable },
          nextStep: 'AWAITING_COVERAGE',
        })
      }
      if (coverage.kind === 'outside') {
        return mainMenuReply(WHATSAPP_BOT.coverage.outside)
      }
      if (params.profile) {
        return mainMenuReply(
          WHATSAPP_BOT.coverage.eligibleRegistered.replace(
            '{city}',
            coverage.city,
          ),
        )
      }

      return outcome({
        reply: {
          type: 'buttons',
          body: `${WHATSAPP_BOT.coverage.eligibleAskConsent.replace(
            '{city}',
            coverage.city,
          )}\n\n${WHATSAPP_BOT.registration.consent}`,
          buttons: consentButtons(),
        },
        nextStep: 'AWAITING_CONSENT',
        context: {
          location: { city: coverage.city, state: coverage.state },
        },
      })
    }

    case 'AWAITING_FULL_NAME': {
      const fullName = normalizeName(params.text)
      if (!fullName) {
        return outcome({
          reply: { type: 'text', body: WHATSAPP_BOT.registration.invalidName },
          nextStep: 'AWAITING_FULL_NAME',
          context: params.context,
        })
      }

      const { location } = params.context
      if (!location) return askCoverage()

      return outcome({
        reply: {
          type: 'buttons',
          body: WHATSAPP_BOT.registration.success.replace(
            '{name}',
            firstName(fullName),
          ),
          buttons: menuButtons(),
        },
        nextStep: 'MENU',
        effect: {
          kind: 'create_lead',
          fullName,
          city: location.city,
          state: location.state,
        },
      })
    }

    case 'AWAITING_CONSENT': {
      if (params.replyId === REPLY_IDS.registrationDecline) {
        return mainMenuReply(WHATSAPP_BOT.registration.declined)
      }
      if (params.replyId !== REPLY_IDS.registrationAccept) {
        return consentReply(params.context)
      }

      if (!params.context.location) return askCoverage()

      return outcome({
        reply: { type: 'text', body: WHATSAPP_BOT.registration.askName },
        nextStep: 'AWAITING_FULL_NAME',
        context: params.context,
      })
    }

    // O bot permanece pausado até a equipe assumir. A rota não chama esta
    // máquina para novas mensagens nesse estado, exceto quando a nutriz pede
    // explicitamente "menu" para voltar ao autoatendimento.
    case 'HUMAN_HANDOFF':
      return humanHandoffReply()

    // Qualquer conversa do fluxo de agendamento antigo volta ao menu sem
    // interpretar data ou motivo como informação válida no escopo atual.
    case 'ASKED_SCHEDULED':
    case 'AWAITING_DATE':
    case 'AWAITING_DATE_CONFIRMATION':
    case 'AWAITING_FAILURE_REASON':
    case 'FINISHED':
      return buildInitialConversationReply(params.profile)
  }
}

export function buildRegistrationFailureOutcome(
  context: ConversationContext,
): ConversationOutcome {
  return outcome({
    reply: { type: 'text', body: WHATSAPP_BOT.registration.unavailable },
    nextStep: 'AWAITING_FULL_NAME',
    context: context.location ? { location: context.location } : {},
  })
}
