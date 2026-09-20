-- O novo fluxo do chatbot (RF11) pede consentimento só depois de coletar
-- nome, CPF, e-mail e endereço — ao contrário do fluxo anterior, que nunca
-- guardava rascunho de dado pessoal fora do perfil já consentido. Enquanto o
-- "sim" não chega, essas respostas precisam de um lugar para ficar entre uma
-- mensagem e outra; ficam em "registration", dentro do mesmo `context` que já
-- guardava "location" e "zapiReplyOptionIds". Nada aqui sobrevive à recusa:
-- o handler zera o campo assim que o cadastro é criado ou recusado.
ALTER TABLE "whatsapp_conversations"
  DROP CONSTRAINT "whatsapp_conversations_context_object_check";

ALTER TABLE "whatsapp_conversations"
  ADD CONSTRAINT "whatsapp_conversations_context_object_check" CHECK (
    "context" IS NULL
    OR (
      jsonb_typeof("context") = 'object'
      AND (
        "context" - 'location' - 'zapiReplyOptionIds' - 'faqStep' - 'registration'
      ) = '{}'::jsonb
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
      -- Última etapa de doação (2.1.x) que a nutriz leu, só para a Seção
      -- 2.1.5 excluir dinamicamente essa etapa da lista "ver outra etapa".
      AND (
        NOT ("context" ? 'faqStep')
        OR (
          jsonb_typeof("context" -> 'faqStep') = 'string'
          AND ("context" ->> 'faqStep') IN (
            'HEALTH_FORM', 'KIT', 'EXTRACTION', 'COLLECTION'
          )
        )
      )
      AND (
        NOT ("context" ? 'registration')
        OR (
          jsonb_typeof("context" -> 'registration') = 'object'
          AND (
            ("context" -> 'registration')
            - 'fullName' - 'cpf' - 'email' - 'address'
          ) = '{}'::jsonb
          AND (
            NOT (("context" -> 'registration') ? 'fullName')
            OR (
              jsonb_typeof("context" -> 'registration' -> 'fullName') = 'string'
              AND length("context" -> 'registration' ->> 'fullName')
                BETWEEN 3 AND 120
            )
          )
          -- Só formato (11 dígitos): o dígito verificador (módulo 11) é
          -- conferido pela aplicação antes de qualquer escrita aqui.
          AND (
            NOT (("context" -> 'registration') ? 'cpf')
            OR (
              jsonb_typeof("context" -> 'registration' -> 'cpf') = 'string'
              AND ("context" -> 'registration' ->> 'cpf') ~ '^[0-9]{11}$'
            )
          )
          AND (
            NOT (("context" -> 'registration') ? 'email')
            OR (
              jsonb_typeof("context" -> 'registration' -> 'email') = 'string'
              AND length("context" -> 'registration' ->> 'email')
                BETWEEN 3 AND 254
              AND ("context" -> 'registration' ->> 'email')
                ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
            )
          )
          AND (
            NOT (("context" -> 'registration') ? 'address')
            OR (
              jsonb_typeof("context" -> 'registration' -> 'address') = 'string'
              AND length("context" -> 'registration' ->> 'address')
                BETWEEN 5 AND 300
            )
          )
        )
      )
    )
  );
