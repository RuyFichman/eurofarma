import type { PublicNetworkStats } from '@/lib/db/queries/units'
import { HOME } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = HOME.stats

type HomeStatsProps = {
  /** `null` quando a consulta falha — cai nos valores de fallback da copy. */
  stats: PublicNetworkStats | null
}

/**
 * Faixa de números da rede — Server Component.
 *
 * Sobe sobre o hero (`-mt-10`) em vez de virar mais uma seção empilhada: a
 * faixa costura as duas primeiras dobras e evita o ritmo "bloco centralizado"
 * que se repete no resto da página.
 *
 * Os dois primeiros números **vêm do banco**. Redondo e inventado ("220+") é o
 * que faz uma landing parecer falsa, e desde a carga da rBLH não precisamos
 * mais disso.
 */
export function HomeStats({ stats }: HomeStatsProps) {
  const items = [
    {
      value: stats ? formatCount(stats.activeUnits) : COPY.units.fallback,
      label: COPY.units.label,
    },
    {
      value: stats ? formatCount(stats.statesCovered) : COPY.states.fallback,
      label: COPY.states.label,
    },
    { value: COPY.donors.value, label: COPY.donors.label },
    { value: COPY.babies.value, label: COPY.babies.label },
  ]

  return (
    <section
      aria-labelledby="home-stats-title"
      className="relative z-10 mx-auto max-w-6xl px-6"
    >
      <h2 id="home-stats-title" className="sr-only">
        {COPY.title}
      </h2>

      <dl className="bg-card divide-border -mt-10 grid grid-cols-2 divide-x divide-y rounded-3xl border shadow-md md:-mt-14 md:grid-cols-4 md:divide-y-0">
        {items.map((item) => (
          // `flex-col-reverse`: o número aparece primeiro, mas no DOM o rótulo
          // (`dt`) vem antes do valor (`dd`), como a lista de definição exige.
          <div
            key={item.label}
            className="flex flex-col-reverse items-center gap-1 px-4 py-7 text-center md:px-6 md:py-8"
          >
            <dt className="text-muted-foreground text-sm text-balance">
              {item.label}
            </dt>
            <dd className="text-primary text-3xl font-bold tabular-nums md:text-4xl">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-muted-foreground mt-4 text-center text-xs text-pretty">
        {COPY.sourceNote}
      </p>
    </section>
  )
}
