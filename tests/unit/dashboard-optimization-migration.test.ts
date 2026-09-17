import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  resolve(
    'prisma/migrations/20260917120000_optimize_dashboard_queries/migration.sql',
  ),
  'utf8',
)

describe('migration de otimização do dashboard', () => {
  it('materializa e mantém apenas dimensões categóricas sem PII', () => {
    expect(migration).toContain('CREATE TYPE "RegistrationOrigin"')
    expect(migration).toContain('"dashboard_region" "ServiceRegion"')
    expect(migration).toContain('"registration_origin" "RegistrationOrigin"')
    expect(migration).toContain('set_nutriz_dashboard_dimensions')
    expect(migration).toContain('refresh_nutriz_dashboard_region')
    expect(migration).not.toContain('full_name')
    expect(migration).not.toContain('phone_whatsapp')
    expect(migration).not.toContain('email')
  })

  it('cria os índices usados pelos filtros e pela leitura do consentimento vigente', () => {
    expect(migration).toContain('nutriz_profiles_deleted_journey_created_idx')
    expect(migration).toContain('nutriz_profiles_deleted_region_created_idx')
    expect(migration).toContain('nutriz_profiles_deleted_origin_created_idx')
    expect(migration).toContain(
      'communication_consent_events_purpose_profile_sequence_idx',
    )
    expect(migration).toContain(
      'communication_consent_events_purpose_profile_recorded_idx',
    )
  })
})
