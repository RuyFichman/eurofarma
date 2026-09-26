import { splitWaitDuration } from '@/lib/admin/action-center/wait-time'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.actionCenter

/** Escolhe singular ou plural e substitui `{count}`. */
export function pluralizeCount(
  forms: { one: string; other: string },
  count: number,
): string {
  return (count === 1 ? forms.one : forms.other).replace(
    '{count}',
    formatCount(count),
  )
}

/** "3 dias", "5 horas", "12 minutos" — sempre arredondado para baixo. */
export function formatWaitDuration(minutes: number): string {
  const { unit, value } = splitWaitDuration(minutes)
  const forms = COPY.wait[unit]
  return (value === 1 ? forms.one : forms.other).replace(
    '{value}',
    formatCount(value),
  )
}
