'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { AlertCircle, MapPin } from 'lucide-react'

import {
  createAdminMunicipalityAction,
  updateAdminMunicipalityAction,
} from '@/app/admin/(painel)/municipios/actions'
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
import { ADMIN_MUNICIPALITIES_PATH } from '@/lib/admin/municipalities/filters'
import {
  adminMunicipalityFormSchema,
  type AdminMunicipalityFormInput,
  type AdminMunicipalityFormValues,
} from '@/lib/admin/municipalities/municipality-form-schema'
import { SERVICE_REGION_VALUES } from '@/lib/constants/service-municipalities'
import { ADMIN, COVERAGE } from '@/lib/i18n/pt-br'

type AdminMunicipalityFormProps =
  | { mode: 'create'; initialValues: AdminMunicipalityFormInput }
  | {
      mode: 'edit'
      municipalityId: string
      initialValues: AdminMunicipalityFormInput
    }

export function AdminMunicipalityForm(props: AdminMunicipalityFormProps) {
  const copy = ADMIN.municipalities.form[props.mode]
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<
    AdminMunicipalityFormInput,
    unknown,
    AdminMunicipalityFormValues
  >({
    resolver: zodResolver(adminMunicipalityFormSchema),
    defaultValues: props.initialValues,
  })

  async function onSubmit(values: AdminMunicipalityFormValues) {
    setSubmitError(null)
    const result =
      props.mode === 'create'
        ? await createAdminMunicipalityAction(values)
        : await updateAdminMunicipalityAction(props.municipalityId, values)

    if (result.fields) {
      for (const [field, message] of Object.entries(result.fields)) {
        if (field === 'name' || field === 'region' || field === 'status') {
          form.setError(field, { message })
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
      className="bg-card max-w-3xl space-y-8 rounded-2xl border p-6 shadow-sm md:p-8"
      noValidate
    >
      {submitError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>
            {ADMIN.municipalities.form.mutations.errorTitle}
          </AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="municipality-name">
            {ADMIN.municipalities.form.fields.name.label}
          </Label>
          <Input
            id="municipality-name"
            className="h-11"
            placeholder={ADMIN.municipalities.form.fields.name.placeholder}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name ? 'municipality-name-error' : undefined
            }
            {...form.register('name')}
          />
          {errors.name ? (
            <p
              id="municipality-name-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="municipality-region">
            {ADMIN.municipalities.form.fields.region.label}
          </Label>
          <Controller
            name="region"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="municipality-region"
                  className="w-full"
                  aria-invalid={Boolean(errors.region)}
                >
                  <SelectValue
                    placeholder={
                      ADMIN.municipalities.form.fields.region.placeholder
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_REGION_VALUES.map((region) => (
                    <SelectItem key={region} value={region}>
                      {COVERAGE.regions[region]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.region ? (
            <p role="alert" className="text-destructive text-sm">
              {errors.region.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="municipality-status">
            {ADMIN.municipalities.form.fields.status.label}
          </Label>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="municipality-status" className="w-full">
                  <SelectValue
                    placeholder={
                      ADMIN.municipalities.form.fields.status.placeholder
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    {ADMIN.municipalities.form.status.active}
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    {ADMIN.municipalities.form.status.inactive}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="bg-muted/40 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-xs">
            {ADMIN.municipalities.form.fields.state.label}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium">
            <MapPin className="text-primary size-4" aria-hidden="true" />
            {ADMIN.municipalities.form.fields.state.value}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">
            {ADMIN.municipalities.form.fields.country.label}
          </p>
          <p className="mt-1 text-sm font-medium">
            {ADMIN.municipalities.form.fields.country.value}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="outline">
          <Link href={ADMIN_MUNICIPALITIES_PATH}>
            {ADMIN.municipalities.form.actions.cancel}
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? props.mode === 'create'
              ? ADMIN.municipalities.form.mutations.submittingCreate
              : ADMIN.municipalities.form.mutations.submittingUpdate
            : copy.submit}
        </Button>
      </div>
    </form>
  )
}
