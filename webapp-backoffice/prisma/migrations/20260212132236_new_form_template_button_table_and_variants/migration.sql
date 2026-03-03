-- CreateEnum
CREATE TYPE "FormTemplateButtonStyle" AS ENUM ('solid', 'outline');

-- CreateEnum
CREATE TYPE "FormTemplateButtonTheme" AS ENUM ('light', 'dark');

-- AlterTable
ALTER TABLE "Button" ADD COLUMN     "form_template_button_id" INTEGER;

-- CreateTable
CREATE TABLE "FormTemplateButton" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "form_template_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FormTemplateButton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTemplateButtonVariant" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "form_template_button_id" INTEGER NOT NULL,
    "style" "FormTemplateButtonStyle" NOT NULL,
    "theme" "FormTemplateButtonTheme",
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,

    CONSTRAINT "FormTemplateButtonVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplateButton_form_template_id_slug_key" ON "FormTemplateButton"("form_template_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "FormTemplateButtonVariant_form_template_button_id_style_the_key" ON "FormTemplateButtonVariant"("form_template_button_id", "style", "theme");

-- AddForeignKey
ALTER TABLE "Button" ADD CONSTRAINT "Button_form_template_button_id_fkey" FOREIGN KEY ("form_template_button_id") REFERENCES "FormTemplateButton"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplateButton" ADD CONSTRAINT "FormTemplateButton_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTemplateButtonVariant" ADD CONSTRAINT "FormTemplateButtonVariant_form_template_button_id_fkey" FOREIGN KEY ("form_template_button_id") REFERENCES "FormTemplateButton"("id") ON DELETE CASCADE ON UPDATE CASCADE;
