import type { AdminCampaignFormRecord } from '../../db/queries/campaigns'
import type { AdminCampaignFormInput } from './campaign-form-schema'

export function mapCampaignToFormValues(
  campaign: AdminCampaignFormRecord,
): AdminCampaignFormInput {
  return {
    name: campaign.name,
    utmSource: campaign.utmSource,
    utmMedium: campaign.utmMedium,
    utmCampaign: campaign.utmCampaign,
    landingUrl: campaign.landingUrl,
    status: campaign.isActive ? 'ACTIVE' : 'INACTIVE',
  }
}
