-- RF07: evento anônimo de clique nos canais oficiais do Lactare.
--
-- Substitui o tracking legado de `whatsapp_clicks`, que dependia de `units` e
-- da busca nacional aposentada. A tabela nova nasce sem FK para unidade ou
-- nutriz e sem coluna para CEP, IP ou referrer: o evento é anônimo por
-- construção, não por filtro de aplicação. `whatsapp_clicks` permanece
-- intacta como legado histórico — esta migration não lê nem migra aquelas
-- linhas, que carregam uma dimensão (unidade) que o produto não tem mais.

-- CreateEnum (gerado por `prisma migrate diff`)
CREATE TYPE "ContactChannel" AS ENUM ('WHATSAPP', 'PHONE');

-- CreateEnum (gerado por `prisma migrate diff`)
CREATE TYPE "ContactChannelSurface" AS ENUM ('COVERAGE_RESULT');

-- CreateTable (gerado por `prisma migrate diff`)
CREATE TABLE "contact_channel_clicks" (
    "id" TEXT NOT NULL,
    "channel" "ContactChannel" NOT NULL,
    "surface" "ContactChannelSurface" NOT NULL,
    "source_utm" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_channel_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (gerado por `prisma migrate diff`)
CREATE INDEX "contact_channel_clicks_created_at_channel_idx" ON "contact_channel_clicks"("created_at", "channel");

-- CreateIndex (gerado por `prisma migrate diff`)
CREATE INDEX "contact_channel_clicks_channel_surface_created_at_idx" ON "contact_channel_clicks"("channel", "surface", "created_at");

-- Guarda escrita à mão: `source_utm` só aceita objeto JSON, o mesmo formato que
-- `sanitizeSourceUtm` produz. Impede que um acesso direto ao banco grave array,
-- string ou número onde o dashboard espera as 5 chaves UTM.
ALTER TABLE "contact_channel_clicks"
    ADD CONSTRAINT "contact_channel_clicks_source_utm_object_check" CHECK (
        "source_utm" IS NULL
        OR jsonb_typeof("source_utm") = 'object'
    );
