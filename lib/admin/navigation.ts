/**
 * Itens estruturais da navegação administrativa.
 *
 * Só chave + href — os rótulos vivem em `ADMIN_LAYOUT.navigation.items` no i18n
 * (Princípio 7). Este módulo é consumido por Client Component, então precisa
 * continuar sem qualquer caminho até `@prisma/client`.
 */
export const ADMIN_NAV_ITEMS = [
  { key: 'dashboard', href: '/admin/dashboard' },
  { key: 'units', href: '/admin/unidades' },
  { key: 'nutrizes', href: '/admin/nutrizes' },
  { key: 'contents', href: '/admin/conteudos' },
  { key: 'campaigns', href: '/admin/campanhas' },
] as const

export type AdminNavItem = (typeof ADMIN_NAV_ITEMS)[number]
export type AdminNavKey = AdminNavItem['key']
