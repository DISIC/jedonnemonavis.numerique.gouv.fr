-- CreateEnum
CREATE TYPE "UserDesignLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- CreateTable
CREATE TABLE "UserDetails" (
    "userId" INTEGER NOT NULL,
    "jobTitle" TEXT,
    "referralSource" TEXT NOT NULL,
    "level" "UserDesignLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDetails_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
