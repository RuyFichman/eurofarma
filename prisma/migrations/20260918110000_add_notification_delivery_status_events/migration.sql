CREATE TYPE "NotificationDeliveryStatusProvider" AS ENUM ('TWILIO');

CREATE TYPE "NotificationDeliveryStatus" AS ENUM (
  'ACCEPTED',
  'QUEUED',
  'SENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'UNDELIVERED',
  'UNKNOWN'
);

CREATE TABLE "notification_delivery_status_events" (
  "id" TEXT NOT NULL,
  "outbox_id" TEXT,
  "provider" "NotificationDeliveryStatusProvider" NOT NULL,
  "provider_message_id" VARCHAR(255) NOT NULL,
  "status" "NotificationDeliveryStatus" NOT NULL,
  "error_code" VARCHAR(64),
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_delivery_status_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notification_delivery_status_provider_message_received_idx"
  ON "notification_delivery_status_events"("provider", "provider_message_id", "received_at");

CREATE INDEX "notification_delivery_status_outbox_status_received_idx"
  ON "notification_delivery_status_events"("outbox_id", "status", "received_at");

ALTER TABLE "notification_delivery_status_events"
  ADD CONSTRAINT "notification_delivery_status_events_outbox_id_fkey"
  FOREIGN KEY ("outbox_id") REFERENCES "notification_outbox"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION prevent_notification_delivery_status_event_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'notification_delivery_status_events are append-only';
END;
$$;

CREATE TRIGGER notification_delivery_status_events_immutable
  BEFORE UPDATE OR DELETE ON "notification_delivery_status_events"
  FOR EACH ROW EXECUTE FUNCTION prevent_notification_delivery_status_event_mutation();