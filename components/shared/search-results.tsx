import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  type LucideIcon,
  MapPin,
  SearchX,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { UnitCard } from '@/components/shared/unit-card'
import { searchPublicUnits } from '@/lib/db/queries/units'
import { parseUnitSearchParams } from '@/lib/validators/unit-search'
import { SEARCH } from '@/lib/i18n/pt-br'

export type SearchParamsRecord = Record<string, string | string[] | undefined>

const RESULTS = SEARCH.results
const PAGINATION = SEARCH.pagination
const BASE_PATH = '/buscar'

/** Converte os searchParams do App Router em `URLSearchParams` (pega o 1º valor de arrays). */
function toUrlSearchParams(params: SearchParamsRecord): URLSearchParams {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      usp.set(key, value)
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      usp.set(key, value[0])
    }
  }
  return usp
}

function StatePanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="bg-card/80 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-14 text-center shadow-sm">
      <span className="bg-secondary text-primary mb-5 flex size-12 items-center justify-center rounded-full">
        <Icon className="size-5" aria-hidden={true} />
      </span>
      <h2 className="text-xl font-semibold text-balance">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6 text-pretty">
        {description}
      </p>
    </div>
  )
}

function buildPageHref(base: URLSearchParams, page: number): string {
  const next = new URLSearchParams(base)
  next.set('page', String(page))
  return `${BASE_PATH}?${next.toString()}`
}

function Pagination({
  base,
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
}: {
  base: URLSearchParams
  page: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}) {
  const status = PAGINATION.status
    .replace('{page}', String(page))
    .replace('{total}', String(totalPages))

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-3"
      aria-label={PAGINATION.label}
    >
      {hasPreviousPage ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="bg-card h-10 rounded-xl px-4"
        >
          <Link href={buildPageHref(base, page - 1)} rel="prev">
            <ChevronLeft aria-hidden="true" />
            {PAGINATION.previous}
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-xl px-4"
          disabled
        >
          <ChevronLeft aria-hidden="true" />
          {PAGINATION.previous}
        </Button>
      )}

      <span className="bg-card text-muted-foreground rounded-full border px-4 py-2 text-sm shadow-xs">
        {status}
      </span>

      {hasNextPage ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="bg-card h-10 rounded-xl px-4"
        >
          <Link href={buildPageHref(base, page + 1)} rel="next">
            {PAGINATION.next}
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-xl px-4"
          disabled
        >
          {PAGINATION.next}
          <ChevronRight aria-hidden="true" />
        </Button>
      )}
    </nav>
  )
}

export async function SearchResults({
  searchParams,
}: {
  searchParams: SearchParamsRecord
}) {
  const usp = toUrlSearchParams(searchParams)
  const parsed = parseUnitSearchParams(usp)

  // Sem `state` na URL = primeira visita: convida a escolher um estado (não é erro).
  if (!parsed.ok) {
    const panel =
      parsed.error.code === 'MISSING_STATE' ? RESULTS.initial : RESULTS.invalid
    return (
      <section aria-live="polite">
        <StatePanel
          icon={parsed.error.code === 'MISSING_STATE' ? MapPin : CircleAlert}
          title={panel.title}
          description={panel.description}
        />
      </section>
    )
  }

  let data
  try {
    data = await searchPublicUnits(parsed.data)
  } catch {
    return (
      <section aria-live="polite">
        <StatePanel
          icon={CircleAlert}
          title={RESULTS.error.title}
          description={RESULTS.error.description}
        />
      </section>
    )
  }

  const { units, meta } = data

  if (units.length === 0) {
    return (
      <section aria-live="polite">
        <StatePanel
          icon={SearchX}
          title={RESULTS.empty.title}
          description={RESULTS.empty.description}
        />
      </section>
    )
  }

  const countLabel = meta.total === 1 ? RESULTS.countOne : RESULTS.countOther

  return (
    <section aria-live="polite">
      <div className="flex items-center gap-3 border-b pb-4">
        <span className="bg-primary size-2 rounded-full" aria-hidden="true" />
        <h2 className="text-base font-semibold">
          <span className="text-primary tabular-nums">{meta.total}</span>{' '}
          {countLabel}
        </h2>
      </div>

      <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {units.map((unit) => (
          <li key={unit.id}>
            <UnitCard unit={unit} />
          </li>
        ))}
      </ul>

      {meta.totalPages > 1 ? (
        <Pagination
          base={usp}
          page={meta.page}
          totalPages={meta.totalPages}
          hasPreviousPage={meta.hasPreviousPage}
          hasNextPage={meta.hasNextPage}
        />
      ) : null}
    </section>
  )
}

/** Esqueleto exibido pelo Suspense enquanto a busca server-side resolve. */
export function SearchResultsSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-muted size-2 animate-pulse rounded-full" />
        <div className="bg-muted h-5 w-40 animate-pulse rounded" />
      </div>
      <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <li
            key={index}
            className="bg-card flex h-72 flex-col gap-4 overflow-hidden rounded-2xl border p-5"
          >
            <div className="bg-muted h-5 w-28 animate-pulse rounded-full" />
            <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
            <div className="bg-muted/70 mt-1 h-20 w-full animate-pulse rounded-xl" />
            <div className="mt-auto space-y-2 border-t pt-4">
              <div className="bg-muted h-9 w-full animate-pulse rounded-lg" />
              <div className="bg-muted h-9 w-full animate-pulse rounded-lg" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
