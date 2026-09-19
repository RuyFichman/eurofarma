import { z } from 'zod'

import { ADMIN } from '../../i18n/pt-br'

const COPY = ADMIN.contents.form.validation

export const adminContentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, COPY.titleRequired)
    .max(160, COPY.titleMax)
    .refine((value) => /[\p{L}\p{N}]/u.test(value), COPY.titleCharacters),
  category: z.string().trim().max(80, COPY.categoryMax),
  bodyMarkdown: z
    .string()
    .trim()
    .min(20, COPY.bodyRequired)
    .max(50_000, COPY.bodyMax),
  status: z.enum(['DRAFT', 'PUBLISHED'], {
    required_error: COPY.statusRequired,
    invalid_type_error: COPY.statusRequired,
  }),
})

export type AdminContentFormInput = z.input<typeof adminContentFormSchema>
export type AdminContentFormValues = z.output<typeof adminContentFormSchema>

export const ADMIN_CONTENT_CREATE_DEFAULTS: AdminContentFormInput = {
  title: '',
  category: '',
  bodyMarkdown: '',
  status: 'DRAFT',
}
