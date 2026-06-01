import type { Metadata } from 'next'

import { HomeHero } from '@/components/shared/home-hero'
import { HomeStats } from '@/components/shared/home-stats'
import { HomeNetwork } from '@/components/shared/home-network'
import { HomeTips } from '@/components/shared/home-tips'
import { HomeCta } from '@/components/shared/home-cta'
import { SITE } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
}

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeStats />
      <HomeNetwork />
      <HomeTips />
      <HomeCta />
    </>
  )
}
