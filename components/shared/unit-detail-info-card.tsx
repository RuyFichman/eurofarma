import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { PublicUnitDetail } from '@/lib/mappers/unit-detail-mapper'
import { UNIT_DETAIL } from '@/lib/i18n/pt-br'

const COPY = UNIT_DETAIL.contact

type ContactRow = {
  icon: LucideIcon
  label: string
  value: string
}

type UnitDetailInfoCardProps = {
  unit: PublicUnitDetail
}

/**
 * Card com as informações públicas de contato da unidade (Server Component).
 * Renderiza apenas campos preenchidos; nunca expõe dados administrativos/PII.
 */
export function UnitDetailInfoCard({ unit }: UnitDetailInfoCardProps) {
  const { contact, address } = unit

  const rows: ContactRow[] = []
  if (contact.hasPhone && contact.phone) {
    rows.push({ icon: Phone, label: COPY.phone, value: contact.phone })
  }
  if (contact.hasWhatsapp && contact.whatsapp) {
    rows.push({
      icon: MessageCircle,
      label: COPY.whatsapp,
      value: contact.whatsapp,
    })
  }
  if (contact.hasEmail && contact.email) {
    rows.push({ icon: Mail, label: COPY.email, value: contact.email })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{COPY.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {rows.length > 0 ? (
          <dl className="space-y-3">
            {rows.map((row) => {
              const Icon = row.icon
              return (
                <div key={row.label} className="flex items-start gap-3">
                  <Icon
                    className="text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      {row.label}
                    </dt>
                    <dd className="font-medium">{row.value}</dd>
                  </div>
                </div>
              )
            })}
          </dl>
        ) : (
          <p className="text-muted-foreground">{COPY.empty}</p>
        )}

        <Separator />

        <div className="flex items-start gap-3">
          <MapPin
            className="text-primary mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">{COPY.address}</p>
            <p className="font-medium">{address.fullAddress}</p>
            {address.zip ? (
              <p className="text-muted-foreground">
                {COPY.zip}: {address.zip}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
