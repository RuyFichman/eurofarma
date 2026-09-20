import type { NutrizReminderType } from '@prisma/client'

import type { NutrizReminderOverview } from '../db/queries/nutriz-reminders'
import { NUTRIZ_AUTH } from '../i18n/pt-br'
import { formatShortDayMonth, formatTime } from '../utils/format-date'

const COPY = NUTRIZ_AUTH.area.reminders

const MILK_DAYS_LABEL: Record<string, string> = {
  MILK_1_DAY_BEFORE: '1 dia',
  MILK_2_DAYS_BEFORE: '2 dias',
  MILK_3_DAYS_BEFORE: '3 dias',
}

const REMINDER_ROUTE: Record<NutrizReminderType, string> = {
  MILK_VALIDITY: '/meu-agendamento/lembretes/leite',
  FUTURE_DONATION: '/meu-agendamento/lembretes/doacao',
  KIT_DELIVERY: '/meu-agendamento/lembretes/kit',
}

export type ReminderRowViewModel = {
  type: NutrizReminderType
  enabled: boolean
  title: string
  subtitle: string
  href: string
}

/**
 * Monta as linhas de "Meus lembretes" (ativos e disponíveis) a partir dos
 * dados reais do perfil — nunca inclui um tipo sem a fonte que o autoriza:
 * validade do leite precisa de alguma sessão registrada, e entrega do kit
 * precisa da data/horário que o admin já tenha informado.
 */
export function getReminderRows(
  overview: NutrizReminderOverview,
): ReminderRowViewModel[] {
  const byType = new Map(overview.preferences.map((p) => [p.type, p]))
  const rows: ReminderRowViewModel[] = []

  const milk = byType.get('MILK_VALIDITY')
  if (milk?.enabled && milk.sourceExtractionLog) {
    rows.push({
      type: 'MILK_VALIDITY',
      enabled: true,
      title: COPY.milkValidity.rowTitle.replace(
        '{date}',
        formatShortDayMonth(milk.sourceExtractionLog.recordedAt),
      ),
      subtitle: COPY.milkValidity.rowSubtitle.replace(
        '{days}',
        MILK_DAYS_LABEL[milk.timingOption] ?? '',
      ),
      href: REMINDER_ROUTE.MILK_VALIDITY,
    })
  } else if (overview.latestExtractionLog) {
    rows.push({
      type: 'MILK_VALIDITY',
      enabled: false,
      title: COPY.milkValidity.availableTitle,
      subtitle: COPY.milkValidity.availableSubtitle,
      href: REMINDER_ROUTE.MILK_VALIDITY,
    })
  }

  const donation = byType.get('FUTURE_DONATION')
  if (donation?.enabled && donation.targetDate) {
    rows.push({
      type: 'FUTURE_DONATION',
      enabled: true,
      title: COPY.futureDonation.rowTitle.replace(
        '{date}',
        formatShortDayMonth(donation.targetDate),
      ),
      subtitle: COPY.futureDonation.rowSubtitle.replace(
        '{optionLabel}',
        COPY.futureDonation.options[
          donation.timingOption as keyof typeof COPY.futureDonation.options
        ]?.label ?? '',
      ),
      href: REMINDER_ROUTE.FUTURE_DONATION,
    })
  } else {
    rows.push({
      type: 'FUTURE_DONATION',
      enabled: false,
      title: COPY.futureDonation.availableTitle,
      subtitle: COPY.futureDonation.availableSubtitle,
      href: REMINDER_ROUTE.FUTURE_DONATION,
    })
  }

  if (overview.kitDeliveryScheduledAt) {
    const kit = byType.get('KIT_DELIVERY')
    if (kit?.enabled) {
      rows.push({
        type: 'KIT_DELIVERY',
        enabled: true,
        title: COPY.kitDelivery.rowTitle
          .replace(
            '{date}',
            formatShortDayMonth(overview.kitDeliveryScheduledAt),
          )
          .replace('{time}', formatTime(overview.kitDeliveryScheduledAt)),
        subtitle: COPY.kitDelivery.rowSubtitle.replace(
          '{optionLabel}',
          COPY.kitDelivery.options[
            kit.timingOption as keyof typeof COPY.kitDelivery.options
          ]?.label ?? '',
        ),
        href: REMINDER_ROUTE.KIT_DELIVERY,
      })
    } else {
      rows.push({
        type: 'KIT_DELIVERY',
        enabled: false,
        title: COPY.kitDelivery.availableTitle,
        subtitle: COPY.kitDelivery.availableSubtitle,
        href: REMINDER_ROUTE.KIT_DELIVERY,
      })
    }
  }

  return rows
}
