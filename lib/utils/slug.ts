import slugify from 'slugify'

const SLUGIFY_OPTIONS = {
  lower: true,
  strict: true,
  locale: 'pt',
  replacement: '-',
} as const

function toKebab(value: string): string {
  return slugify(value, SLUGIFY_OPTIONS)
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Gera um slug deterministico no formato `<nome-kebab>-<uf-lowercase>-<cidade-kebab>`.
 *
 * NAO trata colisoes: quem chama e responsavel por aplicar sufixo via
 * `generateSlugWithSuffix` caso o slug ja exista no banco.
 */
export function generateSlug(
  name: string,
  state: string,
  city: string,
): string {
  if (name.trim() === '' || state.trim() === '' || city.trim() === '') {
    throw new Error('generateSlug: name, state e city sao obrigatorios.')
  }
  if (state.trim().length !== 2) {
    throw new Error(
      'generateSlug: state (UF) deve ter exatamente 2 caracteres.',
    )
  }

  const namePart = toKebab(name)
  const cityPart = toKebab(city)
  const ufPart = state.trim().toLowerCase()

  return `${namePart}-${ufPart}-${cityPart}`.replace(/-+/g, '-')
}

/**
 * Aplica sufixo numerico a um slug base. Se `suffix <= 1`, retorna o slug base inalterado.
 */
export function generateSlugWithSuffix(
  baseSlug: string,
  suffix: number,
): string {
  return suffix > 1 ? `${baseSlug}-${suffix}` : baseSlug
}
