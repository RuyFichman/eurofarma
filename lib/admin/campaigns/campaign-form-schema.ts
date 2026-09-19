import { z } from 'zod'

import { ADMIN } from '../../i18n/pt-br'

const COPY = ADMIN.campaigns.form.validation
const UTM_TOKEN = /^[a-z0-9][a-z0-9._~-]*$/u
const INTERNAL_PUBLIC_PATH = /^\/(?!\/)(?!.*\\)[^\s]*$/u

function utmTokenSchema(requiredMessage: string) {
  return z
    .string()
    .trim()
    .toLowerCase()
    .min(1, requiredMessage)
    .max(200, COPY.utmMax)
    .regex(UTM_TOKEN, COPY.utmFormat)
}

export const adminCampaignFormSchema = z.object({
  name: z.string().trim().min(3, COPY.nameRequired).max(120, COPY.nameMax),
  utmSource: utmTokenSchema(COPY.utmSourceRequired),
  utmMedium: utmTokenSchema(COPY.utmMediumRequired),
  utmCampaign: utmTokenSchema(COPY.utmCampaignRequired),
  landingUrl: z
    .string()
    .trim()
    .min(1, COPY.landingUrlRequired)
    .max(500, COPY.landingUrlMax)
    .refine(
      (value) =>
        INTERNAL_PUBLIC_PATH.test(value) &&
        !value.startsWith('/admin') &&
        !value.startsWith('/api') &&
        !value.startsWith('/auth'),
      COPY.landingUrlInternal,
    ),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    required_error: COPY.statusRequired,
    invalid_type_error: COPY.statusRequired,
  }),
})

export type AdminCampaignFormInput = z.input<typeof adminCampaignFormSchema>
export type AdminCampaignFormValues = z.output<typeof adminCampaignFormSchema>

export const ADMIN_CAMPAIGN_CREATE_DEFAULTS: AdminCampaignFormInput = {
  name: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  landingUrl: '/cadastro',
  status: 'ACTIVE',
}
