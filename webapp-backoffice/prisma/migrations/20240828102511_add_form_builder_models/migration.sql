-- CreateEnum
CREATE TYPE "Typebloc" AS ENUM ('paragraph', 'heading_1', 'heading_2', 'heading_3', 'input_text', 'input_text_area', 'mark_input', 'smiley_input', 'select', 'radio', 'checkbox');

-- CreateTable
CREATE TABLE "Form" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formId" INTEGER NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageId" INTEGER NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "link" DROP NOT NULL,
ALTER COLUMN "active" SET DEFAULT false;

ALTER TYPE "Typebloc" ADD VALUE 'new_page';
ALTER TYPE "Typebloc" ADD VALUE 'divider';

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_pageId_fkey";

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_formId_fkey";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "pageId",
ADD COLUMN     "formId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Page";

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_formId_fkey";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "formId",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "form_id" INTEGER NOT NULL,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "value" TEXT;

-- CreateTable
CREATE TABLE "OptionsBlock" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT,
    "value" TEXT,
    "content" TEXT,
    "blockId" INTEGER,

    CONSTRAINT "OptionsBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionsBlock" ADD CONSTRAINT "OptionsBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "OptionsBlock" DROP CONSTRAINT "OptionsBlock_blockId_fkey";

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "position" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OptionsBlock" ALTER COLUMN "blockId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "OptionsBlock" ADD CONSTRAINT "OptionsBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "type_bloc" "Typebloc" NOT NULL;

-- DropForeignKey
ALTER TABLE "OptionsBlock" DROP CONSTRAINT "OptionsBlock_blockId_fkey";

-- AlterTable
ALTER TABLE "OptionsBlock" DROP COLUMN "blockId",
ADD COLUMN     "block_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "OptionsBlock" ADD CONSTRAINT "OptionsBlock_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "OptionsBlock" DROP CONSTRAINT "OptionsBlock_block_id_fkey";

-- AddForeignKey
ALTER TABLE "OptionsBlock" ADD CONSTRAINT "OptionsBlock_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterEnum
ALTER TYPE "Typebloc" ADD VALUE 'logic';






