import type { NotificationDeliveryStatus } from '@prisma/client'

const STATUS_BY_TWILIO_VALUE: Readonly<
  Record<string, NotificationDeliveryStatus>
> = {
  accepted: 'ACCEPTED',
  queued: 'QUEUED',
  sending: 'SENDING',
  sent: 'SENT',
  delivered: 'DELIVERED',
  read: 'READ',
  failed: 'FAILED',
  undelivered: 'UNDELIVERED',
}

function nonEmpty(value: string | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Extrai somente o mínimo necessário para a auditoria de entrega. */
export function extractTwilioDeliveryStatusEvent(form: URLSearchParams): {
  providerMessageId: string
  status: NotificationDeliveryStatus
  errorCode: string | null
} | null {
  const providerMessageId = nonEmpty(form.get('MessageSid'))
  if (!providerMessageId || providerMessageId.length > 255) return null

  const status =
    STATUS_BY_TWILIO_VALUE[
      form.get('MessageStatus')?.trim().toLowerCase() ?? ''
    ] ?? 'UNKNOWN'
  return {
    providerMessageId,
    status,
    errorCode: nonEmpty(form.get('ErrorCode')),
  }
}
