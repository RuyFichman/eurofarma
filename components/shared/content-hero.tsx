'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Clock, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { CONTENT } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

type ContentFilter = (typeof CONTENT.hero.filters)[number]

export function ContentHero() {
  const { hero } = CONTENT
  const [activeFilter, setActiveFilter] = useState<ContentFilter | null>(null)

  const visibleArticles = activeFilter
    ? hero.articles.filter(
        (article) =>
          activeFilter === 'Todos' || article.category === activeFilter,
      )
    : []

  function toggleFilter(filter: ContentFilter) {
    setActiveFilter((current) => (current === filter ? null : filter))
  }

  return (
    <section className="bg-primary text-primary-foreground relative isolate overflow-hidden">
      <Image
        src="/images/como-funciona-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className="scale-105 object-cover opacity-75 blur-[3px]"
      />
      <div
        aria-hidden="true"
        className="from-primary/80 via-primary/65 to-chart-3/75 absolute inset-0 bg-gradient-to-b"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1>
            {hero.titleLead}{' '}
            <span className="text-secondary block sm:inline">
              {hero.titleHighlight}
            </span>
          </h1>

          <p className="text-primary-foreground/85 mx-auto mt-4 max-w-xl text-lg">
            {hero.description}
          </p>

          {/* Campo deliberadamente visual nesta etapa: aceita texto, mas ainda
              não filtra o acervo. */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              aria-label={hero.searchLabel}
              placeholder={hero.searchPlaceholder}
              className="bg-card text-foreground h-14 rounded-full pl-12 text-base shadow-md hover:cursor-pointer focus:cursor-text"
            />
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {hero.filters.map((filter) => {
              const isActive = activeFilter === filter

              return (
                <li key={filter}>
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls="hero-category-articles"
                    onClick={() => toggleFilter(filter)}
                    className={cn(
                      'focus-visible:ring-ring/50 inline-flex cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors outline-none hover:bg-white/25 focus-visible:ring-[3px]',
                      isActive
                        ? 'bg-card text-primary hover:bg-card/90'
                        : 'text-primary-foreground bg-white/15',
                    )}
                  >
                    {filter}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div
          id="hero-category-articles"
          className={cn(
            'grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out',
            activeFilter
              ? 'mt-8 grid-rows-[1fr] opacity-100'
              : 'mt-0 grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <div
              aria-live="polite"
              className="grid gap-3 text-left md:grid-cols-2"
            >
              {visibleArticles.map((article) => (
                <article
                  key={article.title}
                  className="bg-card/95 text-foreground group rounded-2xl border border-white/30 p-4 shadow-lg backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 sm:p-5"
                >
                  <div className="min-w-0">
                    <span className="bg-secondary/70 text-primary inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide uppercase">
                      {article.category}
                    </span>
                    <h2 className="mt-2 text-base leading-snug font-semibold sm:text-lg">
                      {article.title}
                    </h2>
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-5">
                      {article.summary}
                    </p>

                    <div className="border-border mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {article.readTime}
                      </span>
                      <Link
                        href={article.href}
                        className="text-primary focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-[3px]"
                      >
                        Ver conteúdo
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
