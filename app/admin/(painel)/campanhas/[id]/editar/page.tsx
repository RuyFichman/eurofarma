import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AdminCampaignForm } from '@/components/admin/campaigns/admin-campaign-form'
import { Button } from '@/components/ui/button'
import { ADMIN_CAMPAIGNS_PATH } from '@/lib/admin/campaigns/filters'
import { mapCampaignToFormValues } from '@/lib/admin/campaigns/map-campaign-to-form-values'
import { getAdminCampaignById } from '@/lib/db/queries/campaigns'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.campaigns.form

export const metadata: Metadata = {
  title: COPY.edit.seo.title,
  description: COPY.edit.seo.description,
}

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = await getAdminCampaignById(id)
  if (!campaign) notFound()

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={ADMIN_CAMPAIGNS_PATH}>
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
      <AdminCampaignForm
        mode="edit"
        campaignId={campaign.id}
        initialValues={mapCampaignToFormValues(campaign)}
      />
    </div>
  )
}
