-- AddForeignKey
ALTER TABLE "ClosedButtonLog" ADD CONSTRAINT "ClosedButtonLog_button_id_fkey" FOREIGN KEY ("button_id") REFERENCES "Button"("id") ON DELETE CASCADE ON UPDATE CASCADE;
