import { CheckCircle2, Info } from 'lucide-react'

import { ActionCenterQueueCard } from '@/components/admin/action-center/action-center-queue-card'
import { pluralizeCount } from '@/components/admin/action-center/format'
import { orderQueueSummaries } from '@/lib/admin/action-center/summary'
import type { ActionCenterOverview } from '@/lib/db/queries/admin-action-center'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.actionCenter

/**
 * "O que precisa de atenção hoje" — topo do dashboard. Server Component: as
 * filas com itens aparecem em cartões, da mais crítica para a menos crítica;
 * as vazias viram uma única linha de "em dia" para não ocupar espaço.
 *
 * Não responde aos filtros de segmentação do dashboard: o objetivo é mostrar
 * tudo o que precisa de ação, não um recorte.
 */
export function ActionCenterSection({
  overview,
}: {
  overview: ActionCenterOverview
}) {
  const { active, clear } = orderQueueSummaries(overview.summaries)

  return (
    <section aria-labelledby="action-center-title" className="space-y-4">
      <div className="space-y-1">
        <h2 id="action-center-title" className="text-lg font-semibold">
          {COPY.title}
        </h2>
        <p className="text-muted-foreground text-sm text-pretty">
          {COPY.description}
        </p>
      </div>

      {active.length > 0 ? (
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {active.map((summary) => (
            <li key={summary.key}>
              <ActionCenterQueueCard summary={summary} />
            </li>
          ))}
        </ol>
      ) : null}

      {clear.length > 0 ? (
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <CheckCircle2
            className="text-primary mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="text-pretty">
            {active.length === 0
              ? COPY.allClearEverything
              : COPY.allClear.replace(
                  '{queues}',
                  clear
                    .map((summary) => COPY.queues[summary.key].title)
                    .join('; '),
                )}
          </span>
        </p>
      ) : null}

      {overview.pendingOutboxCount > 0 ? (
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="text-pretty">
            {pluralizeCount(COPY.pendingOutbox, overview.pendingOutboxCount)}
          </span>
        </p>
      ) : null}

      <p className="text-muted-foreground text-xs text-pretty">
        {COPY.ownerNote}
      </p>
    </section>
  )
}
