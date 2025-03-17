ALTER TABLE "Form" RENAME TO "FormTemplate";

ALTER TABLE "Block" DROP CONSTRAINT "Block_form_id_fkey";
ALTER TABLE "Block" ADD CONSTRAINT "Block_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReviewCustom" DROP CONSTRAINT "ReviewCustom_form_id_fkey";
ALTER TABLE "ReviewCustom" ADD CONSTRAINT "ReviewCustom_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;