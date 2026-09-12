'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'

import { ADMIN_MUNICIPALITIES_PATH } from '@/lib/admin/municipalities/filters'
import {
  adminMunicipalityFormSchema,
  type AdminMunicipalityFormInput,
} from '@/lib/admin/municipalities/municipality-form-schema'
import { requireAdminUser } from '@/lib/auth/get-admin-user'
import { prisma } from '@/lib/db/prisma'
import {
  createAdminMunicipality,
  findAvailableMunicipalitySlug,
  updateAdminMunicipality,
} from '@/lib/db/queries/service-municipalities'
import { ADMIN } from '@/lib/i18n/pt-br'
import { generateSimpleSlug } from '@/lib/utils/slug'

const COPY = ADMIN.municipalities.form.mutations

export type AdminMunicipalityActionResult = {
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
): AdminMunicipalityActionResult {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return { ok: false, code: 'CONFLICT', message: COPY.conflict }
  }
  return { ok: false, code: 'DATABASE_ERROR', message: fallback }
}

function revalidateMunicipalitySurfaces(): void {
  revalidatePath(ADMIN_MUNICIPALITIES_PATH)
  revalidatePath('/admin/dashboard')
  revalidatePath('/verificar-cobertura')
  revalidatePath('/api/cities')
  revalidatePath('/')
}

export async function createAdminMunicipalityAction(
  input: AdminMunicipalityFormInput,
): Promise<AdminMunicipalityActionResult> {
  await requireAdminUser()

  const parsed = adminMunicipalityFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  try {
    const base = generateSimpleSlug(parsed.data.name)
    const slug = await findAvailableMunicipalitySlug(base)
    if (!slug) return { ok: false, code: 'CONFLICT', message: COPY.conflict }
    await createAdminMunicipality({ data: parsed.data, slug })
  } catch (error) {
    return databaseError(error, COPY.createError)
  }

  revalidateMunicipalitySurfaces()
  redirect(ADMIN_MUNICIPALITIES_PATH)
}

export async function updateAdminMunicipalityAction(
  municipalityId: string,
  input: AdminMunicipalityFormInput,
): Promise<AdminMunicipalityActionResult> {
  await requireAdminUser()

  const id = municipalityId.trim()
  if (!id) return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }

  const parsed = adminMunicipalityFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  const exists = await prisma.serviceMunicipality.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!exists) return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }

  try {
    await updateAdminMunicipality({ id, data: parsed.data })
  } catch (error) {
    return databaseError(error, COPY.updateError)
  }

  revalidateMunicipalitySurfaces()
  redirect(ADMIN_MUNICIPALITIES_PATH)
}
