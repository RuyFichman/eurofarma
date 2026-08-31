import Link from 'next/link'
import { ChevronRight, Heart, Shield, Star, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentSectionHeader } from '@/components/shared/content-section-header'
import { CONTENT } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

/**
 * Uma família de cor por assunto, como no mockup: elegibilidade em azul,
 * mitos em verde, segurança em lilás. Os tokens vivem em `globals.css` — é a
 * única seção do site fora da paleta azul, e continua sem cor hardcoded.
 */
const TOPICS = [
  {
    icon: Users,
    surface: 'bg-topic-blue',
    accent: 'text-topic-blue-foreground',
  },
  {
    icon: Heart,
    surface: 'bg-topic-green',
    accent: 'text-topic-green-foreground',
  },
  {
    icon: Shield,
    surface: 'bg-topic-lilac',
    accent: 'text-topic-lilac-foreground',
  },
] as const

export function ContentStartHere() {
  const { startHere } = CONTENT

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <ContentSectionHeader
        icon={Star}
        eyebrow={startHere.eyebrow}
        title={startHere.title}
        description={startHere.description}
        descriptionPlacement="beside"
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {startHere.cards.map((card, index) => {
          const topic = TOPICS[index] ?? TOPICS[0]
          const Icon = topic.icon
          return (
            <Card
              key={card.title}
              className={cn('h-full border-0 shadow-sm', topic.surface)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'bg-card flex size-12 items-center justify-center rounded-xl shadow-sm',
                      topic.accent,
                    )}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'bg-card/80 border-transparent',
                      topic.accent,
                    )}
                  >
                    {card.tag}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{card.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-6">
                  {card.description}
                </p>
                {/* Link direto, não `Button variant="link"`: o mockup mostra um
                    link de texto com chevron, e o botão trazia altura e padding
                    que não existem ali. */}
                <Link
                  href={card.cta.href}
                  className={cn(
                    'focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-[3px]',
                    topic.accent,
                  )}
                >
                  {card.cta.label}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
