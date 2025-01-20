/*
  Warnings:

  - The values [carrier,admin] on the enum `RightAccessStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [viewer] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RightAccessStatus_new" AS ENUM ('carrier_admin', 'carrier_user', 'removed');
ALTER TABLE "AccessRight" ALTER COLUMN "status" TYPE "RightAccessStatus_new" USING
  CASE
    WHEN status = 'admin' THEN 'carrier_admin'
    ELSE 'carrier_user'
  END::text::"RightAccessStatus_new";
ALTER TYPE "RightAccessStatus" RENAME TO "RightAccessStatus_old";
ALTER TYPE "RightAccessStatus_new" RENAME TO "RightAccessStatus";
DROP TYPE "RightAccessStatus_old";
ALTER TABLE "AccessRight" ALTER COLUMN "status" SET DEFAULT 'carrier_user';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('superadmin', 'admin', 'user');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "ApiKey" ALTER COLUMN "scope" TYPE "UserRole_new" USING ("scope"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- AlterTable
ALTER TABLE "AccessRight" ALTER COLUMN "status" SET DEFAULT 'carrier_user';
