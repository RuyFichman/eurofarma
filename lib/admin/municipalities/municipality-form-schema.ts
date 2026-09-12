import { z } from 'zod'

import {
  SERVICE_REGION_VALUES,
  type ServiceRegionValue,
} from '../../constants/service-municipalities'
import { ADMIN } from '../../i18n/pt-br'

const COPY = ADMIN.municipalities.form.validation

function isRegion(value: string): value is ServiceRegionValue {
  return SERVICE_REGION_VALUES.some((item) => item === value)
}

export const adminMunicipalityFormSchema = z.object({
  name: z.string().trim().min(2, COPY.nameRequired).max(80, COPY.nameMax),
  region: z
    .string()
    .trim()
    .refine((value): value is ServiceRegionValue => isRegion(value), {
      message: COPY.regionRequired,
    }),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    required_error: COPY.statusRequired,
    invalid_type_error: COPY.statusRequired,
  }),
})

export type AdminMunicipalityFormInput = z.input<
  typeof adminMunicipalityFormSchema
>
export type AdminMunicipalityFormValues = z.output<
  typeof adminMunicipalityFormSchema
>

export const ADMIN_MUNICIPALITY_CREATE_DEFAULTS: AdminMunicipalityFormInput = {
  name: '',
  region: '',
  status: 'ACTIVE',
}
