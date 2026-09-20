import { MapPin } from 'lucide-react'

import { CoverageMunicipalitiesMapClient } from '@/components/shared/coverage-municipalities-map-client'
import { getPublicMapboxToken } from '@/lib/maps/mapbox-static'
import { LACTARE_MUNICIPALITY_COORDINATES } from '@/lib/maps/lactare-municipality-coordinates'
import type { PublicServiceMunicipality } from '@/lib/db/queries/service-municipalities'
import { COVERAGE } from '@/lib/i18n/pt-br'

const COPY = COVERAGE.municipalities.map

/**
 * Visão geral em mapa dos municípios atendidos, entre o título "Municípios
 * atendidos" e a lista por sub-região (`CoverageMunicipalityList`). Server
 * Component: resolve token e coordenadas aqui, e isola no cliente só o que
 * precisa de JS (o próprio mapa interativo, com zoom) — regra da seção 6.2 do
 * AGENTS.md. Cai no fallback textual quando falta token ou nenhum município
 * ativo tem coordenada conhecida — nunca bloqueia a página nem afeta a
 * checagem de elegibilidade, que continua vindo do ViaCEP.
 */
export function CoverageMunicipalitiesMap({
  municipalities,
}: {
  municipalities: PublicServiceMunicipality[]
}) {
  const points = municipalities.flatMap((municipality) => {
    const coordinates = LACTARE_MUNICIPALITY_COORDINATES[municipality.slug]
    if (!coordinates) return []
    return [
      { name: municipality.name, lat: coordinates.lat, lng: coordinates.lng },
    ]
  })

  const token = getPublicMapboxToken()

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border">
      {token && points.length > 0 ? (
        <CoverageMunicipalitiesMapClient points={points} token={token} />
      ) : (
        <div className="bg-muted text-muted-foreground flex items-start gap-3 p-4">
          <MapPin
            className="text-primary mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm">{COPY.unavailable}</p>
        </div>
      )}
    </div>
  )
}
