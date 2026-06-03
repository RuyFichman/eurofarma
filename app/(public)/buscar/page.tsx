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
      <section className="bg-card border-b">
        <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl">{SEARCH.page.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {SEARCH.page.description}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <SearchFilters />

        {/* TODO(sprint futuro): mapa das unidades — abordagem a definir com o time. */}
        <Suspense key={suspenseKey} fallback={<SearchResultsSkeleton />}>
          <SearchResults searchParams={params} />
        </Suspense>
      </div>
    </>
  )
}
