/*
  Warnings:

  - You are about to drop the column `blockId` on the `AnswerCustom` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCustomId` on the `AnswerCustom` table. All the data in the column will be lost.
  - You are about to drop the column `formId` on the `ReviewCustom` table. All the data in the column will be lost.
  - Added the required column `block_id` to the `AnswerCustom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `review_id` to the `AnswerCustom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `form_id` to the `ReviewCustom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AnswerCustom" DROP CONSTRAINT "AnswerCustom_blockId_fkey";

-- DropForeignKey
ALTER TABLE "AnswerCustom" DROP CONSTRAINT "AnswerCustom_reviewCustomId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewCustom" DROP CONSTRAINT "ReviewCustom_formId_fkey";

-- AlterTable
ALTER TABLE "AnswerCustom" DROP COLUMN "blockId",
DROP COLUMN "reviewCustomId",
ADD COLUMN     "block_id" INTEGER NOT NULL,
ADD COLUMN     "review_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ReviewCustom" DROP COLUMN "formId",
ADD COLUMN     "form_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ReviewCustom" ADD CONSTRAINT "ReviewCustom_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerCustom" ADD CONSTRAINT "AnswerCustom_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "ReviewCustom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
