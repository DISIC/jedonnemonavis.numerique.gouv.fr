-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "requested_button_id" INTEGER,
ALTER COLUMN "button_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ArchivedReview" ADD COLUMN     "requested_button_id" INTEGER;
