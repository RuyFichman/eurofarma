import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SearchFilters } from '@/components/shared/search-filters'
import {
  SearchResults,
  SearchResultsSkeleton,
  type SearchParamsRecord,
} from '@/components/shared/search-results'
import { SEARCH, SITE } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: `${SEARCH.page.title} — ${SITE.name}`,
  description: SEARCH.page.description,
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>
}) {
  const params = await searchParams
  // Chave do Suspense: remonta o boundary (reexibindo o esqueleto) a cada
  // combinação de filtros enquanto a busca server-side resolve.
  const suspenseKey = JSON.stringify(params)

  return (
    <>
      <section className="bg-card relative overflow-hidden border-b">
        <div
          className="bg-secondary/50 pointer-events-none absolute -top-24 right-0 size-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
          <div className="max-w-3xl">
            <h1 className="text-2xl text-balance md:text-4xl">
              {SEARCH.page.title}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-pretty">
              {SEARCH.page.description}
            </p>
          </div>
        </div>
      </section>

      <div className="bg-muted/30 min-h-[32rem]">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:py-10">
          <SearchFilters />

          {/* TODO(sprint futuro): mapa das unidades — abordagem a definir com o time. */}
          <Suspense key={suspenseKey} fallback={<SearchResultsSkeleton />}>
            <SearchResults searchParams={params} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
