import type { Metadata } from 'next'

import { HomeHero } from '@/components/shared/home-hero'
import { HomeStats } from '@/components/shared/home-stats'
import { HomeNetwork } from '@/components/shared/home-network'
import { HomeTips } from '@/components/shared/home-tips'
import { HomeCta } from '@/components/shared/home-cta'
import {
  getPublicNetworkStats,
  type PublicNetworkStats,
} from '@/lib/db/queries/units'
import { SITE } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
}

/** Números da rede mudam com a curadoria das unidades, não a cada visita. */
export const revalidate = 3600

export default async function HomePage() {
  // A home não pode cair porque o banco piscou: sem números, a faixa usa os
  // valores de fallback da copy e o resto da página segue igual.
  let stats: PublicNetworkStats | null = null
  try {
    stats = await getPublicNetworkStats()
  } catch {
    stats = null
  }

  return (
    <>
      <HomeHero />
      <HomeStats stats={stats} />
      <HomeNetwork />
      <HomeTips />
      <HomeCta />
    </>
  )
}
