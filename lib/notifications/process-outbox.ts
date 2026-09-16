import {
  claimNextNotificationOutbox,
  finalizeNotificationOutbox,
} from '../db/queries/notification-outbox'
import {
  buildJourneyStatusNotificationBody,
  getNotificationRetryAt,
  type NotificationTransport,
  type NotificationTransportResult,
} from './journey-status-notification'

export type NotificationProcessingSummary = {
  claimed: number
  sent: number
  retried: number
  failed: number
  suppressed: number
}

function safeErrorCode(value: string): string {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_:-]/gu, '_')
  return normalized.slice(0, 64) || 'UNKNOWN_ERROR'
}

async function transportResult(
  transport: NotificationTransport,
  input: Parameters<NotificationTransport['send']>[0],
): Promise<NotificationTransportResult> {
  try {
    return await transport.send(input)
  } catch {
    return { outcome: 'RETRYABLE_FAILURE', errorCode: 'TRANSPORT_EXCEPTION' }
  }
}

export async function processNotificationOutbox(params: {
  transport: NotificationTransport
  siteUrl: string
  limit?: number
  now?: () => Date
}): Promise<NotificationProcessingSummary> {
  const limit = Math.min(100, Math.max(1, params.limit ?? 20))
  const now = params.now ?? (() => new Date())
  const summary: NotificationProcessingSummary = {
    claimed: 0,
    sent: 0,
    retried: 0,
    failed: 0,
    suppressed: 0,
  }

  for (let index = 0; index < limit; index += 1) {
    const claim = await claimNextNotificationOutbox(now())
    if (!claim) break
    summary.claimed += 1

    if (claim.profileDeleted || !claim.hasCurrentConsent) {
      const errorCode = claim.profileDeleted
        ? 'PROFILE_DELETED'
        : 'CONSENT_NOT_GRANTED'
      await finalizeNotificationOutbox({
        claim,
        status: 'SUPPRESSED',
        outcome: 'SUPPRESSED',
        errorCode,
        now: now(),
      })
      summary.suppressed += 1
      continue
    }

    if (!claim.toStatus) {
      await finalizeNotificationOutbox({
        claim,
        status: 'FAILED',
        outcome: 'FAILED',
        errorCode: 'INVALID_JOURNEY_STATUS_PAYLOAD',
        now: now(),
      })
      summary.failed += 1
      continue
    }

    const result = await transportResult(params.transport, {
      outboxId: claim.id,
      idempotencyKey: claim.idempotencyKey,
      to: claim.phoneWhatsapp,
      body: buildJourneyStatusNotificationBody(claim.toStatus, params.siteUrl),
    })
    const completedAt = now()

    if (result.outcome === 'SENT' && result.providerMessageId.trim()) {
      await finalizeNotificationOutbox({
        claim,
        status: 'SENT',
        outcome: 'SENT',
        providerMessageId: result.providerMessageId.trim().slice(0, 255),
        now: completedAt,
      })
      summary.sent += 1
      continue
    }

    const errorCode =
      result.outcome === 'SENT'
        ? 'PROVIDER_MESSAGE_ID_MISSING'
        : safeErrorCode(result.errorCode)
    const shouldRetry =
      result.outcome !== 'PERMANENT_FAILURE' &&
      claim.attemptNumber < claim.maxAttempts

    if (shouldRetry) {
      await finalizeNotificationOutbox({
        claim,
        status: 'RETRY_SCHEDULED',
        outcome: 'RETRY_SCHEDULED',
        errorCode,
        availableAt: getNotificationRetryAt(claim.attemptNumber, completedAt),
        now: completedAt,
      })
      summary.retried += 1
    } else {
      await finalizeNotificationOutbox({
        claim,
        status: 'FAILED',
        outcome: 'FAILED',
        errorCode,
        now: completedAt,
      })
      summary.failed += 1
    }
  }

  return summary
}
