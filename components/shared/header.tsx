import Link from 'next/link'
import { LogIn, Menu, X } from 'lucide-react'

import { Logo } from '@/components/shared/logo'
import { HeaderNavigation } from '@/components/shared/header-navigation'
import { A11Y, NAV, NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

export function Header() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      {/* Skip to content (acessibilidade — visível só ao focar via teclado) */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50"
      >
        {A11Y.skipToContent}
      </a>

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6 md:h-16">
        <Logo size="md" />

        <HeaderNavigation items={NAV.items} ariaLabel={A11Y.navMenu} />

        <div className="flex items-center gap-3">
          {/* A rota decide se deve mostrar o login ou redirecionar uma nutriz
              que já possui sessão. Assim o site público não carrega Supabase. */}
          <Link
            href="/entrar"
            className="text-foreground/80 hover:text-primary hidden items-center gap-1.5 text-sm transition-colors sm:inline-flex"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {NUTRIZ_AUTH.header.login}
          </Link>

          {/* CTA sempre visível */}
          <Link
            href={NAV.cta.href}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors"
          >
            <span className="md:hidden">{NAV.cta.shortLabel}</span>
            <span className="hidden md:inline">{NAV.cta.label}</span>
          </Link>

          {/* `details` preserva teclado e estado expandido sem hidratar Radix. */}
          <details className="group relative md:hidden">
            <summary className="hover:bg-accent focus-visible:ring-ring inline-flex size-9 cursor-pointer list-none items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <Menu className="size-5 group-open:hidden" aria-hidden="true" />
              <X
                className="hidden size-5 group-open:block"
                aria-hidden="true"
              />
              <span className="sr-only">
                <span className="group-open:hidden">{NAV.mobileMenu.open}</span>
                <span className="hidden group-open:inline">
                  {NAV.mobileMenu.close}
                </span>
              </span>
            </summary>
            <div className="bg-background absolute top-[calc(100%+0.75rem)] right-0 z-50 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border p-4 shadow-xl">
              <HeaderNavigation
                items={NAV.items}
                ariaLabel={A11Y.navMenu}
                mobile
              />
              <div className="mt-4 grid gap-2 border-t pt-4">
                <Link
                  href="/entrar"
                  className="text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium"
                >
                  <LogIn className="size-4" aria-hidden="true" />
                  {NUTRIZ_AUTH.header.login}
                </Link>
                <Link
                  href={NAV.cta.href}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors"
                >
                  {NAV.cta.label}
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
