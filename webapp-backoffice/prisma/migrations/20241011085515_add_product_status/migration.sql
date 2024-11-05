-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('published', 'archived');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'published';
