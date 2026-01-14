-- AlterTable
ALTER TABLE "Export" ADD COLUMN     "form_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;
