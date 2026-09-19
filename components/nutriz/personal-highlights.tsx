import Link from 'next/link'
import { Award, BookOpen, Share2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { NutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

function HighlightCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col">
        <span className="bg-secondary text-primary flex size-10 items-center justify-center rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {description}
        </p>
        <div className="mt-4">{children}</div>
      </CardContent>
    </Card>
  )
}

export function PersonalHighlights({
  recognitions,
}: {
  recognitions: NutrizPersonalAreaData['recognitions']
}) {
  const copy = NUTRIZ_AUTH.area.personal.highlights
  const recognitionCopy = NUTRIZ_AUTH.area.recognitions
  const latest = recognitions.at(-1)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <HighlightCard
        icon={Award}
        title={copy.badges.title}
        description={
          latest
            ? copy.badges.description.replace(
                '{title}',
                recognitionCopy.items[latest.kind].title,
              )
            : copy.badges.empty
        }
      >
        <Button asChild variant="outline" size="sm">
          <Link href="#seus-reconhecimentos">{copy.badges.action}</Link>
        </Button>
      </HighlightCard>

      {/*
        RF12 continua pendente: o cartão de impacto só existe depois de uma
        fonte legítima de confirmação. A ação fica visível e inativa em vez de
        prometer um download que o produto ainda não gera.
      */}
      <HighlightCard
        icon={Share2}
        title={copy.impactCard.title}
        description={copy.impactCard.description}
      >
        <Button variant="outline" size="sm" disabled>
          {copy.impactCard.action}
        </Button>
      </HighlightCard>

      <HighlightCard
        icon={BookOpen}
        title={copy.content.title}
        description={copy.content.description}
      >
        <Button asChild variant="outline" size="sm">
          <Link href={copy.content.href}>{copy.content.action}</Link>
        </Button>
      </HighlightCard>
    </div>
  )
}
