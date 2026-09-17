import type { User } from '@supabase/supabase-js'
import { cache } from 'react'

import { createSupabaseServerClient } from './supabase-server'

/**
 * Retorna o usuário autenticado, validando a sessão no servidor do Supabase
 * (`auth.getUser()` — não confia só no cookie), ou `null` se não houver sessão.
 * Use em Server Components/Actions para checar login. A autorização completa por
 * rota (role + middleware) fica para a Sprint 5.3/5.4.
 */
async function resolveCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * A memoização do React vive somente durante a renderização da requisição.
 * Layouts e páginas compartilham a mesma validação remota, enquanto uma nova
 * navegação ou Server Action volta a consultar o Supabase normalmente.
 */
export const getCurrentUser = cache(resolveCurrentUser)
