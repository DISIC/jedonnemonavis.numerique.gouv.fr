-- AlterTable
ALTER TABLE "UserEvent" ADD COLUMN     "form_id" INTEGER;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;
