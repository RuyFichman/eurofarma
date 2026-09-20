import { Share2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MyBadgesCard } from '@/components/nutriz/my-badges-card'
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
  children?: React.ReactNode
}) {
  return (
    // Sem `h-full`: a altura vem do próprio conteúdo. Esticar este card até a
    // altura da linha deixaria um vazio enorme ao lado de "Meus selos" aberto.
    <Card>
      <CardContent className="flex flex-col">
        <span className="bg-secondary text-primary flex size-10 items-center justify-center rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {description}
        </p>
        {children ? <div className="mt-4">{children}</div> : null}
      </CardContent>
    </Card>
  )
}

export function PersonalHighlights({
  registeredAt,
  donationDates,
  hasReferredSignup,
}: {
  registeredAt: Date
  donationDates: readonly Date[]
  hasReferredSignup: boolean
}) {
  const copy = NUTRIZ_AUTH.area.personal.highlights

  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      <MyBadgesCard
        registeredAt={registeredAt}
        donationDates={donationDates}
        hasReferredSignup={hasReferredSignup}
      />

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
    </div>
  )
}
