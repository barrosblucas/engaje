-- CreateEnum
CREATE TYPE "RegistrationMode" AS ENUM ('registration', 'informative');

-- AlterTable
ALTER TABLE "events"
  ADD COLUMN "registration_mode" "RegistrationMode" NOT NULL DEFAULT 'registration',
  ADD COLUMN "external_cta_label" TEXT,
  ADD COLUMN "external_cta_url" TEXT,
  ADD COLUMN "dynamic_form_schema" JSONB;

-- AlterTable
ALTER TABLE "registrations"
  ADD COLUMN "form_data" JSONB;

-- AlterTable
ALTER TABLE "programs"
  ADD COLUMN "registration_mode" "RegistrationMode" NOT NULL DEFAULT 'registration',
  ADD COLUMN "external_cta_label" TEXT,
  ADD COLUMN "external_cta_url" TEXT,
  ADD COLUMN "dynamic_form_schema" JSONB;

-- Migrate existing program form schema into the new dynamic_form_schema column.
UPDATE "programs"
SET "dynamic_form_schema" = "form_schema"
WHERE "form_schema" IS NOT NULL;

-- AlterTable
ALTER TABLE "programs"
  DROP COLUMN "form_schema";

-- CreateTable
CREATE TABLE "event_attendance_intents" (
  "id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "event_attendance_intents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_attendance_intents_event_id_user_id_key"
ON "event_attendance_intents"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "event_attendance_intents_event_id_idx"
ON "event_attendance_intents"("event_id");

-- CreateIndex
CREATE INDEX "event_attendance_intents_user_id_idx"
ON "event_attendance_intents"("user_id");

-- CreateIndex
CREATE INDEX "program_registrations_user_id_idx"
ON "program_registrations"("user_id");

-- AddForeignKey
ALTER TABLE "event_attendance_intents"
  ADD CONSTRAINT "event_attendance_intents_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendance_intents"
  ADD CONSTRAINT "event_attendance_intents_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs"
  ADD CONSTRAINT "programs_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_registrations"
  ADD CONSTRAINT "program_registrations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
