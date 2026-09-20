import Link from 'next/link'
import {
  ArrowRight,
  Baby,
  Clock,
  Droplet,
  FileText,
  Hand,
  Lightbulb,
  ShieldCheck,
  Thermometer,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CONTENT } from '@/lib/i18n/pt-br'

const ICONS = [Droplet, Thermometer, Baby, Hand, Lightbulb, ShieldCheck]

export function ContentGuides() {
  const { practice } = CONTENT

  return (
    <section
      id="amamentacao-na-pratica"
      className="mx-auto max-w-6xl px-6 py-16 md:py-20"
    >
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-primary text-xs font-medium tracking-[0.24em] uppercase">
          {practice.eyebrow}
        </p>
        <h2 className="text-foreground mt-5 text-3xl font-semibold tracking-[-0.03em] text-balance md:text-4xl">
          {practice.title}
        </h2>
      </header>

      <div className="bg-border mt-10 grid gap-px overflow-hidden rounded-[2rem] border shadow-sm md:grid-cols-2 lg:grid-cols-3">
        {practice.cards.map((card, index) => {
          const Icon = ICONS[index] ?? Droplet
          return (
            <article
              key={card.title}
              className="group bg-card hover:bg-secondary/35 relative isolate flex min-h-80 flex-col overflow-hidden p-6 transition-colors duration-300 md:p-7"
            >
              <span
                className="bg-secondary/60 absolute -top-14 -right-14 -z-10 size-40 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125"
                aria-hidden="true"
              />
              <span
                className="text-primary/8 absolute top-3 right-5 -z-10 font-mono text-7xl font-semibold tracking-tighter select-none"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="flex items-start justify-between gap-4">
                <span className="bg-secondary text-primary ring-card flex size-12 items-center justify-center rounded-2xl ring-4 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <Badge
                  variant="outline"
                  className="text-primary border-primary/20 bg-white shadow-[0_6px_18px_-8px_rgba(58,122,184,0.45)]"
                >
                  {card.tag}
                </Badge>
              </div>

              <h3 className="text-foreground mt-7 max-w-[17rem] text-xl leading-snug font-semibold text-balance">
                {card.title}
              </h3>
              <p className="text-muted-foreground mt-4 flex-1 text-sm leading-6">
                {card.description}
              </p>

              <div className="border-border mt-6 flex items-center justify-between gap-4 border-t pt-5">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {card.readTime}
                </span>
                <Button
                  asChild
                  variant="link"
                  className="group/link h-auto px-0"
                >
                  <Link href={card.cta.href}>
                    <FileText aria-hidden="true" />
                    {card.cta.label}
                    <ArrowRight
                      className="transition-transform group-hover/link:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button asChild variant="link" className="group/link h-auto px-0">
          <Link href={practice.action.href}>
            {practice.action.label}
            <ArrowRight
              className="transition-transform group-hover/link:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </div>
    </section>
  )
}
