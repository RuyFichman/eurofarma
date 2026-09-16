# Documento do Projeto — NutriLink

**Projeto:** NutriLink — solução digital para o Lactare, banco de leite humano da Eurofarma

**Desafio:** Challenge FIAP 2026 — 3º ano, Sistemas de Informação — Projeto Lactare

**Versão:** 2.0

**Última atualização:** 16 de setembro de 2026

**Equipe:** [preencher nomes do squad]

**Status:** especificação funcional e de produto. A seção 9 registra o estado real da implementação.

## 1. Resumo do Projeto

O NutriLink é a solução digital do Lactare, criada para reduzir as barreiras de informação, contato e encaminhamento que hoje limitam o número de doações de leite humano na região atendida pelo Lactare, na Grande São Paulo.

A solução tem três frentes:

1. **Chatbot no WhatsApp** — porta de entrada principal, onde a nutriz tira dúvidas, verifica se está na área de cobertura e, se quiser, se cadastra.
2. **Plataforma web** — verificação de cobertura por CEP ou município, conteúdo educativo, cadastro, login e área da nutriz.
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
| Não sabe qual é o próximo passo depois de confirmar a cobertura | Confusão ou contato perdido |
| A informação sobre o processo é dispersa | Fricção no primeiro contato |
| Falta acompanhamento depois do primeiro contato | Baixa recorrência |
| A equipe do Lactare não tem visibilidade das métricas de engajamento | Decisões sem dados sobre onde investir esforço |

## 3. O que o NutriLink é — e o que não é

### É

- A ferramenta digital oficial do Lactare para a área geográfica que ele realmente atende.
- Um jeito rápido de a nutriz descobrir se pode doar e como prosseguir, sem precisar ligar às cegas.
- Um canal de relacionamento contínuo, por meio de lembretes opcionais, entre o Lactare e suas doadoras.

### Não é

- Um diretório nacional de bancos de leite: trabalha somente com dados do Lactare; ver Anexo A.5.
- Um sistema de agendamento ou confirmação de coleta; ver Anexo A.3.
- Um substituto da triagem de saúde feita por profissional do Lactare. O sistema pode exibir o status categórico de um exame já avaliado por um profissional, mas nunca avalia, aprova ou reprova por conta própria; ver Anexo A.9.
- Um aplicativo nativo: a experiência principal funciona no WhatsApp e na web, sem instalação.

## 4. Como Funciona

### 4.1 Chatbot no WhatsApp

- Apresentação do projeto e respostas a perguntas frequentes.
- Cadastro simplificado e opcional.
- Verificação de elegibilidade por CEP ou município: informa a elegibilidade geográfica para coleta domiciliar gratuita segundo o Mapa do Leite e orienta o próximo contato; a uniformidade operacional desse atendimento nos 30 municípios ainda depende de validação do Lactare, conforme o Anexo A.5.
- Orientação transparente para quem está fora da área de atuação.
- Lembretes personalizados somente para quem ativar o recurso, por opt-in.
- Acompanhamento após a doação.
- Incentivo ao compartilhamento por cartão de impacto, mensagem pronta de encaminhamento e reconhecimento por status; ver Anexo A.8.

O motivo para concentrar o canal conversacional no WhatsApp está no Anexo A.1.

### 4.2 Plataforma Web

- Conteúdo educativo: “Como funciona”, perguntas frequentes, checklist e vídeos.
- Verificador de elegibilidade por CEP ou município, acompanhado da visualização da área de atuação do Lactare: o CEP é resolvido pelo ViaCEP e o município resultante é comparado com a lista ativa administrada pelo Lactare.
- Cadastro, login e área pessoal, com acompanhamento seguro do status da jornada e lembretes quando ativados.
- Minha Área como núcleo de relacionamento contínuo: status visual da jornada, histórico de doações, registro pessoal de extrações/ordenhas, exportação do histórico em PDF, selos simbólicos, gestão de lembretes, registro opcional de bem-estar, conteúdo sugerido conforme o estágio da jornada, cartão de impacto, mensagem de compartilhamento e gestão dos próprios dados e consentimentos.
- Painel administrativo; ver seção 4.3.

O motivo para manter o site junto ao chatbot está no Anexo A.2.

### 4.3 Dashboard Administrativo

- Indicadores de alcance, engajamento, conversão e retenção.
- Segmentação combinável por sub-região da Grande São Paulo e perfil da doadora; ver Anexo A.7.
- Indicação de elegibilidade: dentro ou fora da área de atuação do Lactare.
- Adesão à funcionalidade de lembretes e, quando houver eventos suficientes, sinais de retenção e recorrência.
- Atualização manual do status da jornada de cada nutriz pela equipe do Lactare: ficha de saúde, exame agendado, resultado aprovado ou não aprovado, kit entregue e aptidão para doações recorrentes. O NutriLink guarda somente categorias, sem detalhes clínicos; ver Anexo A.9.
- Notificação automática pelo WhatsApp sempre que o administrador atualizar o status da jornada; ver Anexo A.9.
- Gestão da lista de municípios atendidos pelo Lactare.
- Listagem de nutrizes cadastradas com exposição reduzida de dados pessoais.

### 4.4 Jornada da Nutriz

