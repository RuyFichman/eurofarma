import { describe, it, expect } from 'vitest'

import {
  unitCreateSchema,
  unitUpdateSchema,
  unitCsvRowSchema,
} from '../../lib/validators/unit'

const validUnit = {
  name: 'Banco Teste',
  type: 'MILK_BANK',
  addressStreet: 'Rua A',
  addressNeighborhood: 'Centro',
  addressCity: 'São Paulo',
  addressState: 'SP',
}

describe('unitCreateSchema', () => {
  it('aceita objeto completo válido', () => {
    expect(unitCreateSchema.safeParse(validUnit).success).toBe(true)
  })

  it('rejeita sem name', () => {
    const { name: _omit, ...semNome } = validUnit
    expect(unitCreateSchema.safeParse(semNome).success).toBe(false)
  })

  it('rejeita addressState inválido', () => {
    expect(
      unitCreateSchema.safeParse({ ...validUnit, addressState: 'XX' }).success,
    ).toBe(false)
  })

  it('normaliza whatsapp quando presente', () => {
    const result = unitCreateSchema.parse({
      ...validUnit,
      whatsapp: '(11) 99999-8888',
    })
    expect(result.whatsapp).toBe('5511999998888')
  })

  it('aceita sem whatsapp (opcional)', () => {
    expect(unitCreateSchema.safeParse(validUnit).success).toBe(true)
  })

  it('rejeita lat fora do range', () => {
    expect(unitCreateSchema.safeParse({ ...validUnit, lat: 91 }).success).toBe(
      false,
    )
  })

  it('rejeita lng fora do range', () => {
    expect(
      unitCreateSchema.safeParse({ ...validUnit, lng: -181 }).success,
    ).toBe(false)
  })
})

describe('unitUpdateSchema', () => {
  it('aceita objeto vazio', () => {
    expect(unitUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('aceita apenas 1 campo', () => {
    expect(unitUpdateSchema.safeParse({ name: 'Novo Nome' }).success).toBe(true)
  })

  it('rejeita campo com tipo errado', () => {
    expect(unitUpdateSchema.safeParse({ lat: 'não-é-número' }).success).toBe(
      false,
    )
  })
})

describe('unitCsvRowSchema', () => {
  const csvRow = {
    name: 'Banco CSV',
    type: 'MILK_BANK',
    address_street: 'Rua B',
    address_number: '123',
    address_neighborhood: 'Bairro X',
    address_city: 'Rio de Janeiro',
    address_state: 'rj',
    address_zip: '20520051',
    phone: '(21) 3333-4444',
    whatsapp: '21999998888',
    opening_hours: 'Seg a Sex 8h-17h',
    instructions: '',
  }

  it('transforma snake_case em camelCase', () => {
    const result = unitCsvRowSchema.parse(csvRow)
    expect(result.addressStreet).toBe('Rua B')
    expect(result.addressNeighborhood).toBe('Bairro X')
  })

  it('normaliza address_state para maiúsculo', () => {
    expect(unitCsvRowSchema.parse(csvRow).addressState).toBe('RJ')
  })

  it('trata string vazia como undefined', () => {
    expect(unitCsvRowSchema.parse(csvRow).instructions).toBeUndefined()
  })

  it('normaliza phone e whatsapp', () => {
    const result = unitCsvRowSchema.parse(csvRow)
    expect(result.phone).toBe('2133334444')
    expect(result.whatsapp).toBe('5521999998888')
  })
})
