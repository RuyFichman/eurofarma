import type { JourneyStatusValue } from '../journey/status'
import { WHATSAPP_BOT } from '../i18n/pt-br'

export const NOTIFICATION_OUTBOX_MAX_ATTEMPTS = 5
export const NOTIFICATION_LOCK_TIMEOUT_MS = 5 * 60 * 1000

const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000]

export function getNotificationRetryAt(attemptNumber: number, now: Date): Date {
  const index = Math.max(0, attemptNumber - 1)
  const delay = RETRY_DELAYS_MS[Math.min(index, RETRY_DELAYS_MS.length - 1)]!
  return new Date(now.getTime() + delay)
}

export function buildJourneyStatusNotificationBody(
  status: JourneyStatusValue,
  siteUrl: string,
): string {
  return WHATSAPP_BOT.statusNotification.body
    .replace('{status}', WHATSAPP_BOT.journeyStatus[status])
    .replace('{areaUrl}', `${siteUrl.replace(/\/$/u, '')}/meu-agendamento`)
}

export type NotificationTransportInput = {
  outboxId: string
  idempotencyKey: string
  to: string
  body: string
}

export type NotificationTransportResult =
  | { outcome: 'SENT'; providerMessageId: string }
  | { outcome: 'RETRYABLE_FAILURE'; errorCode: string }
  | { outcome: 'PERMANENT_FAILURE'; errorCode: string }

export type NotificationTransport = {
  send(input: NotificationTransportInput): Promise<NotificationTransportResult>
}
