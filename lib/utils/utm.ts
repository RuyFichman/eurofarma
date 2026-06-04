/**
 * UTMs de origem da nutriz (atribuição de campanha). Apenas as 5 chaves padrão,
 * todas opcionais. Helper puro, sem `window` — usado no servidor (sanitização
 * antes de persistir) e seguro de tipar no cliente.
 */
export type SourceUtm = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

const MAX_UTM_LENGTH = 200

/**
 * Sanitiza um valor arbitrário em um `SourceUtm` seguro:
 * - aceita apenas as 5 chaves UTM (ignora o resto);
 * - apenas valores string (descarta arrays, objetos aninhados, números…);
 * - aplica `trim` e limita a 200 caracteres por valor;
 * - remove valores vazios;
 * - retorna `null` se não sobrar nenhuma chave.
 */
export function sanitizeSourceUtm(value: unknown): SourceUtm | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const input = value as Record<string, unknown>
  const result: SourceUtm = {}

  for (const key of UTM_KEYS) {
    const raw = input[key]
    if (typeof raw !== 'string') continue
    const trimmed = raw.trim().slice(0, MAX_UTM_LENGTH)
    if (trimmed.length > 0) {
      result[key] = trimmed
    }
  }

  return Object.keys(result).length > 0 ? result : null
}
