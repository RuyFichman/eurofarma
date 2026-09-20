import type { WhatsappInboundMessageProvider } from '@prisma/client'

import {
  createWhatsappNutrizLead,
  findNutrizByWhatsapp,
  getConversationState,
  saveConversationState,
} from '../db/queries/whatsapp-conversations'
import {
  claimWhatsappInboundMessage,
  finishWhatsappInboundMessage,
} from '../db/queries/whatsapp-inbound-messages'
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
import {
  getZapiReplyOptionIds,
  resolveZapiNumberedReplyId,
} from './zapi-reply-options'

const RATE_LIMIT = { limit: 30, windowMs: 60_000 }

export async function processInboundWhatsappMessage(params: {
  message: InboundWhatsappMessage
  provider: WhatsAppProvider | null
  inboundProvider: WhatsappInboundMessageProvider
  siteUrl: string
}): Promise<void> {
  const { message, provider, inboundProvider, siteUrl } = params

  // O telefone é somente chave efêmera do limitador em memória; não vai a log.
  if (!rateLimit(`whatsapp:${message.from}`, RATE_LIMIT).success) return

  const inboundMessage = await claimWhatsappInboundMessage({
    provider: inboundProvider,
    providerMessageId: message.messageId,
  })
  if (!inboundMessage.claimed) return

  try {
    const profile = await findNutrizByWhatsapp(message.from)
    const state = await getConversationState(message.from)
    if (
      state.step === 'HUMAN_HANDOFF' &&
      !isConversationResetText(message.text)
    ) {
      await finishWhatsappInboundMessage({
        id: inboundMessage.id,
        result: 'IGNORED',
        phoneWhatsapp: message.from,
      })
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
      replyId:
        message.replyId ??
        (inboundProvider === 'ZAPI'
          ? resolveZapiNumberedReplyId(
              message.text,
              state.context.zapiReplyOptionIds,
            )
          : null) ??
        resolveTextReplyId(message.text),
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

    const context =
      inboundProvider === 'ZAPI'
        ? {
            ...outcome.context,
            ...(getZapiReplyOptionIds(outcome.reply)
              ? { zapiReplyOptionIds: getZapiReplyOptionIds(outcome.reply)! }
              : {}),
          }
        : outcome.context

    await saveConversationState({
      phoneWhatsapp: message.from,
      nutrizProfileId,
      step: outcome.nextStep,
      context,
      misunderstoodCount: outcome.misunderstoodCount,
    })

    const replyDelivery = await sendWhatsappReply({
      to: message.from,
      reply: hydrateWhatsappReply(outcome.reply, siteUrl),
      provider,
    })

    await finishWhatsappInboundMessage({
      id: inboundMessage.id,
      result: replyDelivery.outcome === 'SENT' ? 'PROCESSED' : 'FAILED',
      phoneWhatsapp: message.from,
      replyDelivery: {
        outcome: replyDelivery.outcome,
        ...(replyDelivery.outcome === 'SENT'
          ? { providerMessageId: replyDelivery.providerMessageId }
          : { errorCode: replyDelivery.errorCode }),
      },
    })
  } catch (error) {
    try {
      await finishWhatsappInboundMessage({
        id: inboundMessage.id,
        result: 'FAILED',
      })
    } catch {
      // A rota devolve 200 para evitar uma reentrega com efeitos duplicados.
    }
    throw error
  }
}
