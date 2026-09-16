import { Award } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'

type Recognition = NutrizPersonalAreaData['recognitions'][number]

export function NutrizRecognitionsCard({
  recognitions,
}: {
  recognitions: Recognition[]
}) {
  const copy = NUTRIZ_AUTH.area.recognitions

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="bg-secondary text-primary flex size-10 items-center justify-center rounded-xl">
            <Award className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {copy.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recognitions.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {recognitions.map((recognition) => {
              const item = copy.items[recognition.kind]
              return (
                <li
                  key={recognition.id}
                  className="bg-secondary/20 rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="outline">{copy.symbolic}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {item.description}
                  </p>
                  <time
                    dateTime={recognition.assignedAt.toISOString()}
                    className="text-muted-foreground mt-3 block text-xs"
                  >
                    {copy.assignedAt.replace(
                      '{date}',
                      formatShortDate(recognition.assignedAt),
                    )}
                  </time>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm leading-6">
            {copy.empty}
          </p>
        )}
        <p className="text-muted-foreground mt-4 text-xs leading-5">
          {copy.safetyNotice}
        </p>
      </CardContent>
    </Card>
  )
}
