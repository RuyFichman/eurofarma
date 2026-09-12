import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { AdminMunicipalityForm } from '@/components/admin/municipalities/admin-municipality-form'
import { Button } from '@/components/ui/button'
import { ADMIN_MUNICIPALITIES_PATH } from '@/lib/admin/municipalities/filters'
import { ADMIN_MUNICIPALITY_CREATE_DEFAULTS } from '@/lib/admin/municipalities/municipality-form-schema'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.municipalities.form

export const metadata: Metadata = {
  title: COPY.create.seo.title,
  description: COPY.create.seo.description,
}

export default function NewMunicipalityPage() {
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
          {COPY.create.title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {COPY.create.description}
        </p>
      </div>
      <AdminMunicipalityForm
        mode="create"
        initialValues={ADMIN_MUNICIPALITY_CREATE_DEFAULTS}
      />
    </div>
  )
}
