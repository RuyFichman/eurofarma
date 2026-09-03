'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  User,
} from 'lucide-react'

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

/** Campos do form para os quais aceitamos erro vindo da API (`error.fields`). */
const FORM_FIELD_KEYS = [
  'fullName',
  'email',
  'phoneWhatsapp',
  'state',
  'city',
  'password',
] as const satisfies ReadonlyArray<keyof SignupFormInput>

/** Lê os UTMs da URL atual (sem dado pessoal). Chaves vazias são omitidas. */
function getCurrentUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}
  for (const key of [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ]) {
    const value = params.get(key)?.trim()
    if (value) utm[key] = value
  }
  return utm
}

/** Extrai `error.fields` (mensagens por campo) de uma resposta de erro da API. */
function getErrorFields(data: unknown): Record<string, string> | null {
  if (!data || typeof data !== 'object' || !('error' in data)) return null
  const error = (data as { error?: unknown }).error
  if (!error || typeof error !== 'object' || !('fields' in error)) return null
  const fields = (error as { fields?: unknown }).fields
  if (!fields || typeof fields !== 'object' || Array.isArray(fields))
    return null

  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(
    fields as Record<string, unknown>,
  )) {
    if (typeof value === 'string') result[key] = value
  }
  return Object.keys(result).length > 0 ? result : null
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-destructive text-sm">
      {message}
    </p>
  )
}

export function SignupForm() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignupFormInput, unknown, SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneWhatsapp: '',
      state: '',
      city: '',
      password: '',
      passwordConfirm: '',
      lgpdConsent: false,
    },
  })

  async function onSubmit(values: SignupFormValues) {
    setSubmitError(null)
    try {
      const response = await fetch('/api/nutriz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `passwordConfirm` fica no cliente: é conferência de digitação, não
        // dado que o servidor precise receber.
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phoneWhatsapp: values.phoneWhatsapp,
          state: values.state,
          city: values.city,
          lgpdConsent: values.lgpdConsent,
          sourceUtm: getCurrentUtmParams(),
        }),
      })

      if (response.ok) {
        // Sucesso → página de agradecimento (mantém o botão travado durante a
        // navegação). A sessão já veio nos cookies da resposta.
        setIsRedirecting(true)
        router.push('/obrigada')
        return
      }

      if (response.status === 429) {
        setSubmitError(COPY.api.rateLimited)
        return
      }

      if (response.status === 409) {
        setSubmitError(COPY.api.accountExists)
        return
      }

      // Mapeia mensagens seguras por campo (se vierem) para o estado do form.
      const data: unknown = await response.json().catch(() => null)
      const fields = getErrorFields(data)
      if (fields) {
        for (const key of FORM_FIELD_KEYS) {
          const message = fields[key]
          if (message) form.setError(key, { message })
        }
      }
      setSubmitError(COPY.api.errorDescription)
    } catch {
      // Falha de rede — nunca loga o payload/PII no console.
      setSubmitError(COPY.api.errorDescription)
    }
  }

  const errors = form.formState.errors
  const isBusy = form.formState.isSubmitting || isRedirecting

  return (
    <div>
      <div className="border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {COPY.heading}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
          {COPY.subtitle}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 space-y-5"
        noValidate
        aria-label={COPY.ariaLabels.form}
      >
        {/* Nome completo */}
        <div className="space-y-2">
          <Label htmlFor="signup-name">{COPY.fields.fullName.label}</Label>
          <div className="relative">
            <User
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="signup-name"
              className="bg-background h-11 rounded-xl pr-4 pl-11"
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

        {/* E-mail — vira o login da conta (Sprint 6.2) */}
        <div className="space-y-2">
          <Label htmlFor="signup-email">{COPY.fields.email.label}</Label>
          <div className="relative">
            <Mail
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="signup-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="bg-background h-11 rounded-xl pr-4 pl-11"
              placeholder={COPY.fields.email.placeholder}
              aria-invalid={Boolean(errors.email)}
              aria-describedby="signup-email-helper signup-email-error"
              {...form.register('email')}
            />
          </div>
          <p id="signup-email-helper" className="text-muted-foreground text-xs">
            {COPY.fields.email.helper}
          </p>
          <FieldError id="signup-email-error" message={errors.email?.message} />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="signup-whatsapp">{COPY.fields.whatsapp.label}</Label>
          <div className="relative">
            <MessageCircle
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="signup-whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="bg-background h-11 rounded-xl pr-4 pl-11"
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
                    className="bg-background w-full rounded-xl data-[size=default]:h-11"
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
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="signup-city"
                className="bg-background h-11 rounded-xl pr-4 pl-11"
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

        {/* Senha + confirmação. O botão de mostrar/ocultar alterna os dois
            campos de uma vez: conferir a digitação num só não ajudaria. */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="signup-password">
              {COPY.fields.password.label}
            </Label>
            <div className="relative">
              <Lock
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="bg-background h-11 rounded-xl pr-12 pl-11"
                placeholder={COPY.fields.password.placeholder}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'signup-password-error' : undefined
                }
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1"
                aria-label={
                  showPassword
                    ? COPY.actions.hidePassword
                    : COPY.actions.showPassword
                }
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <FieldError
              id="signup-password-error"
              message={errors.password?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password-confirm">
              {COPY.fields.passwordConfirm.label}
            </Label>
            <div className="relative">
              <Lock
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                id="signup-password-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="bg-background h-11 rounded-xl pr-4 pl-11"
                placeholder={COPY.fields.passwordConfirm.placeholder}
                aria-invalid={Boolean(errors.passwordConfirm)}
                aria-describedby={
                  errors.passwordConfirm
                    ? 'signup-password-confirm-error'
                    : undefined
                }
                {...form.register('passwordConfirm')}
              />
            </div>
            <FieldError
              id="signup-password-confirm-error"
              message={errors.passwordConfirm?.message}
            />
          </div>
        </div>

        {/* Consentimento LGPD (não pré-marcado) */}
        <div className="bg-muted/40 space-y-2 rounded-xl border p-4">
          <div className="flex items-start gap-3.5">
            <Controller
              control={form.control}
              name="lgpdConsent"
              render={({ field }) => (
                <Checkbox
                  id="signup-consent"
                  className="mt-0.5 size-5 rounded-md"
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
              className="text-muted-foreground text-sm leading-relaxed font-normal"
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

        {submitError ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm"
          >
            {submitError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl px-6 shadow-sm"
          disabled={isBusy}
        >
          {isBusy ? COPY.actions.submitting : COPY.actions.submit}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
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
        className="border-whatsapp/30 text-whatsapp hover:bg-whatsapp/5 hover:text-whatsapp h-12 w-full rounded-xl px-6"
      >
        <Link href="/buscar">
          <MessageCircle aria-hidden="true" />
          {COPY.actions.whatsappCta}
        </Link>
      </Button>

      <p className="text-muted-foreground mx-auto mt-6 max-w-md text-center text-xs leading-relaxed">
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
