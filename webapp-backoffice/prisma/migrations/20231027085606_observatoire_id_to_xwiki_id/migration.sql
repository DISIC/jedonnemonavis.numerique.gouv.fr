/*
  Warnings:

  - You are about to drop the column `observatoire_id` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[xwiki_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_observatoire_id_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "observatoire_id",
ADD COLUMN     "xwiki_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Product_xwiki_id_key" ON "Product"("xwiki_id");
