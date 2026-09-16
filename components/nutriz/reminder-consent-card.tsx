'use client'

import { useState, useTransition } from 'react'
import { Bell, BellOff } from 'lucide-react'

import { setReminderConsentAction } from '@/app/(public)/meu-agendamento/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

export function ReminderConsentCard({ enabled }: { enabled: boolean }) {
  const copy = NUTRIZ_AUTH.area.reminders
  const [current, setCurrent] = useState(enabled)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updatePreference(next: boolean) {
    setFeedback(null)
    setError(null)
    startTransition(async () => {
      const result = await setReminderConsentAction(next)
      if (!result.ok) {
        setError(copy.error)
        return
      }

      setCurrent(result.enabled)
      setFeedback(result.enabled ? copy.enabledFeedback : copy.disabledFeedback)
    })
  }

  const Icon = current ? Bell : BellOff

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="bg-secondary text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {current ? copy.enabledLabel : copy.disabledLabel}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-7">{copy.description}</p>
        <p className="text-muted-foreground mt-3 text-xs leading-5">
          {copy.safetyNotice}
        </p>

        {feedback ? (
          <p role="status" className="text-primary mt-4 text-sm">
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-destructive mt-4 text-sm">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          variant={current ? 'outline' : 'default'}
          className="mt-5"
          disabled={isPending}
          onClick={() => updatePreference(!current)}
        >
          {isPending
            ? copy.submitting
            : current
              ? copy.disableAction
              : copy.enableAction}
        </Button>
      </CardContent>
    </Card>
  )
}
