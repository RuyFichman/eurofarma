import { describe, it, expect } from 'vitest'

import {
  ADMIN_DEFAULT_PATH,
  PUBLIC_DEFAULT_PATH,
  sanitizeAdminNextPath,
  sanitizeRelativeAppPath,
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

// Sprint 6.3: o callback de e-mail (`/auth/confirmar`) redireciona para um
// `next` vindo da URL. Sem namespace fixo, a barreira contra open redirect é
// toda desta função.
describe('sanitizeRelativeAppPath', () => {
  it('aceita caminho relativo do proprio site', () => {
    expect(sanitizeRelativeAppPath('/redefinir-senha')).toBe('/redefinir-senha')
    expect(sanitizeRelativeAppPath('/meu-agendamento?x=1')).toBe(
      '/meu-agendamento?x=1',
    )
  })

  it('cai no padrao quando nao ha valor', () => {
    expect(sanitizeRelativeAppPath(null)).toBe(PUBLIC_DEFAULT_PATH)
    expect(sanitizeRelativeAppPath('')).toBe(PUBLIC_DEFAULT_PATH)
    expect(sanitizeRelativeAppPath(undefined)).toBe(PUBLIC_DEFAULT_PATH)
  })

  it('rejeita URL absoluta e protocol-relative', () => {
    expect(sanitizeRelativeAppPath('https://evil.com')).toBe(
      PUBLIC_DEFAULT_PATH,
    )
    expect(sanitizeRelativeAppPath('//evil.com')).toBe(PUBLIC_DEFAULT_PATH)
    expect(sanitizeRelativeAppPath('/redefinir://evil.com')).toBe(
      PUBLIC_DEFAULT_PATH,
    )
  })

  it('rejeita backslash, que o navegador normaliza para barra', () => {
    expect(sanitizeRelativeAppPath('/\\evil.com')).toBe(PUBLIC_DEFAULT_PATH)
    expect(sanitizeRelativeAppPath('\\evil.com')).toBe(PUBLIC_DEFAULT_PATH)
  })

  it('rejeita caminho que nao comeca com barra', () => {
    expect(sanitizeRelativeAppPath('redefinir-senha')).toBe(PUBLIC_DEFAULT_PATH)
  })

  it('aceita fallback proprio', () => {
    expect(sanitizeRelativeAppPath(null, '/outro')).toBe('/outro')
  })
})
