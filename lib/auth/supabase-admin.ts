import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com a **service_role key** — ignora RLS e tem acesso à Admin
 * API (criar/apagar usuário em `auth.users`).
 *
 * NÃO substitui `lib/auth/supabase-server.ts`, que usa a publishable key e é o
 * cliente normal de sessão. Use este só onde a operação exige privilégio — na
 * Sprint 6.2, criar a conta da nutriz já confirmada e desfazer a criação se a
 * gravação no Postgres falhar.
 *
 * Lê `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, **sem** o prefixo
 * `NEXT_PUBLIC_`, exatamente como `prisma/seed-admin.ts`. É isso que impede o
 * vazamento: o Next só embute no bundle do navegador variáveis com aquele
 * prefixo, então um Client Component que importasse este módulo receberia
 * `undefined` e o guard abaixo lançaria — a chave nunca chega ao cliente.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase admin env ausente: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
