export const SITE = {
  name: 'NutriLink',
  tagline: 'Conectando vidas através do leite humano.',
  description:
    'Plataforma digital que conecta nutrizes a bancos de leite humano e pontos de coleta no Brasil.',
  credits: 'Uma iniciativa NutriLink · Eurofarma',
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
    about: { label: 'Sobre o NutriLink', href: '/sobre' },
    howItWorks: { label: 'Como funciona', href: '/como-funciona' },
    findBank: { label: 'Encontrar banco de leite', href: '/buscar' },
  },
  contact: {
    title: 'Contato institucional',
    placeholder: 'contato@nutrilink.com.br',
  },
  copyright: `© ${new Date().getFullYear()} NutriLink. Todos os direitos reservados.`,
} as const

export const HOME = {
  hero: {
    badge: 'Rede Brasileira de Bancos de Leite Humano',
    titleLead: 'Seu leite é um',
    titleHighlight: 'presente de vida',
    titleTail: 'para quem mais precisa',
    description:
      'O NutriLink conecta nutrizes aos bancos de leite humano da rBLH e torna a doação de leite materno mais simples, segura e acolhedora.',
    primaryCta: { label: 'Encontrar banco de leite', href: '/buscar' },
    secondaryCta: { label: 'Como funciona', href: '/como-funciona' },
    trust: [
      'Seus dados protegidos pela LGPD',
      'Contato direto e gratuito pelo WhatsApp',
    ],
    imageAlt: 'Bebê recém-nascido aconchegado em um cobertor macio',
  },
  stats: {
    /** Heading do bloco — visualmente oculto, lido por leitor de tela. */
    title: 'A rede em números',
    /**
     * Os dois primeiros vêm do banco (é o que a nutriz realmente encontra na
     * busca); `fallback` cobre a falha da consulta. Os dois últimos são da
     * rBLH e não derivam da nossa base — daí a nota de fonte.
     */
    units: { label: 'Unidades cadastradas', fallback: '220+' },
    states: { label: 'Estados atendidos', fallback: '27' },
    donors: { value: '48 mil', label: 'Doadoras ativas na rede' },
    babies: { value: '2,3 mi', label: 'Bebês beneficiados' },
    sourceNote:
      'Unidades e estados vêm da nossa base; doadoras e bebês são dados da rBLH/Fiocruz.',
  },
  network: {
    eyebrow: 'Conheça a rede',
    title: 'Quem faz parte do NutriLink?',
    subtitle:
      'O NutriLink é o elo digital entre a nutriz e a maior rede de bancos de leite humano do Brasil.',
    cards: [
      {
        title: 'O que é o NutriLink?',
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
          // Sem número aqui: a faixa de indicadores logo acima já mostra a
          // contagem real da base, e dois totais diferentes na mesma tela
          // se contradiriam.
          'Unidades em todas as regiões do país',
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
  meta: {
    title: 'Sobre o NutriLink',
    description:
      'Conheça a história do NutriLink, programa de doação de leite humano que já mobilizou mais de 12 mil doadoras no Brasil.',
  },
  hero: {
    eyebrow: 'Sobre o NutriLink',
    title: 'Uma ponte digital entre quem quer doar e quem precisa.',
    description:
      'Uma iniciativa que conecta vidas há 6 anos, mobilizando nutrizes e bancos de leite humano por todo o Brasil.',
    impactLabel: 'Impacto construído em rede',
    impact: [
      { value: '6 anos', label: 'de jornada' },
      { value: '+12,4 mil', label: 'doadoras mobilizadas' },
      { value: '+5 mil', label: 'bebês beneficiados' },
    ],
  },
  history: {
    eyebrow: 'Nossa essência',
    title: 'Nossa história',
    paragraphs: [
      'O NutriLink nasceu como um programa institucional da Eurofarma, com o propósito de apoiar os bancos de leite humano e fortalecer a cultura de doação de leite materno no Brasil.',
      'Em 6 anos de jornada, o programa mobilizou mais de 12.400 doadoras e ajudou a beneficiar mais de 5.000 bebês prematuros com leite humano doado — cada gota representa uma vida amparada em um momento decisivo.',
      'Com o NutriLink Digital, ampliamos esse alcance por meio de canais digitais, aproximando ainda mais as nutrizes dos bancos de leite e tornando a doação simples, acolhedora e ao alcance de todas.',
    ],
  },
  mission: {
    eyebrow: 'O que nos move',
    title: 'Nossa missão',
    quote:
      'Garantir que toda nutriz no Brasil tenha acesso fácil, acolhedor e informado aos bancos de leite humano, ampliando o impacto da doação de leite materno e salvando mais vidas.',
  },
  timeline: {
    eyebrow: 'Nossa trajetória',
    title: 'Marcos da jornada',
    description:
      'Um programa que cresceu com propósito e agora ganha novas possibilidades no ambiente digital.',
    milestones: [
      {
        year: '2019',
        description:
          'Início do programa NutriLink como iniciativa institucional',
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
          'Lançamento do NutriLink Digital, ampliando o alcance via web e WhatsApp',
      },
    ],
  },
  partners: {
    eyebrow: 'Construído em conjunto',
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
      'Espaço educativo do NutriLink: guias, vídeos e dúvidas frequentes para acompanhar cada etapa da sua jornada como nutriz, da primeira dúvida à primeira doação.',
  },
  hero: {
    badge: 'Espaço Educativo NutriLink',
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
          'Tinha muito leite sobrando e não sabia o que fazer. Uma amiga me indicou o NutriLink. Em menos de uma semana já estava cadastrada e fazendo minha primeira coleta. É gratificante demais.',
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
      'Filtre por estado e cidade para encontrar bancos de leite humano e pontos de coleta perto de você e fale com a equipe pelo WhatsApp em poucos cliques.',
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
        'Olá! Vim pelo site do NutriLink e gostaria de saber mais sobre doação de leite humano.',
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
    titleSuffix: 'NutriLink',
    descriptionTemplate:
      'Veja endereço, telefone, WhatsApp e orientações para contato com {unitName}, banco de leite ou ponto de coleta no NutriLink.',
    notFoundTitle: 'Unidade não encontrada',
    notFoundDescription:
      'A unidade que você tentou acessar não foi encontrada ou não está disponível no NutriLink.',
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
      'Olá! Vim pelo site do NutriLink e gostaria de saber mais sobre doação de leite humano.',
  },
  report: {
    email: 'contato@nutrilink.local',
    // {unitName} é substituído no componente.
    subjectTemplate: 'Informação incorreta - {unitName}',
  },
} as const

export const SIGNUP = {
  meta: {
    title: 'Criar cadastro',
    description:
      'Cadastre-se no NutriLink para começar sua jornada de doação de leite humano. Coleta mínima de dados, em conformidade com a LGPD.',
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
  heading: 'Crie sua conta',
  subtitle:
    'Crie sua conta para começar sua jornada de doação de leite humano e acompanhar seu agendamento. Leva menos de um minuto.',
  fields: {
    fullName: {
      label: 'Nome completo',
      placeholder: 'Seu nome completo',
    },
    email: {
      label: 'E-mail',
      placeholder: 'voce@email.com',
      helper: 'É com ele que você entra na sua área depois.',
    },
    whatsapp: {
      label: 'WhatsApp',
      placeholder: '(11) 90000-0000',
      helper:
        'É por aqui que um banco de leite fala com você — e é como reconhecemos você no nosso WhatsApp.',
    },
    password: {
      label: 'Senha',
      placeholder: 'Pelo menos 8 caracteres',
    },
    passwordConfirm: {
      label: 'Confirmar senha',
      placeholder: 'Repita a senha',
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
    submit: 'Criar minha conta',
    submitting: 'Enviando...',
    orContinue: 'ou continue com',
    whatsappCta: 'Falar com um banco pelo WhatsApp',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
  },
  /**
   * Mensagens de validação do formulário (Princípio 7 — nada de string visível
   * hardcoded no schema). Reusadas pelo `signupFormSchema` no cliente.
   */
  validation: {
    fullNameMin: 'Informe seu nome completo.',
    fullNameMax: 'Nome muito longo.',
    emailRequired: 'Informe seu e-mail.',
    emailInvalid: 'E-mail inválido.',
    whatsappInvalid: 'WhatsApp inválido. Use DDD + número.',
    passwordMin: 'A senha deve ter pelo menos 8 caracteres.',
    passwordMax: 'A senha deve ter no máximo 128 caracteres.',
    passwordMismatch: 'As senhas não conferem.',
    stateInvalid: 'Selecione um estado válido.',
    cityMin: 'Informe sua cidade.',
    cityMax: 'Cidade inválida.',
    consentRequired:
      'É necessário aceitar a Política de Privacidade para continuar.',
  },
  legal: {
    lead: 'Ao se cadastrar, você concorda com os',
    terms: 'Termos de Uso',
    middle: 'e a',
    privacy: 'Política de Privacidade',
    tail: 'do NutriLink, em conformidade com a LGPD.',
  },
  api: {
    errorTitle: 'Não foi possível concluir o cadastro.',
    errorDescription: 'Revise os dados e tente novamente em alguns instantes.',
    rateLimited:
      'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
    accountExists:
      'Já existe uma conta com esses dados. Tente entrar em vez de criar uma nova.',
  },
  ariaLabels: {
    form: 'Formulário de cadastro da nutriz',
    backToHome: 'Voltar para a página inicial',
  },
} as const

/**
 * Copy das telas de sessão da nutriz (Sprint 6.3): entrar, redefinir senha e a
 * área protegida. Separada de `ADMIN_LOGIN` de propósito — o tom aqui é o do
 * público (Princípio 9), não o do painel.
 */
export const NUTRIZ_AUTH = {
  login: {
    meta: {
      title: 'Entrar',
      description:
        'Acesse sua conta do NutriLink para acompanhar seu agendamento de doação de leite humano.',
    },
    backToHome: 'Voltar ao início',
    heading: 'Que bom te ver de novo',
    subtitle: 'Entre para acompanhar seu agendamento e sua jornada de doação.',
    fields: {
      email: { label: 'E-mail', placeholder: 'voce@email.com' },
      password: { label: 'Senha', placeholder: 'Sua senha' },
    },
    actions: {
      submit: 'Entrar',
      submitting: 'Entrando...',
      forgotPassword: 'Esqueci minha senha',
      sendingReset: 'Enviando...',
      showPassword: 'Mostrar senha',
      hidePassword: 'Ocultar senha',
      signupLead: 'Ainda não tem conta?',
      signupLink: 'Criar cadastro',
    },
    feedback: {
      // Genérica por segurança: nunca diz se o problema foi o e-mail ou a senha.
      invalidCredentials: 'E-mail ou senha inválidos.',
      genericError:
        'Não foi possível entrar agora. Tente novamente em alguns minutos.',
      rateLimited:
        'Muitas tentativas de acesso. Tente novamente em alguns minutos.',
      // Igual exista ou não a conta (anti-enumeração).
      resetSuccess:
        'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.',
      resetError:
        'Não foi possível enviar as instruções agora. Tente novamente em alguns minutos.',
      resetNeedsEmail: 'Informe um e-mail válido para redefinir a senha.',
    },
    validation: {
      emailRequired: 'Informe seu e-mail.',
      emailInvalid: 'E-mail inválido.',
      passwordRequired: 'Informe sua senha.',
      passwordMin: 'A senha deve ter pelo menos 8 caracteres.',
      passwordMax: 'A senha deve ter no máximo 128 caracteres.',
    },
    ariaLabels: { form: 'Formulário de acesso da nutriz' },
  },
  newPassword: {
    meta: {
      title: 'Redefinir senha',
      description: 'Defina uma nova senha para sua conta do NutriLink.',
    },
    heading: 'Criar uma nova senha',
    subtitle: 'Escolha uma senha nova para voltar a acessar sua conta.',
    fields: {
      password: { label: 'Nova senha', placeholder: 'Pelo menos 8 caracteres' },
      passwordConfirm: {
        label: 'Confirmar nova senha',
        placeholder: 'Repita a senha',
      },
    },
    actions: {
      submit: 'Salvar nova senha',
      submitting: 'Salvando...',
      backToLogin: 'Voltar para entrar',
    },
    feedback: {
      // O link do e-mail é o que autentica esta tela; sem ele não há o que fazer.
      invalidLink:
        'Este link de redefinição expirou ou já foi usado. Peça um novo na tela de acesso.',
      genericError:
        'Não foi possível salvar a nova senha agora. Tente novamente em alguns minutos.',
      success: 'Senha atualizada. Você já pode entrar com ela.',
    },
    validation: {
      passwordMin: 'A senha deve ter pelo menos 8 caracteres.',
      passwordMax: 'A senha deve ter no máximo 128 caracteres.',
      passwordMismatch: 'As senhas não conferem.',
    },
    ariaLabels: { form: 'Formulário de nova senha' },
  },
  area: {
    meta: {
      title: 'Meu agendamento',
      description: 'Acompanhe seu agendamento de doação de leite humano.',
    },
    // {firstName} é substituído no componente.
    greetingTemplate: 'Olá, {firstName}!',
    subtitle: 'Sua saúde e a do seu bebê importam 💙',
    badge: 'Área da nutriz',
    empty: {
      title: 'Você ainda não tem agendamento por aqui',
      body: 'Quando você combinar uma visita com um banco de leite e nos contar pelo WhatsApp, os detalhes aparecem nesta página.',
      searchCta: 'Encontrar banco de leite',
      howCta: 'Ver como funciona a doação',
    },
    logout: 'Sair',
  },
  header: {
    login: 'Entrar',
    account: 'Meu agendamento',
  },
} as const

/**
 * Copy da tela de agendamento da nutriz (Sprint 6.4).
 *
 * Regra de honestidade que atravessa todo este bloco: o agendamento é
 * **autodeclarado**. Quem marcou foi o banco de leite, por fora; a plataforma
 * só guarda o que a nutriz contou pelo WhatsApp. Nada aqui pode dizer
 * "confirmado", prometer lembrete que não enviamos, ou sugerir que cancelar por
 * aqui avisa a unidade.
 */
export const APPOINTMENT = {
  status: {
    upcoming: {
      label: 'Informado por você',
      note: 'Estes são os dados que você nos passou pelo WhatsApp. Quem confirma a visita é o banco de leite.',
    },
    past: {
      label: 'Data já passou',
      note: 'Se a visita aconteceu, obrigada por doar 💙. Se precisar remarcar, fale de novo com o banco de leite.',
    },
    cancelled: {
      label: 'Cancelado',
      note: 'Você marcou este agendamento como cancelado. Quando combinar uma nova data, é só nos contar pelo WhatsApp.',
    },
    completed: {
      label: 'Concluído',
      note: 'Obrigada por doar 💙',
    },
    referenceLabel: 'Ref',
  },
  details: {
    title: 'Detalhes do agendamento',
    date: 'Data',
    time: 'Horário',
    timeUnknown: 'A combinar',
    declaredAt: 'Informado em',
  },
  guidance: {
    title: 'Orientações para o dia',
    items: [
      {
        title: 'Leve o leite já coletado',
        description:
          'Se extraiu em casa, leve em frasco de vidro esterilizado, etiquetado com data e hora da extração, dentro de bolsa térmica.',
      },
      {
        title: 'Leve um documento com foto',
        description:
          'RG, CNH ou passaporte. Se for com o bebê, leve também a Caderneta de Saúde da Criança.',
      },
      {
        title: 'Chegue com alguns minutos de antecedência',
        description:
          'Sobra tempo para o acolhimento e para preencher os formulários com calma.',
      },
      {
        title: 'Você pode levar o bebê',
        description:
          'A maior parte das unidades tem espaço para amamentação. Na dúvida, pergunte à equipe antes de ir.',
      },
    ],
    unitInstructionsTitle: 'O que esta unidade orienta',
    // Mesma ressalva da página pública da unidade: as orientações acima são
    // gerais, e cada BLH tem as suas.
    disclaimer:
      'Cada banco de leite pode ter orientações próprias de coleta e entrega. Confirme com a equipe antes de ir.',
  },
  location: {
    title: 'Local do atendimento',
    cepLabel: 'CEP',
    directions: 'Como chegar',
    mapAltTemplate: 'Mapa com a localização de {unitName}',
    unknownTitle: 'Você não nos disse qual banco de leite',
    unknownBody:
      'Tudo bem — o agendamento continua valendo. Se quiser, conte pelo WhatsApp com qual unidade você combinou e mostramos o endereço aqui.',
  },
  actions: {
    title: 'Ações rápidas',
    whatsapp: 'Falar com o banco pelo WhatsApp',
    call: 'Ligar para o banco',
    unitPage: 'Ver página da unidade',
    searchOther: 'Buscar outro banco',
  },
  cancel: {
    title: 'Precisa cancelar?',
    // Explicitamente NÃO promete avisar a unidade — quem avisa é a nutriz.
    body: 'O cancelamento é feito com o banco de leite. Depois de avisar a equipe, marque aqui para mantermos seu acompanhamento em dia.',
    action: 'Marcar como cancelado',
    confirm: 'Confirmar cancelamento',
    submitting: 'Marcando...',
    dismiss: 'Voltar',
    error: 'Não foi possível marcar agora. Tente novamente em instantes.',
  },
  notScheduled: {
    badge: 'Não consegui agendar',
    title: 'Você nos contou que ainda não conseguiu agendar',
    body: 'Isso acontece, e não é o fim da linha. Você pode tentar outra unidade ou falar de novo com a mesma equipe em outro horário.',
    reasonLabel: 'Motivo que você informou',
    reasons: {
      NO_ANSWER: 'A unidade não atendeu',
      NO_SLOT: 'Não havia vaga disponível',
      TOO_FAR: 'A unidade era longe demais',
      GAVE_UP: 'Você decidiu não seguir por enquanto',
      OTHER: 'Outro motivo',
    },
    searchCta: 'Buscar outro banco de leite',
    howCta: 'Ver como funciona a doação',
  },
} as const

/**
 * Falas do chatbot do WhatsApp (Sprint 6.5).
 *
 * Copy visível como qualquer outra (Princípio 7), com duas restrições próprias
 * do canal: os títulos de botão da Meta têm **limite de 20 caracteres**, e o
 * tom precisa aguentar ser lido no meio da rotina de quem acabou de ter bebê
 * (Princípio 9). Nada aqui promete lembrete, confirmação ou remarcação — o bot
 * só registra o que ela conta.
 */
export const WHATSAPP_BOT = {
  askScheduled: {
    body: 'Oi! Aqui é o NutriLink 💙\n\nVocê conseguiu agendar sua visita ao banco de leite?',
    yes: 'Sim, consegui',
    no: 'Ainda não',
  },
  askDate: {
    body: 'Que notícia boa! 💙\n\nPara qual dia e horário ficou? Responda assim: DD/MM HH:MM\n\nPor exemplo: 05/06 09:30',
  },
  dateNotUnderstood: {
    body: 'Não consegui entender a data. Pode escrever no formato DD/MM HH:MM?\n\nPor exemplo: 05/06 09:30',
  },
  confirmDate: {
    // {date} e {time} são substituídos no servidor.
    bodyTemplate: 'Anotei: {date}, às {time}.\n\nEstá certo?',
    yes: 'Está certo',
    no: 'Corrigir',
  },
  scheduledSaved: {
    // {url} é a área da nutriz.
    bodyTemplate:
      'Prontinho, anotei 💙\n\nVocê pode ver os detalhes e as orientações para o dia aqui: {url}\n\nQualquer mudança, é só me contar por aqui.',
  },
  askFailureReason: {
    body: 'Tudo bem, isso acontece e não é o fim da linha.\n\nO que aconteceu?',
    button: 'Escolher motivo',
    options: {
      NO_ANSWER: 'Não atenderam',
      NO_SLOT: 'Sem vaga',
      TOO_FAR: 'Longe demais',
      GAVE_UP: 'Deixei para depois',
      OTHER: 'Outro motivo',
    },
  },
  notScheduledSaved: {
    bodyTemplate:
      'Obrigada por contar 💙\n\nAnotei aqui. Se quiser tentar outra unidade, você encontra as mais próximas de você em: {url}\n\nQuando conseguir agendar, me avise por aqui.',
  },
  unknownNumber: {
    // Sem confirmar nem negar cadastro de ninguém — só convida.
    bodyTemplate:
      'Oi! Aqui é o NutriLink 💙\n\nPara acompanhar seu agendamento, crie sua conta em: {url}\n\nÉ rapidinho e você passa a ver tudo em um lugar só.',
  },
  fallback: {
    body: 'Desculpa, não entendi 😕\n\nToque em um dos botões para eu conseguir te ajudar.',
  },
} as const

export const THANKS = {
  meta: {
    title: 'Cadastro concluído',
    description:
      'Recebemos seu cadastro no NutriLink. Em breve um banco de leite humano falará com você pelo WhatsApp para combinar os próximos passos da doação.',
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

export const ADMIN_LOGIN = {
  seo: {
    title: 'Entrar no painel admin',
    description:
      'Acesse o painel administrativo do NutriLink para gerenciar unidades, conteúdos e indicadores.',
  },
  brand: {
    name: 'NutriLink Admin',
    eyebrow: 'Área administrativa',
  },
  hero: {
    title: 'Entrar no painel',
    description:
      'Acesse com seu email e senha para gerenciar unidades, conteúdos e indicadores do NutriLink.',
    restrictedNotice: 'Acesso restrito à equipe autorizada.',
  },
  form: {
    fields: {
      email: {
        label: 'Email',
        placeholder: 'admin@eurofarma.com.br',
      },
      password: {
        label: 'Senha',
        placeholder: 'Digite sua senha',
      },
    },
    actions: {
      submit: 'Entrar',
      submitting: 'Entrando...',
      forgotPassword: 'Esqueci minha senha',
      sendingReset: 'Enviando instruções...',
      showPassword: 'Mostrar senha',
      hidePassword: 'Ocultar senha',
    },
    validation: {
      emailRequired: 'Informe seu email.',
      emailInvalid: 'Informe um email válido.',
      passwordRequired: 'Informe sua senha.',
      passwordMin: 'A senha deve ter pelo menos 8 caracteres.',
      passwordMax: 'A senha deve ter no máximo 128 caracteres.',
    },
    feedback: {
      invalidCredentials: 'Email ou senha inválidos.',
      genericError:
        'Não foi possível entrar agora. Tente novamente em alguns minutos.',
      rateLimited:
        'Muitas tentativas de login. Tente novamente em alguns minutos.',
      resetSuccess:
        'Se este email estiver cadastrado, enviaremos instruções para redefinir a senha.',
      resetError:
        'Não foi possível enviar as instruções agora. Tente novamente em alguns minutos.',
      resetNeedsEmail: 'Informe um email válido para redefinir a senha.',
    },
  },
} as const

/** Copy do shell administrativo (sidebar, header, navegação, conta). */
export const ADMIN_LAYOUT = {
  brand: {
    name: 'NutriLink',
    area: 'Admin',
    fullName: 'NutriLink Admin',
  },
  navigation: {
    label: 'Navegação administrativa',
    items: {
      dashboard: 'Dashboard',
      units: 'Unidades',
      nutrizes: 'Nutrizes',
      contents: 'Conteúdos',
      campaigns: 'Campanhas',
    },
  },
  header: {
    areaLabel: 'Área administrativa',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
  },
  account: {
    label: 'Conta',
    // Forma neutra em vez de "Conectado como": o painel não sabe o gênero de
    // quem acessa e o rótulo aparece ao lado do nome real.
    signedInAs: 'Sessão de',
    roleLabel: {
      ADMIN: 'Administração',
      VIEWER: 'Leitura',
    },
    logout: 'Sair',
    backToSite: 'Ver o site público',
  },
  accessibility: {
    skipToContent: 'Pular para o conteúdo',
  },
} as const

/** Copy das telas administrativas (não do shell — este fica em ADMIN_LAYOUT). */
export const ADMIN = {
  dashboard: {
    seo: {
      title: 'Dashboard | NutriLink Admin',
      description: 'Painel administrativo do NutriLink Digital.',
    },
    title: 'Dashboard',
    description:
      'Acompanhe o alcance da rede, os cadastros de nutrizes e os contatos por WhatsApp.',

    /** Rótulo de janela temporal. `{days}` é substituído em tempo de render. */
    period: 'Últimos {days} dias',

    metrics: {
      /** Heading do bloco de cartões — visualmente oculto, lido por leitor de tela. */
      title: 'Indicadores principais',
      activeUnits: {
        label: 'Unidades ativas',
        description: 'Aparecem na busca pública',
        empty: 'Nenhuma unidade publicada até agora',
      },
      statesCovered: {
        label: 'Estados atendidos',
        description: 'UFs com ao menos uma unidade ativa',
        empty: 'Nenhuma UF coberta até agora',
      },
      nutriz: {
        label: 'Nutrizes cadastradas',
        /** `{count}` = cadastros no período, `{days}` = tamanho da janela. */
        description: '{count} nos últimos {days} dias',
        empty: 'Nenhuma nutriz se cadastrou até agora',
      },
      whatsappClicks: {
        label: 'Cliques no WhatsApp',
        /** `{total}` = acumulado desde o início da coleta. */
        description: '{total} desde o início da medição',
        empty: 'Nenhum contato registrado até agora',
      },
    },

    unitsByStatus: {
      title: 'Unidades por situação',
      /** `{total}` = todas as unidades cadastradas, publicadas ou não. */
      description: '{total} unidades cadastradas no total',
      empty:
        'Ainda não há unidades cadastradas. Elas chegam pela importação da base da rBLH.',
      labels: {
        ACTIVE: 'Ativas',
        PENDING: 'Aguardando revisão',
        INACTIVE: 'Inativas',
      },
    },

    unitsByType: {
      title: 'Unidades por tipo',
      description: 'Composição da rede cadastrada',
      labels: {
        MILK_BANK: 'Bancos de leite',
        COLLECTION_POINT: 'Postos de coleta',
        HOSPITAL: 'Hospitais',
        PARTNER: 'Parceiros',
      },
    },

    unitsByState: {
      title: 'Cobertura por estado',
      description: 'Unidades ativas em cada UF',
      empty:
        'Nenhuma unidade ativa ainda — por isso não há cobertura geográfica para mostrar.',
    },

    nutrizByState: {
      title: 'Nutrizes por estado',
      description:
        'Agregado por UF, nunca por cidade, para não identificar cadastros individuais.',
      empty:
        'Nenhuma nutriz se cadastrou ainda. O cadastro é opcional: a nutriz pode buscar unidades e falar pelo WhatsApp sem deixar dados.',
    },

    topUnits: {
      title: 'Unidades mais contatadas',
      /** `{days}` = tamanho da janela. */
      description: 'Cliques no WhatsApp nos últimos {days} dias',
      empty:
        'Nenhum clique no WhatsApp foi registrado nesta janela, então ainda não há ranking.',
      columns: {
        unit: 'Unidade',
        location: 'Localização',
        clicks: 'Cliques',
      },
    },
  },
  units: {
    seo: {
      title: 'Unidades | NutriLink Admin',
      description:
        'Gerencie os bancos de leite, pontos de coleta e demais unidades do NutriLink.',
    },
    title: 'Unidades',
    description:
      'Gerencie bancos de leite, pontos de coleta e demais unidades disponíveis no NutriLink.',
    createAction: 'Nova unidade',

    /** Formulário de cadastro/edição de unidade (Sprint 5.7). */
    form: {
      create: {
        seo: {
          title: 'Nova unidade | NutriLink Admin',
          description: 'Cadastre uma nova unidade na rede do NutriLink.',
        },
        title: 'Nova unidade',
        description:
          'Cadastre as informações institucionais e de contato da unidade.',
        submit: 'Cadastrar unidade',
      },

      edit: {
        seo: {
          title: 'Editar unidade | NutriLink Admin',
          description: 'Atualize os dados de uma unidade da rede do NutriLink.',
        },
        title: 'Editar unidade',
        description:
          'Atualize as informações institucionais e de contato da unidade.',
        submit: 'Salvar alterações',
      },

      actions: {
        back: 'Voltar para unidades',
        cancel: 'Cancelar',
        publicPage: 'Ver página pública',
        publicPageAria: 'Ver a página pública desta unidade (abre em nova aba)',
      },

      /** Endereço público da unidade — exibido, nunca editável (ver §13). */
      slug: {
        label: 'Endereço público',
        helper:
          'Gerado a partir do nome e da localização. Não é editável para não quebrar links já divulgados.',
      },

      sections: {
        basic: {
          title: 'Informações básicas',
          description: 'Identifique a unidade e seu tipo de atendimento.',
        },
        location: {
          title: 'Localização',
          description: 'Informe o endereço usado para localizar a unidade.',
        },
        contact: {
          title: 'Contato',
          description:
            'Informe os canais públicos que a unidade usa para atender quem quer doar.',
        },
        service: {
          title: 'Atendimento e orientação',
          description:
            'Horários e orientações que ajudam a nutriz a se preparar antes de procurar a unidade.',
        },
        coordinates: {
          title: 'Coordenadas',
          description:
            'Opcional. Preencha as duas juntas — usamos para posicionar o mapa da página da unidade.',
        },
        publication: {
          title: 'Publicação',
          description: 'Defina a situação da unidade dentro do NutriLink.',
        },
      },

      fields: {
        name: {
          label: 'Nome da unidade',
          placeholder: 'Ex.: Banco de Leite Humano Cachoeirinha',
        },
        type: { label: 'Tipo de unidade', placeholder: 'Selecione o tipo' },
        street: {
          label: 'Rua / logradouro',
          placeholder: 'Ex.: Avenida Deputado Emílio Carlos',
        },
        number: { label: 'Número', placeholder: 'Ex.: 3100 ou S/N' },
        complement: {
          label: 'Complemento',
          placeholder: 'Bloco, andar ou referência',
        },
        neighborhood: { label: 'Bairro', placeholder: 'Digite o bairro' },
        city: { label: 'Cidade', placeholder: 'Digite a cidade' },
        state: { label: 'Estado', placeholder: 'Selecione o estado' },
        zip: { label: 'CEP', placeholder: '00000-000' },
        phone: {
          label: 'Telefone',
          placeholder: '(11) 0000-0000',
          helper: 'Com DDD. Deixe vazio se a unidade não divulga telefone.',
        },
        whatsapp: {
          label: 'WhatsApp',
          placeholder: '(11) 90000-0000',
          helper:
            'Só preencha um número que realmente atende no WhatsApp — é o botão principal de contato da nutriz.',
        },
        email: { label: 'E-mail', placeholder: 'contato@unidade.org.br' },
        openingHours: {
          label: 'Horário de atendimento',
          placeholder: 'Segunda a sexta, das 8h às 17h',
        },
        instructions: {
          label: 'Orientações para doação',
          placeholder:
            'Ex.: procurar a recepção do 2º andar; levar documento com foto.',
        },
        whatsappMessage: {
          label: 'Mensagem inicial do WhatsApp',
          placeholder:
            'Olá! Gostaria de saber mais sobre doação de leite humano.',
          helper:
            'Vem preenchida na conversa quando a nutriz toca em "WhatsApp". Deixe vazio para usar a mensagem padrão.',
        },
        latitude: { label: 'Latitude', placeholder: '-23.550520' },
        longitude: { label: 'Longitude', placeholder: '-46.633308' },
        status: { label: 'Situação', placeholder: 'Selecione a situação' },
      },

      /**
       * Marca campos não obrigatórios. Com 18 campos, dizer o que é opcional
       * poupa mais tempo do que marcar o que é obrigatório com asterisco.
       */
      optionalLabel: 'opcional',

      /** Explica o efeito público de cada situação, sem depender só da cor. */
      statusHelper:
        'Somente unidades ativas aparecem na busca pública e têm página própria.',

      validation: {
        nameRequired: 'Informe o nome da unidade.',
        nameMax: 'O nome da unidade é muito longo.',
        typeRequired: 'Selecione um tipo de unidade.',
        streetRequired: 'Informe o logradouro.',
        streetMax: 'O logradouro é muito longo.',
        numberMax: 'O número é muito longo.',
        complementMax: 'O complemento é muito longo.',
        neighborhoodRequired: 'Informe o bairro.',
        neighborhoodMax: 'O bairro é muito longo.',
        cityRequired: 'Informe a cidade.',
        cityMax: 'O nome da cidade é muito longo.',
        stateInvalid: 'Selecione uma UF brasileira válida.',
        zipInvalid: 'CEP inválido. Use 8 dígitos (00000-000).',
        phoneInvalid: 'Telefone inválido. Use DDD + número.',
        whatsappInvalid: 'WhatsApp inválido. Use DDD + número.',
        emailInvalid: 'Informe um e-mail válido.',
        openingHoursMax: 'O horário de atendimento é muito longo.',
        instructionsMax: 'As orientações estão muito longas.',
        whatsappMessageMax: 'A mensagem inicial é muito longa.',
        latitudeInvalid: 'Informe uma latitude entre -90 e 90.',
        longitudeInvalid: 'Informe uma longitude entre -180 e 180.',
        coordinatesPair:
          'Informe latitude e longitude juntas ou deixe as duas vazias.',
        statusRequired: 'Selecione uma situação válida.',
      },

      /**
       * Retorno das Server Actions (Sprint 5.8). Toda mensagem aqui é segura
       * para exibir: nenhuma carrega código do Prisma, SQL ou stack.
       */
      mutations: {
        submittingCreate: 'Cadastrando unidade...',
        submittingUpdate: 'Salvando alterações...',
        createError:
          'Não foi possível cadastrar a unidade agora. Tente novamente em alguns instantes.',
        updateError:
          'Não foi possível salvar as alterações agora. Tente novamente em alguns instantes.',
        validationGeneric: 'Revise os campos destacados e envie novamente.',
        slugConflict:
          'Já existe uma unidade com esse nome nesta cidade. Ajuste o nome para diferenciá-la.',
        notFound:
          'Esta unidade não existe mais. Ela pode ter sido removida em outra aba.',
        /** Título do alerta de erro — o texto acompanha, nunca só a cor. */
        errorTitle: 'Não foi possível salvar',
      },
    },

    filters: {
      /** Nome acessível do formulário (vira landmark de busca). */
      label: 'Filtros da lista de unidades',
      search: {
        label: 'Buscar unidade',
        placeholder: 'Digite o nome da unidade',
      },
      status: {
        label: 'Situação',
        all: 'Todas as situações',
      },
      type: {
        label: 'Tipo',
        all: 'Todos os tipos',
      },
      state: {
        label: 'Estado',
        all: 'Todos os estados',
      },
      city: {
        label: 'Cidade',
        placeholder: 'Digite a cidade',
      },
      actions: {
        apply: 'Filtrar',
        clear: 'Limpar filtros',
      },
    },

    results: {
      countOne: 'unidade encontrada',
      countOther: 'unidades encontradas',
    },

    table: {
      caption: 'Unidades cadastradas no NutriLink',
      columns: {
        unit: 'Unidade',
        type: 'Tipo',
        location: 'Localização',
        contact: 'Contato',
        status: 'Situação',
        actions: 'Ações',
      },
      edit: 'Editar',
      /** `{unitName}` é substituído no componente. */
      editAria: 'Editar {unitName}',
      publicPage: 'Ver página pública',
      publicPageAria: 'Ver a página pública de {unitName} (abre em nova aba)',
    },

    /**
     * Rótulos no singular, para uma linha da lista. O painel (5.5) usa plural
     * ("Ativas", "Aguardando revisão") porque lá o rótulo nomeia uma contagem —
     * são formas gramaticais diferentes, não duplicação.
     */
    status: {
      ACTIVE: 'Ativa',
      PENDING: 'Pendente',
      INACTIVE: 'Inativa',
    },

    types: {
      MILK_BANK: 'Banco de leite',
      COLLECTION_POINT: 'Ponto de coleta',
      HOSPITAL: 'Hospital',
      PARTNER: 'Parceiro',
    },

    contact: {
      whatsapp: 'WhatsApp',
      phone: 'Telefone',
      none: 'Não informado',
    },

    pagination: {
      label: 'Paginação das unidades',
      previous: 'Anterior',
      next: 'Próxima',
      /** `{page}` e `{total}` são substituídos no componente. */
      status: 'Página {page} de {total}',
    },

    empty: {
      database: {
        title: 'Nenhuma unidade cadastrada',
        description:
          'Cadastre o primeiro banco de leite ou ponto de coleta para disponibilizá-lo no NutriLink.',
        action: 'Cadastrar primeira unidade',
      },
      filtered: {
        title: 'Nenhuma unidade encontrada',
        description:
          'Nenhuma unidade corresponde a esses filtros. Tente ajustar a busca ou limpar os filtros.',
        action: 'Limpar filtros',
      },
    },
  },
  nutrizes: {
    seo: {
      title: 'Nutrizes | NutriLink Admin',
      description: 'Acompanhe as nutrizes cadastradas no NutriLink.',
    },
    title: 'Nutrizes',
    description:
      'Acompanhe quem se cadastrou para doar e em que ponto da conversa cada pessoa está.',

    /**
     * Aviso permanente de LGPD. Fica visível na tela, não escondido em
     * documentação: esta é a única tela do painel que lista dados pessoais.
     */
    privacyNotice:
      'Esta tela mostra dados pessoais de pessoas reais. Use apenas para atender quem se cadastrou e evite exibi-la em apresentações ou compartilhamento de tela.',

    filters: {
      label: 'Filtros da lista de nutrizes',
      search: {
        label: 'Buscar por nome',
        placeholder: 'Digite o nome da nutriz',
      },
      status: { label: 'Situação', all: 'Todas as situações' },
      state: { label: 'Estado', all: 'Todos os estados' },
      actions: { apply: 'Filtrar', clear: 'Limpar filtros' },
    },

    results: {
      countOne: 'nutriz cadastrada',
      countOther: 'nutrizes cadastradas',
    },

    table: {
      caption: 'Nutrizes cadastradas no NutriLink',
      columns: {
        nutriz: 'Nutriz',
        location: 'Localização',
        contact: 'Contato',
        status: 'Situação',
        consent: 'Consentimento',
        signedUpAt: 'Cadastro',
      },
    },

    contact: {
      /** `{name}` é substituído no componente. */
      revealAria: 'Mostrar o WhatsApp de {name}',
      hideAria: 'Ocultar o WhatsApp de {name}',
      reveal: 'Mostrar',
      hide: 'Ocultar',
      whatsappLabel: 'WhatsApp',
      emailLabel: 'E-mail',
      noEmail: 'Sem e-mail',
      /** Canal que a nutriz escolheu para ser contatada. */
      preference: {
        WHATSAPP: 'Prefere WhatsApp',
        EMAIL: 'Prefere e-mail',
        NONE: 'Não quer contato',
      },
    },

    consent: {
      /** `{date}` é substituído no componente. */
      lgpd: 'LGPD em {date}',
      marketingYes: 'Aceita campanhas',
      marketingNo: 'Só contato essencial',
    },

    status: {
      INTERESTED: 'Interessada',
      CONTACTED: 'Contatada',
      DONATED: 'Doou',
      UNKNOWN: 'Sem retorno',
    },

    pagination: {
      label: 'Paginação das nutrizes',
      previous: 'Anterior',
      next: 'Próxima',
      /** `{page}` e `{total}` são substituídos no componente. */
      status: 'Página {page} de {total}',
    },

    empty: {
      database: {
        title: 'Nenhuma nutriz cadastrada',
        description:
          'O cadastro é opcional: a nutriz pode encontrar uma unidade e falar pelo WhatsApp sem deixar dados. Quem escolher se cadastrar aparece aqui.',
      },
      filtered: {
        title: 'Nenhuma nutriz encontrada',
        description:
          'Nenhum cadastro corresponde a esses filtros. Tente ajustar a busca ou limpar os filtros.',
        action: 'Limpar filtros',
      },
    },
  },
  noAccess: {
    seo: {
      title: 'Acesso restrito | NutriLink Admin',
      description: 'Esta conta não tem permissão para acessar o painel.',
    },
    title: 'Esta conta não tem acesso ao painel',
    description:
      'O acesso ao painel administrativo é liberado apenas para contas com permissão de administração. Se você acredita que isso é um engano, fale com a pessoa responsável pelo projeto.',
  },
} as const

export const A11Y = {
  skipToContent: 'Ir para o conteúdo principal',
  navMenu: 'Menu de navegação',
  logoHome: 'NutriLink - Ir para página inicial',
} as const

export type NavItem = (typeof NAV.items)[number]
