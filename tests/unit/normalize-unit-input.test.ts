import { describe, it, expect } from 'vitest'

import { adminUnitFormSchema } from '../../lib/admin/units/unit-form-schema'
import { normalizeAdminUnitInput } from '../../lib/admin/units/normalize-unit-input'

/**
 * Normalização do formulário antes da gravação (Sprint 5.8).
 *
 * Os formatos esperados aqui são os que a base real já usa: CEP com hífen,
 * telefone só com dígitos e WhatsApp com DDI 55 — o mesmo que o `wa.me` consome.
 */

const baseForm = {
  name: 'Banco de Leite Teste',
  type: 'MILK_BANK',
  addressStreet: 'Rua das Flores',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: 'Centro',
  addressCity: 'São Paulo',
  addressState: 'SP',
  addressZip: '',
  phone: '',
  whatsapp: '',
  email: '',
  openingHours: '',
  instructions: '',
  whatsappMessage: '',
  latitude: '',
  longitude: '',
  status: 'PENDING',
}

/** Passa pelo schema para obter os valores de saída que a action recebe. */
function normalize(overrides: Partial<typeof baseForm> = {}) {
  const parsed = adminUnitFormSchema.parse({ ...baseForm, ...overrides })
  return normalizeAdminUnitInput(parsed)
}

describe('normalizeAdminUnitInput — opcionais vazios', () => {
  it('converte string vazia em null', () => {
    const data = normalize()
    expect(data.addressNumber).toBeNull()
    expect(data.phone).toBeNull()
    expect(data.whatsapp).toBeNull()
    expect(data.email).toBeNull()
    expect(data.addressZip).toBeNull()
    expect(data.openingHours).toBeNull()
    expect(data.instructions).toBeNull()
  })

  it('não grava espaço em branco como conteúdo', () => {
    const data = normalize({ addressComplement: '   ' })
    expect(data.addressComplement).toBeNull()
  })
})

describe('normalizeAdminUnitInput — contato', () => {
  it('reduz telefone a dígitos (formato da base)', () => {
    expect(normalize({ phone: '(11) 3986-1011' }).phone).toBe('1139861011')
  })

  it('prefixa DDI 55 no WhatsApp, como o wa.me espera', () => {
    expect(normalize({ whatsapp: '(11) 99999-8888' }).whatsapp).toBe(
      '5511999998888',
    )
  })

  it('preserva WhatsApp que já vem com DDI', () => {
    expect(normalize({ whatsapp: '5511999998888' }).whatsapp).toBe(
      '5511999998888',
    )
  })

  it('formata CEP com hífen (formato da base)', () => {
    expect(normalize({ addressZip: '01310100' }).addressZip).toBe('01310-100')
  })

  it('aceita CEP que já vem formatado', () => {
    expect(normalize({ addressZip: '01310-100' }).addressZip).toBe('01310-100')
  })

  it('normaliza e-mail para minúsculas', () => {
    expect(normalize({ email: 'Contato@Unidade.ORG.br' }).email).toBe(
      'contato@unidade.org.br',
    )
  })
})

describe('normalizeAdminUnitInput — texto institucional', () => {
  it('preserva a capitalização do nome próprio', () => {
    const data = normalize({ name: 'Banco de Leite Humano HU-USP' })
    expect(data.name).toBe('Banco de Leite Humano HU-USP')
  })

  it('normaliza UF para maiúsculas', () => {
    expect(normalize({ addressState: 'sp' }).addressState).toBe('SP')
  })

  it('mantém o horário como texto simples', () => {
    const data = normalize({ openingHours: '  Seg a Sex, 8h às 17h  ' })
    expect(data.openingHours).toBe('Seg a Sex, 8h às 17h')
  })
})

describe('normalizeAdminUnitInput — coordenadas', () => {
  it('converte o par em número', () => {
    const data = normalize({ latitude: '-23.550520', longitude: '-46.633308' })
    expect(data.lat).toBe(-23.55052)
    expect(data.lng).toBe(-46.633308)
  })

  it('aceita vírgula decimal', () => {
    const data = normalize({ latitude: '-23,55', longitude: '-46,63' })
    expect(data.lat).toBe(-23.55)
    expect(data.lng).toBe(-46.63)
  })

  it('deixa as duas nulas quando o par está vazio', () => {
    const data = normalize()
    expect(data.lat).toBeNull()
    expect(data.lng).toBeNull()
  })

  it('preserva zero como coordenada válida', () => {
    const data = normalize({ latitude: '0', longitude: '0' })
    expect(data.lat).toBe(0)
    expect(data.lng).toBe(0)
  })
})

describe('normalizeAdminUnitInput — enums', () => {
  it('repassa tipo e situação já validados', () => {
    const data = normalize({ type: 'COLLECTION_POINT', status: 'ACTIVE' })
    expect(data.type).toBe('COLLECTION_POINT')
    expect(data.status).toBe('ACTIVE')
  })
})
