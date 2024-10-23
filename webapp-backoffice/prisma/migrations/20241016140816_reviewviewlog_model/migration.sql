-- CreateTable
CREATE TABLE "ReviewViewLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "review_created_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewViewLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReviewViewLog" ADD CONSTRAINT "ReviewViewLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewViewLog" ADD CONSTRAINT "ReviewViewLog_review_id_review_created_at_fkey" FOREIGN KEY ("review_id", "review_created_at") REFERENCES "Review"("id", "created_at") ON DELETE RESTRICT ON UPDATE CASCADE;
