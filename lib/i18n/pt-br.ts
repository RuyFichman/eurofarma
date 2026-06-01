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

export const HOME = {
  hero: {
    badge: 'Rede Brasileira de Bancos de Leite Humano',
    titleLead: 'Seu leite é um',
    titleHighlight: 'presente de vida',
    titleTail: 'para quem mais precisa',
    description:
      'O Lactare conecta nutrizes aos bancos de leite humano da rBLH e torna a doação de leite materno mais simples, segura e acolhedora.',
    primaryCta: { label: 'Encontrar banco de leite', href: '/buscar' },
    secondaryCta: { label: 'Como funciona', href: '/como-funciona' },
    trust: [
      'Seus dados protegidos pela LGPD',
      'Contato direto e gratuito pelo WhatsApp',
    ],
    highlight: { value: '+48 mil', label: 'doadoras ativas na rede' },
    imageAlt: 'Bebê recém-nascido aconchegado em um cobertor macio',
  },
  stats: {
    items: [
      { value: '220+', label: 'Bancos e postos de coleta' },
      { value: '48 mil', label: 'Doadoras ativas' },
      { value: '2,3 mi', label: 'Bebês beneficiados' },
      { value: '27', label: 'Estados atendidos' },
    ],
  },
  network: {
    eyebrow: 'Conheça a rede',
    title: 'Quem faz parte do Lactare?',
    subtitle:
      'O Lactare é o elo digital entre a nutriz e a maior rede de bancos de leite humano do Brasil.',
    cards: [
      {
        title: 'O que é o Lactare?',
        description:
          'É a plataforma que aproxima você do banco de leite mais perto. Em poucos cliques, você encontra a unidade certa e fala com ela pelo WhatsApp.',
        items: [
          'Busca por estado e cidade',
          'Contato direto pelo WhatsApp',
          'Conteúdo acolhedor e confiável',
        ],
        cta: { label: 'Saiba mais', href: '/sobre' },
      },
      {
        title: 'A rBLH — Rede Brasileira de Bancos de Leite Humano',
        description:
          'Coordenada pela Fiocruz e pelo Ministério da Saúde, é a maior rede de bancos de leite humano do mundo e referência em segurança alimentar para recém-nascidos.',
        items: [
          'Maior rede do mundo em BLH',
          'Coordenada pela Fiocruz',
          '220+ unidades em 27 estados',
        ],
        cta: { label: 'Saiba mais', href: '/como-funciona' },
      },
    ],
  },
  tips: {
    eyebrow: 'Guia para nutrizes',
    title: 'Dicas para a doação de leite',
    subtitle:
      'Tudo o que você precisa saber para uma doação segura e tranquila.',
    items: [
      {
        tag: 'Extração',
        title: 'Como extrair o leite',
        description:
          'Higienize as mãos e os utensílios antes de começar. Use técnica manual ou bomba esterilizada, em um lugar calmo e confortável.',
      },
      {
        tag: 'Armazenamento',
        title: 'Conserve com segurança',
        description:
          'Guarde em frasco de vidro esterilizado: até 15 dias no freezer ou 12 horas na geladeira. Lembre de etiquetar com data e horário.',
      },
      {
        tag: 'Higiene',
        title: 'Cuidados de higiene',
        description:
          'Lave as mãos com água e sabão por 20 segundos. Limpe as mamas com uma compressa estéril antes de cada extração.',
      },
    ],
  },
  finalCta: {
    title: 'Pronta para fazer a diferença?',
    description:
      'Encontre o banco de leite mais perto de você e fale com a equipe pelo WhatsApp. É simples, rápido e cheio de cuidado.',
    primaryCta: { label: 'Encontrar banco de leite', href: '/buscar' },
    secondaryCta: { label: 'Como funciona', href: '/como-funciona' },
  },
} as const

export const A11Y = {
  skipToContent: 'Ir para o conteúdo principal',
  navMenu: 'Menu de navegação',
  logoHome: 'Lactare - Ir para página inicial',
} as const

export type NavItem = (typeof NAV.items)[number]
