import { redirect } from 'next/navigation'

import { prisma } from '../db/prisma'
import { getCurrentUser } from './get-current-user'

/**
 * Role em string literal (não o enum do `@prisma/client`) para que `AdminUser`
 * possa atravessar até Client Components sem arrastar o Prisma para o bundle.
 */
export type AdminRole = 'ADMIN' | 'VIEWER'

export type AdminUser = {
  id: string
  email: string
  fullName: string
  role: AdminRole
}

export type AdminAccess =
  | { status: 'authenticated'; user: AdminUser }
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }

/**
 * Resolve o acesso ao painel cruzando a sessão do Supabase Auth com o espelho em
 * `public.users` (mesmo `id` nas duas tabelas — ver `pnpm db:seed-admin`).
 *
 * `forbidden` cobre três casos deliberadamente indistinguíveis para quem acessa:
 * conta sem espelho em `public.users`, conta desativada (`isActive = false`) e
 * conta sem role ADMIN.
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  const user = await getCurrentUser()
  if (!user) return { status: 'unauthenticated' }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  })

  if (!dbUser || !dbUser.isActive || dbUser.role !== 'ADMIN') {
    return { status: 'forbidden' }
  }

  return {
    status: 'authenticated',
    user: {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.fullName,
      role: dbUser.role,
    },
  }
}

/**
 * Exige sessão + role ADMIN. Use em layouts/páginas do painel: sem sessão manda
 * ao login, com sessão mas sem permissão manda ao aviso de acesso restrito.
 */
export async function requireAdminUser(): Promise<AdminUser> {
  const access = await getAdminAccess()
  if (access.status === 'authenticated') return access.user
  if (access.status === 'unauthenticated') redirect('/admin/login')
  redirect('/admin/sem-acesso')
}
