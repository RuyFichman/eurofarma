import { Badge } from '@/components/ui/badge'
import { HomeTipsCarousel } from '@/components/shared/home-tips-carousel'
import { HOME } from '@/lib/i18n/pt-br'

/** Dicas independentes de cuidado — Server Component. */
export function HomeTips() {
  const { tips } = HOME

  return (
    <section aria-labelledby="home-tips-title" className="bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 md:pt-24 md:pb-12">
        <div className="grid items-end gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] md:gap-12">
          <div className="space-y-4">
            <Badge variant="secondary">{tips.eyebrow}</Badge>
            <h2
              id="home-tips-title"
              className="max-w-xl text-balance md:text-4xl"
            >
              {tips.title}
            </h2>
          </div>
          <p className="text-muted-foreground text-pretty md:border-l md:pl-8">
            {tips.subtitle}
          </p>
        </div>

        <HomeTipsCarousel tips={tips.items} />
      </div>
    </section>
  )
}
