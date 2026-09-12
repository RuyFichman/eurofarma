export const SERVICE_REGION_VALUES = [
  'CAPITAL',
  'WEST',
  'SOUTHWEST',
  'ABC',
  'NORTH',
  'EAST_ALTO_TIETE',
] as const

export type ServiceRegionValue = (typeof SERVICE_REGION_VALUES)[number]

export type InitialServiceMunicipality = {
  name: string
  state: 'SP'
  country: 'Brazil'
  region: ServiceRegionValue
}

/**
 * Lista inicial aprovada para a área de atuação do Lactare.
 *
 * Depois da migration, a fonte operacional é a tabela
 * `service_municipalities`: o painel pode incluir, editar ou desativar cidades
 * sem alterar código. Esta constante existe para tornar a carga inicial
 * auditável e para testar a composição das seis sub-regiões.
 */
export const INITIAL_SERVICE_MUNICIPALITIES = [
  { name: 'São Paulo', state: 'SP', country: 'Brazil', region: 'CAPITAL' },
  { name: 'Arujá', state: 'SP', country: 'Brazil', region: 'EAST_ALTO_TIETE' },
  { name: 'Barueri', state: 'SP', country: 'Brazil', region: 'WEST' },
  { name: 'Caieiras', state: 'SP', country: 'Brazil', region: 'NORTH' },
  { name: 'Cajamar', state: 'SP', country: 'Brazil', region: 'NORTH' },
  { name: 'Carapicuíba', state: 'SP', country: 'Brazil', region: 'WEST' },
  { name: 'Cotia', state: 'SP', country: 'Brazil', region: 'WEST' },
  { name: 'Diadema', state: 'SP', country: 'Brazil', region: 'ABC' },
  {
    name: 'Embu das Artes',
    state: 'SP',
    country: 'Brazil',
    region: 'SOUTHWEST',
  },
  {
    name: 'Embu-Guaçu',
    state: 'SP',
    country: 'Brazil',
    region: 'SOUTHWEST',
  },
  {
    name: 'Ferraz de Vasconcelos',
    state: 'SP',
    country: 'Brazil',
    region: 'EAST_ALTO_TIETE',
  },
  { name: 'Francisco Morato', state: 'SP', country: 'Brazil', region: 'NORTH' },
  {
    name: 'Guarulhos',
    state: 'SP',
    country: 'Brazil',
    region: 'EAST_ALTO_TIETE',
  },
  {
    name: 'Itapecerica da Serra',
    state: 'SP',
    country: 'Brazil',
    region: 'SOUTHWEST',
  },
  { name: 'Itapevi', state: 'SP', country: 'Brazil', region: 'WEST' },
  {
    name: 'Itaquaquecetuba',
    state: 'SP',
    country: 'Brazil',
    region: 'EAST_ALTO_TIETE',
  },
  { name: 'Jandira', state: 'SP', country: 'Brazil', region: 'WEST' },
  { name: 'Mauá', state: 'SP', country: 'Brazil', region: 'ABC' },
  { name: 'Osasco', state: 'SP', country: 'Brazil', region: 'WEST' },
  {
    name: 'Pirapora do Bom Jesus',
    state: 'SP',
    country: 'Brazil',
    region: 'WEST',
  },
  { name: 'Poá', state: 'SP', country: 'Brazil', region: 'EAST_ALTO_TIETE' },
  { name: 'Ribeirão Pires', state: 'SP', country: 'Brazil', region: 'ABC' },
  {
    name: 'Rio Grande da Serra',
    state: 'SP',
    country: 'Brazil',
    region: 'ABC',
  },
  {
    name: 'Santana de Parnaíba',
    state: 'SP',
    country: 'Brazil',
    region: 'WEST',
  },
  { name: 'Santo André', state: 'SP', country: 'Brazil', region: 'ABC' },
  {
    name: 'São Bernardo do Campo',
    state: 'SP',
    country: 'Brazil',
    region: 'ABC',
  },
  {
    name: 'São Caetano do Sul',
    state: 'SP',
    country: 'Brazil',
    region: 'ABC',
  },
  { name: 'Suzano', state: 'SP', country: 'Brazil', region: 'EAST_ALTO_TIETE' },
  {
    name: 'Taboão da Serra',
    state: 'SP',
    country: 'Brazil',
    region: 'SOUTHWEST',
  },
  {
    name: 'Vargem Grande Paulista',
    state: 'SP',
    country: 'Brazil',
    region: 'WEST',
  },
] as const satisfies readonly InitialServiceMunicipality[]
