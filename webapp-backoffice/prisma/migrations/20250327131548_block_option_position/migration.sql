/*
  Warnings:

  - Added the required column `position` to the `FormTemplateBlockOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormTemplateBlockOption" ADD COLUMN     "position" INTEGER NOT NULL;