1. Primeiro contato pelo WhatsApp.
2. O chatbot apresenta o projeto e esclarece dúvidas.
3. A nutriz informa o CEP ou seleciona o município para verificar a elegibilidade geográfica para coleta domiciliar gratuita segundo o Mapa do Leite, sem confirmação logística automática.
4. A nutriz pode realizar um cadastro simplificado e opcional.
5. A nutriz preenche a ficha de saúde e realiza a coleta do exame de sangue em casa pelo laboratório parceiro Fleury; essas etapas acontecem fora do NutriLink.
6. Um profissional do Lactare analisa o exame. O NutriLink só recebe, por atualização manual da equipe, o status categórico resultante e avisa a nutriz pelo WhatsApp.
7. Se estiver apta, a equipe do Lactare entra em contato para combinar a entrega do kit. A presença da nutriz é obrigatória nessa primeira visita, quando recebe orientações de higiene, coleta e armazenamento.
8. As coletas seguintes são recorrentes e acontecem na residência dentro da janela operacional do Lactare, sem exigir a presença da nutriz.
9. A nutriz pode ativar ou cancelar lembretes opcionais.
10. A nutriz pode registrar, para uso próprio, sessões de extração/ordenha e bem-estar após a doação.
11. A nutriz pode consultar e exportar seu histórico de doações em PDF, além de receber conteúdo sugerido conforme o estágio da jornada.
12. O NutriLink apoia o acompanhamento, o compartilhamento simbólico e o pós-doação.

## 5. Requisitos

### 5.1 Requisitos Funcionais

| ID | Descrição |
|---|---|
| RF01 | Verificar a elegibilidade geográfica para coleta domiciliar gratuita a partir do CEP ou município, sem representar confirmação logística e respeitando a validação operacional pendente do Lactare. |
| RF02 | Exibir os municípios atendidos pelo Lactare e suas sub-regiões. Bancos de leite e pontos de coleta não são entidades gerenciadas pelo NutriLink. |
| RF03 | Informar quando a nutriz está fora da área de cobertura e indicar canal externo oficial. |
| RF04 | Permitir cadastro opcional com consentimento LGPD. |
| RF05 | Permitir login da nutriz cadastrada. |
| RF06 | Permitir ativação e cancelamento opcionais de lembretes personalizados, com consentimento separado e auditável, sem representar agendamento. |
| RF07 | Registrar cliques em canais de contato para métricas. |
| RF08 | Fornecer painel administrativo com autenticação. |
| RF09 | Permitir edição da lista de municípios atendidos pelo Lactare. |
| RF10 | Exibir indicadores de alcance, engajamento, conversão e adesão a lembretes. |
| RF11 | Conduzir o fluxo completo do chatbot via WhatsApp. |
| RF12 | Gerar um cartão de impacto compartilhável após cada doação confirmada. |
| RF13 | Gerar uma mensagem de encaminhamento pronta para a nutriz compartilhar com outras pessoas. |
| RF14 | Atribuir e exibir reconhecimentos por status, como “primeira doação”, “doadora recorrente” e “embaixadora”, na área pessoal da nutriz. |
| RF15 | Registrar quando um cadastro novo se origina de uma indicação, para fins de métrica, sem vincular a recompensa material. |
| RF16 | Permitir que o administrador atualize o status categórico da jornada da nutriz — ficha preenchida, exame agendado, aguardando resultado, apta ou não apta, kit entregue e apta a doações recorrentes — sem armazenar detalhes clínicos. |
| RF17 | Notificar automaticamente a nutriz pelo WhatsApp sempre que o administrador atualizar seu status de jornada. |
| RF19 | Permitir que a nutriz registre suas sessões de extração de leite, com data, hora e volume, para uso pessoal. |
| RF20 | Permitir que a nutriz exporte seu histórico de doações em PDF. |
| RF21 | Permitir o registro opcional de bem-estar após cada doação, sem torná-lo obrigatório nem clínico. |
| RF22 | Sugerir conteúdo educativo à nutriz conforme o estágio atual de sua jornada. |

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
- O status de exame é armazenado apenas como categoria simples, como “aguardando resultado”, “apta” ou “não apta”, depois da avaliação e da atualização manual por um profissional do Lactare. O NutriLink nunca armazena tipo de exame, valores, laudo ou motivo de reprovação e nunca toma decisão clínica.
- O acesso ao status da jornada e ao seu histórico deve ser restrito por função e auditável; a redução do conteúdo clínico não elimina a necessidade de proteção desse dado pessoal.
- O tracking de contato é anônimo: registra canal, tela de origem, campanha e horário, e não guarda CEP, telefone, e-mail, IP, referrer nem vínculo com o cadastro da nutriz.
- Nenhum dado clínico dos bebês é tratado pelo NutriLink.
- O produto ativo não mantém nem expõe um diretório próprio de outros bancos de leite. A base nacional existente permanece somente como legado técnico interno, isolada das interfaces e APIs ativas, até uma futura remoção segura e reversível.

## 8. Diferenciais Competitivos

