ALTER TYPE "NotificationDeliveryStatusProvider" ADD VALUE IF NOT EXISTS 'ZAPI';

CREATE TYPE "WhatsappReplyDeliveryOutcome" AS ENUM (
  'SENT',
  'NOT_CONFIGURED',
  'RETRYABLE_FAILURE',
  'PERMANENT_FAILURE'
);

ALTER TABLE "whatsapp_inbound_messages"
  ADD COLUMN "reply_delivery_outcome" "WhatsappReplyDeliveryOutcome",
  ADD COLUMN "reply_provider_message_id" VARCHAR(255),
  ADD COLUMN "reply_error_code" VARCHAR(64),
  ADD COLUMN "reply_attempted_at" TIMESTAMP(3);

CREATE INDEX "whatsapp_inbound_messages_provider_reply_message_idx"
  ON "whatsapp_inbound_messages"("provider", "reply_provider_message_id");
