import { z } from 'zod'

import { NUTRIZ_AUTH } from '../i18n/pt-br'
import { formatLocalDate, isValidLocalDate } from '../utils/local-date-time'

const COPY = NUTRIZ_AUTH.area.reminders

export const NUTRIZ_REMINDER_TYPE_VALUES = [
  'MILK_VALIDITY',
  'FUTURE_DONATION',
  'KIT_DELIVERY',
] as const

export const nutrizReminderTypeSchema = z.enum(NUTRIZ_REMINDER_TYPE_VALUES)

export const milkValidityTimingOptionSchema = z.enum([
  'MILK_1_DAY_BEFORE',
  'MILK_2_DAYS_BEFORE',
  'MILK_3_DAYS_BEFORE',
])

export const futureDonationTimingOptionSchema = z.enum([
  'DONATION_7_DAYS_BEFORE',
  'DONATION_ON_DAY',
  'DONATION_7_DAYS_BEFORE_AND_ON_DAY',
])

export const kitDeliveryTimingOptionSchema = z.enum([
  'KIT_MORNING_OF',
  'KIT_1_DAY_BEFORE',
  'KIT_1_DAY_BEFORE_AND_ON_DAY',
])

/**
 * Payloads de **ativação** de cada lembrete — sempre "ligando", nunca
 * "desligando" (isso é `disableReminderAction`, sem schema próprio além do
 * tipo). A sessão de extração e a data/horário da visita do kit nunca vêm do
 * cliente: o servidor sempre usa o dado mais recente do próprio perfil.
 */
export const milkValidityReminderSchema = z.object({
  timingOption: milkValidityTimingOptionSchema,
})

export const futureDonationReminderSchema = z.object({
  timingOption: futureDonationTimingOptionSchema,
  targetDate: z
    .string()
    .refine(isValidLocalDate, COPY.futureDonation.dateRequired)
    .refine(
      (value) =>
        !isValidLocalDate(value) || value >= formatLocalDate(new Date()),
      COPY.futureDonation.datePast,
    ),
})

export const kitDeliveryReminderSchema = z.object({
  timingOption: kitDeliveryTimingOptionSchema,
})

export type MilkValidityReminderInput = z.infer<
  typeof milkValidityReminderSchema
>
export type FutureDonationReminderInput = z.infer<
  typeof futureDonationReminderSchema
>
export type KitDeliveryReminderInput = z.infer<typeof kitDeliveryReminderSchema>
export type NutrizReminderTypeValue = z.infer<typeof nutrizReminderTypeSchema>
