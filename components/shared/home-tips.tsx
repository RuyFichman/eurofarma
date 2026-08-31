import { Droplet, ShieldCheck, Snowflake } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { HOME } from '@/lib/i18n/pt-br'

const ICONS = [Droplet, Snowflake, ShieldCheck]
const ICON_STYLES = [
  'bg-primary text-primary-foreground',
  'bg-secondary text-secondary-foreground',
  'bg-accent text-accent-foreground',
] as const

/**
 * Dicas para a doação — Server Component.
 *
 * As orientações vivem em um único painel, com divisores internos, em vez de
 * três cards concorrentes. Isso deixa a leitura mais calma e prepara a
 * transição para o CTA final, que compartilha o mesmo fundo da seção.
 */
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

        <ul className="bg-card divide-border mt-10 grid divide-y overflow-hidden rounded-[2rem] border shadow-sm md:mt-14 md:grid-cols-3 md:divide-x md:divide-y-0">
          {tips.items.map((tip, index) => {
            const Icon = ICONS[index] ?? Droplet
            const iconStyle = ICON_STYLES[index] ?? ICON_STYLES[0]

            return (
              <li
                key={tip.title}
                className="relative flex min-h-full flex-col p-6 sm:p-8"
              >
                <div className="flex items-start justify-between gap-6">
                  <span
                    className={`flex size-12 items-center justify-center rounded-2xl ${iconStyle}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span
                    className="text-muted-foreground/35 text-sm font-semibold tracking-[0.2em] tabular-nums"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <Badge variant="outline" className="mt-7 w-fit bg-transparent">
                  {tip.tag}
                </Badge>

                <h3 className="mt-4 text-xl leading-snug text-balance">
                  {tip.title}
                </h3>

                <p className="text-muted-foreground mt-3 text-sm leading-6 text-pretty">
                  {tip.description}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
