'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck, MapPin, MessageCircle, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BRAZILIAN_STATES } from '@/lib/constants/brazilian-states'
import {
  signupFormSchema,
  type SignupFormInput,
  type SignupFormValues,
} from '@/lib/validators/signup-form'
import { SIGNUP } from '@/lib/i18n/pt-br'

const COPY = SIGNUP

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-destructive text-sm">
      {message}
    </p>
  )
}

export function SignupForm() {
  const [submittedName, setSubmittedName] = useState<string | null>(null)

  const form = useForm<SignupFormInput, unknown, SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      fullName: '',
      phoneWhatsapp: '',
      state: '',
      city: '',
      lgpdConsent: false,
    },
  })

  function onSubmit(values: SignupFormValues) {
    // TODO(Sprint 4.2): enviar para `POST /api/nutriz` (revalidando com
    // `nutrizSignupSchema`) e redirecionar para `/obrigada`. A persistência
    // depende de habilitar o RLS antes (pendência de segurança no CLAUDE.md);
    // por isso a 4.1 só valida no cliente e mostra o estado de sucesso.
    setSubmittedName(values.fullName.split(' ')[0] ?? values.fullName)
  }

  if (submittedName) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="bg-secondary text-primary flex size-14 items-center justify-center rounded-2xl">
          <CircleCheck className="size-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold">{COPY.success.title}</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          {COPY.success.body.replace('{name}', submittedName)}
        </p>
        <div className="mt-2 flex w-full flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/buscar">{COPY.success.cta}</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              form.reset()
              setSubmittedName(null)
            }}
          >
            {COPY.success.again}
          </Button>
        </div>
      </div>
    )
  }

  const errors = form.formState.errors

  return (
    <div>
      <h1 className="text-2xl font-semibold md:text-3xl">{COPY.heading}</h1>
      <p className="text-muted-foreground mt-2 text-sm">{COPY.subtitle}</p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8 space-y-5"
        noValidate
        aria-label={COPY.ariaLabels.form}
      >
        {/* Nome completo */}
        <div className="space-y-2">
          <Label htmlFor="signup-name">{COPY.fields.fullName.label}</Label>
          <div className="relative">
            <User
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="signup-name"
              className="pl-9"
              autoComplete="name"
              placeholder={COPY.fields.fullName.placeholder}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={
                errors.fullName ? 'signup-name-error' : undefined
              }
              {...form.register('fullName')}
            />
          </div>
          <FieldError
            id="signup-name-error"
            message={errors.fullName?.message}
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="signup-whatsapp">{COPY.fields.whatsapp.label}</Label>
          <div className="relative">
            <MessageCircle
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="signup-whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="pl-9"
              placeholder={COPY.fields.whatsapp.placeholder}
              aria-invalid={Boolean(errors.phoneWhatsapp)}
              aria-describedby="signup-whatsapp-helper signup-whatsapp-error"
              {...form.register('phoneWhatsapp')}
            />
          </div>
          <p
            id="signup-whatsapp-helper"
            className="text-muted-foreground text-xs"
          >
            {COPY.fields.whatsapp.helper}
          </p>
          <FieldError
            id="signup-whatsapp-error"
            message={errors.phoneWhatsapp?.message}
          />
        </div>

        {/* Estado + Cidade */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="signup-state">{COPY.fields.state.label}</Label>
            <Controller
              control={form.control}
              name="state"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="signup-state"
                    className="w-full"
                    aria-invalid={Boolean(errors.state)}
                    aria-describedby={
                      errors.state ? 'signup-state-error' : undefined
                    }
                  >
                    <SelectValue placeholder={COPY.fields.state.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.uf} value={state.uf}>
                        {state.uf} — {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError
              id="signup-state-error"
              message={errors.state?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-city">{COPY.fields.city.label}</Label>
            <div className="relative">
              <MapPin
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="signup-city"
                className="pl-9"
                autoComplete="address-level2"
                placeholder={COPY.fields.city.placeholder}
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? 'signup-city-error' : undefined}
                {...form.register('city')}
              />
            </div>
            <FieldError id="signup-city-error" message={errors.city?.message} />
          </div>
        </div>

        {/* Consentimento LGPD (não pré-marcado) */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Controller
              control={form.control}
              name="lgpdConsent"
              render={({ field }) => (
                <Checkbox
                  id="signup-consent"
                  className="mt-0.5"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  aria-invalid={Boolean(errors.lgpdConsent)}
                  aria-describedby={
                    errors.lgpdConsent ? 'signup-consent-error' : undefined
                  }
                />
              )}
            />
            <Label
              htmlFor="signup-consent"
              className="text-muted-foreground text-sm leading-snug font-normal"
            >
              {COPY.fields.consent.lead}{' '}
              <Link href="/privacidade" className="text-primary underline">
                {COPY.fields.consent.privacy}
              </Link>{' '}
              {COPY.fields.consent.middle}{' '}
              <Link href="/termos" className="text-primary underline">
                {COPY.fields.consent.terms}
              </Link>{' '}
              {COPY.fields.consent.tail}
            </Label>
          </div>
          <FieldError
            id="signup-consent-error"
            message={errors.lgpdConsent?.message}
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          {form.formState.isSubmitting
            ? COPY.actions.submitting
            : COPY.actions.submit}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">
          {COPY.actions.orContinue}
        </span>
        <span className="bg-border h-px flex-1" />
      </div>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="border-whatsapp/30 text-whatsapp hover:bg-whatsapp/5 hover:text-whatsapp w-full"
      >
        <Link href="/buscar">
          <MessageCircle aria-hidden="true" />
          {COPY.actions.whatsappCta}
        </Link>
      </Button>

      <p className="text-muted-foreground mt-6 text-center text-xs leading-relaxed">
        {COPY.legal.lead}{' '}
        <Link href="/termos" className="text-primary underline">
          {COPY.legal.terms}
        </Link>{' '}
        {COPY.legal.middle}{' '}
        <Link href="/privacidade" className="text-primary underline">
          {COPY.legal.privacy}
        </Link>{' '}
        {COPY.legal.tail}
      </p>
    </div>
  )
}
