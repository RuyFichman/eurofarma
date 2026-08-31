# AGENTS.md

## 1. Sobre este arquivo

Este é o guia operacional **de qualquer agente de código** que trabalhe no projeto Lactare Digital — Claude Code, Codex ou outro. Leia este arquivo por completo antes de qualquer tarefa. Ele define stack, convenções, estrutura e o que está dentro e fora de escopo. Atualize-o sempre que uma decisão arquitetural for tomada, uma convenção mudar, ou o estágio do projeto avançar (ex.: quando deploy entrar em escopo).

**Este arquivo é a fonte única da verdade.** O `CLAUDE.md` na raiz não duplica nada: ele só importa este arquivo via `@AGENTS.md`, que é como o Claude Code carrega conteúdo externo. Escreva aqui — editar o `CLAUDE.md` faria as duas versões divergirem, que é exatamente o problema que essa importação evita.

## 2. Visão do produto

Lactare Digital é uma plataforma web que conecta nutrizes (mães que amamentam) a bancos de leite humano e pontos de coleta no Brasil. O objetivo é reduzir o atrito entre a vontade de doar e a ação de doar: a nutriz encontra a unidade mais próxima e fala com ela pelo WhatsApp em poucos cliques. O WhatsApp (via links `wa.me` com tracking) é o canal principal de conversão. O produto inclui landing pública, página educativa, busca por estado/cidade, cadastro opcional de nutriz, painel admin e dashboard de métricas.

## 3. Estado atual do projeto

MVP em desenvolvimento inicial. **Apenas ambiente local.** Não há deploy, domínio nem produção.

NÃO está em uso ainda (não sugira, não configure, não referencie como atual):

- Deploy (Vercel ou qualquer hospedagem).
- Domínio próprio ou DNS.
- Ambientes de staging/production.
- CI/CD (GitHub Actions etc.).
- Monitoramento (Sentry, PostHog, Datadog).
- Playwright e2e (planejado para sprint futuro).
- **Gráficos no painel** — a 5.5 saiu deliberadamente sem biblioteca de charts (série temporal com zero ponto não comunica nada). Quando entrarem, carregar a skill `dataviz` antes da primeira linha de chart.
- **`content/`** — ainda não criado; nasce no sprint de conteúdo/MDX. A **área admin já existe** como **segmento literal `app/admin/`** (URLs `/admin/*`), com `/admin/login` (5.2) e `/admin/dashboard` + `/admin/sem-acesso` (5.3) — **não** é route group `(admin)` (que seria omitido da URL); o group **interno** `(painel)` agrupa as telas protegidas sem mexer na URL; ver §13. (O grupo `(public)` já existe, com `layout.tsx` — Header + `<main id="main-content">` + Footer — a home `/` e `/style-guide`.)

Quando precisar mencionar esses itens, marque-os explicitamente como "previsto para sprints futuros".