- Reduz o caminho entre intenção e contato real: CEP → elegibilidade → contato direto.
- Concentra a experiência conversacional no WhatsApp, evitando fragmentar a qualidade entre canais.
- Nunca simula uma cobertura que o Lactare não tem: quando a nutriz está fora da área, isso é informado com transparência.
- Usa lembretes opcionais no lugar de um agendamento que dependeria de terceiros.
- Oferece dashboard com indicadores reais de funil: alcance → engajamento → conversão → retenção.
- Incentiva crescimento orgânico por indicação, cartão de impacto, mensagem pronta e reconhecimento por status, sem recompensa material e respeitando as restrições do setor.
- Oferece transparência sobre a jornada: a nutriz é avisada a cada etapa registrada pelo Lactare — ficha, exame e kit — sem ser questionada sobre fatos que somente a equipe pode confirmar.
- Mantém a lista de municípios como fonte explícita e administrável da cobertura do Lactare, sem apresentar uma cobertura que não existe.
- Mantém uma arquitetura preparada para novos pontos de entrega e parceiros futuros, embora o produto atual trabalhe somente com dados operacionais do Lactare.

## 9. Estado Atual e Roadmap

Esta seção descreve o repositório em 16 de setembro de 2026. Ela prevalece sobre menções históricas a funcionalidades “prontas”.

### 9.1 Funcionalidades implementadas e verificadas

- Navegação pública, landing page e conteúdo educativo.
- Cadastro opcional de nutriz com consentimento obrigatório no formulário e provisionamento de conta no Supabase Auth.
- Login, recuperação de senha condicionada à entrega de e-mail pelo SMTP e sessão da nutriz.
- Painel administrativo com autenticação e autorização por perfil `ADMIN`.
- Página pública `/verificar-cobertura`, com consulta por CEP ou município e os 30 municípios agrupados nas seis sub-regiões adotadas pelo projeto.
- Endpoint `POST /api/coverage`: valida o CEP, consulta o ViaCEP com timeout e compara o município e a UF com `service_municipalities`, sem persistir o CEP.
- Resultado conservador: município ativo indica elegibilidade geográfica para coleta domiciliar gratuita segundo o Mapa do Leite; triagem, modalidade, data, disponibilidade e uniformidade operacional ainda dependem de confirmação direta do Lactare.
- Resposta para localização fora da lista com encaminhamento ao diretório oficial externo da rBLH.
- Contato direto depois da cobertura positiva pelo WhatsApp `+55 (11) 96629-0681` ou telefone `(11) 4144-9604`, com o horário publicado de segunda a sexta, das 7h às 22h. Os dados foram conferidos no site oficial do Lactare em 14 de setembro de 2026, e a interface mantém acesso à fonte sem prometer atendimento ou coleta.
- Tracking anônimo dos canais oficiais do Lactare (RF07): o clique no WhatsApp ou no telefone do cartão de contato grava canal, superfície, campanha de origem e horário em `contact_channel_clicks`, por `POST /api/contact-click`. O evento não depende das unidades legadas e não guarda CEP, telefone, IP nem referrer; o painel exibe total, janela de 30 dias e distribuição por canal.
- Dashboard adaptado para municípios e cadastros de nutrizes, com filtros combináveis por sub-região da Grande São Paulo, status atual de `JourneyStatus` e origem UTM. O mesmo recorte alimenta cartões, evolução mensal, distribuições e o funil progressivo. O painel também apresenta sinais globais de alcance, cliques anônimos por canal, conversão acumulada e cadastros sem avanço registrado entre etapas; “não apta” aparece como saída legítima separada, não como abandono.
- Listagem, cadastro e edição administrativa dos municípios atendidos em `/admin/municipios`, além da listagem de nutrizes e do detalhe da jornada em `/admin/nutrizes/[id]`.
- Migration Prisma de `service_municipalities` com carga inicial dos 30 municípios, gerada, versionada e aplicada no Supabase cloud.
- Isolamento da experiência nacional legada: `/buscar`, `/banco-de-leite/*` e `/admin/unidades*` redirecionam para o novo fluxo; `/api/units` e `/api/track` respondem `410 Gone`.
- Infraestrutura de webhook da WhatsApp Cloud API, validação de assinatura, rate limiting local, máquina de estados e simulador local. O fluxo ativo já oferece menu, FAQ, elegibilidade por CEP ou município, orientação dentro ou fora da área, cadastro simplificado opcional com consentimento, retomada pelo `JourneyStatus` e contato transparente com o Lactare. O consentimento vem antes da solicitação e gravação do nome; o CEP não é persistido, marketing permanece desligado, lembretes começam desligados e só mudam por escolha explícita, e o webhook não cria novos agendamentos. A migration conversacional está aplicada no Supabase cloud.
- Área pessoal com status atual da jornada, linha do tempo de categorias e datas e orientações específicas para cada etapa, além da cidade cadastrada e do acesso ao verificador de cobertura. A consulta não seleciona observações administrativas, responsáveis ou detalhes clínicos e não apresenta agendamento ou confirmação de coleta.
- UC06 foi ampliado localmente com diário pessoal de extração/ordenha, exportação do histórico próprio em PDF, registro opcional e não clínico de bem-estar após doação confirmada e conteúdo educativo sugerido conforme o estágio da jornada. Os registros pessoais podem ser excluídos pela própria nutriz, não acionam coleta e a migration `20260916210000_add_nutriz_personal_area` ainda precisa ser aplicada no Supabase cloud.
- RF16 implementado no painel com `JourneyStatus` separado de `interestStatus`, status atual no perfil, histórico append-only com autor e horário, observação administrativa limitada e regras explícitas de transição. A atualização é condicional ao status anterior e grava perfil e histórico na mesma transação; falha no histórico reverte o status. A migration original está aplicada no Supabase cloud. Quatro marcos adicionais foram acrescentados sem remover os anteriores — documento enviado, exames feitos, kit enviado e doação confirmada — e suas duas migrations foram aplicadas no Supabase cloud em 16 de setembro de 2026, preservando as transições antigas e os perfis existentes.
- Base do RF17 com opt-in específico para avisos de status no cadastro web, separado dos lembretes. A mesma transação que altera o `JourneyStatus` e grava o histórico também cria a outbox; cada histórico aceita no máximo um aviso por chave idempotente. Sem consentimento vigente, o item nasce suprimido. O processador usa claim concorrente com lock recuperável, revalida consentimento e exclusão lógica, aplica backoff e limite de tentativas e mantém auditoria append-only de cada resultado. O simulador exercita sucesso, falha transitória e falha permanente sem chamar a Meta nem imprimir PII. A migration `20260916180000_add_notification_outbox` foi aplicada no Supabase cloud em 16 de setembro de 2026.
- Consentimento de lembretes separado dos avisos de status, com opt-in no cadastro e ativação ou cancelamento posterior na área autenticada e no chatbot. Cada mudança acrescenta um evento auditável ao ledger append-only, e reentregas do WhatsApp são idempotentes pelo id da mensagem. O job de enfileiramento reutiliza a outbox do RF17: dois dias após `KIT_SENT`, enquanto essa etapa continua atual e o opt-in está vigente, cria um único lembrete de continuidade com payload mínimo e chave idempotente, sem representar agendamento ou confirmação. A finalidade vem da migration `20260916190000_add_reminder_consent_purpose`, aplicada no Supabase cloud em 16 de setembro de 2026; as migrations do item `REMINDER` também foram aplicadas no mesmo dia.
- A suíte completa passa contra o Supabase cloud com 539 testes em 67 arquivos: 459 unitários e 80 de integração, incluindo os testes da outbox e do consentimento de lembretes.

