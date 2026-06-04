# CLAUDE.md

## 1. Sobre este arquivo

Este é o guia operacional do Claude Code para o projeto Lactare Digital. Leia este arquivo por completo antes de qualquer tarefa. Ele define stack, convenções, estrutura e o que está dentro e fora de escopo. Atualize-o sempre que uma decisão arquitetural for tomada, uma convenção mudar, ou o estágio do projeto avançar (ex.: quando deploy entrar em escopo).

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
- Middleware de proteção global das rotas admin + checagem de role (a base do Supabase Auth e a tela `/admin/login` já existem — Sprints 5.1/5.2 —, mas a proteção por middleware/role é Sprint 5.3/5.4).
- Playwright e2e (planejado para sprint futuro).
- **`content/`** — ainda não criado; nasce no sprint de conteúdo/MDX. A **área admin já existe** como **segmento literal `app/admin/`** (URLs `/admin/*`), iniciada por `/admin/login` (5.2) — **não** é route group `(admin)` (que seria omitido da URL); ver §13. (O grupo `(public)` já existe, com `layout.tsx` — Header + `<main id="main-content">` + Footer — a home `/` e `/style-guide`.)

Quando precisar mencionar esses itens, marque-os explicitamente como "previsto para sprints futuros".

O scaffold do Next.js **já existe** e a esteira de qualidade funciona: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format`, `pnpm check`, `pnpm check:validators` e `pnpm test`/`test:unit`/`test:integration`/`test:coverage` (Vitest) rodam todos. TS estrito ativo (`strict` + `noUncheckedIndexedAccess`); imports com `@/*` mapeiam para a raiz.

**Design system:** tokens visuais em `app/globals.css` (paleta **Azul** em HSL: primary azul profundo `#3A7AB8`, secondary/accent azul suave `#D6EAFF`, fundo azul gelado `#F4F9FF`, texto/footer navy `#1A2B3C`, acento azul claro `#5BA4D4` em ring/charts/sidebar; radius, shadows; Tailwind v4 `@theme inline`, sem dark mode; `--whatsapp` é o verde de marca do WhatsApp — exceção única à paleta azul, ver seção 13). Fonte **Inter** via `next/font`. **shadcn/ui instalado** — componentes em `components/ui/` (button, card, input, label, select, checkbox, radio-group, badge). Adicione mais com `pnpm dlx shadcn@latest add <componente>`. Referência visual viva em `/style-guide`. Nunca hardcode cor (`bg-[#...]`); use os tokens (`bg-primary`, `text-muted-foreground`, etc.).

**Layout público e copy:** `Header` (Client — sticky, glass, nav desktop + `Sheet` mobile, link ativo via `usePathname`) e `Footer` (Server — `bg-sidebar`) vivem em `components/shared/` e são aplicados a tudo no grupo `(public)` via seu `layout.tsx`. Páginas em `(public)` NÃO devem ter `<main>` próprio (o layout já provê `<main id="main-content">`). Logo em `components/shared/logo.tsx` (SVG gota inline, placeholder até o oficial). **Toda string visível vem de `lib/i18n/pt-br.ts`** (`SITE`/`NAV`/`FOOTER`/`A11Y`) — nunca hardcode texto.

**Pendência de segurança aberta:** RLS (Row Level Security) está **desabilitado** em todas as 8 tabelas no Supabase cloud. Como a `publishable key` é pública, isso expõe leitura/escrita de tudo (incluindo `nutriz_profiles`). Habilitar RLS + policies é pré-requisito antes de qualquer exposição pública do app. **Atenção:** o endpoint público `POST /api/nutriz` (Sprint 4.3) já grava PII de nutriz nessa tabela — reforça que RLS, rate limiting distribuído (o da 4.4 é em memória) e anti-spam (Turnstile, dispensado por ora) são pré-requisitos antes de qualquer exposição pública.

**Progresso por sprint:** Sprint 0 (scaffold) ✅ · 1.1 (schema Prisma) ✅ · 1.2 (migration inicial) ✅ · 1.3 (lib: prisma singleton, validators Zod, slug) ✅ · 1.5 (seed de unidades — 6 unidades ACTIVE) ✅ · 1.6 (seed do admin via Supabase Auth) ✅ · 1.7 (Vitest: 66 testes — unit + integração; `findUnitsByLocation` em `lib/db/queries/units.ts`) ✅ · 2.1 (design tokens + shadcn + style guide) ✅ · 2.2 (header + footer responsivos + i18n `lib/i18n/pt-br.ts`) ✅ · 2.3 (landing pública: hero, stats, "quem faz parte da rede", dicas e CTA final — Server Components em `components/shared/home-*.tsx`, copy em `HOME` no i18n) ✅ · 2.4 (sobre: hero, história, missão, linha do tempo, parcerias e CTA final — Server Component em `app/(public)/sobre/page.tsx`, copy em `ABOUT` no i18n; datas e logos com `TODO` p/ validação Eurofarma) ✅ · 2.5 (página educativa em `/como-funciona`, rota e nav reusados: hero com busca, "Comece por Aqui", "O Caminho da Doação" (timeline 5 passos), vídeos, checklist interativo, "Amamentação na Prática", "Histórias Reais" e FAQ — Server Components em `components/shared/content-*.tsx`, **só o checklist é Client**; FAQ usa `<details>` nativo, sem JS; copy em `CONTENT` no i18n. Construída como hub **estruturado, não MDX** — artigos MDX individuais ficam para depois; chatbot trocado por WhatsApp direto (§12), busca/chips presentational, depoimentos ilustrativos e links "Ler artigo" com `TODO`) ✅ · 3.1 (API pública `GET /api/cities?state=UF` — cidades distintas de unidades ACTIVE, ordenadas pt-BR; validator `lib/validators/location.ts` reusa `ufSchema`; cache 1h) ✅ · 3.2 (API pública paginada `GET /api/units` — filtros `state`(obrigatório)/`city`/`neighborhood`/`type`/`has_whatsapp` + `page`/`limit`; resposta `{filters,units,meta}`; `select` restrito + `lib/mappers/unit-mapper.ts` (sem campos admin/PII); `lib/validators/unit-search.ts` com códigos 400 distintos por campo; cache 5min) ✅ · 3.3 (componente `components/shared/search-filters.tsx` — Client, React Hook Form + Zod, sincroniza filtros na URL via App Router, busca cidades em `/api/cities` com `AbortController`; copy em `SEARCH` no i18n; UFs em `lib/constants/brazilian-states.ts`; **não** renderizado ainda — entra em `/buscar` na 3.4) ✅ · 3.4 (página `/buscar` — Server Component lê os filtros da URL e renderiza os resultados **server-side**: `SearchFilters` (Client, 3.3) escreve os filtros na URL → `SearchResults` (async Server, `components/shared/search-results.tsx`) consome `searchPublicUnits` — query compartilhada nova em `lib/db/queries/units.ts`, **fonte única** reusada pelo route handler `/api/units` (o `select` público virou `PUBLIC_UNIT_SELECT` no mapper); `UnitCard` (Server, `components/shared/unit-card.tsx`) com badge de tipo, endereço bairro/cidade/UF, horário (texto livre) e CTA WhatsApp via `wa.me` (token `--whatsapp`) ou telefone via `tel:`; utils puros `lib/utils/whatsapp.ts` + `lib/utils/format-phone.ts`; estados inicial/vazio/erro, paginação por links e `<Suspense>` com esqueleto; copy em `SEARCH.page`/`results`/`pagination`/`card`. **Fora de escopo nesta tela** (sem dados ou §12): mapa, distância/"perto de mim" por GPS, rating/estrelas, "aberto agora" e o "Chatbot WhatsApp" do mockup — contato é por unidade via `wa.me`) ✅ · 3.5 (`UnitCard` definitivo — Server Component `components/shared/unit-card.tsx` com nome, badge de tipo, endereço resumido `Bairro, Cidade - UF`, horário com fallback e badges "Telefone/WhatsApp disponível"; ações isoladas no Client Component `components/shared/unit-card-actions.tsx`: "Ligar" (`tel:`), "WhatsApp" (`wa.me` com `whatsappMessage` da unidade ou mensagem padrão) e "Ver detalhes" → `/banco-de-leite/[slug]` (página é da 3.6). Tracking do clique no WhatsApp **preparado** via `navigator.sendBeacon` → fallback `fetch({keepalive:true})` para `/api/track` (rota só na 3.8; 404 ignorado, **nunca** bloqueia o redirect; evento `whatsapp_clicked`, payload sem PII da nutriz). Utils puros `lib/utils/whatsapp.ts` (`normalizeBrazilianWhatsappNumber`/`buildWhatsappUrl({phone,message})`) e `lib/utils/phone.ts` (substituem `format-phone.ts`); `whatsappMessage` + `contact.hasPhone` adicionados ao `PublicUnit`/`PUBLIC_UNIT_SELECT`; copy em `SEARCH.page.unitCard`) ✅ · 3.6 (página de detalhes `/banco-de-leite/[slug]` — Server Component, busca por slug ATIVO via `getActiveUnitBySlug` + `UNIT_DETAIL_SELECT`/`lib/mappers/unit-detail-mapper.ts`, `notFound()` se inexistente/inativa, `export const revalidate=3600`, `generateMetadata` por template no i18n, JSON-LD `LocalBusiness` em `lib/seo/unit-json-ld.ts`, mapa estático Mapbox com fallback textual (`lib/maps/mapbox-static.ts` — sem token → fallback), ações isoladas em `components/shared/unit-detail-actions.tsx`; copy em `UNIT_DETAIL`; **sem `<main>` próprio** (o layout `(public)` já provê)) ✅ · 4.1 (cadastro da nutriz em `/cadastro` — split-screen `SignupHero` (Server) + `SignupForm` (Client, RHF + Zod `signupFormSchema` **Prisma-free**); **coleta mínima LGPD**: nome, WhatsApp, UF, cidade, consentimento — **sem CPF, sem senha, sem login** (o mockup era tela de login/CPF; adaptado à marca Lactare e aos campos reais); copy em `SIGNUP`) ✅ · 4.5 (página `/obrigada` pós-cadastro — Server Component, mensagem humanizada, CTAs "Encontrar banco próximo"→`/buscar` e "Ver como funciona a doação"→`/como-funciona`, `robots: noindex`; copy em `THANKS`) ✅ · 4.3 (`POST /api/nutriz` — cadastro **opcional**; `runtime="nodejs"`, Zod `nutrizSignupApiSchema`, normalização de WhatsApp, **upsert lógico** por `phoneWhatsapp` (não é `@unique` → `findFirst`+`update`/`create` em `$transaction`), `lgpdConsentAt=now()`, `marketingConsent=false`, `WHATSAPP`/`INTERESTED`, UTMs sanitizadas (`lib/utils/utm.ts`), erros padronizados (`lib/utils/api-errors.ts`: `INVALID_JSON`/`VALIDATION_ERROR`/`LGPD_CONSENT_REQUIRED`/`INTERNAL_ERROR`), `201 {ok:true}` sem PII; **Turnstile (4.2) dispensado pelo time** no MVP) ✅ · 4.4 (rate limiting em `POST /api/nutriz` — `lib/security/rate-limit.ts` **em memória**, 5/min por IP → `429 RATE_LIMITED` + `Retry-After`; **por-processo**, trocar por store distribuído antes de deploy multi-instância; e o `/cadastro` agora **redireciona para `/obrigada`** no sucesso) ✅ · 5.1 (base Supabase Auth — `@supabase/ssr`: `lib/auth/supabase-server.ts` (`createServerClient` + cookies do `next/headers`), `supabase-client.ts` (`createBrowserClient`) e `get-current-user.ts`; usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como anon key — service_role nunca no client) ✅ · 5.2 (login admin em **`/admin/login`** — Server Component `app/admin/login/page.tsx` (redireciona p/ `/admin/dashboard` se já logado) + `LoginForm` Client (RHF + Zod `adminLoginSchema`, mostrar/ocultar senha, "Esqueci minha senha") + Server Actions `actions.ts` (`loginAdminAction`/`requestAdminPasswordResetAction`); `signInWithPassword` via Supabase com **erro genérico** (nunca vaza `error.message`), **lockout em memória por email** (5 falhas/5min, `lib/auth/login-rate-limit.ts`) e recuperação **anti-enumeração**; copy em `ADMIN_LOGIN`; `components/ui/alert.tsx` adicionado. **Rota = segmento literal `app/admin/`** para a URL ser `/admin/login` (route group `(admin)` seria omitido) — ver §13. Sem middleware/layout/dashboard) ✅. Próximos: 5.3 (middleware de proteção + role + layout admin), 5.4 (dashboard), 4.2 (anti-spam Turnstile — dispensado por ora), 1.4 (CSVs reais), 2.6 (privacidade/termos legais em MDX).

**Admin inicial:** provisionado por `pnpm db:seed-admin` (email em `INITIAL_ADMIN_EMAIL`, hoje `admin@lactare.local`). Existe em `auth.users` (Supabase Auth) e em `public.users` com `role=ADMIN`, mesmo `id` nas duas tabelas. Script idempotente: re-rodar não regenera senha. Reset de senha é manual via painel do Supabase. O fluxo de login do painel (`/admin/login`) foi implementado na Sprint 5.2 (base de auth `@supabase/ssr` na 5.1) e autentica esse admin via `signInWithPassword`. A proteção global por middleware/role e o dashboard são Sprints 5.3/5.4.

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
| Auth | Supabase Auth (`@supabase/ssr` 0.10) | **em uso** no admin (login 5.2/base 5.1); middleware + role 5.3+ |
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

Scripts disponíveis em `package.json` (estado atual):

| Script | Ação | Funciona? |
|---|---|---|
| `pnpm db:generate` | Prisma generate | ✅ |
| `pnpm db:migrate` | `dotenv -e .env.local -- prisma migrate dev` | ⚠️ não usar no cloud (shadow/pooler) |
| `pnpm db:studio` | `dotenv -e .env.local -- prisma studio` | ✅ |
| `pnpm db:seed` | `dotenv -e .env.local -- prisma db seed` | sprint 1.5 |
| `pnpm check:validators` | smoke test dos validators (`tsx`) | ✅ |
| `pnpm dev` / `build` / `start` | Next.js (dev / build de produção / serve) | ✅ |
| `pnpm lint` | ESLint (`eslint .`) | ✅ |
| `pnpm typecheck` | `tsc --noEmit` | ✅ |
| `pnpm format` / `format:check` | Prettier (escreve / verifica) | ✅ |
| `pnpm check` | `lint` + `typecheck` + `format:check` | ✅ |
| `pnpm test` | placeholder — Vitest chega no Sprint 1.7 | — |

## 6. Estrutura de pastas

```
lactare/
├── CLAUDE.md
├── README.md
├── .env.example
├── .env.local              # NUNCA commitar
├── .nvmrc                  # Node 22
├── .gitignore
├── package.json
├── tsconfig.json
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
│   │   ├── login/          # /admin/login (5.2): page.tsx, login-form.tsx, actions.ts
│   │   ├── layout.tsx      # (futuro 5.3 — chrome admin + proteção)
│   │   ├── dashboard/      # (futuro)
│   │   ├── unidades/
│   │   ├── nutrizes/
│   │   ├── conteudos/
│   │   └── campanhas/
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
│   └── admin/              # componentes do painel
├── lib/
│   ├── db/                 # cliente Prisma singleton
│   ├── auth/               # helpers Supabase Auth (futuro)
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
- **Rate limiting:** planejado para sprints futuros nas rotas `api/nutriz` e `api/track`. Quando implementar, documentar aqui.
- Nunca exponha segredos no cliente. Variáveis sensíveis ficam em `.env.local` (fora do git) e só em código de servidor.

## 11. Como interagir com Claude Code

> **ISOLAMENTO — leia antes de qualquer coisa.** Esta máquina tem **outros projetos** do usuário que também usam Supabase, Prisma, Next.js e ferramentas parecidas. NUNCA toque em nada fora do diretório deste projeto (`C:\fiap\eurofarma`). Em concreto:
> - **Não** edite, mova ou apague arquivos fora desta pasta.
> - **Não** rode comandos globais que afetem outros projetos: nada de `pnpm -g`, `npm i -g`, `prisma` apontando para outro schema, `supabase link`/`supabase start` de outro projeto, `git` em outro repositório, alterar `~/.npmrc`, variáveis de ambiente do sistema, etc.
> - **Banco:** opere SOMENTE no projeto Supabase `eurofarma` (ref `mvixmggxwbrljlovfvac`, org `fiap`). Antes de qualquer `apply_migration`/`execute_sql` via MCP, confirme que o `project_id` é esse. Nunca rode DDL/seed contra outro projeto.
> - **MCP do Supabase:** se `list_organizations` não retornar a org `fiap`, **pare** e avise — pode estar conectado na conta de outro projeto. Não aplique mudanças "no que estiver conectado".
> - Use sempre caminhos **dentro** deste repo. Na dúvida sobre escopo, pergunte em vez de agir.

Ao receber uma tarefa neste projeto:

1. **Leia este arquivo primeiro.** Ele é a fonte das convenções.
2. **Antes de criar um schema Zod**, verifique `lib/validators/` — pode já existir.
3. **Antes de criar um componente de UI**, verifique se um componente shadcn/ui em `components/ui/` já resolve. Não reinvente botão, input, dialog, etc.
4. **Decida Server vs Client Component** pelo critério do Princípio 2. Na dúvida, Server.
5. **Texto visível** sempre via `lib/i18n/pt-br.ts`. Não hardcode.
6. **Coloque cada coisa no seu lugar:** rota em `app/`, componente compartilhado em `components/shared/`, lógica pura em `lib/utils/`, acesso a dados via `lib/db/`.
7. **Não sugira deploy, domínio, produção, CI/CD ou monitoramento** como ação atual. Estamos em local.
8. **Ao terminar**, rode a verificação disponível e relate o resultado real. Hoje é `pnpm check:validators` (smoke test); `pnpm check`/`pnpm test` só quando o toolchain existir.
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
- **Token `--whatsapp` (verde de marca)** → criado em 2026-06-01 para o CTA "Perguntar no WhatsApp" da página educativa, a pedido do time (que quis o verde do mockup em vez do azul da paleta). É a **única exceção** à paleta azul. O verde foi **aprofundado para `hsl(142 71% 30%)`** porque o `#25D366` puro do WhatsApp fica em ~2:1 com texto branco e reprova no WCAG AA (Princípio 5); o tom escolhido dá ~5:1. Continua sendo um token (`bg-whatsapp`), nunca hex hardcoded.
- **APIs públicas de busca (Sprints 3.1/3.2)** → contrato REST estável: `state` sempre obrigatório e normalizado (trim+uppercase); erros 400 com **código por campo** (`MISSING_STATE`/`INVALID_STATE`/`INVALID_TYPE`/`INVALID_HAS_WHATSAPP`/`INVALID_PAGE`/`INVALID_LIMIT`) e 500 `INTERNAL_ERROR` **sem vazar** stack/Prisma/`error.message`; UF válida sem resultado → lista vazia + 200 (nunca 404); cache via `Cache-Control` + `export const revalidate` (1h em cities, 5min em units), `no-store` nos erros. O `/api/units` usa `select` restrito + mapper para **nunca** expor `adminNotes`/`adminResponsibleId`/e-mail/instruções/coords/timestamps/PII. Tipos públicos em **snake_case** (`milk_bank`...) desacoplados do enum Prisma.
- **`UnitCard` definitivo + tracking preparado (Sprint 3.5)** → o card é Server Component (`components/shared/unit-card.tsx`); toda a interatividade (links + tracking) fica isolada em `unit-card-actions.tsx` (`'use client'`), mantendo o card no servidor. O clique no WhatsApp dispara `navigator.sendBeacon('/api/track', ...)` com fallback `fetch({keepalive:true})` — **não bloqueia** o redirect e **ignora 404** silenciosamente (a rota `/api/track` é da Sprint 3.8). Evento `whatsapp_clicked`; payload carrega só id/slug da unidade + `source` + path + UTMs + referrer (**zero PII da nutriz**). O campo `whatsappMessage` passou a integrar o contrato público (`PublicUnit`/`PUBLIC_UNIT_SELECT`) — é a saudação voltada à nutriz, não dado admin. Utils de telefone migraram de `format-phone.ts` para `lib/utils/phone.ts` e o `whatsapp.ts` passou a API por objeto. **Nota de reconciliação:** o prompt da sprint assumia `unit-search-result-card.tsx` e `lib/db/queries/search-units.ts`, mas a 3.4 já consolidou o card em `unit-card.tsx` e a query em `searchPublicUnits` (`lib/db/queries/units.ts`) — mantive esses nomes para não duplicar.
- **Página `/buscar` server-first + query compartilhada (Sprint 3.4)** → o `SearchFilters` (Client) escreve os filtros na URL e a página é um **Server Component** que lê `searchParams` e renderiza os resultados no servidor — **sem self-fetch** do próprio `/api/units` (evita hop HTTP e URL absoluta em RSC). A lógica de busca foi extraída para `searchPublicUnits` em `lib/db/queries/units.ts`, **fonte única** consumida tanto pelo route handler quanto pela página; o `select` público virou `PUBLIC_UNIT_SELECT` no mapper (mantém colunas e tipo em sincronia). `<Suspense>` keyed pelos params mostra esqueleto durante a navegação por filtros. Endereço público exibe **bairro/cidade/UF** (rua/número não estão no contrato 3.2). **Intencionalmente fora desta tela** (falta de dado estruturado ou §12): mapa (a definir depois), distância/"perto de mim" por GPS, rating/estrelas, "aberto agora" (horário é texto livre, sem timezone) e o "Chatbot WhatsApp" do mockup — o canal de contato é por unidade via `wa.me` (tracking por `api/track` é sprint futuro).
- **`lib/constants/unit-types.ts` é Prisma-free (Sprint 3.3)** → como `SearchFilters` é Client Component e depende (via validator) dos tipos públicos, importar `@prisma/client` ali arrastaria o Prisma para o bundle do navegador. Os mapas enum↔público ficam isolados em `lib/constants/unit-types-prisma.ts` (só servidor: route handlers, mappers, seeds). Regra geral: **nada importado por Client Component pode transitar para `@prisma/client`**. Imports dentro de `lib/` usam caminho relativo entre irmãos (o Vitest não resolve o alias `@/`); `app/` e `components/` usam `@/`.
- **Página de detalhes + SEO local (Sprint 3.6)** → `/banco-de-leite/[slug]` é Server Component que busca por slug ATIVO (`getActiveUnitBySlug`, `select` restrito `UNIT_DETAIL_SELECT` no `unit-detail-mapper.ts` — nunca expõe admin/PII), `notFound()` para inexistente/inativa, `revalidate=3600` e `generateMetadata` por template no i18n. Schema.org **`LocalBusiness`** (não `MedicalBusiness`, para evitar classificação médica sem validação jurídica), sem campos vazios, renderizado via `dangerouslySetInnerHTML` com escape de `<`. Mapa = **imagem estática Mapbox** (`lib/maps/mapbox-static.ts`, prefere `NEXT_PUBLIC_MAPBOX_TOKEN`); **sem token → fallback textual** de endereço (não bloqueia). A página **não** tem `<main>` próprio (o layout `(public)` já provê).
- **Cadastro da nutriz adaptado do mockup (Sprints 4.1/4.5)** → o mockup enviado era uma tela de **login/criar conta com CPF + senha**; foi **reinterpretado** para o cadastro real: opt-in **mínimo sob LGPD** (nome, WhatsApp, UF, cidade, consentimento não pré-marcado) — **sem CPF** (veto Princípio 6), **sem senha/login** (auth é Sprint 5, nutriz não tem conta no modelo). Mantido só o **visual** split-screen (marca Lactare). `signupFormSchema` em `lib/validators/signup-form.ts` é **Prisma-free** (Client) e espelha o `nutrizSignupSchema` server. `/cadastro` (página, não modal) → no sucesso **redireciona para `/obrigada`** (4.5; `robots:noindex`).
- **Endpoint de cadastro `POST /api/nutriz` (Sprints 4.3/4.4)** → `runtime="nodejs"` (Prisma). Cadastro **opcional**. Contrato: `201 {ok:true}` **sem nenhum dado pessoal**; erros padronizados via `lib/utils/api-errors.ts` (`INVALID_JSON` 400 / `VALIDATION_ERROR` 400 com `fields` seguros / `LGPD_CONSENT_REQUIRED` 400 quando o consentimento é o único problema / `RATE_LIMITED` 429 / `INTERNAL_ERROR` 500 sem vazar Prisma/stack). **Upsert lógico** por `phoneWhatsapp` (a coluna **não é `@unique`** — `findFirst`+`update`/`create` em `$transaction`; re-cadastro limpa `deletedAt`). UTMs por `sanitizeSourceUtm` (só as 5 chaves, trim, máx 200, `null` se vazio). **Turnstile (Sprint 4.2) foi dispensado pelo time** no MVP (decisão registrada; TODO para reintroduzir antes de exposição pública). **Reconciliação:** o prompt da 4.3 assumia `nutriz-signup-modal.tsx` + Turnstile prontos; a realidade é a página `/cadastro`+`signup-form.tsx` (4.1) e sem Turnstile — segui essa realidade.
- **Rate limiting em memória (Sprint 4.4)** → `lib/security/rate-limit.ts` é janela fixa **por processo**, 5/min por IP (header `x-forwarded-for`/`x-real-ip`, fallback `unknown`). Suficiente para local/single-server; **não compartilha estado entre instâncias serverless** — trocar por store distribuído (Redis/Upstash) mantendo a mesma interface antes de deploy. Não instalou dependência nova.
- **Supabase Auth no admin (Sprints 5.1/5.2)** → base com **`@supabase/ssr`**: `createSupabaseServerClient` (cookies via `next/headers`; `setAll` em try/catch — a renovação de token virá do middleware na 5.3) e `createSupabaseBrowserClient`, ambos com `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (a anon/publishable key, pública por design; a **service_role NUNCA** vai pro client). Login em `/admin/login` via **Server Action** `signInWithPassword` (cookie de sessão no SSR); erro **sempre genérico** ("Email ou senha inválidos.", nunca `error.message`); **lockout em memória por email** (5 falhas/5min — por-processo, handoff p/ store distribuído em prod, não usa IP p/ minimizar PII); recuperação por `resetPasswordForEmail` com **mensagem genérica anti-enumeração**. Validação dupla (client RHF + server) com `adminLoginSchema`/`adminPasswordResetSchema` (mensagens em `ADMIN_LOGIN`). Middleware de proteção global + checagem de role + layout/dashboard ficam para as Sprints 5.3/5.4.
- **Admin é segmento literal `app/admin/`, não route group (Sprint 5.2)** → para a URL ser `/admin/login` (e futuramente `/admin/dashboard`), a área admin vive em `app/admin/` **literal**. Um route group `(admin)` seria **omitido da URL** (resultaria em `/login`, `/dashboard` — colide com o namespace público e contraria as URLs `/admin/*` esperadas). O layout/chrome admin virá em `app/admin/layout.tsx` (5.3). Isto **revisa** a menção a route group `(admin)` que constava do §3/§6 originais. `/admin/login` herda só o root layout (sem Header/Footer públicos), exatamente o desejado para a tela de login.

## 14. Glossário

- **Nutriz:** mãe que está amamentando; público principal da plataforma e potencial doadora de leite.
- **Banco de leite humano (BLH):** serviço que coleta, processa, controla a qualidade e distribui leite humano a recém-nascidos que precisam.
- **Ponto de coleta:** unidade vinculada a um BLH que recebe doações, mas não faz todo o processamento.
- **rBLH:** Rede Brasileira de Bancos de Leite Humano; rede nacional que articula os BLHs e pontos de coleta.
- **Doação de leite:** ato de a nutriz doar o excedente de leite materno para abastecer os bancos de leite.
- **LGPD:** Lei Geral de Proteção de Dados; norma brasileira que rege a coleta e o tratamento de dados pessoais.
