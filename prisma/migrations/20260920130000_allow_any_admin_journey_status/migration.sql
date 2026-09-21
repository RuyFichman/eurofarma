-- O painel precisa permitir correções e atualizações para qualquer um dos
-- seis marcos administrativos, inclusive retorno a uma etapa anterior ou
-- novo registro do status atual. O histórico continua append-only.
--
-- Há históricos antigos com os valores legados do enum. `NOT VALID` preserva
-- essas linhas, mas o PostgreSQL aplica o CHECK a toda nova gravação.
ALTER TABLE "journey_status_history"
    DROP CONSTRAINT "journey_status_history_valid_transition_check";

ALTER TABLE "journey_status_history"
    ADD CONSTRAINT "journey_status_history_valid_transition_check" CHECK (
        "to_status" IN (
            'REGISTERED',
            'FORM_RECEIVED',
            'EXAMS_COMPLETED',
            'KIT_SENT',
            'KIT_DELIVERED',
            'DONATION_CONFIRMED'
        )
    ) NOT VALID;
