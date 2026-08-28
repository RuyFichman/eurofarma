/**
 * Formatação numérica pt-BR (separador de milhar `.`). O formatter é criado uma
 * vez no módulo: instanciar `Intl.NumberFormat` por chamada é caro e o painel
 * formata dezenas de números por render.
 */
const countFormatter = new Intl.NumberFormat('pt-BR')

/** Formata uma contagem inteira para exibição (ex.: `1234` → `1.234`). */
export function formatCount(value: number): string {
  return countFormatter.format(value)
}

/**
 * Percentual inteiro de `part` sobre `total`, arredondado. Retorna `0` quando
 * `total` é zero — evita `NaN` na barra de proporção das listas.
 */
export function percentOf(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}
