# Documento do Projeto — NutriLink

**Projeto:** NutriLink — solução digital para o Lactare, banco de leite humano da Eurofarma

**Desafio:** Challenge FIAP 2026 — 3º ano, Sistemas de Informação — Projeto Lactare

**Versão:** 2.0

**Última atualização:** 11 de setembro de 2026

**Equipe:** [preencher nomes do squad]

**Status:** especificação funcional e de produto. A seção 9 registra o estado real da implementação.

## 1. Resumo do Projeto

O NutriLink é a solução digital do Lactare, criada para reduzir as barreiras de informação, contato e encaminhamento que hoje limitam o número de doações de leite humano na região atendida pelo Lactare, na Grande São Paulo.

A solução tem três frentes:

1. **Chatbot no WhatsApp** — porta de entrada principal, onde a nutriz tira dúvidas, verifica se está na área de cobertura e, se quiser, se cadastra.
2. **Plataforma web** — verificação de elegibilidade por CEP, conteúdo educativo, cadastro, login e área da nutriz.
3. **Dashboard administrativo** — métricas de alcance, engajamento e conversão para a equipe do Lactare.

## 2. O Problema

### 2.1 O desafio proposto pela Eurofarma

> Como podemos criar uma solução digital integrada que conecte canais digitais, nutrizes e bancos de leite humano, para ampliar a conscientização, facilitar o acesso à informação e otimizar o encaminhamento de doadoras, garantindo uma experiência simples, ágil e humanizada?

### 2.2 Por que isso importa

- No Brasil, cerca de 12% dos nascimentos são prematuros — quase 300 mil bebês por ano —, taxa acima da média global, de aproximadamente 10%, colocando o país entre os dez com mais nascimentos prematuros do mundo (Agência Brasil, 2025).
- Segundo o Ministério da Saúde, em média 330 mil crianças prematuras precisam de doação de leite humano por ano no Brasil (Febrasgo, citando dados do Ministério da Saúde).
- O Brasil tem a maior e mais complexa rede de bancos de leite do mundo, reconhecida pela OMS, distribuindo cerca de 160 mil litros por ano. A oferta, porém, é instável: entre outubro e dezembro de 2024, o número de doadoras caiu de 16.079 para 14.493 durante o período de festas, e bancos de leite pelo país continuam reportando estoques abaixo do ideal por falta de doadoras (Fiocruz/rBLH).
- No recorte do Lactare, o banco foi criado com a meta de processar 60 litros por mês para atender cerca de 20 bebês da UTI Neonatal do Hospital Geral de Itapevi, hospital que registra em torno de 400 partos por mês. Depois, o Lactare expandiu a parceria para o Hospital Geral de Carapicuíba. O Lactare já registrou até 140 litros por mês, com cerca de 95 a mais de 100 doadoras ativas (Eurofarma, releases institucionais — ver Anexo E).

### 2.3 Dores específicas

| Dor | Efeito |
|---|---|
| A nutriz não sabe se está na área de cobertura do Lactare | Desiste antes de tentar |
| Não sabe se a coleta é domiciliar ou em ponto físico | Confusão ou contato perdido |
| A informação sobre o processo é dispersa | Fricção no primeiro contato |
| Falta acompanhamento depois do primeiro contato | Baixa recorrência |
| A equipe do Lactare não tem visibilidade das métricas de engajamento | Decisões sem dados sobre onde investir esforço |

## 3. O que o NutriLink é — e o que não é

### É

- A ferramenta digital do Lactare para a área geográfica que ele realmente atende.
- Um jeito rápido de a nutriz descobrir se pode doar e como prosseguir, sem precisar ligar às cegas.
- Um canal de relacionamento contínuo, por meio de lembretes opcionais, entre o Lactare e suas doadoras.

### Não é

- Um diretório nacional de bancos de leite: trabalha somente com dados do Lactare; ver Anexo A.5.
- Um sistema de agendamento ou confirmação de coleta; ver Anexo A.3.
- Um substituto da triagem de saúde feita por profissional do Lactare.
- Um aplicativo nativo: a experiência principal funciona no WhatsApp e na web, sem instalação.

## 4. Como Funciona

### 4.1 Chatbot no WhatsApp

