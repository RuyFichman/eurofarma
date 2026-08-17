/**
 * Leitura única das variáveis públicas do Supabase, compartilhada pelos três
 * clientes (server, browser e middleware).
 *
 * A chave usada é sempre a publishable/anon (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`),
 * pública por design. A `service_role` NUNCA entra aqui — ela só existe em
 * scripts de servidor (ex.: `pnpm db:seed-admin`).
 */
export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase env ausente: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }
  return { url, key }
}
