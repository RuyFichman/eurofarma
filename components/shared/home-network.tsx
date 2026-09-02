import Link from 'next/link'
import {
  ArrowUpRight,
  Building2,
  Check,
  HeartHandshake,
  Link2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { HOME } from '@/lib/i18n/pt-br'

const ICONS = [HeartHandshake, Building2]

/**
 * "Quem faz parte do NutriLink" — Server Component.
 *
 * Um único painel apresenta as duas pontas da rede e explicita visualmente a
 * conexão entre elas. A composição evita cards soltos e dá mais hierarquia ao
 * conteúdo sem transformar a seção em outro hero.
 */
export function HomeNetwork() {
  const { network } = HOME

  return (
    <section
      aria-labelledby="home-network-title"
      className="bg-card/40 relative overflow-hidden border-y"
    >
      <div
        className="bg-secondary/35 pointer-events-none absolute -top-24 right-0 size-72 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-end gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] md:gap-12">
          <div className="space-y-4">
            <Badge variant="secondary">{network.eyebrow}</Badge>
            <h2
              id="home-network-title"
              className="max-w-xl text-balance md:text-4xl"
            >
              {network.title}
            </h2>
          </div>
          <p className="text-muted-foreground text-pretty md:border-l md:pl-8">
            {network.subtitle}
          </p>
        </div>

        <div className="bg-card relative mt-10 overflow-hidden rounded-[2rem] border shadow-sm md:mt-14">
          <div
            className="from-primary/25 via-primary to-accent absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
            aria-hidden="true"
          />

          <div className="grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            {network.cards.map((card, index) => {
              const Icon = ICONS[index] ?? HeartHandshake
              const isNutriLink = index === 0

              return (
                <div key={card.title} className="contents">
                  {index > 0 && (
                    <div
                      className="bg-border relative h-px lg:h-auto lg:w-px"
                      aria-hidden="true"
                    >
                      <span className="bg-background text-primary absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm">
                        <Link2 className="size-4" />
                      </span>
                    </div>
                  )}

                  <article
                    className={`flex min-h-full flex-col p-6 sm:p-8 lg:p-10 ${
                      isNutriLink ? '' : 'bg-secondary/15'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <span
                        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                          isNutriLink
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span
                        className="text-muted-foreground/35 text-sm font-semibold tracking-[0.2em]"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="mt-7 max-w-md text-xl leading-snug text-balance md:text-2xl">
                      {card.title}
                    </h3>

                    <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-6 text-pretty">
                      {card.description}
                    </p>

                    <ul className="mt-7 grid gap-3 border-t pt-6">
                      {card.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm leading-6"
                        >
                          <span className="bg-secondary text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      <Link
                        href={card.cta.href}
                        className="text-primary focus-visible:ring-ring/50 border-primary/20 hover:bg-secondary inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]"
                      >
                        {card.cta.label}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