### Atualização de 16 de setembro de 2026 — job de lembretes

O job de enfileiramento reutiliza a outbox do RF17: dois dias após `KIT_SENT`, enquanto essa etapa continua atual e o opt-in de lembretes está vigente, cria um único item `REMINDER` com payload mínimo e chave idempotente. A data é somente referência temporal; a mensagem não representa agendamento ou confirmação. As migrations `20260916193000_add_reminder_outbox_kind` e `20260916193100_add_reminder_outbox_payload` foram aplicadas no Supabase cloud em 16 de setembro de 2026, separadamente e nessa ordem; a entrega real continua dependendo da infraestrutura e dos templates da Meta.

### Atualização de 16 de setembro de 2026 — handoff humano

O fluxo local registra `HUMAN_HANDOFF` quando a nutriz pede explicitamente para falar com a equipe do Lactare. O mesmo chat do WhatsApp é mantido, o bot fica pausado e a resposta diferencia o horário de atendimento de segunda a sábado, das 9h às 18h, no horário de Brasília. Fora da janela, o pedido permanece registrado para o próximo expediente, sem prazo de resposta prometido; “menu” é a saída explícita para retomar o autoatendimento. A migration `20260916200000_add_human_handoff_step` ainda precisa ser aplicada no Supabase cloud. A integração do atendente e a infraestrutura real da Meta continuam pendentes.

### 9.2 Funcionalidades parciais ou incompatíveis com o escopo atualizado

- **Elegibilidade operacional:** o produto verifica se o CEP ou município pertence à área configurada e indica elegibilidade geográfica para coleta domiciliar gratuita segundo o Mapa do Leite; a confirmação da modalidade e da logística continua dependendo do Lactare.
- **Cadastro com LGPD:** o bloqueio de consentimento existe, mas `/privacidade` e `/termos` ainda retornam 404 e precisam ser publicados.
- **Métricas:** a segmentação combinável por região, status atual e origem, os sinais observáveis de alcance, os cliques por canal e o funil progressivo do `JourneyStatus` estão implementados. “Sem avanço” identifica o ponto atual entre etapas e não prova desistência. Ainda faltam retenção, adesão a lembretes, recorrência de doações confirmadas, indicação própria e velocidade até a primeira doação.
- **Tracking de contato:** o evento novo mede os canais diretos do Lactare, já está gravando e alimenta total, janela de 30 dias e distribuição por canal no painel; o evento antigo, vinculado a unidades, continua aposentado. Como os eventos novos são anônimos, os números permanecem globais e não são segmentados por região ou status.
- **Chatbot:** menu, perguntas frequentes, elegibilidade, orientação, cadastro opcional, retomada por status, ativação ou cancelamento de lembretes e handoff humano local estão implementados. O handoff exige pedido explícito, continua no mesmo chat, pausa o bot e direciona para a equipe do Lactare de segunda a sábado, das 9h às 18h, no horário de Brasília; fora desse horário, o pedido permanece registrado para a próxima janela, sem prazo de resposta prometido. Avisos de status e lembretes têm consentimentos opcionais separados. O job local de enfileiramento dos lembretes está implementado sem linguagem de agendamento; ainda faltam envio real, vídeo institucional oficial, retirada e reconcessão dos avisos de status, operação humana conectada à infraestrutura da Meta e pós-doação baseado em confirmação legítima. Não há conta Meta, número, templates ou URL pública para a entrega real.
- **Origem do cadastro:** UTMs genéricas são persistidas, mas não existe identificador próprio de indicação nem vínculo de atribuição entre doadoras.
- **Status da jornada:** o RF16 representa as etapas de documento, ficha, exame, kit e confirmação administrativa de doação sem reutilizar `interestStatus`, com histórico append-only, autorização exclusiva para `ADMIN`, atualização transacional e controle de concorrência. A área pessoal apresenta o status e uma linha do tempo reduzida à própria nutriz. A mudança também cria localmente a outbox do RF17 na mesma transação, condicionada ao consentimento específico. A evidência operacional que autoriza a confirmação da doação ainda será definida; até lá, esse marco não autoriza métricas de impacto, indicação ou reconhecimento. Correção ou reabertura continuam sem fluxo específico.

