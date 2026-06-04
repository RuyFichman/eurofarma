import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, CircleCheck, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { THANKS, SITE } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: `${THANKS.meta.title} — ${SITE.name}`,
  description: THANKS.meta.description,
  // Página de confirmação pós-cadastro — fora do índice de busca.
  robots: { index: false, follow: true },
}

export default function ObrigadaPage() {
  return (
    <section className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-6 py-16 md:min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto w-full max-w-xl text-center">
        <span className="bg-secondary text-primary mx-auto flex size-16 items-center justify-center rounded-2xl">
          <CircleCheck className="size-8" aria-hidden="true" />
        </span>

        <p className="text-primary mt-6 text-sm font-medium tracking-wide">
          {THANKS.badge}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-balance md:text-4xl">
          {THANKS.title}
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">
          {THANKS.body}
        </p>

        <div className="bg-card mt-10 rounded-2xl border p-6 text-left shadow-sm">
          <h2 className="text-base font-semibold">{THANKS.nextSteps.title}</h2>
          <ul className="mt-4 space-y-3">
            {THANKS.nextSteps.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="bg-secondary text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-muted-foreground text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/buscar">
              <MapPin aria-hidden="true" />
              {THANKS.primaryCta}
            </Link>
          </Button>
          <Link
            href="/como-funciona"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            {THANKS.secondaryCta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
