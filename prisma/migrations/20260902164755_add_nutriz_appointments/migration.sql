-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('DECLARED', 'NOT_SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AppointmentFailureReason" AS ENUM ('NO_ANSWER', 'NO_SLOT', 'TOO_FAR', 'GAVE_UP', 'OTHER');

-- CreateEnum
CREATE TYPE "WhatsappConversationStep" AS ENUM ('ASKED_SCHEDULED', 'AWAITING_DATE', 'AWAITING_DATE_CONFIRMATION', 'AWAITING_FAILURE_REASON', 'FINISHED');

-- DropIndex
DROP INDEX "nutriz_profiles_phone_whatsapp_idx";

-- AlterTable
ALTER TABLE "nutriz_profiles" ADD COLUMN     "auth_user_id" TEXT;

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "nutriz_profile_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'DECLARED',
    "scheduled_at" TIMESTAMP(3),
    "failure_reason" "AppointmentFailureReason",
    "declared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "phone_whatsapp" TEXT NOT NULL,
    "nutriz_profile_id" TEXT,
    "step" "WhatsappConversationStep" NOT NULL DEFAULT 'ASKED_SCHEDULED',
    "draft_scheduled_at" TIMESTAMP(3),
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_reference_key" ON "appointments"("reference");

-- CreateIndex
CREATE INDEX "appointments_nutriz_profile_id_scheduled_at_idx" ON "appointments"("nutriz_profile_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "appointments_status_scheduled_at_idx" ON "appointments"("status", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_conversations_phone_whatsapp_key" ON "whatsapp_conversations"("phone_whatsapp");

-- CreateIndex
CREATE UNIQUE INDEX "nutriz_profiles_auth_user_id_key" ON "nutriz_profiles"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutriz_profiles_phone_whatsapp_key" ON "nutriz_profiles"("phone_whatsapp");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_nutriz_profile_id_fkey" FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_nutriz_profile_id_fkey" FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