### 9.3 Funcionalidades ainda não implementadas

- RF06: entrega real pela Meta. Opt-in, cancelamento e regra do job de enfileiramento já estão implementados; o job não cria nem confirma agendamento.
- RF12: cartão de impacto após confirmação legítima da doação.
- RF13: mensagem pronta de encaminhamento com link de indicação.
- RF14: reconhecimentos por status na área pessoal.
- RF15: atribuição específica de novos cadastros por indicação.
- RF17: retirada e reconcessão do opt-in e entrega real por template aprovado da Meta. A base transacional, o processador e o simulador estão implementados, e a migration da outbox está aplicada no Supabase cloud.
- Migration `20260916210000_add_nutriz_personal_area`: aplicar e registrar no Supabase cloud antes de usar os novos registros pessoais no ambiente compartilhado.
- Páginas de Política de Privacidade e Termos de Uso, adiadas pelo time para depois desta entrega.
- RLS, rate limiting distribuído e proteção anti-spam, também adiados, mas ainda obrigatórios antes de exposição pública.
- Validação operacional de e-mail e WhatsApp, caso exigida pelo Lactare.
- Ativação real do chatbot na Meta.

### 9.4 Validações externas pendentes

- Confirmar com o Lactare se a coleta domiciliar gratuita é uniforme para todos os 30 municípios do Mapa do Leite ou se varia conforme distância e logística.
- Definir quem e como confirma uma doação no NutriLink antes de gerar cartão de impacto, atualizar status ou contar recorrência.
- Validar a redação jurídica da Política de Privacidade, dos Termos de Uso e dos consentimentos.

### 9.5 Ordem recomendada de implementação

1. Implementar retirada e reconcessão do opt-in de avisos na área autenticada e no chatbot; o modelo append-only já suporta os dois eventos.
2. Ligar a entrega real dos lembretes e a operação humana do handoff à infraestrutura da Meta.
3. Completar o dashboard com retenção e os segmentos que dependem de lembretes, indicação e confirmação legítima de doação. Alcance observável, cliques de contato e funil do `JourneyStatus` já estão implementados.
4. Definir a confirmação de doação e, depois disso, implementar cartão, mensagem de indicação e reconhecimentos.
5. Publicar Privacidade e Termos, aplicar RLS e concluir rate limiting distribuído e proteção anti-spam antes de qualquer exposição pública. O time decidiu executar esse bloco por último, mas ele permanece bloqueador de publicação.
6. Ativar a integração real com a Meta somente quando houver conta, número, templates e URL pública.

### 9.6 Risco de adoção do status da jornada

RF16 e RF17 só entregam valor se a equipe do Lactare atualizar o status de cada nutriz de forma consistente. Sem esse hábito operacional, a notificação não será disparada e a nutriz continuará sem acompanhamento. O compromisso, a responsabilidade e o tempo operacional dessa atualização devem ser validados com a equipe do Lactare antes de priorizar a implementação.

### 9.7 Fora do escopo atual

- Diretório nacional próprio de bancos da rBLH.
- Agendamento ou confirmação automática de coleta.
- Triagem clínica ou armazenamento de detalhes de saúde. Somente o status categórico informado pelo Lactare faz parte do escopo.
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

#### Como a consulta por CEP funciona

O CEP informado é validado localmente e enviado ao endpoint interno `POST /api/coverage`. O servidor consulta o ViaCEP, usa somente os campos de município e UF e compara o resultado com os municípios ativos administrados no NutriLink. O CEP não é persistido nem enviado ao tracking. CEP inexistente, formato inválido e indisponibilidade do provedor têm respostas diferentes. A consulta possui timeout e rate limit local; o limitador deve ser distribuído antes de exposição pública em múltiplas instâncias.

#### Tratamento da base nacional já existente

O repositório contém uma base nacional legada da rBLH, criada antes desta decisão de escopo. Ela não representa o produto-alvo, não deve continuar sendo expandida e já foi isolada das páginas, APIs e menus ativos. Os registros e o modelo interno foram preservados até que uma remoção futura possa ser feita por migration segura e auditável. Esta decisão não autoriza apagar dados sem análise de impacto e plano de reversão.

### A.6 Por que o cadastro existe, mas é opcional

