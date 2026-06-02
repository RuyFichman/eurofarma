import { citySearchParamsSchema } from './location'
import { isPublicUnitType, type PublicUnitType } from '../constants/unit-types'

/** Filtros já validados e normalizados de `GET /api/units`. */
export type UnitSearchParams = {
  state: string
  city: string | null
  neighborhood: string | null
  type: PublicUnitType | null
  hasWhatsapp: boolean | null
  page: number
  limit: number
}

export type UnitSearchErrorCode =
  | 'MISSING_STATE'
  | 'INVALID_STATE'
  | 'INVALID_TYPE'
  | 'INVALID_HAS_WHATSAPP'
  | 'INVALID_PAGE'
  | 'INVALID_LIMIT'

export type UnitSearchError = {
  code: UnitSearchErrorCode
  message: string
}

export type UnitSearchParseResult =
  | { ok: true; data: UnitSearchParams }
  | { ok: false; error: UnitSearchError }

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

const MESSAGES: Record<UnitSearchErrorCode, string> = {
  MISSING_STATE: 'O parâmetro state é obrigatório.',
  INVALID_STATE: 'Informe uma UF brasileira válida com 2 letras.',
  INVALID_TYPE: 'Informe um tipo de unidade válido.',
  INVALID_HAS_WHATSAPP:
    'O parâmetro has_whatsapp deve ser true, false, 1 ou 0.',
  INVALID_PAGE:
    'O parâmetro page deve ser um número inteiro maior ou igual a 1.',
  INVALID_LIMIT: 'O parâmetro limit deve ser um número inteiro entre 1 e 50.',
}

function fail(code: UnitSearchErrorCode): UnitSearchParseResult {
  return { ok: false, error: { code, message: MESSAGES[code] } }
}

/** `trim()` e converte string vazia em `null` (filtro opcional ignorado). */
function optionalText(raw: string | null): string | null {
  if (raw === null) return null
  const trimmed = raw.trim()
  return trimmed === '' ? null : trimmed
}

/** Aceita apenas inteiros não negativos em base 10 (rejeita `1.5`, `-1`, `abc`). */
function parsePositiveInt(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const value = Number(raw)
  return Number.isSafeInteger(value) ? value : null
}

/**
 * Lê e valida os query params de `GET /api/units`, retornando um resultado
 * discriminado para que o route handler emita o código de erro 400 específico
 * de cada campo. O `state` reusa o schema Zod da Sprint 3.1 (`citySearchParamsSchema`),
 * que normaliza (trim + uppercase) e valida contra a lista oficial de UFs.
 *
 * Precedência dos erros: state → type → has_whatsapp → page → limit.
 */
export function parseUnitSearchParams(
  searchParams: URLSearchParams,
): UnitSearchParseResult {
  // state — obrigatório.
  const rawState = searchParams.get('state')
  if (rawState === null) return fail('MISSING_STATE')

  const stateResult = citySearchParamsSchema.safeParse({ state: rawState })
  if (!stateResult.success) return fail('INVALID_STATE')
  const state = stateResult.data.state

  // city / neighborhood — opcionais, texto livre.
  const city = optionalText(searchParams.get('city'))
  const neighborhood = optionalText(searchParams.get('neighborhood'))

  // type — opcional; valida contra os tipos públicos.
  let type: PublicUnitType | null = null
  const rawType = searchParams.get('type')
  if (rawType !== null && rawType.trim() !== '') {
    const candidate = rawType.trim().toLowerCase()
    if (!isPublicUnitType(candidate)) return fail('INVALID_TYPE')
    type = candidate
  }

  // has_whatsapp — opcional; true/1 | false/0.
  let hasWhatsapp: boolean | null = null
  const rawHasWhatsapp = searchParams.get('has_whatsapp')
  if (rawHasWhatsapp !== null && rawHasWhatsapp.trim() !== '') {
    const value = rawHasWhatsapp.trim().toLowerCase()
    if (value === 'true' || value === '1') hasWhatsapp = true
    else if (value === 'false' || value === '0') hasWhatsapp = false
    else return fail('INVALID_HAS_WHATSAPP')
  }

  // page — opcional; inteiro >= 1.
  let page = DEFAULT_PAGE
  const rawPage = searchParams.get('page')
  if (rawPage !== null && rawPage.trim() !== '') {
    const parsed = parsePositiveInt(rawPage.trim())
    if (parsed === null || parsed < 1) return fail('INVALID_PAGE')
    page = parsed
  }

  // limit — opcional; inteiro entre 1 e 50.
  let limit = DEFAULT_LIMIT
  const rawLimit = searchParams.get('limit')
  if (rawLimit !== null && rawLimit.trim() !== '') {
    const parsed = parsePositiveInt(rawLimit.trim())
    if (parsed === null || parsed < 1 || parsed > MAX_LIMIT) {
      return fail('INVALID_LIMIT')
    }
    limit = parsed
  }

  return {
    ok: true,
    data: { state, city, neighborhood, type, hasWhatsapp, page, limit },
  }
}
