import Link from 'next/link'
import { ArrowRight, Award, Check, Heart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { HOME } from '@/lib/i18n/pt-br'

const ICONS = [Heart, Award]

/**
 * "Quem faz parte do Lactare" — Server Component.
 *
 * Cabeçalho **à esquerda**, cards à direita: é a seção que quebra o padrão
 * "eyebrow + título + subtítulo centralizados" que, repetido em toda dobra,
 * é o que dá cara de template a uma landing.
 */
export function HomeNetwork() {
  const { network } = HOME

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div className="space-y-4 lg:self-center">
          <Badge variant="secondary">{network.eyebrow}</Badge>
          <h2 className="text-balance">{network.title}</h2>
          <p className="text-muted-foreground text-pretty">
            {network.subtitle}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {network.cards.map((card, index) => {
            const Icon = ICONS[index] ?? Heart
            return (
              <article
                key={card.title}
                className="bg-card flex flex-col rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Ícone na mesma linha do título, não empilhado num quadrado
                    grande: o mesmo bloco se repetia em três seções. */}
                <div className="flex items-start gap-3">
                  <span className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg leading-snug text-balance">
                    {card.title}
                  </h3>
                </div>

                <p className="text-muted-foreground mt-4 text-sm leading-6">
                  {card.description}
                </p>

                <ul className="mt-5 space-y-2 border-t pt-5">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check
                        className="text-chart-2 mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href={card.cta.href}
                  className="text-primary focus-visible:ring-ring/50 mt-6 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-[3px]"
                >
                  {card.cta.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
