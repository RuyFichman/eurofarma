import { Heart } from 'lucide-react'

import { Logo } from '@/components/shared/logo'
import { SIGNUP } from '@/lib/i18n/pt-br'

const COPY = SIGNUP.hero
const BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1686604910183-cfafe0716462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxtb3RoZXIlMjBiYWJ5JTIwbmV3Ym9ybiUyMHRlbmRlciUyMHBpbmt8ZW58MXx8fHwxNzgwMjc4NTc5fDA&ixlib=rb-4.1.0&q=80&w=800'

/**
 * Painel esquerdo da tela de cadastro (Server Component). Reproduz o split-screen
 * do mockup: marca, frase de impacto e benefícios. Foto fornecida pelo time,
 * com sobreposição azul para manter o contraste do texto.
 */
export function SignupHero() {
  return (
    <aside className="from-primary to-sidebar relative hidden flex-col overflow-hidden bg-gradient-to-br p-6 text-white lg:sticky lg:top-16 lg:flex lg:h-[calc(100dvh-4rem)] lg:self-start xl:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${BACKGROUND_IMAGE}")` }}
      />
      <div
        aria-hidden="true"
        className="from-primary/65 to-sidebar/80 pointer-events-none absolute inset-0 bg-gradient-to-b"
      />

      <div className="relative">
        <Logo variant="light" size="lg" />
      </div>

      <div className="[container-type:inline-size] relative my-auto w-full py-6">
        <span
          aria-hidden="true"
          className="mb-6 block h-1 w-12 rounded-full bg-white/70"
        />
        <blockquote className="text-[clamp(1rem,4cqw,1.875rem)] leading-tight font-semibold">
          <span className="block whitespace-nowrap">
            &ldquo;{COPY.quoteLines[0]}
          </span>
          <span className="block whitespace-nowrap">
            {COPY.quoteLines[1]}&rdquo;
          </span>
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
