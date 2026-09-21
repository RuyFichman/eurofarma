import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { getJourneyStatusLabel } from '../../lib/admin/nutrizes/journey-labels'
import { ADMIN_JOURNEY_STATUS_VALUES } from '../../lib/journey/status'

const migration = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260920120000_consolidate_admin_journey_statuses/migration.sql',
  ),
  'utf8',
)
const anyStatusMigration = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260920130000_allow_any_admin_journey_status/migration.sql',
  ),
  'utf8',
)

describe('consolidação dos status administrativos da nutriz', () => {
  it('exibe exatamente os seis nomes definidos para o painel', () => {
    expect(ADMIN_JOURNEY_STATUS_VALUES.map(getJourneyStatusLabel)).toEqual([
      'Primeiro contato pelo WhatsApp',
      'Verificação da área atendida',
      'Ficha de saúde e exame de sangue',
      'Entrega do kit em casa',
      'Extração e armazenamento em casa',
      'Coleta domiciliar do leite',
    ])
  })

  it('preserva o enum e libera os dois avanços consolidados no banco', () => {
    expect(migration).not.toMatch(/DROP\s+TYPE/iu)
    expect(migration).toContain(
      "\"to_status\" IN ('EXAM_SCHEDULED', 'EXAMS_COMPLETED')",
    )
    expect(migration).toContain(
      "\"to_status\" IN ('AWAITING_RESULT', 'KIT_SENT')",
    )
  })

  it('permite qualquer um dos seis destinos novos e preserva históricos legados', () => {
    for (const status of ADMIN_JOURNEY_STATUS_VALUES) {
      expect(anyStatusMigration).toContain(`'${status}'`)
    }
    expect(anyStatusMigration).toContain(') NOT VALID;')
    expect(anyStatusMigration).not.toMatch(/DROP\s+TYPE/iu)
  })
})
