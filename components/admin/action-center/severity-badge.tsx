import { AlertTriangle, CircleAlert, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { ActionCenterSeverity } from '@/lib/admin/action-center/severity'
import { ADMIN } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

const COPY = ADMIN.actionCenter.severity

const SEVERITY_STYLE = {
  high: { icon: AlertTriangle, variant: 'destructive', className: '' },
  medium: {
    icon: CircleAlert,
    variant: 'outline',
    className: 'border-chart-4 bg-chart-4/15 text-foreground',
  },
  low: { icon: Clock, variant: 'outline', className: '' },
} as const

/**
 * Criticidade com ícone **e** texto: a cor nunca é o único sinal. O prefixo
 * "Criticidade" fica só para leitor de tela, para o rótulo não soar solto.
 */
export function SeverityBadge({
  severity,
}: {
  severity: ActionCenterSeverity
}) {
  const style = SEVERITY_STYLE[severity]
  const Icon = style.icon

  return (
    <Badge variant={style.variant} className={cn(style.className)}>
      <Icon aria-hidden="true" />
      <span className="sr-only">{COPY.label}: </span>
      {COPY[severity]}
    </Badge>
  )
}