- Apresentação do projeto e respostas a perguntas frequentes.
- Cadastro simplificado e opcional.
- Verificação de elegibilidade por CEP ou município: informa se a nutriz está na área de atuação do Lactare e orienta o próximo contato; a uniformidade da coleta domiciliar gratuita nos 30 municípios ainda depende de validação do Lactare, conforme o Anexo A.5.
- Orientação transparente para quem está fora da área de atuação.
- Lembretes personalizados somente para quem ativar o recurso, por opt-in.
- Acompanhamento após a doação.
- Incentivo ao compartilhamento por cartão de impacto, mensagem pronta de encaminhamento e reconhecimento por status; ver Anexo A.8.

O motivo para concentrar o canal conversacional no WhatsApp está no Anexo A.1.

### 4.2 Plataforma Web

- Conteúdo educativo: “Como funciona”, perguntas frequentes, checklist e vídeos.
- Verificador de elegibilidade por CEP ou município, com mapa da área de atuação do Lactare.
- Cadastro, login e área pessoal, incluindo lembretes quando ativados.
- Painel administrativo; ver seção 4.3.

O motivo para manter o site junto ao chatbot está no Anexo A.2.

### 4.3 Dashboard Administrativo

- Indicadores de alcance, engajamento, conversão e retenção.
- Segmentação combinável por sub-região da Grande São Paulo e perfil da doadora; ver Anexo A.7.
- Indicação de elegibilidade: dentro ou fora da área de atuação do Lactare.
- Adesão à funcionalidade de lembretes.
- Gestão da lista de municípios atendidos pelo Lactare.
- Listagem de nutrizes cadastradas com exposição reduzida de dados pessoais.

### 4.4 Jornada da Nutriz

1. Primeiro contato pelo WhatsApp.
2. O chatbot apresenta o projeto e esclarece dúvidas.
3. A nutriz verifica a elegibilidade por CEP.
4. A nutriz pode realizar um cadastro simplificado e opcional.
5. A nutriz entra em contato direto com o Lactare para combinar a doação.
6. A nutriz pode ativar lembretes opcionais.
7. O NutriLink apoia o acompanhamento e o pós-doação.

## 5. Requisitos

### 5.1 Requisitos Funcionais

| ID | Descrição |
|---|---|
| RF01 | Verificar elegibilidade de coleta domiciliar a partir do CEP. |
| RF02 | Exibir os pontos de entrega do Lactare, com endereço, horário e mapa. |
| RF03 | Informar quando a nutriz está fora da área de cobertura e indicar canal externo oficial. |
| RF04 | Permitir cadastro opcional com consentimento LGPD. |
| RF05 | Permitir login da nutriz cadastrada. |
| RF06 | Permitir ativação opcional de lembretes personalizados, sem representar agendamento. |
| RF07 | Registrar cliques em canais de contato para métricas. |
| RF08 | Fornecer painel administrativo com autenticação. |
| RF09 | Permitir edição da lista de municípios atendidos pelo Lactare. |
| RF10 | Exibir indicadores de alcance, engajamento, conversão e adesão a lembretes. |
| RF11 | Conduzir o fluxo completo do chatbot via WhatsApp. |
| RF12 | Gerar um cartão de impacto compartilhável após cada doação confirmada. |
| RF13 | Gerar uma mensagem de encaminhamento pronta para a nutriz compartilhar com outras pessoas. |
| RF14 | Atribuir e exibir reconhecimentos por status, como “primeira doação”, “doadora recorrente” e “embaixadora”, na área pessoal da nutriz. |
| RF15 | Registrar quando um cadastro novo se origina de uma indicação, para fins de métrica, sem vincular a recompensa material. |

### 5.2 Requisitos Não Funcionais

| ID | Descrição |
|---|---|
| RNF01 | Conformidade com a LGPD, com consentimento explícito. |
| RNF02 | Row Level Security (RLS) no banco de dados. |
| RNF03 | Rate limiting contra abuso. |
| RNF04 | Proteção anti-spam nos formulários públicos. |
| RNF05 | Validação de e-mail, WhatsApp e CEP. |
| RNF06 | Interface responsiva e mobile-first. |
| RNF07 | Resposta do chatbot em poucos segundos. |
| RNF08 | Painel administrativo restrito por permissão. |

