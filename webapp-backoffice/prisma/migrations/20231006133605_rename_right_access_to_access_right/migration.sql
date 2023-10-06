/*
  Warnings:

  - You are about to drop the `RightAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RightAccess" DROP CONSTRAINT "RightAccess_product_id_fkey";

-- DropForeignKey
ALTER TABLE "RightAccess" DROP CONSTRAINT "RightAccess_user_email_fkey";

-- DropTable
DROP TABLE "RightAccess";

-- CreateTable
CREATE TABLE "AccessRight" (
    "id" SERIAL NOT NULL,
    "user_email" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "status" "RightAccessStatus" NOT NULL DEFAULT 'carrier',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccessRight" ADD CONSTRAINT "AccessRight_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRight" ADD CONSTRAINT "AccessRight_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
