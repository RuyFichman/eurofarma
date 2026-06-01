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
- Supabase Auth (planejado para sprint futuro).
- Playwright e2e (planejado para sprint futuro).
- **shadcn/ui** — fundação pronta (`components.json`, util `cn` em `lib/utils/cn.ts`, tokens em `app/globals.css`), mas nenhum componente instalado ainda. Use `pnpm dlx shadcn@latest add <componente>` quando precisar.
- **Route groups `(public)`/`(admin)`, `lib/i18n/pt-br.ts`, `content/`, `data/`** — ainda não criados; nascem nos sprints de feature.

Quando precisar mencionar esses itens, marque-os explicitamente como "previsto para sprints futuros".

O scaffold do Next.js **já existe** e a esteira de qualidade funciona: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format`, `pnpm check` e `pnpm check:validators` rodam todos. TS estrito ativo (`strict` + `noUncheckedIndexedAccess`); imports com `@/*` mapeiam para a raiz.

**Pendência de segurança aberta:** RLS (Row Level Security) está **desabilitado** em todas as 8 tabelas no Supabase cloud. Como a `publishable key` é pública, isso expõe leitura/escrita de tudo (incluindo `nutriz_profiles`). Habilitar RLS + policies é pré-requisito antes de qualquer exposição pública do app.

**Progresso por sprint:** Sprint 0 (scaffold Next.js 15 + Tailwind 4 + TS estrito + ESLint/Prettier) ✅ · 1.1 (schema Prisma) ✅ · 1.2 (migration inicial) ✅ · 1.3 (lib: prisma singleton, validators Zod, slug) ✅. Próximos: 1.4 (CSVs reais), 1.5 (seed), 1.6 (admin seed), 1.7 (Vitest).

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
| Auth | Supabase Auth | sprint futuro — não usar ainda |
| Forms | React Hook Form + Zod | — |
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
│   ├── (admin)/            # painel admin (protegido em sprint futuro)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── dashboard/
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
- **App Router com route groups** `(public)` e `(admin)` → separação clara de layouts e responsabilidades sem poluir a URL.
- **Copy centralizada em `lib/i18n/pt-br.ts`** → consistência de tom e facilidade de revisão de linguagem acolhedora.
- **shadcn/ui** em vez de biblioteca de componentes fechada → controle total do código, acessibilidade e theming via CSS variables.

## 14. Glossário

- **Nutriz:** mãe que está amamentando; público principal da plataforma e potencial doadora de leite.
- **Banco de leite humano (BLH):** serviço que coleta, processa, controla a qualidade e distribui leite humano a recém-nascidos que precisam.
- **Ponto de coleta:** unidade vinculada a um BLH que recebe doações, mas não faz todo o processamento.
- **rBLH:** Rede Brasileira de Bancos de Leite Humano; rede nacional que articula os BLHs e pontos de coleta.
- **Doação de leite:** ato de a nutriz doar o excedente de leite materno para abastecer os bancos de leite.
- **LGPD:** Lei Geral de Proteção de Dados; norma brasileira que rege a coleta e o tratamento de dados pessoais.