O cadastro não é necessário para a verificação básica de elegibilidade. Ele viabiliza a continuidade da jornada entre WhatsApp e web, o envio de lembretes para quem der opt-in, métricas reais de conversão e retenção e o registro de consentimento exigido pela LGPD.

### A.7 Como funciona e deverá evoluir a segmentação por região e perfil

O desafio lista “segmentação básica por região ou perfil” como diferencial. O dashboard implementa as duas dimensões como filtros separados e combináveis: sub-região, estágio administrativo da jornada e origem UTM. Ao combinar, por exemplo, “ABC + doação registrada + WhatsApp”, cartões, evolução mensal e distribuições passam a usar exatamente o mesmo conjunto de nutrizes.

#### Dimensão 1 — Região

Em vez de apresentar somente 30 municípios isolados, os municípios do Mapa do Leite são agrupados nas sub-regiões da Região Metropolitana de São Paulo:

| Sub-região | Municípios do Mapa do Leite |
|---|---|
| Oeste | Itapevi, Barueri, Carapicuíba, Cotia, Jandira, Osasco, Pirapora do Bom Jesus, Santana de Parnaíba e Vargem Grande Paulista |
| Sudoeste | Embu das Artes, Embu-Guaçu, Itapecerica da Serra e Taboão da Serra |
| ABC | Diadema, Mauá, Ribeirão Pires, Rio Grande da Serra, Santo André, São Bernardo do Campo e São Caetano do Sul |
| Norte | Caieiras, Cajamar e Francisco Morato |
| Leste / Alto Tietê | Arujá, Ferraz de Vasconcelos, Guarulhos, Itaquaquecetuba, Poá e Suzano |
| Capital | São Paulo |

#### Dimensão 2 — Perfil

Os recortes de comportamento devem ser calculados a partir dos dados coletados no fluxo normal, sem exigir perguntas adicionais somente para segmentação. Nesta versão, somente dimensões sustentadas por dados existentes são exibidas:

| Campo implementado | Valores atuais |
|---|---|
| Estágio administrativo da jornada | cadastrada/interessada / em contato / doação registrada / sem estágio definido |
| Origem UTM do cadastro | WhatsApp / site / outras origens / não informada |

O RF16 amplia o estágio administrativo com categorias operacionais explícitas: cadastrada, documento enviado, ficha recebida, exame agendado, exames feitos, aguardando resultado, apta, não apta, kit enviado, kit entregue, doação confirmada e apta a doações recorrentes. Nenhum valor anterior foi removido. Os novos marcos são caminhos progressivos opcionais para preservar históricos e fluxos anteriores; “não apta” continua sendo uma saída sem avanço automático. Essa dimensão é registrada somente por usuários `ADMIN`, com histórico append-only e sem detalhes clínicos. A confirmação da doação é provisoriamente registrada pelo admin, enquanto a evidência operacional que autoriza esse registro permanece pendente. O dashboard usa `journeyStatus` no filtro e na distribuição; o funil acumulado mantém suas etapas consolidadas e contabiliza os novos marcos intermediários sem inferir fatos não registrados. `interestStatus` permanece apenas como legado.

A sub-região é obtida relacionando a UF e a cidade cadastradas pela nutriz com `service_municipalities`. A relação considera também municípios inativos, preservando a classificação histórica caso uma cidade deixe de fazer parte da cobertura operacional. Cadastros de outras localidades aparecem apenas no agregado “fora da Grande SP ou sem correspondência”; o painel não expõe a cidade individual nesse bloco.

Os seguintes recortes continuam planejados porque ainda não há eventos ou campos próprios que permitam calculá-los com segurança:

| Campo | Exemplos de valor |
|---|---|
| Adesão a lembretes | ativou e voltou / ativou e não voltou / nunca ativou |
| Recorrência de doação | primeira doação / recorrente |
| Origem por indicação própria | campanha / indicação / orgânico |
| Velocidade até a primeira doação | rápida / lenta / não doou |

Esses valores não são inferidos de agendamentos legados, preferência de contato ou ausência de UTM. Quando os eventos existirem, continuarão como campos separados e combináveis. Com uma base pequena, recortes excessivamente específicos não devem virar gráficos padrão.

### A.8 Por que o incentivo ao compartilhamento não usa recompensa material

O crescimento por compartilhamento precisa respeitar as restrições do setor. A doação de leite humano é protegida pela NBCAL e pelas diretrizes da rBLH e da Anvisa contra associações com vantagem material. Por isso, o NutriLink não adota recompensa financeira, cupom ou modelo “indique e ganhe”.

O incentivo será simbólico e emocional:

1. **Cartão de impacto compartilhável:** após uma doação ser legitimamente confirmada por uma fonte operacional definida com o Lactare, o sistema gera uma imagem simples, sem alegação clínica individual não rastreável, pronta para status ou story.
2. **Mensagem de encaminhamento pronta:** um botão gera um texto acolhedor e um link de indicação para a nutriz compartilhar.
3. **Reconhecimento por status:** títulos simbólicos aparecem na área pessoal conforme regras objetivas, como primeira doação, recorrência ou indicação convertida.

Se o link carregar um identificador de indicação, o campo de origem poderá registrar quantos cadastros novos vieram de outra doadora. O identificador não deve expor dados pessoais nem vincular recompensa material.

