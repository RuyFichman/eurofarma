'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { AdminUnitFormSection } from '@/components/admin/units/admin-unit-form-section'
import {
  AdminUnitSelectField,
  AdminUnitTextField,
  AdminUnitTextareaField,
} from '@/components/admin/units/admin-unit-form-fields'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ADMIN_UNITS_PATH } from '@/lib/admin/units/filters'
import {
  ADMIN_UNIT_STATUS_OPTIONS,
  ADMIN_UNIT_TYPE_OPTIONS,
} from '@/lib/admin/units/unit-form-options'
import {
  adminUnitFormSchema,
  type AdminUnitFormInput,
  type AdminUnitFormValues,
} from '@/lib/admin/units/unit-form-schema'
import { BRAZILIAN_STATES } from '@/lib/constants/brazilian-states'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.units.form

/** UFs no formato que o `Select` consome: `SP — São Paulo`. */
const STATE_OPTIONS = BRAZILIAN_STATES.map((state) => ({
  value: state.uf,
  label: `${state.uf} — ${state.name}`,
}))

/**
 * Formulário administrativo de unidade (Sprint 5.7) — um só componente para
 * cadastro e edição.
 *
 * A união discriminada abaixo é o que garante, em tempo de compilação, que o
 * modo de edição sempre carrega o registro que está sendo editado: não dá para
 * renderizar `mode="edit"` sem `unitId`.
 */
export type AdminUnitFormProps =
  | {
      mode: 'create'
      initialValues: AdminUnitFormInput
    }
  | {
      mode: 'edit'
      unitId: string
      slug: string
      /** Só existe quando a unidade está ACTIVE — ver `notFound()` da 3.6. */
      publicHref: string | null
      initialValues: AdminUnitFormInput
    }

