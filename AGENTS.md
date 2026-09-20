# AGENTS.md

## 1. Sobre este arquivo

Este é o guia operacional de qualquer agente de código que trabalhe no projeto NutriLink Digital. Leia-o por completo antes de qualquer tarefa.

Este arquivo é a fonte de verdade para:

- estado técnico atual;
- escopo vigente;
- arquitetura;
- convenções;
- segurança;
- fluxo de trabalho.

O documento detalhado de produto está em [docs/projeto-nutrilink.md](docs/projeto-nutrilink.md). Se uma descrição histórica em issue, commit ou arquivo antigo conflitar com este guia, prevalecem este arquivo e a especificação de produto. A seção 3 deste arquivo é a referência para distinguir o que já existe do que ainda é alvo.

O CLAUDE.md da raiz apenas importa este arquivo por meio de @AGENTS.md. Não duplique estas instruções nem edite CLAUDE.md para registrar decisões.

Atualize este arquivo quando:

- uma decisão arquitetural mudar;
- uma convenção nova for adotada;
- uma funcionalidade mudar de estado;
- uma pendência de segurança for resolvida;
- o escopo do produto for alterado.

## 2. Visão e escopo do produto

NutriLink é a solução digital do Lactare, banco de leite humano da Eurofarma. O objetivo é reduzir as barreiras de informação, elegibilidade, contato e continuidade da jornada de nutrizes na área atendida pelo Lactare, na Grande São Paulo.

O produto tem três frentes:

1. **Chatbot no WhatsApp:** porta de entrada principal para perguntas frequentes, elegibilidade, cadastro opcional, lembretes e pós-doação.
2. **Plataforma web:** conteúdo educativo, elegibilidade por CEP ou município, cadastro, login e área pessoal.
3. **Dashboard administrativo:** gestão da área atendida, atualização categórica da jornada das nutrizes e indicadores de alcance, engajamento, conversão, retenção e adesão a lembretes.

A área pessoal também é o núcleo de relacionamento contínuo previsto no produto: deve evoluir para contemplar histórico de doações, diário pessoal de extração/ordenha, exportação em PDF, reconhecimentos simbólicos, gestão de lembretes, bem-estar opcional e conteúdo educativo sugerido por estágio.

### 2.1 Limites obrigatórios

O NutriLink:

- atende a operação do Lactare;
- pode encaminhar quem está fora da área para um diretório oficial externo da rBLH ou do Ministério da Saúde;
- trata apenas dados necessários à jornada da nutriz, incluindo status categóricos informados pelo Lactare, sem detalhes clínicos;
- usa lembretes opcionais, com consentimento separado;
- pode registrar origem por indicação sem oferecer recompensa material.
- pode oferecer registros pessoais de extração e bem-estar, desde que opcionais, minimizados e não clínicos.

O NutriLink não é:

- diretório nacional próprio de bancos de leite;
- sistema de agendamento ou confirmação automática de coleta;
- sistema de triagem clínica; pode exibir uma decisão categórica já registrada por profissional do Lactare, mas nunca avalia, aprova ou reprova;
- prontuário da nutriz ou do bebê;
- sistema dos hospitais parceiros;
- programa de recompensa material;
- aplicativo móvel nativo.

A combinação de data e horário de uma coleta continua sendo feita diretamente entre a nutriz e a equipe do Lactare. Nenhuma interface pode prometer “coleta confirmada” sem uma fonte operacional real e autorizada.

### 2.2 Escopo institucional

- **NutriLink:** produto digital.
- **Lactare:** banco de leite e operação atendida pelo produto.
- **Eurofarma:** mantenedora institucional do Lactare.
- **Hospitais parceiros:** recebem o leite processado e cuidam dos pacientes; seus dados clínicos ficam fora do escopo.

Não remover a palavra “Lactare” de textos que expliquem cobertura, atendimento ou responsabilidade operacional. NutriLink e Lactare não são nomes intercambiáveis.

## 3. Estado atual do projeto

**Referência desta seção:** 19 de setembro de 2026.

O estado descrito abaixo está integrado à `main` até a PR #55. Isso inclui o RF16 no painel, a jornada segura na área pessoal, o contato oficial do Lactare após cobertura positiva e as gestões administrativas de conteúdos e campanhas. Novos trabalhos devem partir dessa base, sem reabrir os branches `feat-rf16-modelo-jornada`, `feat-contato-lactare`, `feat/admin-conteudos` ou `feat/admin-campanhas` para acrescentar funcionalidades.

MVP em desenvolvimento local. Não há deploy, domínio, staging, produção, CI/CD ou monitoramento.

A esteira funciona com:

- pnpm dev;
- pnpm build;
- pnpm lint;
- pnpm typecheck;
- pnpm format;
- pnpm check;
- pnpm check:validators;
- pnpm test, test:unit, test:integration e test:coverage.

TypeScript estrito está ativo com strict e noUncheckedIndexedAccess. A suíte completa passa contra o Supabase cloud com **689 testes em 102 arquivos** (contagem em 20 de setembro de 2026, já com o fluxo consolidado do chatbot), já com a otimização das consultas do dashboard e a idempotência de entrada dos dois provedores. As migrations `20260916180000_add_notification_outbox`, `20260916190000_add_reminder_consent_purpose`, `20260916193000_add_reminder_outbox_kind` e `20260916193100_add_reminder_outbox_payload` foram aplicadas no Supabase cloud em 16 de setembro de 2026, nessa ordem e separadamente, e registradas em `_prisma_migrations` com o checksum SHA-256 dos arquivos. As migrations anteriores do RF07, RF16, estado conversacional e `service_municipalities` continuam aplicadas.

### 3.1 O que está implementado

