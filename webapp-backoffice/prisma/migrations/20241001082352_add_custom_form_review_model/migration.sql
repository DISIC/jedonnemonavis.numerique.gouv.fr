-- CreateTable
CREATE TABLE "ReviewCustom" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewCustom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerCustom" (
    "id" SERIAL NOT NULL,
    "reviewCustomId" INTEGER NOT NULL,
    "blockId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "AnswerCustom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReviewCustom" ADD CONSTRAINT "ReviewCustom_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerCustom" ADD CONSTRAINT "AnswerCustom_reviewCustomId_fkey" FOREIGN KEY ("reviewCustomId") REFERENCES "ReviewCustom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerCustom" ADD CONSTRAINT "AnswerCustom_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
