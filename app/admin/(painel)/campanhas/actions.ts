'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ADMIN_CAMPAIGNS_PATH } from '@/lib/admin/campaigns/filters'
import {
  adminCampaignFormSchema,
  type AdminCampaignFormInput,
} from '@/lib/admin/campaigns/campaign-form-schema'
import { requireAdminUser } from '@/lib/auth/get-admin-user'
import {
  createAdminCampaign,
  getAdminCampaignById,
  hasCampaignTrackingKey,
  updateAdminCampaign,
} from '@/lib/db/queries/campaigns'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.campaigns.form.mutations

export type AdminCampaignActionResult = {
  ok: false
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'CONFLICT' | 'DATABASE_ERROR'
  message: string
  fields?: Record<string, string>
}

function toFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in fields)) fields[key] = issue.message
  }
  return fields
}

async function trackingKeyExists(
  data: {
    utmSource: string
    utmMedium: string
    utmCampaign: string
  },
  excludeId?: string,
): Promise<boolean> {
  return hasCampaignTrackingKey({ ...data, excludeId })
}

export async function createAdminCampaignAction(
  input: AdminCampaignFormInput,
): Promise<AdminCampaignActionResult> {
  const admin = await requireAdminUser()
  const parsed = adminCampaignFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  try {
    if (await trackingKeyExists(parsed.data)) {
      return { ok: false, code: 'CONFLICT', message: COPY.conflict }
    }
    await createAdminCampaign({
      data: parsed.data,
      createdByUserId: admin.id,
    })
  } catch {
    return { ok: false, code: 'DATABASE_ERROR', message: COPY.createError }
  }

  revalidatePath(ADMIN_CAMPAIGNS_PATH)
  redirect(ADMIN_CAMPAIGNS_PATH)
}

export async function updateAdminCampaignAction(
  campaignId: string,
  input: AdminCampaignFormInput,
): Promise<AdminCampaignActionResult> {
  await requireAdminUser()
  const id = campaignId.trim()
  if (!id) return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }

  const parsed = adminCampaignFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  if (!(await getAdminCampaignById(id))) {
    return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }
  }

  try {
    if (await trackingKeyExists(parsed.data, id)) {
      return { ok: false, code: 'CONFLICT', message: COPY.conflict }
    }
    await updateAdminCampaign({ id, data: parsed.data })
  } catch {
    return { ok: false, code: 'DATABASE_ERROR', message: COPY.updateError }
  }

  revalidatePath(ADMIN_CAMPAIGNS_PATH)
  redirect(ADMIN_CAMPAIGNS_PATH)
}
