import type { ReactNode } from 'react'

import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { PublicChrome } from '@/components/shared/public-chrome'

export default function PublicLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <PublicChrome>
        <Header />
      </PublicChrome>
      <main
        id="main-content"
        className="min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-4rem)]"
      >
        {children}
      </main>
      <PublicChrome>
        <Footer />
      </PublicChrome>
    </>
  )
}
