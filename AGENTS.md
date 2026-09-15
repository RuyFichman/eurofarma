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

### 2.1 Limites obrigatórios

O NutriLink:

- atende a operação do Lactare;
- pode encaminhar quem está fora da área para um diretório oficial externo da rBLH ou do Ministério da Saúde;
- trata apenas dados necessários à jornada da nutriz, incluindo status categóricos informados pelo Lactare, sem detalhes clínicos;
- usa lembretes opcionais, com consentimento separado;
- pode registrar origem por indicação sem oferecer recompensa material.

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

**Referência desta seção:** 15 de setembro de 2026.

O estado descrito abaixo está integrado à `main` até a PR #14. Isso inclui o RF16 no painel, a jornada segura na área pessoal e o contato oficial do Lactare após cobertura positiva. Novos trabalhos devem partir dessa base, sem reabrir os branches `feat-rf16-modelo-jornada` ou `feat-contato-lactare` para acrescentar funcionalidades.

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

TypeScript estrito está ativo com strict e noUncheckedIndexedAccess. A última suíte completa anterior à migration pendente do chatbot passou com **456 testes em 53 arquivos**: 382 unitários e 74 de integração. Nesta atualização, **470 testes em 56 arquivos** passam: 406 unitários e os 64 de integração que não dependem do novo schema. Os 10 testes de integração do estado conversacional aguardam a aplicação da migration `20260915170000_expand_whatsapp_conversation_flow` no Supabase cloud pelo MCP obrigatório. As migrations do RF07 e do RF16 continuam aplicadas, assim como a de `service_municipalities`, com os 30 municípios conferidos.

### 3.1 O que está implementado

- Scaffold Next.js e design system.
- Landing pública, página “Sobre”, conteúdo educativo e style guide.
- Página pública de verificação de cobertura por CEP ou município em `/verificar-cobertura`, com os 30 municípios do Lactare agrupados em seis sub-regiões.
- Resolução de CEP pelo ViaCEP em `POST /api/coverage`, seguida da comparação com a lista ativa de `service_municipalities`; o CEP não é persistido.
- Resposta transparente para localização fora da lista, com encaminhamento ao diretório oficial externo da rBLH.
- Contato direto após cobertura positiva, com WhatsApp `+55 (11) 96629-0681`, telefone `(11) 4144-9604` e horário de segunda a sexta, das 7h às 22h. Os canais foram conferidos no site oficial do Lactare em 14 de setembro de 2026; a interface mantém link para a fonte e não representa confirmação de atendimento ou coleta.
- Tracking dos canais oficiais do Lactare (RF07): o clique no WhatsApp ou no telefone do cartão de contato grava um evento anônimo em `contact_channel_clicks` por `POST /api/contact-click`. O evento guarda canal, superfície, campanha de origem e horário; não referencia unidade legada, nutriz, CEP, IP nem referrer. A migration foi aplicada no Supabase cloud em 14 de setembro de 2026.
- Cadastro opcional de nutriz com consentimento obrigatório no formulário.
- Provisionamento da conta da nutriz no Supabase Auth.
- Login, logout, recuperação e redefinição de senha da nutriz.
- Área autenticada da nutriz com status atual da jornada, linha do tempo de categorias e datas, orientações específicas para cada etapa, identificação da cidade cadastrada e acesso ao verificador de cobertura. A consulta da nutriz não seleciona observações administrativas, responsáveis ou detalhes clínicos.
- Login, logout, middleware, autorização por role e shell administrativo.
- Dashboard administrativo adaptado para municípios e cadastros de nutrizes, com filtros combináveis por sub-região da Grande São Paulo, status atual de `JourneyStatus` e origem UTM. O mesmo recorte é aplicado aos cartões, à série temporal, às distribuições e ao funil progressivo da jornada; dados pessoais não são exibidos. O painel também apresenta sinais globais de alcance, cliques anônimos por canal, conversão acumulada e cadastros sem avanço registrado entre etapas. Como os cliques não referenciam nutriz nem localização, eles permanecem globais e não respondem aos filtros de região ou status.
- Listagem de nutrizes com exposição reduzida de contato e acesso ao detalhe da jornada em `/admin/nutrizes/[id]`.
- Listagem, cadastro e edição dos municípios atendidos em `/admin/municipios`.
- Migration Prisma da tabela `service_municipalities`, com carga inicial exata dos 30 municípios, gerada, versionada e aplicada no Supabase cloud em 12 de setembro de 2026. Os 30 registros foram conferidos por sub-região e a migration está registrada em `_prisma_migrations`.
- Rotas públicas e administrativas antigas de unidades aposentadas: redirecionam para o fluxo de cobertura; `/api/units` e `/api/track` respondem `410 Gone`.
- Webhook da WhatsApp Cloud API, verificação de assinatura, rate limiting local e simulador com exemplos do fluxo ativo.
- Máquina de estados local do chatbot com apresentação e menu, FAQ, elegibilidade por CEP ou município, orientação dentro ou fora da área, cadastro simplificado opcional com consentimento, retomada de nutriz cadastrada pelo `JourneyStatus` e encaminhamento transparente aos canais oficiais do Lactare. O CEP não entra no contexto persistido; o cadastro mantém marketing e lembretes desligados. A migration que amplia `WhatsappConversation` foi gerada e revisada, mas ainda não foi aplicada no Supabase cloud.
- RF16 no painel: `JourneyStatus` separado de `interestStatus`, status atual, detalhe da nutriz, histórico append-only com autor e horário, observação administrativa limitada e transições explícitas. A mudança usa o status anterior como condição de concorrência e atualiza perfil e histórico na mesma transação; falha no histórico reverte o status. A migration foi aplicada no Supabase cloud em 13 de setembro de 2026 e registrada em `_prisma_migrations` com o checksum SHA-256 do arquivo; enum, coluna com default `REGISTERED`, índices, CHECKs, FKs `RESTRICT` e trigger de imutabilidade foram conferidos no banco.

