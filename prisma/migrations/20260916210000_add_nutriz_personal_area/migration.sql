-- UC06 / RF19 / RF21: registros pessoais da Minha Área.
-- Estes dados pertencem exclusivamente à nutriz e não representam coleta,
-- doação confirmada, agendamento ou decisão clínica.

CREATE TYPE "WellbeingFeeling" AS ENUM (
    'GOOD',
    'OK',
    'TIRED'
);

CREATE TABLE "extraction_logs" (
    "id" TEXT NOT NULL,
    "nutriz_profile_id" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "volume_ml" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extraction_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "extraction_logs_volume_ml_check" CHECK ("volume_ml" > 0 AND "volume_ml" <= 5000)
);

CREATE TABLE "wellbeing_entries" (
    "id" TEXT NOT NULL,
    "nutriz_profile_id" TEXT NOT NULL,
    "feeling" "WellbeingFeeling" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wellbeing_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "extraction_logs_nutriz_profile_id_recorded_at_idx"
    ON "extraction_logs"("nutriz_profile_id", "recorded_at");

CREATE INDEX "wellbeing_entries_nutriz_profile_id_recorded_at_idx"
    ON "wellbeing_entries"("nutriz_profile_id", "recorded_at");

ALTER TABLE "extraction_logs"
    ADD CONSTRAINT "extraction_logs_nutriz_profile_id_fkey"
    FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wellbeing_entries"
    ADD CONSTRAINT "wellbeing_entries_nutriz_profile_id_fkey"
    FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Acesso direto ao banco também deve respeitar a propriedade do registro. A
-- aplicação continua validando a sessão e o perfil antes de cada operação.
ALTER TABLE "extraction_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wellbeing_entries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extraction_logs_owner_select"
    ON "extraction_logs" FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "extraction_logs"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "extraction_logs_owner_insert"
    ON "extraction_logs" FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "extraction_logs"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "extraction_logs_owner_update"
    ON "extraction_logs" FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "extraction_logs"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "extraction_logs"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "extraction_logs_owner_delete"
    ON "extraction_logs" FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "extraction_logs"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "wellbeing_entries_owner_select"
    ON "wellbeing_entries" FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "wellbeing_entries"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "wellbeing_entries_owner_insert"
    ON "wellbeing_entries" FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "wellbeing_entries"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "wellbeing_entries_owner_delete"
    ON "wellbeing_entries" FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "wellbeing_entries"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));
