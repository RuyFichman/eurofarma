'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  FileText,
  LayoutDashboard,
  Megaphone,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { ADMIN } from '@/lib/i18n/pt-br'

type AdminNavProps = {
  /** Chamado ao navegar — usado pelo menu mobile para fechar o Sheet. */
  onNavigate?: () => void
}

const ICONS: Record<string, LucideIcon> = {
  '/admin/dashboard': LayoutDashboard,
  '/admin/unidades': Building2,
  '/admin/nutrizes': Users,
  '/admin/conteudos': FileText,
  '/admin/campanhas': Megaphone,
}

function isActive(pathname: string, href: string): boolean {
  const current = pathname.replace(/\/$/, '') || '/'
  return current === href || current.startsWith(`${href}/`)
}

const BASE_ITEM =
  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors'

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav aria-label={ADMIN.a11y.nav} className="flex flex-col gap-1">
      {ADMIN.nav.items.map((item) => {
        const Icon = ICONS[item.href]

        // Seções ainda não construídas aparecem para dar noção do painel, mas
        // não são links (evita levar a equipe para um 404).
        if (!item.available) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              className={cn(BASE_ITEM, 'text-sidebar-foreground/55')}
            >
              {Icon ? (
                <Icon className="size-4 shrink-0" aria-hidden="true" />
              ) : null}
              <span className="flex-1">{item.label}</span>
              <span className="border-sidebar-border rounded-full border px-2 py-0.5 text-[0.625rem] tracking-wide uppercase">
                {ADMIN.nav.soon}
              </span>
            </span>
          )
        }

        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              BASE_ITEM,
              'focus-visible:ring-sidebar-ring focus-visible:ring-2 focus-visible:outline-none',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            )}
          >
            {Icon ? (
              <Icon className="size-4 shrink-0" aria-hidden="true" />
            ) : null}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