### A.9 Por que perguntamos à nutriz somente o que ela realmente sabe

O processo real do Lactare inclui etapas que têm fontes diferentes. Depois do cadastro, a nutriz preenche uma ficha de saúde e realiza um exame de sangue coletado em casa pelo laboratório parceiro Fleury. O resultado é enviado ao Lactare e avaliado por um profissional de saúde. Não existe integração técnica entre Fleury e NutriLink, e o sistema não participa dessa decisão.

O caminho do dado é explícito:

1. A coleta, o laudo e a avaliação clínica acontecem fora do NutriLink.
2. Um profissional do Lactare decide se a nutriz está apta.
3. Depois da avaliação, a equipe registra manualmente no painel somente uma categoria de status, como “aguardando resultado”, “apta” ou “não apta”.
4. O NutriLink registra a mudança de forma auditável e envia automaticamente uma notificação pelo WhatsApp, sem expor detalhes clínicos.

Cada fato do processo tem um responsável. Fatos que somente o Lactare conhece — ficha recebida, exame agendado, resultado avaliado, contato realizado ou kit entregue — são atualizados pela equipe no painel e não devem ser perguntados à nutriz. Fatos que somente a nutriz conhece — se recebeu a visita para entrega do kit, se tem leite disponível ou se quer ativar lembretes — podem ser perguntados diretamente a ela.

O sistema guarda apenas o status categórico necessário para dar transparência à jornada. Não guarda tipo de exame, valores, laudo, diagnóstico ou motivo de reprovação. Se uma nutriz marcada como “não apta” quiser compreender o motivo, o atendimento acontece diretamente com a equipe médica do Lactare.

O módulo local de acompanhamento hoje pergunta se a nutriz conseguiu agendar uma visita. Essa pergunta deve ser redimensionada para verificar se ela recebeu a visita da equipe para entrega do kit. A arquitetura de máquina de estados e registro autodeclarado pode ser reaproveitada, mas o texto e a semântica precisam respeitar quem é a fonte de cada informação.

Essa funcionalidade depende de disciplina operacional: sem atualização consistente dos status pela equipe do Lactare, a nutriz não recebe os avisos e o produto reproduz a falta de acompanhamento que pretende resolver.

### A.10 Funcionalidades da Minha Área inspiradas em apps de maternidade

As funcionalidades abaixo foram incluídas como evolução de menor prioridade que elegibilidade, status e lembretes. A inspiração vem de aplicativos de amamentação e maternidade, mas o NutriLink mantém o foco na jornada de doação e nos limites operacionais do Lactare:

1. **Registro pessoal de extração/ordenha:** a nutriz pode registrar data, hora e volume para uso próprio. Um volume acumulado pode gerar uma sugestão informativa para avisar a equipe do Lactare; nunca aciona ou confirma uma coleta.
2. **Exportação do histórico em PDF:** a nutriz pode baixar seu histórico de doações como registro pessoal. O arquivo deve conter somente dados pertencentes à própria nutriz.
3. **Registro opcional de bem-estar:** após uma doação, a nutriz pode registrar como se sentiu usando opções simples. Esse registro não é diário clínico, avaliação de saúde nem ferramenta terapêutica.
4. **Conteúdo educativo por estágio:** a Minha Área pode destacar conteúdos adequados ao status atual, como orientações para quem aguarda resultado ou para quem já está em doações recorrentes. A sugestão não pode inferir diagnóstico ou substituir orientação do Lactare.

Esses recursos não alteram a decisão de não oferecer agendamento. Datas e volumes são registros da nutriz ou referências informativas; qualquer coleta, visita ou atendimento continua sendo combinado diretamente com a equipe do Lactare.

## Anexo B — Casos de Uso e Casos de Teste

### B.1 Casos de Uso

| UC | Ator | Descrição |
|---|---|---|
| UC01 | Nutriz | Verificar elegibilidade por CEP ou município. |
| UC02 | Nutriz | Consultar a área de atuação do Lactare. |
| UC03 | Nutriz | Ser informada quando está fora da área de cobertura. |
| UC04 | Nutriz | Realizar cadastro com consentimento LGPD. |
| UC05 | Nutriz | Ativar ou cancelar lembretes por um opt-in separado e auditável. |
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
| UC16 | Administrador | Atualizar o status categórico da jornada da nutriz, incluindo ficha, exame e kit. |
| UC17 | Sistema | Notificar a nutriz pelo WhatsApp quando seu status de jornada for atualizado. |
| UC18 | Nutriz | Informar se recebeu a visita da equipe para entrega do kit, fato que somente ela pode confirmar. |
| UC19 | Nutriz | Registrar uma sessão de extração de leite, com data, hora e volume. |
| UC20 | Nutriz | Exportar seu histórico de doações em PDF. |
| UC21 | Nutriz | Registrar como se sentiu após uma doação, de forma opcional e não clínica. |
| UC22 | Sistema | Sugerir conteúdo educativo conforme o estágio da jornada da nutriz. |

### B.2 Casos de Teste

