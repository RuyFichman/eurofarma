import { describe, it, expect } from 'vitest'

import { generateSlug, generateSlugWithSuffix } from '../../lib/utils/slug'

describe('generateSlug', () => {
  it('gera slug básico em ASCII', () => {
    expect(generateSlug('Banco Teste', 'SP', 'São Paulo')).toBe(
      'banco-teste-sp-sao-paulo',
    )
  })

  it('remove acentos', () => {
    expect(generateSlug('Instituição Pediátrica', 'RJ', 'Niterói')).toBe(
      'instituicao-pediatrica-rj-niteroi',
    )
  })

  it('sanitiza caracteres especiais', () => {
    const slug = generateSlug('Banco / Hospital & Cia', 'SP', 'São Paulo')
    expect(slug).not.toContain('/')
    expect(slug).not.toContain('&')
    expect(slug).toMatch(/^[a-z0-9-]+$/)
  })

  it('lança erro com nome vazio', () => {
    expect(() => generateSlug('', 'SP', 'São Paulo')).toThrow()
  })

  it('lança erro com nome só de espaços', () => {
    expect(() => generateSlug('   ', 'SP', 'São Paulo')).toThrow()
  })

  it('lança erro com UF de mais de 2 caracteres', () => {
    expect(() => generateSlug('Teste', 'SPP', 'São Paulo')).toThrow()
  })

  it('lança erro com UF de menos de 2 caracteres', () => {
    expect(() => generateSlug('Teste', 'S', 'São Paulo')).toThrow()
  })
})

describe('generateSlugWithSuffix', () => {
  it('retorna o base sem mudança com suffix 1', () => {
    expect(generateSlugWithSuffix('teste-sp-sao-paulo', 1)).toBe(
      'teste-sp-sao-paulo',
    )
  })

  it('adiciona -2 com suffix 2', () => {
    expect(generateSlugWithSuffix('teste-sp-sao-paulo', 2)).toBe(
      'teste-sp-sao-paulo-2',
    )
  })

  it('adiciona -99 com suffix 99', () => {
    expect(generateSlugWithSuffix('teste-sp-sao-paulo', 99)).toBe(
      'teste-sp-sao-paulo-99',
    )
  })
})
