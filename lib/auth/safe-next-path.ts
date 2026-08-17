/** Destino padrão do painel quando não há `?next=` válido. */
export const ADMIN_DEFAULT_PATH = '/admin/dashboard'

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
