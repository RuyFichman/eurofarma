import type { Metadata } from 'next'

import { ContentHero } from '@/components/shared/content-hero'
import { ContentStartHere } from '@/components/shared/content-start-here'
import { ContentDonationPath } from '@/components/shared/content-donation-path'
import { ContentVideos } from '@/components/shared/content-videos'
import { ContentChecklist } from '@/components/shared/content-checklist'
import { ContentGuides } from '@/components/shared/content-guides'
import { ContentStories } from '@/components/shared/content-stories'
import { ContentFaq } from '@/components/shared/content-faq'
import { CONTENT } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: CONTENT.meta.title,
  description: CONTENT.meta.description,
}

export default function ContentPage() {
  return (
    <>
      <ContentHero />
      <ContentStartHere />
      <div id="caminho-da-doacao" className="bg-muted/40 pb-16 md:pb-20">
        <ContentDonationPath />
        <ContentVideos />
        <ContentChecklist />
      </div>
      <ContentGuides />
      <ContentStories />
      <ContentFaq />
    </>
  )
}
