'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  adminLoginSchema,
  adminPasswordResetSchema,
  type AdminLoginInput,
} from '@/lib/validators/admin-auth'
import {
  loginAdminAction,
  requestAdminPasswordResetAction,
} from '@/app/admin/login/actions'
import { ADMIN_LOGIN } from '@/lib/i18n/pt-br'

const FORM = ADMIN_LOGIN.form

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isResetPending, startResetTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  })

  const errors = form.formState.errors
  const isBusy = isPending || isResetPending

  function onSubmit(values: AdminLoginInput) {
    setFormError(null)
    setResetMessage(null)
    startTransition(async () => {
      const result = await loginAdminAction(values)
      if (result.ok) {
        router.push('/admin/dashboard')
        router.refresh()
        return
      }
      if (result.fields) {
        for (const key of ['email', 'password'] as const) {
          const message = result.fields[key]
          if (message) form.setError(key, { message })
        }
      }
      setFormError(result.message)
    })
  }

  function handleForgotPassword() {
    setFormError(null)
    setResetMessage(null)
    const parsed = adminPasswordResetSchema.safeParse({
      email: form.getValues('email'),
    })
    if (!parsed.success) {
      form.setError('email', { message: FORM.validation.emailInvalid })
      setFormError(FORM.feedback.resetNeedsEmail)
      return
    }
    startResetTransition(async () => {
      const result = await requestAdminPasswordResetAction({
        email: parsed.data.email,
      })
      if (result.ok) {
        setResetMessage(result.message)
      } else {
        setFormError(result.message)
      }
    })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      {resetMessage ? (
        <Alert variant="success">
          <AlertDescription>{resetMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="admin-email">{FORM.fields.email.label}</Label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="email"
          placeholder={FORM.fields.email.placeholder}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'admin-email-error' : undefined}
          {...form.register('email')}
        />
        {errors.email ? (
          <p
            id="admin-email-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="admin-password">{FORM.fields.password.label}</Label>
          <Button
            type="button"
            variant="link"
            className="text-muted-foreground hover:text-primary h-auto p-0 text-sm font-normal"
            onClick={handleForgotPassword}
            disabled={isBusy}
          >
            {isResetPending
              ? FORM.actions.sendingReset
              : FORM.actions.forgotPassword}
          </Button>
        </div>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={FORM.fields.password.placeholder}
            className="pr-10"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'admin-password-error' : undefined
            }
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword
                ? FORM.actions.hidePassword
                : FORM.actions.showPassword
            }
            aria-pressed={showPassword}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 focus-visible:ring-2 focus-visible:outline-none"
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p
            id="admin-password-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isBusy}>
        {isPending ? FORM.actions.submitting : FORM.actions.submit}
      </Button>
    </form>
  )
}
