-- RF11: pausa explícita do bot enquanto a equipe do Lactare assume o mesmo chat.
ALTER TYPE "WhatsappConversationStep" ADD VALUE IF NOT EXISTS 'HUMAN_HANDOFF';
