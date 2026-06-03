import { Building2, Clock, MapPin, MessageCircle, Phone } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { PublicUnitType } from '@/lib/constants/unit-types'
import type { PublicUnit } from '@/lib/mappers/unit-mapper'
import { SEARCH } from '@/lib/i18n/pt-br'
import { buildTelHref, formatPhone } from '@/lib/utils/format-phone'
import { buildWhatsappUrl } from '@/lib/utils/whatsapp'

const COPY = SEARCH.card

// Reusa os rótulos do filtro de tipo (fonte única de copy dos tipos públicos).
const TYPE_LABEL: Record<PublicUnitType, string> = {
  milk_bank: SEARCH.filters.fields.type.options.milkBank,
  collection_point: SEARCH.filters.fields.type.options.collectionPoint,
  hospital: SEARCH.filters.fields.type.options.hospital,
  partner: SEARCH.filters.fields.type.options.partner,
}

export function UnitCard({ unit }: { unit: PublicUnit }) {
  // `openingHours` é JSON livre; nos dados atuais vem como string ("Seg a Sex 8h às 17h").
  const hours =
    typeof unit.openingHours === 'string' ? unit.openingHours.trim() : ''

  const whatsappUrl = unit.contact.whatsapp
    ? buildWhatsappUrl(unit.contact.whatsapp, COPY.whatsappMessage)
    : null

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="text-base leading-snug font-semibold">
              {unit.name}
            </h3>
            <Badge variant="secondary" className="w-fit">
              {TYPE_LABEL[unit.type]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 text-sm">
        <p className="text-muted-foreground flex items-start gap-2">
          <MapPin
            className="text-primary mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>
            {unit.address.neighborhood} — {unit.address.city},{' '}
            {unit.address.state}
          </span>
        </p>
        {hours ? (
          <p className="text-muted-foreground flex items-start gap-2">
            <Clock
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              <span className="sr-only">{COPY.hoursLabel}: </span>
              {hours}
            </span>
          </p>
        ) : null}
      </CardContent>

      <CardFooter>
        {whatsappUrl ? (
          <Button
            asChild
            className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 w-full"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={COPY.whatsappAria.replace('{name}', unit.name)}
            >
              <MessageCircle aria-hidden="true" />
              {COPY.whatsapp}
            </a>
          </Button>
        ) : unit.contact.phone ? (
          <Button asChild variant="outline" className="w-full">
            <a
              href={buildTelHref(unit.contact.phone)}
              aria-label={COPY.callAria.replace('{name}', unit.name)}
            >
              <Phone aria-hidden="true" />
              {formatPhone(unit.contact.phone)}
            </a>
          </Button>
        ) : (
          <p className="text-muted-foreground text-sm">{COPY.noContact}</p>
        )}
      </CardFooter>
    </Card>
  )
}
