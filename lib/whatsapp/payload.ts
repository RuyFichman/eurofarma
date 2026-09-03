/**
 * Extrai a mensagem recebida do payload do webhook da Meta.
 *
 * O formato é aninhado (`entry[].changes[].value.messages[]`) e o mesmo webhook
 * também entrega **recibos de entrega e leitura** (`value.statuses`), que não
 * são mensagens de ninguém. Tratar recibo como mensagem faria o bot responder
 * sozinho ao próprio envio, em laço — por isso a ausência de `messages` devolve
 * `null` em vez de erro.
 *
 * Tipos de mensagem que interessam: `text` (a data digitada) e `interactive`
 * (`button_reply` e `list_reply`, as respostas de botão). Áudio, imagem e
 * figurinha chegam sem texto e caem no ramo "não entendi" do fluxo.
 */
export type InboundWhatsappMessage = {
  /** Número do remetente em dígitos, como a Meta envia (`5511999998888`). */
  from: string
  messageId: string
  /** Texto digitado, quando houver. */
  text: string | null
  /** Id do botão ou item de lista escolhido, quando houver. */
  replyId: string | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

/** Id da resposta interativa, seja botão ou item de lista. */
function extractReplyId(message: Record<string, unknown>): string | null {
  const interactive = asRecord(message.interactive)
  if (!interactive) return null

  const buttonReply = asRecord(interactive.button_reply)
  if (buttonReply) return asString(buttonReply.id)

  const listReply = asRecord(interactive.list_reply)
  if (listReply) return asString(listReply.id)

  return null
}

export function extractInboundMessage(
  payload: unknown,
): InboundWhatsappMessage | null {
  const root = asRecord(payload)
  if (!root) return null

  for (const entry of asArray(root.entry)) {
    const entryRecord = asRecord(entry)
    if (!entryRecord) continue

    for (const change of asArray(entryRecord.changes)) {
      const value = asRecord(asRecord(change)?.value)
      if (!value) continue

      for (const rawMessage of asArray(value.messages)) {
        const message = asRecord(rawMessage)
        if (!message) continue

        const from = asString(message.from)
        const messageId = asString(message.id)
        if (!from || !messageId) continue

        return {
          from,
          messageId,
          text: asString(asRecord(message.text)?.body),
          replyId: extractReplyId(message),
        }
      }
    }
  }

  return null
}
