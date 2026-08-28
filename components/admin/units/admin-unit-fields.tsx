import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AdminUnitListItem } from '@/lib/db/queries/admin-units'
import type { AdminUnitStatusValue } from '@/lib/admin/units/filters'
import {
  getAdminUnitStatusLabel,
  getAdminUnitTypeLabel,
} from '@/lib/admin/units/labels'
import { ADMIN } from '@/lib/i18n/pt-br'

/**
 * Peças compartilhadas entre a tabela (desktop) e os cartões (mobile) da
 * listagem de unidades. Server Components — nada aqui tem interatividade.
 *
 * Ficam juntas de propósito: são fragmentos de uma linha, e separá-las em
 * arquivos de dez linhas cada só espalharia a mesma decisão de exibição.
 */

const COPY = ADMIN.units

/**
 * Situação nunca depende só de cor (Princípio 5): a variante muda o peso
 * visual, mas o texto do rótulo é que carrega o significado.
 */
const STATUS_VARIANT: Record<
  AdminUnitStatusValue,
  'default' | 'secondary' | 'outline'
> = {
  ACTIVE: 'default',
  PENDING: 'secondary',
  INACTIVE: 'outline',
}

export function AdminUnitStatusBadge({
  status,
}: {
  status: AdminUnitStatusValue
}) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {getAdminUnitStatusLabel(status)}
    </Badge>
  )
}

export function AdminUnitTypeBadge({
  type,
}: {
  type: AdminUnitListItem['type']
}) {
  return <Badge variant="outline">{getAdminUnitTypeLabel(type)}</Badge>
}

/**
 * Indicadores de canal de contato. Mostra **se** existe telefone/WhatsApp, não
 * o número: na lista o que importa operacionalmente é qual unidade ainda está
 * sem canal — o WhatsApp é a via de conversão do produto.
 */
export function AdminUnitContact({
  hasPhone,
  hasWhatsapp,
}: {
  hasPhone: boolean
  hasWhatsapp: boolean
}) {
  if (!hasPhone && !hasWhatsapp) {
    return <span className="text-muted-foreground">{COPY.contact.none}</span>
  }

  return (
    <ul className="space-y-0.5">
      {hasWhatsapp ? <li>{COPY.contact.whatsapp}</li> : null}
      {hasPhone ? <li>{COPY.contact.phone}</li> : null}
    </ul>
  )
}

/**
 * Ações da linha. Só "Editar" é ação primária — uma ação não justifica menu de
 * três pontinhos. O link para a página pública aparece **apenas em unidades
 * ativas**: `/banco-de-leite/[slug]` chama `notFound()` para PENDING/INACTIVE
 * (regra da 3.6), então oferecê-lo nas outras levaria o admin a um 404.
 */
export function AdminUnitActions({ unit }: { unit: AdminUnitListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Button asChild variant="outline" size="sm">
        <Link
          href={`/admin/unidades/${unit.id}/editar`}
          aria-label={COPY.table.editAria.replace('{unitName}', unit.name)}
        >
          {COPY.table.edit}
        </Link>
      </Button>

      {unit.status === 'ACTIVE' ? (
        <Link
          href={`/banco-de-leite/${unit.slug}`}
          target="_blank"
          rel="noreferrer"
          aria-label={COPY.table.publicPageAria.replace(
            '{unitName}',
            unit.name,
          )}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm text-xs underline underline-offset-4 outline-none focus-visible:ring-[3px]"
        >
          {COPY.table.publicPage}
        </Link>
      ) : null}
    </div>
  )
}
