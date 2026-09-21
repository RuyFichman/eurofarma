import Link from 'next/link'
import { ChevronRight, Star } from 'lucide-react'

import { ContentSectionHeader } from '@/components/shared/content-section-header'
import { CONTENT } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

/**
 * Uma família de cor por assunto: elegibilidade em azul, mitos em verde,
 * segurança em lilás. Os tokens vivem em `globals.css` — é a única seção do
 * site fora da paleta azul, e continua sem cor hardcoded.
 *
 * O preenchimento chapado saiu: a cor agora é um véu no topo do cartão branco,
 * mais a barra de acento e o selo da categoria. O cartão passa a ter a mesma
 * gramática dos cartões de conteúdo do hero — selo, título, texto e uma ação
 * separada por divisória — em vez de três blocos pastel destoando do resto.
 */
const TOPICS = [
  {
    tint: 'from-topic-blue',
    bar: 'bg-topic-blue-foreground',
    accent: 'text-topic-blue-foreground',
    chip: 'bg-topic-blue text-topic-blue-foreground',
  },
  {
    tint: 'from-topic-green',
    bar: 'bg-topic-green-foreground',
    accent: 'text-topic-green-foreground',
    chip: 'bg-topic-green text-topic-green-foreground',
  },
  {
    tint: 'from-topic-lilac',
    bar: 'bg-topic-lilac-foreground',
    accent: 'text-topic-lilac-foreground',
    chip: 'bg-topic-lilac text-topic-lilac-foreground',
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
        align="center"
        titleClassName="text-3xl font-semibold tracking-[-0.03em] text-balance md:text-4xl"
      />

      <div className="mt-10 grid items-stretch gap-5 md:grid-cols-3 md:gap-6">
        {startHere.cards.map((card, index) => {
          const topic = TOPICS[index] ?? TOPICS[0]

          return (
            /* O cartão inteiro é o alvo do clique; a linha de ação é só o
               rótulo visível dela, para não aninhar dois links. */
            <Link
              key={card.title}
              href={card.cta.href}
              className="focus-visible:ring-ring/50 group flex rounded-2xl outline-none focus-visible:ring-[3px]"
            >
              <article className="bg-card border-border/70 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                <span
                  aria-hidden="true"
                  className={cn('h-1 w-full', topic.bar)}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute inset-x-0 top-1 h-28 bg-gradient-to-b to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-100',
                    topic.tint,
                  )}
                />

                <div className="relative flex h-full flex-col p-6">
                  <span
                    className={cn(
                      'inline-flex w-fit rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide uppercase',
                      topic.chip,
                    )}
                  >
                    {card.tag}
                  </span>

                  <h3 className="mt-4 text-lg font-semibold tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 mb-6 text-sm leading-6">
                    {card.description}
                  </p>

                  <span
                    className={cn(
                      'border-border/70 mt-auto flex items-center gap-1 border-t pt-4 text-sm font-semibold',
                      topic.accent,
                    )}
                  >
                    {card.cta.label}
                    <ChevronRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