O scaffold do Next.js **já existe** e a esteira de qualidade funciona: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format`, `pnpm check`, `pnpm check:validators` e `pnpm test`/`test:unit`/`test:integration`/`test:coverage` (Vitest) rodam todos. TS estrito ativo (`strict` + `noUncheckedIndexedAccess`); imports com `@/*` mapeiam para a raiz.

**Design system:** tokens visuais em `app/globals.css` (paleta **Azul** em HSL: primary azul profundo `#3A7AB8`, secondary/accent azul suave `#D6EAFF`, fundo azul gelado `#F4F9FF`, texto/footer navy `#1A2B3C`, acento azul claro `#5BA4D4` em ring/charts/sidebar; radius, shadows; Tailwind v4 `@theme inline`, sem dark mode; `--whatsapp` é o verde de marca do WhatsApp e os `--topic-*` tingem os cartões do "Comece por Aqui" — as duas exceções à paleta azul, ver seção 13). Fonte **Inter** via `next/font`. **shadcn/ui instalado** — componentes em `components/ui/` (button, card, input, label, select, checkbox, radio-group, badge). Adicione mais com `pnpm dlx shadcn@latest add <componente>`. Referência visual viva em `/style-guide`. Nunca hardcode cor (`bg-[#...]`); use os tokens (`bg-primary`, `text-muted-foreground`, etc.).

**Layout público e copy:** `Header` (Client — sticky, glass, nav desktop + `Sheet` mobile, link ativo via `usePathname`) e `Footer` (Server — `bg-sidebar`) vivem em `components/shared/` e são aplicados a tudo no grupo `(public)` via seu `layout.tsx`. Páginas em `(public)` NÃO devem ter `<main>` próprio (o layout já provê `<main id="main-content">`). Logo em `components/shared/logo.tsx` (SVG gota inline, placeholder até o oficial). **Toda string visível vem de `lib/i18n/pt-br.ts`** (`SITE`/`NAV`/`FOOTER`/`A11Y`) — nunca hardcode texto.

**Pendência de segurança aberta:** RLS (Row Level Security) está **desabilitado** em todas as 8 tabelas no Supabase cloud. Como a `publishable key` é pública, isso expõe leitura/escrita de tudo (incluindo `nutriz_profiles`). Habilitar RLS + policies é pré-requisito antes de qualquer exposição pública do app. **Atenção:** o endpoint público `POST /api/nutriz` (Sprint 4.3) já grava PII de nutriz nessa tabela — reforça que RLS, rate limiting distribuído (o da 4.4 é em memória) e anti-spam (Turnstile, dispensado por ora) são pré-requisitos antes de qualquer exposição pública.

**Progresso por sprint:** Sprint 0 (scaffold) ✅ · 1.1 (schema Prisma) ✅ · 1.2 (migration inicial) ✅ · 1.3 (lib: prisma singleton, validators Zod, slug) ✅ · 1.5 (importador de CSV do seed — `prisma/seed.ts`: upsert por slug, validação linha a linha, `seed-errors.log`; as 6 unidades de exemplo que ele trouxe foram **apagadas** na 1.4, o pipeline continua) ✅ · 1.6 (seed do admin via Supabase Auth) ✅ · 1.7 (Vitest: 66 testes — unit + integração; `findUnitsByLocation` em `lib/db/queries/units.ts`) ✅ · 2.1 (design tokens + shadcn + style guide) ✅ · 2.2 (header + footer responsivos + i18n `lib/i18n/pt-br.ts`) ✅ · 2.3 (landing pública: hero, stats, "quem faz parte da rede", dicas e CTA final — Server Components em `components/shared/home-*.tsx`, copy em `HOME` no i18n) ✅ · 2.4 (sobre: hero, história, missão, linha do tempo, parcerias e CTA final — Server Component em `app/(public)/sobre/page.tsx`, copy em `ABOUT` no i18n; datas e logos com `TODO` p/ validação Eurofarma) ✅ · 2.5 (página educativa em `/como-funciona`, rota e nav reusados: hero com busca, "Comece por Aqui", "O Caminho da Doação" (timeline 5 passos), vídeos, checklist interativo, "Amamentação na Prática", "Histórias Reais" e FAQ — Server Components em `components/shared/content-*.tsx`, **só o checklist é Client**; FAQ usa `<details>` nativo, sem JS; copy em `CONTENT` no i18n. Construída como hub **estruturado, não MDX** — artigos MDX individuais ficam para depois; chatbot trocado por WhatsApp direto (§12), busca/chips presentational, depoimentos ilustrativos e links "Ler artigo" com `TODO`) ✅ · 3.1 (API pública `GET /api/cities?state=UF` — cidades distintas de unidades ACTIVE, ordenadas pt-BR; validator `lib/validators/location.ts` reusa `ufSchema`; cache 1h) ✅ · 3.2 (API pública paginada `GET /api/units` — filtros `state`(obrigatório)/`city`/`neighborhood`/`type`/`has_whatsapp` + `page`/`limit`; resposta `{filters,units,meta}`; `select` restrito + `lib/mappers/unit-mapper.ts` (sem campos admin/PII); `lib/validators/unit-search.ts` com códigos 400 distintos por campo; cache 5min) ✅ · 3.3 (componente `components/shared/search-filters.tsx` — Client, React Hook Form + Zod, sincroniza filtros na URL via App Router, busca cidades em `/api/cities` com `AbortController`; copy em `SEARCH` no i18n; UFs em `lib/constants/brazilian-states.ts`; **não** renderizado ainda — entra em `/buscar` na 3.4) ✅ · 3.4 (página `/buscar` — Server Component lê os filtros da URL e renderiza os resultados **server-side**: `SearchFilters` (Client, 3.3) escreve os filtros na URL → `SearchResults` (async Server, `components/shared/search-results.tsx`) consome `searchPublicUnits` — query compartilhada nova em `lib/db/queries/units.ts`, **fonte única** reusada pelo route handler `/api/units` (o `select` público virou `PUBLIC_UNIT_SELECT` no mapper); `UnitCard` (Server, `components/shared/unit-card.tsx`) com badge de tipo, endereço bairro/cidade/UF, horário (texto livre) e CTA WhatsApp via `wa.me` (token `--whatsapp`) ou telefone via `tel:`; utils puros `lib/utils/whatsapp.ts` + `lib/utils/format-phone.ts`; estados inicial/vazio/erro, paginação por links e `<Suspense>` com esqueleto; copy em `SEARCH.page`/`results`/`pagination`/`card`. **Fora de escopo nesta tela** (sem dados ou §12): mapa, distância/"perto de mim" por GPS, rating/estrelas, "aberto agora" e o "Chatbot WhatsApp" do mockup — contato é por unidade via `wa.me`) ✅ · 3.5 (`UnitCard` definitivo — Server Component `components/shared/unit-card.tsx` com nome, badge de tipo, endereço resumido `Bairro, Cidade - UF`, horário com fallback e badges "Telefone/WhatsApp disponível"; ações isoladas no Client Component `components/shared/unit-card-actions.tsx`: "Ligar" (`tel:`), "WhatsApp" (`wa.me` com `whatsappMessage` da unidade ou mensagem padrão) e "Ver detalhes" → `/banco-de-leite/[slug]` (página é da 3.6). Tracking do clique no WhatsApp **preparado** via `navigator.sendBeacon` → fallback `fetch({keepalive:true})` para `/api/track` (rota só na 3.8; 404 ignorado, **nunca** bloqueia o redirect; evento `whatsapp_clicked`, payload sem PII da nutriz). Utils puros `lib/utils/whatsapp.ts` (`normalizeBrazilianWhatsappNumber`/`buildWhatsappUrl({phone,message})`) e `lib/utils/phone.ts` (substituem `format-phone.ts`); `whatsappMessage` + `contact.hasPhone` adicionados ao `PublicUnit`/`PUBLIC_UNIT_SELECT`; copy em `SEARCH.page.unitCard`) ✅ · 3.6 (página de detalhes `/banco-de-leite/[slug]` — Server Component, busca por slug ATIVO via `getActiveUnitBySlug` + `UNIT_DETAIL_SELECT`/`lib/mappers/unit-detail-mapper.ts`, `notFound()` se inexistente/inativa, `export const revalidate=3600`, `generateMetadata` por template no i18n, JSON-LD `LocalBusiness` em `lib/seo/unit-json-ld.ts`, mapa estático Mapbox com fallback textual (`lib/maps/mapbox-static.ts` — sem token → fallback), ações isoladas em `components/shared/unit-detail-actions.tsx`; copy em `UNIT_DETAIL`; **sem `<main>` próprio** (o layout `(public)` já provê)) ✅ · 4.1 (cadastro da nutriz em `/cadastro` — split-screen `SignupHero` (Server) + `SignupForm` (Client, RHF + Zod `signupFormSchema` **Prisma-free**); **coleta mínima LGPD**: nome, WhatsApp, UF, cidade, consentimento — **sem CPF, sem senha, sem login** (o mockup era tela de login/CPF; adaptado à marca Lactare e aos campos reais); copy em `SIGNUP`) ✅ · 4.5 (página `/obrigada` pós-cadastro — Server Component, mensagem humanizada, CTAs "Encontrar banco próximo"→`/buscar` e "Ver como funciona a doação"→`/como-funciona`, `robots: noindex`; copy em `THANKS`) ✅ · 4.3 (`POST /api/nutriz` — cadastro **opcional**; `runtime="nodejs"`, Zod `nutrizSignupApiSchema`, normalização de WhatsApp, **upsert lógico** por `phoneWhatsapp` (não é `@unique` → `findFirst`+`update`/`create` em `$transaction`), `lgpdConsentAt=now()`, `marketingConsent=false`, `WHATSAPP`/`INTERESTED`, UTMs sanitizadas (`lib/utils/utm.ts`), erros padronizados (`lib/utils/api-errors.ts`: `INVALID_JSON`/`VALIDATION_ERROR`/`LGPD_CONSENT_REQUIRED`/`INTERNAL_ERROR`), `201 {ok:true}` sem PII; **Turnstile (4.2) dispensado pelo time** no MVP) ✅ · 4.4 (rate limiting em `POST /api/nutriz` — `lib/security/rate-limit.ts` **em memória**, 5/min por IP → `429 RATE_LIMITED` + `Retry-After`; **por-processo**, trocar por store distribuído antes de deploy multi-instância; e o `/cadastro` agora **redireciona para `/obrigada`** no sucesso) ✅ · 5.1 (base Supabase Auth — `@supabase/ssr`: `lib/auth/supabase-server.ts` (`createServerClient` + cookies do `next/headers`), `supabase-client.ts` (`createBrowserClient`) e `get-current-user.ts`; usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como anon key — service_role nunca no client) ✅ · 5.2 (login admin em **`/admin/login`** — Server Component `app/admin/login/page.tsx` (redireciona p/ `/admin/dashboard` se já logado) + `LoginForm` Client (RHF + Zod `adminLoginSchema`, mostrar/ocultar senha, "Esqueci minha senha") + Server Actions `actions.ts` (`loginAdminAction`/`requestAdminPasswordResetAction`); `signInWithPassword` via Supabase com **erro genérico** (nunca vaza `error.message`), **lockout em memória por email** (5 falhas/5min, `lib/auth/login-rate-limit.ts`) e recuperação **anti-enumeração**; copy em `ADMIN_LOGIN`; `components/ui/alert.tsx` adicionado. **Rota = segmento literal `app/admin/`** para a URL ser `/admin/login` (route group `(admin)` seria omitido) — ver §13. Sem middleware/layout/dashboard) ✅ · 5.3 (proteção do painel — **`middleware.ts` na raiz** faz o gate de *autenticação* de todo `/admin/*` e renova o token de sessão (`lib/auth/supabase-middleware.ts`, matcher `['/admin','/admin/:path*']`); o gate de *autorização* (role ADMIN via Prisma) fica em `app/admin/(painel)/layout.tsx` → `requireAdminUser()` (`lib/auth/get-admin-user.ts`), porque **Prisma não roda no Edge**; chrome admin em `components/admin/` (`admin-shell` Server + `admin-nav`/`admin-mobile-menu` Client + `admin-account` com logout por Server Action em `app/admin/actions.ts`); `/admin/sem-acesso` para sessão válida sem permissão (fora do group, senão loop); `?next=` sanitizado por `sanitizeAdminNextPath` (`lib/auth/safe-next-path.ts`, anti open redirect, 5 testes); `/admin/dashboard` entra como **placeholder** só para fechar o fluxo — indicadores são 5.5; toda a área admin é `noindex` via `app/admin/layout.tsx`; env do Supabase deduplicada em `lib/auth/supabase-env.ts`; copy em `ADMIN`) ✅ · 5.4 (shell administrativo — sidebar fixa `w-64` visível a partir de **`lg`** (`components/admin/admin-sidebar.tsx`), header sticky `h-16` (`admin-header.tsx`), navegação mobile em `Sheet` (`admin-mobile-nav.tsx`), item ativo por `usePathname` + `aria-current="page"` (`admin-nav.tsx`), conta + logout por Server Action (`admin-user-menu.tsx`), skip link → `<main id="admin-main">` com `max-w-7xl` (acomoda tabelas futuras); itens da nav em **`lib/admin/navigation.ts`** (só `key`+`href`, Prisma-free) com rótulos em **`ADMIN_LAYOUT`** no i18n; só `admin-nav` e `admin-mobile-nav` são Client) ✅ · 3.8 (`POST /api/track` — fecha o circuito de tracking que a 3.5 deixou preparado; `runtime="nodejs"`, lista **fechada** de eventos em `lib/validators/track.ts` (só `whatsapp_clicked`), grava `WhatsappClick` com `unitId` + UTMs sanitizadas + referrer, rate limit 30/min por IP; erros no padrão do projeto (`VALIDATION_ERROR`/`UNKNOWN_UNIT` por FK P2003/`INTERNAL_ERROR`); **zero PII** — `nutrizProfileId` fica nulo e o IP só serve de chave em memória) ✅ · 5.5 (dashboard admin com dados reais — `getAdminDashboardMetrics()` em `lib/db/queries/dashboard-metrics.ts`, 4 cartões (unidades ativas, estados atendidos, nutrizes, cliques no WhatsApp em 30d) + breakdowns por situação/tipo/UF + top 5 unidades contatadas; componentes Server em `components/admin/dashboard/`; copy em `ADMIN.dashboard`) ✅ · 5.6 (listagem administrativa de unidades em **`/admin/unidades`** — primeira tela operacional do painel, dentro de `(painel)/`; **Server Component puro**: filtros vivem na URL (`q`/`status`/`type`/`state`/`city`/`page`), normalizados por `parseAdminUnitFilters` (`lib/admin/units/filters.ts`, Prisma-free, nunca lança) e consultados por `getAdminUnits` (`lib/db/queries/admin-units.ts`, `select` restrito + `$transaction([count, findMany])`, 20 por página, ordem `status → name → id`); formulário **GET nativo** (zero JS, `<select>` nativo no lugar do `Select` do shadcn); tabela semântica a partir de `md` e cartões abaixo disso (`components/admin/units/`); estados vazios distintos para base vazia e filtro sem resultado; `Nova unidade`/`Editar` **só navegam** — formulário e mutações são sprint futura, então `/admin/unidades/nova` e `/admin/unidades/[id]/editar` ainda dão 404 de propósito; copy em `ADMIN.units`) ✅ · 5.7 (formulário de unidade — `/admin/unidades/nova` e `/admin/unidades/[id]/editar` deixam de dar 404; **um só** `AdminUnitForm` (`components/admin/units/admin-unit-form.tsx`, Client, RHF + Zod) com união discriminada `create | edit`, 18 campos em 6 seções (`admin-unit-form-section.tsx`) e primitivos de campo em `admin-unit-form-fields.tsx` que montam `Label`/`aria-describedby`/`aria-invalid` uma vez só; schema **Prisma-free** em `lib/admin/units/unit-form-schema.ts` (reusa `ADMIN_UNIT_*_VALUES` de `filters.ts`, cujo import do Prisma é type-only), opções em `unit-form-options.ts` (rótulos vindos dos mesmos `getAdminUnit*Label` da 5.6) e prefill por `map-unit-to-form-values.ts`; leitura da edição por `getAdminUnitById` + `ADMIN_UNIT_FORM_SELECT` (em `lib/db/queries/admin-units.ts`), `notFound()` para id inexistente; `components/ui/textarea.tsx` adicionado; copy em `ADMIN.units.form`; 36 testes novos. **Sem persistência de propósito** — o submit valida e exibe "Formulário validado", nunca "cadastrada com sucesso"; gravar é a 5.8) ✅ · 5.8 (persistência do formulário — o painel deixa de ser só leitura: **Server Actions** `createAdminUnitAction`/`updateAdminUnitAction` em `app/admin/(painel)/unidades/actions.ts` (convenção do `app/admin/login/actions.ts`; **nenhuma** rota `/api/admin/*` foi criada), na ordem **autorizar → validar → normalizar → gravar → revalidar → redirecionar**; `requireAdminUser()` é chamado **fora do `try`** para o `redirect` interno não ser capturado; revalidação em `unit-form-schema` (o mesmo schema do cliente — validação de browser é UX, não segurança); normalização em `lib/admin/units/normalize-unit-input.ts`, reusando `cepSchema`/`phoneSchema`/`emailSchema` e `normalizeBrazilianWhatsappNumber`, de modo que unidade cadastrada pela tela fique indistinguível da vinda do seed; escrita isolada em `createAdminUnit`/`updateAdminUnit`/`findAvailableUnitSlug` (`lib/db/queries/admin-units.ts`), com lista explícita de colunas contra mass assignment e `Prisma.DbNull` para apagar `openingHours`; slug por `generateSlug` + sufixo livre em **uma** consulta, com P2002 tratado como conflito seguro; `revalidatePath` em `/admin/unidades`, `/admin/dashboard`, `/`, `/buscar`, `/api/units`, `/api/cities` e `/banco-de-leite/<slug>`; 30 testes novos, sendo 14 de integração que escrevem no banco real e se limpam pelo prefixo `__test__`) ✅ · **listagem de nutrizes** (sem número — pedida direto pelo time; `/admin/nutrizes`, segundo item da sidebar a sair do 404): Server Component puro no mesmo molde da 5.6 — filtros na URL (`q`/`status`/`state`/`page`) por `parseAdminNutrizFilters` (`lib/admin/nutrizes/filters.ts`, Prisma-free), consulta em `getAdminNutrizes` (`lib/db/queries/admin-nutrizes.ts`, `select` restrito + `$transaction`, 20 por página, ordem `createdAt desc → id`), formulário GET nativo, tabela a partir de `md` e cartões abaixo (`components/admin/nutrizes/`); **só o contato é Client** (`admin-nutriz-contact.tsx`). Sem criar/editar/excluir — mudar `interestStatus` é o próximo passo natural; copy em `ADMIN.nutrizes`; utils novos `formatBrazilianPhone`/`maskBrazilianPhone` (`lib/utils/phone.ts`) e `formatShortDate` (`lib/utils/format-date.ts`); 26 testes novos ✅.

**Carga de dados reais (Sprint 1.4, em andamento desde 2026-08-28):** o `_exemplo-fallback.csv` da 1.5 foi **removido** — arquivo e as 6 unidades que ele criou — porque conviver com a fonte oficial geraria duas versões da mesma unidade. A base agora tem só dados reais da rBLH, um CSV por UF em `data/seeds/units/` (`ac.csv`, …), transcritos do texto que o time envia. Carregado até agora (2026-08-29): **AC 5 · AL 7 · AM 19 · AP 4 · BA 12 · CE 47 · DF 20 · ES 8 · GO 8 · MA 5 · MG 45 · MS 5 · MT 5 · PA 7 · PB 29 · PE 14 · PI 6 · PR 34 · RJ 31 · RN 10 · RO 1 · RR 1 · RS 21 · SC 27 · SP 111 · TO 5 = 487 unidades** em 26 UFs (falta só **SE**).

**Consequência da carga nos testes:** os fixtures se isolavam usando uma UF "que o seed não usa" (`TO`/`AC`). Com o país quase todo carregado isso deixou de funcionar e quebrou 16 testes de integração. O isolamento agora é por **marcador próprio**, não por UF: `TEST_CITY` (`'Cidade Teste'`, em `tests/helpers/factories.ts`) para as queries públicas, que filtram por cidade, e o prefixo `__test__` do nome para as queries admin, que filtram por `q`. Nenhum teste novo pode voltar a assumir UF vazia.

**Pendências abertas da carga (decisões do time, não minhas):**

1. **Coluna `whatsapp` está vazia em 100% das unidades** — a fonte da rBLH só traz telefone. Como o `wa.me` é o canal de conversão do produto e o motor do indicador de cliques da 5.5, a busca inteira hoje só oferece `tel:`. Uns 10 registros vieram com celular de 11 dígitos (candidatos naturais), mas **ninguém autorizou** tratar celular como WhatsApp — mandar a nutriz para um número que não responde é pior que só oferecer o telefone.
2. **~9 telefones em formato de celular antigo** (8 dígitos começando em 8/9, ex.: `82 8121-1058`, `92 9504-8734`, `61 9821-0211`). Pela regra da Anatel bastaria prefixar o nono dígito, e isso é automatizável — mas não foi aplicado, porque número errado na mão da nutriz é pior que número que alguém confere.
3. **Pares BLH + posto no mesmo endereço** (Manaus, João Pessoa, Guarabira, Patos, Apucarana, Vila Velha, Recife…). Em geral são dois serviços reais do mesmo hospital; em ao menos um caso (Zilda Arns × Instituto Cândida Vargas, em João Pessoa) **o telefone também é idêntico**, o que sugere duplicidade da fonte.
4. **CEPs incompatíveis com o município** em ~4 unidades (Mâncio Lima/AC, Hospital de Santana/AP, Santa Helena/DF, Hospital da Mulher do Agreste/PE) e um CEP antigo em Porto Velho. Importados como vieram — hoje o CEP não alimenta nenhuma função, mas quebrariam geocoding.
5. **`address_complement` não existe no importador**, embora exista na tabela. Já se perderam complementos úteis ("Esquina com a Av. A", "Conjunto Nova Assunção", andares e blocos). Adicionar a coluna ao `unitCsvRowSchema` + `seed.ts` é mudança de ~5 linhas, oferecida e ainda não pedida. Convenções da transcrição: cidade em caixa alta na fonte vira capitalização normal (aparece no card público); seção "Banco de Leite" → `MILK_BANK`, "Posto/Ponto de Coleta" → `COLLECTION_POINT`; WhatsApp, horário e instruções ficam vazios quando a fonte não traz. Toda linha importada entra como `ACTIVE` — **inclusive unidade sem telefone e sem WhatsApp**: o time confirmou (2026-08-28) que parte da rede não tem telefone mesmo, então contato vazio não é erro de transcrição nem motivo para segurar a unidade em `PENDING`; ela aparece na busca com endereço e sem botão de contato. Não levantar isso de novo a cada carga.

**Próximas sprints (ordem sugerida):** terminar a **1.4** (falta só Sergipe) → **2.6** (privacidade/termos legais em MDX) → **4.2** (anti-spam Turnstile — dispensado por ora). Sem número ainda: exclusão/arquivamento de unidade (a 5.8 entregou criar e editar, **não** excluir), os demais CRUDs do painel (nutrizes, conteúdos, campanhas), RLS e store distribuído de rate limit.

**Admin inicial:** provisionado por `pnpm db:seed-admin` (email em `INITIAL_ADMIN_EMAIL`, hoje `admin@lactare.local`). Existe em `auth.users` (Supabase Auth) e em `public.users` com `role=ADMIN`, mesmo `id` nas duas tabelas. Script idempotente: re-rodar não regenera senha. Para redefinir a senha use `pnpm db:set-admin-password` (Admin API via service_role; gera uma forte de 20 chars e imprime uma vez, ou usa `ADMIN_PASSWORD` do ambiente). **Não** dá para usar o "Reset password" do painel nem o "Esqueci minha senha" da tela de login: ambos dependem de email, e `admin@lactare.local` é domínio fictício — além disso ainda não existe tela para definir a nova senha a partir do link de recuperação. O fluxo de login do painel (`/admin/login`) foi implementado na Sprint 5.2 (base de auth `@supabase/ssr` na 5.1) e autentica esse admin via `signInWithPassword`. A proteção global por middleware + checagem de role saiu na Sprint 5.3; o shell do painel na 5.4; o dashboard com indicadores reais é a 5.5. **O gate de role depende de o `id` em `public.users` ser igual ao de `auth.users`** — se um dia alguém for criado só no Supabase Auth, sem espelho em `public.users`, cairá em `/admin/sem-acesso`.

## 4. Stack

| Camada | Tecnologia | Versão / Nota |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI runtime | React | 19 |
| Linguagem | TypeScript estrito | `strict: true`, `noUncheckedIndexedAccess: true` (toolchain ainda não montado — ver seção 3) |
| Estilo | Tailwind CSS | 4 (CSS variables como design tokens) |
| Componentes | shadcn/ui | última |
| Banco | PostgreSQL via Supabase | **cloud** — projeto `eurofarma` / org `fiap` (ver seção 13) |
| ORM | Prisma | **6.x** (fixado; não atualizar para 7 sem migração) |
| Validação | Zod | **3.x** (fixado; APIs do v4 mudaram) |
| Auth | Supabase Auth (`@supabase/ssr` 0.10) | **em uso** no admin: base 5.1, login 5.2, middleware + role 5.3 |
| Forms | React Hook Form + Zod | instalados (RHF 7 + `@hookform/resolvers` 5); usados no `SearchFilters` |
| Conteúdo | MDX | educativo, políticas, termos |
| Pacotes | pnpm | obrigatório (não usar npm/yarn) |
| Node | 22 LTS planejado | ambiente atual roda Node 24 |
| Testes | Vitest | unit + integration (sprint futuro) |
| Testes e2e | Playwright | sprint futuro |

O banco é **Supabase cloud** (sem Docker local). Migrations são geradas com Prisma **offline** (`prisma migrate diff`) e aplicadas via **MCP do Supabase** (`apply_migration`) — o `prisma migrate dev` não roda bem no cloud (shadow DB) nem pelo pooler. `DATABASE_URL` no `.env.local` aponta para o **pooler** (porta 6543, `pgbouncer=true`); o CLI do Prisma lê o `.env.local` via `dotenv-cli`. Pin de Prisma 6 e Zod 3 são intencionais (ver seção 13).

## 5. Setup local passo a passo

Pré-requisitos: Node 22 LTS (ambiente atual usa 24), pnpm. **Não precisa de Docker nem Supabase CLI** — o banco é cloud.

```bash
# 1. Clonar e entrar no repo
git clone https://github.com/RuyFichman/eurofarma.git && cd eurofarma

# 2. Variáveis de ambiente
cp .env.example .env.local   # preencher DATABASE_URL (pooler) e chaves; NUNCA commitar .env.local

# 3. Instalar dependências
pnpm install

# 4. Gerar o Prisma Client
pnpm db:generate

# 5. (schema já aplicado no cloud) Validar a camada lib
pnpm check:validators        # smoke test dos validators/slug, deve dar "Falhou: 0"

# 6. Rodar o servidor de desenvolvimento (após o scaffold do Next.js existir)
pnpm dev
```

> Migrations **não** se aplicam com `prisma migrate dev` aqui. Gere o SQL offline com
> `pnpm exec prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`,
> salve em `prisma/migrations/<timestamp>_<nome>/migration.sql` e aplique via MCP do Supabase
> (`apply_migration`). Registre no `_prisma_migrations` com o checksum SHA-256 do arquivo.

> **Se o seu ambiente não tem o MCP do Supabase:** faça os dois primeiros passos — gerar o SQL
> offline e salvar o arquivo — e **pare aí**, avisando o usuário para aplicar. Não tente aplicar a
> migration por outro caminho. `pnpm db:migrate` continua não funcionando para ninguém: o banco é
> cloud e a `DATABASE_URL` aponta para o pooler.

> **Mais de um agente com acesso ao mesmo banco.** Claude Code e Codex podem ter o MCP do Supabase
> ao mesmo tempo, e os dois escrevem no **mesmo** projeto cloud — não há banco local nem staging para
> amortecer erro. Duas consequências práticas: (1) antes de qualquer `apply_migration`/`execute_sql`,
> confirme que o `project_id` é `mvixmggxwbrljlovfvac`; (2) o `_prisma_migrations` é preenchido **à
> mão** com o checksum SHA-256, então antes de aplicar uma migration verifique se o outro agente já
> não a aplicou — `list_migrations` primeiro, sempre. Migration aplicada duas vezes ou registrada
> pela metade deixa o histórico inconsistente, e não há rollback automático.

> **O que é recuperável, para calibrar o cuidado.** As 487 unidades **não** são insubstituíveis: elas
> vêm dos CSVs versionados em `data/seeds/units/` e o `prisma/seed.ts` faz upsert por slug, então
> `pnpm db:seed` reconstrói a tabela `units`. O admin sai de `pnpm db:seed-admin`. O que **não** tem
> como recriar é `whatsapp_clicks` (analytics acumulada) e `nutriz_profiles` (PII que a pessoa
> confiou à plataforma — e que, uma vez perdida, não dá para pedir de volta). Trate essas duas
> tabelas com mais cuidado que as demais; não é motivo para paralisar trabalho nas outras.

Scripts disponíveis em `package.json` (estado atual):

| Script | Ação | Funciona? |
|---|---|---|
| `pnpm db:generate` | Prisma generate | ✅ |
| `pnpm db:migrate` | `dotenv -e .env.local -- prisma migrate dev` | ⚠️ não usar no cloud (shadow/pooler) |
| `pnpm db:studio` | `dotenv -e .env.local -- prisma studio` | ✅ |
| `pnpm db:seed` | `dotenv -e .env.local -- prisma db seed` | ✅ |
| `pnpm db:seed-admin` | provisiona o admin inicial (Supabase Auth + `public.users`) | ✅ |
| `pnpm db:set-admin-password` | redefine a senha do admin inicial via Admin API | ✅ |
| `pnpm check:validators` | smoke test dos validators (`tsx`) | ✅ |
| `pnpm dev` / `build` / `start` | Next.js (dev / build de produção / serve) | ✅ |
| `pnpm lint` | ESLint (`eslint .`) | ✅ |
| `pnpm typecheck` | `tsc --noEmit` | ✅ |
| `pnpm format` / `format:check` | Prettier (escreve / verifica) | ✅ |
| `pnpm check` | `lint` + `typecheck` + `format:check` | ✅ |
| `pnpm test` | Vitest (`vitest run`); variantes `test:watch` / `test:unit` / `test:integration` / `test:coverage` | ✅ |

## 6. Estrutura de pastas

```
lactare/
├── AGENTS.md               # guia operacional dos agentes (fonte da verdade)
├── CLAUDE.md               # só importa o AGENTS.md via @AGENTS.md
├── README.md
├── .env.example
├── .env.local              # NUNCA commitar
├── .nvmrc                  # Node 22
├── .gitignore
├── package.json
├── tsconfig.json
├── middleware.ts           # gate de autenticação de /admin/* + refresh de sessão
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.mjs
├── prettier.config.mjs
├── prisma/
│   ├── schema.prisma       # fonte da verdade do schema
│   ├── migrations/
│   └── seed.ts
├── app/
│   ├── layout.tsx          # layout raiz
│   ├── (public)/           # área pública (landing, busca, cadastro)
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # landing
│   │   ├── sobre/
│   │   ├── como-funciona/           # educativo (MDX)
│   │   ├── buscar/
│   │   ├── banco-de-leite/[slug]/
│   │   ├── cadastro/
│   │   ├── obrigada/
│   │   ├── privacidade/
│   │   └── termos/
│   ├── admin/              # painel admin — segmento LITERAL /admin/* (não route group)
│   │   ├── layout.tsx      # noindex de toda a área admin (sem chrome)
│   │   ├── actions.ts      # Server Action de logout
│   │   ├── login/          # /admin/login (5.2): page.tsx, login-form.tsx, actions.ts
│   │   ├── sem-acesso/     # sessão válida sem role ADMIN (5.3)
│   │   └── (painel)/       # telas protegidas — o group NÃO aparece na URL
│   │       ├── layout.tsx  # gate de role (requireAdminUser) + AdminShell
│   │       ├── dashboard/  # /admin/dashboard (placeholder na 5.3, dados na 5.4)
│   │       ├── unidades/   # /admin/unidades (5.6) — listagem; nova/ e [id]/editar são sprint futura
│   │       ├── nutrizes/   # (futuro)
│   │       ├── conteudos/  # (futuro)
│   │       └── campanhas/  # (futuro)
│   ├── api/                # route handlers
│   │   ├── units/
│   │   ├── cities/
│   │   ├── nutriz/
│   │   ├── track/          # tracking de cliques wa.me
│   │   └── admin/
│   ├── not-found.tsx
│   ├── error.tsx
│   └── global-error.tsx
├── components/
│   ├── ui/                 # shadcn/ui — NÃO editar manualmente
│   ├── shared/             # header, footer, cards reutilizáveis
│   └── admin/              # shell do painel: sidebar, header, nav, mobile-nav, user-menu
├── lib/
│   ├── db/                 # cliente Prisma singleton
│   ├── admin/              # navegação do painel (key+href; rótulos no i18n)
│   ├── auth/               # helpers Supabase Auth (clients, gate de role, next path)
│   ├── validators/         # schemas Zod (fonte única)
│   ├── analytics/          # PostHog (futuro)
│   ├── i18n/               # copy pt-br em constantes
│   └── utils/              # utilitários puros
├── content/
│   ├── educativo/          # MDX da página educativa
│   └── legal/              # MDX de privacidade e termos
├── data/
│   └── seeds/
│       └── units/          # CSVs de bancos de leite
├── public/
└── docs/                   # documentação técnica adicional
```

## 7. Princípios não-negociáveis

1. **TypeScript estrito.** Nenhum `any`. Tipagem explícita em toda API pública (props, retornos de função exportada, parâmetros de route handlers). Use `unknown` + validação Zod quando o tipo for incerto.
2. **Server Components por padrão.** Marque `"use client"` apenas quando há interatividade real: forms, filtros, estado local, event handlers, hooks de browser. Busca de dados e renderização estática ficam no servidor.
3. **Mobile-first.** Projete primeiro para 375px. No Tailwind, escreva o estilo base para mobile e use `md:` / `lg:` para telas maiores. Nunca o contrário (nada de `max-md:`).
4. **Validação Zod em toda entrada.** Tanto no form (client) quanto no route handler (server). Schemas centralizados em `lib/validators/`. Nunca confie em dado vindo do cliente sem revalidar no servidor.
5. **Acessibilidade WCAG AA.** Contraste suficiente, navegação completa por teclado, `label` em todo input, ARIA quando necessário. Prefira componentes shadcn/ui — já são acessíveis.
6. **LGPD desde o dia 1.** Minimização de dados. NÃO colete CPF, RG, data de nascimento nem dados de saúde. Consentimento explícito via checkbox NÃO pré-marcado para qualquer coleta. Colete apenas o mínimo para o contato (nome, cidade/estado, forma de contato).
7. **Copy em pt-br via constantes** em `lib/i18n/pt-br.ts`. Não hardcode texto visível em componentes.
8. **Componentes pequenos.** Máximo ~200 linhas. Passou disso, quebre em subcomponentes.
9. **Linguagem acolhedora.** A nutriz está em momento emocionalmente sensível. Evite imperativos rígidos ("Você DEVE doar") e termos clínicos sem necessidade. Tom convidativo e gentil.

## 8. Convenções de código

Nomenclatura:

| Item | Padrão | Exemplo |
|---|---|---|
| Arquivos | `kebab-case` | `unit-card.tsx`, `format-phone.ts` |
| Componentes (export) | `PascalCase` | `UnitCard` |
| Funções / variáveis | `camelCase` | `formatPhone` |
| Constantes globais | `UPPER_SNAKE_CASE` | `WA_BASE_URL` |
| Tipos / interfaces | `PascalCase`, sem prefixo `I` | `Unit`, `NutrizInput` |
| Schemas Zod | `<entidade>Schema` | `unitCreateSchema` |
| Pastas | `kebab-case` | `banco-de-leite/` |

Correto: `components/shared/unit-card.tsx` exportando `UnitCard`.
Incorreto: `components/shared/UnitCard.tsx` ou `components/shared/unitCard.tsx`.

Imports:

- Use sempre caminho absoluto com `@/` (configurado em `tsconfig.json`).
- Correto: `import { db } from "@/lib/db"`. Incorreto: `import { db } from "../../lib/db"`.

Formatação:

- Prettier é a autoridade. Não discuta estilo manualmente — rode `pnpm format`.
- ESLint para regras de qualidade. Antes de considerar uma tarefa pronta, rode `pnpm check`.

## 9. Convenções de Git

- **Conventional Commits** obrigatório: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`.
- Branch principal: `main`. Branches de feature: `feat/nome-curto` (ex.: `feat/busca-por-cidade`).
- PRs explicam o **porquê** da mudança, não só o quê.
- Husky + lint-staged rodam lint e format no `pre-commit`. Não burle os hooks.

## 10. Validação e segurança

- **Zod em toda entrada de usuário**, client e server. Um schema por entidade em `lib/validators/`, reutilizado nos dois lados. Exemplo:

```ts
// lib/validators/nutriz.ts
import { z } from "zod";

export const nutrizCreateSchema = z.object({
  nome: z.string().min(2).max(120),
  cidade: z.string().min(2).max(120),
  estado: z.string().length(2),
  whatsapp: z.string().regex(/^\d{10,11}$/),
  consentimento: z.literal(true), // checkbox obrigatório, não pré-marcado
});

export type NutrizCreateInput = z.infer<typeof nutrizCreateSchema>;
```

- **LGPD:** minimização de dados. Sem CPF/RG/data de nascimento/dados de saúde. Consentimento explícito e registrado. Páginas de privacidade e termos em `content/legal/`.
- **Rate limiting:** `POST /api/nutriz` limita 5/min por IP (`lib/security/rate-limit.ts`, Sprint 4.4), `POST /api/track` limita 30/min por IP (Sprint 3.8) e o login admin tem lockout de 5 falhas/5min por email (`lib/auth/login-rate-limit.ts`, Sprint 5.2). Os três são **em memória, por processo** — trocar por store distribuído antes de deploy multi-instância.
- Nunca exponha segredos no cliente. Variáveis sensíveis ficam em `.env.local` (fora do git) e só em código de servidor.

## 11. Como trabalhar neste projeto

> **ISOLAMENTO — leia antes de qualquer coisa.** Esta máquina tem **outros projetos** do usuário que também usam Supabase, Prisma, Next.js e ferramentas parecidas. NUNCA toque em nada fora do diretório deste projeto (`C:\fiap\eurofarma`, ou `/mnt/c/fiap/eurofarma` no WSL). Em concreto:
> - **Não** edite, mova ou apague arquivos fora desta pasta.
> - **Não** rode comandos globais que afetem outros projetos: nada de `pnpm -g`, `npm i -g`, `prisma` apontando para outro schema, `supabase link`/`supabase start` de outro projeto, `git` em outro repositório, alterar `~/.npmrc`, variáveis de ambiente do sistema, etc.
> - **Banco:** opere SOMENTE no projeto Supabase `eurofarma` (ref `mvixmggxwbrljlovfvac`, org `fiap`). Antes de qualquer `apply_migration`/`execute_sql` via MCP, confirme que o `project_id` é esse. Nunca rode DDL/seed contra outro projeto.
> - **MCP do Supabase:** se `list_organizations` não retornar a org `fiap`, **pare** e avise — pode estar conectado na conta de outro projeto. Não aplique mudanças "no que estiver conectado".
> - **Configuração recomendada do MCP quando mais de um agente trabalha no repo.** Só **um** agente
>   deve ter escrita no banco (hoje o Claude Code, que executa o fluxo de migration com o registro
>   manual no `_prisma_migrations`). Os demais recebem o MCP escopado e somente-leitura:
>   `https://mcp.supabase.com/mcp?project_ref=mvixmggxwbrljlovfvac&read_only=true`.
>   `read_only=true` roda toda query como usuário Postgres de leitura — `SELECT`, `list_tables`,
>   `list_migrations` e `get_advisors` continuam funcionando, `apply_migration` e escrita não.
>   `project_ref` trava no projeto e **desabilita as ferramentas de conta**, então a regra do bullet
>   acima deixa de depender de o agente reparar no erro: `list_organizations` nem existe. Isso
>   transforma a regra de isolamento em garantia do servidor em vez de instrução neste arquivo.
> - Use sempre caminhos **dentro** deste repo. Na dúvida sobre escopo, pergunte em vez de agir.

Ao receber uma tarefa neste projeto:

1. **Leia este arquivo primeiro.** Ele é a fonte das convenções.
2. **Antes de criar um schema Zod**, verifique `lib/validators/` — pode já existir.
3. **Antes de criar um componente de UI**, verifique se um componente shadcn/ui em `components/ui/` já resolve. Não reinvente botão, input, dialog, etc.
4. **Decida Server vs Client Component** pelo critério do Princípio 2. Na dúvida, Server.
5. **Texto visível** sempre via `lib/i18n/pt-br.ts`. Não hardcode.
6. **Coloque cada coisa no seu lugar:** rota em `app/`, componente compartilhado em `components/shared/`, lógica pura em `lib/utils/`, acesso a dados via `lib/db/`.
7. **Não sugira deploy, domínio, produção, CI/CD ou monitoramento** como ação atual. Estamos em local.
8. **Ao terminar**, rode `pnpm check` e `pnpm test` e relate o resultado real, inclusive falhas. O `pnpm check:validators` continua disponível como smoke test rápido dos validators.
9. **Se uma decisão arquitetural nova for tomada**, registre-a na seção 13 deste arquivo.
10. **Não peça aprovação** para seguir convenções já definidas aqui — apenas siga.

## 12. O que está fora de escopo no MVP

- Chatbot/integração WhatsApp Business API (usar `wa.me` direto).
- Geolocalização avançada / "perto de mim" por GPS.
- Mapa interativo.
- Aplicativo mobile nativo.
- BI / data warehouse / relatórios avançados.
- Multi-idioma (apenas pt-br).

## 13. Decisões arquiteturais importantes

- **WhatsApp via `wa.me` direto** (não Business API) → custo zero e tracking suficiente no MVP via rota `api/track`.
- **Supabase cloud, não local em Docker** → decisão de 2026-05-31. Sem Docker/Supabase CLI na máquina e foco em velocidade de MVP. Projeto `eurofarma`, org `fiap`, ref `mvixmggxwbrljlovfvac`, região `sa-east-1`. Trade-off aceito: diverge do isolamento local; RLS precisa ser tratado antes de exposição pública.
- **Migrations geradas offline + aplicadas via MCP do Supabase** → `prisma migrate dev` não funciona no cloud (shadow DB sem permissão) e não temos a senha do banco fora do `.env.local`. Geramos o SQL com `prisma migrate diff` e aplicamos com `apply_migration`; o `_prisma_migrations` é populado manualmente com o checksum SHA-256 do arquivo. `.gitattributes` força `eol=lf` para o checksum não quebrar.
- **Prisma fixado em 6.x** → o schema usa `datasource.url` e generator `prisma-client-js`, removidos no Prisma 7. Migração para o 7 (driver adapters + `prisma.config.ts`) fica para o sprint de deploy na Vercel, onde o ganho serverless compensa.
- **Zod fixado em 3.x** → o código usa `z.nativeEnum`, `z.string().email()`, `z.literal(true,{message})`, APIs deprecadas/alteradas no Zod 4.
- **Prisma como ORM** sobre o Postgres do Supabase → migrations versionadas e queries type-safe; schema é a fonte da verdade.
- **App Router com route group `(public)`** → separação clara de layouts e responsabilidades sem poluir a URL. A área **admin**, porém, usa **segmento literal `app/admin/`** (não route group), para ter URLs `/admin/*` — ver o bullet da Sprint 5.2.
- **Copy centralizada em `lib/i18n/pt-br.ts`** → consistência de tom e facilidade de revisão de linguagem acolhedora.
- **shadcn/ui** em vez de biblioteca de componentes fechada → controle total do código, acessibilidade e theming via CSS variables.
- **Paleta Azul** (trocada da Berry/Sage/Cream em 2026-06-01, a pedido do time) → tokens HSL em `app/globals.css`. `--primary` usa o **azul profundo `#3A7AB8`** e não o azul claro `#5BA4D4` pedido originalmente para botões, porque `#5BA4D4` com texto branco fica em ~2.7:1 e reprova no WCAG AA (Princípio 5); o azul claro vira acento em `--ring`/charts/sidebar. Não re-litigar sem aceitar abrir mão do AA.
- **Token `--whatsapp` (verde de marca)** → criado em 2026-06-01 para o CTA "Perguntar no WhatsApp" da página educativa, a pedido do time (que quis o verde do mockup em vez do azul da paleta). Foi a primeira exceção à paleta azul (a segunda são os `--topic-*`, abaixo). O verde foi **aprofundado para `hsl(142 71% 30%)`** porque o `#25D366` puro do WhatsApp fica em ~2:1 com texto branco e reprova no WCAG AA (Princípio 5); o tom escolhido dá ~5:1. Continua sendo um token (`bg-whatsapp`), nunca hex hardcoded.
- **APIs públicas de busca (Sprints 3.1/3.2)** → contrato REST estável: `state` sempre obrigatório e normalizado (trim+uppercase); erros 400 com **código por campo** (`MISSING_STATE`/`INVALID_STATE`/`INVALID_TYPE`/`INVALID_HAS_WHATSAPP`/`INVALID_PAGE`/`INVALID_LIMIT`) e 500 `INTERNAL_ERROR` **sem vazar** stack/Prisma/`error.message`; UF válida sem resultado → lista vazia + 200 (nunca 404); cache via `Cache-Control` + `export const revalidate` (1h em cities, 5min em units), `no-store` nos erros. O `/api/units` usa `select` restrito + mapper para **nunca** expor `adminNotes`/`adminResponsibleId`/e-mail/instruções/coords/timestamps/PII. Tipos públicos em **snake_case** (`milk_bank`...) desacoplados do enum Prisma.
- **`UnitCard` definitivo + tracking preparado (Sprint 3.5)** → o card é Server Component (`components/shared/unit-card.tsx`); toda a interatividade (links + tracking) fica isolada em `unit-card-actions.tsx` (`'use client'`), mantendo o card no servidor. O clique no WhatsApp dispara `navigator.sendBeacon('/api/track', ...)` com fallback `fetch({keepalive:true})` — **não bloqueia** o redirect e **ignora 404** silenciosamente (a rota `/api/track` é da Sprint 3.8). Evento `whatsapp_clicked`; payload carrega só id/slug da unidade + `source` + path + UTMs + referrer (**zero PII da nutriz**). O campo `whatsappMessage` passou a integrar o contrato público (`PublicUnit`/`PUBLIC_UNIT_SELECT`) — é a saudação voltada à nutriz, não dado admin. Utils de telefone migraram de `format-phone.ts` para `lib/utils/phone.ts` e o `whatsapp.ts` passou a API por objeto. **Nota de reconciliação:** o prompt da sprint assumia `unit-search-result-card.tsx` e `lib/db/queries/search-units.ts`, mas a 3.4 já consolidou o card em `unit-card.tsx` e a query em `searchPublicUnits` (`lib/db/queries/units.ts`) — mantive esses nomes para não duplicar.
- **Página `/buscar` server-first + query compartilhada (Sprint 3.4)** → o `SearchFilters` (Client) escreve os filtros na URL e a página é um **Server Component** que lê `searchParams` e renderiza os resultados no servidor — **sem self-fetch** do próprio `/api/units` (evita hop HTTP e URL absoluta em RSC). A lógica de busca foi extraída para `searchPublicUnits` em `lib/db/queries/units.ts`, **fonte única** consumida tanto pelo route handler quanto pela página; o `select` público virou `PUBLIC_UNIT_SELECT` no mapper (mantém colunas e tipo em sincronia). `<Suspense>` keyed pelos params mostra esqueleto durante a navegação por filtros. Endereço público exibe **bairro/cidade/UF** (rua/número não estão no contrato 3.2). **Intencionalmente fora desta tela** (falta de dado estruturado ou §12): mapa (a definir depois), distância/"perto de mim" por GPS, rating/estrelas, "aberto agora" (horário é texto livre, sem timezone) e o "Chatbot WhatsApp" do mockup — o canal de contato é por unidade via `wa.me` (tracking por `api/track` é sprint futuro).
- **`lib/constants/unit-types.ts` é Prisma-free (Sprint 3.3)** → como `SearchFilters` é Client Component e depende (via validator) dos tipos públicos, importar `@prisma/client` ali arrastaria o Prisma para o bundle do navegador. Os mapas enum↔público ficam isolados em `lib/constants/unit-types-prisma.ts` (só servidor: route handlers, mappers, seeds). Regra geral: **nada importado por Client Component pode transitar para `@prisma/client`**. Imports dentro de `lib/` usam caminho relativo entre irmãos (o Vitest não resolve o alias `@/`); `app/` e `components/` usam `@/`.
- **Página de detalhes + SEO local (Sprint 3.6)** → `/banco-de-leite/[slug]` é Server Component que busca por slug ATIVO (`getActiveUnitBySlug`, `select` restrito `UNIT_DETAIL_SELECT` no `unit-detail-mapper.ts` — nunca expõe admin/PII), `notFound()` para inexistente/inativa, `revalidate=3600` e `generateMetadata` por template no i18n. Schema.org **`LocalBusiness`** (não `MedicalBusiness`, para evitar classificação médica sem validação jurídica), sem campos vazios, renderizado via `dangerouslySetInnerHTML` com escape de `<`. Mapa = **imagem estática Mapbox** (`lib/maps/mapbox-static.ts`, prefere `NEXT_PUBLIC_MAPBOX_TOKEN`); **sem token → fallback textual** de endereço (não bloqueia). A página **não** tem `<main>` próprio (o layout `(public)` já provê).
- **Cadastro da nutriz adaptado do mockup (Sprints 4.1/4.5)** → o mockup enviado era uma tela de **login/criar conta com CPF + senha**; foi **reinterpretado** para o cadastro real: opt-in **mínimo sob LGPD** (nome, WhatsApp, UF, cidade, consentimento não pré-marcado) — **sem CPF** (veto Princípio 6), **sem senha/login** (auth é Sprint 5, nutriz não tem conta no modelo). Mantido só o **visual** split-screen (marca Lactare). `signupFormSchema` em `lib/validators/signup-form.ts` é **Prisma-free** (Client) e espelha o `nutrizSignupSchema` server. `/cadastro` (página, não modal) → no sucesso **redireciona para `/obrigada`** (4.5; `robots:noindex`).
- **Endpoint de cadastro `POST /api/nutriz` (Sprints 4.3/4.4)** → `runtime="nodejs"` (Prisma). Cadastro **opcional**. Contrato: `201 {ok:true}` **sem nenhum dado pessoal**; erros padronizados via `lib/utils/api-errors.ts` (`INVALID_JSON` 400 / `VALIDATION_ERROR` 400 com `fields` seguros / `LGPD_CONSENT_REQUIRED` 400 quando o consentimento é o único problema / `RATE_LIMITED` 429 / `INTERNAL_ERROR` 500 sem vazar Prisma/stack). **Upsert lógico** por `phoneWhatsapp` (a coluna **não é `@unique`** — `findFirst`+`update`/`create` em `$transaction`; re-cadastro limpa `deletedAt`). UTMs por `sanitizeSourceUtm` (só as 5 chaves, trim, máx 200, `null` se vazio). **Turnstile (Sprint 4.2) foi dispensado pelo time** no MVP (decisão registrada; TODO para reintroduzir antes de exposição pública). **Reconciliação:** o prompt da 4.3 assumia `nutriz-signup-modal.tsx` + Turnstile prontos; a realidade é a página `/cadastro`+`signup-form.tsx` (4.1) e sem Turnstile — segui essa realidade.
- **Rate limiting em memória (Sprint 4.4)** → `lib/security/rate-limit.ts` é janela fixa **por processo**, 5/min por IP (header `x-forwarded-for`/`x-real-ip`, fallback `unknown`). Suficiente para local/single-server; **não compartilha estado entre instâncias serverless** — trocar por store distribuído (Redis/Upstash) mantendo a mesma interface antes de deploy. Não instalou dependência nova.
- **Supabase Auth no admin (Sprints 5.1/5.2)** → base com **`@supabase/ssr`**: `createSupabaseServerClient` (cookies via `next/headers`; `setAll` em try/catch — a renovação de token virá do middleware na 5.3) e `createSupabaseBrowserClient`, ambos com `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (a anon/publishable key, pública por design; a **service_role NUNCA** vai pro client). Login em `/admin/login` via **Server Action** `signInWithPassword` (cookie de sessão no SSR); erro **sempre genérico** ("Email ou senha inválidos.", nunca `error.message`); **lockout em memória por email** (5 falhas/5min — por-processo, handoff p/ store distribuído em prod, não usa IP p/ minimizar PII); recuperação por `resetPasswordForEmail` com **mensagem genérica anti-enumeração**. Validação dupla (client RHF + server) com `adminLoginSchema`/`adminPasswordResetSchema` (mensagens em `ADMIN_LOGIN`). Middleware de proteção global + checagem de role + layout/dashboard ficam para as Sprints 5.3/5.4.
- **Shell administrativo e a renumeração 5.3/5.4 (Sprint 5.4)** → o plano original deste arquivo dizia "5.3 = middleware + role + layout admin" e "5.4 = dashboard"; o time redefiniu a **5.4 como o layout administrativo** e o dashboard funcional virou a **5.5**. Na prática a 5.3 entregou um shell inicial e a 5.4 o **refinou** conforme a spec: breakpoint `lg` (não `md`), header sticky separado da sidebar, `max-w-7xl` no conteúdo (tabelas futuras), navegação extraída para `lib/admin/navigation.ts` e copy do shell isolada em `ADMIN_LAYOUT` (o objeto `ADMIN` ficou só com copy de **telas**: dashboard e sem-acesso). `/admin/dashboard` segue **placeholder** — indicadores reais são sprint futura. Regra que sobrevive: **rótulo nunca mora em `lib/admin/navigation.ts`** (só `key`+`href`), e esse módulo precisa continuar Prisma-free porque é consumido por Client Component.
- **Proteção do painel em dois gates: middleware (Edge) + layout (Node) (Sprint 5.3)** → o `middleware.ts` da raiz cobre todo `/admin/*` e faz **só autenticação** (`supabase.auth.getUser()`, que revalida no servidor em vez de confiar no cookie) mais a **renovação do token** de sessão — por isso todo retorno passa por `withSessionCookies`, senão um redirect descartaria o token recém-emitido. A **checagem de role NÃO cabe no middleware**: ele roda no Edge e o role vive no Postgres, alcançável só via Prisma (Node). Esse segundo gate é o `app/admin/(painel)/layout.tsx`, que chama `requireAdminUser()`. Consequência a respeitar: **toda tela protegida nova entra dentro de `(painel)/`** — criar uma página direto em `app/admin/` lhe dá o gate de sessão, mas **não** o de role. `/admin/login` e `/admin/sem-acesso` ficam de fora do group de propósito (herdar o layout do painel faria o gate redirecionar para elas mesmas, em loop). O `?next=` passa por `sanitizeAdminNextPath` (só caminho relativo dentro de `/admin`, rejeita `//host`, `://` e `\`) para não virar open redirect. Alternativa descartada: `experimental.nodeMiddleware` do Next 15 para usar Prisma no middleware — experimental demais para o MVP, e concentrar autorização perto dos dados é mais seguro. O lockout de login (5.2) e o rate limit (4.4) continuam **em memória por processo** — mesma dívida de store distribuído antes de deploy multi-instância.
- **Tracking com lista fechada de eventos (Sprint 3.8)** → não existe modelo genérico de evento no schema: há `WhatsappClick` e `ContactIntent`, tabelas próprias. Então `POST /api/track` aceita **um** evento (`whatsapp_clicked`) validado por `z.literal`, e evento novo exige entrada no validator **e** uma tabela que o comporte — nunca um `metadata` JSON solto. O payload do cliente traz `unit_slug`, `source` e `path`, que **não são persistidos** por não terem coluna (o Zod os descarta); ficam declarados no validator só para documentar o contrato. Unidade inexistente é detectada pelo **P2003 da FK**, não por um `SELECT` prévio — num endpoint de tracking uma consulta a mais por clique não se paga. Rate limit de 30/min (não 5 como no cadastro): clicar em várias unidades na busca é uso legítimo.
- **Dashboard 5.5: agregação por UF, nunca por cidade** → com a base pequena, "nutrizes por cidade" reidentifica a pessoa (1 ou 2 cadastros num município). Toda agregação de nutriz é por UF e respeita `deletedAt`. A **cobertura geográfica conta só unidades `ACTIVE`** — uma UF que só tem unidade pendente não está atendida, e exibi-la como cobertura enganaria. Indicador zerado **nunca** aparece como "0" pelado: cada cartão troca a linha de contexto por uma explicação do porquê, porque com a base atual o estado vazio é o caminho principal, não a exceção. Sem `force-dynamic` na página: o `requireAdminUser()` do layout lê cookies, o que já torna a rota dinâmica (confirmado no build, `ƒ /admin/dashboard`).
- **Admin é segmento literal `app/admin/`, não route group (Sprint 5.2)** → para a URL ser `/admin/login` (e futuramente `/admin/dashboard`), a área admin vive em `app/admin/` **literal**. Um route group `(admin)` seria **omitido da URL** (resultaria em `/login`, `/dashboard` — colide com o namespace público e contraria as URLs `/admin/*` esperadas). O layout/chrome admin virá em `app/admin/layout.tsx` (5.3). Isto **revisa** a menção a route group `(admin)` que constava do §3/§6 originais. `/admin/login` herda só o root layout (sem Header/Footer públicos), exatamente o desejado para a tela de login.

- **Listagem de unidades server-first, com a URL como estado (Sprint 5.6)** → `/admin/unidades` é Server Component puro: `parseAdminUnitFilters` lê `q`/`status`/`type`/`state`/`city`/`page` da URL e `getAdminUnits` consulta o Prisma direto — **sem self-fetch** de `/api/units` (mesma decisão da 3.4) e sem estado de cliente. O formulário de filtros é **GET nativo**, não o padrão Client+RHF da 3.3: aqui nenhum campo depende de outro (a cidade é texto livre, não select alimentado por API), então o form nativo entrega o mesmo com zero JS, é acessível por construção e — por não ter campo `page` — já reseta a paginação ao submeter. Isso força um `<select>` **nativo** no lugar do `Select` do shadcn, que é Radix e não envia valor em submit sem estado no cliente. O contrato de URL do painel usa **os próprios valores do enum** (`status=ACTIVE`), diferente do `snake_case` desacoplado da API pública, porque não é superfície pública; a leitura é tolerante (`?status=active` funciona) e valor inválido é **ignorado**, nunca erro — URL editada à mão não pode derrubar o painel. `page` tem teto (10.000) porque `skip` do Prisma é Int32. Ordenação `status → name → id`: o `id` garante paginação estável (nomes se repetem entre cidades) e, em Postgres, `status asc` segue a ordem de declaração do enum (PENDING, ACTIVE, INACTIVE), o que põe o que aguarda revisão no topo. A listagem tem **DTO admin próprio** (`AdminUnitListItem`) em vez de reusar o mapper público: mostra situação (que o público nunca vê) e reduz telefone/WhatsApp a **indicadores booleanos** — o número é assunto da tela de edição. Estados vazios são dois e não podem ser trocados: base sem nenhuma unidade convida a cadastrar a primeira; filtro sem resultado convida a limpar os filtros. O link "Ver página pública" só aparece em unidade `ACTIVE`, porque `/banco-de-leite/[slug]` chama `notFound()` para PENDING/INACTIVE (regra da 3.6). Copy em `ADMIN.units`, seguindo a convenção de que `ADMIN` guarda copy **de telas** e `ADMIN_LAYOUT` a do shell.

- **Transcrição da base da rBLH e isolamento dos testes (Sprint 1.4)** → os dados chegam como **texto colado**, não como planilha: o time manda o bloco de um estado por vez e a transcrição para CSV é feita aqui. Por isso as regras de normalização são explícitas e valem para as próximas cargas: cidade em CAIXA ALTA vira capitalização normal e recebe acento (`SAO LUIS` → São Luís); nomes em caixa alta idem; `00`/`000`/`--`/`---`/`S/Nº` no campo de número são preenchimento vazio (viram vazio ou `S/N`); número de porta perde o ponto de milhar; setor/quadra/lote e "Campus X" são **juntados ao logradouro** em vez de virarem complemento descartado; referências de localização ("em frente à Caixa Econômica", "Saída para Araruna") vão para `instructions`, que é exibido na página da unidade; rodovia com número (`Rodovia PR, 558`) é logradouro, não porta; e sufixos de UF/cidade no nome (`/PB`, `- MS`, `GO`) são removidos porque o card já mostra a localização. **Telefone é o campo mais sujo:** faltando DDD, ele é inferido pela cidade (feito em Manaus, Fortaleza, São Luís e Juiz de Fora); truncado (menos de 10 dígitos) fica **vazio**, nunca completado a esmo; e `0` de prefixo interurbano é removido. Correção de cidade só acontece com **duas evidências independentes** (nome da unidade + faixa de CEP, ou prefixo telefônico) — foi o caso de Santa Terezinha de Itaipu/PR, Francisco Morato/SP e Guarulhos/SP. **Consequência estrutural:** com as 27 UFs povoadas, teste de integração **não pode mais se isolar escolhendo uma UF vazia** — o isolamento é por `TEST_CITY` (queries públicas, que filtram por cidade) ou pelo prefixo `__test__` no nome (query admin, que filtra por `q`).

- **Tokens `--topic-*` para os cartões do "Comece por Aqui" (2026-08-29)** → a seção 1 de `/como-funciona` usa **uma família de cor por assunto** (azul = elegibilidade, verde = mitos, lilás = segurança), a pedido do time, que apontou o mockup original como referência. São seis tokens em `globals.css` (`--topic-blue|green|lilac` + `-foreground`), registrados no `@theme inline` — a regra de **nunca hardcodar cor** continua valendo, e por isso a exceção virou token em vez de `bg-[#...]`. Cada `-foreground` foi escolhido para passar WCAG AA sobre a superfície da própria família; medido no navegador: link 5,55–6,08:1, título ~13:1, descrição 5,21–5,43:1. **Uso restrito a essa seção** — o resto do site segue a paleta azul, e espalhar essas cores por outras telas transformaria a exceção em segunda paleta. O `ContentSectionHeader` ganhou `descriptionPlacement="beside"` para a descrição ficar ao lado do título (como no mockup) sem mudar as outras seções, que continuam no padrão `below`.

- **Formulário de unidade valida, mas não normaliza nem grava (Sprint 5.7)** → o `adminUnitFormSchema` mantém **todo campo como string com o que o admin digitou**: sem `.transform()` para dígitos, sem `'' → null`. Converter para o formato de armazenamento (telefone só com dígitos, WhatsApp com DDI 55 via `whatsappSchema`, CEP `00000-000`, vazio → `null`) é responsabilidade explícita da 5.8, junto com a gravação — assim existe **um** ponto onde o dado muda de forma, em vez de dois discordando. As regras de dígito do form espelham as de `lib/validators/common.ts`; se uma mudar, as duas mudam. Coordenadas são **texto**, não `z.number()`: o input precisa distinguir "vazio" de "zero", e `valueAsNumber` transforma campo vazio em `NaN`. `lat`/`lng` valem como **par** — uma sozinha não localiza nada e quebraria o mapa estático da 3.6. Tipo e situação usam `.refine` com type predicate em vez de `z.enum` porque a entrada precisa representar "nada selecionado" (`''`) enquanto a saída já sai estreitada no literal, pronta para a 5.8 mapear ao enum do Prisma. **Slug não é editável** e nem aparece como campo: ele compõe a URL pública (`/banco-de-leite/[slug]`), e ensinar o admin a mexer nela quebraria links já divulgados — na edição ele é exibido como leitura, com atalho para a página pública **só quando a unidade está `ACTIVE`** (a rota da 3.6 dá `notFound()` em PENDING/INACTIVE). Unidade nova nasce **`PENDING`**, acompanhando o `@default(PENDING)` do schema: publicar é ato deliberado, não efeito colateral de cadastrar. O submit da 5.7 **não lê os valores validados** — enquanto não há persistência, nada justifica trafegar ou registrar dado de unidade — e o aviso diz "Formulário validado", nunca "cadastrada com sucesso", porque nada foi gravado.

- **Mutações de unidade por Server Action, com a normalização em um lugar só (Sprint 5.8)** → o gate de rota da 5.3 protege a *tela*, não a *mutação*: Server Action é endpoint próprio e por isso cada uma chama `requireAdminUser()` **antes de qualquer trabalho** e **fora do `try`** (o `redirect` interno do helper sinaliza por exceção e seria engolido pelo `catch`). O payload é revalidado no servidor com o **mesmo** `adminUnitFormSchema` do cliente — a validação do browser é UX, a do servidor é integridade. A normalização vive só em `normalize-unit-input.ts` e reusa os schemas de `lib/validators/common.ts` mais o `normalizeBrazilianWhatsappNumber` do público: é isso que faz uma unidade cadastrada pela tela ficar **indistinguível** de uma importada do CSV da rBLH (CEP `00000-000`, telefone só dígitos, WhatsApp com DDI 55 — formatos conferidos na base). A gravação passa por uma **lista explícita de colunas** (`toUnitWriteData`), nunca `data: input`: `id`, `slug`, timestamps, `adminNotes` e `adminResponsibleId` não têm caminho a partir do formulário. `adminResponsibleId` **não é preenchido** — apesar de existir mapeamento seguro (`public.users.id` = `auth.users.id`), o campo significa "admin responsável pela unidade", não "quem editou por último", e atribuí-lo seria inventar regra de domínio. O slug é calculado **uma vez, na criação**, com sufixo escolhido em uma única consulta (`findAvailableUnitSlug`) em vez de um loop de `SELECT`s; a corrida remanescente é fechada pelo `@unique`, com P2002 virando conflito legível. **Update nunca regera slug.** Erro de banco jamais chega à UI como veio: `error.message`, código do Prisma e stack ficam no servidor. A revalidação cobre também `/`, `/api/units` e `/api/cities`, que têm cache próprio — sem isso, publicar uma unidade não apareceria na busca até o TTL expirar. **Exclusão continua fora de escopo**: apagar unidade tem implicações de integridade referencial (`WhatsappClick` tem FK RESTRICT), de histórico de links públicos e de métricas, e merece sprint própria.

- **A listagem de nutrizes é tratada como tela de dado pessoal, não como mais um CRUD** → unidade é instituição, nutriz é pessoa, e isso muda o desenho em quatro pontos concretos. (1) O **soft delete não é filtro opcional**: `deletedAt: null` faz parte da consulta, porque quem pediu exclusão não pode reaparecer no painel (o `POST /api/nutriz` limpa `deletedAt` se ela voltar a se cadastrar — o registro volta por decisão dela, não do painel). (2) **Não existe filtro por cidade**, embora exista em unidades: numa base pequena, filtrar município isola indivíduos — é a mesma razão pela qual o dashboard da 5.5 agrega nutriz só por UF. (3) O **WhatsApp aparece mascarado** (`(11) •••••-••21`) com botão de revelar por linha: o painel é aberto em demonstração com frequência, e revelar linha a linha expõe só o contato de quem está sendo atendido naquele momento. É redução de exposição visual, **não** controle de acesso — o número está no HTML, e quem não pode vê-lo não deveria ter sessão de admin. (4) **Não há exportação em massa**: um botão de CSV transformaria a tela numa superfície de exfiltração de PII, e nada no MVP pede isso. O `select` também deixa `sourceUtm` de fora — é dado de campanha, não ajuda quem vai atender, e traria rastreamento para uma tela que já mostra PII. O estado vazio de base **não tem call to action**, diferente do de unidades: não existe "cadastrar primeira nutriz" pelo painel, porque quem se cadastra é a própria pessoa, com consentimento explícito. Consentimento LGPD e permissão de campanha ficam visíveis na linha porque governam o que pode ser enviado — descobrir isso na hora do disparo é tarde.

## 14. Glossário

- **Nutriz:** mãe que está amamentando; público principal da plataforma e potencial doadora de leite.
- **Banco de leite humano (BLH):** serviço que coleta, processa, controla a qualidade e distribui leite humano a recém-nascidos que precisam.
- **Ponto de coleta:** unidade vinculada a um BLH que recebe doações, mas não faz todo o processamento.
- **rBLH:** Rede Brasileira de Bancos de Leite Humano; rede nacional que articula os BLHs e pontos de coleta.
- **Doação de leite:** ato de a nutriz doar o excedente de leite materno para abastecer os bancos de leite.
- **LGPD:** Lei Geral de Proteção de Dados; norma brasileira que rege a coleta e o tratamento de dados pessoais.