## 6. Segurança e LGPD

- Consentimento explícito e separado para cadastro e lembretes.
- Política de Privacidade e Termos de Uso publicados; ainda pendentes na implementação.
- RLS no Supabase; ainda pendente na implementação.
- Exposição reduzida de dados pessoais no painel administrativo.
- Rate limiting distribuído e proteção anti-spam antes de qualquer exposição pública; o limitador atual é apenas local e em memória.
- Nenhum dado clínico da nutriz ou dos bebês é tratado pelo NutriLink.
- O estado-alvo não mantém dados próprios de outros bancos de leite. A base nacional existente no código é legado técnico e deverá ser descontinuada ou isolada por migração segura, sem remoção improvisada de dados.

## 8. Diferenciais Competitivos

- Reduz o caminho entre intenção e contato real: CEP → elegibilidade → contato direto.
- Concentra a experiência conversacional no WhatsApp, evitando fragmentar a qualidade entre canais.
- Nunca simula uma cobertura que o Lactare não tem: quando a nutriz está fora da área, isso é informado com transparência.
- Usa lembretes opcionais no lugar de um agendamento que dependeria de terceiros.
- Oferece dashboard com indicadores reais de funil: alcance → engajamento → conversão → retenção.
- Incentiva crescimento orgânico por indicação, cartão de impacto, mensagem pronta e reconhecimento por status, sem recompensa material e respeitando as restrições do setor.
- Mantém uma arquitetura que pode evoluir para novos pontos do Lactare ou parceiros formalizados, sem apresentar hoje uma cobertura que não existe.

## 9. Estado Atual e Roadmap

Esta seção descreve o repositório em 11 de setembro de 2026. Ela prevalece sobre menções históricas a funcionalidades “prontas”.

### 9.1 Funcionalidades implementadas e verificadas

- Navegação pública, landing page e conteúdo educativo.
- Cadastro opcional de nutriz com consentimento obrigatório no formulário e provisionamento de conta no Supabase Auth.
- Login, recuperação de senha condicionada à entrega de e-mail pelo SMTP e sessão da nutriz.
- Painel administrativo com autenticação e autorização por perfil `ADMIN`.
- Dashboard com métricas básicas dos dados legados: unidades, estados, nutrizes e cliques no WhatsApp.
- Cadastro e edição administrativa de unidades do modelo legado, além de listagem de unidades e nutrizes.
- Rastreamento de cliques no WhatsApp, sem PII da nutriz no evento.
- Infraestrutura de webhook da WhatsApp Cloud API, validação de assinatura, máquina de estados e simulador local.
- Área pessoal com um fluxo técnico de informação sobre tentativa de combinação de visita. Esse fluxo é legado e não deve ser apresentado como agendamento ou confirmação de coleta.
- Suíte automatizada com 365 testes no estado auditado nesta atualização.

### 9.2 Funcionalidades parciais ou incompatíveis com o escopo atualizado

- **Busca e detalhes de unidades:** funcionam para a base nacional legada da rBLH, mas ainda não representam a experiência Lactare-only nem a elegibilidade pelos 30 municípios.
- **Pontos de entrega:** endereço, horário e mapa estático existem no modelo legado, mas os pontos oficiais do Lactare ainda precisam ser validados e configurados.
- **Cadastro com LGPD:** o bloqueio de consentimento existe, mas `/privacidade` e `/termos` ainda retornam 404 e precisam ser publicados.
- **Métricas:** o dashboard mostra métricas básicas, mas ainda não calcula o funil completo, retenção, adesão a lembretes nem os cruzamentos de região e perfil.
- **Tracking de contato:** registra clique no WhatsApp de unidade; ainda não cobre todos os canais relevantes nem o fluxo completo do Lactare.
- **Chatbot:** a infraestrutura e um fluxo local limitado existem, mas faltam menu principal, perguntas frequentes, elegibilidade, cadastro, opt-in de lembretes e pós-doação. Não há conta Meta, número, templates ou URL pública.
- **Origem do cadastro:** UTMs genéricas são persistidas, mas não existe identificador próprio de indicação nem vínculo de atribuição entre doadoras.

### 9.3 Funcionalidades ainda não implementadas

