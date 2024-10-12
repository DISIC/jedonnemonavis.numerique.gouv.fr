-- DropForeignKey
ALTER TABLE "Export" DROP CONSTRAINT "Export_user_id_fkey";

-- AlterTable
ALTER TABLE "Export" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
