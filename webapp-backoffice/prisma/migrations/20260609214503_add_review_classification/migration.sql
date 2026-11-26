-- CreateEnum
CREATE TYPE "ClassificationStatus" AS ENUM ('predicted', 'validated', 'corrected', 'failed');

-- CreateTable
CREATE TABLE "ClassificationCategory" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassificationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewClassification" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "review_created_at" TIMESTAMP(3) NOT NULL,
    "predicted_code" TEXT NOT NULL,
    "predicted_score" DOUBLE PRECISION NOT NULL,
    "model_name" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "validated_code" TEXT,
    "validated_by" INTEGER,
    "validated_at" TIMESTAMP(3),
    "status" "ClassificationStatus" NOT NULL DEFAULT 'predicted',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewClassification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassificationCategory_code_key" ON "ClassificationCategory"("code");

-- CreateIndex
CREATE INDEX "ClassificationCategory_parent_id_idx" ON "ClassificationCategory"("parent_id");

-- CreateIndex
CREATE INDEX "ClassificationCategory_level_active_idx" ON "ClassificationCategory"("level", "active");

-- CreateIndex
CREATE INDEX "ReviewClassification_predicted_code_idx" ON "ReviewClassification"("predicted_code");

-- CreateIndex
CREATE INDEX "ReviewClassification_validated_code_idx" ON "ReviewClassification"("validated_code");

-- CreateIndex
CREATE INDEX "ReviewClassification_status_idx" ON "ReviewClassification"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewClassification_review_id_review_created_at_key" ON "ReviewClassification"("review_id", "review_created_at");

-- AddForeignKey
ALTER TABLE "ClassificationCategory" ADD CONSTRAINT "ClassificationCategory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ClassificationCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewClassification" ADD CONSTRAINT "ReviewClassification_review_id_review_created_at_fkey" FOREIGN KEY ("review_id", "review_created_at") REFERENCES "Review"("id", "created_at") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewClassification" ADD CONSTRAINT "ReviewClassification_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
