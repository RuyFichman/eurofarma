import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HOME } from '@/lib/i18n/pt-br'

export function HomeCta() {
  const { finalCta } = HOME

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center md:py-20">
        <h2 className="text-primary-foreground">{finalCta.title}</h2>
        <p className="max-w-prose opacity-90">{finalCta.description}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href={finalCta.primaryCta.href}>
              <MapPin aria-hidden="true" />
              {finalCta.primaryCta.label}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent"
          >
            <Link href={finalCta.secondaryCta.href}>
              {finalCta.secondaryCta.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
