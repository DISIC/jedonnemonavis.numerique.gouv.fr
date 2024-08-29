/*
  Warnings:

  - Added the required column `position` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Made the column `blockId` on table `OptionsBlock` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "OptionsBlock" DROP CONSTRAINT "OptionsBlock_blockId_fkey";

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "position" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OptionsBlock" ALTER COLUMN "blockId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "OptionsBlock" ADD CONSTRAINT "OptionsBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
