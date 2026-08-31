import { Card, CardContent } from '@/components/ui/card'
import type { AdminNutrizListItem } from '@/lib/db/queries/admin-nutrizes'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'

import { AdminNutrizContact } from './admin-nutriz-contact'
import {
  AdminNutrizConsent,
  AdminNutrizPreference,
  AdminNutrizStatusBadge,
} from './admin-nutriz-fields'

const COPY = ADMIN.nutrizes

/**
 * Cartão de nutriz para telas pequenas — mesma informação da tabela, empilhada.
 * Server Component; só o contato dentro dele é Client.
 */
export function AdminNutrizMobileCard({
  nutriz,
}: {
  nutriz: AdminNutrizListItem
}) {
  return (
    <Card className="py-4">
      <CardContent className="space-y-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <h3 className="font-medium break-words">{nutriz.fullName}</h3>
            <AdminNutrizPreference preference={nutriz.contactPreference} />
          </div>
          <AdminNutrizStatusBadge status={nutriz.interestStatus} />
        </div>

        <p className="text-muted-foreground text-sm">
          {nutriz.city} - {nutriz.state}
          {nutriz.neighborhood ? ` · ${nutriz.neighborhood}` : ''}
        </p>

        <div className="space-y-1">
          <AdminNutrizContact
            phoneWhatsapp={nutriz.phoneWhatsapp}
            fullName={nutriz.fullName}
          />
          <p className="text-muted-foreground text-xs">
            {nutriz.email ?? COPY.contact.noEmail}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-2 border-t pt-3">
          <AdminNutrizConsent
            lgpdConsentAt={nutriz.lgpdConsentAt}
            marketingConsent={nutriz.marketingConsent}
          />
          <span className="text-muted-foreground text-xs">
            {formatShortDate(nutriz.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
