import type { JourneyStatusValue } from '../journey/status'
import { WHATSAPP_BOT } from '../i18n/pt-br'
import type { WhatsAppTemplateName } from '../whatsapp/provider'

export const NOTIFICATION_OUTBOX_MAX_ATTEMPTS = 5
export const NOTIFICATION_LOCK_TIMEOUT_MS = 5 * 60 * 1000
export const WHATSAPP_CUSTOMER_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000

const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000]

export function getNotificationRetryAt(attemptNumber: number, now: Date): Date {
  const index = Math.max(0, attemptNumber - 1)
  const delay = RETRY_DELAYS_MS[Math.min(index, RETRY_DELAYS_MS.length - 1)]!
  return new Date(now.getTime() + delay)
}

export function buildJourneyStatusNotificationVariables(
  status: JourneyStatusValue,
  siteUrl: string,
): Readonly<Record<string, string>> {
  return {
    status: WHATSAPP_BOT.journeyStatus[status],
    areaUrl: `${siteUrl.replace(/\/$/u, '')}/meu-agendamento`,
  }
}

export function buildJourneyStatusNotificationBody(
  status: JourneyStatusValue,
  siteUrl: string,
): string {
  const variables = buildJourneyStatusNotificationVariables(status, siteUrl)
  return WHATSAPP_BOT.statusNotification.body
    .replace('{status}', variables.status!)
    .replace('{areaUrl}', variables.areaUrl!)
}

export type NotificationTransportInput = {
  outboxId: string
  idempotencyKey: string
  to: string
  body: string
  delivery: 'FREEFORM' | 'TEMPLATE'
  template: WhatsAppTemplateName | null
  templateVariables: Readonly<Record<string, string>> | null
}

export type NotificationTransportResult =
  | { outcome: 'SENT'; providerMessageId: string }
  | { outcome: 'RETRYABLE_FAILURE'; errorCode: string }
  | { outcome: 'PERMANENT_FAILURE'; errorCode: string }

export type NotificationTransport = {
  send(input: NotificationTransportInput): Promise<NotificationTransportResult>
}
