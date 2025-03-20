/*
  Warnings:

  - You are about to drop the column `link` on the `FormTemplate` table. All the data in the column will be lost.
  - Added the required column `slug` to the `FormTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FormTemplate" DROP CONSTRAINT "FormTemplate_user_id_fkey";

-- AlterTable
ALTER TABLE "FormTemplate" DROP COLUMN "link",
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
