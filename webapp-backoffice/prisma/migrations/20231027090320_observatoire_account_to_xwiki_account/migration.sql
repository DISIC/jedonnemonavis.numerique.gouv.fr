/*
  Warnings:

  - You are about to drop the column `observatoire_account` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "observatoire_account",
ADD COLUMN     "xwiki_account" BOOLEAN NOT NULL DEFAULT false;
