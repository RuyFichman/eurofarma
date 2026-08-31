import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { AdminUnitForm } from '@/components/admin/units/admin-unit-form'
import { ADMIN_UNITS_PATH } from '@/lib/admin/units/filters'
import { ADMIN_UNIT_CREATE_DEFAULTS } from '@/lib/admin/units/unit-form-schema'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.units.form

export const metadata: Metadata = {
  title: COPY.create.seo.title,
  description: COPY.create.seo.description,
}

/**
 * Cadastro de unidade — `/admin/unidades/nova` (Sprint 5.7).
 *
 * Server Component sem consulta ao banco: criar não depende de nenhum registro
 * existente, e os defaults são constantes. O chrome do painel e o gate de role
 * vêm do layout de `(painel)`; a página não os repete.
 *
 * A persistência entra na 5.8 — hoje o formulário apenas valida.
 */
export default function NovaUnidadePage() {
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
            {COPY.create.title}
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            {COPY.create.description}
          </p>
        </div>
      </div>

      <AdminUnitForm mode="create" initialValues={ADMIN_UNIT_CREATE_DEFAULTS} />
    </div>
  )
}