- RF01: elegibilidade do Lactare por CEP ou município.
- RF03: orientação de fora de cobertura com canal oficial externo.
- RF06: lembretes personalizados com opt-in separado e job agendado.
- RF09: gestão específica da lista de municípios atendidos pelo Lactare.
- RF12: cartão de impacto após confirmação legítima da doação.
- RF13: mensagem pronta de encaminhamento com link de indicação.
- RF14: reconhecimentos por status na área pessoal.
- RF15: atribuição específica de novos cadastros por indicação.
- Páginas de Política de Privacidade e Termos de Uso.
- RLS, rate limiting distribuído e proteção anti-spam.
- Validação operacional de e-mail e WhatsApp, caso exigida pelo Lactare.
- Ativação real do chatbot na Meta.

### 9.4 Validações externas pendentes

- Confirmar com o Lactare se a coleta domiciliar gratuita é uniforme para todos os 30 municípios do Mapa do Leite ou se varia conforme distância e logística.
- Validar os pontos oficiais de entrega, horários, telefones e instruções que poderão ser publicados.
- Definir quem e como confirma uma doação no NutriLink antes de gerar cartão de impacto, atualizar status ou contar recorrência.
- Validar a redação jurídica da Política de Privacidade, dos Termos de Uso e dos consentimentos.

### 9.5 Ordem recomendada de implementação

1. Publicar Privacidade e Termos, habilitar RLS e endurecer os controles contra abuso.
2. Modelar e implementar a área de atuação do Lactare e a elegibilidade por CEP ou município.
3. Isolar a experiência pública da base nacional legada e substituir a busca nacional pelo fluxo Lactare-only.
4. Adaptar o chatbot para perguntas frequentes, elegibilidade, cadastro e encaminhamento ao Lactare.
5. Implementar lembretes com opt-in separado e sem linguagem de agendamento.
6. Completar o dashboard com funil, retenção, cobertura, região e perfil.
7. Definir a confirmação de doação e, depois disso, implementar cartão, mensagem de indicação e reconhecimentos.
8. Ativar a integração real com a Meta somente quando houver conta, número, templates e URL pública.

### 9.6 Fora do escopo atual

- Diretório nacional próprio de bancos da rBLH.
- Agendamento ou confirmação automática de coleta.
- Triagem clínica ou armazenamento de dados de saúde.
- Dados clínicos dos bebês atendidos pelos hospitais parceiros.
- Recompensas materiais por doação ou indicação.
- Aplicativo móvel nativo.

## Anexo A — Por que tomamos essas decisões

### A.1 Por que só WhatsApp, sem Instagram

Focar em um único canal conversacional reduz a complexidade de integração e concentra o esforço de qualidade onde o público já está. O WhatsApp tem ampla adoção entre o público-alvo, e manter dois canais de chat com qualidade desigual custaria mais do que agregaria nesta etapa.

### A.2 Por que ter uma plataforma web além do chatbot

O chatbot é adequado para o primeiro contato, mas tem limitações estruturais: não renderiza bem um mapa interativo, não é confortável para conteúdo educativo longo, não comporta um formulário extenso com consentimento formal e não permite montar um painel administrativo dentro de uma conversa. A web cobre essas lacunas sem competir com o chat; a jornada essencial continua possível pelo WhatsApp.

### A.3 Por que não existe agendamento de coleta

A ideia foi avaliada e descartada pelos seguintes motivos:

1. A doação depende de triagem de saúde feita por profissional; um agendamento self-service criaria uma falsa expectativa de confirmação que o produto não pode assegurar.
2. A logística de coleta domiciliar, incluindo motorista, técnico e kits, é operada internamente pelo Lactare, sem sistema em tempo real que o NutriLink possa consultar.
3. Dados de triagem são dados pessoais sensíveis pela LGPD; automatizar essa etapa eleva o custo e o risco sem que o time consiga sustentar o processo de ponta a ponta.
4. Prometer uma coleta “confirmada” que depois não acontece gera frustração e compromete a confiança na iniciativa.

A combinação de data e horário continua sendo feita diretamente entre a nutriz e a equipe do Lactare. O NutriLink pode registrar uma intenção ou data de referência para lembrete, mas nunca deve comunicar que a coleta foi agendada ou confirmada.

