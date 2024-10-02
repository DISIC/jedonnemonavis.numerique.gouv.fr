-- DropForeignKey
ALTER TABLE "UserOTP" DROP CONSTRAINT "UserOTP_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserRequest" DROP CONSTRAINT "UserRequest_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserResetToken" DROP CONSTRAINT "UserResetToken_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserValidationToken" DROP CONSTRAINT "UserValidationToken_user_id_fkey";

-- CreateTable
CREATE TABLE "ReviewCustom" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "ReviewCustom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerCustom" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "AnswerCustom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserRequest" ADD CONSTRAINT "UserRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOTP" ADD CONSTRAINT "UserOTP_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserValidationToken" ADD CONSTRAINT "UserValidationToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResetToken" ADD CONSTRAINT "UserResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
