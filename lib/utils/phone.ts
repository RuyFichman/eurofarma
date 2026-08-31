/**
 * Utilitários de telefone para o link `tel:`. Funções puras, sem `window`.
 * O objetivo é gerar um href seguro e funcional — não validar todos os casos
 * de numeração do Brasil.
 */

/** Remove tudo que não for dígito. Retorna `null` se vazio ou curto demais. */
export function normalizePhoneDigits(
  value: string | null | undefined,
): string | null {
  if (!value) return null

  const digits = value.replace(/\D/g, '')
  if (digits.length < 8) return null

  return digits
}

/**
 * Separa DDD e assinante de um número brasileiro, descartando o DDI 55 quando
 * presente. `null` se não sobrar um número discável (10 ou 11 dígitos).
 */
function splitBrazilianNumber(
  value: string | null | undefined,
): { areaCode: string; subscriber: string } | null {
  const digits = normalizePhoneDigits(value)
  if (!digits) return null

  const local =
    (digits.length === 12 || digits.length === 13) && digits.startsWith('55')
      ? digits.slice(2)
      : digits

  if (local.length !== 10 && local.length !== 11) return null

  return { areaCode: local.slice(0, 2), subscriber: local.slice(2) }
}

/**
 * Formata para leitura: `(11) 99999-8888` (celular) ou `(11) 3986-1011` (fixo).
 * O DDI 55 com que o banco guarda o WhatsApp da nutriz não é exibido — quem
 * atende no painel pensa em DDD, não em código de país.
 */
export function formatBrazilianPhone(
  value: string | null | undefined,
): string | null {
  const parts = splitBrazilianNumber(value)
  if (!parts) return null

  const { areaCode, subscriber } = parts
  const split = subscriber.length === 9 ? 5 : 4

  return `(${areaCode}) ${subscriber.slice(0, split)}-${subscriber.slice(split)}`
}

/**
 * Versão mascarada para exibição em lista: `(11) •••••-••88`.
 *
 * Preserva DDD e os dois últimos dígitos — o suficiente para conferir que a
 * linha certa foi revelada, insuficiente para discar. Existe porque a listagem
 * de nutrizes mostra dados de pessoas reais e costuma ser aberta em
 * apresentação ou compartilhamento de tela.
 */
export function maskBrazilianPhone(
  value: string | null | undefined,
): string | null {
  const parts = splitBrazilianNumber(value)
  if (!parts) return null

  const { areaCode, subscriber } = parts
  const split = subscriber.length === 9 ? 5 : 4
  const tail = subscriber.slice(split)

  return `(${areaCode}) ${'•'.repeat(split)}-${'•'.repeat(
    Math.max(tail.length - 2, 0),
  )}${tail.slice(-2)}`
}

/**
 * Monta um href `tel:`. Se o número já carregar o DDI 55 (≥ 12 dígitos),
 * usa o prefixo internacional `+`; caso contrário, mantém os dígitos locais.
 */
export function buildPhoneHref(
  value: string | null | undefined,
): string | null {
  const digits = normalizePhoneDigits(value)
  if (!digits) return null

  if (digits.startsWith('55') && digits.length >= 12) {
    return `tel:+${digits}`
  }

  return `tel:${digits}`
}
