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
3. **Dashboard administrativo:** gestão da área atendida e indicadores de alcance, engajamento, conversão, retenção e adesão a lembretes.

### 2.1 Limites obrigatórios

O NutriLink:

- atende a operação do Lactare;
- pode encaminhar quem está fora da área para um diretório oficial externo da rBLH ou do Ministério da Saúde;
- trata apenas dados necessários à jornada não clínica da nutriz;
- usa lembretes opcionais, com consentimento separado;
- pode registrar origem por indicação sem oferecer recompensa material.

O NutriLink não é:

- diretório nacional próprio de bancos de leite;
- sistema de agendamento ou confirmação automática de coleta;
- sistema de triagem clínica;
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

**Referência desta seção:** 12 de setembro de 2026.

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

TypeScript estrito está ativo com strict e noUncheckedIndexedAccess. Nesta atualização, a suíte tem **362 testes passando**: 295 unitários e 67 de integração. Os testes existentes ainda não consultam a nova tabela, pois sua migration não foi aplicada no Supabase cloud.

### 3.1 O que está implementado

- Scaffold Next.js e design system.
- Landing pública, página “Sobre”, conteúdo educativo e style guide.
- Página pública de verificação de cobertura por município em `/verificar-cobertura`, com os 30 municípios do Lactare agrupados em seis sub-regiões.
- Resposta transparente para cidade fora da lista, com encaminhamento ao diretório oficial externo da rBLH.
- Cadastro opcional de nutriz com consentimento obrigatório no formulário.
- Provisionamento da conta da nutriz no Supabase Auth.
- Login, logout, recuperação e redefinição de senha da nutriz.
- Área autenticada da nutriz com identificação da cidade cadastrada e acesso ao verificador de cobertura.
- Login, logout, middleware, autorização por role e shell administrativo.
- Dashboard administrativo adaptado para municípios, sub-regiões e cadastros de nutrizes.
- Listagem de nutrizes com exposição reduzida de contato.
- Listagem, cadastro e edição dos municípios atendidos em `/admin/municipios`.
- Migration Prisma da tabela `service_municipalities`, com carga inicial exata dos 30 municípios, gerada e versionada. Ela ainda precisa ser aplicada no Supabase cloud.
- Rotas públicas e administrativas antigas de unidades aposentadas: redirecionam para o fluxo de cobertura; `/api/units` e `/api/track` respondem `410 Gone`.
- Webhook da WhatsApp Cloud API, verificação de assinatura e simulador local.
- Máquina de estados local do chatbot para um fluxo limitado sobre tentativa de combinar visita.

### 3.2 Situação dos requisitos funcionais

| Requisito | Situação atual |
|---|---|
| RF01 — elegibilidade por CEP | **Parcial.** A verificação por município existe; a resolução automática de CEP para município ainda não foi implementada. |
| RF02 — área atendida | **Implementado no escopo atualizado.** A interface exibe os 30 municípios atendidos; bancos de leite e pontos de coleta não são mais entidades públicas ou administrativas do produto. |
| RF03 — fora da cobertura | **Implementado para seleção de município.** Cidade fora da lista recebe explicação e link oficial da rBLH; falta integrar a mesma resposta à futura consulta por CEP. |
| RF04 — cadastro opcional e LGPD | **Parcial.** O consentimento é obrigatório no formulário, mas Privacidade e Termos ainda dão 404. |
| RF05 — login da nutriz | **Implementado.** A recuperação por e-mail depende de SMTP. |
| RF06 — lembretes opcionais | **Não implementado.** |
| RF07 — tracking de contato | **Não implementado no fluxo atual.** O tracking antigo dependia de unidades e sua rota foi aposentada. O novo evento deve acompanhar o contato direto com o Lactare. |
| RF08 — painel autenticado | **Implementado.** Inclui checagem de role ADMIN. |
| RF09 — municípios atendidos | **Implementado no código, pendente no banco.** O CRUD administra `service_municipalities`; requer aplicação da migration no Supabase cloud. |
| RF10 — indicadores do funil | **Parcial.** O dashboard já resume municípios, sub-regiões e nutrizes; faltam alcance, funil completo, retenção e adesão a lembretes. |
| RF11 — chatbot completo | **Parcial.** Infraestrutura e simulação local existem; faltam FAQ, elegibilidade, cadastro, lembretes, pós-doação e ativação real na Meta. |
| RF12 — cartão de impacto | **Não implementado.** |
| RF13 — mensagem de indicação | **Não implementado.** |
| RF14 — reconhecimentos | **Não implementado.** |
| RF15 — atribuição por indicação | **Parcial.** UTMs genéricas existem, mas não há identificador nem vínculo próprio de indicação. |

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

Os modelos Appointment e WhatsappConversation também são legado técnico. Eles podem ser migrados ou reaproveitados para lembretes e continuidade da jornada, mas não autorizam linguagem de agendamento, confirmação de visita ou promessa logística. A rota `/meu-agendamento` foi mantida por compatibilidade, mas sua interface ativa é “Minha área” e não exibe agendamento.

Não criar preview estático com estado “confirmado” ou lembrete de coleta sem uma fonte operacional legítima. A home e a área da nutriz devem manter linguagem de cobertura e orientação, não de agendamento.

### 3.4 Pendências críticas

- Aplicar no Supabase cloud a migration versionada de `service_municipalities` e conferir os 30 registros.
- Rate limiting distribuído.
- Proteção anti-spam nos formulários públicos.
- Verificação de elegibilidade por CEP.
- Consentimento separado e job de lembretes.
- Segmentação por sub-região e perfil.
- Definição da fonte legítima de confirmação de uma doação.
- Cartão de impacto, indicação e reconhecimentos.
- Conta Meta, número, templates e URL pública para o WhatsApp.
- Política de Privacidade, Termos de Uso e RLS continuam obrigatórios antes de exposição pública, mas foram adiados pelo time para depois da entrega de municípios.

