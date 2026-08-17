import type { ReactNode } from 'react'

import { AdminHeader } from '@/components/admin/admin-header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { requireAdminUser } from '@/lib/auth/get-admin-user'
import { ADMIN_LAYOUT } from '@/lib/i18n/pt-br'

/**
 * Shell do painel + gate de **autorização**.
 *
 * O middleware da raiz já garantiu que existe sessão; aqui checamos o role no
 * Postgres via Prisma (impossível no middleware, que roda no Edge). Route group
 * `(painel)` não aparece na URL — `/admin/dashboard` continua `/admin/dashboard`
 * — e deixa `/admin/login` e `/admin/sem-acesso` fora deste layout, o que evita
 * loop e mantém o login visualmente isolado.
 */
export default async function AdminPainelLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireAdminUser()

  return (
    <div className="bg-muted/20 min-h-svh">
      <a
        href="#admin-main"
        className="bg-primary text-primary-foreground sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
      >
        {ADMIN_LAYOUT.accessibility.skipToContent}
      </a>

      <AdminSidebar />

      {/* Casado com o `w-64` da sidebar — deslocamento por CSS, sem medição. */}
      <div className="lg:pl-64">
        <AdminHeader user={user} />

        <main id="admin-main" className="min-w-0 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
