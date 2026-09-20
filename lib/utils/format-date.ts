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

const SHORT_DAY_MONTH = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

/**
 * `19/09`, sem ano — usado nos resumos de "Meus lembretes", onde o ano fica
 * implícito (o mesmo padrão do mockup do time). Use `formatShortDate` quando
 * o ano precisar aparecer, como nas telas de configuração de cada lembrete.
 */
export function formatShortDayMonth(value: Date): string {
  return SHORT_DAY_MONTH.format(value)
}

const LONG_DATE = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})

const TIME = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

/**
 * `Quinta-feira, 05 de junho de 2026`, com a inicial maiúscula — o `Intl`
 * devolve o dia da semana em minúsculas em pt-BR, e a data abre um bloco na
 * tela do agendamento.
 */
export function formatLongDate(value: Date): string {
  const formatted = LONG_DATE.format(value)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * `09:30`. Mesmo fuso fixo das demais: o horário que a nutriz combinou com o
 * banco de leite é local, e exibi-lo no fuso do servidor a mandaria na hora
 * errada.
 */
export function formatTime(value: Date): string {
  return TIME.format(value)
}

const FULL_DATE = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})

/**
 * `19 de setembro de 2026` — como `formatLongDate`, mas sem o dia da semana.
 * Usada no rodapé do PDF exportado, onde o dia da semana não agrega nada ao
 * carimbo de geração.
 */
export function formatFullDate(value: Date): string {
  return FULL_DATE.format(value)
}