### 3.5 Validações externas pendentes

- Confirmar com o Lactare se a coleta domiciliar gratuita é uniforme nos 30 municípios ou se varia por logística.
- Validar o canal oficial e as instruções de contato exibidas depois da confirmação de cobertura.
- Definir quem registra uma doação como confirmada.
- Validar textos jurídicos e consentimentos.

Até essas respostas existirem, prefira linguagem conservadora. Estar na área de atuação não autoriza prometer coleta domiciliar gratuita uniforme.

### 3.6 Próximas entregas recomendadas

1. Aplicar a migration de municípios no Supabase cloud e validar os 30 registros.
2. Completar a elegibilidade por CEP usando `service_municipalities` como fonte de verdade.
3. Adaptar o chatbot para menu, FAQ, elegibilidade, cadastro e encaminhamento ao Lactare.
4. Implementar lembretes opcionais sem semântica de agendamento.
5. Completar o dashboard com funil, retenção, cobertura, região e perfil.
6. Publicar Privacidade e Termos, habilitar RLS e endurecer os controles contra abuso antes de qualquer exposição pública.
7. Implementar confirmação de doação, cartão de impacto, indicação e reconhecimentos somente após definir uma fonte operacional legítima.
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
| Testes | Vitest | 362 passando: 295 unitários e 67 de integração |
| E2E | Playwright | sprint futuro |
| Chatbot | WhatsApp Cloud API, sem SDK | código local parcial; falta infraestrutura Meta |

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
- Campos de saúde não pertencem ao schema do NutriLink.

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

Não sugerir que o sistema está pronto para produção enquanto essas pendências existirem.

### 9.2 Consentimentos

- O consentimento de cadastro deve ser explícito.
- O consentimento de lembretes deve ser separado e opcional.
- Consentimento não pode vir pré-marcado.
- A retirada do opt-in deve ser implementável e auditável.
- Dados devem ser reduzidos ao mínimo necessário.
- Dados clínicos não devem ser coletados.

### 9.3 Rate limiting e anti-spam

Os limitadores atuais são em memória e por processo. Eles servem somente para o ambiente local/MVP. Não são suficientes em múltiplas instâncias.

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
- usa a Cloud API diretamente, sem SDK;
- associa telefones considerando variantes com e sem nono dígito.

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
8. acompanhamento pós-doação;
9. cartão, indicação e reconhecimento depois de uma confirmação legítima.

A máquina de estados atual cobre somente um fluxo legado e limitado. Não chamar RF11 de concluído.

Mensagens do bot devem vir de WHATSAPP_BOT em lib/i18n/pt-br.ts e responder em poucos segundos. O bot nunca executa triagem e nunca confirma agendamento.

## 12. Área do Lactare e segmentação

A fonte de produto adotada é o Mapa do Leite do Lactare, com 30 municípios. A lista completa e as fontes estão em docs/projeto-nutrilink.md.

Sub-regiões:

- **Oeste:** Itapevi, Barueri, Carapicuíba, Cotia, Jandira, Osasco, Pirapora do Bom Jesus, Santana de Parnaíba e Vargem Grande Paulista.
- **Sudoeste:** Embu das Artes, Embu-Guaçu, Itapecerica da Serra e Taboão da Serra.
- **ABC:** Diadema, Mauá, Ribeirão Pires, Rio Grande da Serra, Santo André, São Bernardo do Campo e São Caetano do Sul.
- **Norte:** Caieiras, Cajamar e Francisco Morato.
- **Leste / Alto Tietê:** Arujá, Ferraz de Vasconcelos, Guarulhos, Itaquaquecetuba, Poá e Suzano.
- **Capital:** São Paulo.

Segmentos de perfil planejados:

- estágio da jornada;
- adesão a lembretes;
- origem do contato;
- velocidade até a primeira doação.

Região e perfil são dimensões separadas e combináveis. A região já existe em `ServiceMunicipality`, na consulta pública, nos filtros administrativos e no dashboard. O vínculo entre região e perfil da nutriz e os demais segmentos comportamentais ainda não estão implementados. Não invente valores nem derive status clínico.

## 13. Regras de produto vigentes

Estas decisões substituem decisões antigas conflitantes:

1. **Escopo Lactare-only:** a base nacional é legado, não direção futura.
2. **WhatsApp Cloud API como porta de entrada:** links wa.me ou tel podem continuar como ações de contato, mas não substituem o chatbot-alvo.
3. **Sem agendamento:** datas podem servir como referência de lembrete; não representam reserva ou confirmação.
4. **Sem dados clínicos:** triagem pertence ao Lactare e dados de bebês pertencem aos hospitais.
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
- dados clínicos;
- integrações com sistemas hospitalares.

Não configure esses itens sem uma nova decisão de escopo e autorização do time.

## 16. Glossário curto

- **BLH:** Banco de Leite Humano.
- **LGPD:** Lei Geral de Proteção de Dados Pessoais.
- **Nutriz:** mulher que amamenta e é potencial doadora.
- **Opt-in:** ativação voluntária e explícita.
- **PII:** dado que identifica ou pode identificar uma pessoa.
- **rBLH:** Rede Brasileira de Bancos de Leite Humano.
- **RLS:** Row Level Security.
- **Triagem:** avaliação de saúde feita por profissional do Lactare, fora do NutriLink.
