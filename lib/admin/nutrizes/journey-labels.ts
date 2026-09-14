import type { JourneyStatusValue } from '../../journey/status'
import { ADMIN } from '../../i18n/pt-br'

/**
 * Rótulos visíveis do RF16. O switch exaustivo mantém o painel alinhado ao
 * vocabulário fechado do domínio quando um status for adicionado ou removido.
 */
export function getJourneyStatusLabel(status: JourneyStatusValue): string {
  switch (status) {
    case 'REGISTERED':
      return ADMIN.nutrizJourney.status.REGISTERED
    case 'FORM_RECEIVED':
      return ADMIN.nutrizJourney.status.FORM_RECEIVED
    case 'EXAM_SCHEDULED':
      return ADMIN.nutrizJourney.status.EXAM_SCHEDULED
    case 'AWAITING_RESULT':
      return ADMIN.nutrizJourney.status.AWAITING_RESULT
    case 'ELIGIBLE':
      return ADMIN.nutrizJourney.status.ELIGIBLE
    case 'NOT_ELIGIBLE':
      return ADMIN.nutrizJourney.status.NOT_ELIGIBLE
    case 'KIT_DELIVERED':
      return ADMIN.nutrizJourney.status.KIT_DELIVERED
    case 'RECURRING_DONATION_ELIGIBLE':
      return ADMIN.nutrizJourney.status.RECURRING_DONATION_ELIGIBLE
  }
}
