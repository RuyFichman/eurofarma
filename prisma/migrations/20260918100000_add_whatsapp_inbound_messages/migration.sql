-- Deduplicação persistente de entregas recebidas pelo webhook do WhatsApp.
-- A chave composta do provedor e da mensagem impede que reentregas repitam
-- cadastro, consentimento ou transição da máquina de estados.
CREATE TYPE "WhatsappInboundMessageProvider" AS ENUM ('META_CLOUD_API', 'TWILIO');

CREATE TYPE "WhatsappInboundMessageProcessingResult" AS ENUM (
  'PROCESSING',
  'PROCESSED',
  'IGNORED',
  'FAILED'
);

CREATE TABLE "whatsapp_inbound_messages" (
  "id" TEXT NOT NULL,
  "provider" "WhatsappInboundMessageProvider" NOT NULL,
  "provider_message_id" VARCHAR(255) NOT NULL,
  "conversation_id" TEXT,
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processing_result" "WhatsappInboundMessageProcessingResult" NOT NULL DEFAULT 'PROCESSING',
  "processed_at" TIMESTAMP(3),

  CONSTRAINT "whatsapp_inbound_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whatsapp_inbound_messages_provider_message_key"
  ON "whatsapp_inbound_messages"("provider", "provider_message_id");

CREATE INDEX "whatsapp_inbound_messages_conversation_received_idx"
  ON "whatsapp_inbound_messages"("conversation_id", "received_at");

CREATE INDEX "whatsapp_inbound_messages_result_received_idx"
  ON "whatsapp_inbound_messages"("processing_result", "received_at");

ALTER TABLE "whatsapp_inbound_messages"
  ADD CONSTRAINT "whatsapp_inbound_messages_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES "whatsapp_conversations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;