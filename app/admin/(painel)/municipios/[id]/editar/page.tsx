import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AdminMunicipalityForm } from '@/components/admin/municipalities/admin-municipality-form'
import { Button } from '@/components/ui/button'
import { ADMIN_MUNICIPALITIES_PATH } from '@/lib/admin/municipalities/filters'
import { mapMunicipalityToFormValues } from '@/lib/admin/municipalities/map-municipality-to-form-values'
import { getAdminMunicipalityById } from '@/lib/db/queries/service-municipalities'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.municipalities.form

export const metadata: Metadata = {
  title: COPY.edit.seo.title,
  description: COPY.edit.seo.description,
}

export default async function EditMunicipalityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const municipality = await getAdminMunicipalityById(id)
  if (!municipality) notFound()

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={ADMIN_MUNICIPALITIES_PATH}>
          <ArrowLeft aria-hidden="true" />
          {COPY.actions.back}
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {COPY.edit.title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {COPY.edit.description}
        </p>
      </div>
      <AdminMunicipalityForm
        mode="edit"
        municipalityId={municipality.id}
        initialValues={mapMunicipalityToFormValues(municipality)}
      />
    </div>
  )
}
