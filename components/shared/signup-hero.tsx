import { Heart } from 'lucide-react'

import { Logo } from '@/components/shared/logo'
import { SIGNUP } from '@/lib/i18n/pt-br'

const COPY = SIGNUP.hero

/**
 * Painel esquerdo da tela de cadastro (Server Component). Reproduz o split-screen
 * do mockup: marca, frase de impacto e benefícios. O fundo é um gradiente azul da
 * paleta — placeholder até existir uma foto oficial aprovada (sem imagem de banco).
 */
export function SignupHero() {
  return (
    <aside className="from-primary to-sidebar relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br p-10 text-white lg:flex">
      {/* TODO: substituir o gradiente pela foto oficial (mãe + bebê) aprovada pela Eurofarma. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]"
      />

      <div className="relative">
        <Logo variant="light" size="lg" />
      </div>

      <div className="relative max-w-md">
        <span
          aria-hidden="true"
          className="mb-6 block h-1 w-12 rounded-full bg-white/70"
        />
        <blockquote className="text-2xl font-semibold text-balance md:text-3xl">
          &ldquo;{COPY.quote}&rdquo;
        </blockquote>
        <p className="mt-4 text-sm text-white/80">{COPY.quoteSource}</p>

        <ul className="mt-10 space-y-4">
          {COPY.bullets.map((bullet) => (
            <li key={bullet} className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Heart className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm text-white/90">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
