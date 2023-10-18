/*
  Warnings:

  - You are about to drop the column `user_id` on the `UserRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserRequest" DROP CONSTRAINT "UserRequest_user_id_fkey";

-- DropIndex
DROP INDEX "UserRequest_user_id_key";

-- AlterTable
ALTER TABLE "UserRequest" DROP COLUMN "user_id",
ADD COLUMN     "user_email" TEXT,
ADD COLUMN     "user_email_copy" TEXT;

-- AddForeignKey
ALTER TABLE "UserRequest" ADD CONSTRAINT "UserRequest_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;
