const WA_BASE_URL = 'https://wa.me'

/**
 * Normaliza um número de WhatsApp brasileiro para o formato aceito pelo `wa.me`
 * (apenas dígitos, com DDI 55). Funções puras, sem `window` — seguras em RSC.
 *
 * Regras:
 * - vazio/nulo → `null`;
 * - remove tudo que não for dígito;
 * - 10 ou 11 dígitos (DDD + número, sem DDI) → prefixa `55`;
 * - já começa com `55` e tem ≥ 12 dígitos → preserva;
 * - menos de 10 dígitos após a limpeza → `null`.
 */
export function normalizeBrazilianWhatsappNumber(
  value: string | null | undefined,
): string | null {
  if (!value) return null

  const digits = value.replace(/\D/g, '')
  if (digits.length < 10) return null

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }

  // ≥ 12 dígitos: assume que já carrega o DDI (55 ou outro) e preserva.
  return digits
}

/**
 * Monta a URL `wa.me` com a mensagem pré-preenchida. Retorna `null` quando o
 * número não normaliza para um WhatsApp válido (a UI cai em outro canal).
 */
export function buildWhatsappUrl(params: {
  phone: string | null | undefined
  message: string
}): string | null {
  const number = normalizeBrazilianWhatsappNumber(params.phone)
  if (!number) return null

  return `${WA_BASE_URL}/${number}?text=${encodeURIComponent(params.message)}`
}
