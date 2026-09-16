'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState, useTransition } from 'react'
import { CircleAlert, Droplets, Trash2 } from 'lucide-react'

import {
  createExtractionLogAction,
  deleteExtractionLogAction,
} from '@/app/(public)/meu-agendamento/actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { NutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { shouldShowExtractionContactSuggestion } from '@/lib/nutriz/extraction-guidance'
import { formatLongDate, formatTime } from '@/lib/utils/format-date'
import { formatCount } from '@/lib/utils/format-number'

export function PersonalExtractionCard({
  data,
  defaultRecordedAt,
}: {
  data: Pick<
    NutrizPersonalAreaData,
    'extractionLogs' | 'extractionTotalMl' | 'extractionCount'
  >
  defaultRecordedAt: string
}) {
  const copy = NUTRIZ_AUTH.area.personal.extraction
  const router = useRouter()
  const [recordedAt, setRecordedAt] = useState(defaultRecordedAt)
  const [volumeMl, setVolumeMl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFeedback(null)
    startTransition(async () => {
      const result = await createExtractionLogAction({ recordedAt, volumeMl })
      if (!result.ok) {
        setError(
          result.fields?.recordedAt ?? result.fields?.volumeMl ?? copy.error,
        )
        return
      }
      setVolumeMl('')
      setFeedback(copy.addedFeedback)
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!window.confirm(copy.deleteConfirm)) return
    setError(null)
    setFeedback(null)
    startTransition(async () => {
      const result = await deleteExtractionLogAction(id)
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
            <Droplets className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription className="mt-1 leading-6">
              {copy.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={submit}
          className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end"
        >
          <div className="space-y-2">
            <Label htmlFor="extraction-recorded-at">{copy.dateLabel}</Label>
            <Input
              id="extraction-recorded-at"
              type="datetime-local"
              value={recordedAt}
              onChange={(event) => setRecordedAt(event.target.value)}
              aria-label={copy.datePlaceholder}
              disabled={isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extraction-volume">{copy.volumeLabel}</Label>
            <Input
              id="extraction-volume"
              type="number"
              inputMode="numeric"
              min="1"
              max="5000"
              step="1"
              value={volumeMl}
              onChange={(event) => setVolumeMl(event.target.value)}
              placeholder={copy.volumePlaceholder}
              disabled={isPending}
              required
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? copy.submitting : copy.addAction}
          </Button>
        </form>

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

        <div className="bg-muted/50 mt-6 grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs">{copy.total}</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCount(data.extractionTotalMl)} {copy.volumeUnit}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              {copy.sessions.replace(
                '{count}',
                formatCount(data.extractionCount),
              )}
            </p>
            <p className="mt-1 text-xl font-semibold">
              {formatCount(data.extractionCount)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold">{copy.historyTitle}</h3>
          {data.extractionLogs.length === 0 ? (
            <p className="text-muted-foreground mt-3 text-sm">{copy.empty}</p>
          ) : (
            <ul className="mt-3 divide-y rounded-xl border">
              {data.extractionLogs.map((entry) => {
                const date = new Date(entry.recordedAt)
                return (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatLongDate(date)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {`${formatTime(date)} ${copy.separator} ${entry.volumeMl} ${copy.volumeUnit}`}
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

        {shouldShowExtractionContactSuggestion(data.extractionTotalMl) ? (
          <aside className="bg-secondary/30 mt-5 flex gap-3 rounded-xl border p-4">
            <CircleAlert
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-sm font-medium">
                {copy.thresholdSuggestion.title}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {copy.thresholdSuggestion.description.replace(
                  '{volume}',
                  formatCount(data.extractionTotalMl),
                )}
              </p>
            </div>
          </aside>
        ) : null}
      </CardContent>
    </Card>
  )
}
