import type { AdminUnitFormInput } from './unit-form-schema'
import type { AdminUnitStatusValue, AdminUnitTypeValue } from './filters'

/**
 * Converte a unidade vinda do banco nos valores do formulário (Sprint 5.7).
 *
 * Duas responsabilidades, ambas para manter o React Hook Form previsível:
 * coluna nula vira `''` (input controlado nunca alterna entre controlado e não
 * controlado) e número vira texto (o campo de coordenada precisa distinguir
 * "vazio" de "zero").
 *
 * Prisma-free: recebe uma forma estrutural, não o tipo gerado — o que também
 * deixa a função testável sem banco.
 */

export type MappableAdminUnit = {
  name: string
  type: AdminUnitTypeValue
  status: AdminUnitStatusValue
  addressStreet: string
  addressNumber: string | null
  addressComplement: string | null
  addressNeighborhood: string
  addressCity: string
  addressState: string
  addressZip: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  openingHours: unknown
  instructions: string | null
  whatsappMessage: string | null
  lat: number | null
  lng: number | null
}

/** Coluna anulável → campo de texto vazio. */
function textOf(value: string | null): string {
  return value ?? ''
}

/** Número → texto do input. `null` vira `''`; `0` continua sendo "0". */
function numberToText(value: number | null): string {
  return value === null ? '' : String(value)
}

/**
 * Extrai texto de `openingHours` (`Json?`).
 *
 * Espelha o `readableOpeningHours` do card público (3.5) e da página de
 * detalhes (3.6): string é usada direto; objeto cede um campo textual conhecido.
 * Formato que não caiba em texto vira `''` — e é por isso que a 5.8 **não pode**
 * gravar este campo cegamente quando ele chegar vazio sobre um valor
 * estruturado preexistente. Hoje a questão é teórica: as 487 unidades da base
 * têm `opening_hours` nulo (verificado em 2026-08-31).
 */
function openingHoursToText(value: unknown): string {
  if (typeof value === 'string') return value.trim()

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of ['text', 'label', 'description', 'summary'] as const) {
      const field = (value as Record<string, unknown>)[key]
      if (typeof field === 'string' && field.trim() !== '') return field.trim()
    }
  }

  return ''
}

export function mapUnitToFormValues(
  unit: MappableAdminUnit,
): AdminUnitFormInput {
  return {
    name: unit.name,
    type: unit.type,
    addressStreet: unit.addressStreet,
    addressNumber: textOf(unit.addressNumber),
    addressComplement: textOf(unit.addressComplement),
    addressNeighborhood: unit.addressNeighborhood,
    addressCity: unit.addressCity,
    addressState: unit.addressState.trim(),
    addressZip: textOf(unit.addressZip),
    phone: textOf(unit.phone),
    whatsapp: textOf(unit.whatsapp),
    email: textOf(unit.email),
    openingHours: openingHoursToText(unit.openingHours),
    instructions: textOf(unit.instructions),
    whatsappMessage: textOf(unit.whatsappMessage),
    latitude: numberToText(unit.lat),
    longitude: numberToText(unit.lng),
    status: unit.status,
  }
}
