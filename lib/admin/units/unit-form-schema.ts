import { z } from 'zod'

import { isBrazilianState } from '../../constants/brazilian-states'
import { ADMIN } from '../../i18n/pt-br'
import {
  ADMIN_UNIT_STATUS_VALUES,
  ADMIN_UNIT_TYPE_VALUES,
  type AdminUnitStatusValue,
  type AdminUnitTypeValue,
} from './filters'

/**
 * Schema do formulário administrativo de unidade (Sprint 5.7).
 *
 * **Prisma-free** (§13): é importado pelo `AdminUnitForm`, que é Client
 * Component. Os valores de enum vêm de `filters.ts`, cujo import de
 * `@prisma/client` é type-only e some na compilação — assim a lista de valores
 * continua tendo uma única fonte, sem arrastar o Prisma para o navegador.
 *
 * **Valida, não normaliza.** Todos os campos permanecem strings com o que o
 * admin digitou: nada de `.transform()` para dígitos ou para `null`. A conversão
 * para o formato de armazenamento (telefone só com dígitos, WhatsApp com DDI 55,
 * CEP `00000-000`, `'' → null`) é responsabilidade explícita da 5.8, que fará o
 * input passar por `phoneSchema`/`whatsappSchema`/`cepSchema` de
 * `lib/validators/common.ts`. As regras de dígito abaixo espelham as de lá — se
 * uma mudar, as duas mudam juntas.
 *
 * Obrigatoriedade segue a nulabilidade real do `model Unit`: `name`, `type`,
 * `addressStreet`, `addressNeighborhood`, `addressCity` e `addressState` são
 * `NOT NULL` no schema; todo o resto é opcional e aceita string vazia.
 */

const COPY = ADMIN.units.form.validation

function isUnitTypeValue(value: string): value is AdminUnitTypeValue {
  return (ADMIN_UNIT_TYPE_VALUES as readonly string[]).includes(value)
}

function isUnitStatusValue(value: string): value is AdminUnitStatusValue {
  return (ADMIN_UNIT_STATUS_VALUES as readonly string[]).includes(value)
}

/** Campo opcional de texto livre: aceita vazio, apara as pontas e limita o tamanho. */
function optionalText(max: number, message: string) {
  return z.string().trim().max(max, message)
}

/** Só os dígitos do valor — usado pelas regras de contato. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Telefone brasileiro: 10 (fixo) ou 11 (celular) dígitos. Espelha `phoneSchema`.
 * Campo vazio é válido — a unidade pode legitimamente não ter telefone (decisão
 * do time em 2026-08-28, registrada no CLAUDE.md).
 */
const phoneField = z
  .string()
  .trim()
  .refine((value) => {
    if (value === '') return true
    const digits = digitsOf(value)
    return digits.length === 10 || digits.length === 11
  }, COPY.phoneInvalid)

/**
 * WhatsApp: 10/11 dígitos, ou 12/13 já com o DDI 55. Espelha `whatsappSchema`.
 * O DDI é acrescentado na persistência (5.8), não aqui.
 */
const whatsappField = z
  .string()
  .trim()
  .refine((value) => {
    if (value === '') return true
    const digits = digitsOf(value)
    const length = digits.length
    return (
      length === 10 ||
      length === 11 ||
      ((length === 12 || length === 13) && digits.startsWith('55'))
    )
  }, COPY.whatsappInvalid)

/** CEP: 8 dígitos, com ou sem máscara. Espelha `cepSchema`. */
const zipField = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || digitsOf(value).length === 8,
    COPY.zipInvalid,
  )

/**
 * Coordenada como texto: o input precisa distinguir "vazio" de "zero", o que um
 * `z.number()` com `valueAsNumber` não faz (campo vazio vira `NaN`). O par é
 * validado no `superRefine` do objeto; aqui só se checa o formato e a faixa.
 */
function coordinateField(min: number, max: number, message: string) {
  return z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true
      // Aceita `-23.55` e `-23,55`; recusa texto e notação científica.
      if (!/^-?\d+([.,]\d+)?$/.test(value)) return false
      const parsed = Number.parseFloat(value.replace(',', '.'))
      return Number.isFinite(parsed) && parsed >= min && parsed <= max
    }, message)
}

export const adminUnitFormSchema = z
  .object({
    // Informações básicas
    name: z.string().trim().min(3, COPY.nameRequired).max(160, COPY.nameMax),
    // `.refine` com type predicate em vez de `z.enum`: a entrada segue `string`
    // (o form precisa representar "nada selecionado" como `''`), mas a saída já
    // sai estreitada no literal, pronta para a 5.8 mapear ao enum do Prisma.
    type: z
      .string()
      .refine((value): value is AdminUnitTypeValue => isUnitTypeValue(value), {
        message: COPY.typeRequired,
      }),

    // Localização
    addressStreet: z
      .string()
      .trim()
      .min(1, COPY.streetRequired)
      .max(200, COPY.streetMax),
    addressNumber: optionalText(20, COPY.numberMax),
    addressComplement: optionalText(120, COPY.complementMax),
    addressNeighborhood: z
      .string()
      .trim()
      .min(1, COPY.neighborhoodRequired)
      .max(120, COPY.neighborhoodMax),
    addressCity: z
      .string()
      .trim()
      .min(2, COPY.cityRequired)
      .max(120, COPY.cityMax),
    addressState: z
      .string()
      .trim()
      .toUpperCase()
      .refine((value) => isBrazilianState(value), COPY.stateInvalid),
    addressZip: zipField,

    // Contato
    phone: phoneField,
    whatsapp: whatsappField,
    email: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || z.string().email().safeParse(value).success,
        COPY.emailInvalid,
      ),

    // Atendimento
    openingHours: optionalText(500, COPY.openingHoursMax),
    instructions: optionalText(2000, COPY.instructionsMax),
    whatsappMessage: optionalText(500, COPY.whatsappMessageMax),

    // Coordenadas
    latitude: coordinateField(-90, 90, COPY.latitudeInvalid),
    longitude: coordinateField(-180, 180, COPY.longitudeInvalid),

    // Publicação
    status: z
      .string()
      .refine(
        (value): value is AdminUnitStatusValue => isUnitStatusValue(value),
        { message: COPY.statusRequired },
      ),
  })
  .superRefine((values, ctx) => {
    // Coordenada solta não localiza nada e ainda quebraria o mapa da 3.6: ou o
    // par inteiro, ou nenhum dos dois.
    const hasLatitude = values.latitude !== ''
    const hasLongitude = values.longitude !== ''
    if (hasLatitude === hasLongitude) return

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [hasLatitude ? 'longitude' : 'latitude'],
      message: COPY.coordinatesPair,
    })
  })

/** Forma de entrada do React Hook Form (todos os campos são string). */
export type AdminUnitFormInput = z.input<typeof adminUnitFormSchema>

/** Forma de saída, após trim/uppercase do resolver. */
export type AdminUnitFormValues = z.output<typeof adminUnitFormSchema>

/**
 * Defaults do modo de criação.
 *
 * `status: 'PENDING'` acompanha o `@default(PENDING)` do schema Prisma — e é a
 * escolha segura: unidade recém-cadastrada não deve nascer visível na busca
 * pública antes de alguém conferir os dados. Publicar é um ato deliberado.
 */
export const ADMIN_UNIT_CREATE_DEFAULTS: AdminUnitFormInput = {
  name: '',
  // Vazio de propósito: escolher o tipo é decisão do admin, não um palpite do
  // formulário. O `Select` mostra o placeholder até haver escolha.
  type: '',
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
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
