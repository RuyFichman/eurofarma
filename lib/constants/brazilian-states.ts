/**
 * As 27 unidades federativas do Brasil, com sigla e nome, para uso na UI
 * (select de estado). Fonte voltada ao frontend — Prisma-free, seguro em
 * Client Components.
 *
 * A validação de UF no backend continua em `lib/validators/common.ts` (`UFS`/
 * `ufSchema`); a lista de siglas aqui é a mesma, mantida em ordem alfabética
 * por sigla. `isBrazilianState` é o guard usado pelos validators de UI.
 */
export const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
] as const

export type BrazilianStateUf = (typeof BRAZILIAN_STATES)[number]['uf']

const UF_SET: ReadonlySet<string> = new Set(
  BRAZILIAN_STATES.map((state) => state.uf),
)

/** Guard: verifica se o valor é uma sigla de UF brasileira válida. */
export function isBrazilianState(value: string): value is BrazilianStateUf {
  return UF_SET.has(value)
}
