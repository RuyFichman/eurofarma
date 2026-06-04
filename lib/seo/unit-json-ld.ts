import type { PublicUnitDetail } from '../mappers/unit-detail-mapper'

/**
 * Monta o JSON-LD schema.org `LocalBusiness` da unidade. Usamos `LocalBusiness`
 * (e não `MedicalBusiness`) de propósito nesta fase, para evitar classificação
 * médica sem validação jurídica. Campos vazios e quaisquer dados
 * administrativos/de nutriz nunca entram no objeto.
 */
export function buildUnitLocalBusinessJsonLd(
  unit: PublicUnitDetail,
): Record<string, unknown> {
  const address: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressCountry: 'BR',
    addressLocality: unit.address.city,
    addressRegion: unit.address.state,
  }

  const streetAddress = [unit.address.street, unit.address.number]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(', ')
  if (streetAddress) address.streetAddress = streetAddress
  if (unit.address.zip) address.postalCode = unit.address.zip

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: unit.name,
    address,
  }

  // Telefone tradicional tem prioridade; o WhatsApp só entra em `telephone`
  // quando não há telefone fixo cadastrado.
  const telephone = unit.contact.phone ?? unit.contact.whatsapp
  if (telephone && telephone.trim()) {
    jsonLd.telephone = telephone
  }

  // Sem domínio canônico em ambiente local: caminho relativo (vira absoluto
  // quando `NEXT_PUBLIC_SITE_URL` existir, no sprint de deploy).
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  jsonLd.url = `${baseUrl}/banco-de-leite/${unit.slug}`

  if (unit.coordinates.lat !== null && unit.coordinates.lng !== null) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: unit.coordinates.lat,
      longitude: unit.coordinates.lng,
    }
  }

  return jsonLd
}
