/*
  Warnings:

  - You are about to drop the column `display` on the `FormConfigDisplay` table. All the data in the column will be lost.
  - Added the required column `hidden` to the `FormConfigDisplay` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormConfigDisplay" DROP COLUMN "display",
ADD COLUMN     "hidden" BOOLEAN NOT NULL;
