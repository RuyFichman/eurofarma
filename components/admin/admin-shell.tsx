import Link from 'next/link'
import type { ReactNode } from 'react'

import { AdminAccount } from '@/components/admin/admin-account'
import { AdminMobileMenu } from '@/components/admin/admin-mobile-menu'
import { AdminNav } from '@/components/admin/admin-nav'
import { LogoMark } from '@/components/shared/logo'
import type { AdminUser } from '@/lib/auth/get-admin-user'
import { ADMIN } from '@/lib/i18n/pt-br'

type AdminShellProps = {
  user: AdminUser
  children: ReactNode
}

function AdminBrand() {
  return (
    <Link
      href="/admin/dashboard"
      className="focus-visible:ring-sidebar-ring inline-flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:outline-none"
    >
      <LogoMark size="md" className="text-sidebar-primary" />
      <span className="text-base font-semibold tracking-tight">
        {ADMIN.brand.name}
      </span>
    </Link>
  )
}

/**
 * Chrome do painel: sidebar fixa no desktop, Sheet no mobile. Server Component —
 * a interatividade vive apenas em `AdminNav` e `AdminMobileMenu`.
 *
 * Provê o `<main id="admin-content">` da área admin (o layout `(public)` tem o
 * seu próprio `<main>`; as duas áreas não se cruzam).
 */
export function AdminShell({ user, children }: AdminShellProps) {
  return (
    <div className="bg-background min-h-svh md:grid md:grid-cols-[16rem_1fr]">
      <a
        href="#admin-content"
        className="bg-primary text-primary-foreground sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50"
      >
        {ADMIN.a11y.skipToContent}
      </a>

      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-svh flex-col border-r md:flex md:self-start">
        <div className="px-5 py-6">
          <AdminBrand />
          <p className="text-sidebar-foreground/60 mt-1 text-xs tracking-wide uppercase">
            {ADMIN.brand.eyebrow}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <AdminNav />
        </div>

        <div className="border-sidebar-border border-t p-4">
          <AdminAccount user={user} />
        </div>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="border-border bg-background/85 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-sm md:hidden">
          <AdminMobileMenu account={<AdminAccount user={user} />} />
          <span className="text-primary font-semibold tracking-tight">
            {ADMIN.brand.name}
          </span>
        </header>

        <main id="admin-content" className="flex-1 px-4 py-8 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
