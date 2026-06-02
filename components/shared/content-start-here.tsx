import Link from 'next/link'
import { ArrowRight, Heart, Shield, Star, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentSectionHeader } from '@/components/shared/content-section-header'
import { CONTENT } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

const ICONS = [Users, Heart, Shield]
const TINTS = ['bg-secondary/40', 'bg-accent/30', 'bg-muted']

export function ContentStartHere() {
  const { startHere } = CONTENT

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <ContentSectionHeader
        icon={Star}
        eyebrow={startHere.eyebrow}
        title={startHere.title}
        description={startHere.description}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {startHere.cards.map((card, index) => {
          const Icon = ICONS[index] ?? Users
          const tint = TINTS[index] ?? 'bg-muted'
          return (
            <Card key={card.title} className={cn('h-full border-0', tint)}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span className="bg-card text-primary flex size-12 items-center justify-center rounded-xl shadow-sm">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <Badge variant="outline" className="bg-card/80">
                    {card.tag}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-6">
                  {card.description}
                </p>
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
    </section>
  )
}
