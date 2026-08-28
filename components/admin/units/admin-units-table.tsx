import { Card } from '@/components/ui/card'
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
 * Tabela de unidades para telas médias e maiores — Server Component.
 *
 * Tabela semântica de verdade (mesma escolha da 5.5): `<th scope="col">` nas
 * colunas e `<th scope="row">` no nome, para o leitor de tela anunciar "linha
 * X, coluna Y" com contexto. A rolagem horizontal fica **dentro** do cartão
 * (`overflow-x-auto`), então a página em si nunca rola na horizontal; abaixo de
 * `md` quem aparece é a lista de cartões, não esta tabela espremida.
 */
export function AdminUnitsTable({ units }: { units: AdminUnitListItem[] }) {
  return (
    <Card className="hidden overflow-hidden py-0 md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <caption className="sr-only">{COPY.caption}</caption>
          <thead>
            <tr className="text-muted-foreground bg-muted/40 border-b text-left">
              <th scope="col" className="px-4 py-3 font-medium">
                {COPY.columns.unit}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {COPY.columns.type}
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
                {COPY.columns.actions}
              </th>
            </tr>
          </thead>

          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="border-b last:border-0">
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  <span className="block">{unit.name}</span>
                  {/* Slug: é por ele que a unidade é identificada na URL
                      pública e nos CSVs de importação. */}
                  <span className="text-muted-foreground block text-xs font-normal">
                    {unit.slug}
                  </span>
                </th>
                <td className="px-4 py-3">
                  <AdminUnitTypeBadge type={unit.type} />
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  <span className="block">
                    {unit.city} - {unit.state}
                  </span>
                  <span className="block text-xs">{unit.neighborhood}</span>
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  <AdminUnitContact
                    hasPhone={unit.hasPhone}
                    hasWhatsapp={unit.hasWhatsapp}
                  />
                </td>
                <td className="px-4 py-3">
                  <AdminUnitStatusBadge status={unit.status} />
                </td>
                <td className="px-4 py-3">
                  <AdminUnitActions unit={unit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
