-- CreateTable
CREATE TABLE "ApiKeyLog" (
    "id" SERIAL NOT NULL,
    "apikey_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ApiKeyLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiKeyLog" ADD CONSTRAINT "ApiKeyLog_apikey_id_fkey" FOREIGN KEY ("apikey_id") REFERENCES "ApiKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
