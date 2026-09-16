/**
 * Referência informativa da Minha Área. Não é uma meta clínica, não dispara
 * comunicação e não representa solicitação ou confirmação de coleta.
 */
export const EXTRACTION_CONTACT_SUGGESTION_THRESHOLD_ML = 500

export function shouldShowExtractionContactSuggestion(
  totalMl: number,
): boolean {
  return (
    Number.isFinite(totalMl) &&
    totalMl >= EXTRACTION_CONTACT_SUGGESTION_THRESHOLD_ML
  )
}
