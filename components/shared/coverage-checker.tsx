'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Search,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PublicServiceMunicipality } from '@/lib/db/queries/service-municipalities'
import { COVERAGE } from '@/lib/i18n/pt-br'

const OUTSIDE_VALUE = '__outside__'

type CoverageCheckerProps = {
  municipalities: PublicServiceMunicipality[]
}

export function CoverageChecker({ municipalities }: CoverageCheckerProps) {
  const [selection, setSelection] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [validation, setValidation] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selection) {
      setValidation(true)
      setResult(null)
      return
    }
    setValidation(false)
    setResult(selection)
  }

  const selectedMunicipality = municipalities.find(
    (municipality) => municipality.id === result,
  )
  const isOutside = result === OUTSIDE_VALUE

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

        <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="coverage-municipality">
              {COVERAGE.checker.label}
            </Label>
            <Select
              value={selection || undefined}
              onValueChange={(value) => {
                setSelection(value)
                setValidation(false)
                setResult(null)
              }}
            >
              <SelectTrigger
                id="coverage-municipality"
                className="bg-background w-full rounded-xl data-[size=default]:h-12"
                aria-invalid={validation}
                aria-describedby={
                  validation ? 'coverage-municipality-error' : undefined
                }
              >
                <SelectValue placeholder={COVERAGE.checker.placeholder} />
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
            {validation ? (
              <p
                id="coverage-municipality-error"
                role="alert"
                className="text-destructive text-sm"
              >
                {COVERAGE.checker.validation}
              </p>
            ) : null}
          </div>

          <Button type="submit" size="lg" className="h-12 rounded-xl px-6">
            <Search aria-hidden="true" />
            {COVERAGE.checker.submit}
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {selectedMunicipality ? (
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
                  {COVERAGE.eligible.title.replace(
                    '{city}',
                    selectedMunicipality.name,
                  )}
                </h2>
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
        ) : isOutside ? (
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
                  {COVERAGE.outside.title}
                </h2>
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
