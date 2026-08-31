import type { ContactPreference } from '@prisma/client'

import { Badge } from '@/components/ui/badge'
import type { AdminNutrizStatusValue } from '@/lib/admin/nutrizes/filters'
import { getAdminNutrizStatusLabel } from '@/lib/admin/nutrizes/labels'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'

/**
 * Peças compartilhadas entre a tabela (desktop) e os cartões (mobile) da
 * listagem de nutrizes. Server Components — a única interatividade da tela mora
 * em `admin-nutriz-contact.tsx`.
 */

const COPY = ADMIN.nutrizes

/**
 * A variante muda o peso visual, mas o texto do rótulo é que carrega o
 * significado (Princípio 5). `DONATED` recebe o destaque padrão: é o desfecho
 * que a plataforma existe para produzir.
 */
const STATUS_VARIANT: Record<
  AdminNutrizStatusValue,
  'default' | 'secondary' | 'outline'
> = {
  DONATED: 'default',
  CONTACTED: 'secondary',
  INTERESTED: 'secondary',
  UNKNOWN: 'outline',
}

export function AdminNutrizStatusBadge({
  status,
}: {
  status: AdminNutrizStatusValue
}) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {getAdminNutrizStatusLabel(status)}
    </Badge>
  )
}

/**
 * Canal preferido de contato. `NONE` é o caso que mais importa: significa que a
 * pessoa pediu para **não** ser procurada, e precisa ficar legível antes de
 * alguém abrir uma conversa.
 */
export function AdminNutrizPreference({
  preference,
}: {
  preference: ContactPreference
}) {
  const label = COPY.contact.preference[preference]
  const isOptOut = preference === 'NONE'

  return (
    <span
      className={
        isOptOut
          ? 'text-destructive text-xs font-medium'
          : 'text-muted-foreground text-xs'
      }
    >
      {label}
    </span>
  )
}

/**
 * Estado do consentimento: quando a LGPD foi aceita e se há permissão para
 * campanha. Fica na listagem porque governa o que pode ser enviado — descobrir
 * isso só na hora do disparo é tarde.
 */
export function AdminNutrizConsent({
  lgpdConsentAt,
  marketingConsent,
}: {
  lgpdConsentAt: Date
  marketingConsent: boolean
}) {
  return (
    <span className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">
        {COPY.consent.lgpd.replace('{date}', formatShortDate(lgpdConsentAt))}
      </span>
      <span className="text-xs">
        {marketingConsent
          ? COPY.consent.marketingYes
          : COPY.consent.marketingNo}
      </span>
    </span>
  )
}
