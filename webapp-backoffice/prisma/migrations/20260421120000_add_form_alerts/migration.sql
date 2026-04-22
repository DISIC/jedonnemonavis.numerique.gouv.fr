-- AlterEnum
ALTER TYPE "TypeAction" ADD VALUE 'form_alert_sent';

-- AlterTable User: global kill-switch
ALTER TABLE "User" ADD COLUMN "alerts_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable Form: per-form hard-cap window (nullable => system default 120) and last-sent marker
ALTER TABLE "Form" ADD COLUMN "alert_max_window_minutes" INTEGER;
ALTER TABLE "Form" ADD COLUMN "last_alert_sent_at" TIMESTAMP(3);

-- CreateTable FormAlertSubscription: per-user × per-form preference row (stable id, mutated in place)
CREATE TABLE "FormAlertSubscription" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormAlertSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormAlertSubscription_user_id_form_id_key" ON "FormAlertSubscription"("user_id", "form_id");

-- CreateIndex
CREATE INDEX "FormAlertSubscription_form_id_enabled_idx" ON "FormAlertSubscription"("form_id", "enabled");

-- AddForeignKey
ALTER TABLE "FormAlertSubscription" ADD CONSTRAINT "FormAlertSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAlertSubscription" ADD CONSTRAINT "FormAlertSubscription_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
