-- DropIndex
DROP INDEX "Answer_intention_field_code_idx";

-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "name_formatted" TEXT;

-- CreateIndex
CREATE INDEX "Answer_intention_field_code_review_id_idx" ON "Answer"("intention", "field_code", "review_id");
