import { ADMIN } from '../../i18n/pt-br'
import type { AdminNutrizStatusValue } from './filters'

/**
 * Rótulos em pt-br dos enums de nutriz no painel.
 *
 * `switch` exaustivo em vez de indexar o objeto de copy: se um valor novo entrar
 * no enum do schema, o compilador aponta aqui em vez de a tela exibir
 * `undefined` em silêncio (mesma disciplina de `lib/admin/units/labels.ts`).
 */

const COPY = ADMIN.nutrizes

export function getAdminNutrizStatusLabel(
  status: AdminNutrizStatusValue,
): string {
  switch (status) {
    case 'INTERESTED':
      return COPY.status.INTERESTED
    case 'CONTACTED':
      return COPY.status.CONTACTED
    case 'DONATED':
      return COPY.status.DONATED
    case 'UNKNOWN':
      return COPY.status.UNKNOWN
  }
}