### A.4 Por que lembretes opcionais em vez de agendamento

O lembrete é uma alternativa mais simples e sustentável: a nutriz compartilha voluntariamente uma data de referência e o sistema envia uma mensagem pelo WhatsApp. A mensagem nunca é uma confirmação de coleta. Isso reduz o esquecimento sem depender de integração com terceiros, não gera promessa operacional e transforma cada ativação ou retorno em um sinal de engajamento para o dashboard.

### A.5 Por que o banco de dados deve conter somente informações do Lactare

Foi considerada a inclusão de dados de outros bancos de leite do Brasil, mas essa abordagem foi descartada porque:

1. Não existe uma fonte nacional viva e garantida pelo NutriLink; dados transcritos manualmente ficam desatualizados.
2. Exibir outros bancos ao lado do Lactare pode sugerir uma parceria inexistente.
3. Manter essa camada consome esforço que não agrega ao núcleo do produto.
4. O Lactare atua em uma área geográfica específica; é mais transparente assumir esse limite do que simular cobertura nacional.

Quando a nutriz estiver fora da área do Lactare, o sistema deve informar isso claramente e indicar um canal oficial externo, como a rBLH ou o Ministério da Saúde, sem armazenar e manter um diretório paralelo.

#### Área de atuação adotada

Foi adotado como fonte oficial o Mapa do Leite do site do Lactare, que lista 30 municípios da Grande São Paulo:

Arujá, Barueri, Caieiras, Cajamar, Carapicuíba, Cotia, Diadema, Embu das Artes, Embu-Guaçu, Ferraz de Vasconcelos, Francisco Morato, Guarulhos, Itapecerica da Serra, Itapevi, Itaquaquecetuba, Jandira, Mauá, Osasco, Pirapora do Bom Jesus, Poá, Ribeirão Pires, Rio Grande da Serra, Santana de Parnaíba, Santo André, São Bernardo do Campo, São Caetano do Sul, São Paulo, Suzano, Taboão da Serra e Vargem Grande Paulista.

Foi encontrada uma divergência nas fontes públicas: o site institucional da Eurofarma e publicações do perfil oficial do Lactare usam, em algumas campanhas, a descrição mais restrita “Zona Sul de São Paulo, região do ABC, Cotia ou Itapevi”. O Mapa do Leite foi adotado como fonte de verdade por ser uma ferramenta dedicada especificamente à checagem de cobertura. A descrição de campanhas pode refletir um recorte de captação ativa em determinado momento.

Permanece pendente a confirmação de que a coleta domiciliar gratuita é oferecida de forma uniforme nos 30 municípios. Até a validação direta com o Lactare, o sistema pode afirmar que o município está na área de atuação, mas não deve prometer uma modalidade de coleta que não esteja configurada e validada.

#### Tratamento da base nacional já existente

O repositório contém uma base nacional legada da rBLH, criada antes desta decisão de escopo. Ela não representa o produto-alvo, não deve continuar sendo expandida e deverá ser isolada, arquivada ou removida por uma migração segura e auditável. Esta decisão não autoriza apagar dados sem análise de impacto e plano de reversão.

### A.6 Por que o cadastro existe, mas é opcional

O cadastro não é necessário para a verificação básica de elegibilidade. Ele viabiliza a continuidade da jornada entre WhatsApp e web, o envio de lembretes para quem der opt-in, métricas reais de conversão e retenção e o registro de consentimento exigido pela LGPD.

### A.7 Como deverá funcionar a segmentação por região e perfil

O desafio lista “segmentação básica por região ou perfil” como diferencial. A arquitetura-alvo prevê as duas dimensões como filtros combináveis, pois uma nutriz possui simultaneamente localização e características de jornada. Essa segmentação ainda não está implementada no dashboard atual.

#### Dimensão 1 — Região

Em vez de apresentar somente 30 municípios isolados, os municípios do Mapa do Leite serão agrupados nas sub-regiões da Região Metropolitana de São Paulo:

