import { WHATSAPP_BOT } from '../i18n/pt-br'
import { isLactareHandoffOpen } from '../constants/lactare-handoff'
import type { JourneyStatusValue } from '../journey/status'
import { cpfSchema, emailSchema } from '../validators/common'
import { formatLocalDate, isValidLocalDate } from '../utils/local-date-time'
import type { WhatsappCoverageResult } from './coverage'

/** Estados ativos do fluxo consolidado do chatbot (RF11). */
export type ActiveConversationStep =
  | 'MENU'
  | 'FAQ_MENU'
  | 'FAQ_STEPS_MENU'
  | 'FAQ_STEPS_CLOSING'
  | 'FAQ_WHO_CLOSING'
  | 'FAQ_PAIN_CLOSING'
  | 'FAQ_FREQUENCY_CLOSING'
  | 'AWAITING_COVERAGE'
  | 'AWAITING_FULL_NAME'
  | 'AWAITING_CPF'
  | 'AWAITING_EMAIL'
  | 'AWAITING_ADDRESS'
  | 'AWAITING_CONSENT'
  | 'POST_REGISTRATION_MENU'
  | 'AWAITING_REMINDER_REFERENCE'
  | 'HUMAN_HANDOFF'

/**
 * Estados preservados apenas para ler conversas criadas pelo fluxo antigo.
 * `FAQ` era o menu único de cinco perguntas; virou legado em 20/09/2026,
 * quando o menu de dúvidas passou a ter duas camadas (Seções 2 e 2.1 do
 * documento de fluxo consolidado).
 */
export type LegacyConversationStep =
  | 'FAQ'
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

/** Uma das quatro etapas de doação detalhadas na Seção 2.1 do fluxo. */
export type DonationStepId = 'HEALTH_FORM' | 'KIT' | 'EXTRACTION' | 'COLLECTION'

const DONATION_STEP_IDS: readonly DonationStepId[] = [
  'HEALTH_FORM',
  'KIT',
  'EXTRACTION',
  'COLLECTION',
]

export type ConversationContext = {
  location?: { city: string; state: string }
  /** IDs técnicos efêmeros da última lista textual enviada pela Z-API. */
  zapiReplyOptionIds?: string[]
  /** Última etapa (2.1.x) que a nutriz leu, só para excluir da lista "ver outra etapa". */
  faqStep?: DonationStepId
  /**
   * Rascunho do cadastro (Seção 3, passo 3) enquanto o consentimento (passo 4)
   * não chega. Nada aqui vira `NutrizProfile` sem o aceite explícito; a recusa
   * ou a criação do lead apagam este campo do contexto.
   */
  registration?: {
    fullName?: string
    cpf?: string
    email?: string
    address?: string
  }
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
  faqSteps: 'faq_etapas',
  faqWhoCanDonate: 'faq_quem_pode',
  faqPain: 'faq_dor',
  faqFrequency: 'faq_frequencia',
  faqStepHealthForm: 'faq_etapa_ficha_exame',
  faqStepKit: 'faq_etapa_kit',
  faqStepExtraction: 'faq_etapa_extracao',
  faqStepCollection: 'faq_etapa_coleta',
  faqStepsBack: 'faq_etapas_voltar',
  faqStepsSeeAnother: 'faq_etapas_ver_outra',
  faqStepsSeeSite: 'faq_etapas_ver_site',
  faqMore: 'faq_outra_duvida',
  faqWhoOwnHealth: 'faq_saude_propria',
  faqPainExtractionTips: 'faq_dicas_extracao',
  registrationAccept: 'cadastro_aceito',
  registrationDecline: 'cadastro_recuso',
  postRegAccessArea: 'cadastro_area_pessoal',
  postRegSeeFaq: 'cadastro_ver_duvidas',
  remindersEnable: 'lembretes_ativar',
  remindersDisable: 'lembretes_desativar',
  remindersBack: 'lembretes_voltar',
} as const

