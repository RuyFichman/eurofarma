'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Search,
  XCircle,
} from 'lucide-react'

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
import type { CepCoverageResponse } from '@/lib/coverage/types'
import type { PublicServiceMunicipality } from '@/lib/db/queries/service-municipalities'
import { COVERAGE } from '@/lib/i18n/pt-br'
import { coverageCepRequestSchema } from '@/lib/validators/coverage'

const OUTSIDE_VALUE = '__outside__'

type CheckMethod = 'cep' | 'municipality'
type CoverageResult = {
  eligible: boolean
  city?: string
  state?: string
  cep?: string
}
type CoverageError = { message: string; field: boolean }

type CoverageCheckerProps = {
  municipalities: PublicServiceMunicipality[]
}

function formatCepInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

function getApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return null
  }
  const error = payload.error
  if (!error || typeof error !== 'object' || !('message' in error)) return null
  return typeof error.message === 'string' ? error.message : null
}

function isCoverageResponse(value: unknown): value is CepCoverageResponse {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CepCoverageResponse>
  return (
    typeof candidate.eligible === 'boolean' &&
    typeof candidate.cep === 'string' &&
    typeof candidate.location?.city === 'string' &&
    typeof candidate.location.state === 'string'
  )
}

export function CoverageChecker({ municipalities }: CoverageCheckerProps) {
  const [method, setMethod] = useState<CheckMethod>('cep')
  const [cep, setCep] = useState('')
  const [selection, setSelection] = useState('')
  const [result, setResult] = useState<CoverageResult | null>(null)
  const [error, setError] = useState<CoverageError | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetFeedback() {
    setError(null)
    setResult(null)
  }

  function selectMethod(nextMethod: CheckMethod) {
    setMethod(nextMethod)
    resetFeedback()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetFeedback()

    if (method === 'municipality') {
      if (!selection) {
        setError({
          message: COVERAGE.checker.municipalityValidation,
          field: true,
        })
        return
      }
      const municipality = municipalities.find((item) => item.id === selection)
      setResult(
        municipality
          ? {
              eligible: true,
              city: municipality.name,
              state: municipality.state,
            }
          : { eligible: false },
      )
      return
    }

    const parsed = coverageCepRequestSchema.safeParse({ cep })
    if (!parsed.success) {
      setError({
        message: parsed.error.issues[0]?.message ?? COVERAGE.api.invalidCep,
        field: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: parsed.data.cep }),
      })
      const payload: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        setError({
          message: getApiErrorMessage(payload) ?? COVERAGE.api.unavailable,
          field: false,
        })
        return
      }
      if (!isCoverageResponse(payload)) {
        setError({
          message: COVERAGE.checker.responseInvalid,
          field: false,
        })
        return
      }

      setResult({
        eligible: payload.eligible,
        city: payload.location.city,
        state: payload.location.state,
        cep: payload.cep,
      })
    } catch {
      setError({ message: COVERAGE.api.unavailable, field: false })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-3xl border p-6 shadow-sm md:p-8"
        noValidate
      >
        <div className="flex items-start gap-3 border-b pb-5">
          <span className="bg-secondary text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">{COVERAGE.checker.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {COVERAGE.checker.description}
            </p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium">
            {COVERAGE.checker.methodLabel}
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(['cep', 'municipality'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectMethod(option)}
                aria-pressed={method === option}
                className="aria-pressed:border-primary aria-pressed:bg-secondary/40 focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]"
              >
                {COVERAGE.checker.methods[option]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          {method === 'cep' ? (
            <div className="space-y-2">
              <Label htmlFor="coverage-cep">{COVERAGE.checker.cep.label}</Label>
              <Input
                id="coverage-cep"
                value={cep}
                onChange={(event) => {
                  setCep(formatCepInput(event.target.value))
                  resetFeedback()
                }}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder={COVERAGE.checker.cep.placeholder}
                className="bg-background h-12 rounded-xl"
                aria-invalid={Boolean(error?.field)}
                aria-describedby={
                  error?.field
                    ? 'coverage-cep-hint coverage-error'
                    : 'coverage-cep-hint'
                }
                disabled={isSubmitting}
              />
              <p
                id="coverage-cep-hint"
                className="text-muted-foreground text-xs"
              >
                {COVERAGE.checker.cep.hint}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="coverage-municipality">
                {COVERAGE.checker.municipality.label}
              </Label>
              <Select
                value={selection || undefined}
                onValueChange={(value) => {
                  setSelection(value)
                  resetFeedback()
                }}
              >
                <SelectTrigger
                  id="coverage-municipality"
                  className="bg-background w-full rounded-xl data-[size=default]:h-12"
                  aria-invalid={Boolean(error?.field)}
                  aria-describedby={error?.field ? 'coverage-error' : undefined}
                >
                  <SelectValue
                    placeholder={COVERAGE.checker.municipality.placeholder}
                  />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={OUTSIDE_VALUE}>
                    {COVERAGE.checker.outsideOption}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-xl px-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Search aria-hidden="true" />
            )}
            {isSubmitting
              ? COVERAGE.checker.submitting
              : COVERAGE.checker.submit}
          </Button>
        </div>

        {error ? (
          <p
            id="coverage-error"
            role="alert"
            className="text-destructive mt-3 text-sm"
          >
            {error.message}
          </p>
        ) : null}
      </form>

      <div aria-live="polite">
        {result?.eligible && result.city ? (
          <section className="border-primary/25 bg-secondary/25 rounded-3xl border p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-primary text-sm font-semibold">
                  {COVERAGE.eligible.badge}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-balance md:text-2xl">
                  {COVERAGE.eligible.title.replace('{city}', result.city)}
                </h2>
                {result.cep && result.state ? (
                  <p className="text-primary mt-2 text-sm font-medium">
                    {COVERAGE.checker.resolvedLocation
                      .replace('{cep}', result.cep)
                      .replace('{city}', result.city)
                      .replace('{state}', result.state)}
                  </p>
                ) : null}
                <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
                  {COVERAGE.eligible.description}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/cadastro">{COVERAGE.eligible.signup}</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/como-funciona">
                      {COVERAGE.eligible.learnMore}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : result && !result.eligible ? (
          <section className="bg-muted/50 rounded-3xl border p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full border">
                <XCircle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-muted-foreground text-sm font-semibold">
                  {COVERAGE.outside.badge}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-balance md:text-2xl">
                  {result.city
                    ? COVERAGE.outside.titleWithCity.replace(
                        '{city}',
                        result.city,
                      )
                    : COVERAGE.outside.title}
                </h2>
                {result.cep && result.city && result.state ? (
                  <p className="text-muted-foreground mt-2 text-sm font-medium">
                    {COVERAGE.checker.resolvedLocation
                      .replace('{cep}', result.cep)
                      .replace('{city}', result.city)
                      .replace('{state}', result.state)}
                  </p>
                ) : null}
                <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
                  {COVERAGE.outside.description}
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <a
                    href={COVERAGE.outside.officialDirectoryHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {COVERAGE.outside.officialDirectory}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
