import { Clock, MapPin } from 'lucide-react'

import { UnitCardActions } from '@/components/shared/unit-card-actions'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { PublicUnit } from '@/lib/mappers/unit-mapper'
import { SEARCH } from '@/lib/i18n/pt-br'

const COPY = SEARCH.page.unitCard

type UnitCardProps = {
  unit: PublicUnit
}

/**
 * Extrai um horário legível de `openingHours` (JSON livre). Nos dados atuais vem
 * como string ("Seg a Sex 8h às 17h"); aceita também objetos com um campo textual
 * simples. Nunca renderiza JSON cru — retorna `null` para o card cair no fallback.
 */
function readableOpeningHours(
  value: PublicUnit['openingHours'],
): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of ['text', 'label', 'description', 'summary'] as const) {
      const field = (value as Record<string, unknown>)[key]
      if (typeof field === 'string' && field.trim().length > 0) {
        return field.trim()
      }
    }
  }
  return null
}

export function UnitCard({ unit }: UnitCardProps) {
  const hours = readableOpeningHours(unit.openingHours)

  return (
    <Card className="border-border/80 hover:border-primary/40 flex h-full flex-col gap-4 p-5 shadow-sm transition-colors">
      <div className="flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <h3 className="text-base leading-snug font-semibold">{unit.name}</h3>
          <Badge variant="secondary" className="w-fit">
            {COPY.typeLabels[unit.type]}
          </Badge>
        </div>

        <div className="text-muted-foreground space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <MapPin
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              <span className="sr-only">{COPY.addressLabel}: </span>
              {unit.address.neighborhood}, {unit.address.city} -{' '}
              {unit.address.state}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Clock
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              <span className="sr-only">{COPY.openingHoursLabel}: </span>
              {hours ?? COPY.openingHoursFallback}
            </span>
          </p>
        </div>

        {unit.contact.hasWhatsapp || unit.contact.hasPhone ? (
          <div className="flex flex-wrap gap-2">
            {unit.contact.hasWhatsapp ? (
              <Badge variant="outline">{COPY.whatsappAvailable}</Badge>
            ) : null}
            {unit.contact.hasPhone ? (
              <Badge variant="outline">{COPY.phoneAvailable}</Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      <UnitCardActions
        unitId={unit.id}
        slug={unit.slug}
        unitName={unit.name}
        phone={unit.contact.phone}
        whatsapp={unit.contact.whatsapp}
        whatsappMessage={unit.whatsappMessage}
      />
    </Card>
  )
}
