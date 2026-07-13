-- AlterEnum
ALTER TYPE "TypeAction" ADD VALUE 'service_review_delete';

-- CreateTable
CREATE TABLE "ArchivedReview" (
    "id" SERIAL NOT NULL,
    "original_review_id" INTEGER NOT NULL,
    "review_created_at" TIMESTAMP(3) NOT NULL,
    "product_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "button_id" INTEGER,
    "user_id" TEXT,
    "has_verbatim" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB NOT NULL,
    "deleted_by" INTEGER,
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivedReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArchivedReview_product_id_form_id_archived_at_idx" ON "ArchivedReview"("product_id", "form_id", "archived_at");