| Sub-região | Municípios do Mapa do Leite |
|---|---|
| Oeste | Itapevi, Barueri, Carapicuíba, Cotia, Jandira, Osasco, Pirapora do Bom Jesus, Santana de Parnaíba e Vargem Grande Paulista |
| Sudoeste | Embu das Artes, Embu-Guaçu, Itapecerica da Serra e Taboão da Serra |
| ABC | Diadema, Mauá, Ribeirão Pires, Rio Grande da Serra, Santo André, São Bernardo do Campo e São Caetano do Sul |
| Norte | Caieiras, Cajamar e Francisco Morato |
| Leste / Alto Tietê | Arujá, Ferraz de Vasconcelos, Guarulhos, Itaquaquecetuba, Poá e Suzano |
| Capital | São Paulo |

#### Dimensão 2 — Perfil

Os recortes de comportamento serão calculados a partir dos dados coletados no fluxo normal, sem exigir perguntas adicionais somente para segmentação:

| Campo | Exemplos de valor |
|---|---|
| Estágio da jornada | cadastrada / doou uma vez / recorrente |
| Adesão a lembretes | ativou e voltou / ativou e não voltou / nunca ativou |
| Origem do contato | campanha / indicação / orgânico |
| Velocidade até a primeira doação | rápida / lenta / não doou |

As dimensões deverão existir como campos separados. As visões principais mostrarão uma dimensão por vez, enquanto o cruzamento, por exemplo “ABC + recorrente + indicação”, ficará disponível em filtros de tabela. Com uma base pequena, recortes excessivamente específicos não devem virar gráficos padrão.

### A.8 Por que o incentivo ao compartilhamento não usa recompensa material

O crescimento por compartilhamento precisa respeitar as restrições do setor. A doação de leite humano é protegida pela NBCAL e pelas diretrizes da rBLH e da Anvisa contra associações com vantagem material. Por isso, o NutriLink não adota recompensa financeira, cupom ou modelo “indique e ganhe”.

O incentivo será simbólico e emocional:

1. **Cartão de impacto compartilhável:** após uma doação ser legitimamente confirmada por uma fonte operacional definida com o Lactare, o sistema gera uma imagem simples, sem alegação clínica individual não rastreável, pronta para status ou story.
2. **Mensagem de encaminhamento pronta:** um botão gera um texto acolhedor e um link de indicação para a nutriz compartilhar.
3. **Reconhecimento por status:** títulos simbólicos aparecem na área pessoal conforme regras objetivas, como primeira doação, recorrência ou indicação convertida.

Se o link carregar um identificador de indicação, o campo de origem poderá registrar quantos cadastros novos vieram de outra doadora. O identificador não deve expor dados pessoais nem vincular recompensa material.

## Anexo B — Casos de Uso e Casos de Teste

### B.1 Casos de Uso

| UC | Ator | Descrição |
|---|---|---|
| UC01 | Nutriz | Verificar elegibilidade por CEP ou município. |
| UC02 | Nutriz | Consultar a área de atuação do Lactare. |
| UC03 | Nutriz | Ser informada quando está fora da área de cobertura. |
| UC04 | Nutriz | Realizar cadastro com consentimento LGPD. |
| UC05 | Nutriz | Ativar lembretes personalizados por opt-in. |
| UC06 | Nutriz | Acompanhar sua jornada na área pessoal. |
| UC07 | Nutriz, via chatbot | Tirar dúvidas frequentes. |
| UC08 | Administrador | Autenticar-se no painel. |
| UC09 | Administrador | Editar a lista de municípios atendidos. |
| UC10 | Administrador | Consultar cadastros de nutrizes. |
| UC11 | Administrador | Visualizar indicadores do dashboard. |
| UC12 | Sistema | Disparar lembrete somente para quem ativou. |
| UC13 | Nutriz | Receber e compartilhar o cartão de impacto após uma doação confirmada. |
| UC14 | Nutriz | Gerar e enviar a mensagem de encaminhamento pronta. |
| UC15 | Sistema | Atribuir reconhecimento conforme a jornada avança. |

### B.2 Casos de Teste

