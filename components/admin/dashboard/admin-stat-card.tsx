import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { formatCount } from '@/lib/utils/format-number'

const TONE_STYLES = {
  blue: {
    icon: 'bg-primary/10 text-primary',
    accent: 'bg-primary',
  },
  cyan: {
    icon: 'bg-chart-3/15 text-chart-1',
    accent: 'bg-chart-3',
  },
  teal: {
    icon: 'bg-chart-2/15 text-chart-2',
    accent: 'bg-chart-2',
  },
  amber: {
    icon: 'bg-chart-4/15 text-chart-4',
    accent: 'bg-chart-4',
  },
} as const

type AdminStatCardProps = {
  /** Nome do indicador. Vira o `<dt>` do par nome/valor. */
  label: string
  value: number | string
  /**
   * Linha de contexto abaixo do número. Quem compõe o cartão escolhe entre o
   * texto normal e o de estado vazio — um "0" sozinho parece bug, então todo
   * indicador zerado explica o porquê (spec 5.5, §3).
   */
  description: string
  icon: LucideIcon
  tone?: keyof typeof TONE_STYLES
  compact?: boolean
}

/**
 * Cartão de indicador do painel (Server Component — não há interatividade).
 *
 * Renderiza um par `<dt>`/`<dd>`, então **precisa estar dentro de um `<dl>`**
 * (ver `DashboardOverview`). A lista de definição é o que faz o leitor de tela
 * anunciar "Unidades ativas, 6" em vez de ler rótulo e número soltos.
 */
export function AdminStatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'blue',
  compact = false,
}: AdminStatCardProps) {
  const styles = TONE_STYLES[tone]

  return (
    <Card
      className={cn(
        'group relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md',
        compact ? 'min-h-40' : 'min-h-44',
      )}
    >
      <span
        className={cn('absolute inset-x-0 top-0 h-1', styles.accent)}
        aria-hidden
      />
      <CardContent
        className={cn('flex h-full flex-col', compact ? 'p-5' : 'p-6')}
      >
        <div className="flex items-start justify-between gap-3">
          <dt className="text-foreground text-sm font-medium">{label}</dt>
          {/* Decorativo: o rótulo textual já carrega todo o significado. */}
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg',
              styles.icon,
            )}
            aria-hidden
          >
            <Icon className="size-4" />
          </span>
        </div>

        <dd className="mt-auto space-y-1 pt-4">
          {/* `tabular-nums` alinha os dígitos entre cartões vizinhos. */}
          <p
            className={cn(
              'text-foreground font-semibold tracking-tight tabular-nums',
              compact ? 'text-3xl' : 'text-4xl',
            )}
          >
            {typeof value === 'number' ? formatCount(value) : value}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed text-pretty">
            {description}
          </p>
        </dd>
      </CardContent>
    </Card>
  )
}
