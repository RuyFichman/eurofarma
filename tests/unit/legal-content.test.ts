import { describe, expect, it } from 'vitest'

import { LEGAL } from '../../lib/i18n/pt-br'

function sectionText(
  sections: readonly {
    readonly title: string
    readonly paragraphs: readonly string[]
  }[],
  title: string,
): string {
  const section = sections.find((item) => item.title === title)
  expect(section).toBeDefined()
  return section?.paragraphs.join(' ') ?? ''
}

describe('minutas legais', () => {
  it('identifica que os textos ainda exigem validação antes da publicação', () => {
    expect(LEGAL.privacy.reviewNotice).toMatch(/demonstração técnica/iu)
    expect(LEGAL.privacy.reviewNotice).toMatch(/validado/iu)
    expect(LEGAL.terms.reviewNotice).toMatch(/demonstração técnica/iu)
    expect(LEGAL.terms.reviewNotice).toMatch(/validado/iu)
  })

  it('não apresenta endereço fictício como canal institucional', () => {
    const content = JSON.stringify(LEGAL)

    expect(content).not.toContain('contato@nutrilink.com.br')
    expect(content).not.toMatch(/mailto:/iu)
  })

  it('mantém explícitos os dados institucionais pendentes', () => {
    const contact = sectionText(LEGAL.privacy.sections, '7. Contato')

    expect(contact).toMatch(/controlador/iu)
    expect(contact).toMatch(/encarregado/iu)
    expect(contact).toMatch(/canal institucional/iu)
    expect(contact).toMatch(/antes da publicação definitiva/iu)
  })

  it('preserva os limites de produto nos Termos', () => {
    const purpose = sectionText(
      LEGAL.terms.sections,
      '1. Finalidade do NutriLink',
    )

    expect(purpose).toMatch(/não realiza diagnóstico/iu)
    expect(purpose).toMatch(/não realiza.*triagem clínica/iu)
    expect(purpose).toMatch(/não realiza.*agendamento/iu)
  })
})
