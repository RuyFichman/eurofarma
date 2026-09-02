import { redirect } from 'next/navigation'

import { prisma } from '../db/prisma'
import { getCurrentUser } from './get-current-user'

/**
 * Dados da nutriz logada. Campos em tipos primitivos (sem enum do Prisma) para
 * poderem atravessar até Client Components sem arrastar o Prisma para o bundle
 * — mesma regra do `AdminUser`.
 */
export type NutrizUser = {
  id: string
  fullName: string
  firstName: string
  email: string | null
  state: string
  city: string
}

export type NutrizAccess =
  | { status: 'authenticated'; nutriz: NutrizUser }
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }

/** Primeiro nome, para a saudação da área ("Olá, Ana!"). */
function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

/**
 * Resolve o acesso à área da nutriz cruzando a sessão do Supabase Auth com
 * `nutriz_profiles.auth_user_id` (preenchido no cadastro — Sprint 6.2).
 *
 * `forbidden` cobre dois casos que a interface trata igual: sessão válida sem
 * perfil de nutriz (o admin logado, por exemplo — ele tem espelho em
 * `public.users`, não aqui) e perfil com `deletedAt` preenchido. O soft delete
 * entra na consulta, não é filtro opcional: quem pediu exclusão não volta a
 * acessar a área só porque o cookie ainda é válido.
 */
export async function getNutrizAccess(): Promise<NutrizAccess> {
  const user = await getCurrentUser()
  if (!user) return { status: 'unauthenticated' }

  const profile = await prisma.nutrizProfile.findUnique({
    where: { authUserId: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      state: true,
      city: true,
      deletedAt: true,
    },
  })

  if (!profile || profile.deletedAt) return { status: 'forbidden' }

  return {
    status: 'authenticated',
    nutriz: {
      id: profile.id,
      fullName: profile.fullName,
      firstName: firstNameOf(profile.fullName),
      email: profile.email,
      state: profile.state,
      city: profile.city,
    },
  }
}

/**
 * Exige sessão **de nutriz**. Use no layout da área protegida.
 *
 * Sem sessão vai para `/entrar`. Com sessão mas sem perfil de nutriz vai para a
 * home, e não para `/entrar`: quem está nesse caso (tipicamente um admin
 * logado) já tem sessão válida, então o login o devolveria para cá em loop.
 * Não existe tela de "sem acesso" no público — o equivalente do painel só faz
 * sentido lá, onde a pessoa esperava ter permissão.
 */
export async function requireNutrizUser(): Promise<NutrizUser> {
  const access = await getNutrizAccess()
  if (access.status === 'authenticated') return access.nutriz
  if (access.status === 'unauthenticated') redirect('/entrar')
  redirect('/')
}
