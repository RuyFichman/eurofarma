import { describe, expect, it } from 'vitest'

import {
  canTransitionJourneyStatus,
  getAllowedJourneyTransitions,
  JOURNEY_STATUS_TRANSITIONS,
  JOURNEY_STATUS_VALUES,
  type JourneyStatusValue,
} from '../../lib/journey/status'
import {
  adminJourneyStatusUpdateSchema,
  JOURNEY_ADMINISTRATIVE_NOTE_MAX_LENGTH,
  journeyAdministrativeNoteSchema,
  journeyStatusTransitionSchema,
} from '../../lib/validators/journey-status'

const ALLOWED_TRANSITIONS: [JourneyStatusValue, JourneyStatusValue][] = [
  ['REGISTERED', 'DOCUMENT_SENT'],
  ['REGISTERED', 'FORM_RECEIVED'],
  ['DOCUMENT_SENT', 'FORM_RECEIVED'],
  ['FORM_RECEIVED', 'EXAM_SCHEDULED'],
  ['EXAM_SCHEDULED', 'EXAMS_COMPLETED'],
  ['EXAM_SCHEDULED', 'AWAITING_RESULT'],
  ['EXAMS_COMPLETED', 'AWAITING_RESULT'],
  ['AWAITING_RESULT', 'ELIGIBLE'],
  ['AWAITING_RESULT', 'NOT_ELIGIBLE'],
  ['ELIGIBLE', 'KIT_SENT'],
  ['ELIGIBLE', 'KIT_DELIVERED'],
  ['KIT_SENT', 'KIT_DELIVERED'],
  ['KIT_DELIVERED', 'DONATION_CONFIRMED'],
  ['KIT_DELIVERED', 'RECURRING_DONATION_ELIGIBLE'],
  ['DONATION_CONFIRMED', 'RECURRING_DONATION_ELIGIBLE'],
]

const REJECTED_TRANSITIONS: [JourneyStatusValue, JourneyStatusValue][] = [
  ['REGISTERED', 'REGISTERED'],
  ['REGISTERED', 'ELIGIBLE'],
  ['FORM_RECEIVED', 'REGISTERED'],
  ['AWAITING_RESULT', 'KIT_DELIVERED'],
  ['NOT_ELIGIBLE', 'KIT_DELIVERED'],
  ['DONATION_CONFIRMED', 'KIT_DELIVERED'],
  ['RECURRING_DONATION_ELIGIBLE', 'REGISTERED'],
]

describe('regras de transição do status da jornada', () => {
  it('define regras para todos os valores, sem status órfão', () => {
    expect(Object.keys(JOURNEY_STATUS_TRANSITIONS)).toEqual(
      JOURNEY_STATUS_VALUES,
    )
  })

  it.each(ALLOWED_TRANSITIONS)('permite %s → %s', (fromStatus, toStatus) => {
    expect(canTransitionJourneyStatus(fromStatus, toStatus)).toBe(true)
    expect(
      journeyStatusTransitionSchema.safeParse({ fromStatus, toStatus }).success,
    ).toBe(true)
  })

  it.each(REJECTED_TRANSITIONS)('recusa %s → %s', (fromStatus, toStatus) => {
    expect(canTransitionJourneyStatus(fromStatus, toStatus)).toBe(false)
    expect(
      journeyStatusTransitionSchema.safeParse({ fromStatus, toStatus }).success,
    ).toBe(false)
  })

  it('expõe somente os próximos estados válidos', () => {
    expect(getAllowedJourneyTransitions('AWAITING_RESULT')).toEqual([
      'ELIGIBLE',
      'NOT_ELIGIBLE',
    ])
    expect(getAllowedJourneyTransitions('NOT_ELIGIBLE')).toEqual([])
  })
})

describe('observação administrativa da jornada', () => {
  it('normaliza espaços e aceita contexto estritamente operacional', () => {
    expect(
      journeyAdministrativeNoteSchema.parse(
        '  Atualização recebida da equipe do Lactare.  ',
      ),
    ).toBe('Atualização recebida da equipe do Lactare.')
    expect(journeyAdministrativeNoteSchema.parse('   ')).toBeUndefined()
  })

  it.each([
    'Laudo anexado ao cadastro',
    'Diagnóstico informado pela equipe',
    'Sorologia não reagente',
    'HIV negativo',
    'Medicamento em uso',
  ])('recusa possível detalhe clínico: %s', (note) => {
    expect(journeyAdministrativeNoteSchema.safeParse(note).success).toBe(false)
  })

  it('limita o texto a 500 caracteres', () => {
    expect(
      journeyAdministrativeNoteSchema.safeParse(
        'a'.repeat(JOURNEY_ADMINISTRATIVE_NOTE_MAX_LENGTH),
      ).success,
    ).toBe(true)
    expect(
      journeyAdministrativeNoteSchema.safeParse(
        'a'.repeat(JOURNEY_ADMINISTRATIVE_NOTE_MAX_LENGTH + 1),
      ).success,
    ).toBe(false)
  })
})

describe('payload administrativo da jornada', () => {
  it('exige um identificador UUID válido para a nutriz', () => {
    const transition = {
      fromStatus: 'REGISTERED',
      toStatus: 'FORM_RECEIVED',
    }

    expect(
      adminJourneyStatusUpdateSchema.safeParse({
        nutrizProfileId: '11111111-1111-4111-8111-111111111111',
        ...transition,
      }).success,
    ).toBe(true)
    expect(
      adminJourneyStatusUpdateSchema.safeParse({
        nutrizProfileId: 'id-invalido',
        ...transition,
      }).success,
    ).toBe(false)
  })
})
