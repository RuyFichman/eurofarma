/**
 * Helper puro para a Mapbox Static Images API — gera a URL de uma imagem PNG
 * (sem SDK, sem JS de mapa interativo). Retorna `null` quando não há token ou
 * quando as coordenadas são inválidas; nesse caso a UI cai para o fallback
 * textual de endereço.
 *
 * Prefere `NEXT_PUBLIC_MAPBOX_TOKEN` porque a URL é renderizada no cliente
 * (`<img src>`). `MAPBOX_TOKEN` (sem `NEXT_PUBLIC_`) é aceito como fallback, mas
 * ATENÇÃO: a imagem é pública, então usar um token privado aqui o expõe no HTML.
 * Configure preferencialmente o token público.
 */

const MAPBOX_STATIC_BASE =
  'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static'
// --primary (azul profundo #3A7AB8), sem o '#'.
const MARKER_COLOR = '3a7ab8'

function getMapboxToken(): string | null {
  const token =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? ''
  return token.trim() === '' ? null : token
}

export function buildMapboxStaticImageUrl(params: {
  lat: number
  lng: number
  width?: number
  height?: number
  zoom?: number
}): string | null {
  const token = getMapboxToken()
  if (!token) return null

  const { lat, lng, width = 640, height = 360, zoom = 15 } = params

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

  const marker = `pin-l+${MARKER_COLOR}(${lng},${lat})`
  const viewport = `${lng},${lat},${zoom},0`

  return `${MAPBOX_STATIC_BASE}/${marker}/${viewport}/${width}x${height}@2x?access_token=${encodeURIComponent(token)}`
}

/**
 * Mesma API, com um pino pequeno por ponto e enquadramento automático
 * (`auto`) em vez de centro/zoom fixos — para o mapa de visão geral de
 * `/verificar-cobertura` (vários municípios), não para a localização de uma
 * unidade só. `width`/`height` ficam ≤ 640 por padrão: a Static Images API da
 * Mapbox limita o lado maior da imagem final a 1280px, e aqui sempre pedimos
 * `@2x`.
 */
export function buildMapboxStaticMultiMarkerImageUrl(params: {
  points: ReadonlyArray<{ lat: number; lng: number }>
  width?: number
  height?: number
}): string | null {
  const token = getMapboxToken()
  if (!token) return null

  const validPoints = params.points.filter(
    (point) =>
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lng >= -180 &&
      point.lng <= 180,
  )
  if (validPoints.length === 0) return null

  const { width = 640, height = 280 } = params

  const markers = validPoints
    .map((point) => `pin-s+${MARKER_COLOR}(${point.lng},${point.lat})`)
    .join(',')

  return `${MAPBOX_STATIC_BASE}/${markers}/auto/${width}x${height}@2x?access_token=${encodeURIComponent(token)}`
}
