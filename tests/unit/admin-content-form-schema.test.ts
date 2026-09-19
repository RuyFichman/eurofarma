import { describe, expect, it } from 'vitest'

import { adminContentFormSchema } from '../../lib/admin/contents/content-form-schema'

describe('formulário administrativo de conteúdo', () => {
  it('normaliza os campos válidos', () => {
    expect(
      adminContentFormSchema.parse({
        title: '  Como armazenar o leite  ',
        category: '  Armazenamento  ',
        bodyMarkdown:
          '  ## Conservação\n\nSiga as orientações recebidas do Lactare.  ',
        status: 'PUBLISHED',
      }),
    ).toEqual({
      title: 'Como armazenar o leite',
      category: 'Armazenamento',
      bodyMarkdown:
        '## Conservação\n\nSiga as orientações recebidas do Lactare.',
      status: 'PUBLISHED',
    })
  })

  it('aceita categoria vazia para gravação como nulo', () => {
    const result = adminContentFormSchema.safeParse({
      title: 'Cuidados de higiene',
      category: '',
      bodyMarkdown: 'Lave as mãos antes de iniciar cada extração de leite.',
      status: 'DRAFT',
    })

    expect(result.success).toBe(true)
  })

  it('rejeita título sem slug útil, corpo curto e situação inválida', () => {
    const result = adminContentFormSchema.safeParse({
      title: '***',
      category: '',
      bodyMarkdown: 'curto',
      status: 'ARCHIVED',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined()
      expect(result.error.flatten().fieldErrors.bodyMarkdown).toBeDefined()
      expect(result.error.flatten().fieldErrors.status).toBeDefined()
    }
  })
})
