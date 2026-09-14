-- RF16: modelo categórico e auditável da jornada da nutriz.
--
-- `interest_status` permanece intacto como classificação administrativa
-- legada. Perfis existentes recebem somente o estado inicial REGISTERED; não
-- há conversão nem histórico retroativo porque isso inventaria fatos e autores.

-- CreateEnum (gerado por `prisma migrate diff`)
CREATE TYPE "JourneyStatus" AS ENUM (
    'REGISTERED',
    'FORM_RECEIVED',
    'EXAM_SCHEDULED',
    'AWAITING_RESULT',
    'ELIGIBLE',
    'NOT_ELIGIBLE',
    'KIT_DELIVERED',
    'RECURRING_DONATION_ELIGIBLE'
);

-- AlterTable (gerado por `prisma migrate diff`)
ALTER TABLE "nutriz_profiles"
    ADD COLUMN "journey_status" "JourneyStatus" NOT NULL DEFAULT 'REGISTERED';

-- CreateIndex (gerado por `prisma migrate diff`)
CREATE INDEX "nutriz_profiles_journey_status_created_at_idx"
    ON "nutriz_profiles"("journey_status", "created_at");

-- CreateTable (gerado por `prisma migrate diff`)
CREATE TABLE "journey_status_history" (
    "id" TEXT NOT NULL,
    "nutriz_profile_id" TEXT NOT NULL,
    "from_status" "JourneyStatus" NOT NULL,
    "to_status" "JourneyStatus" NOT NULL,
    "changed_by_user_id" TEXT NOT NULL,
    "administrative_note" VARCHAR(500),
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journey_status_history_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "journey_status_history_note_not_blank_check" CHECK (
        "administrative_note" IS NULL
        OR length(btrim("administrative_note")) > 0
    ),
    CONSTRAINT "journey_status_history_valid_transition_check" CHECK (
        ("from_status" = 'REGISTERED' AND "to_status" = 'FORM_RECEIVED')
        OR ("from_status" = 'FORM_RECEIVED' AND "to_status" = 'EXAM_SCHEDULED')
        OR ("from_status" = 'EXAM_SCHEDULED' AND "to_status" = 'AWAITING_RESULT')
        OR (
            "from_status" = 'AWAITING_RESULT'
            AND "to_status" IN ('ELIGIBLE', 'NOT_ELIGIBLE')
        )
        OR ("from_status" = 'ELIGIBLE' AND "to_status" = 'KIT_DELIVERED')
        OR (
            "from_status" = 'KIT_DELIVERED'
            AND "to_status" = 'RECURRING_DONATION_ELIGIBLE'
        )
    )
);

-- CreateIndex (gerado por `prisma migrate diff`)
CREATE INDEX "journey_status_history_nutriz_profile_id_changed_at_idx"
    ON "journey_status_history"("nutriz_profile_id", "changed_at");

-- CreateIndex (gerado por `prisma migrate diff`)
CREATE INDEX "journey_status_history_changed_by_user_id_changed_at_idx"
    ON "journey_status_history"("changed_by_user_id", "changed_at");

-- AddForeignKey (gerado por `prisma migrate diff`)
ALTER TABLE "journey_status_history"
    ADD CONSTRAINT "journey_status_history_nutriz_profile_id_fkey"
    FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey (gerado por `prisma migrate diff`)
ALTER TABLE "journey_status_history"
    ADD CONSTRAINT "journey_status_history_changed_by_user_id_fkey"
    FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Proteção adicional escrita à mão: esta tabela é append-only inclusive para
-- acessos diretos ao banco. A função bloqueia qualquer UPDATE ou DELETE.
CREATE FUNCTION "prevent_journey_status_history_mutation"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'journey_status_history is append-only'
        USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "journey_status_history_immutable"
    BEFORE UPDATE OR DELETE ON "journey_status_history"
    FOR EACH ROW
    EXECUTE FUNCTION "prevent_journey_status_history_mutation"();
