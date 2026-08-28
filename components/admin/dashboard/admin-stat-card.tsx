import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { formatCount } from '@/lib/utils/format-number'

type AdminStatCardProps = {
  /** Nome do indicador. Vira o `<dt>` do par nome/valor. */
  label: string
  value: number
  /**
   * Linha de contexto abaixo do número. Quem compõe o cartão escolhe entre o
   * texto normal e o de estado vazio — um "0" sozinho parece bug, então todo
   * indicador zerado explica o porquê (spec 5.5, §3).
   */
  description: string
  icon: LucideIcon
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
}: AdminStatCardProps) {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
          {/* Decorativo: o rótulo textual já carrega todo o significado. */}
          <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
        </div>

        <dd className="space-y-1">
          {/* `tabular-nums` alinha os dígitos entre cartões vizinhos. */}
          <p className="text-foreground text-3xl font-semibold tabular-nums">
            {formatCount(value)}
          </p>
          <p className="text-muted-foreground text-sm text-pretty">
            {description}
          </p>
        </dd>
      </CardContent>
    </Card>
  )
}
