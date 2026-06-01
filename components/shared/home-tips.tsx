import { Droplet, ShieldCheck, Snowflake } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HOME } from '@/lib/i18n/pt-br'

const ICONS = [Droplet, Snowflake, ShieldCheck]

export function HomeTips() {
  const { tips } = HOME

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
        <Badge variant="secondary">{tips.eyebrow}</Badge>
        <h2>{tips.title}</h2>
        <p className="text-muted-foreground">{tips.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tips.items.map((tip, index) => {
          const Icon = ICONS[index] ?? Droplet
          return (
            <Card key={tip.title}>
              <CardHeader>
                <span className="bg-accent text-accent-foreground mb-2 flex size-11 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <Badge variant="outline" className="w-fit">
                  {tip.tag}
                </Badge>
                <CardTitle className="mt-1">{tip.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-6">
                  {tip.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
