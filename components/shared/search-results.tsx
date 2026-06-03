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
    <div className="bg-card flex flex-col items-center rounded-2xl border px-6 py-16 text-center">
      <span className="bg-secondary text-secondary-foreground mb-4 flex size-14 items-center justify-center rounded-2xl">
        <Icon className="size-7" aria-hidden={true} />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
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
      className="mt-8 flex items-center justify-center gap-4"
      aria-label={PAGINATION.label}
    >
      {hasPreviousPage ? (
        <Button asChild variant="outline" size="sm">
          <Link href={buildPageHref(base, page - 1)} rel="prev">
            <ChevronLeft aria-hidden="true" />
            {PAGINATION.previous}
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft aria-hidden="true" />
          {PAGINATION.previous}
        </Button>
      )}

      <span className="text-muted-foreground text-sm">{status}</span>

      {hasNextPage ? (
        <Button asChild variant="outline" size="sm">
          <Link href={buildPageHref(base, page + 1)} rel="next">
            {PAGINATION.next}
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
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
      <h2 className="text-muted-foreground text-sm font-medium">
        {meta.total} {countLabel}
      </h2>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      <div className="bg-muted h-4 w-40 animate-pulse rounded" />
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <li
            key={index}
            className="bg-card flex h-52 flex-col gap-4 rounded-xl border p-6"
          >
            <div className="flex items-start gap-3">
              <div className="bg-muted size-11 shrink-0 animate-pulse rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-20 animate-pulse rounded-full" />
              </div>
            </div>
            <div className="bg-muted h-3 w-full animate-pulse rounded" />
            <div className="bg-muted mt-auto h-9 w-full animate-pulse rounded-md" />
          </li>
        ))}
      </ul>
    </section>
  )
}
