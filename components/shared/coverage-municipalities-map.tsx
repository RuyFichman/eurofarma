import Image from 'next/image'
import { MapPin } from 'lucide-react'

import { buildMapboxStaticMultiMarkerImageUrl } from '@/lib/maps/mapbox-static'
import { LACTARE_MUNICIPALITY_COORDINATES } from '@/lib/maps/lactare-municipality-coordinates'
import type { PublicServiceMunicipality } from '@/lib/db/queries/service-municipalities'
import { COVERAGE } from '@/lib/i18n/pt-br'

const COPY = COVERAGE.municipalities.map

/**
 * Visão geral em mapa dos municípios atendidos, entre o título "Municípios
 * atendidos" e a lista por sub-região (`CoverageMunicipalityList`). Imagem
 * estática da Mapbox (mesmo padrão de `UnitDetailMap`: sem SDK, sem mapa
 * interativo), com um pino por município a partir de
 * `LACTARE_MUNICIPALITY_COORDINATES`. Cai no fallback textual quando falta o
 * token ou nenhum município ativo tem coordenada conhecida — nunca bloqueia a
 * página nem afeta a checagem de elegibilidade, que continua vindo do ViaCEP.
 */
export function CoverageMunicipalitiesMap({
  municipalities,
}: {
  municipalities: PublicServiceMunicipality[]
}) {
  const points = municipalities
    .map((municipality) => LACTARE_MUNICIPALITY_COORDINATES[municipality.slug])
    .filter((point): point is { lat: number; lng: number } => point != null)

  const mapUrl =
    points.length > 0
      ? buildMapboxStaticMultiMarkerImageUrl({
          points,
          width: 640,
          height: 280,
        })
      : null

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border">
      {mapUrl ? (
        <Image
          src={mapUrl}
          alt={COPY.imageAlt}
          width={640}
          height={280}
          className="h-auto w-full"
          unoptimized
        />
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
