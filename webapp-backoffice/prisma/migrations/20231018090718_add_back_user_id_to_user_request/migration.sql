/*
  Warnings:

  - You are about to drop the column `user_email` on the `UserRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `UserRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserRequest" DROP CONSTRAINT "UserRequest_user_email_fkey";

-- AlterTable
ALTER TABLE "UserRequest" DROP COLUMN "user_email",
ADD COLUMN     "user_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "UserRequest_user_id_key" ON "UserRequest"("user_id");

-- AddForeignKey
ALTER TABLE "UserRequest" ADD CONSTRAINT "UserRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
