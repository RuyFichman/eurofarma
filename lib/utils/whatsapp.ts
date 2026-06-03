const WA_BASE_URL = 'https://wa.me'

/**
 * Monta um link `wa.me` a partir de um número de WhatsApp armazenado.
 *
 * Remove qualquer formatação, garante o código de país `55` e, opcionalmente,
 * pré-preenche a mensagem via `?text=`. Retorna `null` quando não há dígitos
 * suficientes para um número válido (DDD + número = mínimo 10 dígitos), para a
 * UI poder cair em outro canal de contato.
 */
export function buildWhatsappUrl(
  whatsapp: string,
  message?: string,
): string | null {
  const digits = whatsapp.replace(/\D/g, '')
  if (digits.length < 10) return null

  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  const url = `${WA_BASE_URL}/${withCountry}`

  const text = message?.trim()
  return text ? `${url}?text=${encodeURIComponent(text)}` : url
}
