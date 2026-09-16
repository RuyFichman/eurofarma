-- UC15: reconhecimentos simbólicos derivados exclusivamente da jornada.
CREATE TYPE "NutrizRecognitionKind" AS ENUM (
    'JOURNEY_STARTED',
    'READY_FOR_DONATION',
    'KIT_RECEIVED',
    'FIRST_DONATION',
    'CONTINUITY_RECOGNIZED'
);

CREATE TABLE "nutriz_recognitions" (
    "id" TEXT NOT NULL,
    "nutriz_profile_id" TEXT NOT NULL,
    "kind" "NutrizRecognitionKind" NOT NULL,
    "journey_status" "JourneyStatus" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutriz_recognitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nutriz_recognitions_profile_kind_key"
    ON "nutriz_recognitions"("nutriz_profile_id", "kind");
CREATE INDEX "nutriz_recognitions_profile_assigned_idx"
    ON "nutriz_recognitions"("nutriz_profile_id", "assigned_at");

ALTER TABLE "nutriz_recognitions"
    ADD CONSTRAINT "nutriz_recognitions_nutriz_profile_id_fkey"
    FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill histórico sem inventar doações: a primeira doação só vem de um
-- status administrativo DONATION_CONFIRMED efetivamente registrado.
INSERT INTO "nutriz_recognitions" ("id", "nutriz_profile_id", "kind", "journey_status", "assigned_at")
SELECT gen_random_uuid()::text, p."id", 'JOURNEY_STARTED', 'REGISTERED', p."created_at"
FROM "nutriz_profiles" p
ON CONFLICT ("nutriz_profile_id", "kind") DO NOTHING;

INSERT INTO "nutriz_recognitions" ("id", "nutriz_profile_id", "kind", "journey_status", "assigned_at")
SELECT gen_random_uuid()::text, h."nutriz_profile_id", 'READY_FOR_DONATION', 'ELIGIBLE', MIN(h."changed_at")
FROM "journey_status_history" h
WHERE h."to_status" = 'ELIGIBLE'
GROUP BY h."nutriz_profile_id"
ON CONFLICT ("nutriz_profile_id", "kind") DO NOTHING;

INSERT INTO "nutriz_recognitions" ("id", "nutriz_profile_id", "kind", "journey_status", "assigned_at")
SELECT gen_random_uuid()::text, h."nutriz_profile_id", 'KIT_RECEIVED', 'KIT_DELIVERED', MIN(h."changed_at")
FROM "journey_status_history" h
WHERE h."to_status" = 'KIT_DELIVERED'
GROUP BY h."nutriz_profile_id"
ON CONFLICT ("nutriz_profile_id", "kind") DO NOTHING;

INSERT INTO "nutriz_recognitions" ("id", "nutriz_profile_id", "kind", "journey_status", "assigned_at")
SELECT gen_random_uuid()::text, h."nutriz_profile_id", 'FIRST_DONATION', 'DONATION_CONFIRMED', MIN(h."changed_at")
FROM "journey_status_history" h
WHERE h."to_status" = 'DONATION_CONFIRMED'
GROUP BY h."nutriz_profile_id"
ON CONFLICT ("nutriz_profile_id", "kind") DO NOTHING;

INSERT INTO "nutriz_recognitions" ("id", "nutriz_profile_id", "kind", "journey_status", "assigned_at")
SELECT gen_random_uuid()::text, h."nutriz_profile_id", 'CONTINUITY_RECOGNIZED', 'RECURRING_DONATION_ELIGIBLE', MIN(h."changed_at")
FROM "journey_status_history" h
WHERE h."to_status" = 'RECURRING_DONATION_ELIGIBLE'
GROUP BY h."nutriz_profile_id"
ON CONFLICT ("nutriz_profile_id", "kind") DO NOTHING;
