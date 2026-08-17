import type { ReactNode } from 'react'

import { AdminShell } from '@/components/admin/admin-shell'
import { requireAdminUser } from '@/lib/auth/get-admin-user'

/**
 * Gate de **autorização** do painel + chrome.
 *
 * O middleware já garantiu que existe sessão; aqui checamos o role no Postgres
 * via Prisma (impossível no middleware, que roda no Edge). Route group `(painel)`
 * não aparece na URL — `/admin/dashboard` continua `/admin/dashboard` — e deixa
 * `/admin/login` e `/admin/sem-acesso` fora deste layout, evitando loop.
 */
export default async function AdminPainelLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireAdminUser()

  return <AdminShell user={user}>{children}</AdminShell>
}
