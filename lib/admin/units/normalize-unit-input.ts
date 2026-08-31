import { cepSchema, emailSchema, phoneSchema } from '../../validators/common'
import { normalizeBrazilianWhatsappNumber } from '../../utils/whatsapp'
import type { AdminUnitStatusValue, AdminUnitTypeValue } from './filters'
import type { AdminUnitFormValues } from './unit-form-schema'

/**
 * Normalização do formulário de unidade antes da gravação (Sprint 5.8).
 *
 * A 5.7 deliberadamente **valida sem normalizar**: os campos chegam aqui como o
 * admin digitou. Este módulo é o **único** ponto onde o dado muda de forma, e
 * ele reusa os mesmos schemas que o importador de CSV e a busca pública já
 * usam — por isso uma unidade cadastrada pela tela fica indistinguível de uma
 * vinda do seed da rBLH.
 *
 * Formatos confirmados na base em 2026-08-31 (487 unidades):
 * - CEP com hífen (`00000-000`) — 485/485 preenchidos;
 * - telefone só dígitos (`1139861011`) — 454/454 preenchidos;
 * - WhatsApp com DDI 55, igual ao que `buildWhatsappUrl` consome no `wa.me`.
 *
 * Prisma-free: devolve um objeto simples, testável sem banco. Quem chama é que
 * traduz para `Prisma.UnitCreateInput`/`UpdateInput`.
 */

export type NormalizedAdminUnitInput = {
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
  openingHours: string | null
  instructions: string | null
  whatsappMessage: string | null
  lat: number | null
  lng: number | null
}

/**
 * Texto opcional → `null` quando não sobra conteúdo. Espaço em branco não é
 * dado: `'   '` vira `null`, nunca uma coluna preenchida com nada.
 */
function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Aplica um schema de `lib/validators/common.ts` a um campo opcional.
 * Vazio → `null`. Valor que não passa → `null` também: o formulário já validou
 * antes, então aqui isso só aconteceria com entrada forjada, e gravar `null` é
 * mais seguro do que gravar lixo.
 */
function normalizeWith(
  value: string,
  schema: { safeParse: (input: string) => { success: boolean; data?: string } },
): string | null {
  const trimmed = value.trim()
  if (trimmed === '') return null

  const result = schema.safeParse(trimmed)
  return result.success && result.data !== undefined ? result.data : null
}

/**
 * Coordenada em texto → número. Aceita vírgula decimal (`-23,55`), como o
 * schema da 5.7. Vazio ou inválido → `null`.
 */
function toCoordinate(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null

  const parsed = Number.parseFloat(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeAdminUnitInput(
  values: AdminUnitFormValues,
): NormalizedAdminUnitInput {
  const lat = toCoordinate(values.latitude)
  const lng = toCoordinate(values.longitude)

  // O par é validado no schema, mas repetimos a regra aqui: se uma das duas se
  // perder na conversão, nenhuma é gravada — meia coordenada posicionaria o
  // mapa da 3.6 no lugar errado, o que é pior que não ter mapa.
  const hasCoordinates = lat !== null && lng !== null

  return {
    // Capitalização preservada: são nomes próprios de instituição.
    name: values.name.trim(),
    type: values.type,
    status: values.status,

    addressStreet: values.addressStreet.trim(),
    addressNumber: emptyToNull(values.addressNumber),
    addressComplement: emptyToNull(values.addressComplement),
    addressNeighborhood: values.addressNeighborhood.trim(),
    addressCity: values.addressCity.trim(),
    // O schema já aplica `.toUpperCase()`; o trim aqui cobre o `char(2)`.
    addressState: values.addressState.trim().toUpperCase(),
    addressZip: normalizeWith(values.addressZip, cepSchema),

    phone: normalizeWith(values.phone, phoneSchema),
    // Mesma função que monta o link `wa.me` no público — um número gravado aqui
    // é exatamente o que o botão da nutriz vai discar.
    whatsapp: normalizeBrazilianWhatsappNumber(values.whatsapp),
    email: normalizeWith(values.email, emailSchema),

    // Texto puro. A coluna é `Json?`, mas a base inteira guarda string simples e
    // os renderizadores públicos (3.5/3.6) leem exatamente isso.
    openingHours: emptyToNull(values.openingHours),
    instructions: emptyToNull(values.instructions),
    whatsappMessage: emptyToNull(values.whatsappMessage),

    lat: hasCoordinates ? lat : null,
    lng: hasCoordinates ? lng : null,
  }
}
