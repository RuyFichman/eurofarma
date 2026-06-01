import {
  ufSchema,
  whatsappSchema,
  phoneSchema,
  cepSchema,
  emailSchema,
} from '../lib/validators/common'
import { unitCreateSchema, unitCsvRowSchema } from '../lib/validators/unit'
import { nutrizSignupSchema } from '../lib/validators/nutriz'
import { generateSlug, generateSlugWithSuffix } from '../lib/utils/slug'

type Case = { label: string; run: () => unknown; shouldFail: boolean }

const cases: Case[] = [
  // common
  {
    label: 'UF valida (SP)',
    run: () => ufSchema.parse('SP'),
    shouldFail: false,
  },
  {
    label: 'UF invalida (XX)',
    run: () => ufSchema.parse('XX'),
    shouldFail: true,
  },
  {
    label: 'WhatsApp 11 digitos (DDD+celular)',
    run: () => whatsappSchema.parse('11999998888'),
    shouldFail: false,
  },
  {
    label: 'WhatsApp com formatacao',
    run: () => whatsappSchema.parse('(11) 99999-8888'),
    shouldFail: false,
  },
  {
    label: 'WhatsApp invalido (poucos digitos)',
    run: () => whatsappSchema.parse('123'),
    shouldFail: true,
  },
  {
    label: 'Phone fixo valido',
    run: () => phoneSchema.parse('(11) 3333-4444'),
    shouldFail: false,
  },
  {
    label: 'CEP formatado',
    run: () => cepSchema.parse('05508000'),
    shouldFail: false,
  },
  {
    label: 'CEP invalido',
    run: () => cepSchema.parse('123'),
    shouldFail: true,
  },
  {
    label: 'Email valido',
    run: () => emailSchema.parse('teste@example.com'),
    shouldFail: false,
  },
  {
    label: 'Email invalido',
    run: () => emailSchema.parse('nope'),
    shouldFail: true,
  },

  // slug
  {
    label: 'Slug basico',
    run: () => generateSlug('Banco de Leite HU', 'SP', 'São Paulo'),
    shouldFail: false,
  },
  {
    label: 'Slug com acentos',
    run: () => generateSlug('Instituição Pediátrica', 'RJ', 'Niterói'),
    shouldFail: false,
  },
  {
    label: 'Slug com nome vazio',
    run: () => generateSlug('', 'SP', 'São Paulo'),
    shouldFail: true,
  },
  {
    label: 'Slug com UF invalida (1 letra)',
    run: () => generateSlug('Teste', 'S', 'São Paulo'),
    shouldFail: true,
  },
  {
    label: 'Slug com sufixo 1 (sem mudanca)',
    run: () => generateSlugWithSuffix('teste-sp-sao-paulo', 1),
    shouldFail: false,
  },
  {
    label: 'Slug com sufixo 2',
    run: () => generateSlugWithSuffix('teste-sp-sao-paulo', 2),
    shouldFail: false,
  },

  // unit
  {
    label: 'Unit create valida',
    run: () =>
      unitCreateSchema.parse({
        name: 'Banco Teste',
        type: 'MILK_BANK',
        addressStreet: 'Rua A',
        addressNeighborhood: 'Centro',
        addressCity: 'São Paulo',
        addressState: 'SP',
      }),
    shouldFail: false,
  },
  {
    label: 'Unit create faltando obrigatorio',
    run: () =>
      unitCreateSchema.parse({
        name: 'Banco Teste',
        type: 'MILK_BANK',
      }),
    shouldFail: true,
  },
  {
    label: 'Unit CSV row com snake_case',
    run: () =>
      unitCsvRowSchema.parse({
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
      }),
    shouldFail: false,
  },

  // nutriz
  {
    label: 'Nutriz signup valido',
    run: () =>
      nutrizSignupSchema.parse({
        fullName: 'Maria Silva',
        phoneWhatsapp: '11999998888',
        state: 'SP',
        city: 'São Paulo',
        lgpdConsent: true,
      }),
    shouldFail: false,
  },
  {
    label: 'Nutriz signup sem LGPD',
    run: () =>
      nutrizSignupSchema.parse({
        fullName: 'Maria Silva',
        phoneWhatsapp: '11999998888',
        state: 'SP',
        city: 'São Paulo',
        lgpdConsent: false,
      }),
    shouldFail: true,
  },
]

let passed = 0
let failed = 0

for (const c of cases) {
  try {
    const result = c.run()
    if (c.shouldFail) {
      console.log(`X ${c.label} — esperava falha mas passou`)
      failed++
    } else {
      console.log(`OK ${c.label} — ${JSON.stringify(result).slice(0, 100)}`)
      passed++
    }
  } catch (err) {
    if (c.shouldFail) {
      console.log(`OK ${c.label} — falhou como esperado`)
      passed++
    } else {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`X ${c.label} — falha inesperada: ${msg.slice(0, 100)}`)
      failed++
    }
  }
}

console.log(`\n--- Sumario ---`)
console.log(`Passou: ${passed}`)
console.log(`Falhou: ${failed}`)
console.log(`Total: ${cases.length}`)

if (failed > 0) {
  process.exit(1)
}
