/*
  Warnings:

  - You are about to drop the column `apiKeyId` on the `UserEvent` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `UserEvent` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `UserEvent` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserEvent" DROP CONSTRAINT "UserEvent_apiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "UserEvent" DROP CONSTRAINT "UserEvent_entityId_fkey";

-- DropForeignKey
ALTER TABLE "UserEvent" DROP CONSTRAINT "UserEvent_productId_fkey";

-- AlterTable
ALTER TABLE "UserEvent" DROP COLUMN "apiKeyId",
DROP COLUMN "entityId",
DROP COLUMN "productId",
ADD COLUMN     "apiKey_id" INTEGER,
ADD COLUMN     "entity_id" INTEGER,
ADD COLUMN     "product_id" INTEGER;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_apiKey_id_fkey" FOREIGN KEY ("apiKey_id") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
