-- AlterTable
ALTER TABLE "FormTemplateBlockOption" ADD COLUMN     "isIsolated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOther" BOOLEAN NOT NULL DEFAULT false;
