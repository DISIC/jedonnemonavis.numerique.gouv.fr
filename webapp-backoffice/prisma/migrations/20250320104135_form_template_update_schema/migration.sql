/*
  Warnings:

  - The values [new_page,logic] on the enum `Typebloc` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `value` on the `FormTemplateBlock` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `FormTemplateBlockOption` table. All the data in the column will be lost.
  - Added the required column `position` to the `FormTemplateStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `FormTemplateStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Typebloc_new" AS ENUM ('paragraph', 'heading_1', 'heading_2', 'heading_3', 'input_text', 'input_text_area', 'mark_input', 'smiley_input', 'select', 'radio', 'checkbox', 'divider');
ALTER TABLE "FormTemplateBlock" ALTER COLUMN "type_bloc" TYPE "Typebloc_new" USING ("type_bloc"::text::"Typebloc_new");
ALTER TYPE "Typebloc" RENAME TO "Typebloc_old";
ALTER TYPE "Typebloc_new" RENAME TO "Typebloc";
DROP TYPE "Typebloc_old";
COMMIT;

-- AlterTable
ALTER TABLE "FormTemplateBlock" DROP COLUMN "value",
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FormTemplateBlockOption" DROP COLUMN "content";

-- AlterTable
ALTER TABLE "FormTemplateStep" ADD COLUMN     "position" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
