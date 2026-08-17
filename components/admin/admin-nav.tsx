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

import { ADMIN_NAV_ITEMS, type AdminNavKey } from '@/lib/admin/navigation'
import { ADMIN_LAYOUT } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

type AdminNavProps = {
  /** Chamado ao navegar — o menu mobile usa para fechar o Sheet. */
  onNavigate?: () => void
}

const ICONS: Record<AdminNavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  units: Building2,
  nutrizes: Users,
  contents: FileText,
  campaigns: Megaphone,
}

/**
 * Marca a rota ativa. `startsWith` cobre subrotas (ex.: `/admin/unidades/nova`)
 * sem que um href curto capture os demais itens — nenhum href aqui é prefixo de
 * outro, e `/admin` sozinho não está na lista justamente por isso.
 */
function isActive(pathname: string, href: string): boolean {
  const current = pathname.replace(/\/$/, '') || '/'
  return current === href || current.startsWith(`${href}/`)
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label={ADMIN_LAYOUT.navigation.label}
      className="flex flex-col gap-1"
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.key]
        const active = isActive(pathname, item.href)

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              // O peso da fonte acompanha a cor para o estado ativo não depender
              // só de cor (WCAG 1.4.1).
              active
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{ADMIN_LAYOUT.navigation.items[item.key]}</span>
          </Link>
        )
      })}
    </nav>
  )
}
