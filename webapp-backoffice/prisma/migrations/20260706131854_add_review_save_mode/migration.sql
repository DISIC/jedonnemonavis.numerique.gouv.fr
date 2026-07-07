-- CreateEnum
CREATE TYPE "ReviewSaveMode" AS ENUM ('each_step', 'on_completion');

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "review_save_mode" "ReviewSaveMode" NOT NULL DEFAULT 'each_step';

-- Backfill existing "Remontées d'informations" template
UPDATE "FormTemplate" SET "review_save_mode" = 'on_completion' WHERE "slug" = 'bug';
