-- RF15: indicação própria por link opaco, sem recompensa material.
-- O código não contém PII e a atribuição só é registrada no cadastro inicial.

CREATE TABLE "referral_links" (
    "id" TEXT NOT NULL,
    "nutriz_profile_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_links_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "nutriz_profiles"
    ADD COLUMN "referred_by_referral_link_id" TEXT;

CREATE UNIQUE INDEX "referral_links_nutriz_profile_id_key"
    ON "referral_links"("nutriz_profile_id");
CREATE UNIQUE INDEX "referral_links_code_key"
    ON "referral_links"("code");
CREATE INDEX "nutriz_profiles_referred_by_referral_link_id_idx"
    ON "nutriz_profiles"("referred_by_referral_link_id");

ALTER TABLE "referral_links"
    ADD CONSTRAINT "referral_links_nutriz_profile_id_fkey"
    FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nutriz_profiles"
    ADD CONSTRAINT "nutriz_profiles_referred_by_referral_link_id_fkey"
    FOREIGN KEY ("referred_by_referral_link_id") REFERENCES "referral_links"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "referral_links" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_links_owner_select"
    ON "referral_links" FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "referral_links"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));

CREATE POLICY "referral_links_owner_insert"
    ON "referral_links" FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM "nutriz_profiles" p
        WHERE p."id" = "referral_links"."nutriz_profile_id"
          AND p."auth_user_id" = auth.uid()::text
          AND p."deleted_at" IS NULL
    ));
