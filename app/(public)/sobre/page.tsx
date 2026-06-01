import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ABOUT } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: 'Sobre o Lactare',
  description:
    'Conheça a história do Lactare, programa de doação de leite humano que já mobilizou mais de 12 mil doadoras no Brasil.',
}

export default function AboutPage() {
  const { hero, history, mission, timeline, partners, finalCta } = ABOUT

  return (
    <>
      <div className="mx-auto max-w-4xl px-4">
        {/* 1. Hero curto */}
        <section className="py-12 md:py-20">
          <h1>{hero.title}</h1>
          <p className="text-muted-foreground mt-4 text-xl">
            {hero.description}
          </p>
        </section>

        {/* 2. Nossa história */}
        <section className="py-12 md:py-20">
          <h2>{history.title}</h2>
          <div className="mt-6 space-y-4 leading-relaxed">
            {history.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* 3. Missão */}
        <section className="py-12 md:py-20">
          <h2>{mission.title}</h2>
          <Card className="border-l-primary bg-secondary/40 mt-6 border-l-4">
            <CardContent>
              <blockquote className="text-lg font-medium md:text-xl">
                “{mission.quote}”
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* 4. Linha do tempo */}
        <section className="py-12 md:py-20">
          <h2>{timeline.title}</h2>
          {/* TODO: validar datas e textos com Eurofarma */}
          <ol className="mt-8 space-y-6">
            {timeline.milestones.map((milestone) => (
              <li key={milestone.year} className="flex gap-4">
                <span
                  className="bg-primary mt-2 size-3 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-bold">{milestone.year}</p>
                  <p className="text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 5. Parcerias */}
        <section className="py-12 md:py-20">
          <h2>{partners.title}</h2>
          <p className="text-muted-foreground mt-4">{partners.description}</p>
          {/* TODO: substituir por logos quando aprovados pelos parceiros */}
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {partners.items.map((name) => (
              <li key={name}>
                <Card className="h-full items-center justify-center p-6 text-center">
                  <span className="font-medium">{name}</span>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 6. CTA final */}
      <section className="bg-accent">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center md:py-20">
          <h2>{finalCta.title}</h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-prose">
            {finalCta.description}
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href={finalCta.cta.href}>
              <MapPin aria-hidden="true" />
              {finalCta.cta.label}
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
