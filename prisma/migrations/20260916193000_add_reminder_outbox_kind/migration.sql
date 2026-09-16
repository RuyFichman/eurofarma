-- RF06: registra o tipo de lembrete antes de qualquer migration que o use.
-- Deve ser aplicada separadamente para que o novo valor do enum seja
-- confirmado antes de aparecer em um CHECK.
ALTER TYPE "NotificationOutboxKind" ADD VALUE IF NOT EXISTS 'REMINDER';
