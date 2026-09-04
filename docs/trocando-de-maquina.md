# Trocando de máquina

Como continuar o NutriLink em outro computador (notebook em viagem, máquina de
outra pessoa do time) sem quebrar nada nem criar duas versões do projeto.

## Regra de ouro

**O repositório no GitHub é a fonte da verdade. `git push` antes de trocar de
máquina, sempre — nas duas direções.**

Não copie a pasta do projeto para pen drive. Dois motivos:

1. **Tamanho e fragilidade.** O repo limpo tem ~7 MB, mas `node_modules` tem
   ~1,3 GB e `.next` ~335 MB. Pior que a lentidão: `node_modules` contém
   binários compilados para a plataforma e arquitetura da máquina de origem
   (engines do Prisma, esbuild). `pnpm install` refaz tudo em minutos e certo.
2. **Divergência.** Duas cópias sem histórico compartilhado divergem no primeiro
   dia em que você mexer nas duas. O git existe exatamente para isso.

Também não há banco local para mover: o Postgres é **Supabase cloud** (ver
`AGENTS.md` §4), e as duas máquinas falam com o mesmo banco.

## O que NÃO está no GitHub

Só uma coisa importa: **`.env.local`**. Ele é ignorado pelo git (por design) e
não dá para reconstruir a partir do `.env.example`.

Chaves que ele precisa ter:

| Variável | Observação |
| --- | --- |
| `DATABASE_URL` | pooler do Supabase (porta 6543, `pgbouncer=true`) |
| `DIRECT_URL` | **não consta no `.env.example`** — copie do arquivo original |
| `NEXT_PUBLIC_SUPABASE_URL` | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | anon key, pública por design |
| `SUPABASE_URL` | |
| `SUPABASE_SERVICE_ROLE_KEY` | **segredo forte** — ignora qualquer permissão do banco |
| `INITIAL_ADMIN_EMAIL` | hoje `admin@lactare.local` (credencial técnica legada) |
| `WHATSAPP_APP_SECRET` | valor local de teste; serve ao `pnpm whatsapp:sim` |
| `WHATSAPP_VERIFY_TOKEN` | idem |

Como transportar: **gerenciador de senhas**, ou um pen drive usado só para esse
arquivo de ~1 KB. **Não** mande por e-mail, WhatsApp, Drive ou chat — a
`SUPABASE_SERVICE_ROLE_KEY` dá acesso total ao banco, incluindo a tabela
`nutriz_profiles` (PII de nutriz), e hoje o RLS está desabilitado (`AGENTS.md`
§3).

Todo o resto está versionado, inclusive os **26 CSVs da rBLH** em
`data/seeds/units/` — as 487 unidades são reconstruíveis com `pnpm db:seed`.

## Setup na máquina nova

Pré-requisitos: Node 22 LTS (o `.nvmrc` pede 22; Node 24 também funciona) e
pnpm 10.32.1 (via `corepack enable`). Sem Docker, sem Supabase CLI.

```bash
git clone https://github.com/RuyFichman/eurofarma.git && cd eurofarma
git checkout <sua-branch>          # ex.: feat/chatbot-whatsapp
# copie o .env.local para a raiz do projeto
pnpm install
pnpm db:generate
pnpm check && pnpm test            # 360 testes — se passar, o ambiente está ok
```

`pnpm dev` depois disso. O passo detalhado está em `AGENTS.md` §5.

## O que não viaja com o repositório

A configuração do agente de código é da **máquina**, não do repo:

- **MCP do Supabase** precisa ser reconfigurado. Se você não vai aplicar
  migration na outra máquina, configure-o **read-only e escopado** ao projeto:
  `https://mcp.supabase.com/mcp?project_ref=mvixmggxwbrljlovfvac&read_only=true`.
  Isso evita duas máquinas com escrita no mesmo banco cloud, que é justamente o
  cenário sem rede de proteção descrito em `AGENTS.md` §11.
- **Memória e histórico de sessão** do Claude Code ficam no perfil do usuário e
  não acompanham o clone. O `AGENTS.md` (importado pelo `CLAUDE.md`) vai junto,
  e é ele que carrega as convenções — que é o essencial.

## Trabalhando sem internet

O banco é cloud, então **offline o app praticamente não roda**: `pnpm dev`
quebra em qualquer página que consulta o Postgres, e os testes de integração
falham por não alcançar o Supabase.

Continua funcionando offline: `pnpm test:unit`, `pnpm lint`, `pnpm typecheck`,
`pnpm format` e edição de UI/copy (inclusive `lib/i18n/pt-br.ts`).

Se a viagem inclui trecho sem rede, rode esses comandos **antes de sair** para
saber o que dá para fazer no escuro, em vez de descobrir no avião.

## Ao voltar

`git push` da máquina que estava em uso **antes** de retomar na outra. Se as
duas divergiram, resolva pelo git (merge/rebase) — nunca copiando arquivos por
cima.
