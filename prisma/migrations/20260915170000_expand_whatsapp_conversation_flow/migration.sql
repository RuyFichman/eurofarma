-- RF11: amplia o estado conversacional para menu, FAQ, cobertura e cadastro.
--
-- Os cinco valores antigos permanecem no enum para preservar integralmente as
-- conversas legadas. A aplicação os interpreta como reinício no menu e grava o
-- novo estado no próximo contato; nenhuma linha nem data autodeclarada é
-- apagada por esta migration.

-- ReplaceEnum
CREATE TYPE "WhatsappConversationStep_new" AS ENUM (
    'MENU',
    'FAQ',
    'AWAITING_COVERAGE',
    'AWAITING_FULL_NAME',
    'AWAITING_CONSENT',
    'ASKED_SCHEDULED',
    'AWAITING_DATE',
    'AWAITING_DATE_CONFIRMATION',
    'AWAITING_FAILURE_REASON',
    'FINISHED'
);

ALTER TABLE "whatsapp_conversations"
    ALTER COLUMN "step" DROP DEFAULT;

ALTER TABLE "whatsapp_conversations"
    ALTER COLUMN "step" TYPE "WhatsappConversationStep_new"
    USING ("step"::text::"WhatsappConversationStep_new");

ALTER TABLE "whatsapp_conversations"
    ALTER COLUMN "step" SET DEFAULT 'MENU';

DROP TYPE "WhatsappConversationStep";
ALTER TYPE "WhatsappConversationStep_new" RENAME TO "WhatsappConversationStep";

-- AlterTable
ALTER TABLE "whatsapp_conversations"
    ADD COLUMN "context" JSONB,
    ADD COLUMN "misunderstood_count" INTEGER NOT NULL DEFAULT 0;

-- O contexto aceita somente objeto JSON. O CEP não possui campo próprio e a
-- aplicação grava apenas cidade e UF já resolvidas. O nome só entra no perfil
-- definitivo depois do consentimento explícito.
ALTER TABLE "whatsapp_conversations"
    ADD CONSTRAINT "whatsapp_conversations_context_object_check" CHECK (
        "context" IS NULL
        OR (
            jsonb_typeof("context") = 'object'
            AND ("context" - 'location') = '{}'::jsonb
            AND (
                NOT ("context" ? 'location')
                OR (
                    jsonb_typeof("context" -> 'location') = 'object'
                    AND (("context" -> 'location') - 'city' - 'state') = '{}'::jsonb
                    AND ("context" -> 'location') ?& ARRAY['city', 'state']
                    AND jsonb_typeof("context" -> 'location' -> 'city') = 'string'
                    AND jsonb_typeof("context" -> 'location' -> 'state') = 'string'
                    AND length("context" -> 'location' ->> 'city') BETWEEN 2 AND 100
                    AND ("context" -> 'location' ->> 'state') ~ '^[A-Z]{2}$'
                )
            )
        )
    ),
    ADD CONSTRAINT "whatsapp_conversations_misunderstood_count_check" CHECK (
        "misunderstood_count" BETWEEN 0 AND 2
    );
