/*
  Warnings:

  - The values [carrier] on the enum `RightAccessStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RightAccessStatus_new" AS ENUM ('admin', 'user', 'carrier_admin', 'carrier_user', 'removed');
ALTER TABLE "AccessRight" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AccessRight" ALTER COLUMN "status" TYPE "RightAccessStatus_new" USING ("status"::text::"RightAccessStatus_new");
ALTER TYPE "RightAccessStatus" RENAME TO "RightAccessStatus_old";
ALTER TYPE "RightAccessStatus_new" RENAME TO "RightAccessStatus";
DROP TYPE "RightAccessStatus_old";
ALTER TABLE "AccessRight" ALTER COLUMN "status" SET DEFAULT 'carrier_user';
COMMIT;

-- AlterTable
ALTER TABLE "AccessRight" ALTER COLUMN "status" SET DEFAULT 'carrier_user';