| CT | UC relacionado | Cenário | Resultado esperado |
|---|---|---|---|
| CT01 | UC01 | CEP de um município presente no Mapa do Leite | Indica que o município está na área do Lactare; a modalidade de coleta segue a regra validada e configurada, sem promessa indevida. |
| CT02 | UC01 | CEP de município fora do Mapa do Leite | Trata como fora de área e segue o CT03. |
| CT03 | UC03 | CEP fora da área de cobertura | Informa isso claramente e direciona a um canal externo oficial. |
| CT04 | UC04 | Cadastro sem aceitar o consentimento LGPD | Bloqueia o envio. |
| CT05 | UC04 | E-mail em formato inválido | Rejeita e sinaliza o erro. |
| CT06 | UC05 | Ativação de lembrete com data de referência | Confirma somente a ativação do lembrete, nunca um “agendamento confirmado”. |
| CT07 | UC08 | Login sem permissão de administrador | Nega o acesso. |
| CT08 | UC09 | Alteração da lista de municípios atendidos | A próxima verificação de elegibilidade reflete a lista atualizada. |
| CT09 | UC11 | Ausência de cadastros no período | Dashboard mostra “0” ou “sem dados”, nunca erro. |
| CT10 | RNF03 | Requisições repetidas da mesma origem | Rate limiting bloqueia temporariamente. |
| CT11 | RNF02 | Acesso não autenticado aos dados de outra nutriz | RLS bloqueia o acesso. |
| CT12 | UC12 | Nutriz sem lembrete ativado | Não recebe mensagem de lembrete. |
| CT13 | UC13 | Doação confirmada por fonte autorizada | O cartão é gerado e oferecido para compartilhamento, sem recompensa material nem alegação clínica individual não comprovada. |

## Anexo C — Glossário

- **BLH:** Banco de Leite Humano.
- **Nutriz:** mulher que amamenta e é potencial doadora.
- **Triagem:** avaliação de saúde prévia à doação, feita por profissional.
- **rBLH:** Rede Brasileira de Bancos de Leite Humano, coordenada pelo Ministério da Saúde e pela Fiocruz.
- **RLS:** Row Level Security — controle que restringe o acesso a linhas do banco conforme a identidade e a permissão.
- **MVP:** versão mínima funcional de um produto.
- **LGPD:** Lei Geral de Proteção de Dados Pessoais, Lei nº 13.709/2018.
- **Opt-in:** funcionalidade ativada somente por ação voluntária do usuário.
- **NutriLink:** produto digital desenvolvido para apoiar a jornada da doadora e a operação de relacionamento do Lactare.
- **Lactare:** banco de leite humano da Eurofarma e operação atendida pelo NutriLink.

## Anexo D — Escopo Institucional

### D.1 Eurofarma

A Eurofarma é a empresa que idealizou e financia o Lactare. Não é um hospital, não presta atendimento médico e não administra leite a bebês. Seu papel é institucional: financiamento, infraestrutura e comunicação.

### D.2 Lactare

O Lactare é a unidade operacional do banco de leite. É uma unidade regulada pela Anvisa, segue o Regulamento Técnico para Funcionamento de Bancos de Leite Humano, RDC nº 171/2006, e as normas de estrutura física aplicáveis. Também é formalmente vinculado à rBLH.

O Lactare executa:

- cadastro e triagem da doadora, incluindo acompanhamento médico, consultas e exames;
- coleta domiciliar gratuita conforme sua área e suas regras operacionais validadas;
- processamento, incluindo classificação, pasteurização e controle de qualidade;
- armazenamento;
- transferência do leite processado aos hospitais públicos parceiros.

Dados de saúde da nutriz são responsabilidade médica do Lactare. O NutriLink não realiza triagem clínica nem deve armazenar esses dados como parte do seu escopo.

### D.3 Hospitais parceiros

O Hospital Geral de Itapevi e o Hospital Geral de Carapicuíba são instituições públicas independentes. Seu papel começa depois que recebem o leite processado: administram o leite ao bebê internado sob prescrição de seus profissionais.

O Lactare e o NutriLink não têm acesso aos dados clínicos do bebê. O vínculo operacional descrito aqui termina na entrega do leite processado.

### D.4 Consequências para o NutriLink

- O NutriLink lida apenas com dados necessários à jornada da doadora: cadastro, elegibilidade, consentimentos, contato, lembretes e marcos não clínicos.
- Métricas como “quantos bebês foram salvos” ou impacto clínico individual não são rastreáveis pelo produto e não podem ser calculadas ou afirmadas por ele.
- Números institucionais podem ser exibidos somente com fonte, data e atribuição claras.
- O dimensionamento deve usar dados que o próprio Lactare assume publicamente, não estimativas clínicas inventadas a partir da população regional.

