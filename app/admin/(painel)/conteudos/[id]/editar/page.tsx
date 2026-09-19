import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AdminContentForm } from '@/components/admin/contents/admin-content-form'
import { Button } from '@/components/ui/button'
import { ADMIN_CONTENTS_PATH } from '@/lib/admin/contents/filters'
import { mapContentToFormValues } from '@/lib/admin/contents/map-content-to-form-values'
import { getAdminContentById } from '@/lib/db/queries/educational-contents'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.contents.form

export const metadata: Metadata = {
  title: COPY.edit.seo.title,
  description: COPY.edit.seo.description,
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const content = await getAdminContentById(id)
  if (!content) notFound()

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={ADMIN_CONTENTS_PATH}>
          <ArrowLeft aria-hidden="true" />
          {COPY.actions.back}
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {COPY.edit.title}
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
          {COPY.edit.description}
        </p>
      </div>
      <AdminContentForm
        mode="edit"
        contentId={content.id}
        slug={content.slug}
        initialValues={mapContentToFormValues(content)}
      />
    </div>
  )
}
