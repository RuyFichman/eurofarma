import { Building2, Check } from 'lucide-react'

import { ABOUT } from '@/lib/i18n/pt-br'

export function AboutJourney() {
  const { timeline, partners } = ABOUT

  return (
    <section className="bg-card/50 border-y">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] md:gap-12">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              {timeline.eyebrow}
            </p>
            <h2
              id="about-timeline-title"
              className="mt-3 text-balance md:text-4xl"
            >
              {timeline.title}
            </h2>
          </div>
          <p className="text-muted-foreground text-pretty md:border-l md:pl-8">
            {timeline.description}
          </p>
        </div>

        {/* TODO: validar datas e textos com Eurofarma. */}
        <ol
          aria-labelledby="about-timeline-title"
          className="bg-background mt-10 overflow-hidden rounded-[2rem] border shadow-sm md:mt-14 md:grid md:grid-cols-5"
        >
          {timeline.milestones.map((milestone, index) => (
            <li
              key={milestone.year}
              className={`relative border-b p-6 last:border-b-0 md:min-h-52 md:border-r md:border-b-0 md:p-7 md:last:border-r-0 ${
                index === timeline.milestones.length - 1
                  ? 'bg-secondary/50'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3 md:block">
                <span
                  aria-hidden="true"
                  className="bg-primary ring-background block size-2.5 shrink-0 rounded-full ring-4 md:mb-8"
                />
                <p className="text-primary text-sm font-semibold tracking-wide">
                  {milestone.year}
                </p>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-6 text-pretty md:mt-4">
                {milestone.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-8 border-t pt-12 md:mt-20 md:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] md:gap-16 md:pt-16">
          <div>
            <div className="bg-secondary text-primary flex size-11 items-center justify-center rounded-2xl">
              <Building2 className="size-5" aria-hidden="true" />
            </div>
            <p className="text-primary mt-6 text-xs font-semibold tracking-[0.16em] uppercase">
              {partners.eyebrow}
            </p>
            <h2 id="about-partners-title" className="mt-3 text-balance">
              {partners.title}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-pretty">
              {partners.description}
            </p>
          </div>

          {/* TODO: substituir por logos quando aprovados pelos parceiros. */}
          <ul
            aria-labelledby="about-partners-title"
            className="grid self-end overflow-hidden rounded-2xl border sm:grid-cols-2"
          >
            {partners.items.map((name) => (
              <li
                key={name}
                className="bg-background flex min-h-24 items-center gap-3 border-b p-5 last:border-b-0 sm:border-r sm:nth-[2n]:border-r-0 sm:nth-last-[-n+2]:border-b-0"
              >
                <span className="bg-secondary text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-4" aria-hidden="true" />
                </span>
                <span className="font-medium">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
