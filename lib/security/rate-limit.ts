/**
 * Rate limiter simples em memória (janela fixa), keyed por cliente. JS puro, sem
 * dependências externas.
 *
 * ATENÇÃO: o estado vive no processo Node — NÃO é compartilhado entre múltiplas
 * instâncias (serverless/edge). É suficiente para o MVP local e para um único
 * servidor; antes de um deploy multi-instância, trocar por um store distribuído
 * (ex.: Redis/Upstash) mantendo esta mesma interface.
 */
export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

let lastSweep = Date.now()
const SWEEP_INTERVAL_MS = 60_000

/** Remove janelas expiradas periodicamente para o Map não crescer sem limite. */
function sweepExpired(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}

/**
 * Conta uma requisição para `key` dentro de uma janela fixa de `windowMs`.
 * Retorna `success: false` quando o limite foi atingido, com `retryAfterSeconds`
 * indicando quando a janela reinicia.
 */
export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now()
  sweepExpired(now)

  const bucket = buckets.get(key)

  // Sem janela ativa (ou expirada) → inicia uma nova.
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      retryAfterSeconds: 0,
    }
  }

  // Janela ativa e limite atingido → bloqueia.
  if (bucket.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - bucket.count,
    retryAfterSeconds: 0,
  }
}
