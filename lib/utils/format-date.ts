/**
 * Formatação de data em pt-BR. Função pura, sem dependência nova.
 *
 * `Intl` é criado uma vez no módulo: instanciar `DateTimeFormat` por linha de
 * tabela é caro o suficiente para aparecer em listagem paginada.
 */

const SHORT_DATE = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})

/**
 * `31/08/2026`. Fixa o fuso em São Paulo para a data exibida não variar com o
 * fuso do servidor — o público do painel é brasileiro, e um cadastro feito à
 * noite não deve aparecer no dia seguinte.
 */
export function formatShortDate(value: Date): string {
  return SHORT_DATE.format(value)
}
