/*
  Warnings:

  - You are about to drop the column `observatoire_username` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "is_top_250" BOOLEAN;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "xwiki_id" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "observatoire_username",
ADD COLUMN     "xwiki_username" TEXT;

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "scope" "UserRole" NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
