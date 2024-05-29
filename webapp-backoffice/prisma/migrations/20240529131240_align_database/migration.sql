-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_parent_answer_id_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_review_id_created_at_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_review_id_fkey";

-- DropIndex
DROP INDEX "Answer_parent_answer_id_created_at_key";

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "review_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_review_id_review_created_at_fkey" FOREIGN KEY ("review_id", "review_created_at") REFERENCES "Review"("id", "created_at") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_parent_answer_id_created_at_fkey" FOREIGN KEY ("parent_answer_id", "created_at") REFERENCES "Answer"("id", "created_at") ON DELETE RESTRICT ON UPDATE CASCADE;
