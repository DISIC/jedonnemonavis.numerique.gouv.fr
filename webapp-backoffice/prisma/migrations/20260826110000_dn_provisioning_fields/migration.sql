-- CreateEnum
CREATE TYPE "ProductSource" AS ENUM ('manual', 'demarches_numeriques');

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "is_partner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partner_source" "ProductSource";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "source" "ProductSource" NOT NULL DEFAULT 'manual';

-- CreateIndex
CREATE UNIQUE INDEX "Product_source_external_id_key" ON "Product"("source", "external_id");
