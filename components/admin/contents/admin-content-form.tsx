'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'

import {
  createAdminContentAction,
  updateAdminContentAction,
} from '@/app/admin/(painel)/conteudos/actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ADMIN_CONTENTS_PATH } from '@/lib/admin/contents/filters'
import {
  adminContentFormSchema,
  type AdminContentFormInput,
  type AdminContentFormValues,
} from '@/lib/admin/contents/content-form-schema'
import { ADMIN } from '@/lib/i18n/pt-br'

type AdminContentFormProps =
  | { mode: 'create'; initialValues: AdminContentFormInput }
  | {
      mode: 'edit'
      contentId: string
      slug: string
      initialValues: AdminContentFormInput
    }

export function AdminContentForm(props: AdminContentFormProps) {
  const copy = ADMIN.contents.form[props.mode]
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<AdminContentFormInput, unknown, AdminContentFormValues>({
    resolver: zodResolver(adminContentFormSchema),
    defaultValues: props.initialValues,
  })

  async function onSubmit(values: AdminContentFormValues) {
    setSubmitError(null)
    const result =
      props.mode === 'create'
        ? await createAdminContentAction(values)
        : await updateAdminContentAction(props.contentId, values)

    if (result.fields) {
      for (const [field, message] of Object.entries(result.fields)) {
        if (
          field === 'title' ||
          field === 'category' ||
          field === 'bodyMarkdown' ||
          field === 'status'
        ) {
          form.setError(field, { message })
        }
      }
    }
    setSubmitError(result.message)
  }

  const errors = form.formState.errors
  const isSubmitting = form.formState.isSubmitting
  const copyRoot = ADMIN.contents.form

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-card max-w-4xl space-y-8 rounded-2xl border p-6 shadow-sm md:p-8"
      noValidate
    >
      {submitError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{copyRoot.mutations.errorTitle}</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="content-title">{copyRoot.fields.title.label}</Label>
          <Input
            id="content-title"
            className="h-11"
            placeholder={copyRoot.fields.title.placeholder}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'content-title-error' : undefined}
            {...form.register('title')}
          />
          {errors.title ? (
            <p
              id="content-title-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-category">
            {copyRoot.fields.category.label}{' '}
            <span className="text-muted-foreground font-normal">
              ({copyRoot.fields.category.optional})
            </span>
          </Label>
          <Input
            id="content-category"
            placeholder={copyRoot.fields.category.placeholder}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={
              errors.category ? 'content-category-error' : undefined
            }
            {...form.register('category')}
          />
          {errors.category ? (
            <p
              id="content-category-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {errors.category.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-status">{copyRoot.fields.status.label}</Label>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="content-status"
                  className="w-full"
                  aria-invalid={Boolean(errors.status)}
                >
                  <SelectValue
                    placeholder={copyRoot.fields.status.placeholder}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{copyRoot.status.draft}</SelectItem>
                  <SelectItem value="PUBLISHED">
                    {copyRoot.status.published}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status ? (
            <p role="alert" className="text-destructive text-sm">
              {errors.status.message}
            </p>
          ) : null}
        </div>

        {props.mode === 'edit' ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="content-slug">{copyRoot.fields.slug.label}</Label>
            <Input id="content-slug" value={props.slug} disabled readOnly />
            <p className="text-muted-foreground text-xs leading-5">
              {copyRoot.fields.slug.helper}
            </p>
          </div>
        ) : null}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="content-body">
            {copyRoot.fields.bodyMarkdown.label}
          </Label>
          <Textarea
            id="content-body"
            rows={18}
            className="min-h-80 resize-y font-mono text-sm leading-6"
            placeholder={copyRoot.fields.bodyMarkdown.placeholder}
            aria-invalid={Boolean(errors.bodyMarkdown)}
            aria-describedby={
              errors.bodyMarkdown
                ? 'content-body-helper content-body-error'
                : 'content-body-helper'
            }
            {...form.register('bodyMarkdown')}
          />
          <p
            id="content-body-helper"
            className="text-muted-foreground text-xs leading-5"
          >
            {copyRoot.fields.bodyMarkdown.helper}
          </p>
          {errors.bodyMarkdown ? (
            <p
              id="content-body-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {errors.bodyMarkdown.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="outline">
          <Link href={ADMIN_CONTENTS_PATH}>{copyRoot.actions.cancel}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? props.mode === 'create'
              ? copyRoot.mutations.submittingCreate
              : copyRoot.mutations.submittingUpdate
            : copy.submit}
        </Button>
      </div>
    </form>
  )
}
