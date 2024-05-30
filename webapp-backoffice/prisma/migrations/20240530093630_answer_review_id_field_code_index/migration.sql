-- CreateIndex
CREATE INDEX "Answer_review_id_review_created_at_field_code_idx" ON "Answer"("review_id", "review_created_at", "field_code");
