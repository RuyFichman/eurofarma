import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HOME } from '@/lib/i18n/pt-br'

/**
 * Chamada final — Server Component.
 *
 * Painel centralizado que encerra a faixa iniciada pelas dicas e concentra a
 * atenção na mensagem e nas duas próximas ações possíveis.
 */
export function HomeCta() {
  const { finalCta } = HOME

  return (
    <section
      aria-labelledby="home-final-cta-title"
      className="bg-muted/40 border-b px-6 pb-16 md:pb-24"
    >
      <div className="from-primary to-sidebar relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br shadow-lg">
        <div
          aria-hidden="true"
          className="border-sidebar-foreground/10 absolute -top-28 -right-20 -z-10 size-80 rounded-full border-[3rem]"
        />
        <div
          aria-hidden="true"
          className="bg-sidebar-primary/15 absolute -bottom-32 left-1/3 -z-10 size-72 rounded-full blur-3xl"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-12 text-center sm:px-8 md:px-12 md:py-16">
          <h2
            id="home-final-cta-title"
            className="text-primary-foreground text-balance md:text-4xl"
          >
            {finalCta.title}
          </h2>
          <p className="text-primary-foreground/80 mt-4 max-w-xl text-pretty">
            {finalCta.description}
          </p>

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full shadow-md sm:w-auto"
            >
              <Link href={finalCta.primaryCta.href}>
                <MapPin aria-hidden="true" />
                {finalCta.primaryCta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/35 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground w-full bg-transparent sm:w-auto"
            >
              <Link href={finalCta.secondaryCta.href}>
                {finalCta.secondaryCta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
