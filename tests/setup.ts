import { afterAll, afterEach, expect } from 'vitest'

import { prisma } from '../lib/db/prisma'

/**
 * Limpeza global. Só toca o banco em testes de INTEGRAÇÃO (path contém
 * `integration`) — assim os testes unitários ficam puros e rápidos, sem
 * round-trip ao banco cloud. Remove apenas registros com marcador `__test__`.
 */
afterEach(async () => {
  const testPath = expect.getState().testPath ?? ''
  if (!testPath.includes('integration')) {
    return
  }
  // Ordem importa: whatsapp_clicks tem FK RESTRICT para units.
  await prisma.whatsappClick.deleteMany({
    where: { unit: { slug: { startsWith: '__test__' } } },
  })
  await prisma.contactIntent.deleteMany({
    where: { unit: { slug: { startsWith: '__test__' } } },
  })
  await prisma.unit.deleteMany({ where: { slug: { startsWith: '__test__' } } })
  await prisma.nutrizProfile.deleteMany({
    where: { fullName: { startsWith: '__test__' } },
  })
})

afterAll(async () => {
  await prisma.$disconnect()
})
