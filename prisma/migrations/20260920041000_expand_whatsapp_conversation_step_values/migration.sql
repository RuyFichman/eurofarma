-- Novos estados do fluxo consolidado do chatbot (RF11): o menu de dúvidas
-- virou duas camadas (Seção 2 e 2.1 do documento de fluxo) e o cadastro
-- passou a ter uma pergunta por vez (nome, CPF, e-mail, endereço) antes do
-- consentimento, em vez de só nome. O valor antigo `FAQ` não é removido —
-- Postgres não permite excluir valor de enum sem recriar o tipo — e passa a
-- ser lido como estado legado, igual a `ASKED_SCHEDULED` e companhia.
--
-- Cada `ADD VALUE` fica isolado nesta migration porque um valor novo de enum
-- só pode ser usado com segurança depois do commit da transação que o criou.
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'FAQ_MENU' AFTER 'MENU';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'FAQ_STEPS_MENU' AFTER 'FAQ_MENU';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'FAQ_STEPS_CLOSING' AFTER 'FAQ_STEPS_MENU';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'FAQ_WHO_CLOSING' AFTER 'FAQ_STEPS_CLOSING';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'FAQ_PAIN_CLOSING' AFTER 'FAQ_WHO_CLOSING';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'FAQ_FREQUENCY_CLOSING' AFTER 'FAQ_PAIN_CLOSING';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'AWAITING_CPF' AFTER 'AWAITING_FULL_NAME';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'AWAITING_EMAIL' AFTER 'AWAITING_CPF';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'AWAITING_ADDRESS' AFTER 'AWAITING_EMAIL';
ALTER TYPE "WhatsappConversationStep" ADD VALUE 'POST_REGISTRATION_MENU' AFTER 'AWAITING_CONSENT';
