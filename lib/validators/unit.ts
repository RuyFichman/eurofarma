import { z } from 'zod'
import { UnitType } from '@prisma/client'
import {
  ufSchema,
  whatsappSchema,
  phoneSchema,
  cepSchema,
  emailSchema,
  stringNotEmptySchema,
} from './common'

/** Trata string vazia (comum em CSV) como `undefined` em campos opcionais. */
const optionalString = z
  .string()
  .transform((value) => (value.trim() === '' ? undefined : value.trim()))
  .optional()

/**
 * Schema completo para criar uma Unit (API admin ou seed).
 * Usa camelCase, alinhado ao Prisma Client.
 */
export const unitCreateSchema = z.object({
  name: stringNotEmptySchema.min(3, 'Nome muito curto.').max(200),
  type: z.nativeEnum(UnitType),
  addressStreet: stringNotEmptySchema.max(200),
  addressNumber: z.string().trim().max(20).optional(),
  addressComplement: z.string().trim().max(120).optional(),
  addressNeighborhood: stringNotEmptySchema.max(120),
  addressCity: stringNotEmptySchema.max(120),
  addressState: ufSchema,
  addressZip: cepSchema.optional(),
  phone: phoneSchema.optional(),
  whatsapp: whatsappSchema.optional(),
  email: emailSchema.optional(),
  openingHours: z.unknown().optional(),
  instructions: z.string().trim().max(2000).optional(),
  whatsappMessage: z.string().trim().max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  adminNotes: z.string().trim().max(2000).optional(),
})

/** Versao parcial para `PATCH /api/admin/units/[id]`. */
export const unitUpdateSchema = unitCreateSchema.partial()

/**
 * Schema para validar uma linha de CSV (cabecalho em snake_case).
 * Aplica `.transform()` final convertendo para o formato camelCase do `unitCreateSchema`.
 */
export const unitCsvRowSchema = z
  .object({
    name: stringNotEmptySchema,
    type: z.nativeEnum(UnitType),
    address_street: stringNotEmptySchema,
    address_number: optionalString,
    address_neighborhood: stringNotEmptySchema,
    address_city: stringNotEmptySchema,
    address_state: z
      .string()
      .transform((value) => value.toUpperCase())
      .pipe(ufSchema),
    address_zip: optionalString.pipe(cepSchema.optional()),
    phone: optionalString.pipe(phoneSchema.optional()),
    whatsapp: optionalString.pipe(whatsappSchema.optional()),
    opening_hours: optionalString,
    instructions: optionalString,
  })
  .transform((row) => ({
    name: row.name,
    type: row.type,
    addressStreet: row.address_street,
    addressNumber: row.address_number,
    addressNeighborhood: row.address_neighborhood,
    addressCity: row.address_city,
    addressState: row.address_state,
    addressZip: row.address_zip,
    phone: row.phone,
    whatsapp: row.whatsapp,
    openingHours: row.opening_hours,
    instructions: row.instructions,
  }))

export type UnitCreateInput = z.infer<typeof unitCreateSchema>
export type UnitUpdateInput = z.infer<typeof unitUpdateSchema>
export type UnitCsvRow = z.infer<typeof unitCsvRowSchema>
