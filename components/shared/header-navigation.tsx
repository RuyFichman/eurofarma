'use client'

import type { MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type HeaderNavigationProps = {
  items: ReadonlyArray<{ label: string; href: string }>
  ariaLabel: string
  mobile?: boolean
}

function isActive(pathname: string, href: string): boolean {
  const current = pathname.replace(/\/$/, '') || '/'
  if (href === '/') return current === '/'
  return current === href || current.startsWith(`${href}/`)
}

function closeMobileMenu(event: MouseEvent<HTMLAnchorElement>): void {
  event.currentTarget.closest('details')?.removeAttribute('open')
}

/** Única ilha cliente do cabeçalho: calcula `aria-current` pela rota ativa. */
export function HeaderNavigation({
  items,
  ariaLabel,
  mobile = false,
}: HeaderNavigationProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label={ariaLabel}
      className={
        mobile
          ? 'flex flex-col gap-1'
          : 'hidden md:flex md:items-center md:gap-6'
      }
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={mobile ? closeMobileMenu : undefined}
            aria-current={active ? 'page' : undefined}
            className={
              mobile
                ? `hover:bg-muted rounded-md px-3 py-3 text-base transition-colors ${
                    active ? 'text-primary font-semibold' : 'text-foreground'
                  }`
                : `hover:text-primary text-sm underline-offset-8 transition-colors ${
                    active
                      ? 'text-primary font-semibold underline'
                      : 'text-foreground/80'
                  }`
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
