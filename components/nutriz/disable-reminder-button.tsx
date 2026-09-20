'use client'

import { useState, useTransition } from 'react'
import type { NutrizReminderType } from '@prisma/client'

import { disableReminderAction } from '@/app/(nutriz)/meu-agendamento/lembretes/actions'
import { Button } from '@/components/ui/button'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

const COPY = NUTRIZ_AUTH.area.reminders

/** Único pedaço interativo de uma linha ativa de "Meus lembretes". */
export function DisableReminderButton({ type }: { type: NutrizReminderType }) {
  const [isPending, startTransition] = useTransition()
  const [failed, setFailed] = useState(false)

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => {
          setFailed(false)
          startTransition(async () => {
            const result = await disableReminderAction(type)
            if (!result.ok) setFailed(true)
          })
        }}
      >
        {isPending ? COPY.submitting : COPY.disableAction}
      </Button>
      {failed ? (
        <p role="alert" className="text-destructive text-xs">
          {COPY.error}
        </p>
      ) : null}
    </div>
  )
}
