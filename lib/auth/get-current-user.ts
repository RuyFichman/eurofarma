import type { User } from '@supabase/supabase-js'

import { createSupabaseServerClient } from './supabase-server'

/**
 * Retorna o usuário autenticado, validando a sessão no servidor do Supabase
 * (`auth.getUser()` — não confia só no cookie), ou `null` se não houver sessão.
 * Use em Server Components/Actions para checar login. A autorização completa por
 * rota (role + middleware) fica para a Sprint 5.3/5.4.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
