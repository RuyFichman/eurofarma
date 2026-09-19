import {
  type NotificationDeliveryStatus,
  type NotificationDeliveryStatusProvider,
} from '@prisma/client'

import { prisma } from '../prisma'

function sanitizeErrorCode(value: string | null): string | null {
  if (!value) return null
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_:-]/gu, '_')
  return normalized.slice(0, 64) || null
}

/**
 * Acrescenta um callback Twilio à auditoria. Não atualiza tentativas nem a
 * outbox: elas registram o envio; esta tabela registra apenas o ciclo de vida
 * posterior, inclusive callbacks válidos ainda sem MessageSid conhecido.
 */
export async function recordNotificationDeliveryStatusEvent(params: {
  provider: NotificationDeliveryStatusProvider
  providerMessageId: string
  status: NotificationDeliveryStatus
  errorCode: string | null
}): Promise<void> {
  const outbox = await prisma.notificationOutbox.findFirst({
    where: { providerMessageId: params.providerMessageId },
    select: { id: true },
  })

  await prisma.notificationDeliveryStatusEvent.create({
    data: {
      outboxId: outbox?.id,
      provider: params.provider,
      providerMessageId: params.providerMessageId,
      status: params.status,
      errorCode: sanitizeErrorCode(params.errorCode),
    },
  })
}

export function recordTwilioDeliveryStatusEvent(params: {
  providerMessageId: string
  status: NotificationDeliveryStatus
  errorCode: string | null
}): Promise<void> {
  return recordNotificationDeliveryStatusEvent({
    ...params,
    provider: 'TWILIO',
  })
}

export function recordZapiDeliveryStatusEvent(params: {
  providerMessageId: string
  status: NotificationDeliveryStatus
  errorCode: string | null
}): Promise<void> {
  return recordNotificationDeliveryStatusEvent({ ...params, provider: 'ZAPI' })
}
