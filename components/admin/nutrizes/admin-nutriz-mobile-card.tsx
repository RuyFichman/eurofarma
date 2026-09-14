import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { AdminJourneyStatusBadge } from '@/components/admin/nutrizes/admin-journey-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ADMIN_NUTRIZES_PATH } from '@/lib/admin/nutrizes/filters'
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

        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">
            {COPY.table.columns.journey}
          </span>
          <AdminJourneyStatusBadge status={nutriz.journeyStatus} />
        </div>

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

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`${ADMIN_NUTRIZES_PATH}/${nutriz.id}`}>
            {ADMIN.nutrizJourney.openJourney}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
