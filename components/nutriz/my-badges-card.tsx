import {
  Award,
  BadgeCheck,
  ChevronDown,
  Flag,
  Heart,
  Package,
  Repeat2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { NutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import {
  RECOGNITION_KIND_ORDER,
  type RecognitionKindValue,
} from '@/lib/journey/recognitions'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'

const RECOGNITION_ICON: Record<RecognitionKindValue, LucideIcon> = {
  JOURNEY_STARTED: Flag,
  READY_FOR_DONATION: BadgeCheck,
  KIT_RECEIVED: Package,
  FIRST_DONATION: Heart,
  CONTINUITY_RECOGNIZED: Repeat2,
}

/**
 * "Meus selos" é um disclosure nativo (`details`/`summary`, sem Client
 * Component), no mesmo padrão de "Minha jornada". Fechado, mostra só a
 * última conquista; aberto, lista os cinco reconhecimentos possíveis com a
 * data de quem já foi alcançado. Não há barra de progresso por doações ou
 * indicações: cada selo aqui vem de um status categórico já registrado pelo
 * Lactare, sem contagem própria ainda implementada.
 */
export function MyBadgesCard({
  recognitions,
}: {
  recognitions: NutrizPersonalAreaData['recognitions']
}) {
  const copy = NUTRIZ_AUTH.area.personal.highlights.badges
  const itemsCopy = NUTRIZ_AUTH.area.recognitions.items
  const latest = recognitions.at(-1)
  const earnedAtByKind = new Map(
    recognitions.map((entry) => [entry.kind, entry.assignedAt]),
  )
  const earnedCount = recognitions.length
  const totalCount = RECOGNITION_KIND_ORDER.length

  return (
    <Card>
      <CardContent>
        <details className="group/badges">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <div className="flex items-start gap-3">
              <span className="bg-secondary text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Award className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{copy.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6 group-open/badges:hidden">
                  {latest
                    ? copy.description.replace(
                        '{title}',
                        itemsCopy[latest.kind].title,
                      )
                    : copy.empty}
                </p>
              </div>
            </div>
            <span className="text-primary mt-1 inline-flex shrink-0 items-center gap-1 text-sm font-medium">
              <span className="group-open/badges:hidden">
                {copy.expandAction}
              </span>
              <span className="hidden group-open/badges:inline">
                {copy.collapseAction}
              </span>
              <ChevronDown
                className="size-4 transition-transform group-open/badges:rotate-180"
                aria-hidden="true"
              />
            </span>
          </summary>

          <div className="mt-5 border-t pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm leading-6">
                {copy.subtitle}
              </p>
              <div className="text-muted-foreground flex shrink-0 items-center gap-2 text-xs">
                <span
                  className="border-primary/50 text-primary flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold"
                  aria-hidden="true"
                >
                  {earnedCount}/{totalCount}
                </span>
                {copy.progressLabel}
              </div>
            </div>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {RECOGNITION_KIND_ORDER.map((kind) => {
                const Icon = RECOGNITION_ICON[kind]
                const assignedAt = earnedAtByKind.get(kind)
                const item = itemsCopy[kind]

                return (
                  <li
                    key={kind}
                    className={
                      assignedAt
                        ? 'border-primary/30 bg-secondary/20 rounded-xl border p-4'
                        : 'border-border bg-muted/20 rounded-xl border p-4'
                    }
                  >
                    <span
                      className={
                        assignedAt
                          ? 'bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full'
                          : 'bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full'
                      }
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>
                    <p className="mt-3 text-sm font-semibold">{item.title}</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      {item.description}
                    </p>
                    <div className="mt-3">
                      {assignedAt ? (
                        <Badge variant="outline">
                          {copy.achievedOn.replace(
                            '{date}',
                            formatShortDate(assignedAt),
                          )}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {copy.pending}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
