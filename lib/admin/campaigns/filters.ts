export const ADMIN_CAMPAIGNS_PATH = '/admin/campanhas'
export const ADMIN_CAMPAIGNS_PAGE_SIZE = 15

export const ADMIN_CAMPAIGN_STATUS_VALUES = ['ACTIVE', 'INACTIVE'] as const

export type AdminCampaignStatusValue =
  (typeof ADMIN_CAMPAIGN_STATUS_VALUES)[number]

export type AdminCampaignFilters = {
  query: string
  status: AdminCampaignStatusValue | ''
  source: string
  page: number
}

export type AdminCampaignsSearchParams = Record<
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

function isStatus(value: string): value is AdminCampaignStatusValue {
  return ADMIN_CAMPAIGN_STATUS_VALUES.some((item) => item === value)
}

export function parseAdminCampaignFilters(
  params: AdminCampaignsSearchParams,
): AdminCampaignFilters {
  const rawPage = Number.parseInt(first(params.page), 10)
  const page = Number.isFinite(rawPage)
    ? Math.min(10_000, Math.max(1, rawPage))
    : 1
  const status = first(params.status).toUpperCase()

  return {
    query: first(params.q).trim().slice(0, 100),
    status: isStatus(status) ? status : '',
    source: first(params.source).trim().slice(0, 100),
    page,
  }
}

export function hasActiveAdminCampaignFilters(
  filters: AdminCampaignFilters,
): boolean {
  return Boolean(filters.query || filters.status || filters.source)
}

export function buildAdminCampaignsHref(
  filters: AdminCampaignFilters,
  page = filters.page,
): string {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.status) params.set('status', filters.status)
  if (filters.source) params.set('source', filters.source)
  if (page > 1) params.set('page', String(page))

  const query = params.toString()
  return query ? `${ADMIN_CAMPAIGNS_PATH}?${query}` : ADMIN_CAMPAIGNS_PATH
}
