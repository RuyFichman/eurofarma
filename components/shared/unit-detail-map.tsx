import { MapPin } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildMapboxStaticImageUrl } from '@/lib/maps/mapbox-static'
import type { PublicUnitDetail } from '@/lib/mappers/unit-detail-mapper'
import { UNIT_DETAIL } from '@/lib/i18n/pt-br'

const COPY = UNIT_DETAIL.map

type UnitDetailMapProps = {
  unit: PublicUnitDetail
}

/**
 * Mapa estático (imagem Mapbox) ou fallback textual de endereço (Server
 * Component). Sem SDK nem mapa interativo. Cai no fallback quando faltam
 * coordenadas ou token — nunca bloqueia a página.
 */
export function UnitDetailMap({ unit }: UnitDetailMapProps) {
  const { lat, lng } = unit.coordinates
  const mapUrl =
    lat !== null && lng !== null
      ? buildMapboxStaticImageUrl({ lat, lng })
      : null

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{COPY.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mapUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem estática da Mapbox; next/image exigiria configurar remotePatterns (fora do escopo)
          <img
            src={mapUrl}
            alt={COPY.imageAlt.replace('{unitName}', unit.name)}
            width={640}
            height={360}
            loading="lazy"
            className="h-auto w-full rounded-lg border"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex items-start gap-3 rounded-lg border border-dashed p-4">
            <MapPin
              className="text-primary mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-sm">{COPY.unavailable}</p>
          </div>
        )}
        <p className="text-sm font-medium">{unit.address.fullAddress}</p>
      </CardContent>
    </Card>
  )
}
