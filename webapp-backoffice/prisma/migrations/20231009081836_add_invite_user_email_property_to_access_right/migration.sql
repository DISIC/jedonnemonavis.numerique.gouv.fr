/*
  Warnings:

  - A unique constraint covering the columns `[observatoire_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AccessRight" DROP CONSTRAINT "AccessRight_user_email_fkey";

-- DropIndex
DROP INDEX "Button_title_key";

-- DropIndex
DROP INDEX "Product_title_key";

-- AlterTable
ALTER TABLE "AccessRight" ADD COLUMN     "user_email_invite" TEXT,
ALTER COLUMN "user_email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_observatoire_id_key" ON "Product"("observatoire_id");

-- AddForeignKey
ALTER TABLE "AccessRight" ADD CONSTRAINT "AccessRight_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;