### 3.2 Situação dos requisitos funcionais

| Requisito | Situação atual |
|---|---|
| RF01 — elegibilidade por CEP | **Implementado no escopo validável.** O ViaCEP resolve município e UF, e a lista ativa indica elegibilidade geográfica para coleta domiciliar gratuita segundo o Mapa do Leite. A interface não promete confirmação logística; a uniformidade operacional nos 30 municípios ainda depende de validação do Lactare. |
| RF02 — área atendida | **Implementado no escopo atualizado.** A interface exibe os 30 municípios atendidos; bancos de leite e pontos de coleta não são mais entidades públicas ou administrativas do produto. |
| RF03 — fora da cobertura | **Implementado.** CEP ou município fora da lista recebe explicação e link oficial da rBLH. |
| RF04 — cadastro opcional e LGPD | **Parcial.** O consentimento é obrigatório no formulário, mas Privacidade e Termos ainda dão 404. |
| RF05 — login da nutriz | **Implementado.** A recuperação por e-mail depende de SMTP. |
| RF06 — lembretes opcionais | **Não implementado.** |
| RF07 — tracking de contato | **Implementado.** O clique nos canais oficiais do Lactare é gravado como evento anônimo em `contact_channel_clicks`, sem unidade legada e sem CEP ou PII. O tracking antigo por unidade continua aposentado (`/api/track` responde 410). O painel lê o total, a janela de 30 dias e a distribuição por canal. |
| RF08 — painel autenticado | **Implementado.** Inclui checagem de role ADMIN. |
| RF09 — municípios atendidos | **Implementado.** O CRUD administra `service_municipalities` e a tabela existe no Supabase cloud com os 30 municípios. |
| RF10 — indicadores do funil | **Parcial.** O dashboard resume municípios e nutrizes, mede sinais observáveis de alcance, agrega os cliques anônimos de contato e apresenta o funil progressivo do `JourneyStatus`, sua conversão e os pontos sem avanço registrado. Os cadastros podem ser segmentados por sub-região, status atual e origem de forma combinável. “Sem avanço” não prova abandono definitivo, e “não apta” é uma saída legítima separada. Ainda faltam retenção, adesão a lembretes e os segmentos que dependem de confirmação legítima de doação e indicação própria. |
| RF11 — chatbot completo | **Parcial.** Menu, FAQ, elegibilidade, orientação, cadastro opcional, retomada por status e contato com o Lactare estão implementados localmente. A ativação depende da migration conversacional no Supabase e da infraestrutura real da Meta. Continuam pendentes vídeo institucional oficial, opt-in e job de lembretes, avisos do RF17, handoff humano operacional e pós-doação baseado em confirmação legítima. |
| RF12 — cartão de impacto | **Não implementado.** |
| RF13 — mensagem de indicação | **Não implementado.** |
| RF14 — reconhecimentos | **Não implementado.** |
| RF15 — atribuição por indicação | **Parcial.** UTMs genéricas existem, mas não há identificador nem vínculo próprio de indicação. |
| RF16 — status da jornada | **Implementado.** O administrador acessa `/admin/nutrizes/[id]`, consulta status e histórico e registra somente a próxima transição válida. A mutação é autorizada por role `ADMIN`, condicional ao status anterior e atômica com o histórico. Correção e reabertura continuam fora do fluxo até validação operacional do Lactare. |
| RF17 — aviso de mudança de status | **Não implementado.** Falta notificar automaticamente a nutriz pelo WhatsApp depois de uma atualização válida feita pelo Lactare. |

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