### D.5 Validação da orientação para fora da área

O site institucional do Lactare orienta quem mora fora da região atendida a procurar a unidade mais próxima no diretório oficial da rBLH. Essa é a mesma lógica adotada pelo NutriLink: encaminhar para a fonte oficial em vez de manter uma cópia nacional que tende a ficar desatualizada.

## Anexo E — Fontes

1. Agência Brasil (EBC) — [“Taxa de nascimentos prematuros do Brasil está acima da média global”](https://agenciabrasil.ebc.com.br/saude/noticia/2025-01/taxa-de-nascimentos-prematuros-do-brasil-esta-acima-da-media-global), janeiro de 2025.
2. Febrasgo, citando o Ministério da Saúde — [“Febrasgo revela falta de leite humano em bancos de leite de 20 estados e Distrito Federal”](https://www.febrasgo.org.br/pt/noticias/item/1269).
3. [rBLH-Brasil / Fiocruz](https://rblh.fiocruz.br/rblh-brasil).
4. ICICT/Fiocruz — [“Rede Brasileira de Bancos de Leite Humano”](https://www.icict.fiocruz.br/rede-brasileira-de-bancos-de-leite-humano).
5. Portal Fiocruz — [“Campanha do IFF/Fiocruz estimula a doação de leite humano durante o verão”](https://fiocruz.br/noticia/2025/12/campanha-do-iff-fiocruz-estimula-doacao-de-leite-humano-durante-o-verao-0), dezembro de 2025.
6. Portal Fiocruz — [“Com estoques em baixa, banco de leite humano precisa de doações”](https://portal.fiocruz.br/noticia/com-estoques-em-baixa-banco-de-leite-humano-precisa-de-doacoes).
7. Gov.br / Ministério da Saúde — [“Banco de Leite Humano (BLH)”](https://www.gov.br/saude/pt-br/acesso-a-informacao/acoes-e-programas/banco-de-leite-humano).
8. Eurofarma — releases institucionais sobre o Lactare em [eurofarma.com.br/releases](https://eurofarma.com.br/releases) e [Banco de Leite](https://eurofarma.com.br/banco-de-leite).
9. CEJAM / Hospital Geral de Itapevi — [“Hospital Geral de Itapevi completa 23 anos”](https://cejam.com.br/noticias/hospital-geral-de-itapevi-completa-23-anos).
10. [Página institucional do Hospital Geral de Itapevi](https://hgitapevi.cejam.org.br/).
11. Eurofarma — [“Eurofarma inaugura primeiro Banco de Leite Humano privado de uma farmacêutica no Brasil”](https://eurofarma.com.br/releases/eurofarma-inaugura-primeiro-banco-de-leite-humano-privado), agosto de 2019.
12. Eurofarma — [“Lactare, banco de leite privado da Eurofarma, fecha parceria com o Hospital Geral de Carapicuíba”](https://eurofarma.co.mz/releases/lactare-banco-de-leite-privado-da-eurofarma-fecha-parceria-com-o-hospital-geral-de-carapicuiba).
13. Eurofarma — [“Lactare, banco de leite privado da Eurofarma, bate nova meta de arrecadação de leite humano no mês”](https://eurofarma.com.br/press-room/releases/lactare-eurofarmas-private-milk-bank-reaches-new-human-milk-collection-target-in-the-month).
14. Eurofarma — [“Banco de Leite”](https://eurofarma.com.br/banco-de-leite).
15. rBLH Brasil / Fiocruz — [“Regulamento Técnico”](https://rblh.fiocruz.br/regulamento-tecnico), incluindo RDC nº 171/2006 e RDC nº 50/2002.
16. Lactare — [site institucional e Mapa do Leite](https://www.lactare.com.br).
17. [Instagram oficial do Lactare, @lactarebr](https://www.instagram.com/lactarebr/).

> Nota de governança: dados quantitativos, endereços, horários, área de atuação e alegações institucionais devem ser revalidados perto da entrega, pois podem mudar. A data e a fonte da validação devem ser registradas no documento ou no dado administrável correspondente.
