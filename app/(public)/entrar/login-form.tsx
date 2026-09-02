'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  nutrizLoginSchema,
  type NutrizLoginInput,
} from '@/lib/validators/nutriz-auth'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { loginNutrizAction, requestNutrizPasswordResetAction } from './actions'

const COPY = NUTRIZ_AUTH.login

type Feedback = { tone: 'error' | 'info'; message: string }

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-destructive text-sm">
      {message}
    </p>
  )
}

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const form = useForm<NutrizLoginInput>({
    resolver: zodResolver(nutrizLoginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: NutrizLoginInput) {
    setFeedback(null)
    const result = await loginNutrizAction(values)

    if (result.ok) {
      setIsRedirecting(true)
      router.push('/meu-agendamento')
      // Server Component com dado de sessão: sem refresh o cabeçalho ficaria
      // com o estado anterior em cache.
      router.refresh()
      return
    }

    if (result.fields) {
      for (const key of ['email', 'password'] as const) {
        const message = result.fields[key]
        if (message) form.setError(key, { message })
      }
    }
    setFeedback({ tone: 'error', message: result.message })
  }

  /**
   * Recuperação a partir do e-mail já digitado no formulário — sem abrir outra
   * tela. Valida só esse campo; a senha não importa aqui.
   */
  async function onForgotPassword() {
    setFeedback(null)
    const email = form.getValues('email')
    setIsSendingReset(true)
    try {
      const result = await requestNutrizPasswordResetAction({ email })
      setFeedback({
        tone: result.ok ? 'info' : 'error',
        message: result.message,
      })
      if (!result.ok && result.fields?.email) {
        form.setError('email', { message: result.fields.email })
      }
    } finally {
      setIsSendingReset(false)
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
        <div className="space-y-2">
          <Label htmlFor="login-email">{COPY.fields.email.label}</Label>
          <div className="relative">
            <Mail
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="bg-background h-11 rounded-xl pr-4 pl-11"
              placeholder={COPY.fields.email.placeholder}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              {...form.register('email')}
            />
          </div>
          <FieldError id="login-email-error" message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">{COPY.fields.password.label}</Label>
          <div className="relative">
            <Lock
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="bg-background h-11 rounded-xl pr-12 pl-11"
              placeholder={COPY.fields.password.placeholder}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
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
            id="login-password-error"
            message={errors.password?.message}
          />
        </div>

        {feedback ? (
          <p
            role="alert"
            className={
              feedback.tone === 'error'
                ? 'border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm'
                : 'bg-secondary/50 text-foreground rounded-xl border px-4 py-3 text-sm'
            }
          >
            {feedback.message}
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

        <button
          type="button"
          onClick={onForgotPassword}
          disabled={isSendingReset}
          className="text-primary mx-auto block text-sm underline underline-offset-4 disabled:opacity-60"
        >
          {isSendingReset
            ? COPY.actions.sendingReset
            : COPY.actions.forgotPassword}
        </button>
      </form>

      <p className="text-muted-foreground mt-8 text-center text-sm">
        {COPY.actions.signupLead}{' '}
        <Link href="/cadastro" className="text-primary underline">
          {COPY.actions.signupLink}
        </Link>
      </p>
    </div>
  )
}
