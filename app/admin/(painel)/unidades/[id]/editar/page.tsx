import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AdminUnitForm } from '@/components/admin/units/admin-unit-form'
import { ADMIN_UNITS_PATH } from '@/lib/admin/units/filters'
import { mapUnitToFormValues } from '@/lib/admin/units/map-unit-to-form-values'
import { getAdminUnitById } from '@/lib/db/queries/admin-units'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.units.form

export const metadata: Metadata = {
  title: COPY.edit.seo.title,
  description: COPY.edit.seo.description,
}

/**
 * Edição de unidade — `/admin/unidades/[id]/editar` (Sprint 5.7).
 *
 * Server Component: a unidade é lida no servidor por `getAdminUnitById` e
 * chega ao formulário já convertida em valores serializáveis — **sem**
 * self-fetch de `/api/units` (mesma decisão da 3.4) e sem `useEffect` de
 * carregamento no cliente.
 *
 * `id` vem da URL e pode ser qualquer coisa; a query devolve `null` para o que
 * não existir e a página responde `notFound()`. Nunca renderiza formulário
 * vazio, que seria confundido com cadastro novo.
 *
 * Leitura pura: abrir esta tela não altera nada no banco. As mutações são 5.8.
 */
export default async function EditarUnidadePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const unit = await getAdminUnitById(id)

  if (!unit) {
    notFound()
  }

  // A página pública só existe para unidade ativa — `/banco-de-leite/[slug]`
  // chama `notFound()` em PENDING/INACTIVE (regra da 3.6).
  const publicHref =
    unit.status === 'ACTIVE' ? `/banco-de-leite/${unit.slug}` : null

  return (
    <div className="max-w-5xl space-y-6">
      <div className="space-y-3">
        <Link
          href={ADMIN_UNITS_PATH}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {COPY.actions.back}
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {COPY.edit.title}
          </h1>
          {/* O nome identifica a unidade melhor que o id, que não é mostrado. */}
          <p className="text-muted-foreground text-sm text-pretty">
            {unit.name}
          </p>
        </div>
      </div>

      <AdminUnitForm
        mode="edit"
        unitId={unit.id}
        slug={unit.slug}
        publicHref={publicHref}
        initialValues={mapUnitToFormValues(unit)}
      />
    </div>
  )
}
