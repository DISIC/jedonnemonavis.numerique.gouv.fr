/*
  Warnings:

  - Added the required column `product_id` to the `Export` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Export_user_id_key";

-- AlterTable
ALTER TABLE "Export" ADD COLUMN     "link" TEXT,
ADD COLUMN     "product_id" INTEGER NOT NULL,
ALTER COLUMN "params" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
