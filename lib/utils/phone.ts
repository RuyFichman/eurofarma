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
