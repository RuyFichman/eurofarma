import type { BotReply } from './conversation'

/**
 * IDs técnicos da última resposta interativa enviada pela Z-API. Eles permitem
 * converter "1", "2" e assim por diante sem guardar o texto da mensagem.
 */
export function getZapiReplyOptionIds(reply: BotReply): string[] | null {
  if (reply.type === 'text') return null
  return (reply.type === 'buttons' ? reply.buttons : reply.rows).map(
    (option) => option.id,
  )
}

export function resolveZapiNumberedReplyId(
  text: string | null,
  optionIds: readonly string[] | undefined,
): string | null {
  if (!text || !optionIds?.length) return null
  const match = /^(\d{1,2})\s*[.)-]?$/u.exec(text.trim())
  if (!match) return null

  const position = Number(match[1])
  if (!Number.isSafeInteger(position) || position < 1) return null
  return optionIds[position - 1] ?? null
}
