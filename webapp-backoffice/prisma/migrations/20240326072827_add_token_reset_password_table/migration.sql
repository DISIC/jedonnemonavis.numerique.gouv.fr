-- CreateTable
CREATE TABLE "UserResetToken" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserResetToken_user_id_key" ON "UserResetToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserResetToken_token_key" ON "UserResetToken"("token");

-- AddForeignKey
ALTER TABLE "UserResetToken" ADD CONSTRAINT "UserResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
