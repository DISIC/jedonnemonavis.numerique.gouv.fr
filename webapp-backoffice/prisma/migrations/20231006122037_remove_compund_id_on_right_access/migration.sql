/*
  Warnings:

  - The primary key for the `UserProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UserProduct" DROP CONSTRAINT "UserProduct_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserProduct_pkey" PRIMARY KEY ("id");
