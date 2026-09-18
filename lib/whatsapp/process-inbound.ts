import {
  createWhatsappNutrizLead,
  findNutrizByWhatsapp,
  getConversationState,
  saveConversationState,
} from '../db/queries/whatsapp-conversations'
import { setReminderConsent } from '../db/queries/communication-consents'
import { rateLimit } from '../security/rate-limit'
import { localDateToDate } from '../utils/local-date-time'
import {
  advanceConversation,
  buildReminderConsentFailureOutcome,
  buildReminderConsentResultOutcome,
  buildRegistrationFailureOutcome,
  isConversationResetText,
  resolveTextReplyId,
} from './conversation'
import { resolveWhatsappCoverageInput } from './coverage'
import type { InboundWhatsappMessage } from './payload'
import { sendWhatsappReply, type WhatsAppProvider } from './provider'
import { hydrateWhatsappReply } from './reply'

const RATE_LIMIT = { limit: 30, windowMs: 60_000 }

export async function processInboundWhatsappMessage(params: {
  message: InboundWhatsappMessage
  provider: WhatsAppProvider | null
  siteUrl: string
}): Promise<void> {
  const { message, provider, siteUrl } = params

  // O telefone é somente chave efêmera do limitador em memória; não vai a log.
  if (!rateLimit(`whatsapp:${message.from}`, RATE_LIMIT).success) return

  const profile = await findNutrizByWhatsapp(message.from)
  const state = await getConversationState(message.from)
  if (
    state.step === 'HUMAN_HANDOFF' &&
    !isConversationResetText(message.text)
  ) {
    return
  }

  const coverage =
    state.step === 'AWAITING_COVERAGE' &&
    message.text &&
    !isConversationResetText(message.text)
      ? await resolveWhatsappCoverageInput(message.text)
      : undefined

  let outcome = advanceConversation({
    step: state.step,
    context: state.context,
    misunderstoodCount: state.misunderstoodCount,
    text: message.text,
    replyId: message.replyId ?? resolveTextReplyId(message.text),
    coverage,
    profile,
    isNewConversation: state.isNewConversation,
  })

  let nutrizProfileId = profile?.id ?? null
  if (outcome.effect.kind === 'create_lead') {
    let created: Awaited<ReturnType<typeof createWhatsappNutrizLead>> = null
    try {
      created = await createWhatsappNutrizLead({
        phoneWhatsapp: message.from,
        fullName: outcome.effect.fullName,
        city: outcome.effect.city,
        state: outcome.effect.state,
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[whatsapp] cadastro não gravado', error)
      }
    }

    if (created) {
      nutrizProfileId = created.id
    } else {
      outcome = buildRegistrationFailureOutcome(state.context)
    }
  }

  if (outcome.effect.kind === 'set_reminder_consent' && profile) {
    try {
      const consent = await setReminderConsent({
        nutrizProfileId: profile.id,
        enabled: outcome.effect.enabled,
        source: 'WHATSAPP',
        sourceEventId: `whatsapp:${message.messageId}`,
        referenceDate: outcome.effect.referenceDate
          ? (localDateToDate(outcome.effect.referenceDate) ?? undefined)
          : undefined,
      })
      outcome =
        consent.status === 'NOT_FOUND'
          ? buildReminderConsentFailureOutcome(profile)
          : buildReminderConsentResultOutcome(consent.enabled)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[whatsapp] consentimento não gravado', error)
      }
      outcome = buildReminderConsentFailureOutcome(profile)
    }
  }

  await saveConversationState({
    phoneWhatsapp: message.from,
    nutrizProfileId,
    step: outcome.nextStep,
    context: outcome.context,
    misunderstoodCount: outcome.misunderstoodCount,
  })

  await sendWhatsappReply({
    to: message.from,
    reply: hydrateWhatsappReply(outcome.reply, siteUrl),
    provider,
  })
}
