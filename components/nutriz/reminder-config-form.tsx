'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatLocalDate } from '@/lib/utils/local-date-time'

const COPY = NUTRIZ_AUTH.area.reminders

type ReminderOption = { value: string; label: string; helper: string }

type ActivateResult = {
  ok: boolean
  code?: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DATABASE_ERROR'
}

/**
 * Formulário genérico compartilhado pelos 3 lembretes. As 3 telas só diferem
 * em conteúdo (ícone, textos, opções e prévia já calculados no servidor) —
 * nenhuma delas precisa recalcular data no cliente: a prévia de cada opção já
 * vem pronta em `previewByOption`.
 */
export function ReminderConfigForm({
  icon: Icon,
  title,
  description,
  infoBox,
  dateField,
  questionLabel,
  options,
  defaultOption,
  checklistHint,
  previewByOption,
  disclaimer,
  backHref,
  onActivate,
}: {
  icon: LucideIcon
  title: string
  description: string
  infoBox?: React.ReactNode
  dateField?: { label: string; help: string; defaultValue: string }
  questionLabel: string
  options: ReminderOption[]
  defaultOption: string
  checklistHint?: string
  previewByOption: Record<string, string>
  disclaimer: string
  backHref: string
  onActivate: (values: {
    timingOption: string
    targetDate?: string
  }) => Promise<ActivateResult>
}) {
  const router = useRouter()
  const [timingOption, setTimingOption] = useState(defaultOption)
  const [targetDate, setTargetDate] = useState(dateField?.defaultValue ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await onActivate({
      timingOption,
      targetDate: dateField ? targetDate : undefined,
    })
    setIsSubmitting(false)
    if (!result.ok) {
      setError(COPY.error)
      return
    }
    router.push('/meu-agendamento')
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3">
          <span className="bg-secondary text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {description}
            </p>
          </div>
        </div>

        {infoBox ? <div className="mt-5">{infoBox}</div> : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {dateField ? (
            <div className="space-y-2">
              <Label htmlFor="reminder-target-date">{dateField.label}</Label>
              <Input
                id="reminder-target-date"
                type="date"
                value={targetDate}
                min={formatLocalDate(new Date())}
                onChange={(event) => setTargetDate(event.target.value)}
                aria-describedby="reminder-target-date-help"
                required
              />
              <p
                id="reminder-target-date-help"
                className="text-muted-foreground text-xs leading-5"
              >
                {dateField.help}
              </p>
            </div>
          ) : null}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{questionLabel}</legend>
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className={
                    option.value === timingOption
                      ? 'border-primary bg-secondary/40 flex cursor-pointer items-start gap-3 rounded-xl border p-3'
                      : 'border-border flex cursor-pointer items-start gap-3 rounded-xl border p-3'
                  }
                >
                  <input
                    type="radio"
                    name="timingOption"
                    value={option.value}
                    checked={option.value === timingOption}
                    onChange={() => setTimingOption(option.value)}
                    className="accent-primary mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      {option.label}
                    </span>
                    <span className="text-muted-foreground block text-xs leading-5">
                      {option.helper}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {checklistHint ? (
            <label className="text-muted-foreground flex items-start gap-2 text-xs leading-5">
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-primary mt-0.5"
                aria-readonly="true"
              />
              {checklistHint}
            </label>
          ) : null}

          <div className="bg-secondary/30 rounded-xl border p-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {COPY.previewLabel}
            </p>
            <p className="mt-2 text-sm leading-6">
              {previewByOption[timingOption]}
            </p>
          </div>

          <p className="text-muted-foreground text-xs leading-5">
            {disclaimer}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? COPY.submitting : COPY.activateAction}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={backHref}>{COPY.cancelAction}</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
