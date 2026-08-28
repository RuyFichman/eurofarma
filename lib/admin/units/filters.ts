import type { UnitStatus, UnitType } from '@prisma/client'

import { isBrazilianState } from '../../constants/brazilian-states'

/**
 * Contrato de URL da listagem administrativa de unidades (Sprint 5.6).
 *
 * Este módulo é a fonte única do que a URL `/admin/unidades?...` significa:
 * lê (`parseAdminUnitFilters`) e escreve (`buildAdminUnitsHref`) os mesmos
 * parâmetros, então filtro e paginação nunca discordam sobre o formato.
 *
 * Prisma-free de propósito (mesma regra da 3.3): o import de `@prisma/client` é
 * **type-only** e some na compilação. O `satisfies` abaixo faz o compilador
 * quebrar se um valor daqui deixar de existir no enum do schema — um valor
 * *novo* no enum, porém, não é detectado, então ao mexer nos enums revise estas
 * listas (mesma ressalva de `dashboard-metrics.ts`).
 *
 * Diferente da API pública (3.2), que usa `snake_case` desacoplado do Prisma, o
 * painel é interno: a URL carrega o próprio valor do enum (`status=ACTIVE`),
 * sem camada de tradução. A leitura é tolerante — `?status=active` também
 * funciona.
 */

export const ADMIN_UNITS_PATH = '/admin/unidades'

/** Teto de caracteres de `q`/`city`. Corta em vez de recusar: URL editada à mão nunca derruba a tela. */
const MAX_TEXT_LENGTH = 100

/**
 * Teto de página. Existe por um motivo concreto: `skip` do Prisma é Int32, e
 * `?page=99999999999` estouraria o tipo antes de chegar ao Postgres.
 */
const MAX_PAGE = 10_000

export const ADMIN_UNIT_STATUS_VALUES = [
  'ACTIVE',
  'PENDING',
  'INACTIVE',
] as const satisfies readonly UnitStatus[]

export const ADMIN_UNIT_TYPE_VALUES = [
  'MILK_BANK',
  'COLLECTION_POINT',
  'HOSPITAL',
  'PARTNER',
] as const satisfies readonly UnitType[]

export type AdminUnitStatusValue = (typeof ADMIN_UNIT_STATUS_VALUES)[number]
export type AdminUnitTypeValue = (typeof ADMIN_UNIT_TYPE_VALUES)[number]

/** `searchParams` do App Router, já resolvido (Next 15 entrega uma Promise). */
export type AdminUnitsSearchParams = Record<
  string,
  string | string[] | undefined
>

export type AdminUnitFilters = {
  /** Busca parcial por nome da unidade. */
  query?: string
  status?: AdminUnitStatusValue
  type?: AdminUnitTypeValue
  /** UF em maiúsculas, já validada contra a lista oficial. */
  state?: string
  city?: string
  /** Sempre >= 1. Página inválida vira 1 em vez de erro. */
  page: number
}

/** Primeiro valor útil do parâmetro (a URL pode repetir a mesma chave). */
function firstValue(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

/** Texto aparado e limitado; string vazia vira `undefined` (filtro ausente). */
function boundedText(value: string | string[] | undefined): string | undefined {
  const text = firstValue(value)?.trim().slice(0, MAX_TEXT_LENGTH)
  return text ? text : undefined
}

function isStatusValue(value: string): value is AdminUnitStatusValue {
  return (ADMIN_UNIT_STATUS_VALUES as readonly string[]).includes(value)
}

function isTypeValue(value: string): value is AdminUnitTypeValue {
  return (ADMIN_UNIT_TYPE_VALUES as readonly string[]).includes(value)
}

function parsePage(value: string | string[] | undefined): number {
  const raw = firstValue(value)?.trim()
  if (!raw) return 1

  // `Number.parseInt` aceitaria "12abc"; a listagem prefere ignorar lixo a
  // adivinhar intenção.
  if (!/^\d+$/.test(raw)) return 1

  const page = Number.parseInt(raw, 10)
  if (!Number.isSafeInteger(page) || page < 1) return 1

  return Math.min(page, MAX_PAGE)
}

/**
 * Lê os filtros da URL. **Nunca lança**: valor inválido é descartado e a tela
 * continua utilizável — o painel não deve quebrar porque alguém editou a barra
 * de endereços ou guardou um link antigo.
 */
export function parseAdminUnitFilters(
  searchParams: AdminUnitsSearchParams,
): AdminUnitFilters {
  const rawStatus = firstValue(searchParams.status)?.trim().toUpperCase()
  const rawType = firstValue(searchParams.type)?.trim().toUpperCase()
  const rawState = firstValue(searchParams.state)?.trim().toUpperCase()

  return {
    query: boundedText(searchParams.q),
    status: rawStatus && isStatusValue(rawStatus) ? rawStatus : undefined,
    type: rawType && isTypeValue(rawType) ? rawType : undefined,
    state: rawState && isBrazilianState(rawState) ? rawState : undefined,
    city: boundedText(searchParams.city),
    page: parsePage(searchParams.page),
  }
}

/**
 * Há algum filtro aplicado? `page` não conta — estar na página 3 não é filtrar,
 * e é isso que separa "nenhuma unidade cadastrada" de "nenhuma unidade
 * encontrada" nos estados vazios.
 */
export function hasActiveAdminUnitFilters(filters: AdminUnitFilters): boolean {
  return Boolean(
    filters.query ||
    filters.status ||
    filters.type ||
    filters.state ||
    filters.city,
  )
}

/**
 * Monta a URL da listagem preservando os filtros e trocando só a página.
 *
 * Serializa a partir dos filtros **já normalizados**, não dos parâmetros crus:
 * o formulário GET nativo envia campos vazios (`?q=&status=`), e reaproveitar
 * isso encheria os links de paginação de ruído. `page=1` é omitido.
 */
export function buildAdminUnitsHref(
  filters: AdminUnitFilters,
  page: number = filters.page,
): string {
  const params = new URLSearchParams()

  if (filters.query) params.set('q', filters.query)
  if (filters.status) params.set('status', filters.status)
  if (filters.type) params.set('type', filters.type)
  if (filters.state) params.set('state', filters.state)
  if (filters.city) params.set('city', filters.city)
  if (page > 1) params.set('page', String(page))

  const queryString = params.toString()
  return queryString ? `${ADMIN_UNITS_PATH}?${queryString}` : ADMIN_UNITS_PATH
}