- Scaffold Next.js e design system.
- Landing pública, página “Sobre”, conteúdo educativo, style guide e minutas técnicas de Privacidade e Termos em `/privacidade` e `/termos`. Em `/como-funciona`, as categorias do hero expandem prévias locais de artigos por Extração, Armazenamento, Amamentação e Doação; o campo de busca aceita digitação, mas permanece apenas visual e não filtra o acervo. As minutas deixam explícita a pendência de validação institucional e jurídica e não apresentam canal fictício como oficial.
- Página pública de verificação de cobertura por CEP ou município em `/verificar-cobertura`, com os 30 municípios do Lactare agrupados em seis sub-regiões.
- A lista ativa de municípios usada pela página pública, pela API de cidades, pela verificação de CEP e pelo chatbot compartilha um cache de uma hora. Criação e edição no painel invalidam a tag e as superfícies públicas imediatamente; respostas que contêm o CEP informado continuam `no-store`.
- Resolução de CEP pelo ViaCEP em `POST /api/coverage`, seguida da comparação com a lista ativa de `service_municipalities`; o CEP não é persistido.
- Resposta transparente para localização fora da lista, com encaminhamento ao diretório oficial externo da rBLH.
- Contato direto após cobertura positiva, com WhatsApp `+55 (11) 96629-0681`, telefone `(11) 4144-9604` e horário de segunda a sexta, das 7h às 22h. Os canais foram conferidos no site oficial do Lactare em 14 de setembro de 2026; a interface mantém link para a fonte e não representa confirmação de atendimento ou coleta.
- Tracking dos canais oficiais do Lactare (RF07): o clique no WhatsApp ou no telefone do cartão de contato grava um evento anônimo em `contact_channel_clicks` por `POST /api/contact-click`. O evento guarda canal, superfície, campanha de origem e horário; não referencia unidade legada, nutriz, CEP, IP nem referrer. A migration foi aplicada no Supabase cloud em 14 de setembro de 2026.
- Cadastro opcional de nutriz com consentimento obrigatório no formulário.
- Provisionamento da conta da nutriz no Supabase Auth.
- Login, logout, recuperação e redefinição de senha da nutriz.
- Área autenticada da nutriz com status atual da jornada, orientações específicas para cada etapa, identificação da cidade cadastrada e acesso ao verificador de cobertura. A consulta da nutriz não seleciona observações administrativas, responsáveis ou detalhes clínicos.
- UC06 ampliado localmente com diário pessoal de extração/ordenha, soma e exclusão de registros, exportação do histórico próprio em PDF, conteúdo educativo curado pelo estágio e registro opcional de bem-estar após doação confirmada. Ao atingir 500 ml acumulados, a área exibe somente uma sugestão visual para falar diretamente com o Lactare; não cria aviso, solicitação ou confirmação de coleta. As sugestões apontam apenas para seções públicas versionadas do NutriLink e não dependem de uma avaliação clínica. Os registros pessoais não acionam coleta, não substituem orientações do Lactare e não contêm detalhes clínicos. A migration `20260916210000_add_nutriz_personal_area` foi aplicada no Supabase cloud em 16 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; o enum `WellbeingFeeling`, as tabelas `extraction_logs` e `wellbeing_entries`, o CHECK de volume, índices, FKs `CASCADE`, RLS habilitado e as sete policies de propriedade foram conferidos no banco.
- RF15 implementado localmente com link de indicação opaco e estável por nutriz. A Minha Área gera o link para cópia, e um novo cadastro só recebe a atribuição first-touch quando traz um código válido pertencente a uma nutriz ativa; UTMs genéricas continuam separadas e não geram indicação. Não há recompensa material, status automático ou exposição de dados da pessoa indicada. A migration `20260917090000_add_nutriz_referral_links` foi aplicada no Supabase cloud em 17 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; tabela, códigos únicos, FK `SET NULL` do perfil, RLS e policies de propriedade foram conferidos.
- UC14/RF13 implementado localmente na Minha Área: a nutriz recebe uma mensagem pronta, editável e baseada apenas no próprio link opaco de indicação. Ela pode copiá-la ou abri-la pré-preenchida no WhatsApp; o NutriLink não envia mensagens automaticamente, não registra destinatários e não associa a indicação a recompensa material.
- Login, logout, middleware, autorização por role e shell administrativo.
- Dashboard administrativo adaptado para municípios e cadastros de nutrizes, com filtros combináveis por sub-região da Grande São Paulo, status atual de `JourneyStatus` e origem UTM. O mesmo recorte é aplicado aos cartões, à série temporal, às distribuições e ao funil progressivo da jornada; dados pessoais não são exibidos. O painel também apresenta sinais globais de alcance, cliques anônimos por canal, conversão acumulada e cadastros sem avanço registrado entre etapas. Como os cliques não referenciam nutriz nem localização, eles permanecem globais e não respondem aos filtros de região ou status.
- Otimização local do dashboard: região e origem passam a ser dimensões categóricas derivadas e mantidas por triggers, com índices compostos para filtros e períodos. O filtro deixa de carregar perfis e montar listas de ids, os históricos de jornada e consentimento são agregados no PostgreSQL e os seis meses são calculados em uma consulta. Métricas usam sete operações agregadas e gráficos usam duas, sem transferir PII. A migration `20260917120000_optimize_dashboard_queries` foi aplicada no Supabase cloud em 18 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; o enum `RegistrationOrigin`, as colunas derivadas, as três funções, os três triggers, a remoção do índice antigo e os sete índices novos foram conferidos no banco. A carga inicial classificou os perfis existentes sem alterar seus dados.
- Listagem de nutrizes com exposição reduzida de contato e acesso ao detalhe da jornada em `/admin/nutrizes/[id]`.
- Listagem, cadastro e edição dos municípios atendidos em `/admin/municipios`.
- Gestão do acervo educativo em `/admin/conteudos`, com listagem filtrável, criação e edição em Markdown, estados de rascunho ou publicado, slug estável e autoria vinculada ao admin autenticado. O acervo administrativo ainda não alimenta automaticamente a página pública “Como funciona”, que permanece versionada em componentes.
- Gestão de campanhas em `/admin/campanhas`, com busca, filtros, criação, edição, ativação ou desativação e geração de links para rotas públicas internas com `utm_source`, `utm_medium` e `utm_campaign`. A tela preserva parâmetros existentes, vincula a criação ao admin autenticado e não inclui PII na URL. Ela não contabiliza cliques nem cria relação direta entre campanha e cadastro: a atribuição aparece nos indicadores somente quando o cadastro preserva as UTMs do link.
- Migration Prisma da tabela `service_municipalities`, com carga inicial exata dos 30 municípios, gerada, versionada e aplicada no Supabase cloud em 12 de setembro de 2026. Os 30 registros foram conferidos por sub-região e a migration está registrada em `_prisma_migrations`.
- Rotas públicas e administrativas antigas de unidades aposentadas: redirecionam para o fluxo de cobertura; `/api/units` e `/api/track` respondem `410 Gone`.
- Camada de WhatsApp independente de provedor, com adaptadores para a Cloud API da Meta e para o Twilio, webhooks com verificação de assinatura, rate limiting local e simulador com exemplos do fluxo ativo. Credenciais e identificadores de template ficam restritos aos adaptadores. Antes de qualquer efeito, `whatsapp_inbound_messages` reivindica a combinação única de provedor e identificador da mensagem, registra recebimento, conversa e resultado sem corpo ou PII e encerra reentregas sem repetir cadastro, consentimento, transição ou resposta. A Cloud API usa `wamid` e o Twilio usa `MessageSid`; a migration `20260918100000_add_whatsapp_inbound_messages` foi aplicada no Supabase cloud em 18 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo. Antes de aplicar, o SQL foi corrigido: ele declarava `id` e `conversation_id` como `UUID` e os horários como `TIMESTAMPTZ`, enquanto todas as outras tabelas do schema `public` usam `TEXT` (o id é gerado pelo Prisma, não pelo banco) e `TIMESTAMP(3)`. O tipo errado quebrava a FK para `whatsapp_conversations.id`, que é `TEXT`. Tabela, enums, índices e a FK `SET NULL` foram conferidos no banco.
- Adaptador local de teste para a Z-API: `zapi-provider` envia somente `send-text`. As respostas interativas da máquina são degradadas no adaptador para opções numeradas; a conversa grava somente os IDs técnicos da última lista Z-API e converte a próxima resposta `1`, `2`, etc. para o ID correspondente, sem texto, telefone ou outro dado pessoal. A migration `20260919140000_allow_zapi_numeric_reply_options` estende o CHECK do contexto para aceitar exclusivamente esse array técnico (até dez IDs alfanuméricos, `_` ou `-`), mantendo a proibição de campos livres ou PII; ela foi aplicada no Supabase cloud em 19 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo. O CHECK vigente foi conferido no banco: a lista técnica de até dez IDs é aceita, e espaço no ID, décimo primeiro item ou qualquer campo livre são rejeitados. `POST /api/whatsapp/zapi/[secret]` aceita somente callbacks privados `ReceivedCallback`, confere segredo opaco, `instanceId`, formato e a allowlist obrigatória quando `ZAPI_TEST_MODE=true`, e descarta mensagens próprias, grupos, canais, status, edições e mídia antes de reutilizar a máquina de estados e sua idempotência. O segredo é necessário porque a documentação consultada da Z-API não descreve assinatura do callback. A migration `20260919120000_add_zapi_whatsapp_provider` acrescenta `ZAPI` ao enum de entradas idempotentes. A migration `20260919130000_add_zapi_delivery_audit`, aplicada no Supabase cloud em 19 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo, acrescenta `ZAPI` à auditoria de status e grava, na própria entrada idempotente, somente o resultado técnico da resposta reativa, seu id do provedor e código de erro categórico — nunca corpo, telefone ou PII. Se o envio falha, a entrada termina como `FAILED`, sem repetir os efeitos. `POST /api/whatsapp/zapi/status/[secret]` mapeia estados técnicos, incluindo `SENT`, `RECEIVED`, `DELIVERED`, `READ`, `FAILED` e `UNDELIVERED`, para a auditoria append-only. **Decisão vigente:** a Z-API é exclusivamente reativa; a outbox de avisos e lembretes não usa esse adaptador, pois depende de transporte com regra de janela e templates aprovados. O procedimento de túnel e painel está em `docs/zapi-chatbot-reativo.md`.
- Máquina de estados local do chatbot com apresentação e menu, FAQ em duas camadas, elegibilidade por CEP ou município, orientação dentro ou fora da área, cadastro com consentimento, retomada de nutriz cadastrada pelo `JourneyStatus` e encaminhamento transparente aos canais oficiais do Lactare. O CEP não entra no contexto persistido; marketing permanece desligado e lembretes só são ativados por escolha explícita. A migration que amplia `WhatsappConversation` foi aplicada no Supabase cloud em 15 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; o enum com os dez estados, o default `MENU`, as colunas `context` e `misunderstood_count` e os dois CHECKs foram conferidos no banco. Como a tabela estava vazia, nenhuma conversa legada precisou ser convertida. O fluxo foi reescrito em 20 de setembro de 2026 a partir de um documento consolidado — ver "Fluxo consolidado do chatbot" mais abaixo.
- RF16 no painel: `JourneyStatus` separado de `interestStatus`, status atual, detalhe da nutriz, histórico append-only com autor e horário, observação administrativa limitada e transições explícitas. A mudança usa o status anterior como condição de concorrência e atualiza perfil e histórico na mesma transação; falha no histórico reverte o status. A migration foi aplicada no Supabase cloud em 13 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; enum, coluna com default `REGISTERED`, índices, CHECKs, FKs `RESTRICT` e trigger de imutabilidade foram conferidos no banco.
- Extensão do RF16 com quatro marcos adicionais, sem remover os oito anteriores: `DOCUMENT_SENT`, `EXAMS_COMPLETED`, `KIT_SENT` e `DONATION_CONFIRMED`. Somente `ADMIN` registra mudanças. As migrations `20260916120000_expand_journey_status_values` e `20260916121000_expand_journey_status_transitions` foram aplicadas separadamente e em ordem no Supabase cloud em 16 de setembro de 2026 e registradas em `_prisma_migrations` com o checksum SHA-256 dos arquivos. O enum com os doze valores na ordem do schema e o novo CHECK de transições foram conferidos no banco; as sete transições antigas continuam aceitas, atalhos pelos novos marcos são rejeitados e os perfis existentes permaneceram inalterados (o histórico estava vazio). Os testes de integração percorrem o caminho completo pelos novos marcos, exercitam o CHECK diretamente e comparam o enum do banco com `JOURNEY_STATUS_VALUES`. A confirmação de doação continua sendo uma ação administrativa do Lactare e qualquer reconhecimento derivado dela depende exclusivamente desse status categórico registrado, sem alegação clínica ou cálculo de impacto.
- Base do RF17 com consentimento específico para avisos de status no cadastro web e outbox criada na mesma transação da mudança de jornada. Cada histórico gera no máximo um item por chave idempotente; sem opt-in vigente, ele nasce `SUPPRESSED`. O processador usa claim concorrente com lock recuperável, revalida consentimento e soft delete antes do envio, aplica backoff, limita tentativas e grava auditoria append-only de sucesso, nova tentativa, falha ou supressão. `pnpm whatsapp:outbox:sim` exercita sucesso e falhas sem chamar provedor nem imprimir PII. `pnpm whatsapp:outbox:twilio` entrega pela Programmable Messaging API: usa texto livre apenas até 24 horas após a última mensagem recebida e, fora dessa janela, usa os `ContentSid` configurados para avisos de status e lembretes; o `MessageSid` retornado é gravado na tentativa existente. A entrega real requer credenciais, Messaging Service e templates Twilio aprovados. O `POST /api/whatsapp/twilio/status` valida callbacks de ciclo de vida e acrescenta `MessageSid`, status categórico e código de erro, sem PII, em `notification_delivery_status_events`; a tabela é append-only e o vínculo à outbox é opcional. A migration `20260918110000_add_notification_delivery_status_events` foi aplicada no Supabase cloud em 18 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; os dois enums, as sete colunas, os dois índices de consulta, a FK `RESTRICT` para `notification_outbox` e o trigger de imutabilidade foram conferidos no banco. Antes de aplicar, o SQL recebeu a mesma correção de tipos da migration irmã: `id` e `outbox_id` eram `UUID` e `received_at` era `TIMESTAMPTZ`, enquanto o schema `public` usa `TEXT` e `TIMESTAMP(3)`; o tipo errado quebrava a FK, porque `notification_outbox.id` é `TEXT`. Esses eventos permitem evoluir o dashboard para envio, entrega e leitura efetivos sem exibir PII. A migration `20260916180000_add_notification_outbox` foi aplicada no Supabase cloud em 16 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; os seis enums, as três tabelas, CHECKs, FKs `RESTRICT`, índices únicos e os triggers de imutabilidade e proteção contra exclusão foram conferidos no banco.
- Consentimento de lembretes separado dos avisos de status. A nutriz pode optar no cadastro e ativar ou cancelar depois pela área autenticada ou pelo chatbot. A ativação exige uma data de referência de calendário, sem horário; cada mudança acrescenta um evento `GRANTED` ou `WITHDRAWN` ao ledger append-only, com canal, versão da política, referência e horário; reentregas do WhatsApp usam o id da mensagem como chave idempotente. O job de enfileiramento cria uma única mensagem de continuidade dois dias após `KIT_SENT`, usando a data informada apenas como referência do payload e sem semântica de agendamento; a entrega real ainda depende da Meta. A finalidade `REMINDERS_WHATSAPP` vem da migration `20260916190000_add_reminder_consent_purpose`, aplicada no Supabase cloud em 16 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo. As migrations `20260916220000_add_reminder_reference_date` e `20260916221000_add_reminder_reference_step` foram aplicadas separadamente e nessa ordem no Supabase cloud em 17 de setembro de 2026 e registradas em `_prisma_migrations` com o checksum SHA-256 dos arquivos.
- UC15: reconhecimentos simbólicos cumulativos são atribuídos na mesma transação da mudança de jornada e exibidos na área pessoal. As regras cobrem jornada iniciada, aptidão para seguir, kit entregue, primeira doação registrada e continuidade registrada; não há reconhecimento de indicação sem evento próprio. A migration `20260916230000_add_nutriz_recognitions` inclui a tabela, unicidade por nutriz/tipo e backfill histórico, e foi aplicada no Supabase cloud em 17 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; o backfill gerou somente `JOURNEY_STARTED` para os perfis existentes, porque o histórico estava vazio.

