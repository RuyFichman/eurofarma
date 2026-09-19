import type { PublicCoverageStats } from '@/lib/db/queries/service-municipalities'
import { HOME } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = HOME.stats

type HomeStatsProps = {
  /** `null` quando a consulta falha — cai nos valores de fallback da copy. */
  stats: PublicCoverageStats | null
}

/**
 * Faixa de números da rede — Server Component.
 *
 * Sobe sobre o hero (`-mt-10`) em vez de virar mais uma seção empilhada: a
 * faixa costura as duas primeiras dobras e evita o ritmo "bloco centralizado"
 * que se repete no resto da página.
 *
 * Os números vêm da lista administrável de municípios atendidos.
 */
export function HomeStats({ stats }: HomeStatsProps) {
  const items = [
    {
      value: stats
        ? formatCount(stats.activeMunicipalities)
        : COPY.municipalities.fallback,
      label: COPY.municipalities.label,
    },
    {
      value: stats ? formatCount(stats.regionsCovered) : COPY.regions.fallback,
      label: COPY.regions.label,
    },
  ]

  return (
    <section
      aria-labelledby="home-stats-title"
      className="relative z-10 mx-auto max-w-6xl px-6"
    >
      <h2 id="home-stats-title" className="sr-only">
        {COPY.title}
      </h2>

      <dl className="bg-card -mt-10 grid grid-cols-1 divide-y rounded-3xl border shadow-md sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:-mt-14">
        {items.map((item) => (
          // `flex-col-reverse`: o número aparece primeiro, mas no DOM o rótulo
          // (`dt`) vem antes do valor (`dd`), como a lista de definição exige.
          <div
            key={item.label}
            className="flex flex-col-reverse items-center gap-1 px-6 py-7 text-center md:px-10 md:py-8"
          >
            <dt className="text-muted-foreground text-sm font-medium tracking-tight text-balance">
              {item.label}
            </dt>
            <dd className="text-primary text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-muted-foreground mt-5 pb-8 text-center text-xs text-pretty md:pb-10">
        {COPY.sourceNote}
      </p>
    </section>
  )
}
