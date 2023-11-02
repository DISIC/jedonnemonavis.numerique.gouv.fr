-- CreateEnum
CREATE TYPE "AnswerScore" AS ENUM ('good', 'neutral', 'bad');

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "answer_score" "AnswerScore";
