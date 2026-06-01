import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

import { prisma } from '../lib/db/prisma'
import { unitCsvRowSchema, type UnitCsvRow } from '../lib/validators/unit'
import { generateSlug, generateSlugWithSuffix } from '../lib/utils/slug'

const SEEDS_DIR = join(process.cwd(), 'data', 'seeds', 'units')
const ERROR_LOG = join(process.cwd(), 'seed-errors.log')
const MAX_SLUG_SUFFIX = 99

type SeedError = {
  file: string
  line: number
  message: string
}

type SeedSummary = {
  processed: number
  created: number
  updated: number
  errors: number
}

/** Lista os `.csv` de SEEDS_DIR (ignora ocultos `.`, mantem `_fallback`), ordenados. */
function listCsvFiles(): string[] {
  if (!existsSync(SEEDS_DIR)) {
    throw new Error(`Diretorio de seeds nao encontrado: ${SEEDS_DIR}`)
  }
  return readdirSync(SEEDS_DIR)
    .filter(
      (name) => name.toLowerCase().endsWith('.csv') && !name.startsWith('.'),
    )
    .sort((a, b) => a.localeCompare(b))
}

/** Le e parseia um CSV em objetos brutos (sem validar). Remove BOM se presente. */
function parseCsv(fileName: string): unknown[] {
  const content = readFileSync(join(SEEDS_DIR, fileName), 'utf-8').replace(
    /^﻿/,
    '',
  )
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
  return records as unknown[]
}

/** Valida uma linha com o schema centralizado. Retorna dados em camelCase ou null. */
function validateRow(
  rawRow: unknown,
  fileName: string,
  lineNumber: number,
  errors: SeedError[],
): UnitCsvRow | null {
  const result = unitCsvRowSchema.safeParse(rawRow)
  if (result.success) {
    return result.data
  }
  const message = result.error.issues
    .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
    .join('; ')
  errors.push({ file: fileName, line: lineNumber, message })
  return null
}

/**
 * Resolve um slug unico. O slug e deterministico (nome+uf+cidade), entao se ele
 * ja existe e pertence a MESMA unidade, reusamos o base e o upsert atualiza
 * (garante idempotencia). So aplicamos sufixo (`-2`, `-3`, ...) quando quem ocupa
 * o slug for OUTRA unidade com nome igual — colisao real e rara entre unidades
 * distintas, tratavel manualmente pelo admin depois.
 */
async function resolveUniqueSlug(
  baseSlug: string,
  candidate: Pick<UnitCsvRow, 'name' | 'addressState' | 'addressCity'>,
): Promise<string> {
  for (let suffix = 1; suffix <= MAX_SLUG_SUFFIX; suffix++) {
    const slug = generateSlugWithSuffix(baseSlug, suffix)
    const existing = await prisma.unit.findUnique({ where: { slug } })
    if (!existing) {
      return slug
    }
    const sameUnit =
      existing.name === candidate.name &&
      existing.addressState === candidate.addressState &&
      existing.addressCity === candidate.addressCity
    if (sameUnit) {
      return slug
    }
  }
  throw new Error(
    `Nao foi possivel gerar slug unico para "${baseSlug}" apos ${MAX_SLUG_SUFFIX} tentativas.`,
  )
}

/**
 * Faz upsert da unidade pela chave `slug`. Dados de seed entram como ACTIVE
 * (ja foram curados manualmente). Detecta create vs update por pre-checagem de
 * existencia — mais confiavel que comparar timestamps (cloud tem skew de relogio).
 */
async function upsertUnit(
  data: UnitCsvRow,
  slug: string,
): Promise<'created' | 'updated'> {
  const existing = await prisma.unit.findUnique({
    where: { slug },
    select: { id: true },
  })
  await prisma.unit.upsert({
    where: { slug },
    create: { ...data, slug, status: 'ACTIVE' },
    update: { ...data },
  })
  return existing ? 'updated' : 'created'
}

/** Escreve o log de erros (sobrescreve). Sempre escreve algo, mesmo sem erros. */
function writeErrorLog(errors: SeedError[]): void {
  const now = new Date().toISOString()
  const lines: string[] = []
  if (errors.length === 0) {
    lines.push(`Execução em ${now}: sem erros.`)
  } else {
    lines.push(`Execução em ${now}: ${errors.length} erro(s).`)
    lines.push('')
    for (const error of errors) {
      lines.push(`[${now}] ${error.file}:${error.line} - ${error.message}`)
    }
  }
  writeFileSync(ERROR_LOG, `${lines.join('\n')}\n`, 'utf-8')
}

async function main(): Promise<void> {
  const startedAt = new Date().toISOString()
  console.log(`--- Seed iniciado em ${startedAt} ---`)

  const files = listCsvFiles()
  const errors: SeedError[] = []
  const summary: SeedSummary = {
    processed: 0,
    created: 0,
    updated: 0,
    errors: 0,
  }

  for (const file of files) {
    console.log(`Processando ${file}...`)
    const rows = parseCsv(file)
    for (let index = 0; index < rows.length; index++) {
      const lineNumber = index + 2 // linha 1 do arquivo e o cabecalho
      summary.processed++
      const data = validateRow(rows[index], file, lineNumber, errors)
      if (!data) {
        summary.errors++
        continue
      }
      const baseSlug = generateSlug(
        data.name,
        data.addressState,
        data.addressCity,
      )
      const slug = await resolveUniqueSlug(baseSlug, data)
      const outcome = await upsertUnit(data, slug)
      if (outcome === 'created') {
        summary.created++
      } else {
        summary.updated++
      }
    }
  }

  writeErrorLog(errors)

  console.log('\n--- Seed concluído ---')
  console.log(`Arquivos processados: ${files.length}`)
  console.log(`Linhas processadas: ${summary.processed}`)
  console.log(`Criados: ${summary.created}`)
  console.log(`Atualizados: ${summary.updated}`)
  console.log(`Erros: ${summary.errors}`)
}

main()
  .catch((err) => {
    console.error('Erro fatal no seed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