O modelo `Appointment` e os estados/colunas antigos de `WhatsappConversation` são legado técnico. A migration do chatbot preserva esses dados, mas o webhook ativo não os lê nem cria novos agendamentos. Eles podem ser migrados ou reaproveitados para lembretes e continuidade da jornada, mas não autorizam linguagem de agendamento, confirmação de visita ou promessa logística. O acompanhamento autodeclarado pode perguntar se a nutriz recebeu a visita de entrega do kit, fato que somente ela conhece; nunca deve perguntar resultado de exame ou outro fato cuja fonte é o Lactare. A rota `/meu-agendamento` foi mantida por compatibilidade, mas sua interface ativa é “Minha área” e não exibe agendamento.

Não criar preview estático com estado “confirmado” ou lembrete de coleta sem uma fonte operacional legítima. A home e a área da nutriz devem manter linguagem de cobertura e orientação, não de agendamento.

### 3.4 Pendências críticas

- Rate limiting distribuído.
- Proteção anti-spam nos formulários públicos.
- Consentimento separado e job de lembretes.
- Segmentos comportamentais que ainda não têm eventos próprios: recorrência, adesão a lembretes, indicação entre doadoras e velocidade até a primeira doação.
- Definição da fonte legítima de confirmação de uma doação.
- RLS para `nutriz_profiles`, `journey_status_history`, `contact_channel_clicks` e `whatsapp_conversations`; a autorização do RF16 já existe na aplicação e o evento do RF07 é anônimo, mas as tabelas continuam sem policies no Supabase. O contexto conversacional contém cidade durante o cadastro e o próprio registro identifica o número de WhatsApp, portanto deve ser tratado como PII. O nome só é solicitado e gravado no perfil depois do consentimento.
- Notificação automática pelo WhatsApp após cada mudança válida de status.
- Cartão de impacto, indicação e reconhecimentos.
- Conta Meta, número, templates e URL pública para o WhatsApp.
- Aplicação e registro, pelo MCP do Supabase, da migration `20260915170000_expand_whatsapp_conversation_flow`; até isso ocorrer, o novo fluxo permanece somente local.
- Política de Privacidade, Termos de Uso e RLS continuam obrigatórios antes de exposição pública, mas foram adiados pelo time para depois da entrega de municípios.

### 3.5 Validações externas pendentes

- Confirmar com o Lactare se a coleta domiciliar gratuita é uniforme nos 30 municípios ou se varia por logística.
- Definir quem registra uma doação como confirmada.
- Validar com a equipe do Lactare quem atualiza cada status da jornada e se existe capacidade operacional para manter os registros consistentes.
- Validar textos jurídicos e consentimentos.

Até essas respostas existirem, prefira linguagem conservadora. Estar na área de atuação não autoriza prometer coleta domiciliar gratuita uniforme.

### 3.6 Próximas entregas recomendadas

