'use client'

import type { ComponentProps, ReactNode } from 'react'
import {
  Controller,
  type Control,
  type UseFormRegisterReturn,
} from 'react-hook-form'

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
import type {
  AdminUnitFormInput,
  AdminUnitFormValues,
} from '@/lib/admin/units/unit-form-schema'
import { ADMIN } from '@/lib/i18n/pt-br'

/**
 * Primitivos de campo do formulário de unidade (Sprint 5.7).
 *
 * O formulário tem dezoito campos; sem estes componentes, cada um repetiria as
 * mesmas quinze linhas de `Label` + controle + `aria-describedby` + erro, e a
 * chance de um deles esquecer o `aria-invalid` seria alta. Aqui a ligação entre
 * rótulo, ajuda e mensagem de erro é montada **uma vez** e herdada por todos.
 */

const COPY = ADMIN.units.form

/** `control` já com os três genéricos que o `useForm` do formulário usa. */
export type AdminUnitFormControl = Control<
  AdminUnitFormInput,
  unknown,
  AdminUnitFormValues
>

type FieldShellProps = {
  id: string
  label: string
  helper?: string
  error?: string
  optional?: boolean
  /** Campos longos ocupam a linha inteira a partir de `md`. */
  wide?: boolean
  children: ReactNode
}

/** Ids derivados do campo — mantêm `aria-describedby` e `id` sempre em sincronia. */
function describedBy(id: string, helper?: string, error?: string) {
  const ids = [helper ? `${id}-helper` : null, error ? `${id}-error` : null]
  const value = ids.filter(Boolean).join(' ')
  return value === '' ? undefined : value
}

function FieldShell({
  id,
  label,
  helper,
  error,
  optional,
  wide,
  children,
}: FieldShellProps) {
  return (
    <div className={`space-y-2 ${wide ? 'md:col-span-2' : ''}`}>
      <Label htmlFor={id} className="flex flex-wrap items-baseline gap-1.5">
        {label}
        {optional ? (
          <span className="text-muted-foreground text-xs font-normal">
            ({COPY.optionalLabel})
          </span>
        ) : null}
      </Label>

      {children}

      {helper ? (
        <p id={`${id}-helper`} className="text-muted-foreground text-xs">
          {helper}
        </p>
      ) : null}

      {/* `role="alert"` para o erro ser anunciado assim que aparece. */}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function AdminUnitTextField({
  id,
  label,
  helper,
  error,
  optional,
  wide,
  registration,
  ...inputProps
}: Omit<FieldShellProps, 'children'> & {
  registration: UseFormRegisterReturn
} & Omit<ComponentProps<typeof Input>, 'id'>) {
  return (
    <FieldShell
      id={id}
      label={label}
      helper={helper}
      error={error}
      optional={optional}
      wide={wide}
    >
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, helper, error)}
        {...inputProps}
        {...registration}
      />
    </FieldShell>
  )
}

export function AdminUnitTextareaField({
  id,
  label,
  helper,
  error,
  optional,
  registration,
  rows = 3,
  ...textareaProps
}: Omit<FieldShellProps, 'children' | 'wide'> & {
  registration: UseFormRegisterReturn
} & Omit<ComponentProps<typeof Textarea>, 'id'>) {
  return (
    <FieldShell
      id={id}
      label={label}
      helper={helper}
      error={error}
      optional={optional}
      wide
    >
      <Textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, helper, error)}
        {...textareaProps}
        {...registration}
      />
    </FieldShell>
  )
}

export function AdminUnitSelectField({
  id,
  label,
  helper,
  error,
  optional,
  wide,
  control,
  name,
  placeholder,
  options,
}: Omit<FieldShellProps, 'children'> & {
  control: AdminUnitFormControl
  name: 'type' | 'status' | 'addressState'
  placeholder: string
  options: readonly { value: string; label: string }[]
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      helper={helper}
      error={error}
      optional={optional}
      wide={wide}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            // `|| undefined`: string vazia faria o Radix tratar o campo como
            // controlado sem valor e engolir o placeholder.
            value={field.value || undefined}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              onBlur={field.onBlur}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy(id, helper, error)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FieldShell>
  )
}
