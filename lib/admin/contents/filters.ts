export const ADMIN_CONTENTS_PATH = '/admin/conteudos'
export const ADMIN_CONTENTS_PAGE_SIZE = 15

export const ADMIN_CONTENT_STATUS_VALUES = ['PUBLISHED', 'DRAFT'] as const

export type AdminContentStatusValue =
  (typeof ADMIN_CONTENT_STATUS_VALUES)[number]

export type AdminContentFilters = {
  query: string
  status: AdminContentStatusValue | ''
  category: string
  page: number
}

export type AdminContentsSearchParams = Record<
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

function isStatus(value: string): value is AdminContentStatusValue {
  return ADMIN_CONTENT_STATUS_VALUES.some((item) => item === value)
}

export function parseAdminContentFilters(
  params: AdminContentsSearchParams,
): AdminContentFilters {
  const rawPage = Number.parseInt(first(params.page), 10)
  const page = Number.isFinite(rawPage)
    ? Math.min(10_000, Math.max(1, rawPage))
    : 1
  const status = first(params.status).toUpperCase()

  return {
    query: first(params.q).trim().slice(0, 100),
    status: isStatus(status) ? status : '',
    category: first(params.category).trim().slice(0, 80),
    page,
  }
}

export function hasActiveAdminContentFilters(
  filters: AdminContentFilters,
): boolean {
  return Boolean(filters.query || filters.status || filters.category)
}

export function buildAdminContentsHref(
  filters: AdminContentFilters,
  page = filters.page,
): string {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (page > 1) params.set('page', String(page))

  const query = params.toString()
  return query ? `${ADMIN_CONTENTS_PATH}?${query}` : ADMIN_CONTENTS_PATH
}
