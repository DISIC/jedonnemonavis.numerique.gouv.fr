-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('daily', 'weekly', 'monthly');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifications_frequency" "NotificationFrequency" NOT NULL DEFAULT 'daily';
