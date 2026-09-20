import type { NotificationDeliveryStatus } from '@prisma/client'

type UnknownRecord = Record<string, unknown>

const STATUS_BY_ZAPI_VALUE: Readonly<
  Record<string, NotificationDeliveryStatus>
> = {
  ACCEPTED: 'ACCEPTED',
  QUEUED: 'QUEUED',
  PENDING: 'QUEUED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  RECEIVED: 'DELIVERED',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
  ERROR: 'FAILED',
  UNDELIVERED: 'UNDELIVERED',
}

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function providerMessageIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (id): id is string =>
      typeof id === 'string' && id.trim().length > 0 && id.trim().length <= 255,
  )
}

/**
 * Extrai somente os campos técnicos do callback `MessageStatusCallback`.
 * A Z-API também envia telefone e tipo de dispositivo, que são descartados.
 */
export function extractZapiDeliveryStatusEvents(
  payload: unknown,
  expectedInstanceId: string,
): Array<{
  providerMessageId: string
  status: NotificationDeliveryStatus
  errorCode: null
}> {
  const value = asRecord(payload)
  if (
    !value ||
    value.type !== 'MessageStatusCallback' ||
    value.instanceId !== expectedInstanceId ||
    value.isGroup !== false
  ) {
    return []
  }

  const status =
    typeof value.status === 'string'
      ? (STATUS_BY_ZAPI_VALUE[value.status.trim().toUpperCase()] ?? 'UNKNOWN')
      : 'UNKNOWN'

  return providerMessageIds(value.ids).map((providerMessageId) => ({
    providerMessageId: providerMessageId.trim(),
    status,
    errorCode: null,
  }))
}
