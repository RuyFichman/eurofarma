'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'

import { requireAdminUser } from '@/lib/auth/get-admin-user'
import { prisma } from '@/lib/db/prisma'
import {
  createAdminUnit,
  findAvailableUnitSlug,
  updateAdminUnit,
} from '@/lib/db/queries/admin-units'
import { ADMIN_UNITS_PATH } from '@/lib/admin/units/filters'
import { normalizeAdminUnitInput } from '@/lib/admin/units/normalize-unit-input'
import {
  adminUnitFormSchema,
  type AdminUnitFormInput,
} from '@/lib/admin/units/unit-form-schema'
import { ADMIN } from '@/lib/i18n/pt-br'
import { generateSlug } from '@/lib/utils/slug'

/**
 * Mutações administrativas de unidade (Sprint 5.8).
 *
 * Server Actions, não rotas de API: é a arquitetura que o painel já usa
 * (`app/admin/login/actions.ts`, `app/admin/actions.ts`) e não existe nenhum
 * `app/api/admin/*` para imitar.
 *
 * Ordem de toda mutação: **autorizar → validar → normalizar → gravar →
 * revalidar → redirecionar**. A autorização vem primeiro e fora do `try`, para
 * que nenhum trabalho aconteça antes dela e para que o `redirect` interno do
 * `requireAdminUser` não seja engolido pelo `catch`.
 *
 * O gate de rota da 5.3 protege a *tela*; não bastaria para a *mutação*, que é
 * um endpoint próprio e precisa checar autorização por conta.
 */

const COPY = ADMIN.units.form.mutations

export type AdminUnitActionResult = {
  ok: false
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'SLUG_CONFLICT' | 'DATABASE_ERROR'
  message: string
  /** Mensagens por campo, prontas para o `setError` do React Hook Form. */
  fields?: Record<string, string>
}

/**
 * Converte os `issues` do Zod em mensagens por campo. Só o primeiro erro de
 * cada campo interessa — o formulário mostra um por vez.
 */
function toFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): Record<string, string> {
  const fields: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in fields)) {
      fields[key] = issue.message
    }
  }

  return fields
}

/**
 * Traduz falha de banco em erro seguro. Nunca devolve `error.message`, código
 * do Prisma ou stack para a interface — o admin vê uma frase acionável e o
 * diagnóstico fica no log do servidor.
 */
function toSafeDatabaseError(
  error: unknown,
  fallbackMessage: string,
): AdminUnitActionResult {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    // O único `@unique` do `Unit` é o slug. Só se chega aqui em corrida entre
    // dois cadastros simultâneos — o cálculo de sufixo cobre o caso comum.
    return { ok: false, code: 'SLUG_CONFLICT', message: COPY.slugConflict }
  }

  return { ok: false, code: 'DATABASE_ERROR', message: fallbackMessage }
}

/**
 * Invalida tudo que a unidade alimenta.
 *
 * Além do painel, entram as superfícies públicas: `/buscar`, a home (que exibe
 * os números reais da rede), os dois route handlers com `revalidate` próprio
 * (`/api/units` 5min, `/api/cities` 1h) e a página da unidade. Sem isso,
 * publicar uma unidade não apareceria na busca até o cache expirar sozinho.
 */
function revalidateUnitSurfaces(slug: string): void {
  revalidatePath(ADMIN_UNITS_PATH)
  revalidatePath('/admin/dashboard')
  revalidatePath('/')
  revalidatePath('/buscar')
  revalidatePath('/api/units')
  revalidatePath('/api/cities')
  revalidatePath(`/banco-de-leite/${slug}`)
}

/**
 * Cadastra uma unidade.
 *
 * O tipo do parâmetro é conveniência para quem chama, **não** garantia de
 * runtime: o payload atravessa a fronteira cliente→servidor, então é revalidado
 * com o mesmo schema da 5.7 antes de qualquer uso.
 */
export async function createAdminUnitAction(
  input: AdminUnitFormInput,
): Promise<AdminUnitActionResult> {
  await requireAdminUser()

  const parsed = adminUnitFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  const data = normalizeAdminUnitInput(parsed.data)

  let slug: string
  try {
    // Slug no padrão da 1.3: `<nome>-<uf>-<cidade>`. Depende da localização,
    // não só do nome — duas unidades homônimas em cidades diferentes não
    // colidem.
    const base = generateSlug(data.name, data.addressState, data.addressCity)
    const available = await findAvailableUnitSlug(base)
    if (!available) {
      return { ok: false, code: 'SLUG_CONFLICT', message: COPY.slugConflict }
    }
    slug = available

    await createAdminUnit({ data, slug })
  } catch (error) {
    return toSafeDatabaseError(error, COPY.createError)
  }

  revalidateUnitSurfaces(slug)
  // Fora do `try`: `redirect` sinaliza por exceção e não pode ser capturado.
  redirect(ADMIN_UNITS_PATH)
}

/**
 * Atualiza uma unidade existente.
 *
 * **O slug nunca é regerado.** Ele compõe a URL pública e é a chave que a 3.6
 * resolve; recalcular a cada troca de nome quebraria links já divulgados e
 * referências de tracking. Trocar o endereço público é decisão consciente e não
 * existe nesta tela (ver §13).
 */
export async function updateAdminUnitAction(
  unitId: string,
  input: AdminUnitFormInput,
): Promise<AdminUnitActionResult> {
  await requireAdminUser()

  const id = unitId.trim()
  if (id === '') {
    return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }
  }

  const parsed = adminUnitFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: COPY.validationGeneric,
      fields: toFieldErrors(parsed.error),
    }
  }

  const data = normalizeAdminUnitInput(parsed.data)

  // Confere existência antes de gravar: id inexistente responde "não
  // encontrada" em vez de criar registro novo por engano. O slug de volta é o
  // que será revalidado — o registro mantém o dele.
  const existing = await prisma.unit.findUnique({
    where: { id },
    select: { slug: true },
  })
  if (!existing) {
    return { ok: false, code: 'NOT_FOUND', message: COPY.notFound }
  }

  try {
    await updateAdminUnit({ id, data })
  } catch (error) {
    return toSafeDatabaseError(error, COPY.updateError)
  }

  revalidateUnitSurfaces(existing.slug)
  redirect(ADMIN_UNITS_PATH)
}
