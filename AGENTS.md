# AGENTS.md

## Leia o CLAUDE.md primeiro

**A fonte da verdade deste projeto é o [`CLAUDE.md`](./CLAUDE.md) na raiz.** Ele é o guia
operacional completo: visão do produto, stack, estado real de cada sprint, estrutura de pastas,
convenções e decisões arquiteturais.

**Abra e leia o `CLAUDE.md` por completo antes de qualquer tarefa.** Este arquivo existe só porque
o Codex não lê o `CLAUDE.md` automaticamente; ele é um resumo dos guardrails, não um substituto.

Não duplique conteúdo aqui. Decisão arquitetural nova vai para a **seção 13 do `CLAUDE.md`**;
estado de sprint, para a **seção 3**.

## Guardrails que valem mesmo se você não abriu o CLAUDE.md

### Isolamento (o mais importante)

Esta máquina tem **outros projetos** do usuário com Supabase, Prisma e Next.js. Nunca toque em nada
fora de `C:\fiap\eurofarma` (ou `/mnt/c/fiap/eurofarma` no WSL):

- Não edite, mova nem apague arquivos fora desta pasta.
- Nada de `pnpm -g` / `npm i -g`, `git` em outro repositório, `supabase link`/`start` de outro
  projeto, alteração de `~/.npmrc` ou de variáveis de ambiente do sistema.
- **Banco:** opere SOMENTE no projeto Supabase `eurofarma` (ref `mvixmggxwbrljlovfvac`, org `fiap`).
  Na dúvida sobre escopo, pergunte em vez de agir.

### Migrations — diferença importante no Codex

O fluxo documentado no `CLAUDE.md` aplica migrations pelo **MCP do Supabase** (`apply_migration`),
que o Codex normalmente **não** tem configurado. Então aqui:

1. Gere o SQL **offline**:
   `pnpm exec prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`
2. Salve em `prisma/migrations/<timestamp>_<nome>/migration.sql`.
3. **Pare aí** e avise o usuário para aplicar. Não tente aplicar por conta própria.

`pnpm db:migrate` (`prisma migrate dev`) **não funciona** neste projeto: o banco é Supabase cloud e
a `DATABASE_URL` aponta para o pooler. Não rode.

### Regras de código

- **pnpm obrigatório.** Nunca `npm` nem `yarn`.
- **TypeScript estrito, zero `any`.** Use `unknown` + Zod quando o tipo for incerto.
- **Server Components por padrão.** `"use client"` só com interatividade real. Nada importado por
  Client Component pode transitar para `@prisma/client`.
- **Zod em toda entrada**, client e server. Schemas em `lib/validators/` — confira se já existe.
- **Toda string visível vem de `lib/i18n/pt-br.ts`.** Nunca hardcode texto na UI.
- **Nunca hardcode cor** (`bg-[#...]`). Use os tokens de `app/globals.css` (`bg-primary`,
  `text-muted-foreground`, `bg-whatsapp`, `--topic-*`).
- **LGPD:** sem CPF, RG, data de nascimento ou dados de saúde. Consentimento por checkbox nunca
  pré-marcado.
- **Mobile-first:** estilo base para 375px, depois `md:`/`lg:`. Nunca `max-md:`.
- Antes de criar componente de UI, veja se um shadcn/ui em `components/ui/` já resolve.
  `components/ui/` **não se edita à mão**.
- Arquivos em `kebab-case`, componentes em `PascalCase`, imports com `@/` (exceto dentro de `lib/`,
  onde irmãos usam caminho relativo — o Vitest não resolve o alias).

### Fora de escopo (não sugira, não configure)

Deploy, domínio, staging/produção, CI/CD, monitoramento (Sentry/PostHog), Playwright e2e,
bibliotecas de gráficos, chatbot/WhatsApp Business API, mapa interativo, GPS, multi-idioma.
O projeto é **local**. Se precisar mencionar, marque como "previsto para sprints futuros".

### Antes de considerar a tarefa pronta

```bash
pnpm check   # lint + typecheck + format:check
pnpm test    # Vitest (unit + integração)
```

Rode e **relate o resultado real**, incluindo falhas.

### Git

Conventional Commits obrigatório (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`,
`style:`). Branches de feature: `feat/nome-curto`. Não burle o hook de pre-commit
(Husky + lint-staged). Não commite `.env.local`.

### Pendência de segurança aberta

RLS está **desabilitado** nas 8 tabelas do Supabase e a publishable key é pública — isso expõe
leitura/escrita de tudo, incluindo `nutriz_profiles` (que já recebe PII via `POST /api/nutriz`).
Habilitar RLS é pré-requisito antes de qualquer exposição pública. Não é motivo para travar
feature no MVP local, mas não invente que está resolvido.
