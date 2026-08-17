import { describe, it, expect } from 'vitest'

import {
  ADMIN_DEFAULT_PATH,
  sanitizeAdminNextPath,
} from '../../lib/auth/safe-next-path'

describe('sanitizeAdminNextPath', () => {
  it('mantém caminhos internos do painel', () => {
    expect(sanitizeAdminNextPath('/admin/unidades')).toBe('/admin/unidades')
    expect(sanitizeAdminNextPath('/admin/unidades?page=2')).toBe(
      '/admin/unidades?page=2',
    )
    expect(sanitizeAdminNextPath('/admin')).toBe('/admin')
  })

  it('cai no destino padrão quando não há valor', () => {
    expect(sanitizeAdminNextPath(undefined)).toBe(ADMIN_DEFAULT_PATH)
    expect(sanitizeAdminNextPath(null)).toBe(ADMIN_DEFAULT_PATH)
    expect(sanitizeAdminNextPath('')).toBe(ADMIN_DEFAULT_PATH)
  })

  it('recusa destino fora do namespace /admin', () => {
    expect(sanitizeAdminNextPath('/buscar')).toBe(ADMIN_DEFAULT_PATH)
    expect(sanitizeAdminNextPath('/adminlogin')).toBe(ADMIN_DEFAULT_PATH)
  })

  it('bloqueia open redirect', () => {
    expect(sanitizeAdminNextPath('//evil.com')).toBe(ADMIN_DEFAULT_PATH)
    expect(sanitizeAdminNextPath('https://evil.com/admin/x')).toBe(
      ADMIN_DEFAULT_PATH,
    )
    expect(sanitizeAdminNextPath('/admin/\\evil.com')).toBe(ADMIN_DEFAULT_PATH)
    expect(sanitizeAdminNextPath('/\\evil.com')).toBe(ADMIN_DEFAULT_PATH)
  })

  it('evita loop de volta para telas de acesso', () => {
    expect(sanitizeAdminNextPath('/admin/login')).toBe(ADMIN_DEFAULT_PATH)
    expect(sanitizeAdminNextPath('/admin/login?next=/admin/x')).toBe(
      ADMIN_DEFAULT_PATH,
    )
    expect(sanitizeAdminNextPath('/admin/sem-acesso')).toBe(ADMIN_DEFAULT_PATH)
  })
})
