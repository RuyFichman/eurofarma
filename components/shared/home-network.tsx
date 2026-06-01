import Link from 'next/link'
import { ArrowRight, Award, Check, Heart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HOME } from '@/lib/i18n/pt-br'

const ICONS = [Heart, Award]

export function HomeNetwork() {
  const { network } = HOME

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <Badge variant="secondary">{network.eyebrow}</Badge>
          <h2>{network.title}</h2>
          <p className="text-muted-foreground">{network.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {network.cards.map((card, index) => {
            const Icon = ICONS[index] ?? Heart
            return (
              <Card key={card.title} className="h-full">
                <CardHeader>
                  <span className="bg-secondary text-secondary-foreground mb-2 flex size-11 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-6">
                    {card.description}
                  </p>
                  <ul className="space-y-2">
                    {card.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check
                          className="text-chart-2 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="link" className="h-auto px-0">
                    <Link href={card.cta.href}>
                      {card.cta.label}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
