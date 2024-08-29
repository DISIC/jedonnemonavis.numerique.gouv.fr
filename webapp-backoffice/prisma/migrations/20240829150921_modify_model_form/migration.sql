/*
  Warnings:

  - You are about to drop the column `pageId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the `Page` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `formId` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Typebloc" ADD VALUE 'new_page';
ALTER TYPE "Typebloc" ADD VALUE 'divider';

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_pageId_fkey";

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_formId_fkey";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "pageId",
ADD COLUMN     "formId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Page";

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