1. Validar com o Lactare correção ou reabertura de uma jornada, quem atualiza cada etapa e o significado de aptidão para doações recorrentes; até lá, o painel mantém somente o fluxo progressivo já definido.
2. Implementar o RF17 com uma outbox criada na mesma transação da mudança de status, inicialmente integrada ao simulador local do WhatsApp.
3. Aplicar pelo MCP do Supabase a migration conversacional já gerada e executar novamente a suíte completa de integração.
4. Implementar lembretes opcionais sem semântica de agendamento e concluir o handoff humano operacional.
5. Completar o dashboard com retenção e os segmentos comportamentais que dependem de lembretes, indicação e confirmação legítima de doação. Alcance observável, cliques de contato e funil do `JourneyStatus` já estão implementados.
6. Implementar confirmação de doação, cartão de impacto, indicação e reconhecimentos somente após definir uma fonte operacional legítima.
7. Publicar Privacidade e Termos, aplicar RLS e concluir rate limiting distribuído e proteção anti-spam antes de qualquer exposição pública. O time decidiu executar esse bloco por último, mas ele permanece bloqueador de publicação.
8. Ativar a integração real com a Meta quando a infraestrutura externa existir.

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
| Testes | Vitest | Última suíte completa: 456 em 53 arquivos. Estado atual: 470 em 56 arquivos — 406 unitários e 64 de integração não dependentes; os 10 testes do novo estado conversacional aguardam a migration no Supabase. |
| E2E | Playwright | sprint futuro |
| Chatbot | WhatsApp Cloud API, sem SDK | código local parcial; falta infraestrutura Meta |
| Consulta de CEP | ViaCEP | `POST /api/coverage`, sem persistência do CEP |

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
- publicar Privacidade e Termos;
- trocar o rate limit em memória por store distribuído;
- adicionar proteção anti-spam;
- revisar logs e respostas de erro;
- validar consentimentos;
- revisar chaves e URLs do ambiente.
- restringir por função e auditar qualquer acesso ou mudança do futuro status categórico da jornada.

Não sugerir que o sistema está pronto para produção enquanto essas pendências existirem.

### 9.2 Consentimentos

- O consentimento de cadastro deve ser explícito.
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
- número de teste ou número oficial;
- templates aprovados;
- URL pública;
- credenciais reais.

As quatro variáveis WHATSAPP_* do .env.example precisam de valores reais. Valores locais servem apenas ao simulador.

O webhook:

- usa GET para o challenge de verificação em texto puro;
- usa POST com corpo cru;
- exige assinatura HMAC;
- compara assinatura com timingSafeEqual;
- ignora recibos que não sejam mensagens;
- limita localmente o volume por número, usando-o somente como chave efêmera em memória;
- usa a Cloud API diretamente, sem SDK;
- associa telefones considerando variantes com e sem nono dígito;
- aceita números novos, mantém estado mínimo e só cria o perfil depois do consentimento explícito;
- resolve o CEP somente durante a consulta e persiste apenas cidade e UF;
- reinicia no menu qualquer estado legado de agendamento, sem criar novos registros em `Appointment`.

Teste local:

~~~bash
pnpm whatsapp:sim
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
10. cartão, indicação e reconhecimento depois de uma confirmação legítima.

A máquina de estados já cobre localmente os itens 1 a 6, inclusive retomada pelo status categórico registrado pelo Lactare. Os itens 7 a 10 permanecem pendentes, assim como o vídeo institucional, a transferência real para atendimento humano, a infraestrutura da Meta e a aplicação da migration conversacional no Supabase. Não chamar RF11 de concluído.

Mensagens do bot devem vir de WHATSAPP_BOT em lib/i18n/pt-br.ts e responder em poucos segundos. O bot nunca executa triagem nem confirma agendamento. Pode comunicar um status já registrado pela equipe do Lactare, sem revelar detalhes clínicos.

## 12. Área do Lactare e segmentação

A fonte de produto adotada é o Mapa do Leite do Lactare, com 30 municípios. A lista completa e as fontes estão em docs/projeto-nutrilink.md.

Na web, a nutriz pode selecionar um município ou informar um CEP. O endpoint `POST /api/coverage` valida oito dígitos, consulta o ViaCEP com timeout e compara município/UF com os registros ativos de `ServiceMunicipality`. Estar na lista significa **elegibilidade geográfica para coleta domiciliar gratuita segundo o Mapa do Leite**, não coleta confirmada; a uniformidade operacional nos 30 municípios ainda depende de validação do Lactare. O CEP não é salvo nem enviado ao tracking.

