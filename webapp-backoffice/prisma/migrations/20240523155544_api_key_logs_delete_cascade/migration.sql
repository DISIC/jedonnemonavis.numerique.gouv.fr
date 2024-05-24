-- DropForeignKey
ALTER TABLE "ApiKeyLog" DROP CONSTRAINT "ApiKeyLog_apikey_id_fkey";

-- AddForeignKey
ALTER TABLE "ApiKeyLog" ADD CONSTRAINT "ApiKeyLog_apikey_id_fkey" FOREIGN KEY ("apikey_id") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
