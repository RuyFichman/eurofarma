import { Check, Gift } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NutrizJourneySnapshot } from '@/lib/db/queries/nutriz-journey'
import type { NutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatLongDate } from '@/lib/utils/format-date'

/**
 * Cada doação vem de uma transição registrada pela equipe do Lactare. A área
 * pessoal apenas lê esse histórico categórico: ela não confirma coleta nem
 * deduz doação a partir dos registros pessoais de extração.
 *
 * Só `DONATION_CONFIRMED` é doação. `RECURRING_DONATION_ELIGIBLE` significa
 * aptidão registrada para continuar doando, e contá-lo aqui transformava uma
 * aptidão em coleta que talvez nunca tenha acontecido.
 */
const DONATION_STATUS = 'DONATION_CONFIRMED'

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
    .filter((entry) => entry.toStatus === DONATION_STATUS)
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">{copy.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
            <span
              className="bg-secondary text-primary flex size-11 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <Gift className="size-5" />
            </span>
            <p className="text-muted-foreground max-w-[26ch] text-sm leading-6">
              {copy.empty}
            </p>
          </div>
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
      </CardContent>
    </Card>
  )
}