Sub-regiões:

- **Oeste:** Itapevi, Barueri, Carapicuíba, Cotia, Jandira, Osasco, Pirapora do Bom Jesus, Santana de Parnaíba e Vargem Grande Paulista.
- **Sudoeste:** Embu das Artes, Embu-Guaçu, Itapecerica da Serra e Taboão da Serra.
- **ABC:** Diadema, Mauá, Ribeirão Pires, Rio Grande da Serra, Santo André, São Bernardo do Campo e São Caetano do Sul.
- **Norte:** Caieiras, Cajamar e Francisco Morato.
- **Leste / Alto Tietê:** Arujá, Ferraz de Vasconcelos, Guarulhos, Itaquaquecetuba, Poá e Suzano.
- **Capital:** São Paulo.

Segmentos implementados no dashboard:

- sub-região da Grande São Paulo, relacionada pela cidade da nutriz e pela configuração de `ServiceMunicipality`;
- status atual da jornada, a partir de `JourneyStatus` (`REGISTERED`, `FORM_RECEIVED`, `EXAM_SCHEDULED`, `AWAITING_RESULT`, `ELIGIBLE`, `NOT_ELIGIBLE`, `KIT_DELIVERED` ou `RECURRING_DONATION_ELIGIBLE`);
- origem do cadastro, classificada somente quando existe `utm_source` explícita.

Os três filtros vivem na URL (`region`, `stage` e `origin`), são combináveis e geram um único recorte compartilhado pelos cartões, pela evolução mensal e pelas distribuições. A região usa todos os municípios configurados, inclusive inativos, para que a desativação operacional de uma cidade não apague sua classificação histórica.

O clique nos canais oficiais do Lactare tem evento próprio desde o RF07 (`contact_channel_clicks`, com canal, superfície e UTM) e alimenta os cartões e a distribuição por canal. Como o evento é anônimo e não guarda nutriz nem localização, sua leitura é global e não responde aos filtros de região ou status. O indicador de alcance observável soma cadastros e cliques da janela de 30 dias como ações, não como pessoas únicas.

Ainda não estão implementados os segmentos de adesão a lembretes, recorrência de doações confirmadas, indicação própria e velocidade até a primeira doação. O modelo do RF16 está conectado ao painel, ao funil e à área pessoal da nutriz, separado do `interestStatus` legado, e sua migration está aplicada no Supabase cloud. O funil calcula alcance acumulado a partir do fluxo progressivo vigente; os pontos entre etapas significam apenas ausência de avanço registrado, porque ainda não existe evento de desistência nem prazo operacional validado. Os demais segmentos exigem eventos e campos específicos. Não os inferir de agendamentos legados, preferências de contato, UTMs ausentes ou outros sinais indiretos; não inventar valores nem derivar status clínico.

## 13. Regras de produto vigentes

Estas decisões substituem decisões antigas conflitantes:

1. **Escopo Lactare-only:** a base nacional é legado, não direção futura.
2. **WhatsApp Cloud API como porta de entrada:** links wa.me ou tel podem continuar como ações de contato, mas não substituem o chatbot-alvo.
3. **Sem agendamento:** datas podem servir como referência de lembrete; não representam reserva ou confirmação.
4. **Sem detalhes clínicos:** triagem e decisão pertencem ao Lactare, e dados de bebês pertencem aos hospitais. O NutriLink pode armazenar e exibir somente o status categórico informado manualmente pela equipe, sem avaliar exames.
5. **Cobertura configurável:** a lista de municípios deve ser administrável e refletida imediatamente na elegibilidade.
6. **Fora da área:** orientar para fonte externa oficial; não manter diretório nacional próprio.
7. **Lembretes por opt-in separado:** nunca ativados automaticamente.
8. **Compartilhamento sem recompensa material:** cartão, mensagem e reconhecimento são simbólicos.
9. **Impacto verificável:** não calcular “bebês salvos” nem alegações clínicas individuais.
10. **Segurança antes de exposição:** RLS, textos legais e proteção contra abuso são bloqueadores.

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
