/*
  Warnings:

  - You are about to drop the column `answer_score` on the `Answer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AnswerIntention" AS ENUM ('good', 'medium', 'bad', 'neutral');

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "answer_score",
ADD COLUMN     "intention" "AnswerIntention";

-- DropEnum
DROP TYPE "AnswerScore";
