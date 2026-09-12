import { MapPin } from 'lucide-react'

import { SERVICE_REGION_VALUES } from '@/lib/constants/service-municipalities'
import type { PublicServiceMunicipality } from '@/lib/db/queries/service-municipalities'
import { COVERAGE } from '@/lib/i18n/pt-br'

export function CoverageMunicipalityList({
  municipalities,
}: {
  municipalities: PublicServiceMunicipality[]
}) {
  return (
    <section aria-labelledby="coverage-list-title" className="mt-14 md:mt-20">
      <div className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="coverage-list-title" className="text-2xl font-semibold">
            {COVERAGE.municipalities.title}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
            {COVERAGE.municipalities.description}
          </p>
        </div>
        <p className="text-primary text-sm font-semibold tabular-nums">
          {COVERAGE.municipalities.count.replace(
            '{count}',
            String(municipalities.length),
          )}
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {SERVICE_REGION_VALUES.map((region) => {
          const items = municipalities.filter((item) => item.region === region)
          if (items.length === 0) return null

          return (
            <article
              key={region}
              className="bg-card rounded-2xl border p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="bg-secondary text-primary flex size-9 items-center justify-center rounded-xl">
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <h3 className="font-semibold">{COVERAGE.regions[region]}</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {items.map((municipality) => (
                  <li
                    key={municipality.id}
                    className="text-muted-foreground border-t pt-3 text-sm first:border-0 first:pt-0"
                  >
                    {COVERAGE.municipalities.location.replace(
                      '{city}',
                      municipality.name,
                    )}
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
