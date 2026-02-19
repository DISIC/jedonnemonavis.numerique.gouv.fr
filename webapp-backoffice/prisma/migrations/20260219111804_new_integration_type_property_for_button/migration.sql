-- CreateEnum
CREATE TYPE "ButtonIntegrationTypes" AS ENUM ('embed', 'button', 'modal', 'link');

-- AlterTable
ALTER TABLE "Button" ADD COLUMN     "integration_type" "ButtonIntegrationTypes";
