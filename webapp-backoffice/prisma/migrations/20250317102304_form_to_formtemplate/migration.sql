/*
  Warnings:

  - You are about to drop the `Form` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_form_id_fkey";

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ReviewCustom" DROP CONSTRAINT "ReviewCustom_form_id_fkey";

-- DropTable
DROP TABLE "Form";

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewCustom" ADD CONSTRAINT "ReviewCustom_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
