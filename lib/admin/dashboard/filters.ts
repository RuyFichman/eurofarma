import {
  SERVICE_REGION_VALUES,
  type ServiceRegionValue,
} from '../../constants/service-municipalities'
import { ORIGIN_KEYS, type RegistrationOrigin } from './charts'

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard'

export const DASHBOARD_STAGE_VALUES = [
  'INTERESTED',
  'CONTACTED',
  'DONATED',
  'UNKNOWN',
] as const

export type DashboardStage = (typeof DASHBOARD_STAGE_VALUES)[number]

export type DashboardFilters = {
  region: ServiceRegionValue | ''
  stage: DashboardStage | ''
  origin: RegistrationOrigin | ''
}

export type DashboardSearchParams = Record<
  string,
  string | string[] | undefined
>

function first(value: string | string[] | undefined): string {
  return typeof value === 'string'
    ? value
    : Array.isArray(value)
      ? (value[0] ?? '')
      : ''
}

function isRegion(value: string): value is ServiceRegionValue {
  return SERVICE_REGION_VALUES.some((item) => item === value)
}

function isStage(value: string): value is DashboardStage {
  return DASHBOARD_STAGE_VALUES.some((item) => item === value)
}

function isOrigin(value: string): value is RegistrationOrigin {
  return ORIGIN_KEYS.some((item) => item === value)
}

/**
 * Normaliza os filtros da URL sem lançar. Valores desconhecidos são ignorados
 * para que links antigos ou manipulados não quebrem o dashboard.
 */
export function parseDashboardFilters(
  params: DashboardSearchParams,
): DashboardFilters {
  const region = first(params.region).trim().toUpperCase()
  const stage = first(params.stage).trim().toUpperCase()
  const origin = first(params.origin).trim().toLowerCase()

  return {
    region: isRegion(region) ? region : '',
    stage: isStage(stage) ? stage : '',
    origin: isOrigin(origin) ? origin : '',
  }
}

export function hasActiveDashboardFilters(filters: DashboardFilters): boolean {
  return Boolean(filters.region || filters.stage || filters.origin)
}

function normalizeLocation(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR')
}

/** Chave interna tolerante a caixa, acentos e espaços duplicados. */
export function buildDashboardLocationKey(state: string, city: string): string {
  return `${state.trim().toUpperCase()}|${normalizeLocation(city)}`
}
