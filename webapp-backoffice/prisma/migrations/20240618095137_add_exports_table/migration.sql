-- DropIndex
DROP INDEX "Answer_review_id_review_created_at_field_code_idx";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "user_id" TEXT;

-- CreateTable
CREATE TABLE "Exports" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "params" TEXT NOT NULL,

    CONSTRAINT "Exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exports_user_id_key" ON "Exports"("user_id");

-- AddForeignKey
ALTER TABLE "Exports" ADD CONSTRAINT "Exports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
