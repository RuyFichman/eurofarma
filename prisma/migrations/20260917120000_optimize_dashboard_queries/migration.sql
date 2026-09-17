-- Read model do dashboard: materializa somente dimensões categóricas, sem PII.
-- Os valores continuam derivados das fontes canônicas (`source_utm`, cidade e
-- municípios configurados) e são mantidos automaticamente por triggers.

CREATE TYPE "RegistrationOrigin" AS ENUM (
    'WHATSAPP',
    'WEB',
    'OTHER',
    'UNKNOWN'
);

ALTER TABLE "nutriz_profiles"
    ADD COLUMN "dashboard_region" "ServiceRegion",
    ADD COLUMN "registration_origin" "RegistrationOrigin" NOT NULL DEFAULT 'UNKNOWN';

-- Mesma normalização tolerante a caixa, acentos e espaços usada anteriormente
-- pela aplicação. A função é imutável para também poder apoiar índices futuros.
CREATE FUNCTION "nutrilink_dashboard_location_key"("value" TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$
    SELECT translate(
        lower(regexp_replace(btrim("value"), '\s+', ' ', 'g')),
        'áàâãäéèêëíìîïóòôõöúùûüç',
        'aaaaaeeeeiiiiooooouuuuc'
    )
$$;

UPDATE "nutriz_profiles"
SET "registration_origin" = CASE
    WHEN NULLIF(btrim("source_utm" ->> 'utm_source'), '') IS NULL
        THEN 'UNKNOWN'::"RegistrationOrigin"
    WHEN lower(btrim("source_utm" ->> 'utm_source')) IN ('whatsapp', 'wa.me')
        THEN 'WHATSAPP'::"RegistrationOrigin"
    WHEN lower(btrim("source_utm" ->> 'utm_source')) IN ('web', 'site', 'website')
        THEN 'WEB'::"RegistrationOrigin"
    ELSE 'OTHER'::"RegistrationOrigin"
END;

-- Municípios inativos continuam classificando o histórico, como já ocorria no
-- dashboard. A situação ativa afeta cobertura, não a segmentação histórica.
UPDATE "nutriz_profiles" np
SET "dashboard_region" = (
    SELECT sm."region"
    FROM "service_municipalities" sm
    WHERE upper(btrim(sm."state")) = upper(btrim(np."state"))
      AND "nutrilink_dashboard_location_key"(sm."name") =
          "nutrilink_dashboard_location_key"(np."city")
    ORDER BY sm."id"
    LIMIT 1
);

CREATE FUNCTION "set_nutriz_dashboard_dimensions"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW."registration_origin" := CASE
        WHEN NULLIF(btrim(NEW."source_utm" ->> 'utm_source'), '') IS NULL
            THEN 'UNKNOWN'::"RegistrationOrigin"
        WHEN lower(btrim(NEW."source_utm" ->> 'utm_source')) IN ('whatsapp', 'wa.me')
            THEN 'WHATSAPP'::"RegistrationOrigin"
        WHEN lower(btrim(NEW."source_utm" ->> 'utm_source')) IN ('web', 'site', 'website')
            THEN 'WEB'::"RegistrationOrigin"
        ELSE 'OTHER'::"RegistrationOrigin"
    END;

    SELECT sm."region"
    INTO NEW."dashboard_region"
    FROM "service_municipalities" sm
    WHERE upper(btrim(sm."state")) = upper(btrim(NEW."state"))
      AND "nutrilink_dashboard_location_key"(sm."name") =
          "nutrilink_dashboard_location_key"(NEW."city")
    ORDER BY sm."id"
    LIMIT 1;

    RETURN NEW;
END;
$$;

CREATE TRIGGER "nutriz_profiles_dashboard_dimensions_insert"
    BEFORE INSERT ON "nutriz_profiles"
    FOR EACH ROW
    EXECUTE FUNCTION "set_nutriz_dashboard_dimensions"();

CREATE TRIGGER "nutriz_profiles_dashboard_dimensions_update"
    BEFORE UPDATE OF "state", "city", "source_utm" ON "nutriz_profiles"
    FOR EACH ROW
    EXECUTE FUNCTION "set_nutriz_dashboard_dimensions"();

-- Mantém a dimensão regional coerente quando a configuração administrativa é
-- criada, renomeada, movida de região ou removida diretamente no banco.
CREATE FUNCTION "refresh_nutriz_dashboard_region"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        UPDATE "nutriz_profiles" np
        SET "dashboard_region" = NULL
        WHERE upper(btrim(np."state")) = upper(btrim(OLD."state"))
          AND "nutrilink_dashboard_location_key"(np."city") =
              "nutrilink_dashboard_location_key"(OLD."name");
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        UPDATE "nutriz_profiles" np
        SET "dashboard_region" = NEW."region"
        WHERE upper(btrim(np."state")) = upper(btrim(NEW."state"))
          AND "nutrilink_dashboard_location_key"(np."city") =
              "nutrilink_dashboard_location_key"(NEW."name");
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "service_municipalities_refresh_dashboard_region"
    AFTER INSERT OR UPDATE OF "name", "state", "region" OR DELETE
    ON "service_municipalities"
    FOR EACH ROW
    EXECUTE FUNCTION "refresh_nutriz_dashboard_region"();

DROP INDEX "nutriz_profiles_journey_status_created_at_idx";

CREATE INDEX "nutriz_profiles_deleted_at_created_at_idx"
    ON "nutriz_profiles"("deleted_at", "created_at");
CREATE INDEX "nutriz_profiles_deleted_journey_created_idx"
    ON "nutriz_profiles"("deleted_at", "journey_status", "created_at");
CREATE INDEX "nutriz_profiles_deleted_region_created_idx"
    ON "nutriz_profiles"("deleted_at", "dashboard_region", "created_at");
CREATE INDEX "nutriz_profiles_deleted_origin_created_idx"
    ON "nutriz_profiles"("deleted_at", "registration_origin", "created_at");
CREATE INDEX "nutriz_profiles_deleted_referral_created_idx"
    ON "nutriz_profiles"("deleted_at", "referred_by_referral_link_id", "created_at");
CREATE INDEX "communication_consent_events_purpose_profile_sequence_idx"
    ON "communication_consent_events"("purpose", "nutriz_profile_id", "sequence");
CREATE INDEX "communication_consent_events_purpose_profile_recorded_idx"
    ON "communication_consent_events"("purpose", "nutriz_profile_id", "recorded_at");
