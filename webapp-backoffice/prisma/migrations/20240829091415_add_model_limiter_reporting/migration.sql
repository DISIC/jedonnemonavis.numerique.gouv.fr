-- CreateTable
CREATE TABLE "LimiterReporting" (
    "id" SERIAL NOT NULL,
    "ip_id" TEXT NOT NULL,
    "ip_adress" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "button_id" INTEGER NOT NULL,
    "total_attempts" INTEGER NOT NULL,
    "first_attempt" TIMESTAMP(3) NOT NULL,
    "last_attempt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LimiterReporting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LimiterReporting_ip_id_key" ON "LimiterReporting"("ip_id");
