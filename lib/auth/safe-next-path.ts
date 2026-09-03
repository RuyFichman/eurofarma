/** Destino padrão do painel quando não há `?next=` válido. */
export const ADMIN_DEFAULT_PATH = '/admin/dashboard'

/** Destino padrão do site público quando não há `next` confiável. */
export const PUBLIC_DEFAULT_PATH = '/entrar'

/**
 * Sanitiza um destino do **site público** — hoje o `?next=` do callback de
 * e-mail (`/auth/confirmar`, Sprint 6.3).
 *
 * Aceita qualquer caminho relativo deste site, sem amarrar a um namespace (o
 * público não tem um). As rejeições são as mesmas do `sanitizeAdminNextPath`:
 * URL absoluta, protocol-relative (`//host`) e backslash — que alguns
 * navegadores normalizam para `/`, viabilizando open redirect. Entrada suspeita
 * cai no padrão em vez de virar erro.
 */
export function sanitizeRelativeAppPath(
  value: string | undefined | null,
  fallback: string = PUBLIC_DEFAULT_PATH,
): string {
  if (!value) return fallback
  if (value.includes('\\') || value.includes('://')) return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

/** Rotas do namespace `/admin` que não devem ser destino de retorno pós-login. */
const NON_RETURNABLE = ['/admin/login', '/admin/sem-acesso']

/**
 * Sanitiza o `?next=` usado no retorno pós-login.
 *
 * Só aceita caminho **relativo dentro de `/admin`** — nunca URL absoluta,
 * protocol-relative (`//host`) ou com backslash (que alguns navegadores
 * normalizam para `/`, viabilizando open redirect). Qualquer entrada suspeita
 * cai no destino padrão em vez de ser rejeitada com erro.
 */
export function sanitizeAdminNextPath(
  value: string | undefined | null,
): string {
  if (!value) return ADMIN_DEFAULT_PATH
  if (value.includes('\\') || value.includes('://')) return ADMIN_DEFAULT_PATH
  if (value.startsWith('//')) return ADMIN_DEFAULT_PATH
  if (value !== '/admin' && !value.startsWith('/admin/')) {
    return ADMIN_DEFAULT_PATH
  }

  const pathOnly = value.split('?')[0]?.split('#')[0] ?? ''
  if (NON_RETURNABLE.some((route) => pathOnly === route)) {
    return ADMIN_DEFAULT_PATH
  }

  return value
}
