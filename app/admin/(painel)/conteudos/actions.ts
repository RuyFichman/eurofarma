'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'

import { ADMIN_CONTENTS_PATH } from '@/lib/admin/contents/filters'
import {
  adminContentFormSchema,
  type AdminContentFormInput,
} from '@/lib/admin/contents/content-form-schema'
import { requireAdminUser } from '@/lib/auth/get-admin-user'
import {
  createAdminContent,
  findAvailableContentSlug,
  getAdminContentById,
  updateAdminContent,
} from '@/lib/db/queries/educational-contents'
import { ADMIN } from '@/lib/i18n/pt-br'
import { generateSimpleSlug } from '@/lib/utils/slug'

const COPY = ADMIN.contents.form.mutations

export type AdminContentActionResult = {
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

function databaseError(
  error: unknown,
  fallback: string,
): AdminContentActionResult {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return { ok: false, code: 'CONFLICT', message: COPY.conflict }
  }
  return { ok: false, code: 'DATABASE_ERROR', message: fallback }
}

function revalidateContentSurfaces(): void {
  revalidatePath(ADMIN_CONTENTS_PATH)
}

export async function createAdminContentAction(
  input: AdminContentFormInput,
): Promise<AdminContentActionResult> {
  const admin = await requireAdminUser()
  const parsed = adminContentFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  try {
    const base = generateSimpleSlug(parsed.data.title)
    const slug = await findAvailableContentSlug(base)
    if (!slug) return { ok: false, code: 'CONFLICT', message: COPY.conflict }
    await createAdminContent({
      data: parsed.data,
      slug,
      updatedByUserId: admin.id,
    })
  } catch (error) {
    return databaseError(error, COPY.createError)
  }

  revalidateContentSurfaces()
  redirect(ADMIN_CONTENTS_PATH)
}

export async function updateAdminContentAction(
  contentId: string,
  input: AdminContentFormInput,
): Promise<AdminContentActionResult> {
  const admin = await requireAdminUser()
  const id = contentId.trim()
  if (!id) return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }

  const parsed = adminContentFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  const current = await getAdminContentById(id)
  if (!current) {
    return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }
  }

  try {
    await updateAdminContent({
      id,
      data: parsed.data,
      currentPublishedAt: current.publishedAt,
      updatedByUserId: admin.id,
    })
  } catch (error) {
    return databaseError(error, COPY.updateError)
  }

  revalidateContentSurfaces()
  redirect(ADMIN_CONTENTS_PATH)
}
