export const SITE = {
  name: 'NutriLink',
  tagline: 'Conectando vidas através do leite humano.',
  description:
    'Solução digital do Lactare para orientar nutrizes e verificar a área de atuação na Grande São Paulo.',
  credits: 'Uma iniciativa NutriLink · Eurofarma',
  partnerCredit: 'Desenvolvido em parceria com FIAP',
} as const

export const NAV = {
  items: [
    { label: 'Início', href: '/' },
    { label: 'Como funciona', href: '/como-funciona' },
    { label: 'Verificar cobertura', href: '/verificar-cobertura' },
    { label: 'Sobre', href: '/sobre' },
  ],
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
    findBank: {
      label: 'Verificar cidade atendida',
      href: '/verificar-cobertura',
    },
    admin: { label: 'Admin', href: '/admin/login' },
  },
  contact: {
    title: 'Canais oficiais do Lactare',
    description: 'Acompanhe o banco de leite e fale diretamente com a equipe.',
    email: {
      label: 'E-mail do Lactare',
      address: 'bl@lactare.com.br',
    },
    channels: {
      website: {
        label: 'Site do Lactare',
        href: 'https://www.lactare.com.br/',
      },
      instagram: {
        label: 'Instagram do Lactare',
        href: 'https://www.instagram.com/lactarebr/',
      },
      youtube: {
        label: 'YouTube do Lactare',
        href: 'https://www.youtube.com/@lactarebr',
      },
      linkedin: {
        label: 'LinkedIn do Lactare',
        href: 'https://www.linkedin.com/company/lactarebr',
      },
      whatsapp: {
        label: 'WhatsApp do Lactare',
        href: 'https://wa.me/5511966290681',
      },
    },
  },
  copyright: `© ${new Date().getFullYear()} NutriLink. Todos os direitos reservados.`,
} as const

export const LEGAL = {
  privacy: {
    meta: {
      title: 'Política de Privacidade | NutriLink',
      description:
        'Saiba como o NutriLink trata dados pessoais durante a jornada digital de relacionamento com o Lactare.',
    },
    eyebrow: 'Privacidade e proteção de dados',
    title: 'Política de Privacidade',
    introduction:
      'Esta página descreve, de forma transparente, como o NutriLink trata dados pessoais para oferecer a experiência digital de relacionamento com o Lactare.',
    updatedAt: 'Última atualização: 18 de setembro de 2026.',
    reviewNotice:
      'Versão para demonstração técnica. O texto deverá ser validado pelas áreas jurídica e de privacidade da Eurofarma antes de qualquer exposição pública.',
    sections: [
      {
        title: '1. Quem participa desta experiência',
        paragraphs: [
          'O NutriLink é a solução digital de apoio à jornada das nutrizes atendidas pelo Lactare, banco de leite humano da Eurofarma. O Lactare permanece responsável pelo atendimento, pela avaliação profissional e pela operação de coleta e processamento do leite.',
          'O NutriLink não realiza triagem clínica, não mantém prontuário e não substitui o contato com a equipe do Lactare.',
        ],
      },
      {
        title: '2. Quais dados podem ser tratados',
        paragraphs: [
          'Conforme a funcionalidade utilizada, podemos tratar nome, e-mail, telefone ou WhatsApp, cidade, preferências de comunicação, consentimentos, origem do cadastro e status categórico da jornada informado pelo Lactare.',
          'Registros pessoais opcionais disponibilizados na área autenticada pertencem à própria nutriz e não devem conter informações clínicas. O CEP consultado para verificar cobertura é usado somente para identificar município e UF e não é armazenado pelo NutriLink.',
        ],
      },
      {
        title: '3. Para quais finalidades',
        paragraphs: [
          'Os dados são utilizados para criar e proteger a conta, verificar a área atendida, manter a continuidade da jornada, responder pelo chatbot, registrar consentimentos, enviar comunicações autorizadas e produzir métricas agregadas de uso e melhoria do serviço.',
          'Lembretes e avisos pelo WhatsApp dependem de autorização específica e podem ser cancelados. Um lembrete nunca representa agendamento ou confirmação de coleta.',
        ],
      },
      {
        title: '4. Compartilhamento e fornecedores',
        paragraphs: [
          'Os dados podem ser processados por fornecedores essenciais de infraestrutura, autenticação, banco de dados e comunicação, apenas na medida necessária para operar o serviço. O canal de WhatsApp pode envolver a plataforma da Meta e, conforme a configuração adotada, um provedor intermediário de comunicação. A relação de fornecedores e seus papéis deverá ser validada antes da publicação definitiva.',
          'O NutriLink não vende dados pessoais nem oferece recompensa material por indicação.',
        ],
      },
      {
        title: '5. Segurança e conservação',
        paragraphs: [
          'São adotadas medidas técnicas e organizacionais para limitar acessos, reduzir os dados coletados e proteger as informações contra uso indevido. Os dados devem ser conservados somente pelo período necessário às finalidades informadas e às obrigações aplicáveis.',
        ],
      },
      {
        title: '6. Seus direitos',
        paragraphs: [
          'A titular pode solicitar confirmação do tratamento, acesso, correção, informação sobre compartilhamento, portabilidade quando aplicável, revogação de consentimento e eliminação de dados tratados com base em consentimento, observadas as hipóteses legais de conservação.',
          'Solicitações de privacidade e exclusão podem ser encaminhadas ao canal de contato indicado abaixo. Antes de atender ao pedido, poderá ser necessário confirmar a identidade da solicitante para proteger seus dados.',
        ],
      },
      {
        title: '7. Contato',
        paragraphs: [
          'A identificação do controlador, do encarregado e o canal institucional para exercício de direitos deverão ser definidos e validados pela Eurofarma antes da publicação definitiva. Esta versão de demonstração não deve ser usada para enviar solicitações formais de privacidade.',
        ],
      },
    ],
  },
  terms: {
    meta: {
      title: 'Termos de Uso | NutriLink',
      description:
        'Conheça as condições de uso da experiência digital NutriLink.',
    },
    eyebrow: 'Condições de uso',
    title: 'Termos de Uso',
    introduction:
      'Estes termos apresentam os limites e as condições básicas para uso da experiência digital NutriLink.',
    updatedAt: 'Última atualização: 18 de setembro de 2026.',
    reviewNotice:
      'Versão para demonstração técnica. O texto deverá ser validado pelas áreas jurídica e de privacidade da Eurofarma antes de qualquer exposição pública.',
    sections: [
      {
        title: '1. Finalidade do NutriLink',
        paragraphs: [
          'O NutriLink oferece informações educativas, verificação geográfica da área atendida pelo Lactare, cadastro opcional, área pessoal e canais digitais de relacionamento.',
          'A plataforma não realiza diagnóstico, triagem clínica, agendamento ou confirmação automática de coleta.',
        ],
      },
      {
        title: '2. Cadastro e segurança da conta',
        paragraphs: [
          'A usuária deve fornecer informações verdadeiras, manter suas credenciais protegidas e comunicar qualquer suspeita de acesso indevido. O cadastro é opcional e exige concordância com o tratamento de dados necessário à conta.',
        ],
      },
      {
        title: '3. Jornada e comunicações',
        paragraphs: [
          'Os status exibidos são categorias operacionais registradas pela equipe autorizada. Questões clínicas e a combinação de data e horário de coleta permanecem sob responsabilidade dos profissionais e dos canais oficiais do Lactare.',
          'Comunicações opcionais podem ser canceladas. Sugestões e lembretes são informativos e não acionam uma coleta automaticamente.',
        ],
      },
      {
        title: '4. Uso responsável',
        paragraphs: [
          'Não é permitido tentar acessar contas de terceiros, interferir no funcionamento do serviço, automatizar abuso dos canais ou inserir conteúdo ilícito, ofensivo ou dados clínicos desnecessários.',
        ],
      },
      {
        title: '5. Disponibilidade e alterações',
        paragraphs: [
          'A demonstração pode sofrer interrupções e mudanças durante o desenvolvimento. Funcionalidades dependentes de serviços externos, como WhatsApp e e-mail, também estão sujeitas à disponibilidade desses fornecedores.',
        ],
      },
      {
        title: '6. Contato',
        paragraphs: [
          'O canal institucional para dúvidas sobre estes termos deverá ser definido e validado pela Eurofarma antes da publicação definitiva. Esta versão de demonstração não apresenta um canal oficial de atendimento jurídico.',
        ],
      },
    ],
  },
} as const

