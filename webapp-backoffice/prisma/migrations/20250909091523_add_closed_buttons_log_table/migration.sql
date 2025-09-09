-- CreateTable
CREATE TABLE "ClosedButtonLog" (
    "id" SERIAL NOT NULL,
    "button_id" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClosedButtonLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClosedButtonLog_button_id_key" ON "ClosedButtonLog"("button_id");
