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

Quando precisar mencionar esses itens, marque-os explicitamente como "previsto para sprints futuros".

## 4. Stack

| Camada | Tecnologia | Versão / Nota |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI runtime | React | 19 |
| Linguagem | TypeScript estrito | `strict: true`, `noUncheckedIndexedAccess: true` |
| Estilo | Tailwind CSS | 4 (CSS variables como design tokens) |
| Componentes | shadcn/ui | última |
| Banco | PostgreSQL via Supabase | local (Docker) via `supabase start` |
| ORM | Prisma | schema declarativo + migrations |
| Auth | Supabase Auth | sprint futuro — não usar ainda |
| Forms | React Hook Form + Zod | — |
| Conteúdo | MDX | educativo, políticas, termos |
| Pacotes | pnpm | obrigatório (não usar npm/yarn) |
| Node | 22 LTS | fixar em `.nvmrc` |
| Testes | Vitest | unit + integration |
| Testes e2e | Playwright | sprint futuro |

No início, o banco é **Supabase local em Docker**. `DATABASE_URL` aponta para `localhost`. Não conectar à cloud para desenvolvimento.

## 5. Setup local passo a passo

Pré-requisitos: Node 22 LTS, pnpm, Docker (para Supabase local), Supabase CLI.

```bash
# 1. Clonar e entrar no repo
git clone <repo> lactare && cd lactare

# 2. Garantir a versão correta do Node
nvm use            # lê .nvmrc (22 LTS)

# 3. Variáveis de ambiente
cp .env.example .env.local   # editar valores locais; NUNCA commitar .env.local

# 4. Instalar dependências
pnpm install

# 5. Subir o Supabase local (Postgres em Docker)
supabase start

# 6. Aplicar migrations
pnpm db:migrate

# 7. Popular dados de exemplo
pnpm db:seed

# 8. Rodar o servidor de desenvolvimento
pnpm dev

# 9. Acessar
# http://localhost:3000
```

Scripts disponíveis em `package.json`:

| Script | Ação |
|---|---|
| `pnpm dev` | Next.js em modo dev |
| `pnpm build` | build de produção |
| `pnpm start` | servidor de produção |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier (escreve) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` | lint + typecheck + format check |
| `pnpm test` | Vitest |
| `pnpm db:generate` | Prisma generate |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:seed` | popular banco |

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

Ao receber uma tarefa neste projeto:

1. **Leia este arquivo primeiro.** Ele é a fonte das convenções.
2. **Antes de criar um schema Zod**, verifique `lib/validators/` — pode já existir.
3. **Antes de criar um componente de UI**, verifique se um componente shadcn/ui em `components/ui/` já resolve. Não reinvente botão, input, dialog, etc.
4. **Decida Server vs Client Component** pelo critério do Princípio 2. Na dúvida, Server.
5. **Texto visível** sempre via `lib/i18n/pt-br.ts`. Não hardcode.
6. **Coloque cada coisa no seu lugar:** rota em `app/`, componente compartilhado em `components/shared/`, lógica pura em `lib/utils/`, acesso a dados via `lib/db/`.
7. **Não sugira deploy, domínio, produção, CI/CD ou monitoramento** como ação atual. Estamos em local.
8. **Ao terminar**, rode `pnpm check` (e `pnpm test` quando houver testes) e relate o resultado real.
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
- **Supabase local em Docker** em vez da cloud no início → desenvolvimento isolado, sem custo, sem dependência de rede.
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
