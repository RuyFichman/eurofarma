import { HeartHandshake, Quote } from 'lucide-react'

import { ABOUT } from '@/lib/i18n/pt-br'

export function AboutStory() {
  const { history, mission } = ABOUT

  return (
    <section
      aria-labelledby="about-history-title"
      className="mx-auto max-w-6xl px-6 py-16 md:py-24"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            {history.eyebrow}
          </p>
          <h2
            id="about-history-title"
            className="mt-3 max-w-sm text-balance md:text-4xl"
          >
            {history.title}
          </h2>
        </div>

        <div>
          <div className="space-y-6">
            {history.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? 'text-xl leading-8 font-medium text-pretty md:text-2xl md:leading-9'
                    : 'text-muted-foreground max-w-2xl text-base text-pretty md:text-lg'
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          <aside
            aria-labelledby="about-mission-title"
            className="bg-card relative mt-12 overflow-hidden rounded-[2rem] border p-7 shadow-sm sm:p-9 md:mt-16"
          >
            <div
              aria-hidden="true"
              className="from-primary via-primary to-accent absolute inset-y-0 left-0 w-1 bg-gradient-to-b"
            />
            <div className="flex items-start justify-between gap-6">
              <span className="bg-secondary text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
                <HeartHandshake className="size-6" aria-hidden="true" />
              </span>
              <Quote
                className="text-primary/15 size-10 shrink-0"
                aria-hidden="true"
              />
            </div>
            <p className="text-primary mt-7 text-xs font-semibold tracking-[0.16em] uppercase">
              {mission.eyebrow}
            </p>
            <h3 id="about-mission-title" className="mt-2">
              {mission.title}
            </h3>
            <blockquote className="mt-5 text-lg leading-8 font-medium text-pretty md:text-xl">
              {mission.quote}
            </blockquote>
          </aside>
        </div>
      </div>
    </section>
  )
}
