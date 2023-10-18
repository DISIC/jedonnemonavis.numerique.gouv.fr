-- CreateEnum
CREATE TYPE "UserRequestStatus" AS ENUM ('pending', 'accepted', 'refused');

-- AlterTable
ALTER TABLE "UserRequest" ADD COLUMN     "status" "UserRequestStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "mode" SET DEFAULT 'whitelist';

-- CreateTable
CREATE TABLE "_EntityToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EntityToUser_AB_unique" ON "_EntityToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EntityToUser_B_index" ON "_EntityToUser"("B");

-- AddForeignKey
ALTER TABLE "_EntityToUser" ADD CONSTRAINT "_EntityToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EntityToUser" ADD CONSTRAINT "_EntityToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
