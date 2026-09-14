import { describe, expect, it } from 'vitest'

import { readUtmParams, sanitizeSourceUtm } from '../../lib/utils/utm'

describe('readUtmParams', () => {
  it('lê as cinco chaves UTM da query string', () => {
    expect(
      readUtmParams(
        '?utm_source=instagram&utm_medium=social&utm_campaign=doe&utm_content=story&utm_term=leite',
      ),
    ).toEqual({
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'doe',
      utm_content: 'story',
      utm_term: 'leite',
    })
  })

  it('devolve objeto vazio quando a URL não tem campanha', () => {
    expect(readUtmParams('')).toEqual({})
    expect(readUtmParams('?ref=amiga')).toEqual({})
  })

  /**
   * A garantia que o RF07 depende: a URL pode carregar o que a visitante
   * digitou, e nada além das UTMs sai daqui para o tracking.
   */
  it('ignora qualquer parâmetro que não seja UTM', () => {
    expect(
      readUtmParams(
        '?cep=01001-000&email=maria@example.com&telefone=11999998888&utm_source=busca',
      ),
    ).toEqual({ utm_source: 'busca' })
  })

  it('descarta valor em branco e limita o tamanho', () => {
    expect(readUtmParams('?utm_source=%20%20')).toEqual({})
    expect(readUtmParams(`?utm_campaign=${'a'.repeat(300)}`)).toEqual({
      utm_campaign: 'a'.repeat(200),
    })
  })
})

describe('sanitizeSourceUtm', () => {
  it('mantém só as chaves UTM com valor de texto', () => {
    expect(
      sanitizeSourceUtm({
        utm_source: 'instagram',
        utm_medium: null,
        cep: '01001-000',
        nested: { utm_term: 'x' },
      }),
    ).toEqual({ utm_source: 'instagram' })
  })

  it('devolve null quando não sobra nenhuma UTM', () => {
    expect(sanitizeSourceUtm({})).toBeNull()
    expect(sanitizeSourceUtm({ cep: '01001-000' })).toBeNull()
    expect(sanitizeSourceUtm(null)).toBeNull()
    expect(sanitizeSourceUtm(['utm_source'])).toBeNull()
  })
})
