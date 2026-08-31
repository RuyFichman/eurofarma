import { describe, it, expect } from 'vitest'

import {
  adminUnitFormSchema,
  ADMIN_UNIT_CREATE_DEFAULTS,
} from '../../lib/admin/units/unit-form-schema'
import { mapUnitToFormValues } from '../../lib/admin/units/map-unit-to-form-values'

/**
 * Schema e mapper do formulário administrativo de unidade (Sprint 5.7).
 *
 * Ambos são puros e não tocam no banco — por isso são testáveis sem fixture.
 */

/** Formulário mínimo válido: só os campos `NOT NULL` do `model Unit`. */
const validForm = {
  ...ADMIN_UNIT_CREATE_DEFAULTS,
  name: 'Banco de Leite Teste',
  type: 'MILK_BANK',
  addressStreet: 'Rua das Flores',
  addressNeighborhood: 'Centro',
  addressCity: 'São Paulo',
  addressState: 'SP',
}

describe('adminUnitFormSchema — campos obrigatórios', () => {
  it('aceita o formulário mínimo válido', () => {
    expect(adminUnitFormSchema.safeParse(validForm).success).toBe(true)
  })

  it('rejeita nome com menos de 3 caracteres', () => {
    const result = adminUnitFormSchema.safeParse({ ...validForm, name: 'ab' })
    expect(result.success).toBe(false)
  })

  it('rejeita tipo não selecionado', () => {
    const result = adminUnitFormSchema.safeParse({ ...validForm, type: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita tipo fora do enum', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      type: 'DROGARIA',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita situação fora do enum', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      status: 'PUBLICADA',
    })
    expect(result.success).toBe(false)
  })

  it('normaliza UF para maiúsculas', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      addressState: 'sp',
    })
    expect(result.success && result.data.addressState).toBe('SP')
  })

  it('rejeita UF inexistente', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      addressState: 'XX',
    })
    expect(result.success).toBe(false)
  })
})

describe('adminUnitFormSchema — campos opcionais', () => {
  it('aceita contato vazio (parte da rede não divulga telefone)', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      phone: '',
      whatsapp: '',
      email: '',
      addressZip: '',
    })
    expect(result.success).toBe(true)
  })

  it.each([
    ['(11) 3986-1011', true],
    ['11939861011', true],
    ['123', false],
    ['11 3986-101', false],
  ])('telefone %s → válido: %s', (phone, expected) => {
    const result = adminUnitFormSchema.safeParse({ ...validForm, phone })
    expect(result.success).toBe(expected)
  })

  it.each([
    ['11939861011', true],
    ['5511939861011', true],
    ['4411939861011', false],
    ['939861011', false],
  ])('whatsapp %s → válido: %s', (whatsapp, expected) => {
    const result = adminUnitFormSchema.safeParse({ ...validForm, whatsapp })
    expect(result.success).toBe(expected)
  })

  it.each([
    ['01234-567', true],
    ['01234567', true],
    ['1234', false],
  ])('CEP %s → válido: %s', (addressZip, expected) => {
    const result = adminUnitFormSchema.safeParse({ ...validForm, addressZip })
    expect(result.success).toBe(expected)
  })

  it('rejeita e-mail malformado', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      email: 'contato@',
    })
    expect(result.success).toBe(false)
  })
})

describe('adminUnitFormSchema — coordenadas', () => {
  it('aceita o par inteiro vazio', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      latitude: '',
      longitude: '',
    })
    expect(result.success).toBe(true)
  })

  it('aceita o par inteiro preenchido', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      latitude: '-23.550520',
      longitude: '-46.633308',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita latitude sem longitude', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      latitude: '-23.55',
      longitude: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['longitude'])
    }
  })

  it('rejeita longitude sem latitude', () => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      latitude: '',
      longitude: '-46.63',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['latitude'])
    }
  })

  it.each([
    ['91', '0', false],
    ['0', '181', false],
    ['-90', '-180', true],
    ['abc', '0', false],
  ])('lat %s / lng %s → válido: %s', (latitude, longitude, expected) => {
    const result = adminUnitFormSchema.safeParse({
      ...validForm,
      latitude,
      longitude,
    })
    expect(result.success).toBe(expected)
  })
})

describe('ADMIN_UNIT_CREATE_DEFAULTS', () => {
  it('nasce PENDING, nunca publicada sem revisão', () => {
    expect(ADMIN_UNIT_CREATE_DEFAULTS.status).toBe('PENDING')
  })

  it('não pré-seleciona um tipo', () => {
    expect(ADMIN_UNIT_CREATE_DEFAULTS.type).toBe('')
  })
})

describe('mapUnitToFormValues', () => {
  const dbUnit = {
    name: 'Banco de Leite Cachoeirinha',
    type: 'MILK_BANK' as const,
    status: 'ACTIVE' as const,
    addressStreet: 'Av. Deputado Emílio Carlos',
    addressNumber: null,
    addressComplement: null,
    addressNeighborhood: 'Cachoeirinha',
    addressCity: 'São Paulo',
    addressState: 'SP',
    addressZip: null,
    phone: '1139861011',
    whatsapp: null,
    email: null,
    openingHours: null,
    instructions: null,
    whatsappMessage: null,
    lat: null,
    lng: null,
  }

  it('converte colunas nulas em string vazia', () => {
    const values = mapUnitToFormValues(dbUnit)
    expect(values.whatsapp).toBe('')
    expect(values.addressNumber).toBe('')
    expect(values.instructions).toBe('')
  })

  it('preserva os valores preenchidos', () => {
    const values = mapUnitToFormValues(dbUnit)
    expect(values.name).toBe('Banco de Leite Cachoeirinha')
    expect(values.phone).toBe('1139861011')
    expect(values.status).toBe('ACTIVE')
  })

  it('converte coordenadas em texto, preservando zero', () => {
    const values = mapUnitToFormValues({ ...dbUnit, lat: 0, lng: -46.63 })
    expect(values.latitude).toBe('0')
    expect(values.longitude).toBe('-46.63')
  })

  it('lê openingHours quando é string simples (formato da base atual)', () => {
    const values = mapUnitToFormValues({
      ...dbUnit,
      openingHours: 'Seg a Sex, 8h às 17h',
    })
    expect(values.openingHours).toBe('Seg a Sex, 8h às 17h')
  })

  it('extrai texto de openingHours em objeto, sem exibir JSON cru', () => {
    const values = mapUnitToFormValues({
      ...dbUnit,
      openingHours: { text: 'Seg a Sex, 9h às 16h' },
    })
    expect(values.openingHours).toBe('Seg a Sex, 9h às 16h')
  })

  it('devolve o resultado do mapper já aceito pelo schema', () => {
    const values = mapUnitToFormValues(dbUnit)
    expect(adminUnitFormSchema.safeParse(values).success).toBe(true)
  })
})
