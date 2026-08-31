import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Droplet,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HOME } from '@/lib/i18n/pt-br'

/** Ícone de cada item de confiança, na ordem da copy (LGPD, WhatsApp). */
const TRUST_ICONS = [ShieldCheck, MessageCircle]

export function HomeHero() {
  const { hero } = HOME

  return (
    <section className="relative isolate overflow-hidden">
      {/* Fundo em duas camadas: gradiente de base + um halo difuso atrás da
          foto. Decorativo, some para leitor de tela. */}
      <div
        aria-hidden="true"
        className="from-secondary/70 via-background to-background absolute inset-0 -z-10 bg-gradient-to-b"
      />
      <div
        aria-hidden="true"
        className="bg-accent/50 absolute -top-32 -right-24 -z-10 size-[30rem] rounded-full blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
        {/* Coluna de texto */}
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit gap-1.5 py-1">
            <Droplet aria-hidden="true" />
            {hero.badge}
          </Badge>

          {/* Escala maior que o h1 global (36px): a landing precisa de um
              primeiro impacto que as páginas internas não precisam. */}
          <h1 className="text-4xl leading-[1.08] text-balance md:text-5xl lg:text-[3rem]">
            {hero.titleLead}{' '}
            <span className="text-primary">{hero.titleHighlight}</span>{' '}
            {hero.titleTail}
          </h1>

          <p className="text-muted-foreground max-w-xl text-lg text-pretty md:text-xl">
            {hero.description}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="shadow-md">
              <Link href={hero.primaryCta.href}>
                <MapPin aria-hidden="true" />
                {hero.primaryCta.label}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="text-muted-foreground mt-2 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:gap-8">
            {hero.trust.map((item, index) => {
              const Icon = TRUST_ICONS[index] ?? ShieldCheck
              return (
                <li key={item} className="flex items-center gap-2">
                  <Icon
                    className="text-chart-2 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Coluna visual. Foto fornecida pelo time (TODO: confirmar licença de
            uso com a Eurofarma antes de qualquer exposição pública).
            Proporção 4/5: a original é 800x1200 (retrato), e um recorte
            paisagem cortaria o rosto do bebê. */}
        <div className="relative">
          <div className="ring-border/60 relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lg ring-1">
            <Image
              src="/images/hero-bebe.jpg"
              alt={hero.imageAlt}
              fill
              // Imagem de LCP da landing: carrega sem lazy.
              priority
              sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
