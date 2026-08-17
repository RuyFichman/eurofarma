import {
  createClient,
  type User as AuthUser,
  type SupabaseClient,
} from '@supabase/supabase-js'

import { generateStrongPassword } from './support/generate-password'

// ---- Validação de variáveis de ambiente ----
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL não definida em .env.local')
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida em .env.local')
}
if (!INITIAL_ADMIN_EMAIL) {
  throw new Error('INITIAL_ADMIN_EMAIL não definida em .env.local')
}

const supabaseUrl: string = SUPABASE_URL
const serviceRoleKey: string = SUPABASE_SERVICE_ROLE_KEY
const adminEmail: string = INITIAL_ADMIN_EMAIL

/** Espelha `adminLoginSchema` — senha fora dessa faixa seria recusada no login. */
const MIN_LENGTH = 8
const MAX_LENGTH = 128

/** Cliente Supabase com a service_role key. Uso exclusivo de script/CLI. */
function createSupabaseAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function findAuthUserByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) {
    throw new Error(`Falha ao listar usuários Auth: ${error.message}`)
  }
  const target = email.toLowerCase()
  return data.users.find((user) => user.email?.toLowerCase() === target) ?? null
}

/**
 * Resolve a senha a aplicar: usa `ADMIN_PASSWORD` do ambiente quando definida
 * (assim a senha não fica no histórico do shell, como ficaria via argv) ou gera
 * uma forte de 20 caracteres.
 */
function resolvePassword(): { password: string; generated: boolean } {
  const fromEnv = process.env.ADMIN_PASSWORD
  if (!fromEnv) {
    return { password: generateStrongPassword(20), generated: true }
  }
  if (fromEnv.length < MIN_LENGTH || fromEnv.length > MAX_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD deve ter entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres (recebeu ${fromEnv.length}).`,
    )
  }
  return { password: fromEnv, generated: false }
}

function printCredentialsBanner(email: string, password: string): void {
  const bar = '='.repeat(60)
  console.log(`\n${bar}`)
  console.log('NOVA SENHA DO ADMIN — SALVE AGORA')
  console.log('Ela não será mostrada novamente.')
  console.log(`Email:  ${email}`)
  console.log(`Senha:  ${password}`)
  console.log(`${bar}\n`)
}

/**
 * Redefine a senha do admin inicial via Admin API do Supabase.
 *
 * Existe porque o "Reset password" do painel envia email, e o admin de
 * desenvolvimento usa um domínio fictício (`@lactare.local`) que não recebe
 * nada. Não cria usuário nem mexe em `public.users` — para isso é o
 * `pnpm db:seed-admin`.
 */
async function main(): Promise<void> {
  console.log(`[set-admin-password] Início — email: ${adminEmail}`)
  const supabase = createSupabaseAdminClient()

  const authUser = await findAuthUserByEmail(supabase, adminEmail)
  if (!authUser) {
    throw new Error(
      `Usuário ${adminEmail} não existe no Auth. Rode \`pnpm db:seed-admin\` primeiro.`,
    )
  }

  const { password, generated } = resolvePassword()

  const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
    password,
  })
  if (error) {
    throw new Error(`Falha ao atualizar a senha: ${error.message}`)
  }

  if (generated) {
    printCredentialsBanner(adminEmail, password)
  } else {
    console.log(
      '[set-admin-password] Senha definida a partir de ADMIN_PASSWORD.',
    )
  }

  console.log('[set-admin-password] Concluído com sucesso.')
}

main().catch((err) => {
  console.error(
    '[set-admin-password] Erro fatal:',
    err instanceof Error ? err.message : err,
  )
  process.exit(1)
})