### 3.2 Situação dos requisitos funcionais

| Requisito | Situação atual |
|---|---|
| RF01 — elegibilidade por CEP | **Implementado.** O ViaCEP resolve município e UF, e a lista ativa indica elegibilidade geográfica para coleta domiciliar gratuita segundo o Mapa do Leite, uniforme nos 30 municípios atendidos conforme confirmação do Lactare em 19 de setembro de 2026. A interface não promete confirmação individual de triagem, data ou disponibilidade. |
| RF02 — área atendida | **Implementado no escopo atualizado.** A interface exibe os 30 municípios atendidos; bancos de leite e pontos de coleta não são mais entidades públicas ou administrativas do produto. |
| RF03 — fora da cobertura | **Implementado.** CEP ou município fora da lista recebe explicação e link oficial da rBLH. |
| RF04 — cadastro opcional e LGPD | **Parcial.** O consentimento é obrigatório e as rotas de Privacidade e Termos têm minutas técnicas locais, mas a identificação do controlador e do encarregado, o canal institucional e a redação jurídica ainda dependem de validação da Eurofarma antes de qualquer publicação. |
| RF05 — login da nutriz | **Implementado.** A recuperação por e-mail depende de SMTP. |
| RF06 — lembretes opcionais | **Parcial, consentimento implementado.** Opt-in e cancelamento são separados, opcionais e auditáveis no cadastro, na área autenticada e no chatbot; a ativação registra uma data de referência sem horário e confirma somente a ativação, nunca agendamento. As migrations da referência ainda estão locais, o job de enfileiramento está implementado e a entrega real dos lembretes depende da Meta. |
| RF07 — tracking de contato | **Implementado.** O clique nos canais oficiais do Lactare é gravado como evento anônimo em `contact_channel_clicks`, sem unidade legada e sem CEP ou PII. O tracking antigo por unidade continua aposentado (`/api/track` responde 410). O painel lê o total, a janela de 30 dias e a distribuição por canal. |
| RF08 — painel autenticado | **Implementado.** Inclui checagem de role ADMIN. |
| RF09 — municípios atendidos | **Implementado.** O CRUD administra `service_municipalities` e a tabela existe no Supabase cloud com os 30 municípios. |
| RF10 — indicadores do funil | **Parcial.** O dashboard resume municípios e nutrizes, mede sinais observáveis de alcance, agrega os cliques anônimos de contato, apresenta o funil progressivo do `JourneyStatus` e exibe retorno observável após 30 dias e adesão vigente a lembretes. Os cadastros podem ser segmentados por sub-região, status atual e origem de forma combinável. “Sem avanço” não prova abandono definitivo, o retorno observável não prova retenção definitiva e a adesão mede consentimento, não entrega de mensagem. “Não apta” é uma saída legítima separada. Ainda faltam os segmentos que dependem de confirmação legítima de doação e indicação própria. |
| RF11 — chatbot completo | **Parcial.** Menu, FAQ em duas camadas, elegibilidade, orientação, cadastro (agora com CPF e endereço), retomada por status, contato com o Lactare, gestão do opt-in de lembretes e handoff humano local estão implementados. O handoff é solicitado explicitamente ou disparado após duas tentativas seguidas sem entendimento, mantém o mesmo chat, pausa o bot e considera atendimento de segunda a sábado, das 9h às 18h, no horário de Brasília; fora da janela, a conversa fica aguardando o próximo expediente, sem prazo de resposta prometido. A ativação e a entrega dependem da infraestrutura real da Meta. Continuam pendentes vídeo institucional oficial, entrega real do RF17 e pós-doação baseado em confirmação legítima. Ver "Fluxo consolidado do chatbot" (seção 3) sobre o CPF coletado sem RLS ainda aplicado. |
| RF12 — cartão de impacto | **Não implementado.** |
| RF13 — mensagem de indicação | **Implementado localmente.** A Minha Área apresenta uma mensagem editável com o link opaco próprio da nutriz, permite copiá-la ou abri-la pré-preenchida no WhatsApp. O envio depende sempre da ação da nutriz; não há disparo automático, recompensa material nem exposição de dados de terceiros. |
| RF14 — reconhecimentos | **Implementado localmente.** A área pessoal exibe cinco selos derivados (`lib/journey/badges.ts`) da data de cadastro, das doações confirmadas pelo Lactare e da atribuição de indicação do RF15; doação depende sempre de `DONATION_CONFIRMED` registrado, e a indicação não gera recompensa material nem expõe quem se cadastrou. Os reconhecimentos gravados em `nutriz_recognitions` continuam sendo atribuídos na transição de status como registro interno, sem superfície na interface. |
| RF15 — atribuição por indicação | **Implementado localmente.** Cada nutriz autenticada recebe um link opaco próprio; um novo cadastro com código válido é vinculado para métrica de first-touch, sem recompensa material. A migration de links está aplicada no Supabase cloud. |
| RF16 — status da jornada | **Implementado com doze estados.** O administrador acessa `/admin/nutrizes/[id]`, consulta status e histórico e registra somente a próxima transição válida. A mutação é autorizada por role `ADMIN`, condicional ao status anterior e atômica com o histórico. Quatro marcos adicionais foram acrescentados sem remover os anteriores: documento enviado, exames feitos, kit enviado e doação confirmada. As migrations da extensão estão aplicadas no Supabase cloud desde 16 de setembro de 2026; a doação confirmada continua dependente da definição da evidência operacional. Correção e reabertura continuam sob responsabilidade operacional do admin, sem fluxo específico nesta etapa. Desde 20 de setembro de 2026, `DONATION_CONFIRMED` pode ser registrado mais de uma vez, para que a recorrência real apareça no histórico. |
| RF17 — aviso de mudança de status | **Parcial.** A mudança válida de status cria histórico e outbox atomicamente, com idempotência, consentimento específico, tentativas, backoff, auditoria e simulador local. As migrations da outbox e da auditoria de status de entrega estão aplicadas no Supabase cloud, e não há mais migration pendente de aplicação; a entrega real depende de infraestrutura e templates aprovados do provedor. |
| RF19 — diário pessoal de extração | **Implementado localmente.** A nutriz registra data, hora e volume, consulta soma e sessões recentes e exclui seus próprios registros. A partir de 500 ml acumulados, a área sugere falar diretamente com o Lactare, sem acionar ou confirmar coleta. A migration da área pessoal está aplicada no Supabase cloud. |
| RF20 — exportação do histórico em PDF | **Implementado localmente.** O download é gerado no servidor após o gate da nutriz, com `pdf-lib` (seção 3, "Resumo da jornada em PDF"), e inclui somente seus registros pessoais e as doações confirmadas pelo Lactare. A migration da área pessoal está aplicada no Supabase cloud. |
| RF21 — bem-estar pós-doação | **Implementado localmente.** Após `DONATION_CONFIRMED` ou `RECURRING_DONATION_ELIGIBLE`, a nutriz pode registrar uma opção simples, sem texto livre, e excluir o registro. A migration da área pessoal está aplicada no Supabase cloud. |
| RF22 — conteúdo por estágio | **Implementado localmente.** A área sugere seções públicas versionadas conforme o status categórico atual e não infere condição clínica. O acervo administrativo agora tem CRUD em `/admin/conteudos`, mas permanece desacoplado da página pública e das sugestões por estágio nesta etapa. |

### 3.3 Código e dados legados que não definem mais o escopo

O repositório contém 487 unidades da rBLH em 26 UFs, além de APIs, páginas e CRUDs voltados a essa base nacional. Isso foi desenvolvido antes da decisão Lactare-only.

A partir desta versão, a experiência de unidades está isolada do produto ativo:

- não continuar a carga nacional;
- não tratar a ausência de Sergipe como tarefa de produto;
- não apresentar essa base como escopo oficial do NutriLink;
- não criar funcionalidades novas dependentes do diretório nacional;
- não apagar tabelas, CSVs ou registros sem plano de migração, impacto e reversão;
- não reativar `/buscar`, `/banco-de-leite/*`, `/admin/unidades`, `/api/units` ou o tracking vinculado a unidades;
- preservar os registros e o modelo `Unit` somente como legado interno até existir uma migration de remoção segura e reversível.

O modelo `Appointment` e os estados/colunas antigos de `WhatsappConversation` são legado técnico. A migration do chatbot preserva esses dados, mas o webhook ativo não os lê nem cria novos agendamentos. Eles podem ser migrados ou reaproveitados para lembretes e continuidade da jornada, mas não autorizam linguagem de agendamento, confirmação de visita ou promessa logística. A entrega do kit é confirmada exclusivamente pelo admin do Lactare no painel, na transição `KIT_SENT` → `KIT_DELIVERED`; a nutriz não é perguntada nem altera esse status e apenas visualiza a categoria registrada. Nunca perguntar resultado de exame ou outro fato cuja fonte é o Lactare. A rota `/meu-agendamento` foi mantida por compatibilidade, mas sua interface ativa é “Minha área” e não exibe agendamento.

Não criar preview estático com estado “confirmado” ou lembrete de coleta sem uma fonte operacional legítima. A home e a área da nutriz devem manter linguagem de cobertura e orientação, não de agendamento.

### 3.4 Pendências críticas

