import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HOME } from '@/lib/i18n/pt-br'

/**
 * Chamada final — Server Component.
 *
 * Painel arredondado dentro da página, não uma faixa de ponta a ponta: fecha
 * a home com o mesmo vocabulário de cartão que a faixa de números abre, em vez
 * de um bloco chapado de cor.
 */
export function HomeCta() {
  const { finalCta } = HOME

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="from-primary to-sidebar relative isolate overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-14 text-center shadow-lg md:px-12 md:py-16">
        {/* Halo decorativo — dá volume ao painel sem introduzir imagem nova. */}
        <div
          aria-hidden="true"
          className="bg-sidebar-primary/20 absolute -top-24 -right-16 -z-10 size-72 rounded-full blur-3xl"
        />

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <h2 className="text-primary-foreground text-balance">
            {finalCta.title}
          </h2>
          <p className="text-primary-foreground/85 text-pretty">
            {finalCta.description}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="shadow-md">
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
      </div>
    </section>
  )
}
