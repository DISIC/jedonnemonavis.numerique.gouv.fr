-- DropIndex
DROP INDEX "Answer_intention_field_code_review_id_idx";

-- DropIndex
DROP INDEX "Review_product_id_created_at_idx";

-- CreateIndex
CREATE INDEX "Answer_intention_field_code_review_id_review_created_at_cre_idx" ON "Answer"("intention", "field_code", "review_id", "review_created_at", "created_at");

-- CreateIndex
CREATE INDEX "Review_product_id_created_at_button_id_idx" ON "Review"("product_id", "created_at", "button_id");
