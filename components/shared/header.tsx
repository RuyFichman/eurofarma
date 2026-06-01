'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from '@/components/shared/logo'
import { A11Y, NAV } from '@/lib/i18n/pt-br'

function isActive(pathname: string, href: string): boolean {
  const current = pathname.replace(/\/$/, '') || '/'
  if (href === '/') {
    return current === '/'
  }
  return current === href || current.startsWith(`${href}/`)
}

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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

        {/* Navegação desktop */}
        <nav
          aria-label={A11Y.navMenu}
          className="hidden md:flex md:items-center md:gap-6"
        >
          {NAV.items.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'hover:text-primary text-sm underline-offset-8 transition-colors',
                  active
                    ? 'text-primary font-semibold underline'
                    : 'text-foreground/80',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* CTA sempre visível */}
          <Button asChild size="sm">
            <Link href={NAV.cta.href}>
              <span className="md:hidden">{NAV.cta.shortLabel}</span>
              <span className="hidden md:inline">{NAV.cta.label}</span>
            </Link>
          </Button>

          {/* Menu mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={NAV.mobileMenu.open}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-label={A11Y.navMenu}>
              <SheetTitle className="px-4 pt-4">
                <Logo size="md" />
              </SheetTitle>
              <nav className="mt-4 flex flex-col gap-1 px-4">
                {NAV.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'hover:bg-muted rounded-md px-3 py-3 text-base transition-colors',
                        active
                          ? 'text-primary font-semibold'
                          : 'text-foreground',
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <Button asChild size="lg" className="mt-4">
                  <Link href={NAV.cta.href} onClick={() => setOpen(false)}>
                    {NAV.cta.label}
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