- Rate limiting distribuído.
- Proteção anti-spam nos formulários públicos.
- Segmentos comportamentais ainda incompletos: o dashboard agrega o retorno observável e a adesão vigente a lembretes; recorrência, indicação entre doadoras e velocidade até a primeira doação continuam sem eventos próprios completos. A adesão não representa entrega efetiva, que depende da Meta.
- Definição da evidência operacional que autoriza o admin do Lactare a registrar uma doação como confirmada.
- RLS para `nutriz_profiles`, `journey_status_history`, `contact_channel_clicks`, `whatsapp_conversations`, `communication_consent_events`, `notification_outbox` e `notification_delivery_attempts`; a autorização do RF16 já existe na aplicação e o evento do RF07 é anônimo, mas as tabelas continuam sem policies no Supabase. O contexto conversacional contém cidade durante o cadastro e o próprio registro identifica o número de WhatsApp, portanto deve ser tratado como PII. O nome só é solicitado e gravado no perfil depois do consentimento. **Agravado em 20 de setembro de 2026:** `nutriz_profiles.cpf` passou a existir (decisão explícita do time, ver "Fluxo consolidado do chatbot" mais abaixo); é o dado mais sensível do schema até aqui e está sem RLS — e isso coincide com o site já estar publicado em produção (`doeleite.com.br`). Confirmar com o time antes de qualquer demonstração real com números de WhatsApp de verdade.
- Integração real do processador da outbox com templates aprovados da Meta.
- Cartão de impacto e reconhecimento de indicação.
- Conta Meta, número, templates e URL pública para o WhatsApp. Uma conta de provedor capaz de entregar mensagem de sessão livre também é pré-requisito: a conta trial da Twilio recebe, mas não responde (seção 11.1). A conta de teste da Cloud API da Meta também não é opção para a demonstração brasileira: em 19 de setembro de 2026, o envio a um destinatário `+55` retornou `130497` (`Business account is restricted from messaging users in this country`).
- Falha de envio da resposta do chatbot é engolida em silêncio. `sendWhatsappReply` devolve `boolean` e `processInboundWhatsappMessage` ignora o retorno, então a mensagem recebida é marcada `PROCESSED` mesmo quando a resposta não saiu, sem log e sem sinal no banco. Em 18 de setembro de 2026 isso escondeu por bastante tempo uma recusa do provedor; a causa só apareceu ao consultar a API do Twilio. Registrar o resultado do envio, sem PII, antes de ligar a entrega real.
- Validação jurídica e institucional das minutas de Privacidade e Termos, incluindo controlador, encarregado e canal de exercício de direitos, além de RLS das tabelas existentes, continuam obrigatórias antes de exposição pública. As tabelas pessoais `extraction_logs` e `wellbeing_entries` já têm RLS e policies de propriedade aplicadas no cloud.

### 3.5 Validações externas pendentes

- Confirmar com o Lactare se a coleta domiciliar gratuita é uniforme nos 30 municípios ou se varia por logística.
- Definir qual evidência operacional permite ao admin do Lactare registrar uma doação como confirmada; o papel responsável já foi limitado a `ADMIN`.
- Validar com a equipe do Lactare quem atualiza cada status da jornada e se existe capacidade operacional para manter os registros consistentes.
- Validar textos jurídicos e consentimentos.

Até essas respostas existirem, prefira linguagem conservadora. A cobertura uniforme nos 30 municípios foi confirmada pelo Lactare em 19 de setembro de 2026; a interface continua sem prometer triagem, data ou disponibilidade individual.

### 3.6 Próximas entregas recomendadas

1. Implementar retirada/reconcessão do opt-in de avisos na área autenticada e no chatbot; o modelo append-only já suporta os dois eventos.
2. Ligar a entrega real dos lembretes e a operação humana do handoff à infraestrutura da Meta.
3. Evoluir o dashboard com eventos de entrega/adesão efetiva, recorrência e os segmentos comportamentais que dependem de indicação e confirmação legítima de doação. Retorno observável, adesão vigente, alcance, cliques de contato e funil do `JourneyStatus` já estão implementados.
4. Implementar confirmação de doação, cartão de impacto e reconhecimento de indicação somente após definir uma fonte operacional legítima. A mensagem de indicação usa somente o link próprio já atribuído e não depende de confirmação de doação; os reconhecimentos objetivos por status permanecem limitados ao status administrativo registrado.
5. Publicar Privacidade e Termos, aplicar RLS e concluir rate limiting distribuído e proteção anti-spam antes de qualquer exposição pública. O time decidiu executar esse bloco por último, mas ele permanece bloqueador de publicação.
6. Ativar a integração real com a Meta quando a infraestrutura externa existir; o estado conversacional já está aplicado no Supabase e a suíte completa de integração voltou a rodar.

### Atualização da Minha Área (19 de setembro de 2026)

A área pessoal foi reorganizada em seções empilhadas de largura total: jornada, registro de extração, lembretes, histórico de doações, destaques e "Meus dados". O histórico de doações lê apenas as transições `DONATION_CONFIRMED` e `RECURRING_DONATION_ELIGIBLE` já registradas pelo Lactare e concentra a exportação do PDF, que antes vivia num card próprio (`personal-history-card.tsx`, removido). O card de destaque do cartão de impacto existe visualmente com a ação inativa, porque o RF12 continua pendente de uma fonte legítima de confirmação.

O card "Minha jornada" (antes "Sua jornada") passou de quatro para cinco passos — Cadastro, Ficha de saúde, Exame de sangue, Entrega do kit e Doação — e virou um disclosure nativo (`details`/`summary`, sem Client Component). Fechado, ele mostra a régua horizontal e a ação "Ver detalhes"; aberto, troca para a linha vertical das cinco etapas, com a etapa atual marcada e expandida. Dentro dessa expansão ficam agora "Orientações desta etapa" e "Conteúdos para esta etapa", que antes eram dois cards soltos da página (`NutrizJourneyGuidance`, removido de `nutriz-journey-status.tsx`, e `educational-suggestions.tsx`, removido). O conteúdo continua vindo do status categórico já registrado pelo Lactare, por `NUTRIZ_AUTH.area.journey.status[...]` e `getEducationalSuggestionIds`: os cinco passos são apenas um agrupamento de apresentação dos doze `JourneyStatus` e nenhuma etapa não alcançada exibe conteúdo próprio. O aviso de que a visualização não substitui orientações da equipe saiu do estado fechado e agora fecha o conteúdo expandido.

A área também passou a exibir a barra de navegação do site (o `main` segue único na página para não quebrar o alvo do "pular para o conteúdo"). O cabeçalho ficou ciente da sessão na mesma mudança (seção 6.1), o que ligou `logoutNutrizAction` a uma interface pela primeira vez: até então não havia como encerrar a sessão pela navegação. O `Footer` institucional ficou de fora nesta data e passou a ser renderizado na área também a partir de 20 de setembro de 2026 — ver "Rodapé na área da nutriz" mais abaixo.

"Meus dados" é autoatendimento cadastral: a nutriz vê nome, localidade, WhatsApp mascarado e a data do consentimento LGPD, edita nome, cidade e UF por Server Action com lista explícita de campos, e pode excluir a própria conta. A exclusão é soft delete em `nutriz_profiles.deleted_at`, seguida de `signOut` — o gate `getNutrizAccess` já trata esse campo como acesso negado. O WhatsApp não é editável por autoatendimento: ele é único no banco e identifica a nutriz no chatbot. A remoção definitiva dos registros continua sendo procedimento operacional, pendente de definição de retenção.

O card "Destaques" (`personal-highlights.tsx`) tinha um terceiro item estático, "Aumentando a produção", que linkava sempre para o mesmo artigo em `/como-funciona`, duplicando o que "Conteúdos para esta etapa" já mostra dentro do disclosure "Minha jornada" a partir de `getEducationalSuggestionIds`. Em 20 de setembro de 2026 esse card estático foi removido; "Destaques" passou de três para dois cards ("Seus selos" e "Cartão de impacto"), e a chave `highlights.content` saiu de `NUTRIZ_AUTH.area.personal`. Conteúdo sugerido por estágio continua existindo apenas em um lugar: dentro de "Minha jornada".

"Seus selos" virou "Meus selos" (`my-badges-card.tsx`, extraído de `personal-highlights.tsx`) e, na mesma data, ganhou o mesmo padrão de disclosure nativo (`details`/`summary`, sem Client Component) de "Minha jornada": fechado, mostra só a última conquista e a ação "Ver selos"; aberto, lista cinco selos lado a lado, com o contador "X/5 conquistados até agora". "Cartão de impacto" permanece ao lado; a grade ganhou `md:items-start` e o card do impacto perdeu o `h-full`, senão ele esticava até a altura de "Meus selos" aberto e deixava um vazio grande.

Os selos exibidos passaram a ser **derivados**, e não os cinco `NutrizRecognitionKind` gravados em `nutriz_recognitions`. `lib/journey/badges.ts` calcula, a partir da data de cadastro, das transições `DONATION_CONFIRMED` do histórico append-only e da atribuição de indicação do RF15: "Primeiro passo" (cadastro), "Presente de vida" (1ª doação), "Coração generoso" (2ª doação), "Fonte que não seca" (5ª doação) e "Corrente do bem" (algum cadastro atribuído ao link próprio). Selo pendente que exige mais de uma doação mostra progresso ("1 de 2 doações"); os demais mostram "Ainda não conquistado". A escolha por derivar em vez de gravar tem dois motivos: contagem de doações e de indicação não cabe numa linha booleana por tipo, e o histórico append-only já é a fonte — um segundo estado poderia divergir dele. Nenhuma migration foi necessária.

`nutriz_recognitions` continua sendo escrita na transição de status (RF14/UC15, com unicidade por nutriz e tipo) e segue como registro interno da jornada, mas deixou de alimentar a interface: a leitura saiu de `getNutrizPersonalAreaData` e a copy `NUTRIZ_AUTH.area.recognitions` foi removida. "Pronta para seguir" e "Kit recebido" deixaram de aparecer como selo — esses marcos continuam visíveis em "Minha jornada". Se um dia os selos precisarem ser persistidos com este conjunto, serão novos valores de enum mais migration e lógica de atribuição.

"Corrente do bem" é o único selo sem data: ela seria o dia do cadastro de outra pessoa, e o RF15 atribui a indicação sem expor dados de quem foi indicada. `hasNutrizReferredSignup` responde apenas se existe algum cadastro ativo atribuído ao link — sem identidade, quantidade ou data. O dourado do estado conquistado entrou como tokens (`--achievement*` em `globals.css`), segunda exceção controlada à paleta azul depois do verde do WhatsApp; o estado também aparece em texto, nunca só na cor. A descrição de "Presente de vida" não afirma que a doação chegou a um bebê específico: o produto não tem essa fonte, e a regra 9 da seção 13 proíbe alegação de impacto individual.

### Doações repetidas no histórico (20 de setembro de 2026)

Doar é um evento que se repete; o status da jornada é um estado só. Como `DONATION_CONFIRMED` era alcançável uma única vez e `RECURRING_DONATION_ELIGIBLE` era terminal, o admin do Lactare conseguia registrar apenas a primeira doação da nutriz, e o "Histórico de doações" da área pessoal nunca podia crescer. O histórico append-only continua sendo a fonte.

O mapa de transições passa a aceitar `DONATION_CONFIRMED` → `DONATION_CONFIRMED` e `RECURRING_DONATION_ELIGIBLE` → `DONATION_CONFIRMED`. Nenhuma transição anterior foi removida, e os atalhos recusados continuam recusados: `RECURRING_DONATION_ELIGIBLE` → `KIT_DELIVERED`, por exemplo, segue rejeitado. No painel, a opção que repete o status atual aparece marcada como "registrar nova ocorrência", para não ser confundida com o status em vigor. Os reconhecimentos usam `skipDuplicates`, então a segunda doação não duplica `FIRST_DONATION`, e cada item da outbox continua com chave idempotente própria, derivada do id do histórico.

A área pessoal deixou de contar `RECURRING_DONATION_ELIGIBLE` como doação: aquele status é aptidão registrada para continuar doando, e exibi-lo como "coleta confirmada" transformava aptidão em coleta que talvez não tenha acontecido. Só `DONATION_CONFIRMED` entra na lista.

