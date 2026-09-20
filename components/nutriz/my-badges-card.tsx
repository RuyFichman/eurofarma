import { Award, ChevronDown, Droplet, Flag, Heart, Share2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  getNutrizBadges,
  type NutrizBadgeId,
  type NutrizBadgeState,
} from '@/lib/journey/badges'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'

const BADGE_ICON: Record<NutrizBadgeId, LucideIcon> = {
  FIRST_STEP: Flag,
  LIFE_GIFT: Heart,
  GENEROUS_HEART: Heart,
  STEADY_SOURCE: Droplet,
  CHAIN_OF_GOOD: Share2,
}

/**
 * O coração da primeira doação fica cheio quando o selo é conquistado — é o
 * que separa os dois corações da lista. Selo pendente mantém o traço vazado.
 */
const BADGE_ICON_FILLED: Partial<Record<NutrizBadgeId, true>> = {
  LIFE_GIFT: true,
}

const COPY = NUTRIZ_AUTH.area.personal.highlights.badges

function BadgeTile({ badge }: { badge: NutrizBadgeState }) {
  const Icon = BADGE_ICON[badge.id]
  const item = COPY.items[badge.id]

  return (
    <li
      className={
        badge.achieved
          ? 'border-achievement/45 from-card to-achievement-soft flex flex-col items-center rounded-xl border bg-gradient-to-b p-4 text-center'
          : 'border-border bg-muted/20 flex flex-col items-center rounded-xl border p-4 text-center'
      }
    >
      <span
        className={
          badge.achieved
            ? 'bg-achievement text-achievement-foreground flex size-12 items-center justify-center rounded-full'
            : 'bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full'
        }
        aria-hidden="true"
      >
        <Icon
          className={
            badge.achieved && BADGE_ICON_FILLED[badge.id]
              ? 'size-5 fill-current'
              : 'size-5'
          }
        />
      </span>

      <p
        className={
          badge.achieved
            ? 'mt-3 text-sm font-semibold'
            : 'text-muted-foreground mt-3 text-sm font-semibold'
        }
      >
        {item.title}
      </p>
      <p className="text-muted-foreground mt-1 text-xs leading-5">
        {item.description}
      </p>

      <div className="mt-auto w-full pt-3">
        {badge.achieved ? (
          <span className="border-achievement/45 text-achievement-soft-foreground bg-card inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
            {/*
              "Corrente do bem" não tem data: ela seria o dia do cadastro de
              outra pessoa, e o RF15 atribui a indicação sem expor dados de
              quem foi indicada.
            */}
            {badge.achievedAt
              ? COPY.achievedOn.replace(
                  '{date}',
                  formatShortDate(badge.achievedAt),
                )
              : COPY.achieved}
          </span>
        ) : (
          <>
            {badge.progress ? (
              <span
                className="bg-muted flex h-1.5 w-full overflow-hidden rounded-full"
                aria-hidden="true"
              >
                <span
                  className="bg-muted-foreground/45 h-full rounded-full"
                  style={{
                    width: `${(badge.progress.done / badge.progress.target) * 100}%`,
                  }}
                />
              </span>
            ) : null}
            <p className="text-muted-foreground mt-2 text-xs">
              {badge.progress
                ? COPY.donationProgress
                    .replace('{done}', String(badge.progress.done))
                    .replace('{target}', String(badge.progress.target))
                : COPY.pending}
            </p>
          </>
        )}
      </div>
    </li>
  )
}

/**
 * "Meus selos" é um disclosure nativo (`details`/`summary`, sem Client
 * Component), no mesmo padrão de "Minha jornada". Fechado, mostra só a última
 * conquista; aberto, lista os cinco selos com data, progresso ou pendência.
 *
 * O estado conquistado aparece em texto, não apenas no dourado: a cor é
 * reforço visual, nunca a única informação.
 */
export function MyBadgesCard({
  registeredAt,
  donationDates,
  hasReferredSignup,
}: {
  registeredAt: Date
  donationDates: readonly Date[]
  hasReferredSignup: boolean
}) {
  const badges = getNutrizBadges({
    registeredAt,
    donationDates,
    hasReferredSignup,
  })
  const achieved = badges.filter((badge) => badge.achieved)
  const latest = achieved.at(-1)
  const progressPercent = (achieved.length / badges.length) * 100

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
                <h3 className="font-semibold">{COPY.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6 group-open/badges:hidden">
                  {latest
                    ? COPY.description.replace(
                        '{title}',
                        COPY.items[latest.id].title,
                      )
                    : COPY.empty}
                </p>
              </div>
            </div>
            <span className="text-primary mt-1 inline-flex shrink-0 items-center gap-1 text-sm font-medium">
              <span className="group-open/badges:hidden">
                {COPY.expandAction}
              </span>
              <span className="hidden group-open/badges:inline">
                {COPY.collapseAction}
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
                {COPY.subtitle}
              </p>
              <div className="text-muted-foreground flex shrink-0 items-center gap-2 text-xs leading-4">
                {/* Anel de progresso em CSS puro: os tokens vêm do tema. */}
                <span
                  className="flex size-11 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--primary) ${progressPercent}%, var(--secondary) 0)`,
                  }}
                >
                  <span className="bg-card text-primary flex size-8 items-center justify-center rounded-full text-xs font-semibold">
                    {achieved.length}/{badges.length}
                  </span>
                </span>
                {COPY.progressLabel}
              </div>
            </div>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {badges.map((badge) => (
                <BadgeTile key={badge.id} badge={badge} />
              ))}
            </ul>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