| CT | UC relacionado | Cenário | Resultado esperado |
|---|---|---|---|
| CT01 | UC01 | CEP de um município presente no Mapa do Leite | Indica elegibilidade geográfica para coleta domiciliar gratuita e informa que triagem, modalidade, data e disponibilidade dependem de confirmação do Lactare. |
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
| CT14 | UC16 e UC17 | Administrador marca a nutriz como “apta” | O sistema registra a mudança e dispara a notificação pelo WhatsApp sem expor detalhes clínicos. |
| CT15 | UC18 | O sistema formula uma pergunta à nutriz | Nunca pergunta um fato cuja fonte é exclusivamente o Lactare, como resultado de exame ou entrega registrada do kit. |
| CT16 | UC19 | Volume acumulado de extrações atinge um patamar relevante | O sistema exibe uma sugestão informativa para avisar a equipe, sem acionar ou confirmar coleta automaticamente. |
| CT17 | UC20 | Nutriz solicita seu histórico | O sistema gera um PDF somente com os dados da própria nutriz. |
| CT18 | UC21 | Nutriz não quer registrar bem-estar | O sistema permite seguir sem registro e não trata a ausência como problema ou dado clínico. |
| CT19 | UC22 | Status categórico muda de etapa | O conteúdo sugerido corresponde ao estágio registrado, sem inferir condição clínica. |

## Anexo C — Glossário

- **BLH:** Banco de Leite Humano.
- **Nutriz:** mulher que amamenta e é potencial doadora.
- **Triagem:** avaliação de saúde prévia à doação, feita por profissional.
- **Ficha de saúde:** formulário tratado pelo Lactare para a triagem da doadora; seus detalhes clínicos não pertencem ao NutriLink.
- **Kit de coleta:** conjunto de recipientes e materiais entregue na primeira visita, com orientações de higiene, coleta e armazenamento.
- **Status da jornada:** categoria simples que informa a etapa registrada pelo Lactare, como ficha recebida, exame agendado, apta, não apta ou kit entregue, sem detalhes clínicos.
- **rBLH:** Rede Brasileira de Bancos de Leite Humano, coordenada pelo Ministério da Saúde e pela Fiocruz.
- **RLS:** Row Level Security — controle que restringe o acesso a linhas do banco conforme a identidade e a permissão.
- **MVP:** versão mínima funcional de um produto.
- **LGPD:** Lei Geral de Proteção de Dados Pessoais, Lei nº 13.709/2018.
- **Opt-in:** funcionalidade ativada somente por ação voluntária do usuário.
- **Registro de extração/ordenha:** anotação pessoal de data, hora e volume; não é ordem, reserva ou confirmação de coleta.
- **Bem-estar:** registro opcional e não clínico sobre como a nutriz se sentiu após uma doação.
- **NutriLink:** produto digital desenvolvido para apoiar a jornada da doadora e a operação de relacionamento do Lactare.
- **Lactare:** banco de leite humano da Eurofarma e operação atendida pelo NutriLink.

## Anexo D — Escopo Institucional

### D.1 Eurofarma

A Eurofarma é a empresa que idealizou e financia o Lactare. Não é um hospital, não presta atendimento médico e não administra leite a bebês. Seu papel é institucional: financiamento, infraestrutura e comunicação.

### D.2 Lactare

O Lactare é a unidade operacional do banco de leite. É uma unidade regulada pela Anvisa, segue o Regulamento Técnico para Funcionamento de Bancos de Leite Humano, RDC nº 171/2006, e as normas de estrutura física aplicáveis. Também é formalmente vinculado à rBLH.

O Lactare executa:

- cadastro e triagem da doadora, incluindo ficha de saúde e exame de sangue coletado em casa pelo laboratório parceiro Fleury e avaliado por um profissional do Lactare;
- primeira visita para entrega do kit e orientações, com presença obrigatória da nutriz;
- coletas domiciliares recorrentes dentro da área e das regras operacionais validadas do Lactare, sem exigir a presença da nutriz depois da entrega do kit;
- processamento, incluindo classificação, pasteurização e controle de qualidade;
- armazenamento;
- transferência do leite processado aos hospitais públicos parceiros.

Dados de saúde da nutriz são responsabilidade médica do Lactare. O NutriLink não realiza triagem clínica nem armazena detalhes de ficha, exame ou laudo; recebe somente o status categórico informado manualmente pela equipe depois da avaliação profissional.

### D.3 Hospitais parceiros

O Hospital Geral de Itapevi e o Hospital Geral de Carapicuíba são instituições públicas independentes. Seu papel começa depois que recebem o leite processado: administram o leite ao bebê internado sob prescrição de seus profissionais.

O Lactare e o NutriLink não têm acesso aos dados clínicos do bebê. O vínculo operacional descrito aqui termina na entrega do leite processado.

### D.4 Consequências para o NutriLink

- O NutriLink lida apenas com dados necessários à jornada da doadora: cadastro, elegibilidade, consentimentos, contato, lembretes e status categóricos informados pelo Lactare.
- O status pode comunicar uma decisão já tomada por profissional, mas não inclui tipo de exame, valores, laudo ou motivo clínico e nunca é calculado pelo sistema.
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
18. [ViaCEP — documentação oficial do webservice](https://viacep.com.br/), formato de consulta por oito dígitos e tratamento de CEP inexistente.

> Nota de governança: dados quantitativos, endereços, horários, área de atuação e alegações institucionais devem ser revalidados perto da entrega, pois podem mudar. A data e a fonte da validação devem ser registradas no documento ou no dado administrável correspondente.
