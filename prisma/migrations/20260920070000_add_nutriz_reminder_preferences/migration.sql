-- "Meus lembretes" (20/09/2026): a nutriz configura, na área pessoal, até
-- três lembretes independentes pelo WhatsApp. Esta tabela guarda a
-- configuração ATUAL de cada tipo (não é um ledger de consentimento — esse
-- continua em communication_consent_events, purpose REMINDERS_WHATSAPP).

CREATE TYPE "NutrizReminderType" AS ENUM (
    'MILK_VALIDITY',
    'FUTURE_DONATION',
    'KIT_DELIVERY'
);

CREATE TYPE "ReminderTimingOption" AS ENUM (
    'MILK_1_DAY_BEFORE',
    'MILK_2_DAYS_BEFORE',
    'MILK_3_DAYS_BEFORE',
    'DONATION_7_DAYS_BEFORE',
    'DONATION_ON_DAY',
    'DONATION_7_DAYS_BEFORE_AND_ON_DAY',
    'KIT_MORNING_OF',
    'KIT_1_DAY_BEFORE',
    'KIT_1_DAY_BEFORE_AND_ON_DAY'
);

CREATE TABLE "nutriz_reminder_preferences" (
    "id" TEXT NOT NULL,
    "nutriz_profile_id" TEXT NOT NULL,
    "type" "NutrizReminderType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "timing_option" "ReminderTimingOption" NOT NULL,
    "target_date" DATE,
    "source_extraction_log_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutriz_reminder_preferences_pkey" PRIMARY KEY ("id"),
    -- Cada tipo só preenche o campo que faz sentido para ele e só aceita as
    -- opções de aviso da sua própria lista (o enum ReminderTimingOption é
    -- compartilhado pelos três tipos, mas os valores não se misturam).
    CONSTRAINT "nutriz_reminder_preferences_shape_check" CHECK (
        (
            "type" = 'MILK_VALIDITY'
            AND "timing_option" IN ('MILK_1_DAY_BEFORE', 'MILK_2_DAYS_BEFORE', 'MILK_3_DAYS_BEFORE')
            AND "source_extraction_log_id" IS NOT NULL
            AND "target_date" IS NULL
        )
        OR (
            "type" = 'FUTURE_DONATION'
            AND "timing_option" IN ('DONATION_7_DAYS_BEFORE', 'DONATION_ON_DAY', 'DONATION_7_DAYS_BEFORE_AND_ON_DAY')
            AND "target_date" IS NOT NULL
            AND "source_extraction_log_id" IS NULL
        )
        OR (
            "type" = 'KIT_DELIVERY'
            AND "timing_option" IN ('KIT_MORNING_OF', 'KIT_1_DAY_BEFORE', 'KIT_1_DAY_BEFORE_AND_ON_DAY')
            AND "target_date" IS NULL
            AND "source_extraction_log_id" IS NULL
        )
    )
);

CREATE UNIQUE INDEX "nutriz_reminder_preferences_profile_type_key"
    ON "nutriz_reminder_preferences"("nutriz_profile_id", "type");

CREATE INDEX "nutriz_reminder_preferences_source_extraction_log_id_idx"
    ON "nutriz_reminder_preferences"("source_extraction_log_id");

ALTER TABLE "nutriz_reminder_preferences"
    ADD CONSTRAINT "nutriz_reminder_preferences_nutriz_profile_id_fkey"
    FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nutriz_reminder_preferences"
    ADD CONSTRAINT "nutriz_reminder_preferences_source_extraction_log_id_fkey"
    FOREIGN KEY ("source_extraction_log_id") REFERENCES "extraction_logs"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Mesmo padrão de RLS das outras tabelas pessoais da nutriz (extraction_logs,
-- wellbeing_entries): acesso direto ao banco também respeita a propriedade do
-- registro. A aplicação continua validando sessão e perfil antes de cada
-- operação.
ALTER TABLE "nutriz_reminder_preferences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutriz_reminder_preferences_owner_select"
    ON "nutriz_reminder_preferences" FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "nutriz_reminder_preferences"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "nutriz_reminder_preferences_owner_insert"
    ON "nutriz_reminder_preferences" FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "nutriz_reminder_preferences"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "nutriz_reminder_preferences_owner_update"
    ON "nutriz_reminder_preferences" FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "nutriz_reminder_preferences"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "nutriz_reminder_preferences"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "nutriz_reminder_preferences_owner_delete"
    ON "nutriz_reminder_preferences" FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "nutriz_reminder_preferences"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));
