/*
  Warnings:

  - You are about to drop the column `answer_score` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `question_code` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Review` table. All the data in the column will be lost.
  - Added the required column `answer_item_id` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_code` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_label` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `form_id` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnswerKind" AS ENUM ('text', 'checkbox', 'radio');

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_user_id_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "answer_score",
DROP COLUMN "created_at",
DROP COLUMN "question_code",
DROP COLUMN "question_text",
DROP COLUMN "updated_at",
ADD COLUMN     "answer_item_id" INTEGER NOT NULL,
ADD COLUMN     "field_code" TEXT NOT NULL,
ADD COLUMN     "field_label" TEXT NOT NULL,
ADD COLUMN     "kind" "AnswerKind" NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "form_id" INTEGER NOT NULL;
