-- AlterEnum
ALTER TYPE "TypeAction" ADD VALUE 'service_review_delete';

-- AlterTable: add soft-delete columns on Review (manual review deletion)
ALTER TABLE "Review" ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN DEFAULT false;
