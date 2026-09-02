import type { Metadata } from 'next'

import { AboutCta } from '@/components/shared/about-cta'
import { AboutHero } from '@/components/shared/about-hero'
import { AboutJourney } from '@/components/shared/about-journey'
import { AboutStory } from '@/components/shared/about-story'
import { ABOUT } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: ABOUT.meta.title,
  description: ABOUT.meta.description,
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutJourney />
      <AboutCta />
    </>
  )
}
