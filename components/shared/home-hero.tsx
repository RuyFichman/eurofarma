import Link from 'next/link'
import { ArrowRight, Droplet, Heart, MapPin } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HOME } from '@/lib/i18n/pt-br'

export function HomeHero() {
  const { hero } = HOME

  return (
    <section className="from-secondary/50 to-background bg-gradient-to-b">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        {/* Coluna de texto */}
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit gap-1.5">
            <Droplet aria-hidden="true" />
            {hero.badge}
          </Badge>

          <h1>
            {hero.titleLead}{' '}
            <span className="text-primary">{hero.titleHighlight}</span>{' '}
            {hero.titleTail}
          </h1>

          <p className="text-muted-foreground max-w-prose text-lg">
            {hero.description}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={hero.primaryCta.href}>
                <MapPin aria-hidden="true" />
                {hero.primaryCta.label}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
            {hero.trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  className="bg-chart-2 size-2 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna visual — placeholder até foto licenciada (mesma convenção do logo) */}
        <div className="relative">
          <div
            role="img"
            aria-label={hero.imageAlt}
            className="from-accent to-secondary flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg"
          >
            <Heart className="text-primary/25 size-24" aria-hidden="true" />
          </div>
          <div className="bg-card absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl border p-4 shadow-md">
            <span className="bg-secondary text-secondary-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
              <Heart className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg leading-none font-bold">
                {hero.highlight.value}
              </p>
              <p className="text-muted-foreground text-xs">
                {hero.highlight.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
