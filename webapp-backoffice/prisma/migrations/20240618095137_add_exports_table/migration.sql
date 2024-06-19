-- CreateTable
CREATE TABLE "Exports" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "params" TEXT NOT NULL,

    CONSTRAINT "Exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exports_user_id_key" ON "Exports"("user_id");

-- AddForeignKey
ALTER TABLE "Exports" ADD CONSTRAINT "Exports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `Exports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exports" DROP CONSTRAINT "Exports_user_id_fkey";

-- DropTable
DROP TABLE "Exports";

-- CreateTable
CREATE TABLE "Export" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "params" TEXT NOT NULL,

    CONSTRAINT "Export_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Export_user_id_key" ON "Export"("user_id");

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AlterTable
ALTER TABLE "Export" ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false;
