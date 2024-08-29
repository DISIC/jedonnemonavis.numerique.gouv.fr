/*
  Warnings:

  - You are about to drop the column `formId` on the `Block` table. All the data in the column will be lost.
  - Added the required column `form_id` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_formId_fkey";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "formId",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "form_id" INTEGER NOT NULL,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "value" TEXT;

-- CreateTable
CREATE TABLE "OptionsBlock" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT,
    "value" TEXT,
    "content" TEXT,
    "blockId" INTEGER,

    CONSTRAINT "OptionsBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionsBlock" ADD CONSTRAINT "OptionsBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
