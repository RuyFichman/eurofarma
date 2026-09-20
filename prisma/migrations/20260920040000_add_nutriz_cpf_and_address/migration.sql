-- Campos novos do cadastro pelo chatbot (RF11): CPF e endereço completo em
-- texto livre. Nulos para quem se cadastra pelo site, que não pede esses
-- dados. CPF é único (mesma pessoa não deveria aparecer duas vezes), mas o
-- índice único do Postgres ignora NULLs, então múltiplos perfis sem CPF
-- continuam permitidos.
ALTER TABLE "nutriz_profiles"
  ADD COLUMN "cpf" TEXT,
  ADD COLUMN "address" TEXT;

CREATE UNIQUE INDEX "nutriz_profiles_cpf_key" ON "nutriz_profiles"("cpf");
