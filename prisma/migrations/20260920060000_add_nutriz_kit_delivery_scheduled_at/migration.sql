-- Data e horário da visita de entrega do kit, informados pelo admin do
-- Lactare ao marcar KIT_SENT. É a única fonte legítima do lembrete de
-- entrega do kit (RF06, "Meus lembretes", 20/09/2026) — a nutriz nunca
-- preenche nem altera este campo, só visualiza.
ALTER TABLE "nutriz_profiles"
  ADD COLUMN "kit_delivery_scheduled_at" TIMESTAMP(3);
