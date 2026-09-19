'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { AlertCircle, Link2 } from 'lucide-react'

import {
  createAdminCampaignAction,
  updateAdminCampaignAction,
} from '@/app/admin/(painel)/campanhas/actions'
import { AdminCampaignLink } from '@/components/admin/campaigns/admin-campaign-link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ADMIN_CAMPAIGNS_PATH } from '@/lib/admin/campaigns/filters'
import {
  adminCampaignFormSchema,
  type AdminCampaignFormInput,
  type AdminCampaignFormValues,
} from '@/lib/admin/campaigns/campaign-form-schema'
import { buildTrackedCampaignHref } from '@/lib/admin/campaigns/tracked-url'
import { ADMIN } from '@/lib/i18n/pt-br'

type AdminCampaignFormProps =
  | { mode: 'create'; initialValues: AdminCampaignFormInput }
  | {
      mode: 'edit'
      campaignId: string
      initialValues: AdminCampaignFormInput
    }

const FIELD_NAMES = [
  'name',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'landingUrl',
  'status',
] as const

export function AdminCampaignForm(props: AdminCampaignFormProps) {
  const copy = ADMIN.campaigns.form[props.mode]
  const copyRoot = ADMIN.campaigns.form
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<
    AdminCampaignFormInput,
    unknown,
    AdminCampaignFormValues
  >({
    resolver: zodResolver(adminCampaignFormSchema),
    defaultValues: props.initialValues,
  })
  const values = useWatch({ control: form.control })
  const canPreview =
    values.landingUrl?.startsWith('/') &&
    Boolean(values.utmSource && values.utmMedium && values.utmCampaign)
  const previewHref = canPreview
    ? buildTrackedCampaignHref({
        landingUrl: values.landingUrl ?? '/cadastro',
        utmSource: values.utmSource ?? '',
        utmMedium: values.utmMedium ?? '',
        utmCampaign: values.utmCampaign ?? '',
      })
    : null

  async function onSubmit(values: AdminCampaignFormValues) {
    setSubmitError(null)
    const result =
      props.mode === 'create'
        ? await createAdminCampaignAction(values)
        : await updateAdminCampaignAction(props.campaignId, values)

    if (result.fields) {
      for (const [field, message] of Object.entries(result.fields)) {
        if (FIELD_NAMES.some((name) => name === field)) {
          form.setError(field as (typeof FIELD_NAMES)[number], { message })
        }
      }
    }
    setSubmitError(result.message)
  }

  const errors = form.formState.errors
  const isSubmitting = form.formState.isSubmitting

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:items-start"
      noValidate
    >
      <div className="bg-card space-y-8 rounded-2xl border p-6 shadow-sm md:p-8">
        {submitError ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>{copyRoot.mutations.errorTitle}</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            id="campaign-name"
            label={copyRoot.fields.name.label}
            helper={copyRoot.fields.name.helper}
            error={errors.name?.message}
            className="md:col-span-2"
          >
            <Input
              id="campaign-name"
              className="h-11"
              placeholder={copyRoot.fields.name.placeholder}
              aria-invalid={Boolean(errors.name)}
              {...form.register('name')}
            />
          </FormField>

          <FormField
            id="campaign-source"
            label={copyRoot.fields.utmSource.label}
            helper={copyRoot.fields.utmSource.helper}
            error={errors.utmSource?.message}
          >
            <Input
              id="campaign-source"
              placeholder={copyRoot.fields.utmSource.placeholder}
              aria-invalid={Boolean(errors.utmSource)}
              {...form.register('utmSource')}
            />
          </FormField>

          <FormField
            id="campaign-medium"
            label={copyRoot.fields.utmMedium.label}
            helper={copyRoot.fields.utmMedium.helper}
            error={errors.utmMedium?.message}
          >
            <Input
              id="campaign-medium"
              placeholder={copyRoot.fields.utmMedium.placeholder}
              aria-invalid={Boolean(errors.utmMedium)}
              {...form.register('utmMedium')}
            />
          </FormField>

          <FormField
            id="campaign-identifier"
            label={copyRoot.fields.utmCampaign.label}
            helper={copyRoot.fields.utmCampaign.helper}
            error={errors.utmCampaign?.message}
          >
            <Input
              id="campaign-identifier"
              placeholder={copyRoot.fields.utmCampaign.placeholder}
              aria-invalid={Boolean(errors.utmCampaign)}
              {...form.register('utmCampaign')}
            />
          </FormField>

          <div className="space-y-2">
            <Label htmlFor="campaign-status">
              {copyRoot.fields.status.label}
            </Label>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="campaign-status"
                    className="w-full"
                    aria-invalid={Boolean(errors.status)}
                  >
                    <SelectValue
                      placeholder={copyRoot.fields.status.placeholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">
                      {copyRoot.status.active}
                    </SelectItem>
                    <SelectItem value="INACTIVE">
                      {copyRoot.status.inactive}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status ? (
              <p role="alert" className="text-destructive text-sm">
                {errors.status.message}
              </p>
            ) : null}
          </div>

          <FormField
            id="campaign-landing"
            label={copyRoot.fields.landingUrl.label}
            helper={copyRoot.fields.landingUrl.helper}
            error={errors.landingUrl?.message}
            className="md:col-span-2"
          >
            <Input
              id="campaign-landing"
              placeholder={copyRoot.fields.landingUrl.placeholder}
              aria-invalid={Boolean(errors.landingUrl)}
              {...form.register('landingUrl')}
            />
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Button asChild type="button" variant="outline">
            <Link href={ADMIN_CAMPAIGNS_PATH}>{copyRoot.actions.cancel}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? props.mode === 'create'
                ? copyRoot.mutations.submittingCreate
                : copyRoot.mutations.submittingUpdate
              : copy.submit}
          </Button>
        </div>
      </div>

      <aside className="border-primary/20 bg-primary/[0.04] rounded-2xl border p-5 lg:sticky lg:top-24">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
          <Link2 className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-semibold">
          {copyRoot.fields.trackingPreview.label}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {copyRoot.fields.trackingPreview.helper}
        </p>
        {previewHref ? (
          <div className="mt-4">
            <AdminCampaignLink
              href={previewHref}
              name={values.name || copyRoot.fields.name.label}
            />
          </div>
        ) : null}
      </aside>
    </form>
  )
}

function FormField({
  id,
  label,
  helper,
  error,
  className,
  children,
}: {
  id: string
  label: string
  helper: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      <p className="text-muted-foreground text-xs leading-5">{helper}</p>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
