import { LACTARE_CONTACT } from '../constants/lactare-contact'
import { COVERAGE } from '../i18n/pt-br'
import type { BotReply } from './conversation'

/** Resolve placeholders sem acoplar textos visíveis ao route handler. */
export function hydrateWhatsappReply(
  reply: BotReply,
  siteUrl: string,
): BotReply {
  const replacements = {
    '{howItWorksUrl}': `${siteUrl}/como-funciona`,
    '{privacyUrl}': `${siteUrl}/privacidade`,
    '{coverageUrl}': `${siteUrl}/verificar-cobertura`,
    '{areaUrl}': `${siteUrl}/meu-agendamento`,
    '{directoryUrl}': COVERAGE.outside.officialDirectoryHref,
    '{whatsapp}': LACTARE_CONTACT.whatsappDisplay,
    '{phone}': LACTARE_CONTACT.phoneDisplay,
    '{verifiedAt}': LACTARE_CONTACT.verifiedAtDisplay,
  } as const

  let body = reply.body
  for (const [placeholder, value] of Object.entries(replacements)) {
    body = body.replaceAll(placeholder, value)
  }

  return { ...reply, body }
}
