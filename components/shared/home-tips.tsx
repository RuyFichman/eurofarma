import { Droplet, ShieldCheck, Snowflake } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { HOME } from '@/lib/i18n/pt-br'

const ICONS = [Droplet, Snowflake, ShieldCheck]

/**
 * Dicas para a doação — Server Component.
 *
 * Faixa de fundo `muted` com bordas: separa a seção do resto sem depender só
 * de espaçamento, que era o que deixava tudo flutuando. Cada dica é numerada
 * (01, 02, 03) porque a sequência é real — extrair, armazenar, higienizar —
 * e o número ancora o card melhor do que mais um ícone dentro de um quadrado.
 */
export function HomeTips() {
  const { tips } = HOME

  return (
    <section className="bg-muted/50 border-y">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <Badge variant="secondary">{tips.eyebrow}</Badge>
          <h2 className="text-balance">{tips.title}</h2>
          <p className="text-muted-foreground text-pretty">{tips.subtitle}</p>
        </div>

        <ol className="grid gap-5 md:grid-cols-3">
          {tips.items.map((tip, index) => {
            const Icon = ICONS[index] ?? Droplet
            return (
              <li
                key={tip.title}
                className="bg-card flex flex-col rounded-2xl border p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-primary/25 text-4xl leading-none font-bold tabular-nums"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Icon
                    className="text-primary/60 size-6 shrink-0"
                    aria-hidden="true"
                  />
                </div>

                <Badge variant="outline" className="mt-5 w-fit">
                  {tip.tag}
                </Badge>

                <h3 className="mt-3 text-lg text-balance">{tip.title}</h3>

                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {tip.description}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