const DONATION_STEP_REPLY_ID: Record<DonationStepId, string> = {
  HEALTH_FORM: REPLY_IDS.faqStepHealthForm,
  KIT: REPLY_IDS.faqStepKit,
  EXTRACTION: REPLY_IDS.faqStepExtraction,
  COLLECTION: REPLY_IDS.faqStepCollection,
}

const DONATION_STEP_BY_REPLY_ID = new Map<string, DonationStepId>(
  DONATION_STEP_IDS.map((id) => [DONATION_STEP_REPLY_ID[id], id]),
)

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
      cpf: string
      email: string
      address: string
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

const HEALTH_QUESTION_PATTERN =
  /\b(posso\s+doar|rem[eé]dio|medicamento|doen[cç]a|febre|infec|[aá]lcool|fumo|cigarro|sa[uú]de|diagn[oó]stico|exame)\b/iu

function normalizeReplyText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .replace(/[?!.,]+$/gu, '')
}

const TEXT_REPLY_ENTRIES: ReadonlyArray<readonly [string, string]> = [
  [WHATSAPP_BOT.menu.knowMore, REPLY_IDS.menuKnowMore],
  [WHATSAPP_BOT.menu.donate, REPLY_IDS.menuDonate],
  [WHATSAPP_BOT.menu.human, REPLY_IDS.menuHuman],
  [WHATSAPP_BOT.faq.questions.STEPS, REPLY_IDS.faqSteps],
  [WHATSAPP_BOT.faq.questions.WHO_CAN_DONATE, REPLY_IDS.faqWhoCanDonate],
  [WHATSAPP_BOT.faq.questions.PAIN, REPLY_IDS.faqPain],
  [WHATSAPP_BOT.faq.questions.FREQUENCY, REPLY_IDS.faqFrequency],
  [WHATSAPP_BOT.faq.steps.items.HEALTH_FORM, REPLY_IDS.faqStepHealthForm],
  [WHATSAPP_BOT.faq.steps.items.KIT, REPLY_IDS.faqStepKit],
  [WHATSAPP_BOT.faq.steps.items.EXTRACTION, REPLY_IDS.faqStepExtraction],
  [WHATSAPP_BOT.faq.steps.items.COLLECTION, REPLY_IDS.faqStepCollection],
  [WHATSAPP_BOT.faq.steps.back, REPLY_IDS.faqStepsBack],
  [WHATSAPP_BOT.faq.steps.closing.seeAnother, REPLY_IDS.faqStepsSeeAnother],
  [WHATSAPP_BOT.faq.steps.closing.seeSite, REPLY_IDS.faqStepsSeeSite],
  [WHATSAPP_BOT.faq.whoCanDonate.seeAnother, REPLY_IDS.faqMore],
  [WHATSAPP_BOT.faq.pain.seeAnother, REPLY_IDS.faqMore],
  [WHATSAPP_BOT.faq.frequency.seeAnother, REPLY_IDS.faqMore],
  [WHATSAPP_BOT.faq.whoCanDonate.ownHealthDoubt, REPLY_IDS.faqWhoOwnHealth],
  [WHATSAPP_BOT.faq.pain.extractionTips, REPLY_IDS.faqPainExtractionTips],
  [WHATSAPP_BOT.registration.accept, REPLY_IDS.registrationAccept],
  [WHATSAPP_BOT.registration.decline, REPLY_IDS.registrationDecline],
  [WHATSAPP_BOT.registration.postMenu.accessArea, REPLY_IDS.postRegAccessArea],
  [WHATSAPP_BOT.registration.postMenu.talkToTeam, REPLY_IDS.menuHuman],
  [WHATSAPP_BOT.registration.postMenu.seeFaq, REPLY_IDS.postRegSeeFaq],
  [WHATSAPP_BOT.reminders.enable, REPLY_IDS.remindersEnable],
  [WHATSAPP_BOT.reminders.disable, REPLY_IDS.remindersDisable],
  [WHATSAPP_BOT.reminders.back, REPLY_IDS.remindersBack],
]

