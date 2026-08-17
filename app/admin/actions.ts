'use server'

import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/auth/supabase-server'

/**
 * Encerra a sessão do painel. O `signOut` limpa o cookie via SSR; o redirect
 * acontece mesmo se ele falhar, para nunca prender a pessoa numa tela sem saída
 * (nesse caso o middleware simplesmente a devolve ao painel).
 */
export async function logoutAdminAction(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  } catch {
    // Falha ao contatar o Supabase não deve bloquear a saída da UI.
  }

  redirect('/admin/login')
}
