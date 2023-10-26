/*
  Warnings:

  - The values [neutral] on the enum `AnswerScore` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AnswerScore_new" AS ENUM ('good', 'medium', 'bad', 'yes', 'no');
ALTER TABLE "Answer" ALTER COLUMN "answer_score" TYPE "AnswerScore_new" USING ("answer_score"::text::"AnswerScore_new");
ALTER TYPE "AnswerScore" RENAME TO "AnswerScore_old";
ALTER TYPE "AnswerScore_new" RENAME TO "AnswerScore";
DROP TYPE "AnswerScore_old";
COMMIT;
