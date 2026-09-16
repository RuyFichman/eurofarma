-- RF17: consentimento específico e outbox transacional para avisos de status.
CREATE TYPE "CommunicationConsentPurpose" AS ENUM (
    'JOURNEY_STATUS_WHATSAPP'
);

CREATE TYPE "CommunicationConsentDecision" AS ENUM (
    'GRANTED',
    'WITHDRAWN'
);

CREATE TYPE "CommunicationConsentSource" AS ENUM (
    'WEB',
    'WHATSAPP'
);

CREATE TYPE "NotificationOutboxKind" AS ENUM (
    'JOURNEY_STATUS_CHANGED'
);

CREATE TYPE "NotificationOutboxStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'RETRY_SCHEDULED',
    'SENT',
    'FAILED',
    'SUPPRESSED'
);

CREATE TYPE "NotificationDeliveryAttemptOutcome" AS ENUM (
    'SENT',
    'RETRY_SCHEDULED',
    'FAILED',
    'SUPPRESSED'
);

CREATE TABLE "communication_consent_events" (
    "id" TEXT NOT NULL,
    "sequence" BIGSERIAL NOT NULL,
    "nutriz_profile_id" TEXT NOT NULL,
    "purpose" "CommunicationConsentPurpose" NOT NULL,
    "decision" "CommunicationConsentDecision" NOT NULL,
    "source" "CommunicationConsentSource" NOT NULL,
    "policy_version" VARCHAR(32) NOT NULL,
    "source_event_id" VARCHAR(255),
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_consent_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "communication_consent_events_policy_version_not_blank_check"
        CHECK (length(btrim("policy_version")) > 0)
);

CREATE TABLE "notification_outbox" (
    "id" TEXT NOT NULL,
    "idempotency_key" VARCHAR(255) NOT NULL,
    "kind" "NotificationOutboxKind" NOT NULL,
    "status" "NotificationOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "nutriz_profile_id" TEXT NOT NULL,
    "journey_status_history_id" TEXT,
    "consent_event_id" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_at" TIMESTAMP(3),
    "lock_token" VARCHAR(64),
    "sent_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "provider_message_id" VARCHAR(255),
    "last_error_code" VARCHAR(64),
    "last_error_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_outbox_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_outbox_attempt_count_check" CHECK (
        "attempt_count" >= 0
        AND "max_attempts" >= 1
        AND "attempt_count" <= "max_attempts"
    ),
    CONSTRAINT "notification_outbox_payload_check" CHECK (
        "kind" <> 'JOURNEY_STATUS_CHANGED'
        OR "journey_status_history_id" IS NOT NULL
    ),
    CONSTRAINT "notification_outbox_lock_state_check" CHECK (
        (
            "status" = 'PROCESSING'
            AND "locked_at" IS NOT NULL
            AND "lock_token" IS NOT NULL
        )
        OR (
            "status" <> 'PROCESSING'
            AND "locked_at" IS NULL
            AND "lock_token" IS NULL
        )
    ),
    CONSTRAINT "notification_outbox_terminal_state_check" CHECK (
        (
            "status" = 'SENT'
            AND "sent_at" IS NOT NULL
            AND "provider_message_id" IS NOT NULL
            AND "failed_at" IS NULL
            AND "last_error_code" IS NULL
        )
        OR (
            "status" = 'FAILED'
            AND "failed_at" IS NOT NULL
            AND "last_error_code" IS NOT NULL
            AND "sent_at" IS NULL
            AND "provider_message_id" IS NULL
        )
        OR (
            "status" = 'SUPPRESSED'
            AND "last_error_code" IS NOT NULL
            AND "sent_at" IS NULL
            AND "failed_at" IS NULL
            AND "provider_message_id" IS NULL
        )
        OR (
            "status" IN ('PENDING', 'PROCESSING', 'RETRY_SCHEDULED')
            AND "sent_at" IS NULL
            AND "failed_at" IS NULL
            AND "provider_message_id" IS NULL
        )
    ),
    CONSTRAINT "notification_outbox_error_timestamp_check" CHECK (
        ("last_error_code" IS NULL) = ("last_error_at" IS NULL)
    )
);

