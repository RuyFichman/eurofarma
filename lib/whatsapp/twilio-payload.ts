import type { InboundWhatsappMessage } from './payload'

function digits(value: string | null): string {
  return value?.replace(/\D/gu, '') ?? ''
}

export function extractTwilioInboundMessage(
  form: URLSearchParams,
): InboundWhatsappMessage | null {
  const from = digits(form.get('WaId')) || digits(form.get('From'))
  const messageId = form.get('MessageSid')?.trim() ?? ''
  if (!from || !messageId) return null

  const body = form.get('Body')?.trim()
  const replyId = form.get('ButtonPayload')?.trim()

  return {
    from,
    messageId,
    text: body || null,
    replyId: replyId || null,
  }
}
