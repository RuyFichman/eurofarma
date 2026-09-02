import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ABOUT } from '@/lib/i18n/pt-br'

export function AboutCta() {
  const { finalCta } = ABOUT

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="from-primary to-sidebar relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br shadow-lg">
        <div
          aria-hidden="true"
          className="border-primary-foreground/10 absolute -top-32 -right-20 -z-10 size-80 rounded-full border-[3rem]"
        />
        <div
          aria-hidden="true"
          className="bg-sidebar-primary/15 absolute -bottom-24 left-1/4 -z-10 size-72 rounded-full blur-3xl"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-12 text-center sm:px-10 md:py-16">
          <h2 className="text-primary-foreground text-balance md:text-4xl">
            {finalCta.title}
          </h2>
          <p className="text-primary-foreground/80 mt-4 max-w-xl text-pretty">
            {finalCta.description}
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 w-full shadow-md sm:w-auto"
          >
            <Link href={finalCta.cta.href}>
              <MapPin aria-hidden="true" />
              {finalCta.cta.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