CREATE TABLE "notification_delivery_attempts" (
    "id" TEXT NOT NULL,
    "outbox_id" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "outcome" "NotificationDeliveryAttemptOutcome" NOT NULL,
    "provider_message_id" VARCHAR(255),
    "error_code" VARCHAR(64),
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_delivery_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_delivery_attempts_number_check"
        CHECK ("attempt_number" >= 1),
    CONSTRAINT "notification_delivery_attempts_outcome_check" CHECK (
        ("outcome" = 'SENT' AND "provider_message_id" IS NOT NULL AND "error_code" IS NULL)
        OR ("outcome" <> 'SENT' AND "provider_message_id" IS NULL AND "error_code" IS NOT NULL)
    )
);

CREATE UNIQUE INDEX "communication_consent_events_source_event_id_key"
    ON "communication_consent_events"("source_event_id");
CREATE UNIQUE INDEX "communication_consent_events_sequence_key"
    ON "communication_consent_events"("sequence");
CREATE INDEX "communication_consent_events_profile_purpose_sequence_idx"
    ON "communication_consent_events"("nutriz_profile_id", "purpose", "sequence");

CREATE UNIQUE INDEX "notification_outbox_idempotency_key_key"
    ON "notification_outbox"("idempotency_key");
CREATE UNIQUE INDEX "notification_outbox_journey_status_history_id_key"
    ON "notification_outbox"("journey_status_history_id");
CREATE UNIQUE INDEX "notification_outbox_lock_token_key"
    ON "notification_outbox"("lock_token");
CREATE INDEX "notification_outbox_status_available_created_idx"
    ON "notification_outbox"("status", "available_at", "created_at");
CREATE INDEX "notification_outbox_nutriz_profile_id_created_at_idx"
    ON "notification_outbox"("nutriz_profile_id", "created_at");

CREATE UNIQUE INDEX "notification_delivery_attempts_outbox_attempt_key"
    ON "notification_delivery_attempts"("outbox_id", "attempt_number");
CREATE INDEX "notification_delivery_attempts_outcome_attempted_at_idx"
    ON "notification_delivery_attempts"("outcome", "attempted_at");

ALTER TABLE "communication_consent_events"
    ADD CONSTRAINT "communication_consent_events_nutriz_profile_id_fkey"
    FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notification_outbox"
    ADD CONSTRAINT "notification_outbox_nutriz_profile_id_fkey"
    FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notification_outbox"
    ADD CONSTRAINT "notification_outbox_journey_status_history_id_fkey"
    FOREIGN KEY ("journey_status_history_id") REFERENCES "journey_status_history"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notification_outbox"
    ADD CONSTRAINT "notification_outbox_consent_event_id_fkey"
    FOREIGN KEY ("consent_event_id") REFERENCES "communication_consent_events"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notification_delivery_attempts"
    ADD CONSTRAINT "notification_delivery_attempts_outbox_id_fkey"
    FOREIGN KEY ("outbox_id") REFERENCES "notification_outbox"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "prevent_communication_consent_event_mutation"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'communication_consent_events is append-only'
        USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "communication_consent_events_immutable"
    BEFORE UPDATE OR DELETE ON "communication_consent_events"
    FOR EACH ROW
    EXECUTE FUNCTION "prevent_communication_consent_event_mutation"();

CREATE FUNCTION "prevent_notification_delivery_attempt_mutation"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'notification_delivery_attempts is append-only'
        USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "notification_delivery_attempts_immutable"
    BEFORE UPDATE OR DELETE ON "notification_delivery_attempts"
    FOR EACH ROW
    EXECUTE FUNCTION "prevent_notification_delivery_attempt_mutation"();

CREATE FUNCTION "prevent_notification_outbox_delete"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'notification_outbox cannot be deleted'
        USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "notification_outbox_delete_protected"
    BEFORE DELETE ON "notification_outbox"
    FOR EACH ROW
    EXECUTE FUNCTION "prevent_notification_outbox_delete"();
