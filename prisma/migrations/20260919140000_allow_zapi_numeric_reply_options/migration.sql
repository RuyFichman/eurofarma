-- A Z-API usa texto livre para as opções. Armazenamos somente os IDs técnicos
-- da última lista enviada, para associar com segurança "1", "2", etc. à opção
-- escolhida. Não há telefone, nome, CEP nem corpo de mensagem neste contexto.
ALTER TABLE "whatsapp_conversations"
  DROP CONSTRAINT "whatsapp_conversations_context_object_check";

ALTER TABLE "whatsapp_conversations"
  ADD CONSTRAINT "whatsapp_conversations_context_object_check" CHECK (
    "context" IS NULL
    OR (
      jsonb_typeof("context") = 'object'
      AND ("context" - 'location' - 'zapiReplyOptionIds') = '{}'::jsonb
      AND (
        NOT ("context" ? 'location')
        OR (
          jsonb_typeof("context" -> 'location') = 'object'
          AND (("context" -> 'location') - 'city' - 'state') = '{}'::jsonb
          AND ("context" -> 'location') ?& ARRAY['city', 'state']
          AND jsonb_typeof("context" -> 'location' -> 'city') = 'string'
          AND jsonb_typeof("context" -> 'location' -> 'state') = 'string'
          AND length("context" -> 'location' ->> 'city') BETWEEN 2 AND 100
          AND ("context" -> 'location' ->> 'state') ~ '^[A-Z]{2}$'
        )
      )
      AND (
        NOT ("context" ? 'zapiReplyOptionIds')
        OR (
          jsonb_typeof("context" -> 'zapiReplyOptionIds') = 'array'
          AND ("context" ->> 'zapiReplyOptionIds') ~
            '^\["[A-Za-z0-9_-]{1,64}"(, "[A-Za-z0-9_-]{1,64}"){0,9}\]$'
        )
      )
    )
  );
