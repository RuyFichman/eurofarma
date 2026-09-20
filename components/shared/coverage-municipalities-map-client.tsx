'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import type { Map as MapboxMap } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { COVERAGE } from '@/lib/i18n/pt-br'

const COPY = COVERAGE.municipalities.map
// --primary (azul profundo #3A7AB8).
const MARKER_COLOR = '#3a7ab8'

export type CoverageMapPoint = {
  name: string
  lat: number
  lng: number
}

/**
 * Mapa interativo (Mapbox GL JS) com um pino por município, zoom com +/-,
 * roda do mouse e arraste. O import do SDK acontece dentro do `useEffect`
 * (nunca no topo do módulo): `mapbox-gl` toca `window` ao ser avaliado, e este
 * componente ainda passa por uma renderização no servidor (é Client Component,
 * mas o Next também o renderiza uma vez no servidor pro HTML inicial) — um
 * `import` estático quebraria esse passo.
 */
export function CoverageMunicipalitiesMapClient({
  points,
  token,
}: {
  points: CoverageMapPoint[]
  token: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return

    let map: MapboxMap | null = null
    let cancelled = false

    import('mapbox-gl')
      .then(({ default: mapboxgl }) => {
        if (cancelled || !containerRef.current) return

        mapboxgl.accessToken = token
        map = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
        })
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          'top-left',
        )

        const bounds = new mapboxgl.LngLatBounds()
        for (const point of points) {
          new mapboxgl.Marker({ color: MARKER_COLOR })
            .setLngLat([point.lng, point.lat])
            .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(point.name))
            .addTo(map)
          bounds.extend([point.lng, point.lat])
        }
        map.fitBounds(bounds, { padding: 48, animate: false })
      })
      .catch(() => setFailed(true))

    return () => {
      cancelled = true
      map?.remove()
    }
  }, [points, token])

  if (failed) {
    return (
      <div className="bg-muted text-muted-foreground flex items-start gap-3 p-4">
        <MapPin
          className="text-primary mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <p className="text-sm">{COPY.unavailable}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={COPY.imageAlt}
      className="h-[320px] w-full sm:h-[380px]"
    />
  )
}
