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
