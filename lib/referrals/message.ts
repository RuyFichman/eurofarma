/**
 * Monta a mensagem compartilhável sem incluir dados pessoais da nutriz
 * indicadora ou da pessoa que a receberá. O link opaco é a única referência
 * usada para a métrica de origem do cadastro.
 */
export function buildReferralMessage(template: string, link: string): string {
  return template.replace('{link}', link)
}

export function buildWhatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
