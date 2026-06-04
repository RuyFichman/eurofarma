/**
 * Bloqueio temporário de login admin por tentativas falhas. Em memória, por
 * processo — chave = email normalizado (NUNCA logado). Não usa IP (minimiza
 * tratamento de dado pessoal) e não persiste em banco.
 *
 * TODO: substituir por rate limit distribuído em produção na Sprint 7.4.
 */
type LoginAttemptState = {
  count: number
  firstAttemptAt: number
  blockedUntil?: number
}

const WINDOW_MS = 5 * 60 * 1000 // 5 minutos
const MAX_ATTEMPTS = 5
const BLOCK_MS = 5 * 60 * 1000 // bloqueio de 5 minutos

const attempts = new Map<string, LoginAttemptState>()

/** Verifica se o email está bloqueado por excesso de tentativas falhas. */
export function assertLoginNotRateLimited(email: string): {
  allowed: boolean
  retryAfterSeconds?: number
} {
  const now = Date.now()
  const state = attempts.get(email)
  if (!state) return { allowed: true }

  if (state.blockedUntil && now < state.blockedUntil) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((state.blockedUntil - now) / 1000),
    }
  }

  // Janela expirada (ou bloqueio já vencido) → zera o histórico do email.
  if (now - state.firstAttemptAt > WINDOW_MS) {
    attempts.delete(email)
  }

  return { allowed: true }
}

/** Registra uma tentativa falha; ao atingir o máximo na janela, bloqueia. */
export function registerFailedLoginAttempt(email: string): void {
  const now = Date.now()
  const state = attempts.get(email)

  if (!state || now - state.firstAttemptAt > WINDOW_MS) {
    attempts.set(email, { count: 1, firstAttemptAt: now })
    return
  }

  state.count += 1
  if (state.count >= MAX_ATTEMPTS) {
    state.blockedUntil = now + BLOCK_MS
  }
}

/** Limpa o histórico de tentativas (chamado após login bem-sucedido). */
export function clearFailedLoginAttempts(email: string): void {
  attempts.delete(email)
}
