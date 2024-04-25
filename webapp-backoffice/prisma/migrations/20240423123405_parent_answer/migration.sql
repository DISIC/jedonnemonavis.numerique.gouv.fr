/*
  Warnings:

  - A unique constraint covering the columns `[parent_answer_id]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "parent_answer_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_parent_answer_id_key" ON "Answer"("parent_answer_id");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_parent_answer_id_fkey" FOREIGN KEY ("parent_answer_id") REFERENCES "Answer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
