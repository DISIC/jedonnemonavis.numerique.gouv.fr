/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `FormTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FormTemplate_slug_key" ON "FormTemplate"("slug");
