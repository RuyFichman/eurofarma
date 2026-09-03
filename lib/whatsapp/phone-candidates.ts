/**
 * Formas possíveis do mesmo número brasileiro, para casar o remetente do
 * webhook com o `phoneWhatsapp` do cadastro.
 *
 * A Meta identifica contas brasileiras de forma inconsistente: o mesmo celular
 * chega ora como `5511987654321` (com o nono dígito), ora como `551187654321`
 * (sem). A nutriz digitou o número no cadastro na forma que conhece, e o
 * webhook manda na forma que a Meta guarda — se compararmos só a string exata,
 * a identificação falha e o agendamento dela nunca aparece na tela.
 *
 * Por isso a busca tenta as duas formas. O alcance é deliberadamente estreito:
 * só celular — assinante de 9 dígitos começando em 9, ou de 8 dígitos na faixa
 * 6–9, que é a de celular no plano de numeração antigo. Fixo (faixa 2–5) e
 * número de outro país ficam de fora: inventar variação onde não há regra
 * criaria colisão entre pessoas diferentes.
 */
export function buildBrazilianWhatsappCandidates(rawDigits: string): string[] {
  const digits = rawDigits.replace(/\D/g, '')
  if (digits === '') return []

  const candidates = new Set<string>([digits])

  if (digits.startsWith('55')) {
    const national = digits.slice(2)
    const ddd = national.slice(0, 2)
    const subscriber = national.slice(2)

    // 8 dígitos começando em 6–9 → celular no formato antigo, antes do nono
    // dígito. A faixa 2–5 é de telefone fixo, que nunca ganhou o nono dígito e
    // por isso fica de fora: prefixar um 9 ali inventaria um número de outra
    // pessoa.
    if (subscriber.length === 8 && /^[6-9]/.test(subscriber)) {
      candidates.add(`55${ddd}9${subscriber}`)
    }

    // 9 dígitos começando em 9 → a forma com o nono dígito; a antiga o omite.
    if (subscriber.length === 9 && subscriber.startsWith('9')) {
      candidates.add(`55${ddd}${subscriber.slice(1)}`)
    }
  }

  return [...candidates]
}