A migration `20260920030000_allow_repeated_donation_records` reescreve o CHECK de transições com as mesmas regras e foi aplicada no Supabase cloud em 20 de setembro de 2026, registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo. O teste de integração exercita o CHECK direto no banco com os dois caminhos novos e com a recusa acrescentada.

Continua pendente, como antes, a definição da evidência operacional que autoriza o admin a registrar uma doação como confirmada. Esta mudança não cria essa evidência: ela apenas deixa de impedir o segundo registro legítimo.

### Resumo da jornada em PDF reescrito com pdf-lib (20 de setembro de 2026)

O PDF exportado pela nutriz (RF20) era texto corrido: uma linha por registro, sem tabela, sem cor, gerado por um escritor de PDF artesanal deste repositório (bytes de objeto, tabela xref e position matrix montados à mão). Ele funcionava, mas não diferenciava visualmente dado autodeclarado (extração, bem-estar) de dado registrado pelo Lactare (doação), e a quebra de linha por contagem de caractere — não por largura real — é a mesma classe de bug do PDF de referência usado para orientar esta reescrita, onde título e parágrafo de abertura ficam sobrepostos.

`lib/pdf/nutriz-history.ts` foi reescrito sobre **pdf-lib** (nova dependência: pura TypeScript, sem binário nativo, mede texto de verdade com `font.widthOfTextAtSize`). O documento passou a ter: cabeçalho com a marca, título e um parágrafo introdutório com espaçamento fixo entre os dois; nome da nutriz; um selo — "Doadora desde {data}" quando existe ao menos uma `DONATION_CONFIRMED`, ou "Jornada iniciada em {data}" caso contrário, para nunca chamar de doadora quem ainda não doou; tabela de sessões de extração (Data, Hora, Volume); tabela de doações confirmadas (Data da doação, Registrado por — sempre "Equipe do Lactare", porque só `ADMIN` registra a transição); uma caixa de resumo com o total de doações e o tempo como doadora; uma tabela de bem-estar, só quando há registro; e uma nota de rodapé "Sobre este documento". A paginação nunca corta uma linha de tabela: quando uma linha não cabe, a página vira e o cabeçalho da tabela é redesenhado.

A lista completa de status da jornada que existia no gerador anterior saiu do documento — o histórico completo já fica em "Minha jornada" e em "Linha do tempo da sua jornada" na própria área; o PDF ficou focado no que a nutriz leva para a entrega do kit: extração, doações e bem-estar. A tradução da sensação de bem-estar (`GOOD`/`OK`/`TIRED` → "Bem"/"Tudo bem"/"Cansada") passou a vir de `NUTRIZ_AUTH.area.personal.wellbeing.choices` pela primeira vez — o gerador anterior gravava o valor bruto do enum no PDF.

