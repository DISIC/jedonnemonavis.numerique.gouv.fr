-- CreateEnum
CREATE TYPE "FacetAxis" AS ENUM ('objet', 'thematique_site');

-- CreateEnum
CREATE TYPE "Polarite" AS ENUM ('positif', 'negatif');

-- DropForeignKey
ALTER TABLE "ClassificationCategory" DROP CONSTRAINT "ClassificationCategory_parent_id_fkey";

-- DropIndex
DROP INDEX "ReviewClassification_predicted_code_idx";

-- DropIndex
DROP INDEX "ReviewClassification_validated_code_idx";

-- AlterTable
ALTER TABLE "ReviewClassification" DROP COLUMN "predicted_code",
DROP COLUMN "predicted_score",
DROP COLUMN "validated_code",
ADD COLUMN     "confiance" DOUBLE PRECISION,
ADD COLUMN     "polarite" "Polarite"[],
ADD COLUMN     "pourquoi" TEXT;

-- DropTable
DROP TABLE "ClassificationCategory";

-- CreateTable
CREATE TABLE "ClassificationFacet" (
    "id" SERIAL NOT NULL,
    "axis" "FacetAxis" NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "product_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassificationFacet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewClassificationFacet" (
    "id" SERIAL NOT NULL,
    "classification_id" INTEGER NOT NULL,
    "facet_id" INTEGER NOT NULL,
    "axis" "FacetAxis" NOT NULL,
    "code" TEXT NOT NULL,
    "source" "ClassificationStatus" NOT NULL DEFAULT 'predicted',

    CONSTRAINT "ReviewClassificationFacet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassificationFacet_product_id_axis_active_idx" ON "ClassificationFacet"("product_id", "axis", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ClassificationFacet_product_id_axis_code_key" ON "ClassificationFacet"("product_id", "axis", "code");

-- CreateIndex
CREATE INDEX "ReviewClassificationFacet_axis_code_idx" ON "ReviewClassificationFacet"("axis", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewClassificationFacet_classification_id_facet_id_key" ON "ReviewClassificationFacet"("classification_id", "facet_id");

-- AddForeignKey
ALTER TABLE "ClassificationFacet" ADD CONSTRAINT "ClassificationFacet_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewClassificationFacet" ADD CONSTRAINT "ReviewClassificationFacet_classification_id_fkey" FOREIGN KEY ("classification_id") REFERENCES "ReviewClassification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewClassificationFacet" ADD CONSTRAINT "ReviewClassificationFacet_facet_id_fkey" FOREIGN KEY ("facet_id") REFERENCES "ClassificationFacet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

