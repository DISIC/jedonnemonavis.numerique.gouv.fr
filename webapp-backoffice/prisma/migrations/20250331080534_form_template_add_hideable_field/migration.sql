-- AlterTable
ALTER TABLE "FormTemplateBlock" ADD COLUMN     "isHideable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FormTemplateBlockOption" ADD COLUMN     "isHideable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FormTemplateStep" ADD COLUMN     "isHideable" BOOLEAN NOT NULL DEFAULT false;
