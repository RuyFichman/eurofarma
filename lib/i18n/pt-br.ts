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

export const ABOUT = {
  hero: {
    title: 'Sobre o Lactare',
    description:
      'Uma iniciativa que conecta vidas há 6 anos, mobilizando nutrizes e bancos de leite humano por todo o Brasil.',
  },
  history: {
    title: 'Nossa história',
    paragraphs: [
      'O Lactare nasceu como um programa institucional da Eurofarma, com o propósito de apoiar os bancos de leite humano e fortalecer a cultura de doação de leite materno no Brasil.',
      'Em 6 anos de jornada, o programa mobilizou mais de 12.400 doadoras e ajudou a beneficiar mais de 5.000 bebês prematuros com leite humano doado — cada gota representa uma vida amparada em um momento decisivo.',
      'Com o Lactare Digital, ampliamos esse alcance por meio de canais digitais, aproximando ainda mais as nutrizes dos bancos de leite e tornando a doação simples, acolhedora e ao alcance de todas.',
    ],
  },
  mission: {
    title: 'Missão',
    quote:
      'Garantir que toda nutriz no Brasil tenha acesso fácil, acolhedor e informado aos bancos de leite humano, ampliando o impacto da doação de leite materno e salvando mais vidas.',
  },
  timeline: {
    title: 'Marcos da jornada',
    milestones: [
      {
        year: '2019',
        description: 'Início do programa Lactare como iniciativa institucional',
      },
      {
        year: '2020',
        description:
          'Primeiras parcerias com bancos de leite humano em São Paulo',
      },
      {
        year: '2022',
        description: 'Expansão para 5 estados brasileiros',
      },
      {
        year: '2024',
        description: 'Atingimos a marca de 10.000 doadoras mobilizadas',
      },
      {
        year: '2025',
        description:
          'Lançamento do Lactare Digital, ampliando o alcance via web e WhatsApp',
      },
    ],
  },
  partners: {
    title: 'Parceiros institucionais',
    description:
      'Trabalhamos lado a lado com a Rede Brasileira de Bancos de Leite Humano (rBLH), hospitais públicos e privados, maternidades e organizações de saúde em todo o Brasil.',
    items: ['rBLH/Fiocruz', 'Hospitais parceiros', 'SUS', 'Eurofarma'],
  },
  finalCta: {
    title: 'Faça parte dessa história.',
    description:
      'Encontre um banco de leite próximo e inicie sua jornada como doadora.',
    cta: { label: 'Encontrar banco de leite', href: '/buscar' },
  },
} as const

