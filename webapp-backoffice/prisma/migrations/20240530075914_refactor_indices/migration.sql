/*
  Warnings:

  - A unique constraint covering the columns `[id,created_at]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,created_at]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Answer_review_id_review_created_at_idx" ON "Answer"("review_id", "review_created_at");

-- CreateIndex
CREATE INDEX "Answer_parent_answer_id_created_at_idx" ON "Answer"("parent_answer_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_id_created_at_key" ON "Answer"("id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Review_id_created_at_key" ON "Review"("id", "created_at");
