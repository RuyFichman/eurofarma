import Image from 'next/image'
import { MapPin, Navigation, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { buildMapboxStaticImageUrl } from '@/lib/maps/mapbox-static'
import { buildDirectionsUrl } from '@/lib/utils/appointment-display'
import { buildPhoneHref, formatBrazilianPhone } from '@/lib/utils/phone'
import { APPOINTMENT } from '@/lib/i18n/pt-br'
import type { PublicUnitDetail } from '@/lib/mappers/unit-detail-mapper'

const COPY = APPOINTMENT.location

/**
 * Local do atendimento: nome, endereço, telefone, mapa e rota.
 *
 * A unidade é **opcional** no agendamento — a nutriz pode não ter dito com qual
 * banco combinou (`unitId` nulo, decisão da 6.1). Nesse caso a tela explica o
 * que falta em vez de esconder o bloco, porque o dado é recuperável: basta ela
 * contar pelo WhatsApp.
 *
 * O mapa segue a regra da 3.6: imagem estática do Mapbox quando há token e
 * coordenadas, e **fallback textual** quando não — a maior parte da base da rBLH
 * veio sem `lat`/`lng`, então o caminho comum aqui é o endereço escrito.
 */
export function AppointmentLocation({
  unit,
}: {
  unit: PublicUnitDetail | null
}) {
  if (!unit) {
    return (
      <section className="bg-card rounded-3xl border p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <MapPin className="text-primary size-5" aria-hidden="true" />
          {COPY.title}
        </h2>
        <p className="mt-3 text-sm font-medium">{COPY.unknownTitle}</p>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {COPY.unknownBody}
        </p>
      </section>
    )
  }

  const mapUrl =
    unit.coordinates.lat !== null && unit.coordinates.lng !== null
      ? buildMapboxStaticImageUrl({
          lat: unit.coordinates.lat,
          lng: unit.coordinates.lng,
          width: 640,
          height: 360,
        })
      : null

  // `buildPhoneHref` devolve null para número que não normaliza — parte da base
  // da rBLH tem telefone truncado, então o link só aparece quando é discável.
  const phoneHref = buildPhoneHref(unit.contact.phone)

  return (
    <section className="bg-card rounded-3xl border p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <MapPin className="text-primary size-5" aria-hidden="true" />
        {COPY.title}
      </h2>

      <p className="mt-3 font-medium">{unit.name}</p>
      <p className="text-muted-foreground mt-1 text-sm leading-6">
        {unit.address.fullAddress}
      </p>
      {unit.address.zip ? (
        <p className="text-muted-foreground text-sm">
          {COPY.cepLabel} {unit.address.zip}
        </p>
      ) : null}

      {phoneHref ? (
        <a
          href={phoneHref}
          className="bg-muted/40 hover:bg-muted mt-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors"
        >
          <Phone className="text-primary size-4" aria-hidden="true" />
          {formatBrazilianPhone(unit.contact.phone)}
        </a>
      ) : null}

      {mapUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border">
          <Image
            src={mapUrl}
            alt={COPY.mapAltTemplate.replace('{unitName}', unit.name)}
            width={640}
            height={360}
            className="h-auto w-full"
            unoptimized
          />
        </div>
      ) : null}

      <Button asChild className="mt-4 w-full rounded-xl">
        <a
          href={buildDirectionsUrl(unit.address.fullAddress)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation aria-hidden="true" />
          {COPY.directions}
        </a>
      </Button>
    </section>
  )
}