As cores usadas no documento são os valores hexadecimais já documentados nos comentários de `app/globals.css` (`--primary` #3A7AB8, `--secondary` #D6EAFF etc.), convertidos à mão para frações 0–1: um content stream de PDF não lê variável CSS, então se a paleta do produto mudar, este arquivo precisa mudar junto. A moldura arredondada do selo, na referência, virou um retângulo reto — `pdf-lib` não tem canto arredondado nativo em `drawRectangle`, e reproduzi-lo com `drawSvgPath` exigiria acertar a inversão do eixo Y do SVG à mão, o mesmo tipo de erro geométrico que motivou a reescrita.

`buildNutrizHistoryPdf` passou a ser assíncrona (`Promise<Uint8Array>`, porque `pdf-lib` embute fontes e salva de forma assíncrona) — `GET /meu-agendamento/historico` e os testes foram ajustados. Os testes trocaram de estratégia: como `pdf-lib` comprime o content stream com Flate, `tests/unit/nutriz-history-pdf.test.ts` descomprime cada `stream…endstream` com o `zlib` do próprio Node (sem dependência nova) e decodifica as strings hex `<...> Tj` de volta para texto, para inspecionar o conteúdo gerado.

### CTAs de WhatsApp e domínio de indicação (20 de setembro de 2026)

Dois ajustes visuais na área da nutriz. Primeiro, "Falar com a equipe do Lactare" (Minha Área) e "Abrir no WhatsApp" (indicação, RF13) passaram do token `--whatsapp` (verde de marca escurecido, pensado para passar WCAG AA com texto branco) para um novo token `--whatsapp-brand` (`#25D366` exato, com texto branco), a pedido explícito da equipe — mesmo sabendo que o contraste de texto branco sobre a cor pura reprova AA (~2:1). `--whatsapp` continua sendo o padrão do resto do produto (`content-faq.tsx`, `unit-detail-actions.tsx`); a exceção fica restrita aos dois CTAs da área da nutriz e ao card de unidade da busca legada (`unit-card-actions.tsx`), que também passou a usar `--whatsapp-brand`. `WhatsappIcon` (`components/shared/whatsapp-icon.tsx`) embute o glifo de marca do WhatsApp como SVG, porque o `lucide-react` só tem ícones genéricos.

Segundo, o link de indicação (RF15) e a mensagem pronta para compartilhar (RF13) passaram a usar um domínio fixo, `https://doeleite.com.br` (`lib/constants/site.ts`, `SITE_ORIGIN`), no lugar de `window.location.origin`. Isso não é um deploy real: o ambiente continua sendo um MVP local sem domínio próprio (seção 3), e `SITE_ORIGIN` só afeta o texto do link e da mensagem compartilháveis — a aplicação em si não está hospedada nesse domínio. A troca também simplificou `NutrizReferralCard`: como `SITE_ORIGIN` não depende de `window`, o link e a mensagem já saem corretos no primeiro render, sem o `useEffect` que antes trocava o caminho relativo pela URL absoluta depois do mount.

### Remoção da "Linha do tempo da sua jornada" (20 de setembro de 2026)

O card "Linha do tempo da sua jornada" (`NutrizJourneyTimeline`, `components/nutriz/nutriz-journey-status.tsx`) foi removido da Minha Área a pedido da equipe. Ele era a última seção da página e mostrava, em lista bruta, cada transição append-only do histórico da jornada com sua data — redundante com o disclosure "Minha jornada" (`NutrizJourneyProgress`), que já expõe a etapa atual e, ao abrir, a linha vertical das cinco etapas de apresentação com data-a-data equivalente para quem acompanha pelo agrupamento em 5 passos.

O componente não tinha outro uso, então o arquivo inteiro foi apagado, junto com `NUTRIZ_AUTH.area.journey.timeline` e o campo `timelineDescription` dos doze status em `NUTRIZ_AUTH.area.journey.status` — texto que só essa tela consumia. Nenhuma migration ou consulta muda: o histórico append-only (`journeyHistory`) continua sendo lido normalmente por `NutrizJourneyProgress`, `DonationHistoryCard` e pelo PDF exportável (RF20). A referência a "linha do tempo de categorias e datas" saiu do resumo da seção 3.1.

### Rodapé na área da nutriz (20 de setembro de 2026)

O `Footer` institucional passou a ser renderizado também em `app/(nutriz)/meu-agendamento/layout.tsx`, a pedido do time — decisão que substitui a de 19 de setembro de 2026 (seção "Atualização da Minha Área") de manter a área pessoal sem rodapé. A mudança ficou só no layout: `Footer` entra depois do `main`, então o `main#main-content` continua único na página e o alvo do "pular para o conteúdo" não é afetado. Nenhum outro comportamento da área muda.

### Atualização do job de lembretes (16 de setembro de 2026)

O job de lembretes foi implementado sobre a mesma outbox do RF17. Ele enfileira uma única mensagem de continuidade dois dias após `KIT_SENT`, somente se esse ainda for o status atual e houver opt-in vigente. A data é apenas referência temporal; a mensagem não cria nem confirma agendamento. O item `REMINDER` usa payload mínimo, chave idempotente e o processador, retentativas e auditoria existentes. As migrations `20260916193000_add_reminder_outbox_kind` e `20260916193100_add_reminder_outbox_payload` foram aplicadas separadamente e nessa ordem no Supabase cloud em 16 de setembro de 2026 e registradas em `_prisma_migrations` com o checksum SHA-256 dos arquivos. A separação garante que o valor `REMINDER` seja confirmado antes de aparecer no CHECK. No banco foram conferidos o enum, a coluna `payload` JSONB opcional e o novo `notification_outbox_payload_check`: aviso de status exige histórico e nenhum payload; lembrete exige payload e nenhum histórico.

### Atualização do handoff humano (16 de setembro de 2026)

O fluxo local agora registra `HUMAN_HANDOFF` quando a nutriz pede explicitamente para falar com a equipe do Lactare. O mesmo chat do WhatsApp é mantido, o bot fica pausado e a resposta diferencia atendimento dentro e fora da janela de segunda a sábado, das 9h às 18h, no horário de Brasília. “Menu” é a saída explícita para retomar o autoatendimento. A migration `20260916200000_add_human_handoff_step` foi aplicada no Supabase cloud em 17 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo. A integração do atendente e a infraestrutura real da Meta continuam pendentes.

### Paridade do handoff humano no adaptador Twilio (18 de setembro de 2026)

`POST /api/whatsapp/twilio` reaproveita a mesma `processInboundWhatsappMessage` e a mesma máquina de estados do webhook da Meta, então a pausa de `HUMAN_HANDOFF` já valia para os dois provedores desde que a máquina de estados foi compartilhada. Esta atualização acrescenta cobertura de teste dedicada que comprova a paridade em vez de assumi-la: `tests/unit/whatsapp-twilio-route.test.ts` cobre assinatura inválida ou ausente, reentrega idempotente pelo `MessageSid`, o pedido explícito de handoff pelo mesmo número, o bot permanecendo mudo durante a pausa e a retomada do autoatendimento ao escrever “menu”. `tests/unit/whatsapp-conversation.test.ts` ganhou os casos equivalentes na máquina de estados pura (retomada por “menu” e permanência pausada para qualquer outro texto). Nenhum comportamento de produção mudou; a decisão entre Twilio Conversations/Flex e uma fila/tela administrativa própria para a operação humana completa (seção 11.2) continua em aberto.

### Fluxo consolidado do chatbot (20 de setembro de 2026)

O fluxo do RF11 foi reescrito a partir de um documento de produto único (`fluxo-chatbot-nutrilink.md`, fornecido pelo time), que substitui o menu antigo de dúvidas e a ordem antiga de cadastro. A retomada de nutriz já cadastrada pelo `JourneyStatus` e a gestão de lembretes (RF06) não faziam parte desse documento e foram preservadas sem mudança.

**Dúvidas frequentes em duas camadas.** O menu antigo de cinco perguntas (`FAQ`) virou dois níveis: `FAQ_MENU` com quatro perguntas (etapas do processo, quem pode doar, se dói ou atrapalha a amamentação, se pode doar mais de uma vez) e, dentro da primeira, `FAQ_STEPS_MENU` com as quatro etapas da doação (ficha de saúde e exame de sangue, entrega do kit, extração e armazenamento, coleta domiciliar). Cada pergunta tem seu próprio menu de fechamento (`FAQ_STEPS_CLOSING`, `FAQ_WHO_CLOSING`, `FAQ_PAIN_CLOSING`, `FAQ_FREQUENCY_CLOSING`), parecidos mas não idênticos entre si — o de "quem pode doar" oferece uma saída direta para o atendimento humano quando a dúvida é sobre a própria saúde; o de "dói ou atrapalha" oferece um link de dicas de extração; os demais não. Dentro de `FAQ_STEPS_CLOSING`, a opção "ver outra etapa" monta a lista de etapas **excluindo dinamicamente** a última etapa lida — guardada em `context.faqStep`, nunca uma lista fixa. `FAQ` (o menu antigo) e o resto do fluxo de agendamento continuam no enum só como estados legados: uma conversa que ainda estiver neles é reiniciada no menu principal, como já acontecia com `ASKED_SCHEDULED` e companhia.

**Cadastro com CPF e endereço, consentimento por último.** O cadastro (Seção 3 do documento) passou a perguntar nome, CPF, e-mail e endereço completo, um de cada vez, e só pede o consentimento **depois** de coletar os quatro — invertendo a ordem anterior (que pedia consentimento antes de qualquer dado pessoal, e só depois perguntava o nome). Isso é uma mudança de postura de privacidade deliberada, decidida com o time, não uma escolha unilateral: enquanto o "sim" não chega, os quatro campos ficam num rascunho dentro de `context.registration` (novo, dentro do mesmo `context` de `WhatsappConversation`) e são descartados sem nunca tocar `NutrizProfile` se a nutriz recusar. Só depois do aceite explícito (`AWAITING_CONSENT` → `cadastro_aceito`) o registro é criado de fato, com todos os campos de uma vez, e o rascunho do contexto é apagado. Uma recusa (`cadastro_recuso`) limpa o contexto inteiro, preservando só o de sempre — nunca a localização junto com dado pessoal.

CPF é dado novo no schema (`nutriz_profiles.cpf`, único, só dígitos) e é o campo mais sensível do produto até aqui — mais que nome, cidade ou telefone. **Decisão explícita do time, ciente do risco:** implementar mesmo com RLS ainda pendente em `nutriz_profiles` (seção 3.4) e com o site já publicado em produção. `endereço` (texto livre, sem separar rua/número/bairro — o documento pede uma única pergunta) também é novo e só é coletado por este fluxo; quem se cadastra pelo site não tem nem um nem outro preenchido. `lib/validators/common.ts` ganhou `cpfSchema`, que confere os dois dígitos verificadores (módulo 11) e rejeita sequências repetidas (`00000000000` etc.) — não é só checagem de formato. O CHECK do `context` da tabela `whatsapp_conversations` foi ampliado para aceitar esse rascunho, mas só valida formato (11 dígitos): o dígito verificador é conferido exclusivamente na aplicação antes de qualquer escrita.

**Segundo atalho para o atendimento humano.** Além do pedido explícito (Seção 4 do documento), duas tentativas seguidas sem o bot entender a mensagem agora também levam à pausa real (`HUMAN_HANDOFF`) — antes, a segunda tentativa incompreendida só mostrava os canais de contato e mantinha o bot ativo no menu. O texto de abertura do handoff foi ajustado para refletir os dois gatilhos ("Entendi que sua dúvida merece uma resposta mais cuidadosa..."), mas a janela de atendimento humano de segunda a sábado, das 9h às 18h, no horário de Brasília (decisão de 16 de setembro de 2026, acima) foi mantida — o documento novo não tratava esse detalhe operacional, e não há indicação de que a equipe quisesse revisá-lo.

Três migrations, aplicadas nessa ordem no Supabase cloud em 20 de setembro de 2026 e registradas em `_prisma_migrations` com o checksum SHA-256 dos arquivos:
- `20260920040000_add_nutriz_cpf_and_address` — colunas `cpf` (único) e `address` em `nutriz_profiles`;
- `20260920041000_expand_whatsapp_conversation_step_values` — os dez novos valores do enum `WhatsappConversationStep` (cada `ADD VALUE` isolado em sua própria instrução, porque um valor novo de enum só pode ser usado com segurança depois do commit da transação que o criou); `FAQ` permanece no enum como legado, sem remoção (Postgres não permite excluir valor de enum sem recriar o tipo);
- `20260920050000_expand_whatsapp_conversation_registration_draft` — o CHECK de `context` amplia para `faqStep` e `registration`, com validação de formato por campo.

Verificado ponta a ponta com `pnpm whatsapp:sim` contra o webhook local (assinatura, idempotência, todas as transições e a gravação final em `nutriz_profiles` com CPF, e-mail e endereço corretos), e os dados de teste foram removidos do Supabase cloud depois. `pnpm check` e a suíte completa (689 testes) passam.

## 4. Stack

| Camada | Tecnologia | Versão ou nota |
|---|---|---|
| Framework | Next.js App Router | 15 |
| UI runtime | React | 19 |
| Linguagem | TypeScript estrito | strict e noUncheckedIndexedAccess |
| Estilo | Tailwind CSS | 4, com tokens CSS |
| Componentes | shadcn/ui | componentes em components/ui |
| Banco | PostgreSQL via Supabase | cloud, projeto eurofarma / org fiap |
| ORM | Prisma | 6.x fixado |
| Validação | Zod | 3.x fixado |
| Autenticação | Supabase Auth com @supabase/ssr | admin e nutriz |
| Formulários | React Hook Form + Zod | cobertura, cadastro, autenticação e municípios |
| Conteúdo | Componentes estruturados; MDX previsto | políticas e conteúdo futuro |
| Pacotes | pnpm | obrigatório |
| Node | 22 LTS planejado | ambiente atual roda Node 24 |
| Testes | Vitest | Última suíte completa no cloud: 689 em 102 arquivos; suíte unitária local atual: 602 em 90 arquivos. |
| E2E | Playwright | sprint futuro |
| Chatbot | Interface independente de provedor, com adaptadores Meta e Twilio | código local parcial; falta infraestrutura real do provedor escolhido |
| Consulta de CEP | ViaCEP | `POST /api/coverage`, sem persistência do CEP |
| Geração de PDF | pdf-lib | RF20, `lib/pdf/nutriz-history.ts`; pura TypeScript, sem binário nativo |

Não atualizar Prisma para 7 nem Zod para 4 sem uma migração planejada.

## 5. Setup local

Pré-requisitos: Node 22 LTS ou o ambiente atual compatível e pnpm. Não é necessário Docker nem Supabase CLI.

~~~bash
git clone https://github.com/RuyFichman/eurofarma.git
cd eurofarma
cp .env.example .env.local
pnpm install
pnpm db:generate
pnpm check:validators
pnpm dev
~~~

Preencha .env.local localmente. Nunca versionar segredos.

O banco é Supabase cloud. DATABASE_URL aponta para o pooler, porta 6543, com pgbouncer=true. O Prisma CLI carrega .env.local por dotenv-cli.

### 5.1 Migrations

Não usar prisma migrate dev neste projeto: o shadow database não funciona de forma confiável no Supabase cloud via pooler.

Fluxo obrigatório:

1. Atualizar prisma/schema.prisma.
2. Gerar SQL offline com prisma migrate diff.
3. Salvar em prisma/migrations/<timestamp>_<nome>/migration.sql.
4. Revisar o SQL.
5. Aplicar pelo MCP do Supabase com apply_migration.
6. Registrar a migration em _prisma_migrations com o checksum SHA-256 do arquivo, quando necessário.
7. Gerar novamente o Prisma Client.
8. Executar testes.

Se o ambiente não tiver MCP do Supabase, gerar e revisar o SQL, mas não improvisar aplicação por outro caminho.

### 5.2 Entrega acadêmica de banco de dados

O pacote da disciplina de banco de dados está em `docs/entrega-banco-de-dados/`. Ele usa o schema irmão `nutrilink` no mesmo projeto Supabase, separado do schema `public` consumido pela aplicação. Regenerar com `pnpm bd:massa`, `pnpm bd:aplicar`, `pnpm bd:evidencias` e `pnpm bd:documentos`.

Esse schema é uma fotografia acadêmica escrita à mão, com DDL, restrições `CHECK`, massa determinística e evidências. Mudanças em `prisma/schema.prisma` ou no escopo ativo Lactare-only não o atualizam automaticamente, e a aplicação nunca deve apontar para ele. A massa fictícia não deve ser inserida no schema `public` nem misturada com PII real.

## 6. Organização do projeto

Estrutura principal:

~~~text
app/
  (public)/                 rotas públicas; cobertura em /verificar-cobertura
  (nutriz)/                 área autenticada sem o chrome público
  admin/                    segmento literal /admin
    (painel)/               telas protegidas; municípios em /admin/municipios
  api/                      route handlers
  auth/confirmar/           callback de autenticação
components/
  admin/                    interface administrativa
  nutriz/                   área autenticada da nutriz
  shared/                   componentes públicos compartilhados
  ui/                       shadcn/ui
data/seeds/units/           CSVs nacionais legados
docs/
  projeto-nutrilink.md      especificação funcional e de produto
lib/
  admin/                    regras Prisma-free do painel
  auth/                     clientes e gates de autenticação
  constants/                constantes compartilhadas
  db/queries/               acesso a dados
  i18n/pt-br.ts             textos visíveis
  maps/                     mapa estático
  security/                 rate limit
  utils/                    funções puras
  validators/               schemas Zod
  whatsapp/                 webhook, payload, fluxo e cliente
prisma/
  migrations/
  schema.prisma
  seed.ts
scripts/
tests/
  helpers/
  integration/
  unit/
~~~

### 6.1 Rotas e layouts

- O grupo app/(public) já fornece Header, main#main-content e Footer.
- O grupo app/(nutriz) fornece o main da área pessoal e renderiza Header e Footer institucional (Footer incluído em 20/09/2026, a pedido do time); o route group evita lógica cliente baseada no pathname sem alterar `/meu-agendamento`.
- O Header é renderizado no servidor e consulta `getNutrizAccess()`. Quem tem sessão de nutriz vê "Minha área" e "Sair"; visitante vê "Entrar". `forbidden` — admin logado ou perfil com soft delete — é tratado como visitante, porque não existe Minha Área para essas pessoas. A consulta é deduplicada pelo `cache` do React, então o layout da área, que já chama o mesmo gate, não paga uma segunda ida ao banco.
- **Consequência do item anterior: o Header lê cookie, portanto toda rota que o inclui é renderizada sob demanda.** Antes dessa mudança, 11 rotas eram pré-renderizadas no build; hoje nenhuma é. Isso foi medido e aceito em 19 de setembro de 2026, porque oferecer "Entrar" a quem já está logado é informação errada, e o custo é nulo sem deploy, CDN ou tráfego. A regra que substitui a anterior é de cache, não de sessão: **não colocar cache de HTML público (CDN, ISR, `Cache-Control: public`) na frente dessas rotas sem tratar o cabeçalho personalizado**, sob pena de servir o HTML de uma nutriz logada a um visitante anônimo. Se a renderização estática voltar a importar, as saídas são uma ilha cliente para o bloco da conta ou PPR.
- A navegação ativa é a única ilha cliente do Header. O menu mobile usa `details` nativo e não depende de Radix.
- "Sair" usa a Server Action `logoutNutrizAction`. O cabeçalho é a única saída de sessão da nutriz na interface; não duplicar o botão dentro da área.
- Páginas públicas não devem criar outro elemento main.
- A área admin usa o segmento literal app/admin para preservar URLs /admin/*.
- O grupo interno (painel) organiza telas protegidas sem entrar na URL.
- app/admin/sem-acesso fica fora do grupo protegido para evitar loop.
- middleware.ts faz apenas o gate de autenticação e renovação de sessão.
- A autorização por role usa Prisma no layout Node; Prisma não roda no Edge.

### 6.2 Server e Client Components

- Prefira Server Components.
- Use Client Components somente para estado, eventos, APIs do navegador ou bibliotecas que os exijam.
- Isole a menor parte interativa possível.
- `getCurrentUser()` e `getNutrizAccess()` usam o `cache` do React para deduplicar autenticação somente dentro da mesma renderização. Não substituir a chamada de `requireNutrizUser()` nas Server Actions: cada mutação deve revalidar sessão e perfil em sua própria requisição.
- Consultas ficam em lib/db/queries.
- Validação compartilhada deve ficar fora de componentes e, quando possível, ser Prisma-free.

## 7. Design system, acessibilidade e conteúdo

Os tokens estão em app/globals.css.

- primary: azul profundo #3A7AB8;
- secondary e accent: azul suave #D6EAFF;
- fundo: azul gelado #F4F9FF;
- texto e footer: navy #1A2B3C;
- ring, charts e sidebar: azul claro #5BA4D4;
- verde reservado ao token de marca do WhatsApp;
- topic tokens são exceções controladas para cartões educativos;
- fonte Inter via next/font;
- sem dark mode nesta etapa.

Nunca hardcode cor em classes como bg-[#...]. Use tokens semânticos.

Componentes shadcn ficam em components/ui. Adicione novos componentes com:

~~~bash
pnpm dlx shadcn@latest add <componente>
~~~

A referência visual viva está em /style-guide.

Todo texto visível da interface deve vir de lib/i18n/pt-br.ts. Não hardcode copy em componentes. Textos devem:

- ser acolhedores e objetivos;
- não prometer atendimento, coleta ou impacto clínico sem fonte;
- diferenciar NutriLink, Lactare e hospitais;
- deixar claro quando algo é lembrete, não agendamento;
- indicar fontes e datas para métricas institucionais.

O Header é sticky e responsivo. O link ativo usa usePathname. O logo atual é um SVG placeholder em components/shared/logo.tsx até existir ativo oficial.

## 8. Convenções de código

- Use pnpm; nunca npm ou yarn.
- Mantenha TypeScript estrito.
- Use imports @/* para a raiz.
- Prefira funções pequenas, puras e testáveis.
- Centralize validações em Zod.
- Revalide dados no servidor; validação do cliente é UX, não segurança.
- Restrinja selects do Prisma às colunas necessárias.
- Use listas explícitas de campos em mutações para evitar mass assignment.
- Normalize telefone, CEP, slug e UTM em utilitários compartilhados.
- Não exponha mensagens internas de autenticação ou banco.
- Não inclua PII em logs, tracking, URLs ou referrers.
- Preserve alterações do usuário em worktree suja.
- Não introduza dependência nova sem necessidade clara.
- Não crie APIs administrativas quando Server Actions atendem a mesma necessidade dentro do App Router.

### 8.1 Banco e nomes

- Modelos e enums Prisma usam nomes em inglês.
- Textos de interface ficam em português do Brasil.
- Slugs devem ser estáveis e únicos.
- Valores vazios opcionais devem ser normalizados de modo consistente.
- Detalhes clínicos não pertencem ao schema do NutriLink. Um status categórico informado manualmente pelo Lactare pode existir, desde que não contenha tipo de exame, valores, laudo ou motivo clínico.

### 8.2 Testes de integração

Nunca suponha que uma UF está vazia.

- Queries públicas usam TEST_CITY, “Cidade Teste”, para isolar fixtures.
- Queries administrativas usam prefixo __test__ no nome e filtro q.
- Limpe dependências antes das entidades referenciadas; Appointment deve ser removido antes de NutrizProfile enquanto a FK legada existir.

## 9. Segurança e LGPD

### 9.1 Bloqueador de exposição pública

RLS permanece pendente nas tabelas do Supabase. A publishable key é pública e o endpoint POST /api/nutriz grava PII.

Antes de qualquer deploy ou demonstração pública com dados reais, são obrigatórios:

- habilitar RLS;
- criar e testar policies;
- validar juridicamente e publicar Privacidade e Termos com controlador, encarregado e canal institucional definidos;
- trocar o rate limit em memória por store distribuído;
- adicionar proteção anti-spam;
- revisar logs e respostas de erro;
- validar consentimentos;
- revisar chaves e URLs do ambiente.
- restringir por função e auditar qualquer acesso ou mudança do futuro status categórico da jornada.

Não sugerir que o sistema está pronto para produção enquanto essas pendências existirem.

### 9.2 Consentimentos

- O consentimento de cadastro deve ser explícito.
- O opt-in para avisos de mudança de status pelo WhatsApp deve ser opcional e independente do consentimento de lembretes.
- O consentimento de lembretes deve ser separado e opcional.
- Consentimento não pode vir pré-marcado.
- A retirada do opt-in deve ser implementável e auditável.
- Dados devem ser reduzidos ao mínimo necessário.
- Detalhes clínicos não devem ser coletados. O sistema pode guardar somente o status categórico registrado pelo Lactare depois da avaliação profissional.

### 9.3 Rate limiting e anti-spam

Os limitadores atuais são em memória e por processo. Eles servem somente para o ambiente local/MVP. Não são suficientes em múltiplas instâncias. Isso vale para todos os endpoints públicos, incluindo `POST /api/contact-click`, cujo IP serve apenas de chave efêmera do limitador e não é persistido.

Turnstile foi dispensado no MVP anterior, mas a proteção anti-spam continua requisito antes de exposição pública. Não confundir “dispensado por ora” com “resolvido”.

## 10. Autenticação

### 10.1 Admin

- Supabase Auth autentica.
- public.users, com role ADMIN, autoriza.
- O id de public.users deve ser igual ao id de auth.users.
- Usuário autenticado sem espelho ADMIN vai para /admin/sem-acesso.
- Erros de login são genéricos.
- O lockout atual é em memória: cinco falhas em cinco minutos por e-mail.

O admin técnico inicial é criado por:

~~~bash
pnpm db:seed-admin
~~~

O e-mail atual é admin@lactare.local. Ele é uma credencial técnica legada, não copy de produto. Renomeá-lo exige mudança coordenada no Supabase Auth e em public.users.

Como o domínio é fictício, a recuperação por e-mail não serve para esse usuário. Redefina com:

~~~bash
pnpm db:set-admin-password
~~~

O script gera uma senha forte ou usa ADMIN_PASSWORD do ambiente. Nunca registrar a senha no repositório.

### 10.2 Nutriz

- O cadastro provisiona usuário confirmado por Admin API e vincula authUserId ao perfil.
- Conflitos de e-mail ou WhatsApp retornam ACCOUNT_ALREADY_EXISTS sem vazar detalhes.
- Falha na gravação deve tentar reverter o usuário recém-criado.
- O login usa erro genérico e o mesmo lockout em memória.
- Recuperação de senha depende de SMTP; o Supabase embutido é fortemente limitado.
- /auth/confirmar troca o code por sessão.
- /redefinir-senha conclui a atualização.
- /meu-agendamento exige sessão e vínculo válido com o perfil.

## 11. WhatsApp

### 11.1 Estado técnico

O código da integração existe, mas não há:

- app configurado na Meta;
- número oficial;
- templates aprovados;
- URL pública estável;
- conta de provedor capaz de entregar a conversa.

As variáveis do provedor escolhido no `.env.example` precisam de valores reais. Valores locais servem apenas aos simuladores; `AccountSid`, `ContentSid` e formatos do Twilio não podem entrar nas regras de negócio.

**Entrada validada de ponta a ponta com o Twilio em 18 de setembro de 2026.** Uma conta trial, um número trial e um túnel temporário foram usados para receber uma mensagem real de WhatsApp. Funcionaram: assinatura, idempotência pelo `MessageSid`, máquina de estados e gravação com `processing_result` `PROCESSED`. O webhook de entrada de uma conta trial se configura dentro da modal “Try out WhatsApp” do Console (radio **Inbound**, auto-reply **Custom**), e não em Messaging ou Numbers & senders.

**A saída não funciona em conta trial, e isso não é limitação do nosso código.** O sender trial recusa mensagem de sessão livre com `21654 ContentSid Required`, exigindo template aprovado em toda mensagem, inclusive dentro da janela de 24 horas. Como o fluxo conversacional é feito apenas de mensagens de sessão, não há entrega real sem upgrade da conta. No trial também estão bloqueados o Console em Messaging, a API de Channel Senders e a Content API (`20003 This feature is not available on a Trial account`), então nem criar template próprio é possível. Enquanto a conta for trial, exercite a conversa pelos simuladores locais e não prometa demonstração pelo WhatsApp real.

### Demonstração temporária pelo Z-API (19 de setembro de 2026)

A conta de teste da Cloud API da Meta foi testada com um destinatário brasileiro e recusou o envio com `130497` (`Business account is restricted from messaging users in this country`). Portanto, ela não viabiliza a gravação da demonstração no WhatsApp para este projeto. Para a entrega acadêmica, foi autorizada uma integração transitória com Z-API, conectada por QR Code a um chip brasileiro novo e exclusivo de teste. Essa via não usa WABA, CNPJ, verificação empresarial nem credenciais da Meta.

A integração Z-API é estritamente de demonstração: não é um provedor oficial do WhatsApp, não pode receber PII real, não pode usar número ou identidade operacional do Lactare, não deve ser descrita como integração de produção e deve ser removida ou substituída por um adaptador oficial antes de qualquer publicação. Credenciais de instância, token e Client-Token ficam somente no `.env.local`, nunca em código, logs, testes, commits ou documentação pública. Os adaptadores oficiais Meta e Twilio continuam sendo a arquitetura de produção.

O webhook:

- usa GET para o challenge de verificação em texto puro;
- usa POST com corpo cru;
- exige assinatura HMAC;
- compara assinatura com timingSafeEqual;
- ignora recibos que não sejam mensagens;
- limita localmente o volume por número, usando-o somente como chave efêmera em memória;
- entrega o evento normalizado à mesma máquina de estados por meio da interface `WhatsAppProvider`; cada rota seleciona o adaptador Meta ou Twilio;
- associa telefones considerando variantes com e sem nono dígito;
- aceita números novos, mantém estado mínimo e só cria o perfil depois do consentimento explícito;
- resolve o CEP somente durante a consulta e persiste apenas cidade e UF;
- reinicia no menu qualquer estado legado de agendamento, sem criar novos registros em `Appointment`.

Teste local:

~~~bash
pnpm whatsapp:sim
pnpm whatsapp:outbox:sim
~~~

### 11.2 Fluxo-alvo

O fluxo completo deverá permitir:

1. apresentação e menu;
2. perguntas frequentes;
3. elegibilidade por CEP ou município;
4. orientação dentro ou fora da área;
5. cadastro opcional com consentimento;
6. contato direto com o Lactare;
7. opt-in separado de lembretes;
8. avisos de mudança do status da jornada registrado pelo Lactare;
9. acompanhamento pós-doação;
10. cartão e reconhecimento depois de uma confirmação legítima; a mensagem de indicação fica disponível na Minha Área com o link próprio.

A máquina de estados já cobre localmente os itens 1 a 7, inclusive retomada pelo status categórico registrado pelo Lactare e ativação ou cancelamento de lembretes por uma nutriz cadastrada. O handoff humano local também está implementado: pedido explícito, mesmo chat, pausa do bot e resposta distinta dentro ou fora do expediente. O item 8 tem base local de outbox, mas ainda não entrega pela Meta; o cartão de impacto e o reconhecimento derivado de indicação permanecem pendentes, assim como o vídeo institucional, a operação humana conectada à infraestrutura real da Meta e a própria infraestrutura da Meta. A mensagem de indicação é disponibilizada na Minha Área, e não enviada pelo chatbot. As migrations conversacional, da outbox e da finalidade de lembretes estão aplicadas no Supabase; a migration `20260916200000_add_human_handoff_step` também está aplicada e registrada. Não chamar RF11 de concluído.

Atualização do UC14: o cartão de impacto e o reconhecimento derivado de indicação continuam pendentes de uma confirmação legítima de doação ou de um evento próprio. A mensagem de indicação já está disponível exclusivamente na Minha Área: ela é editável, contém somente o link opaco da própria nutriz e pode ser copiada ou aberta pré-preenchida no WhatsApp. O chatbot não envia essa mensagem, não registra destinatários e não concede recompensa material.

Decisões operacionais de 16 de setembro de 2026 para o handoff: ele ocorre somente quando a nutriz pede para falar com alguém, continua no mesmo chat e pausa o bot enquanto um atendente do Lactare assume a conversa. A janela é de segunda a sábado, das 9h às 18h, no horário de Brasília. Fora desse horário, o pedido fica registrado no estado pausado para a próxima janela, sem fila ou prazo de resposta exibidos e sem alerta automático ao atendente nesta etapa. A resposta deve continuar pelo WhatsApp. O opt-in de avisos de status e o opt-in de lembretes são escolhas separadas da nutriz. Nenhuma dessas mensagens cria ou confirma agendamento, que permanece integralmente fora do NutriLink.

Mensagens do bot devem vir de WHATSAPP_BOT em lib/i18n/pt-br.ts e responder em poucos segundos. O bot nunca executa triagem nem confirma agendamento. Pode comunicar um status já registrado pela equipe do Lactare, sem revelar detalhes clínicos.

## 12. Área do Lactare e segmentação

A fonte de produto adotada é o Mapa do Leite do Lactare, com 30 municípios. A lista completa e as fontes estão em docs/projeto-nutrilink.md.

Na web, a nutriz pode selecionar um município ou informar um CEP. O endpoint `POST /api/coverage` valida oito dígitos, consulta o ViaCEP com timeout e compara município/UF com os registros ativos de `ServiceMunicipality`. Estar na lista significa **elegibilidade geográfica para coleta domiciliar gratuita segundo o Mapa do Leite**, uniforme nos 30 municípios atendidos conforme confirmação do Lactare em 19 de setembro de 2026, não coleta confirmada. Triagem, data e disponibilidade continuam dependendo de contato direto com o Lactare. O CEP não é salvo nem enviado ao tracking.

Sub-regiões:

- **Oeste:** Itapevi, Barueri, Carapicuíba, Cotia, Jandira, Osasco, Pirapora do Bom Jesus, Santana de Parnaíba e Vargem Grande Paulista.
- **Sudoeste:** Embu das Artes, Embu-Guaçu, Itapecerica da Serra e Taboão da Serra.
- **ABC:** Diadema, Mauá, Ribeirão Pires, Rio Grande da Serra, Santo André, São Bernardo do Campo e São Caetano do Sul.
- **Norte:** Caieiras, Cajamar e Francisco Morato.
- **Leste / Alto Tietê:** Arujá, Ferraz de Vasconcelos, Guarulhos, Itaquaquecetuba, Poá e Suzano.
- **Capital:** São Paulo.

Segmentos implementados no dashboard:

- sub-região da Grande São Paulo, relacionada pela cidade da nutriz e pela configuração de `ServiceMunicipality`;
- status atual da jornada, a partir de `JourneyStatus` (`REGISTERED`, `DOCUMENT_SENT`, `FORM_RECEIVED`, `EXAM_SCHEDULED`, `EXAMS_COMPLETED`, `AWAITING_RESULT`, `ELIGIBLE`, `NOT_ELIGIBLE`, `KIT_SENT`, `KIT_DELIVERED`, `DONATION_CONFIRMED` ou `RECURRING_DONATION_ELIGIBLE`);
- origem do cadastro, classificada somente quando existe `utm_source` explícita.

Os três filtros vivem na URL (`region`, `stage` e `origin`), são combináveis e geram um único recorte compartilhado pelos cartões, pela evolução mensal e pelas distribuições. A região usa todos os municípios configurados, inclusive inativos, para que a desativação operacional de uma cidade não apague sua classificação histórica.

O clique nos canais oficiais do Lactare tem evento próprio desde o RF07 (`contact_channel_clicks`, com canal, superfície e UTM) e alimenta os cartões e a distribuição por canal. Como o evento é anônimo e não guarda nutriz nem localização, sua leitura é global e não responde aos filtros de região ou status. O indicador de alcance observável soma cadastros e cliques da janela de 30 dias como ações, não como pessoas únicas.

O ledger local já registra ativação e retirada de lembretes e o dashboard agrega o opt-in vigente, além da atividade de concessões e retiradas na janela de 30 dias. O retorno observável considera uma coorte de cadastros com pelo menos 30 dias e algum histórico de jornada ou mudança posterior de consentimento; ele não prova retenção definitiva nem abandono. A adesão mede consentimento vigente, não mensagens entregues. O dashboard também agrega cadastros atribuídos a links próprios de indicação, sem expor as pessoas envolvidas; essa métrica não cria recompensa material nem confirma doação. Ainda não estão implementados os segmentos de recorrência de doações confirmadas e velocidade até a primeira doação. O modelo do RF16 está conectado ao painel, ao funil e à área pessoal da nutriz, separado do `interestStatus` legado, e sua migration está aplicada no Supabase cloud. O funil calcula alcance acumulado a partir do fluxo progressivo vigente; os pontos entre etapas significam apenas ausência de avanço registrado, porque ainda não existe evento de desistência nem prazo operacional validado. Os demais segmentos exigem eventos e campos específicos. Não os inferir de agendamentos legados, preferências de contato, UTMs ausentes ou outros sinais indiretos; não inventar valores nem derivar status clínico.

## 13. Regras de produto vigentes

Estas decisões substituem decisões antigas conflitantes:

1. **Escopo Lactare-only:** a base nacional é legado, não direção futura.
2. **WhatsApp como porta de entrada, independente do provedor:** links wa.me ou tel podem continuar como ações de contato, mas não substituem o chatbot-alvo; Meta e Twilio são detalhes de transporte isolados por adaptadores.
3. **Sem agendamento:** datas podem servir como referência de lembrete; não representam reserva ou confirmação.
4. **Sem detalhes clínicos:** triagem e decisão pertencem ao Lactare, e dados de bebês pertencem aos hospitais. O NutriLink pode armazenar e exibir somente o status categórico informado manualmente pela equipe, sem avaliar exames.
5. **Cobertura configurável:** a lista de municípios deve ser administrável e refletida imediatamente na elegibilidade.
6. **Fora da área:** orientar para fonte externa oficial; não manter diretório nacional próprio.
7. **Lembretes por opt-in separado:** nunca ativados automaticamente.
8. **Compartilhamento sem recompensa material:** cartão, mensagem e reconhecimento são simbólicos.
9. **Impacto verificável:** não calcular “bebês salvos” nem alegações clínicas individuais.
10. **Segurança antes de exposição:** RLS, textos legais e proteção contra abuso são bloqueadores.
11. **Minha Área sem coleta clínica:** registros de extração, bem-estar e conteúdo sugerido são opcionais e não podem substituir informações ou decisões do Lactare.

## 14. Git e entrega

- Trabalhe em branch de feature.
- Antes de começar, confira branch, status e diferença para origin/main.
- Não sobrescreva alterações alheias.
- Não faça git reset --hard ou descarte mudanças sem autorização explícita.
- Commits devem ser pequenos e coerentes.
- Não misture refatoração ampla com correção pontual.
- Documente decisões novas neste arquivo e, quando forem de produto, também em docs/projeto-nutrilink.md.

Antes de concluir uma mudança de código, rode verificações proporcionais ao risco. Para mudanças amplas:

~~~bash
pnpm check
pnpm test
~~~

Mudanças somente em Markdown não exigem build ou testes de aplicação, mas devem ser revisadas quanto a links, consistência de termos e estado do Git.

## 15. Fora do escopo e sprints futuros

Marque explicitamente como “previsto para sprint futuro” qualquer menção a:

- deploy, domínio, staging ou produção;
- CI/CD;
- monitoramento;
- Playwright;
- ativação real da Meta;
- diretório nacional;
- aplicativo móvel;
- múltiplos idiomas;
- detalhes clínicos ou automação de decisão clínica;
- integrações com sistemas hospitalares.

Não configure esses itens sem uma nova decisão de escopo e autorização do time.

## 16. Glossário curto

- **BLH:** Banco de Leite Humano.
- **LGPD:** Lei Geral de Proteção de Dados Pessoais.
- **Nutriz:** mulher que amamenta e é potencial doadora.
- **Opt-in:** ativação voluntária e explícita.
- **PII:** dado que identifica ou pode identificar uma pessoa.
- **Status da jornada:** categoria simples registrada pelo Lactare para informar uma etapa como ficha recebida, exame agendado, apta, não apta ou kit entregue, sem detalhes clínicos.
- **rBLH:** Rede Brasileira de Bancos de Leite Humano.
- **RLS:** Row Level Security.
- **Triagem:** avaliação de saúde feita por profissional do Lactare, fora do NutriLink.
