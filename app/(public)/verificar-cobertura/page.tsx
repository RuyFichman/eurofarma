import type { Metadata } from 'next'

import { CoverageChecker } from '@/components/shared/coverage-checker'
import { CoverageMunicipalityList } from '@/components/shared/coverage-municipality-list'
import {
  getActiveServiceMunicipalities,
  type PublicServiceMunicipality,
} from '@/lib/db/queries/service-municipalities'
import { COVERAGE, SITE } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: `${COVERAGE.meta.title} — ${SITE.name}`,
  description: COVERAGE.meta.description,
}

export const dynamic = 'force-dynamic'

export default async function CoveragePage() {
  let municipalities: PublicServiceMunicipality[]
  try {
    municipalities = await getActiveServiceMunicipalities()
  } catch {
    municipalities = []
  }

  return (
    <>
      <section className="bg-card relative overflow-hidden border-b">
        <div
          className="bg-secondary/60 pointer-events-none absolute -top-24 right-0 size-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
          <p className="text-primary text-sm font-semibold">
            {COVERAGE.hero.eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl text-balance md:text-5xl">
            {COVERAGE.hero.title}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-8 text-pretty">
            {COVERAGE.hero.description}
          </p>
        </div>
      </section>

      <div className="bg-muted/30 min-h-[32rem]">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          {municipalities.length > 0 ? (
            <>
              <CoverageChecker municipalities={municipalities} />
              <CoverageMunicipalityList municipalities={municipalities} />
            </>
          ) : (
            <section className="bg-card rounded-3xl border border-dashed px-6 py-16 text-center shadow-sm">
              <h2 className="text-xl font-semibold">
                {COVERAGE.municipalities.emptyTitle}
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
                {COVERAGE.municipalities.emptyDescription}
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
