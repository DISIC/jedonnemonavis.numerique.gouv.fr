/*
  Warnings:

  - You are about to drop the column `required` on the `FormTemplateBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormTemplateBlock" DROP COLUMN "required",
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUpdatable" BOOLEAN NOT NULL DEFAULT false;
