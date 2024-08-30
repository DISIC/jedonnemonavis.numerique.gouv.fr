/*
  Warnings:

  - You are about to drop the column `blockId` on the `OptionsBlock` table. All the data in the column will be lost.
  - Added the required column `block_id` to the `OptionsBlock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OptionsBlock" DROP CONSTRAINT "OptionsBlock_blockId_fkey";

-- AlterTable
ALTER TABLE "OptionsBlock" DROP COLUMN "blockId",
ADD COLUMN     "block_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "OptionsBlock" ADD CONSTRAINT "OptionsBlock_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
