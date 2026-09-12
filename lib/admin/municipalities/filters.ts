import {
  SERVICE_REGION_VALUES,
  type ServiceRegionValue,
} from '../../constants/service-municipalities'

export const ADMIN_MUNICIPALITIES_PATH = '/admin/municipios'
export const ADMIN_MUNICIPALITIES_PAGE_SIZE = 20

export const ADMIN_MUNICIPALITY_STATUS_VALUES = ['ACTIVE', 'INACTIVE'] as const

export type AdminMunicipalityStatusValue =
  (typeof ADMIN_MUNICIPALITY_STATUS_VALUES)[number]

export type AdminMunicipalityFilters = {
  query: string
  status: AdminMunicipalityStatusValue | ''
  region: ServiceRegionValue | ''
  page: number
}

export type AdminMunicipalitiesSearchParams = Record<
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

function isStatus(value: string): value is AdminMunicipalityStatusValue {
  return ADMIN_MUNICIPALITY_STATUS_VALUES.some((item) => item === value)
}

function isRegion(value: string): value is ServiceRegionValue {
  return SERVICE_REGION_VALUES.some((item) => item === value)
}

export function parseAdminMunicipalityFilters(
  params: AdminMunicipalitiesSearchParams,
): AdminMunicipalityFilters {
  const rawPage = Number.parseInt(first(params.page), 10)
  const page = Number.isFinite(rawPage)
    ? Math.min(10_000, Math.max(1, rawPage))
    : 1
  const status = first(params.status).toUpperCase()
  const region = first(params.region).toUpperCase()

  return {
    query: first(params.q).trim().slice(0, 100),
    status: isStatus(status) ? status : '',
    region: isRegion(region) ? region : '',
    page,
  }
}

export function hasActiveAdminMunicipalityFilters(
  filters: AdminMunicipalityFilters,
): boolean {
  return Boolean(filters.query || filters.status || filters.region)
}

export function buildAdminMunicipalitiesHref(
  filters: AdminMunicipalityFilters,
  page = filters.page,
): string {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.status) params.set('status', filters.status)
  if (filters.region) params.set('region', filters.region)
  if (page > 1) params.set('page', String(page))

  const query = params.toString()
  return query
    ? `${ADMIN_MUNICIPALITIES_PATH}?${query}`
    : ADMIN_MUNICIPALITIES_PATH
}
