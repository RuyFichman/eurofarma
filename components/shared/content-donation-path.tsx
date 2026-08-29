import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  Droplets,
  Heart,
  MessageCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentSectionHeader } from '@/components/shared/content-section-header'
import { CONTENT } from '@/lib/i18n/pt-br'

const STEP_ICONS = [
  MessageCircle,
  ClipboardCheck,
  CalendarCheck,
  Droplets,
  Heart,
]

export function ContentDonationPath() {
  const { donationPath } = CONTENT
  const lastIndex = donationPath.steps.length - 1

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
      <ContentSectionHeader
        icon={ArrowRight}
        eyebrow={donationPath.eyebrow}
        title={donationPath.title}
        description={donationPath.description}
      />

      <ol className="mt-10 grid gap-8 md:mt-12 md:grid-cols-5 md:gap-4">
        {donationPath.steps.map((step, index) => {
          const Icon = STEP_ICONS[index] ?? MessageCircle
          return (
            <li
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              {index < lastIndex ? (
                <span
                  className="bg-border absolute top-5 left-[calc(50%+1.5rem)] hidden h-0.5 w-[calc(100%-3rem)] md:block"
                  aria-hidden="true"
                />
              ) : null}
              <span className="bg-primary text-primary-foreground relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-bold">
                {index + 1}
              </span>
              {/* `flex-1`: o `li` já estica com o grid, mas o cartão parava na
                  altura do próprio texto — daí as bases desalinhadas. */}
              <Card className="mt-6 flex w-full flex-1 flex-col gap-3 py-5">
                {/* `justify-items-center`, não `items-center`: o CardHeader é um
                    grid, e ali `items-*` alinha na vertical — era por isso que o
                    ícone ficava à esquerda com o título centralizado. */}
                <CardHeader className="justify-items-center px-5">
                  <span className="bg-secondary text-primary flex size-11 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="mt-2 text-center text-base">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                  <p className="text-muted-foreground text-sm leading-6">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
