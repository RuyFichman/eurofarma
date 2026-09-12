import type { Metadata } from 'next'

import { HomeHero } from '@/components/shared/home-hero'
import { HomeStats } from '@/components/shared/home-stats'
import { HomeNetwork } from '@/components/shared/home-network'
import { HomeTips } from '@/components/shared/home-tips'
import { HomeCta } from '@/components/shared/home-cta'
import {
  getPublicCoverageStats,
  type PublicCoverageStats,
} from '@/lib/db/queries/service-municipalities'
import { SITE } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
}

/** A cobertura muda somente quando a equipe edita os municípios. */
export const revalidate = 3600

export default async function HomePage() {
  // A home não pode cair porque o banco piscou: sem números, a faixa usa os
  // valores de fallback da copy e o resto da página segue igual.
  let stats: PublicCoverageStats | null = null
  try {
    stats = await getPublicCoverageStats()
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
