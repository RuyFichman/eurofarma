import Link from 'next/link'
import { Check, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import type { NutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatLongDate } from '@/lib/utils/format-date'

/**
 * Cada doação vem de uma transição registrada pela equipe do Lactare. A área
 * pessoal apenas lê esse histórico categórico: ela não confirma coleta nem
 * deduz doação a partir dos registros pessoais de extração.
 */
const DONATION_STATUSES = ['DONATION_CONFIRMED', 'RECURRING_DONATION_ELIGIBLE']

export function DonationHistoryCard({
  snapshot,
  wellbeingEntries,
}: {
  snapshot: NutrizJourneySnapshot
  wellbeingEntries: NutrizPersonalAreaData['wellbeingEntries']
}) {
  const copy = NUTRIZ_AUTH.area.personal.donations
  const wellbeingCopy = NUTRIZ_AUTH.area.personal.wellbeing

  const donations = snapshot.journeyHistory
    .filter((entry) => DONATION_STATUSES.includes(entry.toStatus))
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{copy.title}</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/meu-agendamento/historico">
              <Download aria-hidden="true" />
              {copy.exportAction}
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm leading-6">
          {copy.description}
        </p>
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <p className="text-muted-foreground text-sm">{copy.empty}</p>
        ) : (
          <ul className="space-y-3">
            {donations.map((donation, index) => {
              const previous = donations[index + 1]
              const wellbeing = wellbeingEntries.find(
                (entry) =>
                  entry.recordedAt >= donation.changedAt &&
                  (!previous || entry.recordedAt > previous.changedAt),
              )

              return (
                <li
                  key={donation.id}
                  className="flex items-center justify-between gap-4 rounded-xl border p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="bg-secondary text-primary flex size-9 shrink-0 items-center justify-center rounded-full"
                      aria-hidden="true"
                    >
                      <Check className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{copy.itemTitle}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatLongDate(donation.changedAt)}
                      </p>
                    </div>
                  </div>
                  {wellbeing ? (
                    <span className="text-muted-foreground rounded-full border px-3 py-1 text-xs">
                      {copy.wellbeingTag.replace(
                        '{feeling}',
                        wellbeingCopy.choices[wellbeing.feeling],
                      )}
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
        <p className="text-muted-foreground mt-4 text-xs leading-5">
          {copy.hint}
        </p>
      </CardContent>
    </Card>
  )
}
