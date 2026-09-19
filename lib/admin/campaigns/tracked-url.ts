type CampaignTrackingInput = {
  landingUrl: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
}

const INTERNAL_ORIGIN = 'https://nutrilink.local'

/** Gera a URL relativa divulgável sem inventar domínio ou remover query/hash. */
export function buildTrackedCampaignHref(input: CampaignTrackingInput): string {
  const url = new URL(input.landingUrl, INTERNAL_ORIGIN)
  url.searchParams.set('utm_source', input.utmSource)
  url.searchParams.set('utm_medium', input.utmMedium)
  url.searchParams.set('utm_campaign', input.utmCampaign)
  return `${url.pathname}${url.search}${url.hash}`
}
