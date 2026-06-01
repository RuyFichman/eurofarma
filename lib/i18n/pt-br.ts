export const SITE = {
  name: 'Lactare',
  tagline: 'Conectando vidas através do leite humano.',
  description:
    'Plataforma digital que conecta nutrizes a bancos de leite humano e pontos de coleta no Brasil.',
  credits: 'Uma iniciativa Lactare · Eurofarma',
  partnerCredit: 'Desenvolvido em parceria com FIAP',
} as const

export const NAV = {
  items: [
    { label: 'Início', href: '/' },
    { label: 'Como funciona', href: '/como-funciona' },
    { label: 'Encontrar banco de leite', href: '/buscar' },
    { label: 'Sobre', href: '/sobre' },
  ],
  cta: {
    label: 'Encontrar banco de leite',
    shortLabel: 'Encontrar banco',
    href: '/buscar',
  },
  mobileMenu: {
    open: 'Abrir menu',
    close: 'Fechar menu',
  },
} as const

export const FOOTER = {
  sections: {
    navigation: 'Navegação',
    about: 'Sobre',
    legal: 'Legal',
  },
  links: {
    privacy: { label: 'Política de Privacidade', href: '/privacidade' },
    terms: { label: 'Termos de Uso', href: '/termos' },
    about: { label: 'Sobre o Lactare', href: '/sobre' },
    howItWorks: { label: 'Como funciona', href: '/como-funciona' },
    findBank: { label: 'Encontrar banco de leite', href: '/buscar' },
  },
  contact: {
    title: 'Contato institucional',
    placeholder: 'contato@lactare.com.br',
  },
  copyright: `© ${new Date().getFullYear()} Lactare. Todos os direitos reservados.`,
} as const

export const A11Y = {
  skipToContent: 'Ir para o conteúdo principal',
  navMenu: 'Menu de navegação',
  logoHome: 'Lactare - Ir para página inicial',
} as const

export type NavItem = (typeof NAV.items)[number]
