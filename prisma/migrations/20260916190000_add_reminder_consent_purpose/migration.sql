-- RF06: consentimento de lembretes separado dos avisos de status.
-- Esta migration não cria job nem agenda envios; apenas habilita o registro
-- auditável de concessão e retirada no ledger append-only existente.
ALTER TYPE "CommunicationConsentPurpose"
    ADD VALUE IF NOT EXISTS 'REMINDERS_WHATSAPP';
