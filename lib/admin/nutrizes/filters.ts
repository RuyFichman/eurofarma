import type { InterestStatus } from '@prisma/client'

import { isBrazilianState } from '../../constants/brazilian-states'

/**
 * Contrato de URL da listagem administrativa de nutrizes.
 *
 * Mesmo desenho da listagem de unidades (5.6): este módulo é a fonte única do
 * que `/admin/nutrizes?...` significa — lê (`parseAdminNutrizFilters`) e escreve
 * (`buildAdminNutrizesHref`) os mesmos parâmetros, então filtro e paginação
 * nunca discordam sobre o formato.
 *
 * Prisma-free: o import de `@prisma/client` é **type-only** e some na
 * compilação. O `satisfies` faz o compilador quebrar se um valor daqui sumir do
 * enum; valor *novo* no enum não é detectado, então ao mexer no schema revise
 * esta lista.
 *
 * **Não há filtro por cidade.** Diferente de unidades, aqui cada linha é uma
 * pessoa: filtrar por município numa base pequena isola indivíduos, que é a
 * mesma razão pela qual o dashboard (5.5) agrega nutrizes só por UF.
 */

export const ADMIN_NUTRIZES_PATH = '/admin/nutrizes'

/** Teto de caracteres de `q`. Corta em vez de recusar: URL editada à mão nunca derruba a tela. */
const MAX_TEXT_LENGTH = 100

/** Teto de página — `skip` do Prisma é Int32. */
const MAX_PAGE = 10_000

export const ADMIN_NUTRIZ_STATUS_VALUES = [
  'INTERESTED',
  'CONTACTED',
  'DONATED',
  'UNKNOWN',
] as const satisfies readonly InterestStatus[]

export type AdminNutrizStatusValue = (typeof ADMIN_NUTRIZ_STATUS_VALUES)[number]

export type AdminNutrizesSearchParams = Record<
  string,
  string | string[] | undefined
>

export type AdminNutrizFilters = {
  /** Busca parcial por nome. */
  query?: string
  status?: AdminNutrizStatusValue
  /** UF em maiúsculas, já validada contra a lista oficial. */
  state?: string
  /** Sempre >= 1. Página inválida vira 1 em vez de erro. */
  page: number
}

function firstValue(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function boundedText(value: string | string[] | undefined): string | undefined {
  const text = firstValue(value)?.trim().slice(0, MAX_TEXT_LENGTH)
  return text ? text : undefined
}

function isStatusValue(value: string): value is AdminNutrizStatusValue {
  return (ADMIN_NUTRIZ_STATUS_VALUES as readonly string[]).includes(value)
}

function parsePage(value: string | string[] | undefined): number {
  const raw = firstValue(value)?.trim()
  if (!raw) return 1
  if (!/^\d+$/.test(raw)) return 1

  const page = Number.parseInt(raw, 10)
  if (!Number.isSafeInteger(page) || page < 1) return 1

  return Math.min(page, MAX_PAGE)
}

/**
 * Lê os filtros da URL. **Nunca lança**: valor inválido é descartado e a tela
 * segue utilizável.
 */
export function parseAdminNutrizFilters(
  searchParams: AdminNutrizesSearchParams,
): AdminNutrizFilters {
  const rawStatus = firstValue(searchParams.status)?.trim().toUpperCase()
  const rawState = firstValue(searchParams.state)?.trim().toUpperCase()

  return {
    query: boundedText(searchParams.q),
    status: rawStatus && isStatusValue(rawStatus) ? rawStatus : undefined,
    state: rawState && isBrazilianState(rawState) ? rawState : undefined,
    page: parsePage(searchParams.page),
  }
}

/** Há algum filtro aplicado? `page` não conta — estar na página 3 não é filtrar. */
export function hasActiveAdminNutrizFilters(
  filters: AdminNutrizFilters,
): boolean {
  return Boolean(filters.query || filters.status || filters.state)
}

/**
 * Monta a URL da listagem preservando os filtros e trocando só a página.
 * Serializa a partir dos filtros já normalizados; `page=1` é omitido.
 */
export function buildAdminNutrizesHref(
  filters: AdminNutrizFilters,
  page: number = filters.page,
): string {
  const params = new URLSearchParams()

  if (filters.query) params.set('q', filters.query)
  if (filters.status) params.set('status', filters.status)
  if (filters.state) params.set('state', filters.state)
  if (page > 1) params.set('page', String(page))

  const queryString = params.toString()
  return queryString
    ? `${ADMIN_NUTRIZES_PATH}?${queryString}`
    : ADMIN_NUTRIZES_PATH
}
