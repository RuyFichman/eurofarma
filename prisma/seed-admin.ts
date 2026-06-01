import {
  createClient,
  type User as AuthUser,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

import { prisma } from '../lib/db/prisma'

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

// Reatribuição em consts tipadas como string (já estreitadas pelos guards acima),
// para uso seguro dentro das funções.
const supabaseUrl: string = SUPABASE_URL
const serviceRoleKey: string = SUPABASE_SERVICE_ROLE_KEY
const adminEmail: string = INITIAL_ADMIN_EMAIL

/** Cria o cliente Supabase com a service_role key. Uso exclusivo de script/CLI. */
function createSupabaseAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Gera senha forte alfanumérica de `length` caracteres. Usa bytes aleatórios em
 * base64 e remove `+`, `/`, `=` (regerando até completar o tamanho), garantindo
 * exatamente `length` caracteres sem símbolos que atrapalham copy/paste.
 */
function generateStrongPassword(length = 20): string {
  let result = ''
  while (result.length < length) {
    result += randomBytes(length).toString('base64').replace(/[+/=]/g, '')
  }
  return result.slice(0, length)
}

/** Procura usuário no auth.users pelo email (case-insensitive). Primeira página basta em dev. */
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

/** Cria o usuário no auth.users com email já confirmado (sem SMTP). */
async function createAuthUser(
  supabase: SupabaseClient,
  email: string,
  password: string,
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      source: 'seed-admin',
      created_at: new Date().toISOString(),
    },
  })
  if (error || !data.user) {
    throw new Error(
      `Falha ao criar usuário Auth: ${error?.message ?? 'resposta sem usuário'}`,
    )
  }
  return data.user
}

/**
 * Faz upsert do perfil em public.users usando o MESMO id do auth.users
 * (sincronização essencial para RLS). Não sobrescreve fullName em updates.
 */
async function upsertPublicUser(
  authUserId: string,
  email: string,
): Promise<void> {
  await prisma.user.upsert({
    where: { id: authUserId },
    create: {
      id: authUserId,
      email,
      fullName: 'Admin Lactare (inicial)',
      role: 'ADMIN',
      isActive: true,
    },
    update: {
      role: 'ADMIN',
      isActive: true,
    },
  })
}

/** Imprime a senha UMA vez no stdout. Nunca persiste em arquivo. */
function printCredentialsBanner(email: string, password: string): void {
  const bar = '='.repeat(60)
  console.log(`\n${bar}`)
  console.log('CREDENCIAIS DO ADMIN INICIAL — SALVE AGORA')
  console.log('Esta senha NÃO será mostrada novamente nas próximas execuções.')
  console.log(`Email:  ${email}`)
  console.log(`Senha:  ${password}`)
  console.log(`${bar}\n`)
}

async function main(): Promise<void> {
  console.log(`[seed-admin] Início — email: ${adminEmail}`)
  const supabase = createSupabaseAdminClient()

  const existing = await findAuthUserByEmail(supabase, adminEmail)

  if (existing) {
    console.log(
      `[seed-admin] Usuário Auth já existe (id=${existing.id}). Senha NÃO regenerada.`,
    )
    await upsertPublicUser(existing.id, adminEmail)
    console.log('[seed-admin] Perfil em public.users garantido com role ADMIN.')
    console.log(
      '[seed-admin] Esqueceu a senha? Resete no painel do Supabase: Authentication > Users > (usuário) > Reset password.',
    )
  } else {
    const password = generateStrongPassword(20)
    const authUser = await createAuthUser(supabase, adminEmail, password)
    await upsertPublicUser(authUser.id, adminEmail)
    printCredentialsBanner(adminEmail, password)
  }

  console.log('[seed-admin] Concluído com sucesso.')
}

main()
  .catch((err) => {
    console.error(
      '[seed-admin] Erro fatal:',
      err instanceof Error ? err.message : err,
    )
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
