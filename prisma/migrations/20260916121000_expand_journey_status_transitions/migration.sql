-- Mantém as transições anteriores válidas para preservar o histórico já
-- gravado e acrescenta os novos marcos como caminhos progressivos opcionais.
ALTER TABLE "journey_status_history"
    DROP CONSTRAINT "journey_status_history_valid_transition_check";

ALTER TABLE "journey_status_history"
    ADD CONSTRAINT "journey_status_history_valid_transition_check" CHECK (
        (
            "from_status" = 'REGISTERED'
            AND "to_status" IN ('DOCUMENT_SENT', 'FORM_RECEIVED')
        )
        OR ("from_status" = 'DOCUMENT_SENT' AND "to_status" = 'FORM_RECEIVED')
        OR ("from_status" = 'FORM_RECEIVED' AND "to_status" = 'EXAM_SCHEDULED')
        OR (
            "from_status" = 'EXAM_SCHEDULED'
            AND "to_status" IN ('EXAMS_COMPLETED', 'AWAITING_RESULT')
        )
        OR ("from_status" = 'EXAMS_COMPLETED' AND "to_status" = 'AWAITING_RESULT')
        OR (
            "from_status" = 'AWAITING_RESULT'
            AND "to_status" IN ('ELIGIBLE', 'NOT_ELIGIBLE')
        )
        OR (
            "from_status" = 'ELIGIBLE'
            AND "to_status" IN ('KIT_SENT', 'KIT_DELIVERED')
        )
        OR ("from_status" = 'KIT_SENT' AND "to_status" = 'KIT_DELIVERED')
        OR (
            "from_status" = 'KIT_DELIVERED'
            AND "to_status" IN (
                'DONATION_CONFIRMED',
                'RECURRING_DONATION_ELIGIBLE'
            )
        )
        OR (
            "from_status" = 'DONATION_CONFIRMED'
            AND "to_status" = 'RECURRING_DONATION_ELIGIBLE'
        )
    );
