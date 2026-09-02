import { Droplet } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ABOUT } from '@/lib/i18n/pt-br'

export function AboutHero() {
  const { hero } = ABOUT

  return (
    <section
      aria-labelledby="about-hero-title"
      className="relative isolate overflow-hidden border-b"
    >
      <div
        aria-hidden="true"
        className="from-secondary/65 via-background to-background absolute inset-0 -z-20 bg-gradient-to-br"
      />
      <div
        aria-hidden="true"
        className="bg-accent/45 absolute -top-36 -right-32 -z-10 size-[30rem] rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="border-primary/10 absolute top-20 -left-24 -z-10 size-72 rounded-full border-[4rem]"
      />

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-20 lg:pt-28">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end lg:gap-16">
          <div>
            <Badge variant="secondary" className="gap-1.5 py-1">
              <Droplet aria-hidden="true" />
              {hero.eyebrow}
            </Badge>
            <h1
              id="about-hero-title"
              className="mt-6 max-w-4xl text-4xl leading-[1.06] tracking-[-0.04em] text-balance md:text-6xl lg:text-[4rem]"
            >
              {hero.title}
            </h1>
          </div>

          <p className="text-muted-foreground max-w-xl text-lg text-pretty lg:border-l lg:pl-8 lg:text-xl">
            {hero.description}
          </p>
        </div>

        <div className="mt-14 border-y md:mt-20">
          <h2 className="sr-only">{hero.impactLabel}</h2>
          <dl className="grid sm:grid-cols-3 sm:divide-x">
            {hero.impact.map((item) => (
              <div
                key={item.label}
                className="flex flex-col-reverse gap-1 border-b py-6 last:border-b-0 sm:border-b-0 sm:px-8 sm:first:pl-0 sm:last:pr-0"
              >
                <dt className="text-muted-foreground text-sm">{item.label}</dt>
                <dd className="text-primary text-3xl font-semibold tracking-tight md:text-4xl">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
