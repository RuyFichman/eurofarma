'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { HeartHandshake, Trash2 } from 'lucide-react'

import {
  createWellbeingEntryAction,
  deleteWellbeingEntryAction,
} from '@/app/(public)/meu-agendamento/actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { NutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import type { WellbeingFeelingValue } from '@/lib/validators/nutriz-personal-area'
import { formatLongDate, formatTime } from '@/lib/utils/format-date'

const FEELINGS: WellbeingFeelingValue[] = ['GOOD', 'OK', 'TIRED']

export function WellbeingCard({
  entries,
}: {
  entries: NutrizPersonalAreaData['wellbeingEntries']
}) {
  const copy = NUTRIZ_AUTH.area.personal.wellbeing
  const router = useRouter()
  const [feeling, setFeeling] = useState<WellbeingFeelingValue | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    if (!feeling) return
    setError(null)
    setFeedback(null)
    startTransition(async () => {
      const result = await createWellbeingEntryAction({ feeling })
      if (!result.ok) {
        setError(copy.error)
        return
      }
      setFeeling(undefined)
      setFeedback(copy.savedFeedback)
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!window.confirm(copy.deleteConfirm)) return
    setError(null)
    setFeedback(null)
    startTransition(async () => {
      const result = await deleteWellbeingEntryAction(id)
      if (!result.ok) {
        setError(copy.error)
        return
      }
      setFeedback(copy.deletedFeedback)
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="bg-secondary text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <HeartHandshake className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{copy.title}</CardTitle>
              <span className="text-muted-foreground rounded-full border px-2 py-0.5 text-xs">
                {copy.optional}
              </span>
            </div>
            <CardDescription className="mt-1 leading-6">
              {copy.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={feeling}
          onValueChange={(value) => setFeeling(value as WellbeingFeelingValue)}
          className="grid gap-2 sm:grid-cols-3"
          aria-label={copy.title}
        >
          {FEELINGS.map((value) => {
            const id = `wellbeing-${value.toLowerCase()}`
            return (
              <div
                key={value}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <RadioGroupItem value={value} id={id} disabled={isPending} />
                <Label htmlFor={id} className="cursor-pointer font-normal">
                  {copy.choices[value]}
                </Label>
              </div>
            )
          })}
        </RadioGroup>
        <Button
          type="button"
          className="mt-4"
          disabled={!feeling || isPending}
          onClick={save}
        >
          {isPending ? copy.submitting : copy.saveAction}
        </Button>

        {error ? (
          <p role="alert" className="text-destructive mt-3 text-sm">
            {error}
          </p>
        ) : null}
        {feedback ? (
          <p role="status" className="text-primary mt-3 text-sm">
            {feedback}
          </p>
        ) : null}

        <div className="mt-6">
          <h3 className="text-sm font-semibold">{copy.latestTitle}</h3>
          {entries.length === 0 ? (
            <p className="text-muted-foreground mt-3 text-sm">{copy.empty}</p>
          ) : (
            <ul className="mt-3 divide-y rounded-xl border">
              {entries.map((entry) => {
                const date = new Date(entry.recordedAt)
                return (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {copy.choices[entry.feeling]}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {copy.recordedAt.replace(
                          '{date}',
                          `${formatLongDate(date)} ${copy.timeSeparator} ${formatTime(date)}`,
                        )}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={copy.deleteAction.replace(
                        '{date}',
                        formatLongDate(date),
                      )}
                      disabled={isPending}
                      onClick={() => remove(entry.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
