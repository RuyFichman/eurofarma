import type { InboundWhatsappMessage } from './payload'

type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function asPhone(value: unknown): string | null {
  const phone = asText(value)
  return phone && /^\d{8,15}$/u.test(phone) ? phone : null
}

function responseId(value: UnknownRecord): string | null {
  const buttons = asRecord(value.buttonsResponseMessage)
  const buttonId = asText(buttons?.buttonId) ?? asText(buttons?.id)
  if (buttonId) return buttonId

  const list = asRecord(value.listResponseMessage)
  const selected = asRecord(list?.singleSelectReply)
  return (
    asText(selected?.selectedRowId) ?? asText(list?.rowId) ?? asText(list?.id)
  )
}

function responseText(value: UnknownRecord): string | null {
  const text = asRecord(value.text)
  const buttons = asRecord(value.buttonsResponseMessage)
  const list = asRecord(value.listResponseMessage)
  return (
    asText(text?.message) ??
    asText(buttons?.message) ??
    asText(list?.title) ??
    null
  )
}

/**
 * Normaliza somente callbacks privados de texto e respostas interativas.
 * Todo outro evento da Z-API (status, mídia, grupos, canais e mensagens do
 * próprio número) é deliberadamente descartado antes da máquina de estados.
 */
export function extractZapiInboundMessage(
  payload: unknown,
  expectedInstanceId: string,
): InboundWhatsappMessage | null {
  const value = asRecord(payload)
  if (!value || !expectedInstanceId.trim()) return null

  if (
    value.type !== 'ReceivedCallback' ||
    value.instanceId !== expectedInstanceId ||
    value.fromMe !== false ||
    value.isGroup !== false ||
    value.isNewsletter !== false ||
    value.isStatusReply === true ||
    value.isEdit === true
  ) {
    return null
  }

  const from = asPhone(value.phone)
  const messageId = asText(value.messageId)
  if (!from || !messageId) return null

  const replyId = responseId(value)
  const text = responseText(value)
  return text || replyId ? { from, messageId, text, replyId } : null
}

export function isZapiTestPhoneAllowed(phone: string): boolean {
  if (process.env.ZAPI_TEST_MODE?.trim().toLowerCase() !== 'true') return true

  const allowed = (process.env.ZAPI_TEST_ALLOWED_PHONES ?? '')
    .split(/[\s,;]+/u)
    .map((value) => value.replace(/\D/gu, ''))
    .filter(Boolean)

  return allowed.includes(phone)
}
