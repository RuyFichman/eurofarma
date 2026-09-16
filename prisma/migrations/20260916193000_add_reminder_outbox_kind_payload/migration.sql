-- RF06: itens de lembrete reutilizam a outbox, sem semântica de agendamento.
ALTER TYPE "NotificationOutboxKind" ADD VALUE IF NOT EXISTS 'REMINDER';

ALTER TABLE "notification_outbox"
    ADD COLUMN "payload" JSONB;

ALTER TABLE "notification_outbox"
    DROP CONSTRAINT "notification_outbox_payload_check";

ALTER TABLE "notification_outbox"
    ADD CONSTRAINT "notification_outbox_payload_check" CHECK (
        (
            "kind" = 'JOURNEY_STATUS_CHANGED'
            AND "journey_status_history_id" IS NOT NULL
            AND "payload" IS NULL
        )
        OR (
            "kind" = 'REMINDER'
            AND "journey_status_history_id" IS NULL
            AND "payload" IS NOT NULL
        )
    );
