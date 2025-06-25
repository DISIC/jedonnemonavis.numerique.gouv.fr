/*
  Warnings:

  - You are about to drop the column `active` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OptionsBlock` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "FormConfigStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "FormConfigKind" AS ENUM ('step', 'block', 'blockOption');

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_form_id_fkey";

-- DropForeignKey
ALTER TABLE "OptionsBlock" DROP CONSTRAINT "OptionsBlock_block_id_fkey";

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "active",
DROP COLUMN "link",
DROP COLUMN "title";

-- DropTable
DROP TABLE "Block";

-- DropTable
DROP TABLE "OptionsBlock";

-- CreateTable
CREATE TABLE "FormTemplateStep" (
    "id" SERIAL NOT NULL,
    "form_template_id" INTEGER NOT NULL,

    CONSTRAINT "FormTemplateStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplateBlock" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "form_template_step_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "type_bloc" "Typebloc" NOT NULL,
    "label" TEXT,
    "value" TEXT,
    "content" TEXT,

    CONSTRAINT "FormTemplateBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplateBlockOption" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT,
    "value" TEXT,
    "content" TEXT,
    "block_id" INTEGER NOT NULL,

    CONSTRAINT "FormTemplateBlockOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormConfig" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "status" "FormConfigStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormConfigDisplay" (
    "id" SERIAL NOT NULL,
    "display" BOOLEAN NOT NULL,
    "kind" "FormConfigKind" NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "form_config_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormConfigDisplay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormConfigLabel" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "FormConfigKind" NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "form_config_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormConfigLabel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormTemplateStep" ADD CONSTRAINT "FormTemplateStep_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplateBlock" ADD CONSTRAINT "FormTemplateBlock_form_template_step_id_fkey" FOREIGN KEY ("form_template_step_id") REFERENCES "FormTemplateStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplateBlockOption" ADD CONSTRAINT "FormTemplateBlockOption_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "FormTemplateBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormConfig" ADD CONSTRAINT "FormConfig_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormConfigDisplay" ADD CONSTRAINT "FormConfigDisplay_form_config_id_fkey" FOREIGN KEY ("form_config_id") REFERENCES "FormConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormConfigLabel" ADD CONSTRAINT "FormConfigLabel_form_config_id_fkey" FOREIGN KEY ("form_config_id") REFERENCES "FormConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
