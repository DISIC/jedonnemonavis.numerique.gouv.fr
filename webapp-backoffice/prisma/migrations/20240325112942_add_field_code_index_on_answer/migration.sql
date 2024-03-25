-- DropIndex
DROP INDEX "Answer_intention_idx";

-- CreateIndex
CREATE INDEX "Answer_intention_field_code_idx" ON "Answer"("intention", "field_code");