export function AdminUnitForm(props: AdminUnitFormProps) {
  const { mode, initialValues } = props
  const modeCopy = mode === 'create' ? COPY.create : COPY.edit

  const [showValidatedNotice, setShowValidatedNotice] = useState(false)

  const form = useForm<AdminUnitFormInput, unknown, AdminUnitFormValues>({
    resolver: zodResolver(adminUnitFormSchema),
    defaultValues: initialValues,
  })

  const { errors, isSubmitting } = form.formState

  // O aviso de "validado" descreve um retrato do formulário; qualquer edição
  // posterior o torna obsoleto, então ele some assim que algo muda.
  useEffect(() => {
    const subscription = form.watch(() => setShowValidatedNotice(false))
    return () => subscription.unsubscribe()
  }, [form])

  // TODO(LCT-5.8): trocar este submit de validação por Server Actions
  // autenticadas (`createAdminUnitAction`/`updateAdminUnitAction`), com
  // `requireAdminUser()`, normalização, slug e `revalidatePath`.
  // Os valores validados não são lidos aqui de propósito: enquanto não há
  // persistência, nada justifica trafegar ou registrar dados da unidade.
  function handleValidSubmit() {
    setShowValidatedNotice(true)
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleValidSubmit)}
      className="space-y-6"
      noValidate
      aria-label={modeCopy.title}
    >
      <AdminUnitFormSection
        title={COPY.sections.basic.title}
        description={COPY.sections.basic.description}
      >
        <AdminUnitTextField
          id="unit-name"
          label={COPY.fields.name.label}
          placeholder={COPY.fields.name.placeholder}
          autoComplete="organization"
          error={errors.name?.message}
          registration={form.register('name')}
          wide
        />
        <AdminUnitSelectField
          id="unit-type"
          label={COPY.fields.type.label}
          placeholder={COPY.fields.type.placeholder}
          control={form.control}
          name="type"
          options={ADMIN_UNIT_TYPE_OPTIONS}
          error={errors.type?.message}
        />
      </AdminUnitFormSection>

      <AdminUnitFormSection
        title={COPY.sections.location.title}
        description={COPY.sections.location.description}
      >
        <AdminUnitTextField
          id="unit-street"
          label={COPY.fields.street.label}
          placeholder={COPY.fields.street.placeholder}
          autoComplete="address-line1"
          error={errors.addressStreet?.message}
          registration={form.register('addressStreet')}
          wide
        />
        <AdminUnitTextField
          id="unit-number"
          label={COPY.fields.number.label}
          placeholder={COPY.fields.number.placeholder}
          error={errors.addressNumber?.message}
          registration={form.register('addressNumber')}
          optional
        />
        <AdminUnitTextField
          id="unit-complement"
          label={COPY.fields.complement.label}
          placeholder={COPY.fields.complement.placeholder}
          autoComplete="address-line2"
          error={errors.addressComplement?.message}
          registration={form.register('addressComplement')}
          optional
        />
        <AdminUnitTextField
          id="unit-neighborhood"
          label={COPY.fields.neighborhood.label}
          placeholder={COPY.fields.neighborhood.placeholder}
          error={errors.addressNeighborhood?.message}
          registration={form.register('addressNeighborhood')}
        />
        <AdminUnitTextField
          id="unit-city"
          label={COPY.fields.city.label}
          placeholder={COPY.fields.city.placeholder}
          autoComplete="address-level2"
          error={errors.addressCity?.message}
          registration={form.register('addressCity')}
        />
        <AdminUnitSelectField
          id="unit-state"
          label={COPY.fields.state.label}
          placeholder={COPY.fields.state.placeholder}
          control={form.control}
          name="addressState"
          options={STATE_OPTIONS}
          error={errors.addressState?.message}
        />
        <AdminUnitTextField
          id="unit-zip"
          label={COPY.fields.zip.label}
          placeholder={COPY.fields.zip.placeholder}
          inputMode="numeric"
          autoComplete="postal-code"
          error={errors.addressZip?.message}
          registration={form.register('addressZip')}
          optional
        />
      </AdminUnitFormSection>

      <AdminUnitFormSection
        title={COPY.sections.contact.title}
        description={COPY.sections.contact.description}
      >
        <AdminUnitTextField
          id="unit-phone"
          label={COPY.fields.phone.label}
          placeholder={COPY.fields.phone.placeholder}
          helper={COPY.fields.phone.helper}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          registration={form.register('phone')}
          optional
        />
        <AdminUnitTextField
          id="unit-whatsapp"
          label={COPY.fields.whatsapp.label}
          placeholder={COPY.fields.whatsapp.placeholder}
          helper={COPY.fields.whatsapp.helper}
          type="tel"
          inputMode="tel"
          error={errors.whatsapp?.message}
          registration={form.register('whatsapp')}
          optional
        />
        <AdminUnitTextField
          id="unit-email"
          label={COPY.fields.email.label}
          placeholder={COPY.fields.email.placeholder}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          registration={form.register('email')}
          optional
          wide
        />
      </AdminUnitFormSection>

      <AdminUnitFormSection
        title={COPY.sections.service.title}
        description={COPY.sections.service.description}
      >
        <AdminUnitTextareaField
          id="unit-opening-hours"
          label={COPY.fields.openingHours.label}
          placeholder={COPY.fields.openingHours.placeholder}
          error={errors.openingHours?.message}
          registration={form.register('openingHours')}
          rows={2}
          optional
        />
        <AdminUnitTextareaField
          id="unit-instructions"
          label={COPY.fields.instructions.label}
          placeholder={COPY.fields.instructions.placeholder}
          error={errors.instructions?.message}
          registration={form.register('instructions')}
          rows={4}
          optional
        />
        <AdminUnitTextareaField
          id="unit-whatsapp-message"
          label={COPY.fields.whatsappMessage.label}
          placeholder={COPY.fields.whatsappMessage.placeholder}
          helper={COPY.fields.whatsappMessage.helper}
          error={errors.whatsappMessage?.message}
          registration={form.register('whatsappMessage')}
          rows={3}
          optional
        />
      </AdminUnitFormSection>

      <AdminUnitFormSection
        title={COPY.sections.coordinates.title}
        description={COPY.sections.coordinates.description}
      >
        <AdminUnitTextField
          id="unit-latitude"
          label={COPY.fields.latitude.label}
          placeholder={COPY.fields.latitude.placeholder}
          inputMode="decimal"
          error={errors.latitude?.message}
          registration={form.register('latitude')}
          optional
        />
        <AdminUnitTextField
          id="unit-longitude"
          label={COPY.fields.longitude.label}
          placeholder={COPY.fields.longitude.placeholder}
          inputMode="decimal"
          error={errors.longitude?.message}
          registration={form.register('longitude')}
          optional
        />
      </AdminUnitFormSection>

      <AdminUnitFormSection
        title={COPY.sections.publication.title}
        description={COPY.sections.publication.description}
      >
        <AdminUnitSelectField
          id="unit-status"
          label={COPY.fields.status.label}
          placeholder={COPY.fields.status.placeholder}
          helper={COPY.statusHelper}
          control={form.control}
          name="status"
          options={ADMIN_UNIT_STATUS_OPTIONS}
          error={errors.status?.message}
        />

        {mode === 'edit' ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">{COPY.slug.label}</p>
            <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 font-mono text-sm break-all">
              /banco-de-leite/{props.slug}
            </p>
            <p className="text-muted-foreground text-xs">{COPY.slug.helper}</p>
            {/* Só há página pública quando a unidade está ativa: a rota da 3.6
                chama `notFound()` para PENDING/INACTIVE. */}
            {props.publicHref ? (
              <a
                href={props.publicHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={COPY.actions.publicPageAria}
                className="text-primary text-sm underline underline-offset-4"
              >
                {COPY.actions.publicPage}
              </a>
            ) : null}
          </div>
        ) : null}
      </AdminUnitFormSection>

      {showValidatedNotice ? (
        <Alert role="status">
          <AlertTitle>{COPY.validationOnly.title}</AlertTitle>
          <AlertDescription>{COPY.validationOnly.description}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild className="sm:w-auto">
          <Link href={ADMIN_UNITS_PATH}>{COPY.actions.cancel}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
          {modeCopy.submit}
        </Button>
      </div>
    </form>
  )
}
