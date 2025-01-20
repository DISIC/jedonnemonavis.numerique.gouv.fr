/*
  Warnings:

  - The values [carrier,admin] on the enum `RightAccessStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [viewer] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RightAccessStatus_new" AS ENUM ('carrier_admin', 'carrier_user', 'removed');
-- Il faut d'abord supprimer la valeur par défaut existante
ALTER TABLE "AccessRight" ALTER COLUMN "status" DROP DEFAULT;
-- Ensuite faire la conversion
ALTER TABLE "AccessRight" ALTER COLUMN "status" TYPE "RightAccessStatus_new" USING (
  CASE
    WHEN status::text = 'admin' THEN 'carrier_admin'::text
    WHEN status::text = 'user' THEN 'carrier_user'::text
    WHEN status::text = 'carrier' THEN 'carrier_user'::text
    WHEN status::text = 'removed' THEN 'removed'::text
    ELSE 'carrier_user'::text
  END
)::text::"RightAccessStatus_new";
ALTER TYPE "RightAccessStatus" RENAME TO "RightAccessStatus_old";
ALTER TYPE "RightAccessStatus_new" RENAME TO "RightAccessStatus";
DROP TYPE "RightAccessStatus_old";
-- Et enfin remettre la nouvelle valeur par défaut
ALTER TABLE "AccessRight" ALTER COLUMN "status" SET DEFAULT 'carrier_user';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('superadmin', 'admin', 'user');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE
    WHEN role::text = 'viewer' THEN 'user'::text
    ELSE role::text
  END
)::text::"UserRole_new";
ALTER TABLE "ApiKey" ALTER COLUMN "scope" TYPE "UserRole_new" USING (
  CASE
    WHEN scope::text = 'viewer' THEN 'user'::text
    ELSE scope::text
  END
)::text::"UserRole_new";
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- AlterTable
ALTER TABLE "AccessRight" ALTER COLUMN "status" SET DEFAULT 'carrier_user';
