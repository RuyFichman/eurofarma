import { describe, it, expect, beforeAll } from 'vitest'

import { prisma } from '../../lib/db/prisma'
import { findUnitsByLocation } from '../../lib/db/queries/units'
import { createTestUnit, createTestUnits } from '../helpers/factories'

// Isolamento: usamos UFs que o seed real NÃO usa (seed = SP/RJ), então as
// contagens são exatas mesmo o banco cloud tendo as 6 unidades reais.
describe('findUnitsByLocation', () => {
  beforeAll(async () => {
    // Garante início limpo caso uma execução anterior tenha deixado resíduo.
    await prisma.unit.deleteMany({
      where: { slug: { startsWith: '__test__' } },
    })
  })

  it('filtra por estado', async () => {
    await createTestUnits(3, () => ({ addressState: 'TO' }))
    await createTestUnits(2, () => ({ addressState: 'AC' }))

    const result = await findUnitsByLocation({ state: 'TO' })

    expect(result.total).toBe(3)
    expect(result.units).toHaveLength(3)
  })

  it('filtra por estado case-insensitive', async () => {
    await createTestUnits(3, () => ({ addressState: 'TO' }))

    const upper = await findUnitsByLocation({ state: 'TO' })
    const lower = await findUnitsByLocation({ state: 'to' })

    expect(lower.total).toBe(upper.total)
    expect(lower.total).toBe(3)
  })

  it('filtra por cidade', async () => {
    await createTestUnits(2, () => ({
      addressState: 'TO',
      addressCity: 'Cidade Teste',
    }))
    await createTestUnit({ addressState: 'TO', addressCity: 'Outra Cidade' })

    const result = await findUnitsByLocation({
      state: 'TO',
      city: 'Cidade Teste',
    })

    expect(result.total).toBe(2)
  })

  it('filtra por hasWhatsapp', async () => {
    await createTestUnits(2, () => ({
      addressState: 'TO',
      whatsapp: '5511999998888',
    }))
    await createTestUnit({ addressState: 'TO', whatsapp: null })

    const result = await findUnitsByLocation({ state: 'TO', hasWhatsapp: true })

    expect(result.total).toBe(2)
  })

  it('filtra por tipo', async () => {
    await createTestUnit({ addressState: 'TO', type: 'MILK_BANK' })
    await createTestUnit({ addressState: 'TO', type: 'COLLECTION_POINT' })

    const result = await findUnitsByLocation({
      state: 'TO',
      type: 'MILK_BANK',
    })

    expect(result.total).toBe(1)
  })

  it('exclui unidades inativas', async () => {
    await createTestUnit({ addressState: 'TO', status: 'ACTIVE' })
    await createTestUnit({ addressState: 'TO', status: 'INACTIVE' })

    const result = await findUnitsByLocation({ state: 'TO' })

    expect(result.total).toBe(1)
  })

  it('pagina resultados', async () => {
    await createTestUnits(25, () => ({ addressState: 'TO' }))

    const result = await findUnitsByLocation({
      state: 'TO',
      limit: 10,
      offset: 0,
    })

    expect(result.units).toHaveLength(10)
    expect(result.total).toBe(25)
  })

  it('ordena alfabeticamente por nome', async () => {
    await createTestUnit({ addressState: 'TO', name: 'Zeta' })
    await createTestUnit({ addressState: 'TO', name: 'Alpha' })
    await createTestUnit({ addressState: 'TO', name: 'Mu' })

    const result = await findUnitsByLocation({ state: 'TO' })

    expect(result.units.map((u) => u.name)).toEqual(['Alpha', 'Mu', 'Zeta'])
  })

  it('filtra por bairro com match parcial case-insensitive', async () => {
    await createTestUnit({
      addressState: 'TO',
      addressNeighborhood: 'Vila Madalena',
    })

    const result = await findUnitsByLocation({
      state: 'TO',
      neighborhood: 'madalena',
    })

    expect(result.total).toBe(1)
  })
})