export const HOME = {
  hero: {
    badge: 'Área de atuação do Lactare',
    titleLead: 'Seu leite é um',
    titleHighlight: 'presente de vida',
    titleTail: 'para quem mais precisa',
    description:
      'O NutriLink ajuda você a descobrir se sua cidade é atendida pelo Lactare e orienta os próximos passos da doação de leite humano.',
    primaryCta: {
      label: 'Verificar minha cidade',
      href: '/verificar-cobertura',
    },
    secondaryCta: { label: 'Como funciona', href: '/como-funciona' },
    trust: [
      'Seus dados protegidos pela LGPD',
      'Contato direto e gratuito pelo WhatsApp',
    ],
    imageAlt: 'Bebê recém-nascido aconchegado em um cobertor macio',
  },
  stats: {
    title: 'Área de atuação em números',
    municipalities: { label: 'Municípios atendidos', fallback: '30' },
    regions: { label: 'Sub-regiões da Grande SP', fallback: '6' },
    sourceNote:
      'A cobertura exibida segue a lista administrável de municípios atendidos pelo Lactare.',
  },
  network: {
    eyebrow: 'Conheça a solução',
    title: 'NutriLink e Lactare, cada um com seu papel',
    subtitle:
      'O NutriLink reduz a distância entre a sua dúvida e o contato com a equipe que realiza o atendimento.',
    cards: [
      {
        title: 'O que é o NutriLink?',
        description:
          'É a experiência digital que informa, verifica a cobertura do Lactare e acompanha sua jornada de forma simples e acolhedora.',
        items: [
          'Verificação por município',
          'Cadastro opcional e continuidade da jornada',
          'Conteúdo acolhedor e confiável',
        ],
        cta: { label: 'Saiba mais', href: '/sobre' },
      },
      {
        title: 'Lactare, o banco de leite humano da Eurofarma',
        description:
          'É a operação responsável pelo atendimento, pela triagem profissional, pela coleta conforme disponibilidade e pelo processamento seguro do leite doado.',
        items: [
          'Atuação na Grande São Paulo',
          'Triagem feita por profissionais',
          'Contato direto para combinar os próximos passos',
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
      {
        tag: 'Identificação',
        title: 'Identifique o frasco',
        description:
          'Anote a data e o horário da extração antes de guardar o frasco. Siga as orientações recebidas pela equipe do Lactare.',
      },
      {
        tag: 'Orientação',
        title: 'Conte com o Lactare',
        description:
          'Para dúvidas sobre sua jornada ou os próximos passos, fale diretamente com a equipe do Lactare.',
      },
      {
        tag: 'Preparação',
        title: 'Prepare seu momento',
        description:
          'Antes de começar, deixe o frasco e os utensílios limpos ao alcance e escolha um momento tranquilo.',
      },
    ],
  },
  finalCta: {
    title: 'Pronta para fazer a diferença?',
    description:
      'Descubra se sua cidade está na área do Lactare e veja como continuar. É simples, transparente e acolhedor.',
    primaryCta: {
      label: 'Verificar minha cidade',
      href: '/verificar-cobertura',
    },
    secondaryCta: { label: 'Como funciona', href: '/como-funciona' },
  },
} as const

export const ABOUT = {
  meta: {
    title: 'Sobre o NutriLink',
    description:
      'Conheça o NutriLink, solução digital criada para apoiar a jornada de doação no Lactare.',
  },
  hero: {
    eyebrow: 'Sobre o NutriLink',
    title: 'Uma ponte digital entre a nutriz e o Lactare.',
    description:
      'Informação, cobertura e continuidade da jornada reunidas em uma experiência simples para a Grande São Paulo.',
    impactLabel: 'Escopo da solução',
    impact: [
      { value: '30', label: 'municípios configurados' },
      { value: '6', label: 'sub-regiões da Grande SP' },
      { value: '3', label: 'frentes digitais integradas' },
    ],
  },
  history: {
    eyebrow: 'Nossa essência',
    title: 'Nossa história',
    paragraphs: [
      'O Lactare é o banco de leite humano da Eurofarma e realiza o atendimento, a triagem profissional e o processamento do leite doado.',
      'O NutriLink nasceu para reduzir as barreiras digitais dessa jornada: esclarecer dúvidas, verificar a área atendida e facilitar o contato com o Lactare.',
      'A solução concentra a entrada no WhatsApp e usa a plataforma web para conteúdos, consentimentos, área pessoal e gestão administrativa.',
    ],
  },
  mission: {
    eyebrow: 'O que nos move',
    title: 'Nossa missão',
    quote:
      'Oferecer às nutrizes da área do Lactare um caminho simples, acolhedor e transparente entre a primeira dúvida e o contato com a equipe responsável.',
  },
  timeline: {
    eyebrow: 'Nossa trajetória',
    title: 'Marcos da jornada',
    description:
      'A operação do Lactare ganha uma jornada digital sem substituir o atendimento profissional.',
    milestones: [
      {
        year: '2019',
        description: 'Inauguração do Lactare pela Eurofarma em Itapevi',
      },
      {
        year: 'Operação',
        description:
          'Coleta, processamento e doação de leite para hospitais públicos parceiros',
      },
      {
        year: 'Expansão',
        description: 'Parceria ampliada para o Hospital Geral de Carapicuíba',
      },
      {
        year: '2026',
        description:
          'Desenvolvimento do NutriLink Digital para web, WhatsApp e gestão',
      },
    ],
  },
  partners: {
    eyebrow: 'Construído em conjunto',
    title: 'Parceiros institucionais',
    description:
      'Cada instituição tem um papel próprio: a Eurofarma mantém o Lactare, e os hospitais parceiros recebem o leite processado para uso assistencial.',
    items: [
      'Eurofarma',
      'Lactare',
      'Hospital Geral de Itapevi',
      'Hospital Geral de Carapicuíba',
    ],
  },
  finalCta: {
    title: 'Faça parte dessa história.',
    description:
      'Verifique se sua cidade faz parte da área de atuação do Lactare.',
    cta: {
      label: 'Verificar minha cidade',
      href: '/verificar-cobertura',
    },
  },
} as const

export const CONTENT = {
  meta: {
    title: 'Conteúdos',
    description:
      'Espaço educativo do NutriLink: guias, vídeos e dúvidas frequentes para acompanhar cada etapa da sua jornada como nutriz, da primeira dúvida à primeira doação.',
  },
  hero: {
    titleLead: 'Tudo que você precisa saber',
    titleHighlight: 'para cuidar e compartilhar',
    description:
      'Um espaço pensado com carinho para acompanhar cada etapa da sua jornada como nutriz. Da primeira dúvida à primeira doação.',
    searchLabel: 'Buscar conteúdos',
    searchPlaceholder: 'Buscar artigos, vídeos ou dúvidas frequentes...',
    filters: ['Todos', 'Extração', 'Armazenamento', 'Amamentação', 'Doação'],
    articles: [
      {
        category: 'Extração',
        title: 'Técnica de extração manual',
        summary:
          'Conheça os cuidados e movimentos que ajudam a tornar a extração mais segura e confortável.',
        readTime: '4 min de leitura',
        href: '#amamentacao-na-pratica',
      },
      {
        category: 'Extração',
        title: 'Higiene antes da extração',
        summary:
          'Veja como preparar as mãos, o ambiente e os utensílios antes de coletar o leite.',
        readTime: '3 min de leitura',
        href: '#caminho-da-doacao',
      },
      {
        category: 'Armazenamento',
        title: 'Armazenamento seguro do leite',
        summary:
          'Entenda como identificar, conservar e proteger o leite extraído seguindo as orientações recebidas.',
        readTime: '3 min de leitura',
        href: '#caminho-da-doacao',
      },
      {
        category: 'Amamentação',
        title: 'Como identificar uma boa pega',
        summary:
          'Conheça os sinais de uma pega adequada e saiba quando buscar orientação profissional.',
        readTime: '4 min de leitura',
        href: '#amamentacao-na-pratica',
      },
      {
        category: 'Amamentação',
        title: 'Produção de leite e rotina',
        summary:
          'Leia sobre estímulo, frequência e sinais do dia a dia que ajudam a compreender a produção de leite.',
        readTime: '4 min de leitura',
        href: '#amamentacao-na-pratica',
      },
      {
        category: 'Doação',
        title: 'Quem pode ser doadora',
        summary:
          'Veja os critérios iniciais e entenda por que a decisão depende da avaliação da equipe do Lactare.',
        readTime: '2 min de leitura',
        href: '#duvidas-frequentes',
      },
      {
        category: 'Doação',
        title: 'As etapas da jornada de doação',
        summary:
          'Acompanhe o caminho do primeiro contato à coleta domiciliar e saiba o que esperar de cada etapa.',
        readTime: '3 min de leitura',
        href: '#caminho-da-doacao',
      },
    ],
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
    title: 'O Caminho do Leite',
    description:
      'Do primeiro contato até a coleta um passo a passo visual e claro.',
    steps: [
      {
        title: 'Primeiro contato pelo WhatsApp',
        description: 'Tire suas dúvidas e comece sua jornada com o Lactare.',
      },
      {
        title: 'Verificação da área atendida',
        description:
          'Informe sua cidade e veja se está na área de atuação do Lactare.',
      },
      {
        title: 'Ficha de saúde e exame de sangue',
        description:
          'Preencha a ficha de saúde. O laboratório parceiro coleta o exame na sua casa.',
      },
      {
        title: 'Entrega do kit em casa',
        description:
          'A equipe leva os potinhos esterilizados e orienta sobre higiene e coleta. Sua presença é necessária.',
      },
      {
        title: 'Extração e armazenamento em casa',
        description:
          'Siga as orientações recebidas e guarde o leite no freezer.',
      },
      {
        title: 'Coleta domiciliar do leite',
        description:
          'Nossa equipe busca o leite na sua casa, sem custo e sem deslocamento.',
      },
    ],
  },
  videos: {
    title: 'Vídeos Explicativos',
    items: [
      {
        title: 'Como funciona o cadastro',
        duration: '2:34',
        thumbnail:
          'https://images.unsplash.com/photo-1773243086607-0e2d41fb59c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
      },
      {
        title: 'Como falar com o Lactare',
        duration: '3:18',
        thumbnail:
          'https://images.unsplash.com/photo-1774041339887-9ab8c56f7482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
      },
    ],
  },
  checklist: {
    readyLabel: 'prontos',
    groups: [
      {
        title: 'O que esperar da entrega do kit',
        subtitle: 'Marque cada item conforme você se preparar',
        items: [
          'Levar documento de identidade com foto',
          'Levar a Caderneta de Saúde do bebê',
          'Usar roupa confortável para amamentação',
          'Ter em mãos seu histórico de saúde (medicamentos, exames recentes)',
        ],
      },
      {
        title: 'Como se preparar para a coleta em casa',
        subtitle: 'Marque cada item conforme você se preparar',
        items: [
          'Lavar as mãos com água e sabão por 20 segundos',
          'Higienizar as mamas e secar com papel toalha',
          'Ter o frasco de vidro esterilizado por perto',
          'Etiquetar o frasco com data e horário',
          'Guardar o leite no freezer até a equipe buscar',
        ],
      },
    ],
  },
  practice: {
    eyebrow: 'Seção 3',
    title: 'Amamentação na Prática',
    action: { label: 'Ver todos os guias', href: '#' },
    cards: [
      {
        tag: 'Elegibilidade',
        title: 'Quem pode doar leite humano?',
        description:
          'Toda mulher que amamenta, produz um volume excedente de leite, está saudável e não utiliza medicamentos contraindicados para a amamentação pode ser uma doadora. Basta entrar em contato com o banco de leite para fazer o cadastro e receber as orientações.',
        readTime: '1 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Segurança',
        title: 'O que é amamentação cruzada e por que ela é perigosa?',
        description:
          'Amamentação cruzada é a prática de amamentar o filho de outra mulher diretamente no peito. Ela é contraindicada pela Organização Mundial da Saúde e pelo Ministério da Saúde devido ao risco de transmissão de doenças infectocontagiosas. A forma segura de compartilhar leite é por meio da doação a um Banco de Leite Humano, onde o leite passa por rigoroso processo de pasteurização.',
        readTime: '1 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Saúde',
        title: 'É possível amamentar com mastite?',
        description:
          'Sim. Na maioria dos casos, amamentar ou extrair o leite no peito afetado ajuda a aliviar o ingurgitamento e acelera a recuperação. O leite de uma mama com mastite não faz mal ao bebê. Contudo, é fundamental buscar avaliação médica para o tratamento adequado da infecção.',
        readTime: '1 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Produção',
        title: 'Como saber se o meu leite é suficiente?',
        description:
          'A melhor forma de avaliar se o bebê está mamando o suficiente é observar o ganho de peso nas consultas pediátricas e os sinais do dia a dia, como se ele molha fraldas com frequência (urina clara) e se demonstra satisfação após as mamadas. A sensação de peito "murcho" não significa falta de leite, pois a maior parte da produção ocorre durante a própria mamada.',
        readTime: '1 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Relactação',
        title: 'É possível retomar a amamentação após uma pausa?',
        description:
          'Sim, o processo é chamado de relactação. Com o estímulo correto das mamas (frequência de extração ou sucção do bebê) e orientação profissional especializada, é possível reestimular a produção de leite humano mesmo após dias ou semanas sem amamentar.',
        readTime: '1 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
      {
        tag: 'Pega',
        title: 'Como identificar uma boa pega do bebê?',
        description:
          'Uma pega adequada acontece quando o bebê abocanha a maior parte da aréola (e não apenas o mamilo), fica com a boca bem aberta ("boca de peixinho"), o queixo encostado na mama e o nariz livre. A amamentação correta não deve causar dor nem ferimentos no peito.',
        readTime: '1 min de leitura',
        cta: { label: 'Ler artigo', href: '#' },
      },
    ],
  },
  stories: {
    eyebrow: 'Seção 4',
    title: 'Jornadas possíveis',
    description:
      'Relatos reais de nutrizes atendidas pelo Lactare, publicados pelos canais oficiais do banco de leite.',
    items: [
      {
        role: 'Doadora e receptora',
        quote:
          'Ah, a doação de leite! Descobri o Lactare no nascimento da minha primeira filha, que hoje tem 3 anos, e contribuí um pouco com a doação de leite. Com minha segunda filha foi diferente: ela nasceu prematura e precisou de doação na UTI neonatal. Quando ela saiu da UTI, procurei de novo o Lactare e fui recebida de braços abertos por esse projeto que ajuda tantos bebês! Sempre fui recebida com um sorriso, as meninas são fantásticas e estão de parabéns.',
        name: 'Polyana',
        detail: 'Mãe de Mariana e Maria Vitória',
      },
      {
        role: 'Doadora',
        quote:
          'Sou mãe do Arthur, de 6 meses. Foi durante o pré-natal que conheci o Lactare e aprendi mais sobre amamentação e doação de leite humano. Com o apoio que recebi, consegui amamentar o meu filho e também doar o leite excedente. Vi de perto a angústia das famílias que aguardavam do lado de fora da UTI neonatal, torcendo pela recuperação de seus bebês. Foi ali que compreendi ainda mais a importância da doação de leite humano. Hoje, compartilho minha experiência e incentivo outras pessoas a conhecerem a doação. É uma sensação maravilhosa nutrir o meu filho e ainda poder ajudar tantos bebês prematuros.',
        name: 'Bruna Sousa',
        detail: 'Mãe do Arthur',
      },
      {
        role: 'Receptora e doadora',
        quote:
          'Eu estava muito triste por não conseguir amamentar minha filha e me sentia frustrada. O Lactare salvou a minha amamentação. Quando voltamos para casa, meu leite desceu, meus seios ficaram empedrados, feridos e doendo muito. Eu tinha leite, mas não sabia como massagear nem fazer a extração, e minha filha não conseguia mamar. Desesperado, meu marido ligou para o Lactare e fomos orientados a ir até lá. Fui acolhida pelas enfermeiras, que cuidaram de mim, extraíram meu leite e me ensinaram a amamentar, massagear as mamas e fazer a extração corretamente. Foi por causa desse acolhimento que hoje tenho a alegria de retribuir um pouco desse cuidado, doando leite para outros bebês.',
        name: 'Ariane Nazari',
        detail: 'Mãe da Alice',
      },
    ],
    cta: {
      lead: 'Você também faz parte dessa história.',
      label: 'Quero ser doadora',
      href: '/verificar-cobertura',
    },
  },
  faq: {
    eyebrow: 'Seção 5',
    title: 'Dúvidas Frequentes',
    items: [
      {
        question: 'Posso doar se estou tomando medicamentos?',
        answer:
          'Depende do medicamento. A equipe do Lactare avalia cada caso durante a triagem profissional. Sempre informe todos os medicamentos que usa.',
      },
      {
        question: 'O leite que sobra depois que o bebê mamou pode ser doado?',
        answer:
          'Sim! O leite que sobra após a mamada pode ser coletado, desde que respeitadas as normas de higiene. Coloque imediatamente no frasco esterilizado, etiquete com data e hora e armazene conforme as orientações do banco de leite.',
      },
      {
        question: 'Quantas vezes por semana posso fazer a coleta?',
        answer:
          'Não há um limite único — isso depende da sua produção e da orientação recebida. O importante é não comprometer a alimentação do seu próprio bebê.',
      },
      {
        question: 'Meu bebê vai ter menos leite se eu doar?',
        answer:
          'Não! A produção de leite funciona pela lógica de oferta e demanda. Quanto mais você extrai, mais seu corpo produz. Desde que o bebê continue mamando normalmente, a produção se mantém ou até aumenta.',
      },
      {
        question: 'Posso parar de ser doadora quando quiser?',
        answer:
          'Sim. A doação é sempre voluntária e você pode encerrar a qualquer momento, sem nenhuma obrigação. Basta comunicar a equipe do Lactare.',
      },
      {
        question: 'Para quais bebês o leite doado é destinado?',
        answer:
          'Prioritariamente para recém-nascidos prematuros e de baixo peso internados em UTIs Neonatais. Esses bebês não podem receber fórmulas artificiais e o leite humano é o único alimento adequado para seu desenvolvimento.',
      },
      {
        question: 'Quando a febre em recém-nascidos deve preocupar?',
        answer:
          'Nos primeiros meses de vida, qualquer febre pede atenção médica imediata. Como o sistema imunológico do bebê ainda está em desenvolvimento, a febre deve sempre ser avaliada por um pediatra para identificar a causa e garantir o tratamento correto.',
      },
      {
        question: 'Como agir com segurança em caso de engasgo no bebê?',
        answer:
          'O engasgo é uma emergência que exige calma e ação rápida. Em bebês, a manobra recomendada é colocá-lo de bruços sobre o seu antebraço, com a cabeça um pouco mais baixa que o corpo, e aplicar 5 pancadas firmes entre as escápulas (nas costas). Se o bebê não desobstruir as vias aéreas, chame imediatamente o serviço de emergência (192).',
      },
      {
        question: 'Como higienizar corretamente o coto umbilical?',
        answer:
          'A limpeza do coto umbilical deve ser feita a cada troca de fralda e depois do banho. Use uma haste flexível com algodão embebido em álcool a 70%, limpando suavemente a base do umbigo em movimentos circulares. Mantenha a área sempre limpa, seca e fora da fralda para facilitar a cicatrização.',
      },
      {
        question: 'Respiração do bebê: o que é normal e o que exige atenção?',
        answer:
          'Em recém-nascidos, é comum a respiração ser irregular e mais rápida. Porém, sinais como chiado, afundamento das costelas ao respirar, lábios arroxeados ou pausas respiratórias prolongadas são alertas que exigem avaliação médica urgente.',
      },
    ],
    help: {
      title: 'Não encontrou sua resposta?',
      whatsapp: {
        label: 'Verificar cobertura',
        href: '/verificar-cobertura',
      },
      articles: { label: 'Ver todos os artigos', href: '#' },
    },
  },
} as const

export const COVERAGE = {
  regions: {
    CAPITAL: 'Capital',
    WEST: 'Oeste',
    SOUTHWEST: 'Sudoeste',
    ABC: 'ABC',
    NORTH: 'Norte',
    EAST_ALTO_TIETE: 'Leste / Alto Tietê',
  },
  meta: {
    title: 'Verificar cobertura',
    description:
      'Consulte os municípios da Grande São Paulo que fazem parte da área de atuação configurada do Lactare.',
  },
  hero: {
    eyebrow: 'Área de atuação do Lactare',
    title: 'Verifique a possibilidade de coleta residencial',
    description:
      'Informe seu CEP ou selecione o município para descobrir se sua localização faz parte da área de atuação do Lactare.',
  },
  checker: {
    title: 'Consultar elegibilidade',
    description:
      'O CEP identifica automaticamente a cidade. Se preferir, faça a consulta diretamente pelo município.',
    methodLabel: 'Como você quer verificar?',
    methods: {
      cep: 'Por CEP',
      municipality: 'Por município',
    },
    cep: {
      label: 'CEP da residência',
      placeholder: '00000-000',
      validation: 'Informe um CEP válido no formato 00000-000.',
    },
    municipality: {
      label: 'Município',
      placeholder: 'Escolha um município',
    },
    outsideOption: 'Minha cidade não aparece na lista',
    submit: 'Verificar possibilidade',
    submitting: 'Verificando...',
    municipalityValidation: 'Selecione uma opção para continuar.',
    responseInvalid:
      'Não foi possível interpretar a resposta. Tente novamente.',
    resolvedLocation: 'O CEP {cep} corresponde a {city} — {state}.',
  },
  eligible: {
    badge: 'Possibilidade de coleta residencial',
    title: '{city} faz parte da área atendida',
    description:
      'Há possibilidade de coleta residencial nessa localização. Isso ainda não confirma a coleta: triagem, modalidade, data e disponibilidade são combinadas diretamente com a equipe do Lactare.',
    contact: {
      eyebrow: 'Próximo passo',
      title: 'Fale diretamente com o Lactare',
      description:
        'Use um dos canais oficiais abaixo para iniciar o atendimento com a equipe responsável pela triagem e pelas orientações da doação.',
      whatsapp: 'Chamar no WhatsApp',
      phone: 'Ligar para o Lactare',
      whatsappLabel: 'WhatsApp oficial',
      phoneLabel: 'Telefone',
      hours: 'Horário publicado pelo Lactare: segunda a sexta, das 7h às 22h.',
      operationalNotice:
        'A cobertura positiva não confirma coleta ou atendimento. Modalidade, triagem, data e disponibilidade são informadas diretamente pela equipe do Lactare.',
      source: 'Canal conferido em {date} na fonte oficial: {source}',
      sourceName: 'site do Lactare',
    },
    signup: 'Quero criar meu cadastro',
    learnMore: 'Entender como funciona',
  },
  outside: {
    badge: 'Fora da área de atuação atual',
    title: 'Sua cidade não está na lista do Lactare',
    titleWithCity: '{city} não está na área atual do Lactare',
    description:
      'A coleta residencial do Lactare não está disponível para essa localização. Para encontrar atendimento em outra região, consulte a fonte oficial da Rede Brasileira de Bancos de Leite Humano.',
    officialDirectory: 'Consultar a rBLH oficial',
    officialDirectoryHref: 'https://rblh.fiocruz.br/',
  },
  api: {
    invalidJson: 'Não foi possível ler o CEP enviado.',
    invalidCep: 'Informe um CEP válido no formato 00000-000.',
    notFound:
      'Esse CEP não foi encontrado. Confira os números e tente novamente.',
    unavailable:
      'Não foi possível consultar o CEP agora. Tente novamente em instantes.',
    rateLimited:
      'Muitas consultas em pouco tempo. Aguarde um instante e tente novamente.',
  },
  municipalities: {
    title: 'Municípios atendidos',
    description:
      'A lista abaixo representa a configuração atual do Lactare e está organizada por sub-região da Grande São Paulo.',
    count: '{count} municípios ativos',
    location: '{city}, São Paulo, Brazil',
    emptyTitle: 'Cobertura indisponível no momento',
    emptyDescription:
      'Não foi possível carregar a lista de municípios. Tente novamente em alguns instantes.',
    map: {
      imageAlt:
        'Mapa com um marcador para cada município atendido pelo Lactare',
      unavailable:
        'Mapa indisponível no momento. A lista abaixo continua completa.',
    },
  },
} as const

/**
 * Mensagens do endpoint de tracking de contato (RF07). Ficam separadas de
 * `COVERAGE` porque o evento acompanha os canais do Lactare em qualquer tela,
 * não só o resultado da cobertura.
 */
export const CONTACT_TRACKING = {
  api: {
    invalidJson: 'Não foi possível ler o evento enviado.',
    invalidPayload: 'Evento de contato inválido.',
    rateLimited: 'Muitos eventos em pouco tempo. Tente novamente em instantes.',
    unavailable: 'Não foi possível registrar o evento agora.',
  },
} as const

/** Copy legada da antiga busca nacional. Não usar em novas superfícies. */
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
    quoteLines: [
      'Cada gota de leite humano doado',
      'é um ato de amor que salva vidas.',
    ],
    quoteSource: 'Ministério da Saúde — rBLH',
    bullets: [
      'Acompanhe sua jornada de doação',
      'Consulte a área de atuação do Lactare',
      'Mantenha seus dados de contato em um só lugar',
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
    'Crie sua conta para começar sua jornada de doação de leite humano e acompanhar os próximos passos. Leva menos de um minuto.',
  fields: {
    fullName: {
      label: 'Nome completo',
      placeholder: 'Seu nome completo',
    },
    email: {
      label: 'E-mail',
      placeholder: 'voce@email.com',
    },
    whatsapp: {
      label: 'WhatsApp',
      placeholder: '(11) 90000-0000',
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
    journeyStatusWhatsappOptIn: {
      label:
        'Quero receber pelo WhatsApp avisos quando o Lactare atualizar minha etapa da jornada.',
      help: 'Opcional e separado dos lembretes. Não representa agendamento ou confirmação de coleta.',
    },
    reminderWhatsappOptIn: {
      label:
        'Quero receber pelo WhatsApp lembretes de continuidade da minha jornada.',
      help: 'Opcional e separado dos avisos de status. Os lembretes não agendam nem confirmam coleta e podem ser desativados a qualquer momento.',
      referenceDateLabel: 'Data de referência do lembrete',
      referenceDateHelp:
        'Informe uma data apenas para orientar a continuidade. Ela não cria nem confirma agendamento.',
    },
  },
  actions: {
    submit: 'Criar minha conta',
    submitting: 'Enviando...',
    orContinue: 'ou continue com',
    whatsappCta: 'Verificar cobertura do Lactare',
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
    referenceDateRequired:
      'Informe uma data de referência para ativar o lembrete.',
    referenceDateInvalid:
      'Informe uma data de referência válida, que não esteja no futuro.',
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
        'Acesse sua conta do NutriLink para acompanhar sua jornada de doação de leite humano.',
    },
    backToHome: 'Voltar ao início',
    heading: 'Bem-vinda de volta 💙',
    subtitle: 'Acesse sua conta para acompanhar sua jornada e seus dados.',
    tabs: { login: 'Entrar', signup: 'Criar conta' },
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
      title: 'Minha área',
      description: 'Acompanhe sua jornada de doação de leite humano.',
    },
    // {firstName} é substituído no componente.
    greetingTemplate: 'Olá, {firstName}!',
    subtitle: 'Sua jornada com informação e transparência 💙',
    badge: 'Área da nutriz',
    // "Meus lembretes" (20/09/2026): substitui o card único de opt-in por 3
    // lembretes configuráveis independentemente. O consentimento guarda-chuva
    // (CommunicationConsentEvent, purpose REMINDERS_WHATSAPP) continua por
    // trás — ativar qualquer um destes concede esse consentimento se ainda
    // não existir; o fluxo do chatbot no WhatsApp continua igual e usa o
    // mesmo consentimento.
    reminders: {
      title: 'Meus lembretes',
      subtitle: 'Avisos que você escolheu receber no WhatsApp',
      activeCountNone: 'Nenhum ativo',
      activeCountOne: '1 ativo',
      activeCountOther: '{count} ativos',
      activeSectionTitle: 'ATIVOS',
      availableSectionTitle: 'DISPONÍVEL PARA ATIVAR',
      disableAction: 'Desativar',
      configureAction: 'Configurar',
      // Nota fixa do card fechado/aberto — distinta do disclaimer de cada
      // tela de configuração, que é mais específico por tipo.
      footerNote:
        'Nenhum lembrete agenda, confirma ou substitui contato direto com a equipe do Lactare.',
      backToList: 'Voltar para seus lembretes',
      activateAction: 'Ativar lembrete',
      cancelAction: 'Cancelar',
      submitting: 'Salvando...',
      previewLabel: 'Prévia da mensagem no WhatsApp',
      error:
        'Não foi possível salvar sua escolha agora. Tente novamente em instantes.',

      milkValidity: {
        // Título/subtítulo da linha ativa seguem o texto literal do mockup;
        // {days} já vem formatado ("1 dia"/"2 dias"/"3 dias") pelo componente.
        rowTitle: 'Validade do leite extraído em {date}',
        rowSubtitle: 'Avisaremos {days} antes do prazo de 15 dias no freezer',
        // Estado "disponível para ativar": não há mockup deste estado
        // específico (o mockup só mostra este tipo já ativo) — texto
        // consistente com a tela de configuração, fácil de ajustar depois.
        availableTitle: 'Validade do leite',
        availableSubtitle:
          'Baseado na sua última sessão registrada, avisamos antes do prazo de 15 dias no freezer.',
        configTitle: 'Lembrete de validade do leite',
        configDescription:
          'Baseado na sessão de extração que você registrou. Vamos te avisar antes do prazo recomendado de armazenamento, para você combinar a coleta com a equipe do Lactare a tempo.',
        sourceLabel: 'Sessão registrada',
        sourceValue: '{volume}ml extraídos em {date}',
        deadlineLabel: 'Prazo recomendado no freezer (15 dias)',
        questionLabel: 'Quando quer ser avisada?',
        options: {
          MILK_1_DAY_BEFORE: {
            label: '1 dia antes do prazo',
            helper: 'Aviso em {date}',
          },
          MILK_2_DAYS_BEFORE: {
            label: '2 dias antes do prazo',
            helper: 'Aviso em {date} — tempo de sobra para combinar a coleta',
          },
          MILK_3_DAYS_BEFORE: {
            label: '3 dias antes do prazo',
            helper: 'Aviso em {date}',
          },
        },
        reactivateHint:
          'Se você registrar uma nova sessão de extração, pode ativar este lembrete de novo para o novo lote.',
        previewTemplate:
          'Oi, {firstName}! O leite que você registrou em {recordedDate} está próximo do prazo de armazenamento (15 dias no freezer). Vale falar com a equipe do Lactare para combinar a coleta. 💙',
        disclaimer:
          'Este lembrete não agenda nem confirma a coleta. A combinação do dia e horário continua sendo feita diretamente com a equipe do Lactare.',
        emptyState:
          'Você ainda não registrou nenhuma sessão de extração. Assim que registrar a primeira, este lembrete fica disponível.',
      },

      futureDonation: {
        availableTitle: 'Doação futura',
        availableSubtitle:
          'Nos diga quando pretende doar de novo e avisamos você perto da data',
        // Estado ativo também não tem mockup próprio; reaproveita o rótulo
        // curto da opção escolhida ({optionLabel}, ex.: "7 dias antes").
        rowTitle: 'Doação futura em {date}',
        rowSubtitle: 'Avisaremos {optionLabel}',
        configTitle: 'Lembrete de doação futura',
        configDescription:
          'Nos diga quando você pretende doar de novo. Vamos te enviar um aviso gentil pelo WhatsApp perto dessa data — sem cobrança, sem compromisso.',
        dateLabel: 'Quando você pretende doar novamente?',
        dateHelp: 'Você pode alterar essa data a qualquer momento.',
        dateRequired: 'Informe a data em que pretende doar novamente.',
        datePast: 'Escolha uma data futura.',
        questionLabel: 'Quando quer ser avisada?',
        options: {
          DONATION_7_DAYS_BEFORE: {
            label: '7 dias antes',
            helper: 'Um único aviso, com tempo de sobra para se organizar',
          },
          DONATION_ON_DAY: {
            label: 'No próprio dia',
            helper: 'Um único aviso, na data que você indicou',
          },
          DONATION_7_DAYS_BEFORE_AND_ON_DAY: {
            label: '7 dias antes e no dia',
            helper:
              'Dois avisos, para quem prefere ser lembrada com mais calma',
          },
        },
        previewTemplate:
          'Oi, {firstName}! Você mencionou que pretendia doar novamente por volta desta data. Sem pressa — é só um lembrete carinhoso. Qualquer dúvida, fale com a equipe do Lactare. 💙',
        // Igual ao disclaimer geral de lembretes (mesmo texto do mockup).
        disclaimer:
          'Este lembrete não agenda nem confirma coleta, exame, visita ou atendimento. Essas combinações continuam sendo feitas diretamente com a equipe do Lactare.',
      },

      kitDelivery: {
        availableTitle: 'Entrega do kit',
        availableSubtitle:
          'Vamos te avisar perto do horário marcado pela equipe do Lactare',
        rowTitle: 'Entrega do kit — {date}, às {time}',
        rowSubtitle: 'Avisaremos {optionLabel}',
        configTitle: 'Lembrete de entrega do kit',
        configDescription:
          'A equipe do Lactare combinou uma visita para trazer os potinhos esterilizados e dar as orientações de coleta. Vamos te avisar perto do horário marcado.',
        sourceLabel: 'Compromisso registrado pela equipe do Lactare',
        sourceValue: 'Entrega do kit — {date}, às {time}',
        presenceNotice:
          'Sua presença é necessária nessa visita — é quando você recebe as orientações de higiene, coleta e armazenamento.',
        questionLabel: 'Quando quer ser avisada?',
        options: {
          KIT_MORNING_OF: {
            label: 'No dia, pela manhã',
            helper: 'Aviso às 8h do dia {date}',
          },
          KIT_1_DAY_BEFORE: {
            label: '1 dia antes',
            helper: 'Aviso às 18h do dia {date}',
          },
          KIT_1_DAY_BEFORE_AND_ON_DAY: {
            label: '1 dia antes e no dia',
            helper: 'Dois avisos, para quem prefere se organizar com calma',
          },
        },
        checklistHint:
          'O lembrete inclui um link para o checklist "O que esperar da entrega do kit", com o que levar nessa visita.',
        previewTemplateSameDay:
          'Oi, {firstName}! Passando para lembrar: hoje, às {time}, a equipe do Lactare vai até você entregar o kit e dar as orientações. Não esqueça o documento com foto e a Caderneta de Saúde do bebê. Qualquer imprevisto, avise a equipe. 💙',
        previewTemplateDayBefore:
          'Oi, {firstName}! Passando para lembrar: amanhã, dia {date} às {time}, a equipe do Lactare vai até você entregar o kit e dar as orientações. Não esqueça o documento com foto e a Caderneta de Saúde do bebê. Qualquer imprevisto, avise a equipe. 💙',
        disclaimer:
          'Este lembrete apenas ecoa um compromisso já combinado com a equipe do Lactare. Qualquer alteração de data ou horário deve ser feita diretamente com eles.',
        emptyState:
          'Ainda não há uma visita de entrega do kit registrada pela equipe do Lactare.',
      },
    },
    referral: {
      title: 'Indique o NutriLink',
      description:
        'Compartilhe seu link com outras nutrizes interessadas em conhecer o Lactare.',
      linkLabel: 'Seu link de indicação',
      copyAction: 'Copiar link',
      copiedFeedback: 'Link copiado.',
      copyError: 'Não foi possível copiar agora. Selecione e copie o link.',
      messageTitle: 'Mensagem pronta para compartilhar',
      messageDescription:
        'Você pode adaptar o texto antes de compartilhar com quem quiser.',
      messageLabel: 'Mensagem de indicação',
      messageTemplate:
        'Oi! Conheci o NutriLink, uma iniciativa do Lactare para orientar a doação de leite humano na Grande São Paulo. Se você amamenta e quer verificar se sua cidade é atendida, acesse: {link}',
      copyMessageAction: 'Copiar mensagem',
      messageCopiedFeedback: 'Mensagem copiada.',
      sendWhatsappAction: 'Abrir no WhatsApp',
    },
    account: {
      title: 'Meus dados',
      whatsappLabel: 'WhatsApp',
      consentLabel: 'Consentimento LGPD',
      consentValue: 'Dado em {date}',
      editAction: 'Editar dados',
      cancelAction: 'Cancelar',
      saveAction: 'Salvar dados',
      saving: 'Salvando...',
      savedFeedback: 'Seus dados foram atualizados.',
      deleteAction: 'Excluir conta',
      deleteConfirm:
        'Excluir sua conta? Você perde o acesso à Minha Área. Para voltar, será preciso falar com a equipe do Lactare.',
      deleting: 'Excluindo...',
      error: 'Não foi possível concluir agora. Tente novamente.',
      phoneNotice:
        'Para alterar seu WhatsApp, fale diretamente com a equipe do Lactare.',
      fields: {
        fullName: 'Nome completo',
        city: 'Cidade',
        state: 'UF',
      },
      contactAction: 'Falar com a equipe do Lactare',
    },
    personal: {
      validation: {
        recordedAtInvalid: 'Informe uma data e hora válidas.',
        volumeInvalid: 'Informe o volume em mililitros.',
        volumeInteger: 'Use um número inteiro de mililitros.',
        volumeMin: 'Informe pelo menos 1 ml.',
        volumeMax: 'Informe no máximo 5.000 ml por registro.',
        future: 'A data e hora não podem estar no futuro.',
        idInvalid: 'Registro inválido.',
      },
      extraction: {
        title: 'Registrar uma sessão de extração',
        description:
          'Registre data, hora e volume de uma sessão de extração ou ordenha para sua própria organização. Este registro não aciona nem confirma coleta.',
        dateLabel: 'Data e hora da sessão',
        volumeLabel: 'Volume (ml)',
        datePlaceholder: 'Selecione data e hora',
        volumePlaceholder: 'Ex.: 50',
        volumeUnit: 'ml',
        separator: '·',
        addAction: 'Registrar sessão',
        submitting: 'Salvando...',
        addedFeedback: 'Sessão registrada.',
        total: 'Total registrado',
        sessions: '{count} registros',
        empty: 'Você ainda não registrou uma sessão.',
        historyTitle: 'Sessões recentes',
        deleteAction: 'Excluir sessão de {date}',
        deleteConfirm: 'Excluir este registro pessoal?',
        deletedFeedback: 'Registro excluído.',
        thresholdSuggestion: {
          title: 'Você já registrou {volume} ml no total',
          description:
            'Isso não agenda nada — é só uma sugestão. Se quiser, avise a equipe do Lactare. Este aviso não envia solicitação nem confirma coleta.',
          contactAction: 'Avisar a equipe',
        },
        error: 'Não foi possível salvar o registro agora. Tente novamente.',
      },
      wellbeing: {
        title: 'Como você está se sentindo?',
        description:
          'Depois de uma doação, se quiser, registre uma opção simples para seu próprio acompanhamento. Isso não é uma avaliação de saúde.',
        optional: 'Opcional',
        choices: {
          GOOD: 'Bem',
          OK: 'Tudo bem',
          TIRED: 'Cansada',
        },
        saveAction: 'Salvar como registro pessoal',
        submitting: 'Salvando...',
        savedFeedback: 'Seu registro pessoal foi salvo.',
        latestTitle: 'Registros recentes',
        recordedAt: 'Registrado em {date}',
        timeSeparator: 'às',
        deleteAction: 'Excluir registro de {date}',
        deleteConfirm: 'Excluir este registro pessoal?',
        deletedFeedback: 'Registro excluído.',
        empty: 'Nenhum registro de bem-estar foi feito.',
        error: 'Não foi possível salvar agora. Tente novamente.',
      },
      highlights: {
        badges: {
          title: 'Meus selos',
          description: 'Última conquista: {title}.',
          empty:
            'Seus primeiros selos aparecem conforme a equipe registra suas etapas.',
          subtitle:
            'Um jeito de guardar cada passo da sua jornada com o Lactare.',
          expandAction: 'Ver selos',
          collapseAction: 'Ocultar selos',
          progressLabel: 'conquistados até agora',
          achievedOn: 'Conquistado em {date}',
          achieved: 'Conquistado',
          pending: 'Ainda não conquistado',
          donationProgress: '{done} de {target} doações',
          items: {
            FIRST_STEP: {
              title: 'Primeiro passo',
              description:
                'O início de tudo: seu cadastro abriu caminho para se tornar doadora.',
            },
            LIFE_GIFT: {
              title: 'Presente de vida',
              description:
                'Sua primeira doação registrada pelo Lactare: o leite segue para os hospitais parceiros que cuidam dos bebês.',
            },
            GENEROUS_HEART: {
              title: 'Coração generoso',
              description:
                'Para quem volta a doar — porque ajudar uma vez já é muito, mas duas vezes muda tudo.',
            },
            STEADY_SOURCE: {
              title: 'Fonte que não seca',
              description:
                'Para as doadoras mais constantes, que fazem da doação um hábito.',
            },
            CHAIN_OF_GOOD: {
              title: 'Corrente do bem',
              description:
                'Para quem espalha a causa: alguém se cadastrou através do seu convite.',
            },
          },
        },
        impactCard: {
          title: 'Cartão de impacto',
          description:
            'O cartão simbólico para compartilhar suas conquistas ainda está em construção.',
          action: 'Em breve',
        },
      },
      donations: {
        title: 'Histórico de doações',
        itemTitle: 'Coleta confirmada pela equipe',
        wellbeingTag: 'Bem-estar: {feeling}',
        empty: 'Ainda não há doação registrada pela Lactare.',
      },
      history: {
        title: 'Resumo da sua jornada',
        description:
          'Sessões, doações e tempo como doadora em um documento. Ótimo para levar na entrega do kit.',
        action: 'Exportar PDF',
        pdf: {
          brand: 'NutriLink',
          title: 'Resumo da jornada da nutriz',
          intro:
            'Documento gerado a partir dos dados registrados na Minha área. Não substitui orientação, avaliação clínica ou contato direto com a equipe do Lactare.',
          nameLabel: 'NOME DA NUTRIZ',
          badgeDonor: 'Doadora desde {date}',
          badgeRegistered: 'Jornada iniciada em {date}',
          extractionSectionTitle: 'SESSÕES DE EXTRAÇÃO REGISTRADAS',
          extractionSectionDescription:
            'Dados informados pela própria nutriz, para organização pessoal.',
          extractionColumnDate: 'Data',
          extractionColumnTime: 'Hora',
          extractionColumnVolume: 'Volume',
          extractionFootnote:
            'Este registro não aciona nem confirma coleta — é uma organização pessoal da nutriz.',
          extractionEmpty: 'Nenhum registro de extração.',
          donationSectionTitle: 'HISTÓRICO DE DOAÇÕES CONFIRMADAS',
          donationSectionDescription:
            'Cada item corresponde a uma doação registrada pela equipe do Lactare.',
          donationColumnDate: 'Data da doação',
          donationColumnRegisteredBy: 'Registrado por',
          donationRegisteredByValue: 'Equipe do Lactare',
          donationEmpty: 'Ainda não há doação registrada pela Lactare.',
          summaryTotalLabel: 'TOTAL DE DOAÇÕES',
          summaryTotalOne: '1 doação confirmada',
          summaryTotalMany: '{count} doações confirmadas',
          summaryDurationLabel: 'TEMPO COMO DOADORA',
          donorMonths: '{count} meses',
          donorMonth: '1 mês',
          donorDays: '{count} dias',
          donorDay: '1 dia',
          wellbeingSectionTitle: 'REGISTROS DE BEM-ESTAR',
          wellbeingSectionDescription:
            'Sensação registrada pela própria nutriz após uma doação — não é um dado clínico.',
          wellbeingColumnDate: 'Data',
          wellbeingColumnFeeling: 'Como se sentiu',
          aboutTitle: 'Sobre este documento',
          aboutText:
            'As informações acima refletem apenas o que foi registrado no NutriLink: sessões de extração e sensações informadas pela própria nutriz, e doações confirmadas pela equipe do Lactare. Este documento não representa triagem concluída, avaliação clínica, nem confirmação de coleta. Dados de saúde (ficha, exames) são de responsabilidade exclusiva do Lactare e não aparecem aqui.',
          footer:
            'Documento gerado em {date} · NutriLink — solução digital do Lactare',
        },
      },
      education: {
        openAction: 'Abrir conteúdo educativo',
        suggestions: {
          DONATION_PATH: {
            title: 'Entenda o caminho da doação',
            description:
              'Veja como a jornada funciona e quais etapas são acompanhadas diretamente pelo Lactare.',
            href: '/como-funciona#caminho-da-doacao',
          },
          FAQ: {
            title: 'Consulte dúvidas frequentes',
            description:
              'Encontre orientações gerais e os canais para falar diretamente com a equipe do Lactare quando precisar.',
            href: '/como-funciona#duvidas-frequentes',
          },
          PRACTICAL_GUIDES: {
            title: 'Veja os guias práticos',
            description:
              'Acesse materiais educativos sobre extração, armazenamento e amamentação na prática.',
            href: '/como-funciona#amamentacao-na-pratica',
          },
        },
        title: 'Conteúdos para esta etapa',
        description:
          'Informações educativas relacionadas ao estágio registrado pelo Lactare.',
        readMore: 'Conteúdo sugerido',
      },
    },
    journey: {
      progress: {
        eyebrow: 'Minha jornada',
        steps: {
          REGISTRATION: 'Cadastro',
          HEALTH_FORM: 'Ficha de saúde',
          BLOOD_TEST: 'Exame de sangue',
          KIT_DELIVERY: 'Entrega do kit',
          DONATION: 'Doação',
        },
        expandAction: 'Ver detalhes',
        collapseAction: 'Ocultar detalhes',
        currentBadge: 'Você está aqui',
        sourceNotice:
          'As etapas são atualizadas pela equipe do Lactare. Esta visualização não substitui orientações recebidas diretamente pela equipe.',
      },
      guidance: {
        title: 'Orientações desta etapa',
        description:
          'Estas orientações mudam conforme o status registrado pelo Lactare.',
        safetyNotice:
          'Em caso de dúvida sobre ficha, exame ou aptidão, converse diretamente com a equipe do Lactare. O NutriLink não realiza atendimento clínico.',
      },
      status: {
        REGISTERED: {
          label: 'Cadastrada',
          title: 'Seu cadastro foi registrado',
          description:
            'Seus dados de cadastro estão no NutriLink. Isso não representa triagem concluída nem confirmação de coleta.',
          guidance: [
            'Confira se o seu município continua na área de atuação atual do Lactare.',
            'As próximas etapas aparecem aqui somente depois de serem registradas pela equipe do Lactare.',
          ],
        },
        DOCUMENT_SENT: {
          label: 'Documento enviado',
          title: 'O envio do documento foi registrado',
          description:
            'A equipe do Lactare registrou que o documento foi enviado pela nutriz fora do NutriLink. O conteúdo do documento não é armazenado aqui.',
          guidance: [
            'Continue seguindo as orientações fornecidas diretamente pela equipe do Lactare.',
            'Não envie documentos ou informações de saúde pelo NutriLink.',
          ],
        },
        FORM_RECEIVED: {
          label: 'Ficha recebida',
          title: 'O recebimento da ficha foi registrado',
          description:
            'A equipe do Lactare registrou esta etapa. O NutriLink não guarda as respostas nem informações de saúde da ficha.',
          guidance: [
            'Continue seguindo as orientações fornecidas diretamente pela equipe do Lactare.',
            'Esta área mostra apenas o avanço da etapa e não o conteúdo da ficha.',
          ],
        },
        EXAM_SCHEDULED: {
          label: 'Exame agendado',
          title: 'A etapa do exame foi combinada',
          description:
            'O Lactare registrou que o exame foi agendado fora do NutriLink. A data e as instruções devem ser confirmadas diretamente com a equipe.',
          guidance: [
            'Confirme data e orientações pelo mesmo canal utilizado no atendimento com o Lactare.',
            'O NutriLink não agenda exames nem altera a combinação feita com a equipe.',
          ],
        },
        EXAMS_COMPLETED: {
          label: 'Exames feitos',
          title: 'A realização dos exames foi registrada',
          description:
            'O Lactare registrou somente que os exames foram realizados. O NutriLink não recebe, consulta ou interpreta resultados.',
          guidance: [
            'Aguarde a próxima orientação fornecida diretamente pela equipe do Lactare.',
            'Não envie laudos, valores ou resultados de exame pelo NutriLink.',
          ],
        },
        AWAITING_RESULT: {
          label: 'Aguardando resultado',
          title: 'A avaliação está com o Lactare',
          description:
            'O Lactare registrou que aguarda a avaliação profissional. O NutriLink não consulta, recebe ou interpreta o laudo.',
          guidance: [
            'Aguarde a orientação fornecida diretamente pela equipe responsável do Lactare.',
            'Não envie laudos, valores ou resultados de exame pelo NutriLink.',
          ],
        },
        ELIGIBLE: {
          label: 'Apta',
          title: 'A categoria “apta” foi registrada',
          description:
            'O Lactare registrou esta categoria depois da avaliação profissional. O NutriLink não tomou nem calculou essa decisão.',
          guidance: [
            'A próxima etapa operacional é combinar diretamente com o Lactare a entrega do kit.',
            'O NutriLink não confirma data, horário ou disponibilidade da visita.',
          ],
        },
        NOT_ELIGIBLE: {
          label: 'Não apta',
          title: 'A categoria “não apta” foi registrada',
          description:
            'O Lactare registrou esta categoria. O NutriLink não guarda nem apresenta o motivo clínico da decisão.',
          guidance: [
            'Para compreender a decisão, converse diretamente com a equipe responsável do Lactare pelo canal usado no atendimento.',
            'Não envie laudos ou informações de saúde pelo NutriLink.',
          ],
        },
        KIT_SENT: {
          label: 'Kit enviado',
          title: 'O envio do kit foi registrado',
          description:
            'O Lactare registrou o envio do kit. Esta etapa não confirma a entrega, uma coleta futura nem uma doação realizada.',
          guidance: [
            'A entrega e qualquer orientação logística continuam sob responsabilidade da equipe do Lactare.',
            'O NutriLink não confirma data, horário ou disponibilidade de visita.',
          ],
        },
        KIT_DELIVERED: {
          label: 'Kit entregue',
          title: 'A entrega do kit foi registrada',
          description:
            'O Lactare registrou que o kit foi entregue. Esta etapa não confirma uma coleta futura nem uma doação realizada.',
          guidance: [
            'Siga as orientações de higiene, coleta e armazenamento recebidas da equipe do Lactare.',
            'As coletas seguintes dependem da operação e da combinação direta com o Lactare.',
          ],
        },
        DONATION_CONFIRMED: {
          label: 'Doação confirmada',
          title: 'A confirmação da doação foi registrada',
          description:
            'Um administrador do Lactare registrou a doação como confirmada. O NutriLink não calcula impacto clínico nem confirma coletas futuras.',
          guidance: [
            'Continue seguindo as orientações fornecidas diretamente pela equipe do Lactare.',
            'Cada nova etapa logística deve ser combinada com a equipe; o NutriLink não realiza agendamentos.',
          ],
        },
        RECURRING_DONATION_ELIGIBLE: {
          label: 'Apta a doações recorrentes',
          title: 'A aptidão para recorrência foi registrada',
          description:
            'O Lactare registrou que a jornada pode seguir para doações recorrentes. Isso não confirma uma doação nem agenda uma coleta.',
          guidance: [
            'Continue seguindo as orientações operacionais fornecidas diretamente pelo Lactare.',
            'Cada data ou horário continua sendo combinado com a equipe; o NutriLink não realiza agendamentos.',
          ],
        },
      },
    },
  },
  header: {
    login: 'Entrar',
    account: 'Minha área',
    logout: 'Sair',
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
 * Falas do chatbot do WhatsApp (RF11).
 *
 * Os títulos respeitam os limites da Meta: 20 caracteres em botões e 24 em
 * itens de lista. O bot informa e encaminha; não realiza triagem, não confirma
 * atendimento ou coleta e não comunica impacto clínico individual.
 */
export const WHATSAPP_BOT = {
  menu: {
    welcome:
      'Oi! Aqui é o Lactare, banco de leite humano da Eurofarma 💛 Ajudamos mães que amamentam a doar o leite excedente pra bebês prematuros internados em UTI neonatal. Como posso te ajudar hoje?',
    registeredWelcome:
      'Oi, {name}! 💙\n\nSeu status atual no NutriLink é: {status}. Essa categoria foi registrada pela equipe do Lactare; o bot não realiza avaliação clínica.\n\n{guidance}\n\nComo posso ajudar agora?',
    knowMore: 'Quero saber mais',
    donate: 'Quero doar meu leite',
    human: 'Falar com alguém da equipe',
    reminders: 'Gerir lembretes',
    button: 'Ver opções',
  },
  faq: {
    body: 'Sobre o que você quer saber?',
    button: 'Ver dúvidas',
    questions: {
      STEPS: 'Quais são todas as etapas até o processo de doação?',
      WHO_CAN_DONATE: 'Quem pode doar?',
      PAIN: 'Doar dói ou atrapalha a amamentação do meu bebê?',
      FREQUENCY: 'Posso doar mais de uma vez?',
    },
    steps: {
      body: 'As etapas para doação do leite são: Ficha de saúde e exame de sangue, Entrega do kit em casa, Extração e armazenamento em casa, e Coleta domiciliar do leite.\n\nQuer saber mais sobre alguma etapa específica?',
      chooseAnotherBody: 'Qual outra etapa você deseja ver agora?',
      button: 'Ver etapas',
      items: {
        HEALTH_FORM: 'Ficha de saúde e exame de sangue',
        KIT: 'Entrega do kit em casa',
        EXTRACTION: 'Extração e armazenamento em casa',
        COLLECTION: 'Coleta domiciliar do leite',
      },
      back: 'Voltar ao menu de dúvidas',
      details: {
        HEALTH_FORM:
          'A ficha de saúde serve pra entender seu histórico, se você toma algum medicamento, tem alguma condição de saúde, coisas assim. Já o exame de sangue existe pra confirmar que está tudo bem antes de qualquer coleta, protegendo tanto você quanto o bebê que vai receber o leite depois.\nO exame é coletado direto na sua casa, pelo nosso laboratório parceiro, o Fleury — assim você não precisa se deslocar pra lugar nenhum.',
        KIT: 'O kit serve pra garantir que a extração do seu leite aconteça de um jeito seguro e higiênico — ele traz os potinhos esterilizados que você vai usar daqui pra frente.\nA entrega é feita por profissionais da nossa equipe, que aproveitam esse momento pra te explicar com calma toda a higiene, a extração e o armazenamento. É a única visita em que sua presença é necessária, justamente porque é quando você aprende o passo a passo.',
        EXTRACTION:
          'A extração é feita por você, no seu próprio ritmo, seguindo as orientações recebidas: mãos lavadas, mamas higienizadas, frasco esterilizado por perto. O leite fica guardado no freezer até a nossa equipe buscar.',
        COLLECTION:
          'A coleta domiciliar é gratuita e feita pela nossa equipe — um motorista e uma profissional de enfermagem vão até a sua casa buscar o leite já congelado. Você não precisa estar presente nesse momento, e não tem nenhum custo.',
      },
      closing: {
        body: 'Posso ajudar com mais alguma coisa?',
        seeAnother: 'Ver outra etapa',
        seeSite: 'Ver o passo a passo completo no site',
        siteBody:
          'Aqui está o link de acesso ao nosso site: {howItWorksUrl}. Lá você pode ver essas e outras informações com mais detalhes, imagens e vídeos.',
      },
    },
    whoCanDonate: {
      answer:
        'Pode doar qualquer mulher que está amamentando, é saudável, e não usa determinados medicamentos, álcool ou fumo no período. Isso existe pra garantir que o leite chegue seguro pros bebês prematuros, que têm o sistema imunológico bem mais frágil.\nA confirmação de verdade acontece com a ficha de saúde e o exame de sangue — então, mesmo que você não tenha certeza se se qualifica, vale a pena começar o processo e deixar essa avaliação com quem entende. 💙',
      closingBody: 'Posso ajudar com mais alguma coisa?',
      seeAnother: 'Ver outra dúvida',
      ownHealthDoubt: 'Tenho uma dúvida sobre minha própria saúde',
    },
    pain: {
      answer:
        'Não. Você só doa o excedente — o que sobra depois de alimentar seu bebê normalmente. A ideia nunca é tirar leite que seria dele; é aproveitar o que seu corpo produz a mais.\nSobre dor: a extração, quando feita do jeito certo, não deveria doer. Na entrega do kit, nossa equipe te ensina a técnica com calma, exatamente pra evitar desconforto.',
      closingBody: 'Posso ajudar com mais alguma coisa?',
      seeAnother: 'Ver outra dúvida',
      extractionTips: 'Ver mais dicas de extração no site',
      tipsBody:
        'Você encontra mais dicas de extração no site do NutriLink: {howItWorksUrl}',
    },
    frequency: {
      answer:
        'Sim! E essa é uma das partes mais tranquilas do processo: diferente da doação de sangue, não existe um intervalo obrigatório de espera. Depois que você é uma doadora ativa, nossa equipe já vai buscar o leite direto na sua casa nas próximas vezes, sem precisar repetir ficha, exame ou entrega de kit.',
      closingBody: 'Posso ajudar com mais alguma coisa?',
      seeAnother: 'Ver outra dúvida',
    },
    donate: 'Quero doar meu leite',
  },
  coverage: {
    ask: 'Ótimo! Pra eu te indicar certinho como funciona na sua região, me manda seu CEP, ou clica no clipe 📎 e compartilha sua localização.',
    invalid:
      'Não consegui identificar esse CEP ou município. Envie um CEP no formato 00000-000 ou escreva o nome completo da cidade.',
    unavailable:
      'Não foi possível consultar a cobertura agora. Tente novamente em alguns instantes ou fale diretamente com o Lactare.',
    eligible:
      'Você está dentro da nossa área de atendimento! 🎉 Vamos começar seu cadastro, é rápido.',
    eligibleRegistered:
      '{city} está na área configurada do Lactare segundo o Mapa do Leite. Isso não confirma atendimento ou coleta. Para combinar os próximos passos, fale diretamente com o Lactare: WhatsApp {whatsapp} ou telefone {phone}.',
    outside:
      'No momento, o Lactare atende só a região da Grande São Paulo, então infelizmente não consigo te encaminhar por aqui. Mas se você conhece alguém que amamenta e mora na Grande SP, essa indicação vale muito 💛\n\nVocê pode compartilhar: “O NutriLink verifica a área atendida pelo Lactare e orienta o contato para doação de leite humano: {coverageUrl}”.\n\nE se quiser doar de outro jeito, aqui está o localizador da Rede Brasileira de Bancos de Leite: {directoryUrl}',
  },
  registration: {
    askName: 'Qual é o seu nome completo?',
    invalidName:
      'Não consegui identificar o nome completo. Digite apenas seu nome, com no mínimo 3 e no máximo 120 caracteres.',
    askCpf: 'Qual o seu CPF?',
    invalidCpf:
      'Não consegui validar esse CPF. Confira os números, sem pontos nem traço se preferir, e envie novamente.',
    askEmail: 'Qual o seu e-mail?',
    invalidEmail: 'Não consegui identificar um e-mail válido. Envie novamente.',
    askAddress:
      'Qual o seu endereço completo (rua, número, complemento, bairro)?',
    invalidAddress:
      'Não consegui registrar esse endereço. Envie o endereço completo (rua, número, complemento, bairro), com pelo menos alguns caracteres.',
    consent:
      'Prontinho, {name}! Só preciso do seu ok: usamos seus dados só pra te acompanhar na jornada de doação e falar com você por aqui. Você pode ler o termo completo em {privacyUrl}. Tudo bem?',
    accept: 'Sim, concordo',
    decline: 'Prefiro não',
    success:
      'Cadastro recebido, {name}! 💛 Nossa equipe vai analisar suas informações e entrar em contato pra dar sequência à sua ficha de saúde e ao exame de sangue.\n\nEnquanto isso, você pode:',
    declined:
      'Sem problema! Você pode voltar e se cadastrar quando quiser — é só mandar “oi” de novo por aqui.',
    unavailable:
      'Não foi possível salvar o cadastro agora. Envie seu nome completo novamente para tentar de novo, ou escreva “menu” para sair.',
    postMenu: {
      accessArea: 'Acessar minha área pessoal',
      talkToTeam: 'Falar com alguém da equipe agora',
      seeFaq: 'Ver dúvidas frequentes',
      areaBody:
        'Sua área pessoal já está pronta! Lá você acompanha cada etapa da sua jornada em tempo real, e vê conteúdos preparados especialmente pro momento em que você está.\n\n{areaUrl}',
    },
  },
  reminders: {
    enabled:
      'Seus lembretes de continuidade estão ativados. Eles são independentes dos avisos de status e não representam agendamento ou confirmação de coleta.',
    disabled:
      'Seus lembretes de continuidade estão desativados. Você pode ativá-los quando quiser. Eles não representam agendamento ou confirmação de coleta.',
    registrationRequired:
      'Para ativar lembretes, primeiro é necessário concluir o cadastro opcional. Você ainda pode consultar cobertura e conteúdos sem se cadastrar.',
    enable: 'Ativar lembretes',
    disable: 'Parar lembretes',
    back: 'Voltar ao menu',
    askReferenceDate:
      'Qual data você quer usar como referência para esse lembrete? Responda no formato DD/MM/AAAA. Essa data é apenas uma referência e não cria nem confirma agendamento.',
    invalidReferenceDate:
      'Não reconheci essa data. Informe uma data válida no formato DD/MM/AAAA, sem escolher um dia futuro. Essa data não cria nem confirma agendamento.',
    enabledSuccess:
      'Lembretes ativados. Sua escolha foi registrada. O NutriLink não agenda nem confirma coleta, exame, visita ou atendimento.',
    disabledSuccess:
      'Lembretes desativados. O cancelamento foi registrado e nenhum novo lembrete deverá ser enviado enquanto essa escolha estiver vigente.',
    alreadyEnabled:
      'Seus lembretes já estavam ativados. Nenhuma nova alteração foi necessária.',
    alreadyDisabled:
      'Seus lembretes já estavam desativados. Nenhuma nova alteração foi necessária.',
    unavailable:
      'Não foi possível salvar sua escolha de lembretes agora. Tente novamente em instantes ou volte ao menu.',
    jobBody:
      'Este é um lembrete opcional de continuidade da sua jornada com o Lactare. Se a entrega do kit já foi registrada pelo Lactare, siga as orientações recebidas. Se precisar de ajuda, fale diretamente com o Lactare.\n\nConsulte sua área no NutriLink: {areaUrl}\n\nEste lembrete não agenda nem confirma coleta, visita ou atendimento.',
  },
  human: {
    handoffOpen:
      'Entendi que sua dúvida merece uma resposta mais cuidadosa — já avisei nossa equipe. Um atendente assumirá este mesmo chat de segunda a sábado, das 9h às 18h, no horário de Brasília, e vai te responder por aqui assim que possível. Enquanto isso, o bot ficará pausado.\n\nEsta conversa não cria nem confirma agendamento; data e horário são combinados diretamente com o Lactare.',
    handoffOutsideHours:
      'Entendi que sua dúvida merece uma resposta mais cuidadosa — já avisei nossa equipe. O atendimento humano acontece neste mesmo chat de segunda a sábado, das 9h às 18h, no horário de Brasília. Como estamos fora dessa janela, sua solicitação ficará aguardando a próxima janela de atendimento, e o bot ficará pausado.\n\nEsta conversa não cria nem confirma agendamento; data e horário são combinados diretamente com o Lactare.',
  },
  fallback: {
    first:
      'Não consegui entender. Toque em uma das opções para eu seguir com você.',
  },
  statusNotification: {
    body: 'O Lactare atualizou uma etapa da sua jornada para: {status}.\n\nConsulte sua área no NutriLink: {areaUrl}\n\nEste aviso não representa agendamento, confirmação de coleta ou avaliação feita pelo NutriLink.',
  },
  journeyStatus: {
    REGISTERED: 'Cadastrada',
    DOCUMENT_SENT: 'Documento enviado',
    FORM_RECEIVED: 'Ficha recebida',
    EXAM_SCHEDULED: 'Exame agendado',
    EXAMS_COMPLETED: 'Exames feitos',
    AWAITING_RESULT: 'Aguardando resultado',
    ELIGIBLE: 'Apta',
    NOT_ELIGIBLE: 'Não apta',
    KIT_SENT: 'Kit enviado',
    KIT_DELIVERED: 'Kit entregue',
    DONATION_CONFIRMED: 'Doação confirmada',
    RECURRING_DONATION_ELIGIBLE: 'Apta a doações recorrentes',
  },
  journeyGuidance: {
    REGISTERED:
      'As próximas etapas aparecem somente depois de serem registradas pelo Lactare.',
    DOCUMENT_SENT:
      'O conteúdo do documento permanece fora do NutriLink; siga as orientações recebidas do Lactare.',
    FORM_RECEIVED:
      'Continue seguindo as orientações recebidas diretamente da equipe do Lactare.',
    EXAM_SCHEDULED:
      'Confirme data e instruções do exame diretamente com a equipe do Lactare.',
    EXAMS_COMPLETED:
      'Aguarde a orientação da equipe e não envie laudos ou resultados pelo bot.',
    AWAITING_RESULT:
      'Aguarde a orientação da equipe e não envie laudos ou resultados pelo bot.',
    ELIGIBLE:
      'Combine a entrega do kit diretamente com o Lactare; o bot não confirma data ou disponibilidade.',
    NOT_ELIGIBLE:
      'Se tiver dúvida sobre essa categoria, converse diretamente com a equipe do Lactare.',
    KIT_SENT:
      'A entrega e a logística são tratadas diretamente com a equipe do Lactare.',
    KIT_DELIVERED:
      'Siga as orientações de higiene, coleta e armazenamento fornecidas pelo Lactare.',
    DONATION_CONFIRMED:
      'A confirmação foi registrada pelo Lactare; novas etapas continuam sendo combinadas diretamente com a equipe.',
    RECURRING_DONATION_ELIGIBLE:
      'A continuidade e a logística são combinadas diretamente com a equipe do Lactare.',
  },
} as const

export const ADMIN_LOGIN = {
  seo: {
    title: 'Entrar no painel admin',
    description:
      'Acesse o painel administrativo do NutriLink para gerenciar municípios, conteúdos e indicadores.',
  },
  brand: {
    name: 'NutriLink Admin',
    eyebrow: 'Área administrativa',
  },
  hero: {
    title: 'Entrar no painel',
    description:
      'Acesse com seu email e senha para gerenciar municípios, conteúdos e indicadores do NutriLink.',
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
      municipalities: 'Municípios',
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
      'Acompanhe a área de atuação do Lactare e os cadastros de nutrizes.',

    filters: {
      title: 'Segmentação de nutrizes',
      description:
        'Combine sub-região, status atual da jornada e origem. O recorte é aplicado aos indicadores, gráficos e funil de nutrizes; cobertura, alcance geral e cliques anônimos permanecem globais.',
      label: 'Filtros combináveis do dashboard',
      region: {
        label: 'Sub-região da Grande SP',
        all: 'Todas as sub-regiões',
      },
      stage: {
        label: 'Status atual da jornada',
        all: 'Todos os status',
        options: {
          REGISTERED: 'Cadastrada',
          DOCUMENT_SENT: 'Documento enviado',
          FORM_RECEIVED: 'Ficha recebida',
          EXAM_SCHEDULED: 'Exame agendado',
          EXAMS_COMPLETED: 'Exames feitos',
          AWAITING_RESULT: 'Aguardando resultado',
          ELIGIBLE: 'Apta',
          NOT_ELIGIBLE: 'Não apta',
          KIT_SENT: 'Kit enviado',
          KIT_DELIVERED: 'Kit entregue',
          DONATION_CONFIRMED: 'Doação confirmada',
          RECURRING_DONATION_ELIGIBLE: 'Apta a doações recorrentes',
        },
      },
      origin: {
        label: 'Origem do cadastro',
        all: 'Todas as origens',
      },
      actions: {
        apply: 'Aplicar filtros',
        clear: 'Limpar',
      },
      limitations:
        'Adesão a lembretes, indicação e velocidade até a primeira doação ainda não aparecem como filtros: essas dimensões exigem eventos próprios e não são inferidas de dados incompletos.',
    },

    /** Rótulo de janela temporal. `{days}` é substituído em tempo de render. */
    period: 'Últimos {days} dias',

    metrics: {
      /** Heading visível do bloco de indicadores prioritários. */
      title: 'Indicadores principais',
      operationalTitle: 'Cobertura e engajamento',
      readingNotes: 'Como interpretar estes dados',
      activeMunicipalities: {
        label: 'Municípios ativos',
        description: 'Aparecem na verificação pública',
        empty: 'Nenhum município publicado até agora',
      },
      regionsCovered: {
        label: 'Sub-regiões cobertas',
        description: 'Regiões com ao menos um município ativo',
        empty: 'Nenhuma sub-região coberta até agora',
      },
      reach: {
        label: 'Sinais de alcance',
        description:
          '{registrations} cadastros + {clicks} cliques nos últimos {days} dias; são ações, não pessoas únicas',
        empty: 'Nenhum cadastro ou clique nos últimos {days} dias',
      },
      contactClicks: {
        label: 'Cliques de contato',
        description:
          '{count} nos últimos {days} dias · agregado anônimo global',
        empty: 'Nenhum clique nos canais oficiais foi registrado',
      },
      nutriz: {
        label: 'Nutrizes cadastradas',
        /** `{count}` = cadastros no período, `{days}` = tamanho da janela. */
        description: '{count} nos últimos {days} dias',
        filteredDescription:
          'No recorte selecionado · {count} nos últimos {days} dias',
        empty: 'Nenhuma nutriz se cadastrou até agora',
        filteredEmpty: 'Nenhuma nutriz corresponde ao recorte selecionado',
      },
      newNutriz: {
        label: 'Novos cadastros',
        description: 'Nos últimos {days} dias',
        filteredDescription: 'No recorte · últimos {days} dias',
        empty: 'Nenhum cadastro novo no período',
        filteredEmpty: 'Nenhum cadastro novo no recorte e período',
      },
      journeyConversion: {
        label: 'Conversão da jornada',
        description:
          'Do cadastro à aptidão para doações recorrentes no recorte; não confirma doação',
        empty: 'Sem cadastros no recorte para calcular a conversão',
      },

      retention: {
        label: 'Retorno observável',
        description:
          '{retained} de {cohort} cadastros com 30+ dias tiveram algum avanço ou decisão de lembrete registrada',
        empty: 'Ainda não há cadastros com 30 dias para esta leitura',
        note: 'Leitura conservadora de retorno: considera histórico da jornada ou mudança de consentimento posterior ao cadastro; não prova retenção definitiva nem abandono.',
      },
      reminders: {
        label: 'Adesão a lembretes',
        description: '{enabled} de {eligible} cadastros com opt-in vigente',
        empty: 'Nenhum cadastro disponível para calcular a adesão',
        activity:
          '{activated} ativações e {withdrawn} retiradas nos últimos {days} dias',
        note: 'O indicador mede consentimento vigente, não mensagens entregues. A entrega real pelo WhatsApp depende da integração com a Meta.',
      },
      referrals: {
        label: 'Cadastros por indicação',
        description: '{count} nos últimos {days} dias',
        empty: 'Nenhum cadastro por indicação foi registrado',
        note: 'A indicação mede apenas a origem do novo cadastro por link próprio; não cria recompensa material nem confirma doação.',
      },
    },

    detailsTitle: 'Detalhamento dos indicadores',

    journeyFunnel: {
      title: 'Funil da jornada',
      description:
        'Quantidade que alcançou cada etapa do fluxo progressivo registrado pelo Lactare.',
      empty: 'Nenhuma jornada corresponde ao recorte selecionado.',
      start: 'Início do funil',
      conversionFromPrevious: '{percent}% da etapa anterior',
      conversionFromStart: '{percent}% do início',
      progressiveNote:
        'O funil usa o status atual e as transições progressivas do RF16. “Apta a doações recorrentes” é uma categoria registrada pelo Lactare e não confirma uma doação.',
      dropOff: {
        title: 'Abandono entre etapas',
        description:
          'Cadastros sem avanço registrado entre duas etapas consecutivas.',
        empty: 'Nenhuma jornada disponível para analisar avanço.',
        transition: '{from} → {to}',
        rate: '{percent}% da etapa anterior',
        notEligibleLabel: 'Saída registrada como não apta',
        notEligibleDescription:
          'Decisão categórica do Lactare, separada de abandono.',
        note: 'Sem um evento de desistência ou prazo operacional validado, “sem avanço” indica o ponto atual da jornada e não prova abandono definitivo.',
      },
    },

    contactClicksByChannel: {
      title: 'Cliques por canal',
      description:
        'Eventos anônimos desde o início do registro. Como não guardam nutriz nem localização, não respondem aos filtros de região ou status.',
      empty: 'Nenhum clique em canal oficial foi registrado.',
      labels: {
        WHATSAPP: 'WhatsApp do Lactare',
        PHONE: 'Telefone do Lactare',
      },
    },

    municipalitiesByStatus: {
      title: 'Municípios por situação',
      description: '{total} municípios cadastrados no total',
      empty: 'Ainda não há municípios cadastrados.',
      labels: {
        ACTIVE: 'Ativos',
        INACTIVE: 'Inativos',
      },
    },

    municipalitiesByRegion: {
      title: 'Cobertura por sub-região',
      description: 'Municípios ativos em cada sub-região da Grande São Paulo',
      empty:
        'Nenhum município ativo ainda — por isso não há cobertura para mostrar.',
    },

    nutrizByRegion: {
      title: 'Nutrizes por sub-região',
      description:
        'A cidade cadastrada é relacionada à sub-região configurada, sem exibir dados pessoais.',
      empty: 'Nenhuma nutriz corresponde ao recorte selecionado.',
      outsideOrUnmapped: 'Fora da Grande SP ou sem correspondência',
    },

    nutrizByStage: {
      title: 'Nutrizes por status atual',
      description:
        'Categoria operacional atual registrada pelo Lactare; não representa triagem automática nem confirmação de doação.',
      empty: 'Nenhuma nutriz corresponde ao recorte selecionado.',
    },
  },
  campaigns: {
    seo: {
      title: 'Campanhas | NutriLink Admin',
      description: 'Crie e organize links rastreáveis do NutriLink.',
    },
    title: 'Campanhas',
    description:
      'Organize links de divulgação com UTMs consistentes e destinos públicos do NutriLink.',
    attributionNotice:
      'Esta área gera links rastreáveis, mas não contabiliza cliques. A origem aparece nos indicadores somente quando um cadastro preserva as UTMs do link.',
    createAction: 'Nova campanha',
    filters: {
      label: 'Filtros da lista de campanhas',
      search: {
        label: 'Buscar campanha',
        placeholder: 'Nome, origem ou identificador',
      },
      status: {
        label: 'Situação',
        all: 'Todas',
        active: 'Ativas',
        inactive: 'Inativas',
      },
      source: { label: 'Origem', all: 'Todas as origens' },
      actions: { apply: 'Filtrar', clear: 'Limpar filtros' },
    },
    results: {
      countOne: 'campanha encontrada',
      countOther: 'campanhas encontradas',
    },
    table: {
      caption: 'Campanhas e links rastreáveis do NutriLink',
      columns: {
        campaign: 'Campanha',
        sourceMedium: 'Origem / mídia',
        link: 'Link rastreável',
        status: 'Situação',
        createdAt: 'Criada em',
        actions: 'Ações',
      },
      active: 'Ativa',
      inactive: 'Inativa',
      edit: 'Editar',
      editAria: 'Editar {name}',
      identifierLabel: 'utm_campaign: {value}',
    },
    empty: {
      database: {
        title: 'Nenhuma campanha cadastrada',
        description:
          'Crie a primeira campanha para padronizar os links de divulgação.',
      },
      filtered: {
        title: 'Nenhuma campanha encontrada',
        description: 'Ajuste ou limpe os filtros para tentar novamente.',
      },
    },
    pagination: {
      label: 'Paginação das campanhas',
      previous: 'Anterior',
      next: 'Próxima',
      status: 'Página {page} de {total}',
    },
    link: {
      copy: 'Copiar',
      copied: 'Copiado',
      copyError: 'Não foi possível copiar',
      open: 'Abrir',
      copyAria: 'Copiar link da campanha {name}',
      openAria: 'Abrir destino da campanha {name}',
    },
    form: {
      create: {
        seo: {
          title: 'Nova campanha | NutriLink Admin',
          description: 'Crie um link rastreável para divulgação do NutriLink.',
        },
        title: 'Nova campanha',
        description:
          'Defina o destino público e os parâmetros que identificarão a origem dos futuros cadastros.',
        submit: 'Criar campanha',
      },
      edit: {
        seo: {
          title: 'Editar campanha | NutriLink Admin',
          description: 'Atualize os dados de uma campanha do NutriLink.',
        },
        title: 'Editar campanha',
        description:
          'A alteração muda o link gerado daqui em diante. Links já distribuídos não são atualizados.',
        submit: 'Salvar alterações',
      },
      fields: {
        name: {
          label: 'Nome interno',
          placeholder: 'Ex.: Feira da Saúde — setembro',
          helper: 'Visível somente no painel administrativo.',
        },
        utmSource: {
          label: 'Origem (utm_source)',
          placeholder: 'Ex.: instagram',
          helper: 'Canal ou plataforma de origem.',
        },
        utmMedium: {
          label: 'Mídia (utm_medium)',
          placeholder: 'Ex.: social',
          helper: 'Tipo de divulgação utilizado.',
        },
        utmCampaign: {
          label: 'Identificador (utm_campaign)',
          placeholder: 'Ex.: feira_saude_setembro',
          helper: 'Identificador estável para a leitura de atribuição.',
        },
        landingUrl: {
          label: 'Destino no NutriLink',
          placeholder: 'Ex.: /cadastro',
          helper:
            'Use somente uma rota pública interna. Parâmetros existentes serão preservados.',
        },
        status: { label: 'Situação', placeholder: 'Selecione' },
        trackingPreview: {
          label: 'Prévia do link rastreável',
          helper:
            'Confira o destino antes de distribuir. Nenhum dado pessoal é incluído na URL.',
        },
      },
      status: {
        active: 'Ativa — pronta para divulgação',
        inactive: 'Inativa — mantida apenas no histórico',
      },
      actions: { back: 'Voltar para campanhas', cancel: 'Cancelar' },
      validation: {
        nameRequired: 'Informe um nome com pelo menos 3 caracteres.',
        nameMax: 'O nome deve ter no máximo 120 caracteres.',
        utmSourceRequired: 'Informe a origem da campanha.',
        utmMediumRequired: 'Informe a mídia da campanha.',
        utmCampaignRequired: 'Informe o identificador da campanha.',
        utmMax: 'Cada parâmetro UTM deve ter no máximo 200 caracteres.',
        utmFormat:
          'Use letras minúsculas, números, ponto, hífen, sublinhado ou til, sem espaços.',
        landingUrlRequired: 'Informe o destino da campanha.',
        landingUrlMax: 'O destino deve ter no máximo 500 caracteres.',
        landingUrlInternal:
          'Use uma rota pública interna iniciada por /, fora das áreas admin, api e auth.',
        statusRequired: 'Selecione uma situação válida.',
      },
      mutations: {
        submittingCreate: 'Criando campanha...',
        submittingUpdate: 'Salvando alterações...',
        createError:
          'Não foi possível criar a campanha agora. Tente novamente.',
        updateError:
          'Não foi possível salvar a campanha agora. Tente novamente.',
        validationGeneric: 'Revise os campos destacados.',
        conflict:
          'Já existe uma campanha com esta combinação de origem, mídia e identificador.',
        notFound: 'Esta campanha não existe mais.',
        errorTitle: 'Não foi possível salvar',
      },
    },
  },
  contents: {
    seo: {
      title: 'Conteúdos | NutriLink Admin',
      description: 'Organize o acervo educativo do NutriLink.',
    },
    title: 'Conteúdos educativos',
    description:
      'Crie e revise materiais educativos em Markdown, mantendo rascunhos separados dos itens publicados no acervo.',
    integrationNotice:
      'A página pública Como funciona continua versionada em código. Publicar um item aqui organiza o acervo administrativo, mas ainda não altera automaticamente aquela página.',
    createAction: 'Novo conteúdo',
    filters: {
      label: 'Filtros da lista de conteúdos',
      search: {
        label: 'Buscar conteúdo',
        placeholder: 'Título, categoria ou identificador',
      },
      status: {
        label: 'Situação',
        all: 'Todas',
        published: 'Publicados',
        draft: 'Rascunhos',
      },
      category: { label: 'Categoria', all: 'Todas as categorias' },
      actions: { apply: 'Filtrar', clear: 'Limpar filtros' },
    },
    results: {
      countOne: 'conteúdo encontrado',
      countOther: 'conteúdos encontrados',
    },
    table: {
      caption: 'Conteúdos educativos do acervo administrativo',
      columns: {
        content: 'Conteúdo',
        category: 'Categoria',
        status: 'Situação',
        updatedAt: 'Atualizado em',
        actions: 'Ações',
      },
      withoutCategory: 'Sem categoria',
      published: 'Publicado',
      draft: 'Rascunho',
      edit: 'Editar',
      slugLabel: 'Identificador: {slug}',
      editAria: 'Editar {title}',
    },
    empty: {
      database: {
        title: 'Nenhum conteúdo cadastrado',
        description:
          'Crie o primeiro material para iniciar o acervo administrativo.',
      },
      filtered: {
        title: 'Nenhum conteúdo encontrado',
        description: 'Ajuste ou limpe os filtros para tentar novamente.',
      },
    },
    pagination: {
      label: 'Paginação dos conteúdos',
      previous: 'Anterior',
      next: 'Próxima',
      status: 'Página {page} de {total}',
    },
    form: {
      create: {
        seo: {
          title: 'Novo conteúdo | NutriLink Admin',
          description: 'Adicione um material ao acervo educativo do NutriLink.',
        },
        title: 'Novo conteúdo',
        description:
          'Escreva o material em Markdown e escolha se ele começa como rascunho ou publicado no acervo.',
        submit: 'Criar conteúdo',
      },
      edit: {
        seo: {
          title: 'Editar conteúdo | NutriLink Admin',
          description: 'Atualize um material do acervo educativo do NutriLink.',
        },
        title: 'Editar conteúdo',
        description:
          'Revise o texto, a categoria e a situação do material. O endereço interno permanece estável.',
        submit: 'Salvar alterações',
      },
      fields: {
        title: {
          label: 'Título',
          placeholder: 'Ex.: Como armazenar o leite com segurança',
        },
        category: {
          label: 'Categoria',
          placeholder: 'Ex.: Armazenamento',
          optional: 'Opcional',
        },
        bodyMarkdown: {
          label: 'Conteúdo em Markdown',
          placeholder:
            'Escreva o conteúdo educativo usando títulos, listas e parágrafos.',
          helper:
            'Não inclua dados pessoais, orientações clínicas individualizadas ou promessas de coleta.',
        },
        status: { label: 'Situação', placeholder: 'Selecione' },
        slug: {
          label: 'Identificador interno',
          helper:
            'Gerado automaticamente no cadastro e preservado nas edições.',
        },
      },
      status: {
        draft: 'Rascunho — disponível somente no painel',
        published: 'Publicado — disponível no acervo administrativo',
      },
      actions: { back: 'Voltar para conteúdos', cancel: 'Cancelar' },
      validation: {
        titleRequired: 'Informe um título com pelo menos 3 caracteres.',
        titleCharacters: 'Use letras ou números no título.',
        titleMax: 'O título deve ter no máximo 160 caracteres.',
        categoryMax: 'A categoria deve ter no máximo 80 caracteres.',
        bodyRequired: 'Escreva pelo menos 20 caracteres de conteúdo.',
        bodyMax: 'O conteúdo deve ter no máximo 50.000 caracteres.',
        statusRequired: 'Selecione uma situação válida.',
      },
      mutations: {
        submittingCreate: 'Criando conteúdo...',
        submittingUpdate: 'Salvando alterações...',
        createError:
          'Não foi possível criar o conteúdo agora. Tente novamente.',
        updateError:
          'Não foi possível salvar o conteúdo agora. Tente novamente.',
        validationGeneric: 'Revise os campos destacados.',
        conflict: 'Não foi possível gerar um endereço único para este título.',
        notFound: 'Este conteúdo não existe mais.',
        errorTitle: 'Não foi possível salvar',
      },
    },
  },
  municipalities: {
    seo: {
      title: 'Municípios | NutriLink Admin',
      description: 'Gerencie a área de atuação do Lactare por município.',
    },
    title: 'Municípios atendidos',
    description:
      'Gerencie as cidades que aparecem na verificação pública de cobertura do Lactare.',
    createAction: 'Adicionar município',
    filters: {
      label: 'Filtros da lista de municípios',
      search: { label: 'Buscar município', placeholder: 'Digite o nome' },
      status: {
        label: 'Situação',
        all: 'Todas',
        active: 'Ativos',
        inactive: 'Inativos',
      },
      region: { label: 'Sub-região', all: 'Todas as sub-regiões' },
      actions: { apply: 'Filtrar', clear: 'Limpar filtros' },
    },
    results: {
      countOne: 'município encontrado',
      countOther: 'municípios encontrados',
    },
    table: {
      caption: 'Municípios da área de atuação do Lactare',
      columns: {
        municipality: 'Município',
        region: 'Sub-região',
        status: 'Situação',
        updatedAt: 'Atualizado em',
        actions: 'Ações',
      },
      location: '{city}, São Paulo, Brazil',
      active: 'Ativo',
      inactive: 'Inativo',
      edit: 'Editar',
      editAria: 'Editar {city}',
    },
    empty: {
      database: {
        title: 'Nenhum município cadastrado',
        description:
          'Adicione o primeiro município para iniciar a área de atuação.',
      },
      filtered: {
        title: 'Nenhum município encontrado',
        description: 'Ajuste ou limpe os filtros para tentar novamente.',
      },
    },
    pagination: {
      label: 'Paginação dos municípios',
      previous: 'Anterior',
      next: 'Próxima',
      status: 'Página {page} de {total}',
    },
    form: {
      create: {
        seo: {
          title: 'Adicionar município | NutriLink Admin',
          description: 'Adicione uma cidade à área de atuação do Lactare.',
        },
        title: 'Adicionar município',
        description:
          'Cadastre uma cidade de São Paulo e defina sua sub-região.',
        submit: 'Adicionar município',
      },
      edit: {
        seo: {
          title: 'Editar município | NutriLink Admin',
          description: 'Atualize um município da área de atuação do Lactare.',
        },
        title: 'Editar município',
        description:
          'Atualize o nome, a sub-região ou a disponibilidade pública.',
        submit: 'Salvar alterações',
      },
      fields: {
        name: { label: 'Município', placeholder: 'Ex.: Osasco' },
        region: { label: 'Sub-região', placeholder: 'Selecione' },
        status: { label: 'Situação', placeholder: 'Selecione' },
        state: { label: 'Estado', value: 'São Paulo (SP)' },
        country: { label: 'País', value: 'Brazil' },
      },
      status: {
        active: 'Ativo — aparece na verificação pública',
        inactive: 'Inativo — não aparece como área atendida',
      },
      actions: { back: 'Voltar para municípios', cancel: 'Cancelar' },
      validation: {
        nameRequired: 'Informe o nome do município.',
        nameMax: 'O nome do município é muito longo.',
        regionRequired: 'Selecione uma sub-região válida.',
        statusRequired: 'Selecione uma situação válida.',
      },
      mutations: {
        submittingCreate: 'Adicionando município...',
        submittingUpdate: 'Salvando alterações...',
        createError:
          'Não foi possível adicionar o município agora. Tente novamente.',
        updateError:
          'Não foi possível salvar o município agora. Tente novamente.',
        validationGeneric: 'Revise os campos destacados.',
        conflict: 'Este município já está cadastrado.',
        notFound: 'Este município não existe mais.',
        errorTitle: 'Não foi possível salvar',
      },
    },
  },
  /** Área administrativa legada de unidades. Não expor na navegação. */
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
        status: 'Situação do cadastro',
        journey: 'Jornada',
        consent: 'Consentimento',
        signedUpAt: 'Cadastro',
        actions: 'Ações',
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
          'O cadastro é opcional: a nutriz pode verificar a cobertura sem deixar dados. Quem escolher se cadastrar aparece aqui.',
      },
      filtered: {
        title: 'Nenhuma nutriz encontrada',
        description:
          'Nenhum cadastro corresponde a esses filtros. Tente ajustar a busca ou limpar os filtros.',
        action: 'Limpar filtros',
      },
    },
  },
  nutrizJourney: {
    seo: {
      title: 'Jornada da nutriz | NutriLink Admin',
      description:
        'Consulte e atualize o status categórico da jornada da nutriz.',
    },
    back: 'Voltar para nutrizes',
    eyebrow: 'Jornada da nutriz',
    location: '{city} - {state}',
    registeredAt: 'Cadastro realizado em {date}',
    openJourney: 'Ver jornada',
    openJourneyAria: 'Ver a jornada de {name}',
    privacyNotice:
      'Registre somente a etapa informada pela equipe do Lactare. Não inclua tipo de exame, resultado, valor, laudo, diagnóstico ou motivo clínico.',
    current: {
      title: 'Status atual',
      description:
        'Categoria operacional informada pelo Lactare. O NutriLink não realiza triagem nem toma decisões clínicas.',
    },
    form: {
      title: 'Atualizar status',
      description:
        'A mudança será registrada de forma permanente com seu usuário, data e horário.',
      nextStatus: {
        label: 'Próximo status',
        placeholder: 'Selecione o próximo status',
        repeatOption: '{label} (registrar nova ocorrência)',
      },
      note: {
        label: 'Observação administrativa (opcional)',
        placeholder: 'Ex.: atualização recebida da equipe do Lactare',
        helper:
          'Até 500 caracteres. Não registre informações clínicas ou resultados de exame.',
      },
      // Só aparece quando o próximo status selecionado é "Kit enviado"
      // (20/09/2026) — vira a fonte do lembrete de entrega do kit na área da
      // nutriz. Opcional: sem essa informação, o lembrete simplesmente não
      // fica disponível para ela.
      kitScheduledAt: {
        label: 'Data e horário combinados da entrega (opcional)',
        helper:
          'Informe se já combinou um horário com a nutriz. Isso habilita, na área dela, o lembrete de entrega do kit.',
      },
      submit: 'Registrar mudança de status',
      submitting: 'Registrando mudança...',
    },
    kitDelivery: {
      title: 'Registrar entrega do kit',
      description:
        'Use esta ação somente depois que a equipe do Lactare confirmar a entrega. O registro será feito por você no painel e a nutriz apenas visualizará o status; ela não precisa confirmar nada.',
      nextStatus: {
        label: 'Etapa confirmada pela equipe',
        placeholder: 'Kit entregue',
      },
      note: {
        label: 'Observação administrativa (opcional)',
        placeholder: 'Ex.: entrega confirmada pela equipe do Lactare',
        helper:
          'Até 500 caracteres. Não registre informações clínicas ou resultados de exame.',
      },
      submit: 'Registrar entrega do kit',
      submitting: 'Registrando entrega...',
    },
    terminal: {
      title: 'Sem próxima etapa definida',
      description:
        'Este status não possui uma transição seguinte autorizada. Correções ou reaberturas dependem de uma decisão operacional do Lactare.',
    },
    history: {
      title: 'Histórico da jornada',
      description:
        'Registro imutável das mudanças feitas pela equipe administrativa, das mais recentes para as mais antigas.',
      initialTitle: 'Cadastro criado',
      initialDescription:
        'A jornada começou com o status Primeiro contato pelo WhatsApp.',
      transition: 'Alterado de {from} para {to}',
      changedBy: 'Registrado por {name}',
      noNote: 'Sem observação administrativa.',
    },
    status: {
      REGISTERED: 'Primeiro contato pelo WhatsApp',
      DOCUMENT_SENT: 'Verificação da área atendida',
      FORM_RECEIVED: 'Verificação da área atendida',
      EXAM_SCHEDULED: 'Ficha de saúde e exame de sangue',
      EXAMS_COMPLETED: 'Ficha de saúde e exame de sangue',
      AWAITING_RESULT: 'Ficha de saúde e exame de sangue',
      ELIGIBLE: 'Ficha de saúde e exame de sangue',
      NOT_ELIGIBLE: 'Ficha de saúde e exame de sangue',
      KIT_SENT: 'Entrega do kit em casa',
      KIT_DELIVERED: 'Extração e armazenamento em casa',
      DONATION_CONFIRMED: 'Coleta domiciliar do leite',
      RECURRING_DONATION_ELIGIBLE: 'Coleta domiciliar do leite',
    },
    validation: {
      idInvalid: 'A nutriz informada é inválida.',
      transitionInvalid:
        'Selecione uma transição permitida para o status atual.',
      noteMax: 'A observação deve ter no máximo 500 caracteres.',
      noteClinical:
        'Registre apenas contexto administrativo, sem laudo, diagnóstico, exame específico ou motivo clínico.',
      kitScheduledAtInvalid: 'Informe uma data e horário válidos.',
    },
    mutations: {
      success:
        'Status atualizado, registrado no histórico e tratado para aviso conforme o consentimento da nutriz.',
      validationGeneric: 'Revise os campos destacados.',
      conflict:
        'O status foi alterado em outra aba. Atualize a página antes de tentar novamente.',
      notFound: 'Esta nutriz não está mais disponível.',
      databaseError:
        'Não foi possível atualizar o status agora. Tente novamente em alguns instantes.',
      errorTitle: 'Não foi possível registrar a mudança',
      successTitle: 'Mudança registrada',
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

export const DASHBOARD_CHARTS = {
  evolution: 'Evolução dos cadastros',
  registrations: 'Cadastros',
  period: '{start} – {end} · mês atual parcial',
  evolutionNote: 'Cadastros criados em cada mês, sem incluir perfis removidos.',
  evolutionEmpty: 'Ainda não há cadastros neste período.',
  origins: 'Origem dos Cadastros',
  originsSubtitle: 'Total acumulado: {count} nutrizes',
  originsNote:
    'Origem registrada via UTM no cadastro. Sem identificação, a origem fica como não informada.',
  originsEmpty:
    'Ainda não há cadastros para mostrar a distribuição de origens.',
  originLabels: {
    whatsapp: 'WhatsApp',
    web: 'Site',
    other: 'Outras origens',
    unknown: 'Não informada',
  },
  total: 'total',
  viewData: 'Ver dados do gráfico',
  month: 'Mês',
} as const
