-- Amplia o vocabulário da jornada sem remover nem renomear valores existentes.
-- Os comandos ficam isolados nesta migration porque novos valores de enum só
-- podem ser usados com segurança depois do commit da transação que os criou.
ALTER TYPE "JourneyStatus" ADD VALUE 'DOCUMENT_SENT' AFTER 'REGISTERED';
ALTER TYPE "JourneyStatus" ADD VALUE 'EXAMS_COMPLETED' AFTER 'EXAM_SCHEDULED';
ALTER TYPE "JourneyStatus" ADD VALUE 'KIT_SENT' AFTER 'NOT_ELIGIBLE';
ALTER TYPE "JourneyStatus" ADD VALUE 'DONATION_CONFIRMED' AFTER 'KIT_DELIVERED';
