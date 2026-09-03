'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  nutrizNewPasswordSchema,
  type NutrizNewPasswordInput,
} from '@/lib/validators/nutriz-auth'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { updateNutrizPasswordAction } from './actions'

const COPY = NUTRIZ_AUTH.newPassword

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-destructive text-sm">
      {message}
    </p>
  )
}

export function NewPasswordForm() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<NutrizNewPasswordInput>({
    resolver: zodResolver(nutrizNewPasswordSchema),
    defaultValues: { password: '', passwordConfirm: '' },
  })

  async function onSubmit(values: NutrizNewPasswordInput) {
    setError(null)
    const result = await updateNutrizPasswordAction(values)

    if (result.ok) {
      // A sessão do link continua válida, então ela já entra direto.
      setIsRedirecting(true)
      router.push('/meu-agendamento')
      router.refresh()
      return
    }

    if (result.fields) {
      for (const key of ['password', 'passwordConfirm'] as const) {
        const message = result.fields[key]
        if (message) form.setError(key, { message })
      }
    }
    setError(result.message)
  }

  const errors = form.formState.errors
  const isBusy = form.formState.isSubmitting || isRedirecting

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mt-6 space-y-5"
      noValidate
      aria-label={COPY.ariaLabels.form}
    >
      <div className="space-y-2">
        <Label htmlFor="new-password">{COPY.fields.password.label}</Label>
        <div className="relative">
          <Lock
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className="bg-background h-11 rounded-xl pr-4 pl-11"
            placeholder={COPY.fields.password.placeholder}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'new-password-error' : undefined
            }
            {...form.register('password')}
          />
        </div>
        <FieldError
          id="new-password-error"
          message={errors.password?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password-confirm">
          {COPY.fields.passwordConfirm.label}
        </Label>
        <div className="relative">
          <Lock
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="new-password-confirm"
            type="password"
            autoComplete="new-password"
            className="bg-background h-11 rounded-xl pr-4 pl-11"
            placeholder={COPY.fields.passwordConfirm.placeholder}
            aria-invalid={Boolean(errors.passwordConfirm)}
            aria-describedby={
              errors.passwordConfirm ? 'new-password-confirm-error' : undefined
            }
            {...form.register('passwordConfirm')}
          />
        </div>
        <FieldError
          id="new-password-confirm-error"
          message={errors.passwordConfirm?.message}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm"
        >
          {error}
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
  )
}
