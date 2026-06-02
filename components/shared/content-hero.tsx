import { BookOpen, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CONTENT } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

export function ContentHero() {
  const { hero } = CONTENT

  return (
    <section className="from-primary to-chart-3 text-primary-foreground bg-gradient-to-b">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        <Badge variant="secondary" className="gap-1.5">
          <BookOpen aria-hidden="true" />
          {hero.badge}
        </Badge>

        <h1 className="mt-6">
          {hero.titleLead}{' '}
          <span className="text-secondary block sm:inline">
            {hero.titleHighlight}
          </span>
        </h1>

        <p className="text-primary-foreground/85 mx-auto mt-4 max-w-xl text-lg">
          {hero.description}
        </p>

        {/* Busca presentational: sem store de conteúdo ainda (previsto p/ sprints 1.4/2.5). */}
        <div className="relative mx-auto mt-8 max-w-xl">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            disabled
            aria-label={hero.searchLabel}
            placeholder={hero.searchPlaceholder}
            className="bg-card text-foreground h-14 rounded-full pl-12 text-base shadow-md disabled:cursor-default disabled:opacity-100"
          />
        </div>

        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {hero.filters.map((filter, index) => (
            <li key={filter}>
              <span
                className={cn(
                  'inline-flex rounded-full px-4 py-1.5 text-sm font-medium',
                  index === 0
                    ? 'bg-card text-primary'
                    : 'text-primary-foreground bg-white/15',
                )}
              >
                {filter}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
