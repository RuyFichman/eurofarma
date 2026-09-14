'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ADMIN_NUTRIZES_PATH } from '@/lib/admin/nutrizes/filters'
import { requireAdminUser } from '@/lib/auth/get-admin-user'
import { transitionAdminNutrizJourneyStatus } from '@/lib/db/queries/admin-nutriz-journey'
import { ADMIN } from '@/lib/i18n/pt-br'
import {
  adminJourneyStatusUpdateSchema,
  type JourneyStatusTransitionInput,
} from '@/lib/validators/journey-status'

const COPY = ADMIN.nutrizJourney.mutations

export type AdminJourneyStatusActionResult = {
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

export async function updateAdminNutrizJourneyStatusAction(
  nutrizProfileId: string,
  input: JourneyStatusTransitionInput,
): Promise<AdminJourneyStatusActionResult> {
  const admin = await requireAdminUser()
  const parsed = adminJourneyStatusUpdateSchema.safeParse({
    nutrizProfileId,
    ...input,
  })

  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  try {
    const result = await transitionAdminNutrizJourneyStatus({
      ...parsed.data,
      changedByUserId: admin.id,
    })

    if (result.status === 'NOT_FOUND') {
      return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }
    }
    if (result.status === 'CONFLICT') {
      return { ok: false, code: 'CONFLICT', message: COPY.conflict }
    }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR', message: COPY.databaseError }
  }

  revalidatePath(ADMIN_NUTRIZES_PATH)
  revalidatePath(`${ADMIN_NUTRIZES_PATH}/${parsed.data.nutrizProfileId}`)
  revalidatePath('/admin/dashboard')
  revalidatePath('/meu-agendamento')

  redirect(`${ADMIN_NUTRIZES_PATH}/${parsed.data.nutrizProfileId}?updated=1`)
}
