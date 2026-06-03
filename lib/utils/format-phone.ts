/**
 * Formata um telefone brasileiro (armazenado só com dígitos) para exibição.
 * 10 dígitos → `(11) 3091-9492` · 11 dígitos → `(11) 99999-8888`.
 * Fora desses tamanhos, devolve o valor original sem alterar.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  return phone
}

/** Monta um href `tel:` com o código de país do Brasil. */
export function buildTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  return `tel:+${withCountry}`
}