const TEXT_REPLY_IDS = new Map<string, string>(
  TEXT_REPLY_ENTRIES.map(([label, id]) => [normalizeReplyText(label), id]),
)

/** Permite usar o mesmo fluxo em provedores que oferecem apenas texto livre. */
export function resolveTextReplyId(text: string | null): string | null {
  if (!text) return null
  return TEXT_REPLY_IDS.get(normalizeReplyText(text)) ?? null
}

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

/**
 * Estados onde uma pergunta livre sobre a própria saúde deve ir direto pro
 * atendimento humano (Seção 4), em vez de qualquer resposta automática do
 * bot. Nunca inclui os passos de coleta de dado (nome, CPF, e-mail,
 * endereço, CEP): texto livre ali é a resposta esperada, não uma pergunta.
 */
const HEALTH_QUESTION_SCOPE = new Set<ConversationStep>([
  'MENU',
  'FAQ_MENU',
  'FAQ_STEPS_MENU',
  'FAQ_STEPS_CLOSING',
  'FAQ_WHO_CLOSING',
  'FAQ_PAIN_CLOSING',
  'FAQ_FREQUENCY_CLOSING',
  'POST_REGISTRATION_MENU',
])

function misunderstood(
  params: AdvanceConversationParams,
  repeat: () => ConversationOutcome,
): ConversationOutcome {
  const count = Math.min(2, params.misunderstoodCount + 1)
  if (count >= 2) return humanHandoffReply(params.now)

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

function normalizeCpf(value: string | null): string | null {
  if (!value) return null
  const parsed = cpfSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

function normalizeEmail(value: string | null): string | null {
  if (!value) return null
  const parsed = emailSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

function normalizeAddress(value: string | null): string | null {
  if (!value) return null
  const address = value.trim().replace(/\s+/gu, ' ')
  if (address.length < 5 || address.length > 300) return null
  if (!/\p{L}/u.test(address) || !/\d/u.test(address)) return null
  return address
}

export function isConversationResetText(text: string | null): boolean {
  if (!text) return false
  return /^(oi|ol[aá]|menu|in[ií]cio|come[cç]ar)$/iu.test(text.trim())
}

function faqStepsMenu(params: {
  body: string
  exclude?: DonationStepId
  context: ConversationContext
}): ConversationOutcome {
  const rows = DONATION_STEP_IDS.filter((id) => id !== params.exclude).map(
    (id) => ({
      id: DONATION_STEP_REPLY_ID[id],
      title: WHATSAPP_BOT.faq.steps.items[id],
    }),
  )

  return outcome({
    reply: {
      type: 'list',
      body: params.body,
      button: WHATSAPP_BOT.faq.steps.button,
      rows: [
        ...rows,
        { id: REPLY_IDS.faqStepsBack, title: WHATSAPP_BOT.faq.steps.back },
      ],
    },
    nextStep: 'FAQ_STEPS_MENU',
    context: params.context,
  })
}

function faqMenu(): ConversationOutcome {
  return outcome({
    reply: {
      type: 'list',
      body: WHATSAPP_BOT.faq.body,
      button: WHATSAPP_BOT.faq.button,
      rows: [
        { id: REPLY_IDS.faqSteps, title: WHATSAPP_BOT.faq.questions.STEPS },
        {
          id: REPLY_IDS.faqWhoCanDonate,
          title: WHATSAPP_BOT.faq.questions.WHO_CAN_DONATE,
        },
        { id: REPLY_IDS.faqPain, title: WHATSAPP_BOT.faq.questions.PAIN },
        {
          id: REPLY_IDS.faqFrequency,
          title: WHATSAPP_BOT.faq.questions.FREQUENCY,
        },
      ],
    },
    nextStep: 'FAQ_MENU',
  })
}

function faqStepDetailReply(stepId: DonationStepId): ConversationOutcome {
  return outcome({
    reply: {
      type: 'buttons',
      body: `${WHATSAPP_BOT.faq.steps.details[stepId]}\n\n${WHATSAPP_BOT.faq.steps.closing.body}`,
      buttons: [
        {
          id: REPLY_IDS.faqStepsSeeAnother,
          title: WHATSAPP_BOT.faq.steps.closing.seeAnother,
        },
        { id: REPLY_IDS.menuDonate, title: WHATSAPP_BOT.faq.donate },
        {
          id: REPLY_IDS.faqStepsSeeSite,
          title: WHATSAPP_BOT.faq.steps.closing.seeSite,
        },
      ],
    },
    nextStep: 'FAQ_STEPS_CLOSING',
    context: { faqStep: stepId },
  })
}

function consentReply(context: ConversationContext): ConversationOutcome {
  if (!context.location) return askCoverage()

  const name = context.registration?.fullName
  if (!name) return askCoverage()

  return outcome({
    reply: {
      type: 'buttons',
      body: WHATSAPP_BOT.registration.consent.replace(
        '{name}',
        firstName(name),
      ),
      buttons: consentButtons(),
    },
    nextStep: 'AWAITING_CONSENT',
    context,
  })
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
    params.replyId === REPLY_IDS.faqWhoOwnHealth ||
    isHumanHandoffRequest(params.text)
  ) {
    return humanHandoffReply(params.now)
  }

  if (params.replyId === REPLY_IDS.menuKnowMore) return faqMenu()
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
  if (params.replyId === REPLY_IDS.menuDonate) return askCoverage()
  if (
    params.text &&
    HEALTH_QUESTION_SCOPE.has(params.step) &&
    HEALTH_QUESTION_PATTERN.test(params.text)
  ) {
    return humanHandoffReply(params.now)
  }

  switch (params.step) {
    case 'MENU':
      return misunderstood(params, () =>
        buildInitialConversationReply(params.profile),
      )

    case 'FAQ_MENU': {
      if (params.replyId === REPLY_IDS.faqSteps) {
        return faqStepsMenu({
          body: WHATSAPP_BOT.faq.steps.body,
          context: {},
        })
      }
      if (params.replyId === REPLY_IDS.faqWhoCanDonate) {
        return outcome({
          reply: {
            type: 'buttons',
            body: `${WHATSAPP_BOT.faq.whoCanDonate.answer}\n\n${WHATSAPP_BOT.faq.whoCanDonate.closingBody}`,
            buttons: [
              {
                id: REPLY_IDS.faqMore,
                title: WHATSAPP_BOT.faq.whoCanDonate.seeAnother,
              },
              { id: REPLY_IDS.menuDonate, title: WHATSAPP_BOT.faq.donate },
              {
                id: REPLY_IDS.faqWhoOwnHealth,
                title: WHATSAPP_BOT.faq.whoCanDonate.ownHealthDoubt,
              },
            ],
          },
          nextStep: 'FAQ_WHO_CLOSING',
        })
      }
      if (params.replyId === REPLY_IDS.faqPain) {
        return outcome({
          reply: {
            type: 'buttons',
            body: `${WHATSAPP_BOT.faq.pain.answer}\n\n${WHATSAPP_BOT.faq.pain.closingBody}`,
            buttons: [
              {
                id: REPLY_IDS.faqMore,
                title: WHATSAPP_BOT.faq.pain.seeAnother,
              },
              { id: REPLY_IDS.menuDonate, title: WHATSAPP_BOT.faq.donate },
              {
                id: REPLY_IDS.faqPainExtractionTips,
                title: WHATSAPP_BOT.faq.pain.extractionTips,
              },
            ],
          },
          nextStep: 'FAQ_PAIN_CLOSING',
        })
      }
      if (params.replyId === REPLY_IDS.faqFrequency) {
        return outcome({
          reply: {
            type: 'buttons',
            body: `${WHATSAPP_BOT.faq.frequency.answer}\n\n${WHATSAPP_BOT.faq.frequency.closingBody}`,
            buttons: [
              {
                id: REPLY_IDS.faqMore,
                title: WHATSAPP_BOT.faq.frequency.seeAnother,
              },
              { id: REPLY_IDS.menuDonate, title: WHATSAPP_BOT.faq.donate },
            ],
          },
          nextStep: 'FAQ_FREQUENCY_CLOSING',
        })
      }

      return misunderstood(params, () => faqMenu())
    }

    case 'FAQ_STEPS_MENU': {
      const stepId = params.replyId
        ? DONATION_STEP_BY_REPLY_ID.get(params.replyId)
        : undefined
      if (stepId) return faqStepDetailReply(stepId)
      if (params.replyId === REPLY_IDS.faqStepsBack) return faqMenu()

      return misunderstood(params, () =>
        faqStepsMenu({ body: WHATSAPP_BOT.faq.steps.body, context: {} }),
      )
    }

    case 'FAQ_STEPS_CLOSING': {
      if (params.replyId === REPLY_IDS.faqStepsSeeAnother) {
        return faqStepsMenu({
          body: WHATSAPP_BOT.faq.steps.chooseAnotherBody,
          exclude: params.context.faqStep,
          context: { faqStep: params.context.faqStep },
        })
      }
      if (params.replyId === REPLY_IDS.faqStepsSeeSite) {
        return mainMenuReply(WHATSAPP_BOT.faq.steps.closing.siteBody)
      }

      return misunderstood(params, () =>
        outcome({
          reply: {
            type: 'buttons',
            body: WHATSAPP_BOT.faq.steps.closing.body,
            buttons: [
              {
                id: REPLY_IDS.faqStepsSeeAnother,
                title: WHATSAPP_BOT.faq.steps.closing.seeAnother,
              },
              { id: REPLY_IDS.menuDonate, title: WHATSAPP_BOT.faq.donate },
              {
                id: REPLY_IDS.faqStepsSeeSite,
                title: WHATSAPP_BOT.faq.steps.closing.seeSite,
              },
            ],
          },
          nextStep: 'FAQ_STEPS_CLOSING',
          context: params.context,
        }),
      )
    }

    case 'FAQ_WHO_CLOSING': {
      if (params.replyId === REPLY_IDS.faqMore) return faqMenu()

      return misunderstood(params, () => faqMenu())
    }

    case 'FAQ_PAIN_CLOSING': {
      if (params.replyId === REPLY_IDS.faqMore) return faqMenu()
      if (params.replyId === REPLY_IDS.faqPainExtractionTips) {
        return mainMenuReply(WHATSAPP_BOT.faq.pain.tipsBody)
      }

      return misunderstood(params, () => faqMenu())
    }

    case 'FAQ_FREQUENCY_CLOSING': {
      if (params.replyId === REPLY_IDS.faqMore) return faqMenu()

      return misunderstood(params, () => faqMenu())
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
        reply: { type: 'text', body: WHATSAPP_BOT.coverage.eligible },
        nextStep: 'AWAITING_FULL_NAME',
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
        reply: { type: 'text', body: WHATSAPP_BOT.registration.askCpf },
        nextStep: 'AWAITING_CPF',
        context: { location, registration: { fullName } },
      })
    }

    case 'AWAITING_CPF': {
      const cpf = normalizeCpf(params.text)
      if (!cpf) {
        return outcome({
          reply: { type: 'text', body: WHATSAPP_BOT.registration.invalidCpf },
          nextStep: 'AWAITING_CPF',
          context: params.context,
        })
      }

      const { location, registration } = params.context
      if (!location || !registration?.fullName) return askCoverage()

      return outcome({
        reply: { type: 'text', body: WHATSAPP_BOT.registration.askEmail },
        nextStep: 'AWAITING_EMAIL',
        context: { location, registration: { ...registration, cpf } },
      })
    }

    case 'AWAITING_EMAIL': {
      const email = normalizeEmail(params.text)
      if (!email) {
        return outcome({
          reply: {
            type: 'text',
            body: WHATSAPP_BOT.registration.invalidEmail,
          },
          nextStep: 'AWAITING_EMAIL',
          context: params.context,
        })
      }

      const { location, registration } = params.context
      if (!location || !registration?.fullName || !registration.cpf) {
        return askCoverage()
      }

      return outcome({
        reply: { type: 'text', body: WHATSAPP_BOT.registration.askAddress },
        nextStep: 'AWAITING_ADDRESS',
        context: { location, registration: { ...registration, email } },
      })
    }

    case 'AWAITING_ADDRESS': {
      const address = normalizeAddress(params.text)
      if (!address) {
        return outcome({
          reply: {
            type: 'text',
            body: WHATSAPP_BOT.registration.invalidAddress,
          },
          nextStep: 'AWAITING_ADDRESS',
          context: params.context,
        })
      }

      const { location, registration } = params.context
      if (
        !location ||
        !registration?.fullName ||
        !registration.cpf ||
        !registration.email
      ) {
        return askCoverage()
      }

      return consentReply({
        location,
        registration: { ...registration, address },
      })
    }

    case 'AWAITING_CONSENT': {
      if (params.replyId === REPLY_IDS.registrationDecline) {
        return mainMenuReply(WHATSAPP_BOT.registration.declined)
      }
      if (params.replyId !== REPLY_IDS.registrationAccept) {
        return consentReply(params.context)
      }

      const { location, registration } = params.context
      if (
        !location ||
        !registration?.fullName ||
        !registration.cpf ||
        !registration.email ||
        !registration.address
      ) {
        return askCoverage()
      }

      return outcome({
        reply: {
          type: 'list',
          body: WHATSAPP_BOT.registration.success.replace(
            '{name}',
            firstName(registration.fullName),
          ),
          button: WHATSAPP_BOT.menu.button,
          rows: [
            {
              id: REPLY_IDS.postRegAccessArea,
              title: WHATSAPP_BOT.registration.postMenu.accessArea,
            },
            {
              id: REPLY_IDS.menuHuman,
              title: WHATSAPP_BOT.registration.postMenu.talkToTeam,
            },
            {
              id: REPLY_IDS.postRegSeeFaq,
              title: WHATSAPP_BOT.registration.postMenu.seeFaq,
            },
          ],
        },
        nextStep: 'POST_REGISTRATION_MENU',
        effect: {
          kind: 'create_lead',
          fullName: registration.fullName,
          cpf: registration.cpf,
          email: registration.email,
          address: registration.address,
          city: location.city,
          state: location.state,
        },
      })
    }

    case 'POST_REGISTRATION_MENU': {
      if (params.replyId === REPLY_IDS.postRegAccessArea) {
        return mainMenuReply(WHATSAPP_BOT.registration.postMenu.areaBody)
      }
      if (params.replyId === REPLY_IDS.postRegSeeFaq) return faqMenu()

      return misunderstood(params, () =>
        buildInitialConversationReply(params.profile),
      )
    }

    // O bot permanece pausado até a equipe assumir. A rota não chama esta
    // máquina para novas mensagens nesse estado, exceto quando a nutriz pede
    // explicitamente "menu" para voltar ao autoatendimento.
    case 'HUMAN_HANDOFF':
      return humanHandoffReply()

    // Qualquer conversa do fluxo antigo (agendamento ou o FAQ de uma camada
    // só) volta ao menu sem interpretar dado antigo como informação válida.
    case 'FAQ':
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
