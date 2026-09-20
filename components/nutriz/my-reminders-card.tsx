import Link from 'next/link'
import { Bell, ChevronDown, CheckCircle2, Circle, Info } from 'lucide-react'

import { DisableReminderButton } from '@/components/nutriz/disable-reminder-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { NutrizReminderOverview } from '@/lib/db/queries/nutriz-reminders'
import { getReminderRows } from '@/lib/reminders/rows'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

const COPY = NUTRIZ_AUTH.area.reminders

function activeCountLabel(count: number): string {
  if (count === 0) return COPY.activeCountNone
  if (count === 1) return COPY.activeCountOne
  return COPY.activeCountOther.replace('{count}', String(count))
}

/**
 * "Meus lembretes" (20/09/2026) — substitui o card único de opt-in. Mesmo
 * padrão de disclosure nativo (`details`/`summary`, sem Client Component) de
 * `MyBadgesCard`/`NutrizJourneyProgress`. Cada tipo só aparece se houver dado
 * real que o autorize (ver `getReminderRows`); o botão "Desativar" é a única
 * parte interativa, isolada em `DisableReminderButton`.
 */
export function MyRemindersCard({
  overview,
}: {
  overview: NutrizReminderOverview
}) {
  const rows = getReminderRows(overview)
  const active = rows.filter((row) => row.enabled)
  const available = rows.filter((row) => !row.enabled)

  return (
    <Card>
      <CardContent>
        <details className="group/reminders">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <div className="flex items-start gap-3">
              <span className="bg-secondary text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Bell className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{COPY.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {COPY.subtitle}
                </p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-2">
              <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                {activeCountLabel(active.length)}
              </span>
              <ChevronDown
                className="text-muted-foreground size-4 transition-transform group-open/reminders:rotate-180"
                aria-hidden="true"
              />
            </span>
          </summary>

          <div className="mt-5 space-y-5 border-t pt-5">
            {active.length > 0 ? (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {COPY.activeSectionTitle}
                </p>
                <ul className="space-y-2">
                  {active.map((row) => (
                    <li
                      key={row.type}
                      className="border-achievement/45 from-card to-achievement-soft flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-b p-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2
                          className="text-achievement mt-0.5 size-5 shrink-0"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-semibold">{row.title}</p>
                          <p className="text-muted-foreground mt-1 text-xs leading-5">
                            {row.subtitle}
                          </p>
                        </div>
                      </div>
                      <DisableReminderButton type={row.type} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {available.length > 0 ? (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {COPY.availableSectionTitle}
                </p>
                <ul className="space-y-2">
                  {available.map((row) => (
                    <li
                      key={row.type}
                      className="border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Circle
                          className="text-muted-foreground mt-0.5 size-5 shrink-0"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-semibold">{row.title}</p>
                          <p className="text-muted-foreground mt-1 text-xs leading-5">
                            {row.subtitle}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <Link href={row.href}>{COPY.configureAction}</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="bg-muted/40 flex items-start gap-2 rounded-xl p-3">
              <Info
                className="text-muted-foreground mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-xs leading-5">
                {COPY.footerNote}
              </p>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
