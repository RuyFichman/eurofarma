import { describe, expect, it } from 'vitest'

import { prisma } from '../../lib/db/prisma'
import { recordContactChannelClick } from '../../lib/db/queries/contact-clicks'

/**
 * O evento do RF07 é anônimo: não tem nome, slug nem FK por onde o cleanup
 * global se agarrar. O marcador possível é a própria campanha de origem, então
 * todo clique criado aqui nasce com esta UTM — é ela que o `tests/setup.ts`
 * usa para remover as linhas de teste do banco cloud.
 */
const TEST_UTM_SOURCE = '__test__contact-click'

function testUtm(overrides: Record<string, string> = {}) {
  return { utm_source: TEST_UTM_SOURCE, ...overrides }
}

describe('recordContactChannelClick', () => {
  it('grava o clique no WhatsApp com a campanha de origem', async () => {
    const { id } = await recordContactChannelClick({
      channel: 'whatsapp',
      surface: 'coverage_result',
      sourceUtm: testUtm({ utm_medium: 'social' }),
    })

    const stored = await prisma.contactChannelClick.findUniqueOrThrow({
      where: { id },
    })

    expect(stored.channel).toBe('WHATSAPP')
    expect(stored.surface).toBe('COVERAGE_RESULT')
    expect(stored.sourceUtm).toEqual({
      utm_source: TEST_UTM_SOURCE,
      utm_medium: 'social',
    })
    expect(stored.createdAt).toBeInstanceOf(Date)
  })

  it('grava o clique no telefone', async () => {
    const { id } = await recordContactChannelClick({
      channel: 'phone',
      surface: 'coverage_result',
      sourceUtm: testUtm(),
    })

    const stored = await prisma.contactChannelClick.findUniqueOrThrow({
      where: { id },
    })

    expect(stored.channel).toBe('PHONE')
  })

  /** Sem campanha na URL a coluna fica nula — não vira objeto vazio. */
  it('aceita clique sem UTM', async () => {
    const { id } = await recordContactChannelClick({
      channel: 'whatsapp',
      surface: 'coverage_result',
      sourceUtm: null,
    })

    try {
      const stored = await prisma.contactChannelClick.findUniqueOrThrow({
        where: { id },
      })
      expect(stored.sourceUtm).toBeNull()
    } finally {
      // Sem UTM não há marcador: esta linha se limpa sozinha.
      await prisma.contactChannelClick.delete({ where: { id } })
    }
  })

  /**
   * A garantia estrutural do RF07: o modelo não tem para onde apontar uma
   * unidade legada, uma nutriz, um CEP ou um referrer.
   */
  it('não expõe colunas de unidade, nutriz ou dado pessoal', async () => {
    const { id } = await recordContactChannelClick({
      channel: 'whatsapp',
      surface: 'coverage_result',
      sourceUtm: testUtm(),
    })

    const stored = await prisma.contactChannelClick.findUniqueOrThrow({
      where: { id },
    })

    expect(Object.keys(stored).sort()).toEqual([
      'channel',
      'createdAt',
      'id',
      'sourceUtm',
      'surface',
    ])
  })
})
