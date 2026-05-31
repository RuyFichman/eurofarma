-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('MILK_BANK', 'COLLECTION_POINT', 'HOSPITAL', 'PARTNER');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('INTERESTED', 'CONTACTED', 'DONATED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ContactPreference" AS ENUM ('WHATSAPP', 'EMAIL', 'NONE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutriz_profiles" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "state" CHAR(2) NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT,
    "interest_status" "InterestStatus" NOT NULL DEFAULT 'INTERESTED',
    "contact_preference" "ContactPreference" NOT NULL DEFAULT 'WHATSAPP',
    "lgpd_consent_at" TIMESTAMP(3) NOT NULL,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "source_utm" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutriz_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UnitType" NOT NULL,
    "address_street" TEXT NOT NULL,
    "address_number" TEXT,
    "address_complement" TEXT,
    "address_neighborhood" TEXT NOT NULL,
    "address_city" TEXT NOT NULL,
    "address_state" CHAR(2) NOT NULL,
    "address_zip" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "opening_hours" JSONB,
    "instructions" TEXT,
    "whatsapp_message" TEXT,
    "status" "UnitStatus" NOT NULL DEFAULT 'PENDING',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "admin_responsible_id" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_intents" (
    "id" TEXT NOT NULL,
    "nutriz_profile_id" TEXT,
    "unit_id" TEXT,
    "state" CHAR(2),
    "city" TEXT,
    "source_utm" JSONB,
    "user_agent" TEXT,
    "ip_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_clicks" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "nutriz_profile_id" TEXT,
    "source_utm" JSONB,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educational_contents" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body_markdown" TEXT NOT NULL,
    "category" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educational_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "utm_source" TEXT NOT NULL,
    "utm_medium" TEXT NOT NULL,
    "utm_campaign" TEXT NOT NULL,
    "landing_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "diff" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "nutriz_profiles_state_city_created_at_idx" ON "nutriz_profiles"("state", "city", "created_at");

-- CreateIndex
CREATE INDEX "nutriz_profiles_phone_whatsapp_idx" ON "nutriz_profiles"("phone_whatsapp");

-- CreateIndex
CREATE UNIQUE INDEX "units_slug_key" ON "units"("slug");

-- CreateIndex
CREATE INDEX "units_address_state_address_city_status_idx" ON "units"("address_state", "address_city", "status");

-- CreateIndex
CREATE INDEX "units_status_idx" ON "units"("status");

-- CreateIndex
CREATE INDEX "contact_intents_created_at_state_idx" ON "contact_intents"("created_at", "state");

-- CreateIndex
CREATE INDEX "whatsapp_clicks_created_at_unit_id_idx" ON "whatsapp_clicks"("created_at", "unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "educational_contents_slug_key" ON "educational_contents"("slug");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_admin_responsible_id_fkey" FOREIGN KEY ("admin_responsible_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_intents" ADD CONSTRAINT "contact_intents_nutriz_profile_id_fkey" FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_intents" ADD CONSTRAINT "contact_intents_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_clicks" ADD CONSTRAINT "whatsapp_clicks_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_clicks" ADD CONSTRAINT "whatsapp_clicks_nutriz_profile_id_fkey" FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educational_contents" ADD CONSTRAINT "educational_contents_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