export const CONTENT = {
  meta: {
    title: 'Conteúdos',
    description:
      'Espaço educativo do Lactare: guias, vídeos e dúvidas frequentes para acompanhar cada etapa da sua jornada como nutriz, da primeira dúvida à primeira doação.',
  },
  hero: {
    badge: 'Espaço Educativo Lactare',
    titleLead: 'Tudo que você precisa saber',
    titleHighlight: 'para cuidar e compartilhar',
    description:
      'Um espaço pensado com carinho para acompanhar cada etapa da sua jornada como nutriz — da primeira dúvida à primeira doação.',
    searchLabel: 'Buscar conteúdos',
    searchPlaceholder: 'Buscar artigos, vídeos ou dúvidas frequentes...',
    filters: ['Todos', 'Extração', 'Armazenamento', 'Amamentação', 'Doação'],
  },
  startHere: {
    eyebrow: 'Seção 1',
    title: 'Comece por Aqui',
    description:
      'Respostas rápidas para as dúvidas mais comuns de quem está chegando agora.',
    cards: [
      {
        tag: 'Elegibilidade',
        title: 'Quem pode doar?',
        description:
          'Qualquer mãe em fase de amamentação com excesso de produção de leite e boa saúde pode ser doadora. O processo de triagem é simples e gratuito.',
        cta: { label: 'Verificar elegibilidade', href: '#duvidas-frequentes' },
      },
      {
        tag: 'Mitos & Verdades',
        title: 'Meu leite serve?',
        description:
          'Sim! Todo leite materno é único e valioso. Mesmo que você ache que produz pouco, sua contribuição pode salvar um bebê prematuro.',
        cta: { label: 'Entender mais', href: '#amamentacao-na-pratica' },
      },
      {
        tag: 'Segurança',
        title: 'É seguro?',
        description:
          'Totalmente. O leite é pasteurizado, testado e rastreado em todas as etapas. A rBLH é reconhecida pela OMS como referência mundial.',
        cta: { label: 'Ver processo', href: '#caminho-da-doacao' },
      },
    ],
  },
  donationPath: {
    eyebrow: 'Seção 2',
    title: 'O Caminho da Doação',
    description:
      'Do primeiro contato até a coleta — um passo a passo visual e claro.',
    steps: [
      {
        title: 'Primeiro contato pelo WhatsApp',
        description:
          'Encontre o banco de leite mais perto de você e fale direto com a equipe pelo WhatsApp, em poucos cliques.',
      },
      {
        title: 'Triagem de elegibilidade',
        description:
          'A equipe do banco de leite confirma sua aptidão como doadora com base em critérios clínicos simples.',
      },
      {
        title: 'Agendamento da coleta',
        description:
          'Combine a data, o horário e o banco de leite mais conveniente para você. Em muitos casos há coleta domiciliar assistida.',
      },
      {
        title: 'Extração e preparação em casa',
        description:
          'Siga o guia de higiene e extração, armazene em frasco esterilizado e etiquete com data e hora. Simples assim.',
      },
      {
        title: 'Entrega no banco de leite',
        description:
          'Leve ao banco na data combinada. O leite passa por pasteurização, análise e distribuição para os bebês que precisam.',
      },
    ],
  },
  videos: {
    title: 'Vídeos Explicativos',
    items: [
      { title: 'Como funciona o primeiro contato', duration: '2:34' },
      { title: 'Como agendar sua visita', duration: '3:18' },
    ],
  },
  checklist: {
    title: 'O que esperar da sua primeira visita',
    subtitle: 'Marque cada item conforme você se preparar',
    readyLabel: 'prontos',
    items: [
      'Lavar as mãos com água e sabão por 20 segundos',
      'Ter o frasco de vidro esterilizado disponível',
      'Levar documento de identidade com foto',
      'Caderneta de Saúde do bebê (primeira visita)',
      'Chegar com 10 min de antecedência',
      'Usar roupa confortável para amamentação',
      'Levar o leite em bolsa térmica (se coletado em casa)',
    ],
  },
  practice: {
    eyebrow: 'Seção 3',
    title: 'Amamentação na Prática',
    action: { label: 'Ver todos os guias', href: '#' },
    cards: [
      {
        tag: 'Extração',
        title: 'Técnica de Extração Manual',
        description:
          'Posicione o polegar e o indicador formando um C. Pressione para dentro e depois comprima suavemente, em ritmo constante.',
        readTime: '4 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Armazenamento',
        title: 'Armazenamento Seguro',
        description:
          'Freezer: até 15 dias. Congelador: até 3 meses. Geladeira: até 12 horas. Nunca reaqueça no micro-ondas.',
        readTime: '3 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Pega',
        title: 'Pega Correta do Bebê',
        description:
          'A boca do bebê deve abocanhar boa parte da aréola, não apenas o mamilo. Lábios virados para fora é o sinal certo.',
        readTime: '5 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Posicionamento',
        title: 'Posições para Amamentar',
        description:
          'Tradicional, cavaleiro, invertida, deitada — cada posição tem vantagens. A certa é a que funciona para você e seu bebê.',
        readTime: '6 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Dicas',
        title: 'Aumentando a Produção',
        description:
          'Ofereça o peito com frequência, mantenha-se hidratada, durma quando o bebê dormir e evite estresse desnecessário.',
        readTime: '4 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Higiene',
        title: 'Higiene na Extração',
        description:
          'Lave as mãos, limpe as mamas com compressa estéril, esterilize frascos e bombas a cada uso. Prevenção é essencial.',
        readTime: '3 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
    ],
  },
  stories: {
    eyebrow: 'Seção 4',
    title: 'Histórias Reais',
    description:
      'Relatos de mães e famílias que fazem parte desta rede de amor.',
    items: [
      {
        role: 'Doadora',
        quote:
          'Quando descobri que meu leite poderia salvar a vida de um bebê prematuro, chorei de emoção. O processo foi muito mais simples do que imaginava. Hoje é parte da minha rotina e me sinto parte de algo enorme.',
        name: 'Maria Silva',
        detail: 'Doadora há 8 meses — São Paulo, SP',
      },
      {
        role: 'Família Beneficiada',
        quote:
          'Nosso filho nasceu com 28 semanas. Durante 4 meses, o leite humano doado foi o único alimento que ele recebeu. Hoje ele tem 2 anos e é cheio de vida. Não temos palavras para agradecer.',
        name: 'Família Pereira',
        detail: 'Beneficiada pelo BLH — Rio de Janeiro, RJ',
      },
      {
        role: 'Doadora',
        quote:
          'Tinha muito leite sobrando e não sabia o que fazer. Uma amiga me indicou o Lactare. Em menos de uma semana já estava cadastrada e fazendo minha primeira coleta. É gratificante demais.',
        name: 'Fernanda Costa',
        detail: 'Doadora voluntária — Campinas, SP',
      },
    ],
    cta: {
      lead: 'Você também faz parte dessa história.',
      label: 'Quero ser doadora',
      href: '/buscar',
    },
  },
  faq: {
    eyebrow: 'Seção 5',
    title: 'Dúvidas Frequentes',
    items: [
      {
        question: 'Posso doar se estou tomando medicamentos?',
        answer:
          'Depende do medicamento. A maioria dos remédios comuns (vitaminas, suplementos, antialérgicos leves) não impede a doação. A equipe do banco de leite avalia caso a caso durante a triagem. Sempre informe todos os medicamentos que usa.',
      },
      {
        question: 'O leite que sobra depois que o bebê mamou pode ser doado?',
        answer:
          'Sim! O leite que sobra após a mamada pode ser coletado, desde que respeitadas as normas de higiene. Coloque imediatamente no frasco esterilizado, etiquete com data e hora e armazene conforme as orientações do banco de leite.',
      },
      {
        question: 'Quantas vezes por semana posso fazer a coleta?',
        answer:
          'Não há um limite fixo — vai depender da sua produção. Algumas doadoras levam leite semanalmente, outras quinzenalmente. O importante é não comprometer a alimentação do seu próprio bebê.',
      },
      {
        question: 'Meu bebê vai ter menos leite se eu doar?',
        answer:
          'Não! A produção de leite funciona pela lógica de oferta e demanda. Quanto mais você extrai, mais seu corpo produz. Desde que o bebê continue mamando normalmente, a produção se mantém ou até aumenta.',
      },
      {
        question: 'Posso parar de ser doadora quando quiser?',
        answer:
          'Absolutamente. A doação é sempre voluntária e você pode encerrar a qualquer momento, sem nenhuma obrigação. Basta comunicar o banco de leite responsável.',
      },
      {
        question: 'Para quais bebês o leite doado é destinado?',
        answer:
          'Prioritariamente para recém-nascidos prematuros e de baixo peso internados em UTIs Neonatais. Esses bebês não podem receber fórmulas artificiais e o leite humano é o único alimento adequado para seu desenvolvimento.',
      },
    ],
    help: {
      title: 'Não encontrou sua resposta?',
      whatsapp: { label: 'Perguntar no WhatsApp', href: '/buscar' },
      articles: { label: 'Ver todos os artigos', href: '#' },
    },
  },
} as const

export const SEARCH = {
  page: {
    title: 'Buscar bancos de leite',
    description:
      'Filtre por estado e cidade para encontrar bancos de leite humano e pontos de coleta perto de você — e fale com a equipe pelo WhatsApp em poucos cliques.',
    unitCard: {
      typeLabels: {
        milk_bank: 'Banco de leite',
        collection_point: 'Ponto de coleta',
        hospital: 'Hospital',
        partner: 'Parceiro',
      },
      addressLabel: 'Endereço',
      openingHoursLabel: 'Horário',
      openingHoursFallback: 'Horário não informado',
      whatsappAvailable: 'WhatsApp disponível',
      phoneAvailable: 'Telefone disponível',
      phoneButton: 'Ligar',
      whatsappButton: 'WhatsApp',
      detailsButton: 'Ver detalhes',
      defaultWhatsappMessage:
        'Olá! Vim pelo site do Lactare e gostaria de saber mais sobre doação de leite humano.',
      // {unitName} é substituído no componente.
      ariaLabels: {
        phone: 'Ligar para {unitName}',
        whatsapp: 'Falar pelo WhatsApp com {unitName}',
        details: 'Ver detalhes de {unitName}',
      },
    },
  },
  results: {
    countOne: 'unidade encontrada',
    countOther: 'unidades encontradas',
    initial: {
      title: 'Comece escolhendo um estado',
      description:
        'Selecione um estado (e, se quiser, uma cidade ou bairro) acima para ver os bancos de leite e pontos de coleta disponíveis.',
    },
    empty: {
      title: 'Nenhuma unidade encontrada',
      description:
        'Não encontramos unidades com esses filtros. Tente ampliar a busca: remova o bairro, troque a cidade ou limpe os filtros.',
    },
    invalid: {
      title: 'Não entendemos esses filtros',
      description:
        'Ajuste os campos acima e busque novamente para ver as unidades disponíveis.',
    },
    error: {
      title: 'Não foi possível carregar as unidades',
      description:
        'Algo deu errado ao buscar as unidades. Tente novamente em alguns instantes.',
    },
  },
  pagination: {
    label: 'Paginação dos resultados',
    previous: 'Anterior',
    next: 'Próxima',
    // {page} e {total} são substituídos no componente.
    status: 'Página {page} de {total}',
  },
  filters: {
    title: 'Encontre um banco de leite',
    description:
      'Use os filtros abaixo para localizar bancos de leite humano e pontos de coleta próximos de você.',
    fields: {
      state: {
        label: 'Estado',
        placeholder: 'Selecione o estado',
        error: 'Selecione um estado válido.',
      },
      city: {
        label: 'Cidade',
        placeholder: 'Selecione a cidade',
        placeholderWithoutState: 'Selecione um estado primeiro',
        loading: 'Carregando cidades...',
        empty: 'Nenhuma cidade encontrada',
        errorLoading: 'Não foi possível carregar as cidades agora.',
      },
      neighborhood: {
        label: 'Bairro',
        placeholder: 'Digite um bairro, se quiser',
        helper: 'Opcional. Funciona melhor quando uma cidade está selecionada.',
      },
      type: {
        label: 'Tipo de unidade',
        placeholder: 'Todos os tipos',
        options: {
          all: 'Todos os tipos',
          milkBank: 'Banco de leite',
          collectionPoint: 'Ponto de coleta',
          hospital: 'Hospital',
          partner: 'Parceiro',
        },
      },
      hasWhatsapp: {
        label: 'Apenas unidades com WhatsApp',
      },
    },
    actions: {
      submit: 'Buscar',
      clear: 'Limpar filtros',
    },
    loading: {
      cities: 'Carregando cidades...',
    },
  },
} as const

export const UNIT_DETAIL = {
  seo: {
    titleSuffix: 'Lactare',
    descriptionTemplate:
      'Veja endereço, telefone, WhatsApp e orientações para contato com {unitName}, banco de leite ou ponto de coleta no Lactare.',
    notFoundTitle: 'Unidade não encontrada',
    notFoundDescription:
      'A unidade que você tentou acessar não foi encontrada ou não está disponível no Lactare.',
  },
  breadcrumb: {
    home: 'Início',
    search: 'Buscar',
  },
  typeLabels: {
    milk_bank: 'Banco de leite',
    collection_point: 'Ponto de coleta',
    hospital: 'Hospital',
    partner: 'Parceiro',
  },
  badges: {
    whatsappAvailable: 'WhatsApp disponível',
    phoneAvailable: 'Telefone disponível',
    openingHoursAvailable: 'Horário informado',
  },
  actions: {
    phone: 'Ligar',
    whatsapp: 'Falar pelo WhatsApp',
    backToSearch: 'Voltar para busca',
    reportProblem: 'Reportar informação incorreta',
  },
  // {unitName} é substituído no componente.
  ariaLabels: {
    phone: 'Ligar para {unitName}',
    whatsapp: 'Falar pelo WhatsApp com {unitName}',
    backToSearch: 'Voltar para a busca de bancos de leite',
    reportProblem: 'Reportar informação incorreta sobre {unitName}',
  },
  contact: {
    title: 'Informações de contato',
    phone: 'Telefone',
    whatsapp: 'WhatsApp',
    email: 'E-mail',
    address: 'Endereço',
    zip: 'CEP',
    empty: 'Informações de contato não disponíveis no momento.',
  },
  openingHours: {
    title: 'Horário de atendimento',
    fallback:
      'Horário não informado. Confirme diretamente com a unidade antes de se deslocar.',
  },
  instructions: {
    title: 'Instruções específicas para doação',
    fallback:
      'Esta unidade ainda não possui instruções específicas cadastradas. Entre em contato por telefone ou WhatsApp para receber orientação segura.',
  },
  map: {
    title: 'Localização',
    unavailable:
      'Mapa indisponível no momento. Use o endereço abaixo para confirmar a localização com a unidade.',
    // {unitName} é substituído no componente.
    imageAlt: 'Mapa estático da localização de {unitName}',
  },
  safety: {
    title: 'Antes de iniciar a doação',
    text: 'Cada banco de leite pode ter orientações próprias para coleta, armazenamento e entrega. Entre em contato com a unidade antes de iniciar o processo para receber instruções seguras.',
  },
  whatsapp: {
    defaultMessage:
      'Olá! Vim pelo site do Lactare e gostaria de saber mais sobre doação de leite humano.',
  },
  report: {
    email: 'contato@lactare.local',
    // {unitName} é substituído no componente.
    subjectTemplate: 'Informação incorreta - {unitName}',
  },
} as const

export const SIGNUP = {
  meta: {
    title: 'Criar cadastro',
    description:
      'Cadastre-se no Lactare para começar sua jornada de doação de leite humano. Coleta mínima de dados, em conformidade com a LGPD.',
  },
  hero: {
    quote: 'Cada gota de leite humano doado é um ato de amor que salva vidas.',
    quoteSource: 'Ministério da Saúde — rBLH',
    bullets: [
      'Acompanhe sua jornada de doação',
      'Encontre o banco de leite mais próximo de você',
      'Fale direto com a equipe pelo WhatsApp',
    ],
  },
  backToHome: 'Voltar ao início',
  tabs: {
    login: 'Entrar',
    signup: 'Criar conta',
    // Login (Supabase Auth) é sprint futuro — a aba fica visível, porém inativa.
    loginUnavailable: 'O acesso à conta chega em breve',
  },
  heading: 'Crie seu cadastro',
  subtitle:
    'Cadastre-se para começar sua jornada de doação de leite humano. Leva menos de um minuto.',
  fields: {
    fullName: {
      label: 'Nome completo',
      placeholder: 'Seu nome completo',
    },
    whatsapp: {
      label: 'WhatsApp',
      placeholder: '(11) 90000-0000',
      helper: 'É por aqui que um banco de leite vai falar com você.',
    },
    state: {
      label: 'Estado',
      placeholder: 'Selecione o estado',
    },
    city: {
      label: 'Cidade',
      placeholder: 'Sua cidade',
    },
    consent: {
      lead: 'Li e aceito a',
      privacy: 'Política de Privacidade',
      middle: 'e os',
      terms: 'Termos de Uso',
      tail: 'e autorizo o contato sobre doação de leite humano.',
    },
  },
  actions: {
    submit: 'Criar meu cadastro',
    submitting: 'Enviando...',
    orContinue: 'ou continue com',
    whatsappCta: 'Falar com um banco pelo WhatsApp',
  },
  legal: {
    lead: 'Ao se cadastrar, você concorda com os',
    terms: 'Termos de Uso',
    middle: 'e a',
    privacy: 'Política de Privacidade',
    tail: 'do Lactare, em conformidade com a LGPD.',
  },
  success: {
    title: 'Cadastro recebido! 💙',
    // {name} é substituído no componente.
    body: 'Obrigada por se juntar à rede, {name}. Em breve um banco de leite vai falar com você pelo WhatsApp. Enquanto isso, você já pode encontrar a unidade mais próxima.',
    cta: 'Encontrar banco de leite',
    again: 'Fazer outro cadastro',
  },
  ariaLabels: {
    form: 'Formulário de cadastro da nutriz',
    backToHome: 'Voltar para a página inicial',
  },
} as const

export const THANKS = {
  meta: {
    title: 'Cadastro concluído',
    description:
      'Recebemos seu cadastro no Lactare. Em breve um banco de leite humano falará com você pelo WhatsApp para combinar os próximos passos da doação.',
  },
  badge: 'Cadastro recebido',
  title: 'Obrigada por fazer parte dessa rede de amor 💙',
  body: 'Seu cadastro foi recebido com todo o cuidado. Em breve, um banco de leite humano vai falar com você pelo WhatsApp para combinar os próximos passos da sua doação.',
  nextSteps: {
    title: 'O que acontece agora?',
    items: [
      'Um banco de leite entra em contato com você pelo WhatsApp',
      'A equipe confirma sua elegibilidade com perguntas simples',
      'Vocês combinam a coleta no melhor dia e horário para você',
    ],
  },
  primaryCta: 'Encontrar banco próximo',
  secondaryCta: 'Ver como funciona a doação',
} as const

export const A11Y = {
  skipToContent: 'Ir para o conteúdo principal',
  navMenu: 'Menu de navegação',
  logoHome: 'Lactare - Ir para página inicial',
} as const

export type NavItem = (typeof NAV.items)[number]
