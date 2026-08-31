import { Card } from '@/components/ui/card'
import type { AdminNutrizListItem } from '@/lib/db/queries/admin-nutrizes'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'

import { AdminNutrizContact } from './admin-nutriz-contact'
import {
  AdminNutrizConsent,
  AdminNutrizPreference,
  AdminNutrizStatusBadge,
} from './admin-nutriz-fields'

const COPY = ADMIN.nutrizes.table

/**
 * Tabela de nutrizes para telas médias e maiores — Server Component.
 *
 * Tabela semântica: `<th scope="col">` nas colunas e `<th scope="row">` no nome.
 * A rolagem horizontal fica **dentro** do cartão, então a página nunca rola na
 * horizontal; abaixo de `md` quem aparece é a lista de cartões.
 */
export function AdminNutrizesTable({
  nutrizes,
}: {
  nutrizes: AdminNutrizListItem[]
}) {
  return (
    <Card className="hidden overflow-hidden py-0 md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-sm">
          <caption className="sr-only">{COPY.caption}</caption>
          <thead>
            <tr className="text-muted-foreground bg-muted/40 border-b text-left">
              <th scope="col" className="px-4 py-3 font-medium">
                {COPY.columns.nutriz}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {COPY.columns.location}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {COPY.columns.contact}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {COPY.columns.status}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {COPY.columns.consent}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {COPY.columns.signedUpAt}
              </th>
            </tr>
          </thead>

          <tbody>
            {nutrizes.map((nutriz) => (
              <tr key={nutriz.id} className="border-b last:border-0">
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  <span className="block">{nutriz.fullName}</span>
                  <AdminNutrizPreference
                    preference={nutriz.contactPreference}
                  />
                </th>
                <td className="text-muted-foreground px-4 py-3">
                  <span className="block">
                    {nutriz.city} - {nutriz.state}
                  </span>
                  {nutriz.neighborhood ? (
                    <span className="block text-xs">{nutriz.neighborhood}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <AdminNutrizContact
                    phoneWhatsapp={nutriz.phoneWhatsapp}
                    fullName={nutriz.fullName}
                  />
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {nutriz.email ?? ADMIN.nutrizes.contact.noEmail}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminNutrizStatusBadge status={nutriz.interestStatus} />
                </td>
                <td className="px-4 py-3">
                  <AdminNutrizConsent
                    lgpdConsentAt={nutriz.lgpdConsentAt}
                    marketingConsent={nutriz.marketingConsent}
                  />
                </td>
                <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                  {formatShortDate(nutriz.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
