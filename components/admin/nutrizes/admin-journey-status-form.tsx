'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'

import { updateAdminNutrizJourneyStatusAction } from '@/app/admin/(painel)/nutrizes/actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getJourneyStatusLabel } from '@/lib/admin/nutrizes/journey-labels'
import {
  getAllowedJourneyTransitions,
  type JourneyStatusValue,
} from '@/lib/journey/status'
import { ADMIN } from '@/lib/i18n/pt-br'
import {
  journeyStatusTransitionSchema,
  type JourneyStatusTransitionInput,
  type JourneyStatusTransition,
} from '@/lib/validators/journey-status'

export function AdminJourneyStatusForm({
  nutrizProfileId,
  currentStatus,
}: {
  nutrizProfileId: string
  currentStatus: JourneyStatusValue
}) {
  const copy = ADMIN.nutrizJourney
  const allowedStatuses = getAllowedJourneyTransitions(currentStatus)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<
    JourneyStatusTransitionInput,
    unknown,
    JourneyStatusTransition
  >({
    resolver: zodResolver(journeyStatusTransitionSchema),
    defaultValues: {
      fromStatus: currentStatus,
      toStatus: undefined,
      administrativeNote: '',
    },
  })

  async function onSubmit(values: JourneyStatusTransition) {
    setSubmitError(null)
    const result = await updateAdminNutrizJourneyStatusAction(
      nutrizProfileId,
      values,
    )

    if (result.fields) {
      for (const [field, message] of Object.entries(result.fields)) {
        if (field === 'toStatus' || field === 'administrativeNote') {
          form.setError(field, { message })
        }
      }
    }
    setSubmitError(result.message)
  }

  const errors = form.formState.errors
  const isSubmitting = form.formState.isSubmitting

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-card space-y-6 rounded-2xl border p-6 shadow-sm"
      noValidate
    >
      <div>
        <h2 className="text-lg font-semibold">{copy.form.title}</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {copy.form.description}
        </p>
      </div>

      {submitError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{copy.mutations.errorTitle}</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="journey-next-status">
          {copy.form.nextStatus.label}
        </Label>
        <Controller
          name="toStatus"
          control={form.control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="journey-next-status"
                className="w-full"
                aria-invalid={Boolean(errors.toStatus)}
                aria-describedby={
                  errors.toStatus ? 'journey-next-status-error' : undefined
                }
              >
                <SelectValue placeholder={copy.form.nextStatus.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getJourneyStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.toStatus ? (
          <p
            id="journey-next-status-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.toStatus.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="journey-administrative-note">
          {copy.form.note.label}
        </Label>
        <Textarea
          id="journey-administrative-note"
          rows={4}
          placeholder={copy.form.note.placeholder}
          aria-invalid={Boolean(errors.administrativeNote)}
          aria-describedby={
            errors.administrativeNote
              ? 'journey-administrative-note-hint journey-administrative-note-error'
              : 'journey-administrative-note-hint'
          }
          disabled={isSubmitting}
          {...form.register('administrativeNote')}
        />
        <p
          id="journey-administrative-note-hint"
          className="text-muted-foreground text-xs leading-5"
        >
          {copy.form.note.helper}
        </p>
        {errors.administrativeNote ? (
          <p
            id="journey-administrative-note-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.administrativeNote.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? copy.form.submitting : copy.form.submit}
      </Button>
    </form>
  )
}
