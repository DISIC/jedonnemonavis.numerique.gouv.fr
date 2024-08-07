-- CreateEnum
CREATE TYPE "TypeExport" AS ENUM ('csv', 'xls');

-- AlterTable
ALTER TABLE "Export" ADD COLUMN     "type" "TypeExport" NOT NULL DEFAULT 'csv';
