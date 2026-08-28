import { Card, CardContent } from '@/components/ui/card'
import type { AdminUnitListItem } from '@/lib/db/queries/admin-units'
import { ADMIN } from '@/lib/i18n/pt-br'

import {
  AdminUnitActions,
  AdminUnitContact,
  AdminUnitStatusBadge,
  AdminUnitTypeBadge,
} from './admin-unit-fields'

const COPY = ADMIN.units.table

/**
 * Uma unidade em formato de cartão, para telas estreitas — Server Component.
 *
 * Existe porque espremer seis colunas em 375px não gera uma tabela útil, só
 * uma rolagem lateral. A ordem de leitura acompanha a prioridade operacional:
 * nome e situação, depois tipo e localização, depois canais de contato e, por
 * fim, as ações.
 */
export function AdminUnitMobileCard({ unit }: { unit: AdminUnitListItem }) {
  return (
    <Card className="py-4">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium break-words">{unit.name}</h3>
            <p className="text-muted-foreground text-xs break-all">
              {unit.slug}
            </p>
          </div>
          <AdminUnitStatusBadge status={unit.status} />
        </div>

        <AdminUnitTypeBadge type={unit.type} />

        <dl className="text-muted-foreground space-y-1 text-sm">
          <div>
            <dt className="sr-only">{COPY.columns.location}</dt>
            <dd>
              {unit.neighborhood} · {unit.city} - {unit.state}
            </dd>
          </div>
          <div>
            <dt className="sr-only">{COPY.columns.contact}</dt>
            <dd>
              <AdminUnitContact
                hasPhone={unit.hasPhone}
                hasWhatsapp={unit.hasWhatsapp}
              />
            </dd>
          </div>
        </dl>

        <AdminUnitActions unit={unit} />
      </CardContent>
    </Card>
  )
}
