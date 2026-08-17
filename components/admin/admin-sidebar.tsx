import Link from 'next/link'

import { AdminNav } from '@/components/admin/admin-nav'
import { LogoMark } from '@/components/shared/logo'
import { ADMIN_LAYOUT } from '@/lib/i18n/pt-br'

/**
 * Sidebar fixa do painel (Server Component) — visível a partir de `lg`, oculta
 * abaixo disso, onde a navegação vira Sheet (`AdminMobileNav`).
 *
 * Largura fixa `w-64` casada com o `lg:pl-64` do layout: o deslocamento é puro
 * CSS responsivo, sem medir nada em runtime, então não há layout shift na
 * hidratação.
 */
export function AdminSidebar() {
  return (
    <aside className="bg-background fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:flex lg:flex-col">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Link
          href="/admin/dashboard"
          className="focus-visible:ring-ring inline-flex items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
        >
          <LogoMark size="md" className="text-primary" />
          <span>{ADMIN_LAYOUT.brand.name}</span>
          <span className="text-muted-foreground font-normal">
            {ADMIN_LAYOUT.brand.area}
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <AdminNav />
      </div>
    </aside>
  )
}
