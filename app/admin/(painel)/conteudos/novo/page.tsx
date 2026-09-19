import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { AdminContentForm } from '@/components/admin/contents/admin-content-form'
import { Button } from '@/components/ui/button'
import { ADMIN_CONTENTS_PATH } from '@/lib/admin/contents/filters'
import { ADMIN_CONTENT_CREATE_DEFAULTS } from '@/lib/admin/contents/content-form-schema'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.contents.form

export const metadata: Metadata = {
  title: COPY.create.seo.title,
  description: COPY.create.seo.description,
}

export default function NewContentPage() {
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
          {COPY.create.title}
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
          {COPY.create.description}
        </p>
      </div>
      <AdminContentForm
        mode="create"
        initialValues={ADMIN_CONTENT_CREATE_DEFAULTS}
      />
    </div>
  )
}
