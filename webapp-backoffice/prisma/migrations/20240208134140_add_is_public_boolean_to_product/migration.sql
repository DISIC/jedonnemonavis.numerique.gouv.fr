/*
  Warnings:

  - You are about to drop the column `isEssential` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `is_top_250` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isEssential",
DROP COLUMN "is_top_250",
ADD COLUMN     "isPublic" BOOLEAN;
