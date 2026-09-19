# Z-API: chatbot reativo de teste

## Decisão atual

A integração Z-API está limitada ao chatbot **reativo**: ela recebe uma mensagem
privada e envia a resposta daquela conversa. O adaptador usa somente
`send-text`; botões e listas são convertidos em opções numeradas, com orientação
para a pessoa responder usando o título da opção. Avisos de mudança de jornada e
lembretes continuam sem transporte Z-API.

A outbox preserva sua regra de janela de atendimento e de templates aprovados
dos provedores oficiais. A Z-API opera pela sessão do WhatsApp Web e seus
endpoints documentados enviam texto livre; portanto, ela não substitui
automaticamente os templates nem autoriza disparos proativos. Um futuro
`ZapiNotificationTransport` exige consentimento, regra operacional e avaliação
institucional aprovados antes de ser criado.

## Rotas e proteção

As duas rotas aceitam somente `POST` HTTPS e usam o mesmo segredo opaco:

- recebimento: `https://<tunnel>/api/whatsapp/zapi/<ZAPI_WEBHOOK_SECRET>`;
- status: `https://<tunnel>/api/whatsapp/zapi/status/<ZAPI_WEBHOOK_SECRET>`.

O recebimento valida o segredo, a instância e o payload, aplica limite local e
reutiliza a idempotência por `messageId`. Mensagens próprias, grupos, canais,
status, edições e mídia são ignorados. Com `ZAPI_TEST_MODE=true`, apenas os
números em `ZAPI_TEST_ALLOWED_PHONES` podem iniciar a conversa.

O callback de status grava somente identificador técnico, estado e código de
erro categórico. `SENT`, `RECEIVED` e `READ` correspondem, respectivamente, a
enviado, entregue e lido. Nem telefone nem corpo de mensagem entram nessa
auditoria.

## Preparação e teste local

1. Aplique as migrations versionadas, incluindo
   `20260919130000_add_zapi_delivery_audit`.
2. Preencha as variáveis Z-API em `.env.local` e mantenha o modo de teste e a
   allowlist ativos.
3. Execute `pnpm check`, `pnpm test` e `pnpm test:integration`.
4. Defina `NEXT_PUBLIC_SITE_URL` com a URL HTTPS do túnel **antes** de iniciar
   o Next.js e rode `pnpm dev`.
5. Em outro terminal, exponha a porta local por um túnel HTTPS temporário, por
   exemplo `cloudflared tunnel --url http://localhost:3000`.

Não compartilhe a URL completa do webhook: o segredo faz parte dela. Quando o
túnel mudar, atualize `NEXT_PUBLIC_SITE_URL`, reinicie o servidor e atualize as
duas URLs no painel.

## Configuração no painel Z-API

Em **Webhooks e configurações gerais**:

- preencha **Ao receber** com a rota de recebimento;
- preencha **Receber status da mensagem** com a rota de status;
- ative **Ignorar mensagens de grupos** e **Ignorar mensagens de imagem**;
- mantenha **Ignorar mensagens de texto**, **Ignorar mensagens de chats
  privados** e **Notificar as enviadas por mim também** desligados.

Não configure a Z-API como transporte da outbox nesta etapa.
